FROM python:3.12-slim

WORKDIR /srv/toki

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml .
RUN mkdir -p app && pip install --no-cache-dir -e .

COPY app/ app/
COPY static/ static/
COPY alembic/ alembic/
COPY alembic.ini .
COPY entrypoint.sh .

RUN chmod +x entrypoint.sh

EXPOSE ${APP_PORT:-8002}

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD curl -f http://localhost:${APP_PORT:-8002}/health || exit 1

ENTRYPOINT ["./entrypoint.sh"]
