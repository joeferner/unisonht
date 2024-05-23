use crate::mcp3204::Mcp3204;
use crate::my_error::{MyError, Result};
use crate::utils::running_max::RunningMax;
use std::sync::mpsc;
use std::thread::{self, JoinHandle};
use std::time::Duration;

const REF: i32 = 2048;
const RUNNING_MAX_WINDOW: usize = 20;

#[derive(Debug)]
pub struct PowerData {
    pub ch0: u32,
    pub ch1: u32,
}

pub struct PowerReceiver {
    pub rx: mpsc::Receiver<PowerData>,
    thread: JoinHandle<()>,
}

pub struct Power {
    mcp3204: Mcp3204,
    tx: mpsc::Sender<PowerData>,
    ch0_max: RunningMax,
    ch1_max: RunningMax,
}

impl Power {
    pub fn start(mcp3204: Mcp3204) -> PowerReceiver {
        let (tx, rx) = mpsc::channel();
        let mut power = Power {
            mcp3204,
            tx,
            ch0_max: RunningMax::new(RUNNING_MAX_WINDOW),
            ch1_max: RunningMax::new(RUNNING_MAX_WINDOW),
        };

        let thread = thread::spawn(move || loop {
            match power.tick() {
                Result::Ok(()) => thread::sleep(Duration::from_millis(100)),
                Result::Err(err) => {
                    log::error!("failed to get power data {}", err);
                    thread::sleep(Duration::from_secs(5));
                }
            }
        });

        let result = PowerReceiver { rx, thread };
        return result;
    }

    fn tick(&mut self) -> Result<()> {
        let ch0 = i32::try_from(self.mcp3204.read_single(0)?)? - REF;
        self.ch0_max.push(u32::try_from(ch0.abs())?);
        let ch1 = i32::try_from(self.mcp3204.read_single(1)?)? - REF;
        self.ch1_max.push(u32::try_from(ch1.abs())?);

        let power_data = PowerData {
            ch0: self.ch0_max.max(),
            ch1: self.ch1_max.max(),
        };
        self.tx
            .send(power_data)
            .map_err(|err| MyError::new(format!("send error: {}", err)))?;

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
