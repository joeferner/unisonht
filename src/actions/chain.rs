use crate::actions::run_action;
use crate::actions::ActionError;
use crate::models::config::ConfigAction;

pub fn run_chain_action(chain: &Vec<ConfigAction>) -> Result<(), ActionError> {
    for item in chain {
        run_action(item)?;
    }
    return Result::Ok(());
}
