"""
Management command: translate_notifications
-------------------------------------------
Translates Notification records into bilingual format:
    title   → "عنوان عربي||EN||English title"
    message → "رسالة عربية||EN||English message"

Usage:
    python manage.py translate_notifications               # new records only
    python manage.py translate_notifications --dry-run     # preview
    python manage.py translate_notifications --fix-titles  # fix broken EN titles (Arabic suffix)
    python manage.py translate_notifications --force       # re-process ALL records
"""

import re
import json
from django.core.management.base import BaseCommand
from dashboard.models import Notification


# ── Static title map (exact matches) ─────────────────────────────────────────
TITLE_MAP = {
    "تنبيه من بصيرة":                    "Baseera Smart Alert",
    "تنبيه بصيرة الذكي":                 "Baseera Smart Alert",
    "اكتمل تحليل الملف":                 "File Analysis Complete",
    "تم رفع الملف بنجاح":                "File Uploaded Successfully",
    "تم حفظ الملاحظة المالية":           "Financial Note Saved",
    "تم استخراج وقراءة الإيصال (OCR)":   "Receipt Scanned (OCR)",
    "مرحباً بك في بصيرة":               "Welcome to Baseera",
    "لم يتم رفع بيانات بعد":             "No Data Uploaded Yet",
    "تنبيه هدر مالي":                    "Financial Leakage Alert",
}

# Arabic Unicode range detector
ARABIC_RE = re.compile(r'[\u0600-\u06FF]')


def has_arabic(text: str) -> bool:
    return bool(ARABIC_RE.search(text))


def translate_text_via_ai(arabic_text: str, client, is_title: bool = False) -> str:
    """Calls Gemini to translate Arabic text to clean English."""
    context = "short notification title (max 8 words)" if is_title else "financial notification body"
    prompt = f"""You are a professional Arabic-to-English translator for Baseera, a financial analytics platform.

Translate the following Arabic {context} to professional English.
Rules:
- Output ONLY the translated English text, no explanations.
- Do NOT include any Arabic words in your output.
- Keep all numbers, currency codes (OMR), percentages, and file names unchanged.
- Match the professional financial tone.
- No greetings, no closing remarks.

Arabic text:
{arabic_text}"""

    try:
        from google import genai
        client_obj = client
        response = client_obj.models.generate_content(
            model="gemini-flash-lite-latest",
            contents=prompt
        )
        return response.text.strip()
    except Exception as e:
        print(f"    [AI Error] {e}")
        return ""


def build_en_title(title_ar: str, client) -> str:
    """Derive the English title from an Arabic title string."""
    # ── Structured prefix patterns (prefix→EN prefix, rest gets translated) ──
    structured = [
        ("تنبيه ذكي:",         "Smart Alert:"),
        ("تم رفع ملف:",        "File Uploaded:"),
        ("جلسة غرفة القرار:", "Boardroom Session:"),
        ("هدف المبيعات:",      "Sales Goal:"),
        ("إنجاز: تجاوزت",     "Milestone: Exceeded"),
        ("إنجاز:",             "Milestone:"),
    ]

    for ar_prefix, en_prefix in structured:
        if ar_prefix in title_ar:
            suffix = title_ar.split(ar_prefix, 1)[1].strip()
            # Replace known Arabic fragments
            suffix = (suffix
                      .replace("سجل بيانات", "data records")
                      .replace("استشارة ذكية مع بصيرة", "AI consultations with Basira"))
            # If suffix still contains Arabic, translate it
            if has_arabic(suffix):
                translated_suffix = translate_text_via_ai(suffix, client, is_title=True)
                suffix = translated_suffix if translated_suffix else suffix
            return f"{en_prefix} {suffix}".strip()

    # ── Exact / partial static map ────────────────────────────────────────────
    for ar_key, en_val in TITLE_MAP.items():
        if ar_key in title_ar:
            return en_val

    # ── Fallback: translate the whole title via AI ────────────────────────────
    translated = translate_text_via_ai(title_ar, client, is_title=True)
    return translated if translated else title_ar


