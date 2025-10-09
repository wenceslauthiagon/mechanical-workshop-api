# Build stage
FROM node:22-slim AS builder

WORKDIR /app

# Update packages for security
RUN apt-get update && apt-get upgrade -y && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM node:22-slim AS production

WORKDIR /app

# Update packages and install netcat + openssl for database connection testing
RUN apt-get update && apt-get upgrade -y && apt-get install -y netcat-traditional openssl && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create app user
RUN groupadd --gid 1001 nodejs
RUN useradd --uid 1001 --gid nodejs --shell /bin/sh --create-home nestjs

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage first
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/scripts ./scripts

# Generate Prisma client after copying everything
RUN npx prisma generate

# Copy and set permissions for entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Switch to app user
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Use custom entrypoint for initialization
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]