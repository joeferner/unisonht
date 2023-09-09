# Development

## Raspberry Pi

1. Write the latest "Raspberry Pi OS Lite" to an SD Card (enable SSH, SSH key authentication, and note the hostname)
1. Start the Raspberry Pi, open a command prompt and ```ping <hostname>```
1. Install "Remote Development" extension pack for VSCode.
1. Connect VSCode via ssh
1. Open the terminal in VSCode (Raspberry Pi)

        sudo apt -y update
        sudo apt -y upgrade
        sudo apt -y install git

        # Node Version Manager
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
        source ~/.bashrc

        nvm install 18
        npm install -g pnpm
