# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY cli/ ./cli/
COPY src/ ./src/
COPY assets/ ./assets/

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine

# Install global dependencies
RUN apk add --no-cache \
    git \
    curl \
    ca-certificates

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S speedtype -u 1001

WORKDIR /app

# Copy built application
COPY --from=builder --chown=speedtype:nodejs /app/dist ./dist
COPY --from=builder --chown=speedtype:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=speedtype:nodejs /app/assets ./assets
COPY --from=builder --chown=speedtype:nodejs /app/package.json ./

# Create speed-type data directory
RUN mkdir -p /home/speedtype/.speed-type && \
    chown -R speedtype:nodejs /home/speedtype

# Switch to non-root user
USER speedtype

# Install globally
RUN npm link

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD speed-type --version || exit 1

# Default command
ENTRYPOINT ["speed-type"]
CMD ["--help"]