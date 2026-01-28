FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy main application
COPY main.py .

# Copy content for RAG
# We have copied the content directory into ./apps/ai/content locally to bypass build context issues.
COPY content /content

CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
