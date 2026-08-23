from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from django.conf import settings

from dashboard.security import validate_uploaded_file, build_safe_filename


class SecurityHardeningTests(TestCase):
    def test_secure_defaults_are_applied(self):
        self.assertFalse(settings.CORS_ALLOW_ALL_ORIGINS)
        self.assertNotIn("*", settings.ALLOWED_HOSTS)
        self.assertTrue(settings.SESSION_COOKIE_HTTPONLY)
        self.assertEqual(settings.SESSION_COOKIE_SAMESITE, "Lax")

    def test_rejects_unsafe_uploads(self):
        bad_file = SimpleUploadedFile(
            "payload.exe",
            b"not a real file",
            content_type="application/x-msdownload",
        )
        with self.assertRaises(ValueError):
            validate_uploaded_file(bad_file, max_size_bytes=5 * 1024 * 1024)

    def test_builds_safe_filename(self):
        safe_name = build_safe_filename("report.csv")
        self.assertTrue(safe_name.endswith(".csv"))
        self.assertNotIn("../", safe_name)
