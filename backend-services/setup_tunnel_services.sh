#!/bin/bash

# Cloudflare Tunnel Auto-Start Setup Script
# Usage: sudo ./setup_tunnel_services.sh

echo "Setting up Systemd Services for Cloudflare Tunnels..."

# 1. API Tunnel Service (Port 8000)
cat <<EOF > /etc/systemd/system/tunnel-api.service
[Unit]
Description=Cloudflare Tunnel for AirPhyNet API
After=network.target

[Service]
ExecStart=/usr/local/bin/cloudflared tunnel --url http://127.0.0.1:8000
Restart=always
RestartSec=10
User=$USER

[Install]
WantedBy=multi-user.target
EOF

# 2. Grafana Tunnel Service (Port 3000)
cat <<EOF > /etc/systemd/system/tunnel-grafana.service
[Unit]
Description=Cloudflare Tunnel for Grafana
After=network.target

[Service]
ExecStart=/usr/local/bin/cloudflared tunnel --url http://127.0.0.1:3000
Restart=always
RestartSec=10
User=$USER

[Install]
WantedBy=multi-user.target
EOF

echo "Reloading Systemd..."
systemctl daemon-reload

echo "Enabling Services (Start on Boot)..."
systemctl enable tunnel-api.service
systemctl enable tunnel-grafana.service

echo "Starting Services..."
systemctl start tunnel-api.service
systemctl start tunnel-grafana.service

echo "Done! Tunnels are running in background."
echo "Check status with: systemctl status tunnel-api"
echo "NOTE: Because these are Quick Tunnels, the URL changes on restart."
echo "To see the new URLs, use: journalctl -u tunnel-api -n 20"
