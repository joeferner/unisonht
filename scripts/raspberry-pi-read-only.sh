#!/bin/bash
set -eou pipefail
DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd "${DIR}/.."

echo "setup read only fs..."
sudo raspi-config nonint enable_overlayfs
echo "read only fs setup complete..."

echo ""
echo "Any changes made to the file system will not be persistant and will reset on reboot"
echo ""
