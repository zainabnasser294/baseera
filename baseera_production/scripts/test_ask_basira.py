import os
import sys
import django

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'baseera_web.settings')
django.setup()

from django.test import Client
from django.contrib.auth.models import User

client = Client()
user = User.objects.first()
if not user:
    user = User.objects.create_user(username="test_admin", password="password123")

client.force_login(user)

# 1. Test GET /ask-basira/
res = client.get('/ask-basira/')
print(f"GET /ask-basira/ -> Status: {res.status_code}, Length: {len(res.content)}")
assert res.status_code == 200, f"Expected 200, got {res.status_code}"

# 2. Test POST /api/insights/chat
chat_payload = {
    "messages": [{"role": "user", "content": "مرحبا بصيرة"}],
    "fileContext": "",
    "agent_id": "general",
    "lang": "ar"
}
import json
res_chat = client.post('/api/insights/chat', data=json.dumps(chat_payload), content_type='application/json')
print(f"POST /api/insights/chat -> Status: {res_chat.status_code}")
assert res_chat.status_code == 200, f"Expected 200, got {res_chat.status_code}"

# Read some streamed content
stream_sample = b"".join(list(res_chat.streaming_content)[:5])
print(f"Chat stream sample length: {len(stream_sample)} bytes")
print("SUCCESS: /ask-basira and /api/insights/chat are completely working!")
