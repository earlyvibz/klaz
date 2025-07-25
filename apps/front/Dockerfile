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
COPY apps/backend ./apps/backend/
COPY apps/front ./apps/front/

# Build backend first (needed by frontend)
RUN pnpm --filter @klaz/backend build

# Build frontend
RUN pnpm --filter front build

# Production with nginx
FROM nginx:alpine

COPY --from=builder /app/apps/front/dist /usr/share/nginx/html

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
