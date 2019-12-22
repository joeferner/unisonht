1. Flash the latest Raspberry Pi Raspbian Lite image
1. Add file `ssh` to the boot partition
1. Add a user
   1. `sudo adduser <username>`
   1. Add user to sudo `sudo adduser <username> sudo`
   1. No password sudo
      1. `sudo mv /etc/sudoers.d/010_pi-nopasswd /etc/sudoers.d/010_<username>-nopasswd`
      1. `sudo chmod u+w /etc/sudoers.d/010_<username>-nopasswd`
      1. `sudo vi /etc/sudoers.d/010_<username>-nopasswd`
      1. `sudo chmod u-w /etc/sudoers.d/010_<username>-nopasswd`
   1. Remove pi user `sudo userdel -r pi`
   1. Password-less login
      1. `mkdir ~/.ssh`
      1. `vi ~/.ssh/authorized_keys`
      1. Locally `cat ~/.ssh/id_rsa.pub` and add this to `authorized_keys`
1. Update
   1. `sudo apt-get update`
   1. `sudo apt full-upgrade`
   1. `sudo reboot`
1. Install node.js
   1. `curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -`
   1. `sudo apt-get install nodejs npm`
1. List serial ports
   1. `sudo usermod -a -G dialout <username>`
   1. `sudo npm install -g @serialport/list`
   1. `serialport-list`
