# ==========================================
# 1. Build Stage
# ==========================================
FROM oven/bun:1.2-alpine AS builder

WORKDIR /app

# Install dependencies with frozen lockfile
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Copy source code and build config
COPY tsconfig.json tsconfig.node.json vite.config.ts postcss.config.js tailwind.config.js index.html ./
COPY src ./src

# Build production bundle
ARG VITE_API_BASE_URL=http://localhost:4000/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN bun run build

# ==========================================
# 2. Production Runtime Stage (Nginx Alpine)
# ==========================================
FROM nginx:1.27-alpine AS runner

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy build artifacts from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration with SPA fallback & gzip
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
