#!/bin/sh
set -e

# Source secrets from GCP Secret Manager volume if available
if [ -f /run/secrets/.env ]; then
  set -a
  . /run/secrets/.env
  set +a
fi

# Substitute environment variables in nginx config
envsubst '$BACKEND_URL' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

# Start nginx
exec nginx -g 'daemon off;'
