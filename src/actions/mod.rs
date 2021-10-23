mod chain;
mod http;

use crate::actions::chain::run_chain_action;
use crate::actions::http::run_http_action;
use crate::models::config::ConfigAction;
use std::fmt;

#[derive(Debug)]
pub enum ActionError {
    InvalidAction(String),
    ExecuteFailed(String),
}

impl fmt::Display for ActionError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            ActionError::InvalidAction(err) => write!(f, "invalid action {}", err),
            ActionError::ExecuteFailed(err) => write!(f, "execute failed {}", err),
        }
    }
}

pub fn run_actions(actions: &Vec<ConfigAction>) -> Result<(), ActionError> {
    for action in actions {
        run_action(&action)?;
    }
    return Result::Ok(());
}

pub fn run_action(action: &ConfigAction) -> Result<(), ActionError> {
    return match action {
        ConfigAction::Http { method, url } => run_http_action(method, url),
        ConfigAction::Chain { actions } => run_chain_action(actions),
    };
}
