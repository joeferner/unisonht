use crate::lirc::find_remotes;
use crate::lirc::lirc_reader::LircReader;
use crate::lirc::lirc_writer::LircWriter;
use crate::mcp3204::Mcp3204;
use crate::my_error::Result;
use crate::remotes::{Key, Remotes};
use env_logger;

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
    log::debug!("mcp3204.read_single {}", mcp3204.read_single(0)?);
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
                        Mode::Off => {
                            remotes.send(&mut writer, "denon", Key::PowerOn)?;
                            remotes.send(&mut writer, "pioneer", Key::PowerOn)?;
                            mode = Mode::On;
                        }
                        Mode::On => {
                            remotes.send(&mut writer, "denon", Key::PowerOff)?;
                            remotes.send(&mut writer, "pioneer", Key::PowerOff)?;
                            mode = Mode::On;
                        }
                    }
                }
            }
        }
    }
}

fn main() {
    run().unwrap();
}
