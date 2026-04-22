#!/bin/bash
set -e

echo "Running DB migrations..."
alembic upgrade head

echo "Starting Toki..."
exec uvicorn app.main:app --host 0.0.0.0 --port "${APP_PORT:-8002}"
