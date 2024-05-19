use crate::{
    my_error::{MyError, Result},
    rc_devices::{enable_all_protocols, find_rc_device_lirc_dev_dir, get_rc_devices},
};
use nix::{
    ioc,
    sys::ioctl::{READ, WRITE},
};
use num_derive::FromPrimitive;

pub mod lirc_reader;
pub mod lirc_writer;

pub const SCAN_CODE_SIZE: usize = (64 + 16 + 16 + 32 + 64) / 8;

#[derive(Debug, Clone)]
pub struct LircEvent {
    pub timestamp: u64,
    pub flags: u16,
    pub rc_protocol: u16,
    pub keycode: u32,
    pub scan_code: u64,
}

#[derive(FromPrimitive)]
pub enum LircIoCtlCommand {
    GetFeatures = ioc!(READ, 'i', 0x00000000, 4) as isize,
    SetSendMode = ioc!(WRITE, 'i', 0x00000011, 4) as isize,
    SetReceiveMode = ioc!(WRITE, 'i', 0x00000012, 4) as isize,
    SetReceiveCarrier = ioc!(WRITE, 'i', 0x00000014, 4) as isize,
    SetReceiveCarrierRange = ioc!(WRITE, 'i', 0x0000001f, 4) as isize,
}

#[derive(FromPrimitive)]
pub enum LircMode {
    Raw = 0x00000001,
    Pulse = 0x00000002,
    Mode2 = 0x00000004,
    ScanCode = 0x00000008,
    LIRCCode = 0x00000010,
}

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
