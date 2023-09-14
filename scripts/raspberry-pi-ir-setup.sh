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

# create /sbin/lirc-allow-write-protocol
echo "create /sbin/lirc-allow-write-protocol"
cat << EOF > /sbin/lirc-allow-write-protocol
#!/bin/bash

chmod a+w /sys/class/rc/rc*/protocols
EOF
chmod u+x /sbin/lirc-allow-write-protocol

# create /etc/udev/rules.d/50-lirc-protocol.rules
echo "/etc/udev/rules.d/50-lirc-protocol.rules"
cat << EOF > /etc/udev/rules.d/50-lirc-protocol.rules
SUBSYSTEM=="lirc", GROUP="lirc", RUN+="/sbin/lirc-allow-write-protocol"
EOF

# Update /boot/config.txt
echo "update /boot/config.txt"
sed -i 's|.*gpio-ir,.*|dtoverlay=gpio-ir,gpio_pin='"${IN_PIN}"'|' /boot/config.txt
sed -i 's|.*gpio-ir-tx,.*|dtoverlay=gpio-ir-tx,gpio_pin='"${OUT_PIN}"'|' /boot/config.txt

echo "Setup Complete (run: sudo reboot)"
