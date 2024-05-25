use std::sync::mpsc;
use std::thread;
use std::time::Duration;

use crate::ir_in::IrIn;
use crate::lirc::find_remotes;
use crate::lirc::lirc_reader::LircReader;
use crate::lirc::lirc_writer::LircWriter;
use crate::mcp3204::Mcp3204;
use crate::my_error::Result;
use crate::power::{Power, PowerOptions, State};
use crate::remotes::{Key, Remotes};
use env_logger;
use lirc::LircEvent;
use power::PowerData;
use remotes::DecodeResult;
use rppal::gpio::Gpio;

mod ioctl;
mod ir_in;
mod lirc;
mod mcp3204;
mod my_error;
mod power;
mod rc_devices;
mod remotes;
mod utils;

#[derive(Debug, Eq, PartialEq, Clone, Copy)]
enum Mode {
    Off,
    On,
}

pub enum Message {
    PowerData(PowerData),
    LircEvent(LircEvent),
    Stop,
}

struct Main {
    mode: Mode,
    remotes: Remotes,
    writer: LircWriter,
}

impl Main {
    pub fn run() -> Result<()> {
        let env = env_logger::Env::default();
        env_logger::init_from_env(env);

        let (tx, rx) = mpsc::channel::<Message>();

        let mcp3204 = Mcp3204::new()?;
        let power = Power::start(
            tx.clone(),
            mcp3204,
            PowerOptions {
                ch0_off: 5.0,
                ch0_on: 15.0,
                ch1_off: 1.0,
                ch1_on: 2.0,
            },
        );

        let gpio = Gpio::new()?;

        let mut pin_ir_out_pol = gpio.get(23)?.into_output();
        let mut pin_ir_in_pol = gpio.get(25)?.into_output();
        pin_ir_out_pol.set_low();
        pin_ir_in_pol.set_low();

        let remotes = find_remotes()?;
        log::debug!("remotes {:#?}", remotes);
        let reader = LircReader::new(remotes.lirc_rx_device)?;
        let ir_in = IrIn::start(tx, reader);
        let writer = LircWriter::new(remotes.lirc_tx_device)?;
        let remotes = Remotes::new();

        let mut main = Main {
            remotes,
            mode: Mode::Off,
            writer,
        };

        loop {
            let m = rx.recv()?;
            match m {
                Message::Stop => break,
                Message::LircEvent(lirc_event) => {
                    main.handle_lirc_event(lirc_event)?;
                }
                Message::PowerData(power_data) => main.handle_power_data(power_data)?,
            }
        }

        power.stop()?;
        ir_in.stop()?;

        return Result::Ok(());
    }

    fn set_mode(&mut self, new_mode: Mode) -> Result<()> {
        self.mode = new_mode;
        log::info!("new mode: {:?}", self.mode);
        return Result::Ok(());
    }

    fn handle_power_data(&mut self, power_data: PowerData) -> Result<()> {
        log::debug!("power data {:?}", power_data);
        if power_data.ch0_state == State::On {
            self.set_mode(Mode::On)?;
        } else {
            self.set_mode(Mode::Off)?;
        }
        return Result::Ok(());
    }

    fn handle_lirc_event(&mut self, lirc_event: LircEvent) -> Result<()> {
        if let Option::Some(decode_result) = self.remotes.decode(lirc_event) {
            log::debug!("decode_results {:?}", decode_result);
            if decode_result.source == "rca" && decode_result.repeat == 0 {
                match self.mode {
                    Mode::Off => self.handle_lirc_event_mode_off(decode_result)?,
                    Mode::On => self.handle_lirc_event_mode_on(decode_result)?,
                }
            }
        }
        return Result::Ok(());
    }

    fn handle_lirc_event_mode_off(&mut self, decode_result: DecodeResult) -> Result<()> {
        match decode_result.key {
            Key::PowerToggle => {
                self.remotes.send(&mut self.writer, "denon", Key::PowerOn)?;
                self.remotes
                    .send(&mut self.writer, "pioneer", Key::PowerOn)?;

                thread::sleep(Duration::from_secs(3));

                self.remotes.send(&mut self.writer, "denon", Key::InputTv)?;
                self.remotes
                    .send(&mut self.writer, "pioneer", Key::Input5)?;

                self.set_mode(Mode::On)?;
                log::debug!("mode is now on");
            }
            _ => {}
        }
        return Result::Ok(());
    }

    fn handle_lirc_event_mode_on(&mut self, decode_result: DecodeResult) -> Result<()> {
        match decode_result.key {
            Key::PowerToggle => {
                self.remotes
                    .send(&mut self.writer, "denon", Key::PowerOff)?;
                self.remotes
                    .send(&mut self.writer, "pioneer", Key::PowerOff)?;
                self.set_mode(Mode::Off)?;
                log::debug!("mode is now off");
            }
            Key::VolumeUp => {
                self.remotes
                    .send(&mut self.writer, "denon", Key::VolumeUp)?;
            }
            Key::VolumeDown => {
                self.remotes
                    .send(&mut self.writer, "denon", Key::VolumeDown)?;
            }
            Key::Mute => {
                self.remotes.send(&mut self.writer, "denon", Key::Mute)?;
            }
            _ => {}
        }
        return Result::Ok(());
    }
}

fn main() {
    Main::run().unwrap();
}
