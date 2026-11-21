# Se construye desde la raíz del repositorio (ver docker-compose.yml)
# para poder copiar datos/semilla.json, compartido con el frontend.
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install -r requirements.txt

COPY backend/ .
COPY datos/semilla.json /app/datos/semilla.json
RUN sed -i 's/\r$//' entrypoint.sh && chmod +x entrypoint.sh \
    && adduser --disabled-password --gecos "" sabia && chown -R sabia /app
USER sabia

ENV SEED_FILE=/app/datos/semilla.json
EXPOSE 8000
HEALTHCHECK --interval=15s --timeout=3s --retries=5 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/salud')"
ENTRYPOINT ["./entrypoint.sh"]
