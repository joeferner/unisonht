1. Change `/etc/hostname` to `unisonht-pi`
1. Add `127.0.0.1 unisonht-pi` to `/etc/hosts`
1. Upgrade Firmware

    ```
    sudo rpi-update
    ```

1. Install packages

    ```
    sudo apt-get update
    sudo apt-get upgrade
    sudo apt-get install lirc oracle-java7-jdk wmctrl autoconf git libgtk2.0-dev xdotool x11-xserver-utils
    ```

1. Disable screen blanking. 

    1. Add the following line to `/etc/xdg/lxsession/LXDE-pi/autostart`

        ```
        # REMOVE THIS LINE: @xscreensaver -no-splash
        @xset s off         # don't activate screensaver
        @xset -dpms         # disable DPMS (Energy Star) features.
        @xset s noblank     # don't blank the video device
        ```
        
    1. Edit the following value in this file `/etc/kbd/config`

        ```
        BLANK_TIME=0
        POWERDOWN_TIME=0
        ```

1. Install fixed version of pqiv (image viewer)

    ```
    sudo apt-get remove pqiv
    git clone https://github.com/phillipberndt/pqiv.git -b 0.12
    cd pqiv
    ./configure
    # in pqiv.c change "gchar option;" to "gint option;"
    sudo make all install
    ```

1. Add the following to `~/.bashrc`

    ```
    export JAVA_HOME=/usr/lib/jvm/jdk-7-oracle-armhf
    ```

1. Make UnisonHT directory

    ```
    mkdir -p /opt/unisonht/config
    chmod -R a+w /opt/unisonht
    ```

1. Configure LIRC Hardware. Add the following to `/boot/config.txt`

    ```
    dtoverlay=lirc-rpi,gpio_in_pin=23,gpio_out_pin=22,gpio_in_pull=up
    ```

1. Configure LIRC to use the Hardware `/etc/lirc/hardware.conf`

    ```
    DRIVER="default"
    DEVICE="/dev/lirc0"
    MODULES="lirc_rpi"
    LIRCD_CONF=""
    LIRCMD_CONF=""
    ```

1. Run `deploy-to-pi.sh` in the UnisonHT project.
1. Copy files from the `/config` directory to `/opt/unisonht/config` as a starting point.
1. Start run script on boot. Add the following to `/etc/xdg/lxsession/LXDE-pi/autostart`

    ```
    @/opt/unisonht/bin/server.sh
    ```

1. reboot
1. If you are using a TiVo remote. Switch the remote to IR only. Press/Hold Tivo + C, should blink red. For RF mode, Press/Hold Tivo + D, light blinks yellow.
1. Record your remote `sudo irrecord -d /dev/lirc0 -f /etc/lirc/tivo.conf --disable-namespace`
1. Backup lircd.conf `sudo cp /etc/lirc/lircd.conf /etc/lirc/lircd.conf.bak`
1. Use your remote `sudo cp /etc/lirc/tivo.conf /etc/lirc/lircd.conf`
1. Restart LIRC `sudo /etc/init.d/lirc restart`
