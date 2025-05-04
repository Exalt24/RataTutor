#!/usr/bin/env bash
set -e

echo ">>> Running migrations..."
python manage.py makemigrations --noinput
python manage.py migrate --noinput

echo ">>> Collecting static files..."
python manage.py collectstatic --noinput

echo ">>> Starting Gunicorn..."
exec gunicorn WebEngFinalExam.wsgi:application \
     --bind 0.0.0.0:${PORT:-8000} \
     --workers 3 \
     --log-level info
