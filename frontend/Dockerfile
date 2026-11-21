# Se construye desde la raíz del repositorio (ver docker-compose.yml) porque
# el respaldo offline importa datos/semilla.json, compartido con el backend.

# ---------- 1. Compilar la PWA ----------
FROM node:22-alpine AS build
WORKDIR /repo/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi
COPY frontend/ ./
COPY datos/ /repo/datos/
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ---------- 2. Servir con nginx ----------
FROM nginx:1.27-alpine
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/frontend/dist /usr/share/nginx/html
EXPOSE 80
