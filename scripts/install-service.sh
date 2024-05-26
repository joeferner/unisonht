#!/bin/bash
set -eou pipefail
DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd "${DIR}/.."

echo "build..."
cargo build

sudo mkdir -p /opt/unisonht
sudo cp target/debug/unisonht /opt/unisonht/unisonht

echo "create user..."
sudo useradd -M app || echo "user exists"
sudo usermod -L app
sudo adduser app spi
sudo adduser app gpio
sudo adduser app video # lirc

echo "create service..."
cat <<EOF | sudo tee /etc/systemd/system/unisonht.service
[Unit]
Description=UnisonHT Service
After=network.target
StartLimitIntervalSec=0

[Service]
Type=simple
Restart=always
RestartSec=1
User=app
Environment="RUST_BACKTRACE=1"
Environment="RUST_LOG=debug"
ExecStart=/opt/unisonht/unisonht

[Install]
WantedBy=multi-user.target
EOF

echo "Starting service..."
sudo systemctl enable unisonht
sudo systemctl daemon-reload
sudo systemctl start unisonht

echo "Complete!"
