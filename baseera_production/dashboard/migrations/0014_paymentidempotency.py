from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("dashboard", "0013_committeethread_committeemessage"),
    ]

    operations = [
        migrations.CreateModel(
            name="PaymentIdempotency",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("key", models.CharField(max_length=128)),
                ("status", models.CharField(default="processing", max_length=20)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="payment_requests", to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddConstraint(
            model_name="paymentidempotency",
            constraint=models.UniqueConstraint(fields=("user", "key"), name="unique_payment_idempotency_key"),
        ),
    ]