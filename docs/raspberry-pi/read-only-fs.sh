#!/bin/bash

# CREDIT TO THESE TUTORIALS:
# petr.io/en/blog/2015/11/09/read-only-raspberry-pi-with-jessie
# hallard.me/raspberry-pi-read-only
# k3a.me/how-to-make-raspberrypi-truly-read-only-reliable-and-trouble-free
# learn.adafruit.com/read-only-raspberry-pi/

RW_PIN=${1:-21}

if [ $(id -u) -ne 0 ]; then
  echo "Installer must be run as root."
  echo "Try 'sudo bash $0'"
  exit 1
fi

clear

echo "This script configures a Raspberry Pi SD card to boot into read-only mode,"
echo "obviating need for clean shutdown. NO FILES ON THE CARD CAN BE CHANGED"
echo "WHEN PI IS BOOTED IN THIS STATE. Either the filesystems must be remounted in"
echo "read/write mode, card must be mounted R/W on another system, or a jumper"
echo "on pin ${RW_PIN} to ground can be used to enable read/write on boot."
echo
echo "Links to original tutorials are in script source. THIS IS A ONE-WAY"
echo "OPERATION. THERE IS NO SCRIPT TO REVERSE THIS SETUP! ALL other system"
echo "config should be complete before using this script. MAKE A BACKUP FIRST."
echo
echo "Run time ~5 minutes. Reboot required."
echo
echo -n "CONTINUE? [y/N] "
read
if [[ ! "$REPLY" =~ ^(yes|y|Y)$ ]]; then
  echo "Canceled."
  exit 0
fi

# Given a filename, a regex pattern to match and a replacement string:
# Replace string if found, else no change.
# (# $1 = filename, $2 = pattern to match, $3 = replacement)
replace() {
  grep $2 $1 >/dev/null
  if [ $? -eq 0 ]; then
    # Pattern found; replace in file
    sed -i "s/$2/$3/g" $1 >/dev/null
  fi
}

# Given a filename, a regex pattern to match and a replacement string:
# If found, perform replacement, else append file w/replacement on new line.
replaceAppend() {
  grep $2 $1 >/dev/null
  if [ $? -eq 0 ]; then
    # Pattern found; replace in file
    sed -i "s/$2/$3/g" $1 >/dev/null
  else
    # Not found; append on new line (silently)
    echo $3 | sudo tee -a $1 >/dev/null
  fi
}

# Given a filename, a regex pattern to match and a string:
# If found, no change, else append file with string on new line.
append1() {
  grep $2 $1 >/dev/null
  if [ $? -ne 0 ]; then
    # Not found; append on new line (silently)
    echo $3 | sudo tee -a $1 >/dev/null
  fi
}

# Given a filename, a regex pattern to match and a string:
# If found, no change, else append space + string to last line --
# this is used for the single-line /boot/cmdline.txt file.
append2() {
  grep $2 $1 >/dev/null
  if [ $? -ne 0 ]; then
    # Not found; insert in file before EOF
    sed -i "s/\'/ $3/g" $1 >/dev/null
  fi
}

echo
echo "Starting installation..."
echo "Updating package index files..."
apt-get update

echo "Removing unwanted packages..."
#apt-get remove -y --force-yes --purge triggerhappy logrotate dbus \
# dphys-swapfile xserver-common lightdm fake-hwclock
# Let's keep dbus...that includes avahi-daemon, a la 'raspberrypi.local',
# also keeping xserver & lightdm for GUI login (WIP, not working yet)
apt-get remove -y --force-yes --purge triggerhappy logrotate dphys-swapfile fake-hwclock
apt-get -y --force-yes autoremove --purge

# Replace log management with busybox (use logread if needed)
echo "Installing ntp and busybox-syslogd..."
apt-get -y --force-yes install ntp busybox-syslogd; dpkg --purge rsyslog

echo "Configuring system..."

# Install boot-time R/W jumper test if requested
GPIOTEST="gpio -g mode $RW_PIN up\n\
if [ \`gpio -g read $RW_PIN\` -eq 0 ] ; then\n\
\tmount -o remount,rw \/\n\
\tmount -o remount,rw \/boot\n\
fi\n"
apt-get install -y --force-yes wiringpi
# Check if already present in rc.local:
grep "gpio -g read" /etc/rc.local >/dev/null
if [ $? -eq 0 ]; then
  # Already there, but make sure pin is correct:
  sed -i "s/^.*gpio\ -g\ read.*$/$GPIOTEST/g" /etc/rc.local >/dev/null
else
  # Not there, insert before final 'exit 0'
  sed -i "s/^exit 0/$GPIOTEST\\nexit 0/g" /etc/rc.local >/dev/null
fi

# Add fastboot, noswap and/or ro to end of /boot/cmdline.txt
append2 /boot/cmdline.txt fastboot fastboot
append2 /boot/cmdline.txt noswap noswap
append2 /boot/cmdline.txt ro^o^t ro

# Move /var/spool to /tmp
rm -rf /var/spool
ln -s /tmp /var/spool

# Move /var/lib/lightdm and /var/cache/lightdm to /tmp
rm -rf /var/lib/lightdm
rm -rf /var/cache/lightdm
ln -s /tmp /var/lib/lightdm
ln -s /tmp /var/cache/lightdm

# Make SSH work
replaceAppend /etc/ssh/sshd_config "^.*UsePrivilegeSeparation.*$" "UsePrivilegeSeparation no"
# bbro method (not working in Jessie?):
#rmdir /var/run/sshd
#ln -s /tmp /var/run/sshd

# Change spool permissions in var.conf (rondie/Margaret fix)
replace /usr/lib/tmpfiles.d/var.conf "spool\s*0755" "spool 1777"

# Move dhcpd.resolv.conf to tmpfs
touch /tmp/dhcpcd.resolv.conf
rm /etc/resolv.conf
ln -s /tmp/dhcpcd.resolv.conf /etc/resolv.conf

mkdir /root/.pm2

# Make edits to fstab
# make / ro
# tmpfs /var/log tmpfs nodev,nosuid 0 0
# tmpfs /var/tmp tmpfs nodev,nosuid 0 0
# tmpfs /tmp     tmpfs nodev,nosuid 0 0
# tmpfs /root/.pm2     tmpfs nodev,nosuid 0 0
replace /etc/fstab "vfat\s*defaults\s" "vfat    defaults,ro "
replace /etc/fstab "ext4\s*defaults,noatime\s" "ext4    defaults,noatime,ro "
append1 /etc/fstab "/var/log" "tmpfs /var/log tmpfs nodev,nosuid 0 0"
append1 /etc/fstab "/var/tmp" "tmpfs /var/tmp tmpfs nodev,nosuid 0 0"
append1 /etc/fstab "\s/tmp"   "tmpfs /tmp    tmpfs nodev,nosuid 0 0"
append1 /etc/fstab "\s/root/.pm2"   "tmpfs /root/.pm2    tmpfs nodev,nosuid 0 0"

# PROMPT FOR REBOOT --------------------------------------------------------

echo "Done."
echo
echo "Settings take effect on next boot."
echo
echo -n "REBOOT NOW? [y/N] "
read
if [[ ! "$REPLY" =~ ^(yes|y|Y)$ ]]; then
  echo "Exiting without reboot."
  exit 0
fi
echo "Reboot started..."
reboot
exit 0
