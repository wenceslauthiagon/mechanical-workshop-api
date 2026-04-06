FROM gcr.io/distroless/nodejs20-debian11:nonroot AS builder
COPY --chown=nonroot:nonroot package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM gcr.io/distroless/nodejs20-debian11:nonroot
COPY --from=builder --chown=nonroot:nonroot /app/dist ./dist
COPY --from=builder --chown=nonroot:nonroot /app/node_modules ./node_modules
EXPOSE 3003
CMD ["dist/index.js"]