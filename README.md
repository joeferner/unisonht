# Development

## Raspberry Pi

1.  Write the latest "Raspberry Pi OS Lite" to an SD Card (enable SSH, SSH key authentication, and note the hostname)
1.  Start the Raspberry Pi, open a command prompt and `ping <hostname>`
1.  Install "Remote Development" extension pack for VSCode and connect using the IP Address.
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

        # copy id_rsa from host computer
        chmod 400 ~/.ssh/id_rsa

        git clone git@github.com:joeferner/unisonht.git

# IR Remote Control

## Setup

```
sudo ./scripts/raspberry-pi-ir-setup.sh
sudo reboot
ir-keytable # find gpio_ir_recv and note the rcX and use it in the next command
ir-keytable -s rc1 -t -c -p all
```
