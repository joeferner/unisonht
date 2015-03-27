* Change `/etc/hostname` to `unionht-pi`

* Upgrade Firmware

      sudo rpi-update

* Install packages

      sudo apt-get update
      sudo apt-get upgrade
      sudo apt-get install lirc oracle-java7-jdk wmctrl autoconf git libgtk2.0-dev

* Install fixed version of pqiv

      sudo apt-get remove pqiv
      git clone https://github.com/phillipberndt/pqiv.git -b 0.12
      cd pqiv
      ./configure
      # in pqiv.c change "gchar option;" to "gint option;"
      sudo make all install

* Add the following to `~/.bashrc`

      export JAVA_HOME=/usr/lib/jvm/jdk-7-oracle-armhf
    
* Make UnisonHT directory

      mkdir -p /opt/unisonht/
      chmod a+w /opt/unisonht/
    
* Install JUDS

      git clone https://github.com/mcfunley/juds.git
      cd juds
      ./autoconf.sh
      ./configure
      # modify Makefile. Remove values for M32 and M64
      make
      sudo make install
      sudo ln -s /usr/lib/libunixdomainsocket-linux-arm.so /opt/unisonht/libunixdomainsocket-linux-arm.so
    
* Configure LIRC Hardware.
** Add the following to `/etc/modules`

      lirc_dev
      lirc_rpi gpio_in_pin=23 gpio_out_pin=22
    
** Add the following to `/boot/config.txt`

      dtoverlay=lirc-rpi,gpio_in_pin=23,gpio_out_pin=22

* Configure LIRC to use the Hardware `/etc/lirc/hardware.conf`

```
########################################################
# /etc/lirc/hardware.conf
#
# Arguments which will be used when launching lircd
LIRCD_ARGS="--uinput"

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
########################################################
```

* Run `deploy-to-pi.sh` in the UnisonHT project.

* Create run script `/opt/unisonht/run.sh`

      #!/bin/bash

      java -classpath '*' com.unisonht.UnisonHT


* reboot
