# Se construye desde la raíz del repositorio (ver docker-compose.yml): el módulo de Salud
# importa database/seeds/salud_sabia.json como respaldo para el primer uso sin señal.

# ---------- 1. Compilar la PWA ----------
FROM node:24-alpine AS build
WORKDIR /repo/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY frontend/ ./
COPY database/seeds/ /repo/database/seeds/
ARG VITE_API_BASE_URL=/api/v1
ARG VITE_ENABLE_DEMO_PROFILES=false
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL VITE_ENABLE_DEMO_PROFILES=$VITE_ENABLE_DEMO_PROFILES
RUN npm run build

# ---------- 2. Servir con nginx ----------
FROM nginx:1.27-alpine
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/frontend/dist /usr/share/nginx/html
EXPOSE 80
