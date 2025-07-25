FROM node:20-alpine AS base

RUN npm install -g pnpm

WORKDIR /app

# Copy workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/backend/package.json ./apps/backend/

# Install all deps (needed for workspace resolution)
RUN pnpm install --frozen-lockfile

# Copy source
COPY packages/shared ./packages/shared/
COPY apps/backend ./apps/backend/

# Build shared first if needed
RUN pnpm --filter @klaz/shared build

# Build backend
RUN pnpm --filter @klaz/backend build

# Production stage
FROM node:20-alpine AS production

RUN npm install -g pnpm

WORKDIR /app

# Copy built app (contains its own package.json)
COPY --from=base /app/apps/backend/build ./

# Install only prod deps (no lockfile needed in production)
RUN pnpm install --prod --no-frozen-lockfile

EXPOSE 3333
CMD ["node", "bin/server.js"]
