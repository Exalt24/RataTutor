#!/usr/bin/env bash
set -e

echo "🚀 Starting RataTutor deployment..."
echo "🔧 PORT: ${PORT}"
echo "🔧 DEBUG: ${DEBUG}"
echo "🔧 ALLOWED_HOSTS: ${ALLOWED_HOSTS}"

echo ">>> Running migrations..."
python manage.py migrate --noinput

echo ">>> Collecting static files..."
python manage.py collectstatic --noinput

echo ">>> Starting Gunicorn on 0.0.0.0:${PORT:-8000}..."
exec gunicorn RataTutor.wsgi:application \
     --bind 0.0.0.0:${PORT:-8000} \
     --workers 3 \
     --log-level info \
     --timeout 120 \
     --access-logfile - \
     --error-logfile -