FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy main application
COPY main.py .

# Copy content for RAG (Expects build context to be repo root or content to be available)
# If build context is ./apps/ai, this COPY ../../content will fail. 
# We assume the user will configure Railway to set Root Directory to . (repo root) 
# OR we copy it if the context allows. 
# SAFEST PATH: tailored for Monorepo where we might not control context easily without error:
# We will TRY to copy content. If it fails, the app warns but starts.
# Actually, standard Docker pattern:
# COPY content /content 
# This requires context to be root.

COPY content /content

CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
