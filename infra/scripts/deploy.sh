#!/bin/bash
set -e

REPO_URL="https://github.com/vjtech94/clothing-store.git"
APP_DIR="$HOME/clothing-store"
COMPOSE_FILE="infra/docker-compose.prod.yml"

echo "=== Clothing Store Deployment ==="

if [ ! -d "$APP_DIR" ]; then
    echo "Cloning repository..."
    git clone "$REPO_URL" "$APP_DIR"
else
    echo "Pulling latest changes..."
    cd "$APP_DIR"
    git pull origin main
fi

cd "$APP_DIR"

if [ ! -f "infra/.env" ]; then
    echo ""
    echo "ERROR: infra/.env file not found!"
    echo "Copy infra/.env.example to infra/.env and fill in your values:"
    echo "  cp infra/.env.example infra/.env"
    echo "  nano infra/.env"
    exit 1
fi

echo ""
echo "Building Docker images (this may take 10-15 minutes on first run)..."
cd infra
docker compose -f docker-compose.prod.yml --env-file .env build

echo ""
echo "Starting services..."
docker compose -f docker-compose.prod.yml --env-file .env up -d

echo ""
echo "Waiting for services to start..."
sleep 30

echo ""
echo "=== Service Status ==="
docker compose -f docker-compose.prod.yml ps

echo ""
echo "=== Health Check ==="
if curl -sf http://localhost/actuator/health > /dev/null 2>&1; then
    echo "API Gateway: HEALTHY"
else
    echo "API Gateway: starting up (may take another minute)..."
fi

PUBLIC_IP=$(curl -sf http://ifconfig.me 2>/dev/null || echo "<your-public-ip>")
echo ""
echo "=== Deployment Complete ==="
echo "API URL: http://$PUBLIC_IP/api/"
echo "Health:  http://$PUBLIC_IP/actuator/health"
echo ""
echo "Test with: curl http://$PUBLIC_IP/api/products"
