## Installation on Raspberry Pi

1. Prepare Raspberry Pi SD Card
    1. Follow instructions to install Raspberry Pi OS Lite on SD Card https://www.raspberrypi.org/documentation/installation/installing-images/
    1. Enable SSH on boot - Create an empty file called `ssh` on the `boot` partition (on windows this is the accessible portion of the card) of the SD card
1. SSH into Raspberry Pi
    1. Find your Raspberry Pi on the network https://www.raspberrypi.org/documentation/remote-access/ip-address.md
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
    1. Login as new user - `ssh username@RASPBERRY_PI_IP`
    1. Remove `pi` user - `sudo deluser -remove-home pi`
1. *[Optional]* No password ssh
    1. Copy ssh keys to Raspberry Pi - From your computer `ssh-copy-id username@RASPBERRY_PI_IP`
    1. Alternativly copy private key - `vi ~/.ssh/id_rsa`. Then `chmod 400 ~/.ssh/id_rsa`
    1. Alternativly copy public key over `vi ~/.ssh/authorized_keys`. Then `chmod 400 ~/.ssh/authorized_keys`
1. *[Optional]* Extend SD card life by changing Linux to read only
    1. Download the read only script - `wget https://raw.githubusercontent.com/joeferner/unisonht/master/docs/raspberry-pi/read-only-fs.sh`
    1. Make it executable `chmod a+x read-only-fs.sh`
    1. Make it read only - `sudo ./read-only-fs.sh`
    1. **NOTE** Connecting pin GPIO21 to ground (bridge the last two pins closest to USB ports on the Raspberry Pi connector) on future boots with enable writes
1. Fix timezone and time
    1. List the timezones - `timedatectl list-timezones | grep America`
    1. Set the timezone - `sudo timedatectl set-timezone America/New_York`
    1. Install ntp - `sudo apt install -y ntp`
    1. Sync time - `sudo systemctl stop ntp; sudo ntpd -gq`
    1. Enable ntp - `sudo systemctl enable ntp`
    1. Sync time on startup - Add the following to the end of `/etc/rc.local`
    
           (systemctl stop ntp; ntpd -gq; systemctl start ntp) || echo "NTP failed"
    
1. Install Node.js
    1. Find which version you need - `uname -m`
    1. Get the link - Go to https://nodejs.org/en/download/ and find the binary version matching the previous
    1. Download node - `wget https://nodejs.org/dist/v12.18.3/node-v12.18.3-linux-armv7l.tar.xz`
    1. Extract it - `tar xf node-v12.18.3-linux-armv7l.tar.xz; cd node-v12.18.3-linux-armv7l`
    1. Remove some extra files - `rm CHANGELOG.md LICENSE README.md`
    1. Copy to global location - `sudo cp -R * /usr/local/`
1. Install pigpio
    1. Install dependencies - `sudo apt install -y python-setuptools python3-setuptools`
    1. Download it - `wget https://github.com/joan2937/pigpio/archive/master.zip`
    1. Extract it - `unzip master.zip; cd pigpio-master`
    1. Make it - `make`
    1. Install it - `sudo make install`
1. *[Optional]* Install Git
    1. `sudo apt-get install -y git`
1. Install pm2
    1. Install it - `sudo npm install pm2 -g`
    1. Begin on startup - `pm2 startup` (replace your username with root, and replace the home directory with `/root` and run the command)
    1. Start your app - `sudo pm2 start ecosystem.config.js`
    1. Save your app - `sudo pm2 save`
