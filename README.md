# Development

## Raspberry Pi

1.  Write the latest "Raspberry Pi OS Lite" to an SD Card (enable SSH, SSH key authentication, and note the hostname)
1.  Start the Raspberry Pi, open a command prompt and `ping <hostname>.local`
1.  Open a terminal

        ssh <username>@<host>.local
        sudo apt -y install git
        # copy id_rsa from host computer
        chmod 600 ~/.ssh/id_rsa
        ssh-keygen -p -f ~/.ssh/id_rsa # remove password
        git clone git@github.com:joeferner/unisonht.git
        ./unisonht/scripts/raspberry-pi-setup.sh

1.  Install "Remote Development" extension pack for VSCode.
1.  Connect VSCode via ssh (Ctrl+Shift+P -> Remote-SSH: Connect to Host...) `<username>@<host>.local`

# Development

```
./scripts/start-dev.sh
```

# IR Remote Control

```
ir-keytable # find gpio_ir_recv and note the rcX and use it in the next command
ir-keytable -s rc1 -t -c -p all
```
