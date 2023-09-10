#!/bin/bash
set -e
set -u

IN_PIN=${IN_PIN:-17}
OUT_PIN=${OUT_PIN:-18}

# Install ir-keytable
if dpkg -l | grep -q ir-keytable; then
  echo "ir-keytable already installed"
else
  echo "installing ir-keytable"
  apt install -y ir-keytable
fi

# Install evtest
if dpkg -l | grep -q evtest; then
  echo "evtest already installed"
else
  echo "installing evtest"
  apt install -y evtest
fi

# Update /boot/config.txt
echo "update /boot/config.txt"
sed -i 's|.*gpio-ir,.*|dtoverlay=gpio-ir,gpio_pin='"${IN_PIN}"'|' /boot/config.txt
sed -i 's|.*gpio-ir-tx,.*|dtoverlay=gpio-ir-tx,gpio_pin='"${OUT_PIN}"'|' /boot/config.txt

echo "Setup Complete (run: sudo reboot)"
