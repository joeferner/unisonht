# Development

## Raspberry Pi

1.  Write the latest "Raspberry Pi OS Lite" to an SD Card (enable SSH, SSH key authentication, and note the hostname)
1.  Start the Raspberry Pi, open a command prompt and `ping <hostname>`
1.  Install "Remote Development" extension pack for VSCode.
1.  Connect VSCode via ssh
1.  Open the terminal in VSCode (Raspberry Pi)

        sudo apt -y update
        sudo apt -y upgrade
        sudo apt -y install git

        # Node Version Manager
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
        source ~/.bashrc

        nvm install 18
        npm install -g pnpm

        git clone git@github.com:joeferner/unisonht.git

# LIRC

See https://devkimchi.com/2020/08/12/turning-raspberry-pi-into-remote-controller/

## Setup

```
sudo ./scripts/raspberry-pi-lirc-setup.sh
sudo reboot
```

## Remotes

Remotes see https://lirc-remotes.sourceforge.net/remotes-table.html or `git clone https://git.code.sf.net/p/lirc-remotes/code lirc-remotes-code` and `/etc/lirc/lircd.conf.d`

## Manual Remotes

```
sudo vi /boot/config.txt # comment out line with gpio-ir-tx
sudo systemctl stop lircd
sudo mode2 -m -d /dev/lirc0
sudo irrecord -d /dev/lirc0 --disable-namespace
```
