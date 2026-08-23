"""Management command: delete duplicate Arabic-only notifications that have a bilingual ||EN|| twin."""
from django.core.management.base import BaseCommand
from dashboard.models import Notification


class Command(BaseCommand):
    help = "Delete Arabic-only duplicate notifications that already have a bilingual ||EN|| version."

    def handle(self, *args, **options):
        all_notifs = list(Notification.objects.all().order_by('id'))

        # Collect AR parts of all bilingual titles
        bilingual_ar_titles = set()
        for n in all_notifs:
            if "||EN||" in n.title:
                ar_part = n.title.split("||EN||", 1)[0].strip()
                bilingual_ar_titles.add(ar_part)

        # Find Arabic-only duplicates whose AR title exists in bilingual form
        to_delete = []
        for n in all_notifs:
            if "||EN||" not in n.title and n.title.strip() in bilingual_ar_titles:
                to_delete.append(n.id)
                self.stdout.write(f"  DELETE ID={n.id}: {n.title[:70]}")

        if to_delete:
            count, _ = Notification.objects.filter(id__in=to_delete).delete()
            self.stdout.write(self.style.SUCCESS(f"\nDeleted {count} duplicate notifications."))
        else:
            self.stdout.write(self.style.SUCCESS("No duplicates found."))
