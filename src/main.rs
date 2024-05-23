use std::thread;
use std::time::Duration;

use crate::lirc::find_remotes;
use crate::lirc::lirc_reader::LircReader;
use crate::lirc::lirc_writer::LircWriter;
use crate::mcp3204::Mcp3204;
use crate::my_error::Result;
use crate::remotes::{Key, Remotes};
use env_logger;
use rppal::gpio::Gpio;

mod ioctl;
mod lirc;
mod mcp3204;
mod my_error;
mod rc_devices;
mod remotes;

enum Mode {
    Off,
    On,
}

fn run() -> Result<()> {
    let env = env_logger::Env::default();
    env_logger::init_from_env(env);

    let mut mode = Mode::Off;

    let mcp3204 = Mcp3204::new()?;
    let gpio = Gpio::new()?;

    for _i in 0..100 {
        let v = i32::try_from(mcp3204.read_single(0)?)? - 2048;
        log::debug!("mcp3204.read_single {}", v);
        thread::sleep(Duration::from_millis(100));
    }

    let mut pin_ir_out_pol = gpio.get(23)?.into_output();
    let mut pin_ir_in_pol = gpio.get(25)?.into_output();
    pin_ir_out_pol.set_low();
    pin_ir_in_pol.set_low();

    let remotes = find_remotes()?;
    log::debug!("remotes {:#?}", remotes);
    let mut reader = LircReader::new(remotes.lirc_rx_device)?;
    let mut writer = LircWriter::new(remotes.lirc_tx_device)?;
    let mut remotes = Remotes::new();

    loop {
        for new_event in reader.read()? {
            if let Option::Some(decode_result) = remotes.decode(new_event) {
                log::debug!("decode_results {:?}", decode_result);
                if decode_result.source == "rca" && decode_result.repeat == 0 {
                    match mode {
                        Mode::Off => match decode_result.key {
                            Key::PowerToggle => {
                                remotes.send(&mut writer, "denon", Key::PowerOn)?;
                                remotes.send(&mut writer, "pioneer", Key::PowerOn)?;
                                mode = Mode::On;
                                log::debug!("mode is now on");
                            }
                            _ => {}
                        },
                        Mode::On => match decode_result.key {
                            Key::PowerToggle => {
                                remotes.send(&mut writer, "denon", Key::PowerOff)?;
                                remotes.send(&mut writer, "pioneer", Key::PowerOff)?;
                                mode = Mode::Off;
                                log::debug!("mode is now off");
                            }
                            Key::VolumeUp => {
                                remotes.send(&mut writer, "denon", Key::VolumeUp)?;
                            }
                            Key::VolumeDown => {
                                remotes.send(&mut writer, "denon", Key::VolumeDown)?;
                            }
                            Key::Mute => {
                                remotes.send(&mut writer, "denon", Key::Mute)?;
                            }
                            _ => {}
                        },
                    }
                }
            }
        }
    }
}

fn main() {
    run().unwrap();
}
