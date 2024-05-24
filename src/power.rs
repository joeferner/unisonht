use crate::mcp3204::Mcp3204;
use crate::my_error::{MyError, Result};
use crate::utils::stats_list::StatsList;
use std::sync::mpsc;
use std::thread::{self, JoinHandle};
use std::time::Duration;

const RUNNING_MAX_WINDOW: usize = 100;

#[derive(Debug)]
pub struct PowerData {
    pub ch0: f64,
    pub ch0_state: bool,
    pub ch1: f64,
    pub ch1_state: bool,
}

pub struct PowerOptions {
    pub ch0_off: f64,
    pub ch0_on: f64,
    pub ch1_off: f64,
    pub ch1_on: f64,
}

pub struct PowerReceiver {
    pub rx: mpsc::Receiver<PowerData>,
    thread: JoinHandle<()>,
}

pub struct Power {
    mcp3204: Mcp3204,
    tx: mpsc::Sender<PowerData>,
    ch0_prev_state: Option<bool>,
    ch1_prev_state: Option<bool>,
    ch0: StatsList<RUNNING_MAX_WINDOW>,
    ch1: StatsList<RUNNING_MAX_WINDOW>,
}

impl Power {
    pub fn start(mcp3204: Mcp3204, options: PowerOptions) -> PowerReceiver {
        let (tx, rx) = mpsc::channel();
        let mut power = Power {
            mcp3204,
            tx,
            ch0_prev_state: Option::None,
            ch1_prev_state: Option::None,
            ch0: StatsList::new(),
            ch1: StatsList::new(),
        };

        let thread = thread::spawn(move || loop {
            match power.tick(&options) {
                Result::Ok(()) => thread::sleep(Duration::from_millis(10)),
                Result::Err(err) => {
                    log::error!("failed to get power data {}", err);
                    thread::sleep(Duration::from_secs(5));
                }
            }
        });

        let result = PowerReceiver { rx, thread };
        return result;
    }

    fn calculate_new_state(
        &self,
        prev_state: Option<bool>,
        stddev: f64,
        on: f64,
        off: f64,
    ) -> bool {
        if prev_state.is_none() {
            return stddev > on;
        }
        if prev_state.unwrap_or(true) {
            return stddev > off;
        }
        return stddev > on;
    }

    fn tick(&mut self, options: &PowerOptions) -> Result<()> {
        let ch0 = self.mcp3204.read_single(0)?;
        self.ch0.push(f64::from(ch0));
        let ch1 = self.mcp3204.read_single(1)?;
        self.ch1.push(f64::from(ch1));

        let ch0_stddev = self.ch0.stddev().unwrap_or(0.0);
        let new_ch0_state = self.calculate_new_state(
            self.ch0_prev_state,
            ch0_stddev,
            options.ch0_on,
            options.ch0_off,
        );

        let ch1_stddev = self.ch1.stddev().unwrap_or(0.0);
        let new_ch1_state = self.calculate_new_state(
            self.ch1_prev_state,
            ch1_stddev,
            options.ch1_on,
            options.ch1_off,
        );

        if (self.ch0_prev_state.is_none() || new_ch0_state != self.ch0_prev_state.unwrap_or(false))
            || (self.ch1_prev_state.is_none()
                || new_ch1_state != self.ch1_prev_state.unwrap_or(false))
        {
            let power_data = PowerData {
                ch0: ch0_stddev,
                ch0_state: new_ch0_state,
                ch1: ch1_stddev,
                ch1_state: new_ch1_state,
            };
            self.ch0_prev_state = Option::Some(new_ch0_state);
            self.ch1_prev_state = Option::Some(new_ch1_state);

            self.tx
                .send(power_data)
                .map_err(|err| MyError::new(format!("send error: {}", err)))?;
        }

        return Result::Ok(());
    }
}

impl PowerReceiver {
    pub fn stop(self) -> Result<()> {
        self.thread
            .join()
            .map_err(|err| MyError::new(format!("failed to join thread {:?}", err)))?;
        return Result::Ok(());
    }
}
