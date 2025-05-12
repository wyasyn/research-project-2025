#################################################################
# Stage 1: Builder
#################################################################
FROM python:3.12-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ cmake \
    libopenblas-dev liblapack-dev \
    libpq-dev \
    libgl1 \
    libglib2.0-0 \
    netcat-openbsd \
    build-essential \
  && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip \
  && pip install --prefix=/install --no-cache-dir -r requirements.txt

#################################################################
# Stage 2: Final image
#################################################################
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libopenblas-dev liblapack-dev \
    libpq-dev \
    libgl1 \
    libglib2.0-0 \
    netcat-openbsd \
    tini \
    curl \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN useradd -m appuser

RUN mkdir -p /app/uploads \
  && chown -R appuser:appuser /app/uploads \
  && chmod -R 700 /app/uploads

VOLUME ["/app/uploads"]

COPY --from=builder /install /usr/local
COPY . .

USER appuser

# Render sets the PORT environment variable
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s \
  CMD curl --fail http://localhost:${PORT:-5000}/health || exit 1

# Use tini and run gunicorn directly with $PORT env var
ENTRYPOINT ["/usr/bin/tini", "--"]

CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:${PORT:-5000} app:app"]
