import re

with open('dashboard/views.py', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'if not sheet_url or "docs\.google\.com/spreadsheets" not in sheet_url:.*?return redirect\("datasets"\)'
replacement = '''try:
            validate_ssrf_url(sheet_url, allowed_hosts={"docs.google.com", "spreadsheets.google.com"})
        except ValueError:
            messages.error(request, "—«»ÿ €Ì— „’—Õ »Â / Invalid Google Sheets URL")
            return redirect("datasets")'''

content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open('dashboard/views.py', 'w', encoding='utf-8') as f:
    f.write(content)
