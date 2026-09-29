# Multi-stage production Dockerfile for Flappy Bird HTML5 Canvas Arcade App
FROM nginx:alpine-slim

# Labels for container metadata
LABEL maintainer="DevOps Team <devops@example.com>" \
      description="Flappy Bird HTML5 Arcade Game Container" \
      version="1.0.0"

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy custom Nginx configuration
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy static application files into Nginx web root
COPY app/ /usr/share/nginx/html/

# Set file permissions for unprivileged execution
RUN chmod -R 755 /usr/share/nginx/html && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid /var/cache/nginx /var/log/nginx

# Expose port 80
EXPOSE 80

# Built-in Healthcheck endpoint validation
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/healthz || exit 1

# Run container as unprivileged nginx user
USER nginx

# Command to start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
