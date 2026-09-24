# ==============================================================================
# Production Python 3.11 Backend - Hardened & Non-Root
# ==============================================================================
FROM python:3.11-slim

# Prevent Python from writing .pyc and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install curl for container healthcheck probes & clean up apt cache
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

# Create dedicated non-root application user and group (Least Privilege Principle)
RUN groupadd -g 1001 appgroup && \
    useradd -u 1001 -g appgroup -s /bin/bash -m appuser

# Install Python dependencies with pip caching
COPY backend_api/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application source
COPY backend_api/ ./backend_api/

# Set proper ownership to non-root user
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

WORKDIR /app/backend_api

# Expose FastAPI backend port
EXPOSE 8001

# Liveness Probe Healthcheck
HEALTHCHECK --interval=20s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8001/api/health/live || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
