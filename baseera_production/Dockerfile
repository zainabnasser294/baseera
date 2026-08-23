FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn whitenoise
COPY . .
RUN python manage.py collectstatic --noinput
CMD ["gunicorn", "baseera_web.wsgi:application", "--bind", "0.0.0.0:10000"]
