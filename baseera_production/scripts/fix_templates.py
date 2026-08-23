import os
import re

templates_dir = r'dashboard\templates'
for root, dirs, files in os.walk(templates_dir):
    for f in files:
        if f.endswith('.html'):
            filepath = os.path.join(root, f)
            with open(filepath, 'r', encoding='utf-8') as fh:
                content = fh.read()
            
            # Find and replace \' with ' inside {% ... %}
            new_content = content
            if r"\'" in content:
                print(f"Fixing escaped quotes in {filepath}")
                new_content = new_content.replace(r"\'", "'")
            if r'\"' in new_content:
                # Be careful if inside JS string or HTML, but inside {% ... %} it should be "
                def fix_tag(m):
                    tag = m.group(0)
                    return tag.replace(r'\"', '"')
                new_content = re.sub(r'\{%.*?%\}', fix_tag, new_content, flags=re.DOTALL)
            
            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as fh:
                    fh.write(new_content)
                print(f"Saved {filepath}")
