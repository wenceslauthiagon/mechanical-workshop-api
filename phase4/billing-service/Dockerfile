# syntax=docker/dockerfile:1
FROM node:20-alpine AS base

WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci && npx prisma generate

# Copy sources
COPY . .

# Build
RUN npm run build && npm prune --omit=dev

ENV NODE_ENV=production
EXPOSE 3002

CMD ["npm", "start"]