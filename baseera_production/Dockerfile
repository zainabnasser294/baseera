FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY baseera_production/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
    django-cors-headers \
    google-genai \
    gunicorn \
    whitenoise

COPY baseera_production/ .

ENV SECRET_KEY=build-time-placeholder-not-used-in-production-0000000000000000000000
ENV DEBUG=True
RUN python manage.py collectstatic --noinput

EXPOSE 10000

CMD ["sh", "-c", "python manage.py migrate --noinput && gunicorn baseera_web.wsgi:application --bind 0.0.0.0:${PORT:-10000}"]
