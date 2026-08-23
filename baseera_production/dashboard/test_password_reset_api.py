import json

from django.core.cache import cache
from django.test import TestCase
from django.contrib.auth.models import User


class PasswordResetApiTests(TestCase):
    def setUp(self):
        self.email = "saraalharbi0031@gmail.com"
        User.objects.create_user(username="reset_user", email=self.email, password="OldPassword123!")

    def test_otp_verification_normalizes_email_case(self):
        cache.set("otp_saraalharbi0031@gmail.com", "604081", timeout=900)
        response = self.client.post(
            "/api/mobile/verify-otp",
            data=json.dumps({
                "email": "SaraAlharbi0031@GMAIL.COM",
                "otp": " 604081 ",
                "new_password": "NewPassword123!",
            }),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "success")