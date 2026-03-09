# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

ENV NODE_ENV=production

RUN npm run build

# Runtime stage
FROM nginx:stable-alpine AS runtime

# Copy nginx configuration template
COPY nginx.conf /etc/nginx/nginx.conf.template

# Copy built files from Vite build
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Create necessary directories for Nginx
RUN mkdir -p /var/cache/nginx /var/run /var/log/nginx && \
  chown -R nginx:nginx /var/cache/nginx /var/run /var/log/nginx /usr/share/nginx/html && \
  chmod -R 755 /var/cache/nginx /var/run /var/log/nginx && \
  touch /var/run/nginx.pid && \
  chown nginx:nginx /var/run/nginx.pid

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

EXPOSE 8080

CMD ["/docker-entrypoint.sh"]
