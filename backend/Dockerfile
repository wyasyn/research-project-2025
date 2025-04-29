# Stage 1: Builder
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

# Stage 2: Final image
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install runtime deps + tini (for proper signal handling) + curl (for healthcheck)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libopenblas-dev liblapack-dev \
    libpq-dev \
    libgl1 \
    libglib2.0-0 \
    netcat-openbsd \
    tini \
    curl \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

# Create a non-root user
RUN useradd -m appuser

# Create uploads directory, set ownership and restrictive perms
RUN mkdir -p /app/uploads \
  && chown -R appuser:appuser /app/uploads \
  && chmod -R 700 /app/uploads

# Declare uploads as a volume for persistence
VOLUME ["/app/uploads"]

# Copy installed Python packages from builder
COPY --from=builder /install /usr/local

# Copy application source code
COPY . .

# Entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Switch to non-root user
USER appuser

# Expose application port
EXPOSE 5000

# Healthcheck (assumes your app provides /health)
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s \
  CMD curl --fail http://localhost:5000/health || exit 1

# Use tini to handle PID 1 and forward signals
ENTRYPOINT ["/usr/bin/tini", "--", "/docker-entrypoint.sh"]

# Default command
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
