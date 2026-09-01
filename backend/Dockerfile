# ==========================================
# 1. Dependencies Stage
# ==========================================
FROM oven/bun:1.2-alpine AS dependencies

WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile --production

# ==========================================
# 2. Production Runner Stage
# ==========================================
FROM oven/bun:1.2-alpine AS runner

WORKDIR /app

# Copy production node_modules and configuration
COPY --from=dependencies /app/node_modules ./node_modules
COPY package.json tsconfig.json drizzle.config.ts ./
COPY src ./src

# Set environment
ENV NODE_ENV=production
ENV PORT=4000

# Use non-root bun user for production security
USER bun

EXPOSE 4000

HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
  CMD bun -e "fetch('http://localhost:4000/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

CMD ["bun", "src/index.ts"]
