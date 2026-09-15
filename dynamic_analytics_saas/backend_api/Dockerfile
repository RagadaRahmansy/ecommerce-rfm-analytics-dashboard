FROM python:3.11-slim

WORKDIR /app

# Copy dependencies first for caching
COPY backend_api/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend code
COPY backend_api/ ./backend_api/

WORKDIR /app/backend_api
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
