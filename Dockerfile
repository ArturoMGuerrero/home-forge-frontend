FROM oven/bun:1.3-alpine AS build
WORKDIR /workspace

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
# Por defecto la API se sirve en el mismo dominio (/api, vía el proxy de nginx de abajo).
ARG VITE_API_BASE=/api
ENV VITE_API_BASE=$VITE_API_BASE
RUN bun run build

FROM nginx:1.27-alpine
# nginx reenvía /api y /uploads a este backend. En la plataforma, apúntalo a la URL interna del backend.
ENV BACKEND_URL=http://backend:8080
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /workspace/dist /usr/share/nginx/html

EXPOSE 80
