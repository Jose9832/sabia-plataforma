# Se construye desde la raíz del repositorio (ver docker-compose.yml)
# para copiar database/ (migraciones y datos semilla), que vive en su propia carpeta.
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install -r requirements.txt

COPY backend/ .
COPY database/ /database/
RUN sed -i 's/\r$//' entrypoint.sh && chmod +x entrypoint.sh \
    && adduser --disabled-password --gecos "" sabia && chown -R sabia /app /database
USER sabia

ENV SEEDS_DIR=/database/seeds
EXPOSE 8000
HEALTHCHECK --interval=15s --timeout=3s --retries=5 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/v1/health')"
ENTRYPOINT ["./entrypoint.sh"]
