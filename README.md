# Development

## Mock IR

```
MOCK_SPI=true MOCK_IR=true npm start
```

## Raspberry Pi

1.  Write the latest "Raspberry Pi OS Lite" to an SD Card (enable SSH, SSH key authentication, and note the hostname)
1.  Start the Raspberry Pi, open a command prompt and `ping <hostname>.local`
1.  Install "Remote Development" extension pack for VSCode.
1.  Connect VSCode via ssh (Ctrl+Shift+P -> Remote-SSH: Connect to Host...)
1.  Open the terminal in VSCode (Raspberry Pi)

        sudo apt -y install git
        # copy id_rsa from host computer
        chmod 400 ~/.ssh/id_rsa
        git clone git@github.com:joeferner/unisonht.git

1. Open folder in VSCode

        sudo apt -y update
        sudo apt -y upgrade
        

        # Node Version Manager
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
        source ~/.bashrc

        nvm install 18
        npm install -g pnpm

        git clone git@github.com:joeferner/unisonht.git
        ./scripts/raspberry-pi-dev-setup.sh

# IR Remote Control

## Setup

```
sudo ./scripts/raspberry-pi-ir-setup.sh
sudo reboot
ir-keytable # find gpio_ir_recv and note the rcX and use it in the next command
ir-keytable -s rc1 -t -c -p all
```

# Power Sense

## Setup

```
sudo ./scripts/raspberry-pi-adc-setup.sh
sudo reboot
```
