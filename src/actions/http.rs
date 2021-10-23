use crate::actions::ActionError;
use log::info;

static DEFAULT_METHOD: &str = "get";

pub fn run_http_action(method: &Option<String>, url: &str) -> Result<(), ActionError> {
    let default_method = DEFAULT_METHOD.to_string();
    let method = method.as_ref().unwrap_or(&default_method);
    info!("calling {} {}", method, url);
    let response = match method.as_ref() {
        "get" => ureq::get(url).call(),
        _ => {
            return Result::Err(ActionError::InvalidAction(format!(
                "unexpected http method: {}",
                method
            )))
        }
    };
    return match response {
        Result::Ok(_) => Result::Ok(()),
        Result::Err(err) => Result::Err(ActionError::ExecuteFailed(format!(
            "failed to call: {} {}: {}",
            method, url, err
        ))),
    };
}
