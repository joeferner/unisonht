#!/bin/bash
set -e
set -u

IN_PIN=${IN_PIN:-18}
OUT_PIN=${OUT_PIN:-17}

# Install Lirc
if dpkg -l | grep -q lirc; then
  echo "lirc already installed"
else
  echo "installing lirc"
  apt install -y lirc
fi

# Update /boot/config.txt
echo "update /boot/config.txt"
sed -i 's|.*gpio-ir,.*|dtoverlay=gpio-ir,gpio_pin='"${IN_PIN}"'|' /boot/config.txt
sed -i 's|.*gpio-ir-tx,.*|dtoverlay=gpio-ir-tx,gpio_pin='"${OUT_PIN}"'|' /boot/config.txt

# Update /etc/lirc/lirc_options.conf
echo "update /etc/lirc/lirc_options.conf"
sed -i 's|^driver.*|driver          = default|' /etc/lirc/lirc_options.conf
sed -i 's|^device.*|device          = /dev/lirc0|' /etc/lirc/lirc_options.conf

# Update /etc/lirc/hardware.conf
# echo "update /etc/lirc/hardware.conf"
# cat > /etc/lirc/hardware.conf <<EOF 
# LIRCD_ARGS="--uinput --listen"
# LOAD_MODULES=true
# DRIVER="default"
# DEVICE="/dev/lirc0"
# MODULES="lirc_rpi"
# EOF

echo "Setup Complete (run: sudo reboot)"
