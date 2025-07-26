#!/bin/bash

# Backend Dockerfile
cat > .deploy/backend/Dockerfile << 'EOF'
FROM node:20-slim

WORKDIR /app

# Installer les dépendances système nécessaires
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy le package complet déployé
COPY . .

# Vérifier que le fichier existe
RUN ls -la build/bin/

EXPOSE 3333

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3333

# Start depuis le build existant
CMD ["node", "build/bin/server.js"]
EOF

# Frontend Dockerfile
cat > .deploy/frontend/Dockerfile << 'EOF'
FROM nginx:alpine

# Copy les fichiers buildés
COPY dist /usr/share/nginx/html

# Config nginx pour SPA React Router
RUN echo 'server { \
    listen 80; \
    server_name _; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF

echo "✅ Dockerfiles créés dans .deploy/"
