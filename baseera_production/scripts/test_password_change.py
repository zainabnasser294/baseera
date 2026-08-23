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
# Get or create test user
user, _ = User.objects.get_or_create(username="pwd_test_user")
user.set_password("OldPassword123!")
user.save()

client.force_login(user)

from django.contrib.messages import get_messages

# 1. Test invalid current password
res = client.post('/settings/', {
    'change_password': '1',
    'current_password': 'WrongPassword!',
    'new_password': 'NewPassword123!',
    'confirm_password': 'NewPassword123!'
}, follow=True)
print("Invalid current password response:", res.status_code)
msgs = [str(m) for m in get_messages(res.wsgi_request)]
print("Messages received count:", len(msgs))
assert any("غير صحيحة" in m or "incorrect" in m for m in msgs), "Error message expected for wrong password"

# 2. Test mismatched passwords
res = client.post('/settings/', {
    'change_password': '1',
    'current_password': 'OldPassword123!',
    'new_password': 'NewPassword123!',
    'confirm_password': 'DifferentPassword123!'
}, follow=True)
print("Mismatched password response:", res.status_code)
msgs = [str(m) for m in get_messages(res.wsgi_request)]
print("Messages received count:", len(msgs))
assert any("متطابقتين" in m or "do not match" in m for m in msgs), "Error message expected for mismatched passwords"

# 3. Test successful password change
res = client.post('/settings/', {
    'change_password': '1',
    'current_password': 'OldPassword123!',
    'new_password': 'NewPassword123!',
    'confirm_password': 'NewPassword123!'
}, follow=True)
print("Successful password change response:", res.status_code)
msgs = [str(m) for m in get_messages(res.wsgi_request)]
print("Messages received count:", len(msgs))

# Verify updated user can authenticate with new password
user.refresh_from_db()
assert user.check_password("NewPassword123!"), "User password should be updated!"
print("SUCCESS: Password change feature is fully verified and working!")
