FROM python:3.11-slim

WORKDIR /app

COPY backend_api/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend code and the data file
COPY backend_api/ ./backend_api/
COPY data/ ./data/

WORKDIR /app/backend_api

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
