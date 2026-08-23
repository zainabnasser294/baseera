FROM python:3.10-slim
WORKDIR /app
COPY baseera_production/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn whitenoise
COPY baseera_production/ .
RUN python manage.py collectstatic --noinput
CMD ["gunicorn", "baseera_web.wsgi:application", "--bind", "0.0.0.0:10000"]
