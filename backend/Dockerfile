# Use an official Python runtime as a parent image
FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV FLASK_ENV=production

# Set working directory
WORKDIR /app

# Install system dependencies for psycopg2, etc.
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev netcat \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install gunicorn
RUN pip install -r requirements.txt

# Copy project files
COPY . .

# Expose the port (default for Gunicorn)
EXPOSE 5000

# Entry point for production (using Gunicorn)
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
