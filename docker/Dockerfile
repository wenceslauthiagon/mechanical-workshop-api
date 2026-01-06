# syntax=docker/dockerfile:1
FROM node:20-alpine AS base

WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy sources
COPY . .

# Build
RUN npm run build

# Remove dev dependencies
RUN npm prune --production

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]
