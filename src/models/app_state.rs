use log::error;
use std::fmt;
use std::process;
use std::sync::Arc;
use std::sync::Mutex;

#[derive(Debug)]
pub enum AppStateError {
    LockError(String),
}

impl fmt::Display for AppStateError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            AppStateError::LockError(err) => write!(f, "lock error: {}", err),
        }
    }
}

#[derive(Clone)]
pub struct AppState {
    mode: Arc<Mutex<String>>,
}

impl AppState {
    pub fn new() -> AppState {
        return AppState {
            mode: Arc::new(Mutex::new("off".to_string())),
        };
    }

    pub fn get_mode(&self) -> String {
        match self.mode.lock() {
            Result::Err(err) => {
                error!("mode lock poisoned {}", err);
                process::exit(1);
            }
            Result::Ok(mode) => {
                return mode.clone();
            }
        }
    }
}
