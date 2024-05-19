use crate::{
    my_error::{MyError, Result},
    rc_devices::{enable_all_protocols, find_rc_device_lirc_dev_dir, get_rc_devices},
};

#[derive(Debug)]
pub struct Remotes {
    pub lirc_rx_device: String,
    pub lirc_tx_device: String,
}

pub fn find_remotes() -> Result<Remotes> {
    let rc_devices = get_rc_devices()?;
    let lirc_rx_device = find_rc_device_lirc_dev_dir(&rc_devices, "gpio_ir_recv", 0);
    let lirc_rx_device = lirc_rx_device.ok_or(MyError::new("could not find lirc rx device"))?;
    enable_all_protocols(&rc_devices, "gpio_ir_recv")?;

    let lirc_tx_device = find_rc_device_lirc_dev_dir(&rc_devices, "gpio-ir-tx", 0);
    let lirc_tx_device = lirc_tx_device.ok_or(MyError::new("could not find lirc tx device"))?;

    return Result::Ok(Remotes {
        lirc_rx_device,
        lirc_tx_device,
    });
}
