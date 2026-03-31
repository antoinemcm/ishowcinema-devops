FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
# Définir le proxy dans le Dockerfile
ENV HTTP_PROXY="http://proxy:3128"
ENV HTTPS_PROXY="http://proxy:3128"
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]