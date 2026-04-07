# ─── Stage 1: Frontend Builder ────────────────────────────────────────────────
# --platform=linux/amd64 is REQUIRED by Render for prebuilt Docker images
FROM --platform=linux/amd64 node:20-alpine AS frontend-builder

WORKDIR /app

# Copy package files first — node_modules only rebuilds when package.json changes
COPY ./frontend/package*.json ./
RUN npm ci --frozen-lockfile

COPY ./frontend ./
RUN npm run build

# ─── Stage 2: Backend (Production) ────────────────────────────────────────────
FROM --platform=linux/amd64 node:20-alpine AS production

ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

# Install production dependencies only (no devDeps in final image)
COPY ./backend/package*.json ./
RUN npm ci --frozen-lockfile --omit=dev

# Copy backend source
COPY ./backend ./

# Copy compiled frontend dist from Stage 1
COPY --from=frontend-builder /app/dist ./public

# Health check — Render pings this before marking deploy as live
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3000

CMD ["node", "server.js"]