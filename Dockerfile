# --- 1. Compilación: genera la web estática en /app/out ---
FROM node:22-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Datos de la versión (los pasa GitHub Actions); la consola de la web los muestra
ARG GIT_SHA=local
ARG BUILD_TIME=
ENV NEXT_PUBLIC_GIT_SHA=$GIT_SHA NEXT_PUBLIC_BUILD_TIME=$BUILD_TIME
RUN npm run build

# --- 2. Producción: solo nginx sirviendo ficheros estáticos ---
FROM nginx:1.31-alpine
# La configuración se genera al arrancar en /var/run (tmpfs), así funciona con el contenedor en solo lectura
RUN rm -f /etc/nginx/conf.d/default.conf \
 && sed -i 's#include /etc/nginx/conf.d/\*.conf;#include /var/run/*.conf;#' /etc/nginx/nginx.conf \
 && grep -q 'include /var/run/\*.conf;' /etc/nginx/nginx.conf
ENV NGINX_ENVSUBST_OUTPUT_DIR=/var/run
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
# Dirección interna de Uptime Kuma (se sobrescribe en compose.yaml / .env)
ENV KUMA_URL=http://127.0.0.1:9
COPY --from=builder /app/out /usr/share/nginx/html
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:3000/ || exit 1
