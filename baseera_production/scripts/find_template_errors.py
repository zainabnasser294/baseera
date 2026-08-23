import os
import sys
import django

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'baseera_web.settings')
django.setup()

from django.template.loader import get_template
from django.template import Template, Context, TemplateSyntaxError

template_path = os.path.join(BASE_DIR, 'dashboard', 'templates', 'dashboard', 'ask_basira.html')
with open(template_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines, 1):
    if r"\'" in l:
        print(f"Found escaped quote on line {i}: {l.strip()}")
    if "{%" in l and "ar" in l:
        # Test compiling small template with just this line
        try:
            Template(l)
        except Exception as e:
            print(f"Error on line {i}: {l.strip()} -> {e}")


try:
    get_template('dashboard/ask_basira.html')
    print("Template parsed successfully!")
except TemplateSyntaxError as e:
    print(f"TemplateSyntaxError: {e}")
    # Inspect exact error
    import traceback
    traceback.print_exc()
