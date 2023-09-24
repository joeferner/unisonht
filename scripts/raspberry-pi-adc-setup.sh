#!/bin/bash
set -e
set -u

# Update /boot/config.txt
echo "update /boot/config.txt"
sed -i 's|.*dtparam=spi.*|dtparam=spi=on|' /boot/config.txt

echo "Setup Complete (run: sudo reboot)"
