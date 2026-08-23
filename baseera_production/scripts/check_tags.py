import os
import sys
import django
import re

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'baseera_web.settings')
django.setup()

from django.template import Template, Context

template_path = os.path.join(BASE_DIR, 'dashboard', 'templates', 'dashboard', 'ask_basira.html')
with open(template_path, 'r', encoding='utf-8') as f:
    text = f.read()

# Find all django tag matches
tags = re.findall(r'(\{%.*?%\})', text, re.DOTALL)
for t in tags:
    try:
        # Wrap tag with dummy block if needed
        # Or parse with Template
        cleaned = t
        if not cleaned.endswith('%}'):
            continue
        # If it is an elif, else, endif, wrap with if
        if 'elif' in cleaned or 'else' in cleaned or 'endif' in cleaned:
            test_tmpl = f"{{% if 1 %}}{cleaned}{{% endif %}}"
        elif 'block' in cleaned or 'extends' in cleaned or 'load' in cleaned:
            continue
        else:
            test_tmpl = f"{cleaned}{{% endif %}}" if 'if' in cleaned else cleaned
            
        Template(test_tmpl)
    except Exception as e:
        if "Could not parse" in str(e) or "remainder" in str(e) or "smartif" in str(e):
            print(f"FAILED TAG: {t} -> {e}")
