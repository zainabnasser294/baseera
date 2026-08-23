import re

with open('dashboard/api_views.py', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'def live_sync_api\(request\):\s*if request\.method == "POST":'
replacement = '''from django.core.cache import cache\n\ndef live_sync_api(request):\n    if request.method == "POST":\n        idem_key = request.headers.get("Idempotency-Key")\n        if idem_key and cache.get(f"idem_{idem_key}"):\n            return JsonResponse({"status": "success", "message": "Already processed"})\n        if idem_key:\n            cache.set(f"idem_{idem_key}", True, timeout=86400)'''

content = re.sub(pattern, replacement, content)

with open('dashboard/api_views.py', 'w', encoding='utf-8') as f:
    f.write(content)
