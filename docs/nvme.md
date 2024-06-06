# Raspberry Pi NVMe

See [NVMe SSD Boot Raspberry Pi 5](https://www.jeffgeerling.com/blog/2023/nvme-ssd-boot-raspberry-pi-5) but essentially do the following.

- Write image to NVMe drive using Raspberry Pi Imager
- Add the following to the end of `/boot/firmware/config.txt`

      dtparam=pciex1
      dtoverlay=disable-wifi
      dtoverlay=disable-bt
      config_hdmi_boost=9

- Add the following to the end of `/boot/firmware/cmdline.txt`

      pcie_aspm=off

- Boot from SDCard and run `sudo rpi-eeprom-config --edit` change

      BOOT_ORDER=0xf416
      PCIE_PROBE=1
