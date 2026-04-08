# ---------- FRONTEND BUILD ----------
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Install dependencies first (better caching)
COPY ./frontend/package*.json ./
RUN npm install

# Copy rest and build
COPY ./frontend ./

ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ARG VITE_GITHUB_CLIENT_ID
ENV VITE_GITHUB_CLIENT_ID=$VITE_GITHUB_CLIENT_ID
RUN echo "Google ID: $VITE_GOOGLE_CLIENT_ID" 
RUN npm run build


# ---------- BACKEND BUILD ----------
FROM node:20-alpine

WORKDIR /app

# Install backend dependencies
COPY ./backend/package*.json ./
RUN npm install

# Copy backend source
COPY ./backend ./

# Build TypeScript → dist/
RUN npm run build

# Copy frontend build into backend public folder
COPY --from=frontend-builder /app/dist /app/public

EXPOSE 3000

# Run compiled JS (NOT TS, NOT dev)
CMD ["node", "dist/server.js"]