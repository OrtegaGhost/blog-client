FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# VITE_API_URL stays /api — nginx proxies it to the backend at build time.
# Override VITE_PROXY_TARGET if the backend container is reachable at a
# different URL (e.g. --build-arg VITE_PROXY_TARGET=http://blog-api:3000).
ARG VITE_ASSET_URL=http://localhost:3000
ARG VITE_SOCKET_URL=http://localhost:3000
ENV VITE_ASSET_URL=$VITE_ASSET_URL \
    VITE_SOCKET_URL=$VITE_SOCKET_URL \
    VITE_API_URL=/api

RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# SPA fallback + /api proxy to the backend service.
# Override BACKEND_URL at runtime with an env substitution if needed.
ARG BACKEND_URL=http://localhost:3000
RUN printf 'server {\n\
  listen 80;\n\
  root /usr/share/nginx/html;\n\
  index index.html;\n\
  location /api/ {\n\
    proxy_pass %s/;\n\
    proxy_set_header Host $host;\n\
    proxy_set_header X-Real-IP $remote_addr;\n\
  }\n\
  location / {\n\
    try_files $uri $uri/ /index.html;\n\
  }\n\
}\n' "$BACKEND_URL" > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
