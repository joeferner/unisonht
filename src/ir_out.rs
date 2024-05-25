use crate::remotes::{Key, Remotes};
use crate::{
    lirc::lirc_writer::LircWriter,
    my_error::{MyError, Result},
};
use std::{
    sync::mpsc,
    thread::{self, JoinHandle},
    time::Duration,
};

pub struct IrOutMessage {
    pub remote_name: String,
    pub key: Key,
}

pub struct IrOut {
    thread: JoinHandle<()>,
}

impl IrOut {
    pub fn start(
        rx: mpsc::Receiver<IrOutMessage>,
        mut writer: LircWriter,
        remotes: Remotes,
    ) -> Self {
        let mut remotes = Box::new(remotes);
        let thread = thread::spawn(move || loop {
            let mut remotes = remotes.as_mut();
            match Self::tick(&rx, &mut writer, &mut remotes) {
                Result::Ok(()) => {}
                Result::Err(err) => {
                    log::error!("failed to get power data {}", err);
                    thread::sleep(Duration::from_secs(5));
                }
            }
        });

        return IrOut { thread };
    }

    fn tick(
        rx: &mpsc::Receiver<IrOutMessage>,
        writer: &mut LircWriter,
        remotes: &mut Remotes,
    ) -> Result<()> {
        let message = rx.recv()?;
        remotes.send(writer, message.remote_name.as_str(), message.key)?;
        return Result::Ok(());
    }

    pub fn stop(self) -> Result<()> {
        self.thread
            .join()
            .map_err(|err| MyError::new(format!("failed to join thread {:?}", err)))?;
        return Result::Ok(());
    }
}
