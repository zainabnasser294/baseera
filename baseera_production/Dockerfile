FROM python:3.10-slim
WORKDIR /app
COPY baseera_production/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn whitenoise
COPY baseera_production/ .
RUN SECRET_KEY=dummy_secret_key_for_build_12345678909876543210 DEBUG=True python manage.py collectstatic --noinput
CMD ["gunicorn", "baseera_web.wsgi:application", "--bind", "0.0.0.0:10000"]
