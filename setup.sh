#!/usr/bin/env bash
set -euo pipefail

BUILD_DIR="${1:-}"
if [[ -z "$BUILD_DIR" || ! -d "$BUILD_DIR" ]]; then
  echo "Usage: $0 /path/to/build-dir"
  exit 1
fi

SERVICE_NAME="opengig.org"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"

DEPLOY_DIR="/var/www/opengig.org/deploy"
ENV_FILE="/var/www/opengig.org/.env"

NGINX_SITE_AVAILABLE="/etc/nginx/sites-available/opengig.org"
NGINX_SITE_ENABLED="/etc/nginx/sites-enabled/opengig.org"

NGINX_DEFAULT_DENY_AVAIL="/etc/nginx/sites-available/00-default-deny"
NGINX_DEFAULT_DENY_ENAB="/etc/nginx/sites-enabled/00-default-deny"

DOMAIN="opengig.org"
WEBROOT="/var/www/opengig.org/html"
EMAIL="torrin@torrin.me"

CERT_LIVE_DIR="/etc/letsencrypt/live/${DOMAIN}"

# Stop existing service if it exists
systemctl stop "$SERVICE_NAME" || echo "skipped stop $SERVICE_NAME"

# Ensure deploy dir exists
mkdir -p "$DEPLOY_DIR"

# Clear existing deploy contents (if any)
rm -rf "$DEPLOY_DIR"/*

# Move new build to deploy
shopt -s dotglob nullglob
mv "$BUILD_DIR"/* "$DEPLOY_DIR"/ || echo "no files to move from $BUILD_DIR"

# Make sure run.sh is executable
if [[ -f "$DEPLOY_DIR/run.sh" ]]; then
  chmod +x "$DEPLOY_DIR/run.sh"
else
  echo "ERROR: $DEPLOY_DIR/run.sh not found"
  exit 1
fi

# Get PORT + SPACES_* from .env
if [[ -f "$ENV_FILE" ]]; then
  PORT="$(grep -E '^PORT=' "$ENV_FILE" | tail -n1 | cut -d'=' -f2-)"
  SPACES_BUCKET="$(grep -E '^SPACES_BUCKET=' "$ENV_FILE" | tail -n1 | cut -d'=' -f2-)"
  SPACES_REGION="$(grep -E '^SPACES_REGION=' "$ENV_FILE" | tail -n1 | cut -d'=' -f2-)"
else
  echo "ERROR: $ENV_FILE not found; can't configure Nginx PORT/SPACES"  
  exit 1
fi

if [[ -z "${PORT:-}" ]]; then
  echo "ERROR: PORT is empty or not set in $ENV_FILE"
  exit 1
fi

if [[ -z "${SPACES_BUCKET:-}" || -z "${SPACES_REGION:-}" ]]; then
  echo "ERROR: SPACES_BUCKET or SPACES_REGION missing in $ENV_FILE"
  exit 1
fi

# systemd service
cat << 'EOF' | tee "$SERVICE_FILE" > /dev/null
[Unit]
Description=opengig.org
After=network.target

[Service]
Type=simple
ExecStart=/var/www/opengig.org/deploy/run.sh
WorkingDirectory=/var/www/opengig.org/deploy
Restart=always
EnvironmentFile=/var/www/opengig.org/.env

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable "$SERVICE_NAME"
systemctl restart "$SERVICE_NAME"

############################
# Certbot / nginx handling #
############################

mkdir -p "$WEBROOT"

CERT_EXISTS=false
if [[ -f "${CERT_LIVE_DIR}/fullchain.pem" && -f "${CERT_LIVE_DIR}/privkey.pem" ]]; then
  CERT_EXISTS=true
  echo "Existing cert found for ${DOMAIN}"
else
  echo "No existing cert for ${DOMAIN}, will attempt to obtain one"
fi

# If no cert, get one via webroot (HTTP)
if [[ "$CERT_EXISTS" = false ]]; then
  tee "$NGINX_SITE_AVAILABLE" > /dev/null <<EOF
server {
    listen 80;
    server_name ${DOMAIN};

    root ${WEBROOT};

    location /.well-known/acme-challenge/ {
        root ${WEBROOT};
    }

    location / {
        return 503;
    }
}
EOF

  ln -sf "$NGINX_SITE_AVAILABLE" "$NGINX_SITE_ENABLED"
  nginx -t
  systemctl reload nginx

  # request certificate (include www)
  certbot certonly \
    --webroot \
    -w "${WEBROOT}" \
    -d "${DOMAIN}" \
    --email "${EMAIL}" \
    --agree-tos \
    --non-interactive \
    --no-eff-email

  if [[ ! -f "${CERT_LIVE_DIR}/fullchain.pem" || ! -f "${CERT_LIVE_DIR}/privkey.pem" ]]; then
    echo "ERROR: Certbot did not create certificates as expected."
    exit 1
  fi
fi

FULLCHAIN="${CERT_LIVE_DIR}/fullchain.pem"
PRIVKEY="${CERT_LIVE_DIR}/privkey.pem"

if [[ ! -f "$FULLCHAIN" || ! -f "$PRIVKEY" ]]; then
  echo "ERROR: Certificate files not found at expected paths."
  exit 1
fi

# final nginx config with SSL + proxy
tee "$NGINX_SITE_AVAILABLE" > /dev/null <<EOF
server {
    listen 443 ssl;
    server_name ${DOMAIN};

    client_max_body_size 50m;

    ssl_certificate     ${FULLCHAIN};
    ssl_certificate_key ${PRIVKEY};
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location /files/ {
        proxy_set_header Host ${SPACES_BUCKET}.${SPACES_REGION}.digitaloceanspaces.com;
        proxy_pass https://${SPACES_BUCKET}.${SPACES_REGION}.digitaloceanspaces.com/;

        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location / {
        proxy_pass http://localhost:${PORT};
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
        proxy_connect_timeout 60s;
        send_timeout 3600s;

        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}

server {
    listen 80;
    server_name ${DOMAIN};

    location /.well-known/acme-challenge/ {
        root ${WEBROOT};
    }

    location / {
        return 301 https://${DOMAIN}\$request_uri;
    }
}
EOF

ln -sf "$NGINX_SITE_AVAILABLE" "$NGINX_SITE_ENABLED"

nginx -t
systemctl reload nginx
