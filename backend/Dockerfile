# Stage 1: Builder
FROM python:3.12-slim AS builder

WORKDIR /app

# Install only needed build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ cmake \
    libopenblas-dev liblapack-dev \
    libpq-dev \
    libgl1 \
    libglib2.0-0 \
    netcat-openbsd \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --prefix=/install --no-cache-dir -r requirements.txt

# Stage 2: Final minimal image
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install only runtime libraries (no gcc, cmake, etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libopenblas-dev liblapack-dev \
    libpq-dev \
    libgl1 \
    libglib2.0-0 \
    netcat-openbsd \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy installed Python packages
COPY --from=builder /install /usr/local

# Copy app code
COPY . .

# Expose port
EXPOSE 5000

# Entrypoint script (optional for waiting DB)
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]

# Default command to run your app
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
                                                                                                       
                                                                                                                                                                    
                                                                                                                                                                    
                                                                                                                                                                    
                                                                                                                                                                    
