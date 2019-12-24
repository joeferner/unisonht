Install
=======

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
1. Install LIRC (See http://alexba.in/blog/2013/01/06/setting-up-lirc-on-the-raspberrypi/)
   1. `sudo apt-get install lirc`
   1. Edit `/etc/modules`. Add the following:

          lirc_dev
          lirc_rpi gpio_in_pin=23 gpio_out_pin=22
  
   1. Edit `/etc/lirc/hardware.conf`
   
          # Arguments which will be used when launching lircd
          LIRCD_ARGS=""
          
          # Don't start lircmd even if there seems to be a good config file
          # START_LIRCMD=false
          
          # Don't start irexec, even if a good config file seems to exist.
          # START_IREXEC=false
          
          # Try to load appropriate kernel modules
          LOAD_MODULES=true
          
          # Run "lircd --driver=help" for a list of supported drivers.
          DRIVER="default"
          # usually /dev/lirc0 is the correct setting for systems using udev
          DEVICE="/dev/lirc0"
          MODULES="lirc_rpi"
          
          # Default configuration files for your hardware if any
          LIRCD_CONF=""
          LIRCMD_CONF=""
          
    1. Run `sudo mkdir /etc/lirc/remotes`
    1. Copy remote files into `/etc/lirc/remotes`
    1. `cat` remote files into `/etc/lircd.conf`
    1. `sudo cp /etc/lirc/lirc_options.conf.dist /etc/lirc/lirc_options.conf`
    1. Run `sudo /etc/init.d/lircd restart`

Simulate LIRC
=============

```
sudo systemctl start lircd
irw
sudo systemctl stop lircd
```
OR
```
sudo lircd --allow-simulate --immediate-init --driver=file --nodaemon
irsend simulate "A10C000F 00 NUM1 tivo"
```


