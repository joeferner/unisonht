use crate::actions::run_actions;
use crate::actions::ActionError;
use crate::Config;
use log::{error, info};
use std::fmt;
use std::process;
use std::sync::Arc;
use std::sync::Mutex;

#[derive(Debug)]
pub enum AppStateError {
    InvalidMode(String),
    ActionError(ActionError),
}

impl fmt::Display for AppStateError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            AppStateError::InvalidMode(err) => write!(f, "invalid mode: {}", err),
            AppStateError::ActionError(err) => write!(f, "action error: {}", err),
        }
    }
}

#[derive(Clone)]
pub struct AppState {
    config: Arc<Config>,
    mode: Arc<Mutex<String>>,
}

impl AppState {
    pub fn new(config: Arc<Config>) -> AppState {
        return AppState {
            config,
            mode: Arc::new(Mutex::new("off".to_string())),
        };
    }

    pub fn get_mode(&self) -> String {
        let mode = self.mode.lock().unwrap_or_else(|err| {
            error!("mode lock poisoned {}", err);
            process::exit(1);
        });
        return mode.clone();
    }

    pub fn switch_mode(&self, mode_name: &str) -> Result<String, AppStateError> {
        let mut state_mode = self.mode.lock().unwrap_or_else(|err| {
            error!("mode lock poisoned {}", err);
            process::exit(1);
        });
        info!("switching mode {} -> {}", state_mode, mode_name);
        let current_mode = self
            .config
            .modes
            .get(&state_mode.to_owned())
            .ok_or_else(|| AppStateError::InvalidMode(state_mode.to_owned()))?;
        let new_mode = self
            .config
            .modes
            .get(&mode_name.to_owned())
            .ok_or_else(|| AppStateError::InvalidMode(mode_name.to_owned()))?;

        if let Option::Some(w) = &current_mode.exit {
            info!("running exit actions (mode {})", state_mode);
            run_actions(&w.actions).map_err(|err| AppStateError::ActionError(err))?;
        }
        if let Option::Some(w) = &new_mode.enter {
            info!("running enter actions (mode {})", mode_name);
            run_actions(&w.actions).map_err(|err| AppStateError::ActionError(err))?;
        }

        *state_mode = mode_name.to_owned();
        info!("mode switched to {}", mode_name);
        return Result::Ok(state_mode.to_owned());
    }
}
