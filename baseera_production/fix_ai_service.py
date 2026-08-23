import codecs
with open('dashboard/services/ai_service.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

clean_lines = lines[:514]

with codecs.open('recover_script.py', 'r', encoding='mbcs') as f:
    recovery = f.read()

with open('dashboard/services/ai_service.py', 'w', encoding='utf-8') as f:
    f.writelines(clean_lines)
    f.write(recovery)