class Command(BaseCommand):
    help = "Translate Notification records to bilingual ||EN|| format."

    def add_arguments(self, parser):
        parser.add_argument("--dry-run",       action="store_true",
                            help="Preview changes without saving.")
        parser.add_argument("--fix-titles",    action="store_true",
                            help="Re-translate only records whose EN title still contains Arabic.")
        parser.add_argument("--fix-messages",  action="store_true",
                            help="Re-translate only records whose EN message body still contains Arabic.")
        parser.add_argument("--force",          action="store_true",
                            help="Re-process ALL records (including already-bilingual ones).")

    def handle(self, *args, **options):
        dry_run      = options["dry_run"]
        fix_titles   = options["fix_titles"]
        fix_messages = options["fix_messages"]
        force        = options["force"]
        mode_label   = "[DRY RUN] " if dry_run else ""

        self.stdout.write(self.style.MIGRATE_HEADING(
            f"\n{mode_label}Translating notifications...\n"
        ))

        from google import genai
        client = genai.Client()

        # ── Select records to process ─────────────────────────────────────────
        if force:
            notifications = Notification.objects.all().order_by("-created_at")
            self.stdout.write("Mode: FORCE — re-processing all records.")
        elif fix_titles:
            all_notifs = Notification.objects.filter(title__contains="||EN||")
            to_fix = [n.id for n in all_notifs if has_arabic(n.title.split("||EN||", 1)[1])]
            notifications = Notification.objects.filter(id__in=to_fix).order_by("-created_at")
            self.stdout.write(f"Mode: FIX-TITLES — found {len(to_fix)} records with Arabic in EN title.")
        elif fix_messages:
            all_notifs = Notification.objects.filter(message__contains="||EN||")
            to_fix = [n.id for n in all_notifs if has_arabic(n.message.split("||EN||", 1)[1])]
            notifications = Notification.objects.filter(id__in=to_fix).order_by("-created_at")
            self.stdout.write(f"Mode: FIX-MESSAGES — found {len(to_fix)} records with Arabic in EN message.")
        else:
            notifications = Notification.objects.exclude(
                message__contains="||EN||"
            ).order_by("-created_at")
            self.stdout.write("Mode: NEW — processing records without ||EN||.")

        total = notifications.count()
        self.stdout.write(f"Records to process: {total}\n")

        if total == 0:
            self.stdout.write(self.style.SUCCESS("Nothing to do."))
            return

        updated = skipped = 0

        for i, notif in enumerate(notifications, 1):
            self.stdout.write(f"\n[{i}/{total}] ID={notif.id}")

            # ── Determine AR / EN parts ───────────────────────────────────────
            if "||EN||" in notif.title and not force:
                if fix_messages:
                    # Fix-messages mode: only fix the EN message part
                    msg_ar_part = notif.message.split("||EN||", 1)[0].strip() if "||EN||" in notif.message else notif.message.strip()
                    msg_en_current = notif.message.split("||EN||", 1)[1].strip() if "||EN||" in notif.message else ""
                    self.stdout.write(f"    Current EN msg : {msg_en_current[:80]}")
                    self.stdout.write("    [AI re-translating message...]")
                    new_msg_en = translate_text_via_ai(msg_ar_part, client)
                    if not new_msg_en:
                        self.stdout.write(self.style.WARNING("    [SKIP] Translation failed."))
                        skipped += 1
                        continue
                    self.stdout.write(f"    Fixed  EN msg  : {new_msg_en[:80]}")
                    new_title   = notif.title   # keep title unchanged
                    new_message = f"{msg_ar_part}||EN||{new_msg_en}"
                else:
                    # Fix-titles mode: only fix the EN title part
                    title_ar = notif.title.split("||EN||", 1)[0].strip()
                    title_en_current = notif.title.split("||EN||", 1)[1].strip()
                    self.stdout.write(f"    Current EN title : {title_en_current}")
                    title_en = build_en_title(title_ar, client)
                    self.stdout.write(f"    Fixed  EN title  : {title_en}")
                    new_title   = f"{title_ar}||EN||{title_en}"
                    new_message = notif.message   # keep message unchanged

            else:
                # Full translation (new record or --force)
                title_ar = notif.title.split("||EN||", 1)[0].strip() if "||EN||" in notif.title else notif.title.strip()

                # ── Title ─────────────────────────────────────────────────────
                title_en = build_en_title(title_ar, client)
                self.stdout.write(f"    AR title : {title_ar[:60]}")
                self.stdout.write(f"    EN title : {title_en[:60]}")

                # ── Message ───────────────────────────────────────────────────
                raw_msg = notif.message.split("||EN||", 1)[0].strip() if "||EN||" in notif.message else notif.message.strip()

                if "\n\n" in raw_msg:
                    parts = [p.strip() for p in raw_msg.split("\n\n") if p.strip()]
                    msg_ar = parts[0]
                    msg_en = parts[1] if len(parts) >= 2 else translate_text_via_ai(msg_ar, client)
                else:
                    msg_ar = raw_msg
                    self.stdout.write("    [AI translating message...]")
                    msg_en = translate_text_via_ai(msg_ar, client)

                if not msg_en:
                    self.stdout.write(self.style.WARNING("    [SKIP] AI translation failed."))
                    skipped += 1
                    continue

                self.stdout.write(f"    EN msg   : {msg_en[:80]}...")
                new_title   = f"{title_ar}||EN||{title_en}"
                new_message = f"{msg_ar}||EN||{msg_en}"

            if not dry_run:
                notif.title   = new_title
                notif.message = new_message
                notif.save(update_fields=["title", "message"])
                updated += 1
                self.stdout.write(self.style.SUCCESS("    [SAVED]"))
            else:
                updated += 1
                self.stdout.write(self.style.NOTICE("    [DRY RUN]"))

        self.stdout.write(self.style.SUCCESS(
            f"\n{mode_label}Done. Updated={updated}, Skipped={skipped}, Total={total}\n"
        ))
