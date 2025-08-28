FROM node:20-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app

# Copy workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/backend/package.json ./apps/backend/
COPY apps/front/package.json ./apps/front/

# Install deps
RUN pnpm install --frozen-lockfile

# Copy source
COPY packages/shared ./packages/shared/
COPY apps/front ./apps/front/
COPY apps/backend/package.json ./apps/backend/

# Build shared package if needed
RUN pnpm --filter @klaz/shared build

# Build frontend only
RUN pnpm --filter front build

# Production with nginx
FROM nginx:alpine

COPY --from=builder /app/apps/front/dist /usr/share/nginx/html

# Create entrypoint script for env substitution
RUN cat > /docker-entrypoint.d/40-substitute-env.sh << 'EOF'
#!/bin/sh
set -e

# Replace __VITE_API_URL__ placeholder with actual env var
if [ -n "$VITE_API_URL" ]; then
    echo "Substituting VITE_API_URL: $VITE_API_URL"
    find /usr/share/nginx/html -name "*.js" -type f -exec sed -i "s|__VITE_API_URL__|$VITE_API_URL|g" {} +
else
    echo "Warning: VITE_API_URL not set, using default placeholder"
fi
EOF

RUN chmod +x /docker-entrypoint.d/40-substitute-env.sh

# Config nginx pour SPA
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
