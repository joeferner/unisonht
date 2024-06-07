use std::sync::{mpsc, Arc, Mutex};
use std::thread;
use std::time::Duration;

use crate::ir_in::IrIn;
use crate::ir_out::{IrOut, IrOutMessage};
use crate::lirc::find_remotes;
use crate::lirc::lirc_reader::LircReader;
use crate::lirc::lirc_writer::LircWriter;
use crate::mcp3204::Mcp3204;
use crate::my_error::Result;
use crate::power::{Power, PowerOptions, State};
use crate::remotes::{Key, Remotes};
use crate::web_server::WebServer;
use circular_buffer::CircularBuffer;
use env_logger;
use lirc::LircEvent;
use my_error::MyError;
use power::{PowerData, RawPowerData};
use remotes::DecodeResult;
use rppal::gpio::Gpio;
use serde;

mod ioctl;
mod ir_in;
mod ir_out;
mod lirc;
mod mcp3204;
mod my_error;
mod power;
mod rc_devices;
mod remotes;
mod utils;
mod web_server;

#[derive(Debug, Eq, PartialEq, Clone, Copy, serde::Serialize)]
#[serde(rename_all_fields = "camelCase")]
pub enum Mode {
    Off,
    On,
}

pub enum Message {
    RawPowerData(RawPowerData),
    PowerData(PowerData),
    LircEvent(LircEvent),
    SetMode(Mode),
    Stop,
}

pub struct AppState {
    mode: Mode,
    raw_power_data: CircularBuffer<20, RawPowerData>,
}

struct Main {
    tx_ir: mpsc::Sender<IrOutMessage>,
    remotes: Remotes,
    state: Arc<Mutex<AppState>>,
}

impl Main {
    pub fn run() -> Result<()> {
        let env = env_logger::Env::default();
        env_logger::init_from_env(env);

        let (tx, rx) = mpsc::channel::<Message>();
        let (tx_ir, rx_ir) = mpsc::channel::<IrOutMessage>();

        let mcp3204 = Mcp3204::new()?;
        let power = Power::start(
            tx.clone(),
            mcp3204,
            PowerOptions {
                ch0_off: 5.0,
                ch0_on: 15.0,
                ch1_off: 1.0,
                ch1_on: 20.0,
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
        let ir_in = IrIn::start(tx.clone(), reader);
        let writer = LircWriter::new(remotes.lirc_tx_device)?;
        let ir_out = IrOut::start(rx_ir, writer, Remotes::new());

        let state = Arc::new(Mutex::new(AppState {
            mode: Mode::Off,
            raw_power_data: CircularBuffer::new(),
        }));
        let mut main = Main {
            tx_ir,
            remotes: Remotes::new(),
            state: state.clone(),
        };

        let web_server = WebServer::start(state, tx)?;

        loop {
            let m = rx.recv()?;
            match m {
                Message::Stop => break,
                Message::LircEvent(lirc_event) => {
                    main.handle_lirc_event(lirc_event)?;
                }
                Message::PowerData(power_data) => main.handle_power_data(power_data)?,
                Message::RawPowerData(raw_power_data) => {
                    main.handle_raw_power_data(raw_power_data)?
                }
                Message::SetMode(mode) => main.set_mode(mode)?,
            }
        }

        power.stop()?;
        ir_in.stop()?;
        ir_out.stop()?;
        web_server.stop()?;

        return Result::Ok(());
    }

    fn set_mode(&mut self, new_mode: Mode) -> Result<()> {
        let mut state = self.state.lock().unwrap();
        state.mode = new_mode;
        log::info!("new mode: {:?}", state.mode);
        return Result::Ok(());
    }

    fn send(&self, remote_name: &str, key: Key, can_timeout: bool) -> Result<()> {
        self.tx_ir
            .send(IrOutMessage::new(remote_name, key, can_timeout)?)
            .map_err(|err| MyError::new(format!("ir out send error: {}", err)))?;
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

    fn handle_raw_power_data(&mut self, raw_power_data: RawPowerData) -> Result<()> {
        let mut state = self.state.lock().unwrap();
        state.raw_power_data.push_back(raw_power_data);
        return Result::Ok(());
    }

    fn handle_lirc_event(&mut self, lirc_event: LircEvent) -> Result<()> {
        if let Option::Some(decode_result) = self.remotes.decode(lirc_event) {
            log::debug!("decode_results {:?}", decode_result);
            if decode_result.source == "rca" {
                let mode = { self.state.lock().unwrap().mode };
                match mode {
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
                if decode_result.repeat == 0 {
                    log::info!("powering on");
                    self.send("denon", Key::PowerOn, false)?;
                    self.send("pioneer", Key::PowerOn, false)?;

                    thread::sleep(Duration::from_secs(3));

                    self.send("denon", Key::InputTv, false)?;
                    self.send("pioneer", Key::Input5, false)?;

                    self.set_mode(Mode::On)?;
                    log::debug!("mode is now on");
                }
            }
            _ => {}
        }
        return Result::Ok(());
    }

    fn handle_lirc_event_mode_on(&mut self, decode_result: DecodeResult) -> Result<()> {
        match decode_result.key {
            Key::PowerToggle => {
                if decode_result.repeat == 0 {
                    log::info!("powering off");
                    self.send("denon", Key::PowerOff, false)?;
                    self.send("pioneer", Key::PowerOff, false)?;
                    self.set_mode(Mode::Off)?;
                    log::debug!("mode is now off");
                }
            }
            Key::VolumeUp => {
                if decode_result.repeat % 4 == 0 {
                    log::info!("volume up");
                    self.send("denon", Key::VolumeUp, true)?;
                }
            }
            Key::VolumeDown => {
                if decode_result.repeat % 4 == 0 {
                    log::info!("volume down");
                    self.send("denon", Key::VolumeDown, true)?;
                }
            }
            Key::Mute => {
                if decode_result.repeat == 0 {
                    log::info!("mute");
                    self.send("denon", Key::Mute, false)?;
                }
            }
            _ => {}
        }
        return Result::Ok(());
    }
}

fn main() {
    Main::run().unwrap();
}
