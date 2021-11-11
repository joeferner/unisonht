## Installation on Raspberry Pi

1. Prepare Raspberry Pi SD Card
    1. Follow instructions to install Raspberry Pi OS Lite on SD Card https://www.raspberrypi.org/documentation/installation/installing-images/ (summary: use "Raspberry Pi Imager")
    1. Enable SSH on boot - Create an empty file called `ssh` on the `boot` partition (on windows this is the accessible portion of the card) of the SD card
1. SSH into Raspberry Pi
    1. Find your Raspberry Pi on the network https://www.raspberrypi.org/documentation/remote-access/ip-address.md
       - Linux: `nmap --open -p 22 192.168.68.0/24`
    1. `ssh pi@RASPBERRY_PI_IP` (password: raspberry)
    1. Update packages - `sudo apt-get update`
    1. Upgrade packages - `sudo apt-get -y upgrade`
    1. Remove old packages - `sudo apt autoremove`
1. Change hostname
    1. `sudo vi /etc/hostname`
    1. `sudo vi /etc/hosts`
1. *[Optional]* Change default `pi` user
    1. Create a new user - `sudo adduser username`
    1. Allow user to sudo - `sudo usermod -a -G sudo username`
    1. Allow user to use serial port - `sudo usermod -a -G dialout username`
    1. Login as new user - `ssh username@RASPBERRY_PI_IP`
    1. Remove `pi` user - `sudo deluser -remove-home pi`
1. *[Optional]* No password ssh
    1. Copy ssh keys to Raspberry Pi - From your computer `ssh-copy-id username@RASPBERRY_PI_IP`
    1. copy private key - `vi ~/.ssh/id_rsa`. Then `chmod 400 ~/.ssh/id_rsa`
1. Fix timezone and time
    1. List the timezones - `timedatectl list-timezones | grep America`
    1. Set the timezone - `sudo timedatectl set-timezone America/New_York`
    1. Install ntp - `sudo apt install -y ntp`
    1. Sync time - `sudo systemctl stop ntp; sudo ntpd -gq`
    1. Enable ntp - `sudo systemctl enable ntp`
    1. Sync time on startup - Add the following to the end of `/etc/rc.local`
    
           (systemctl stop ntp; ntpd -gq; systemctl start ntp) || echo "NTP failed"
    
1. Enable USART
    1. `sudo raspi-config`
       1. "Interfacing Options" -> "Serial"
       1. Would you like a login shell to be accessible over serial? `No`
       1. Would you like the serial port hardware to be enabled? `Yes`
    1. Disable bluetooth `sudo vi /boot/config.txt`
       1. add the line `dtoverlay=disable-bt`
       1. ensure the line `enable_uart=1`
1. *[Optional]* Install Git
    1. `sudo apt-get install -y git`
1. *[Optional]* Extend SD card life by changing Linux to read only
    1. Download the read only script - `wget https://raw.githubusercontent.com/joeferner/unisonht/master/docs/raspberry-pi/read-only-fs.sh`
    1. Make it executable `chmod a+x read-only-fs.sh`
    1. Make it read only - `sudo ./read-only-fs.sh`
    1. **NOTE** Connecting pin GPIO21 to ground (bridge the last two pins closest to USB ports on the Raspberry Pi connector) on future boots with enable writes
    1. **NOTE** Enable edits: `sudo mount -o remount,rw <partition>`
