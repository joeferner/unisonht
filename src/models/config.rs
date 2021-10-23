use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fmt;
use std::fs::File;
use std::io::BufReader;

#[derive(Debug)]
pub enum ConfigError {
    ReadError(std::io::Error),
    ParseError(serde_yaml::Error),
}

impl fmt::Display for ConfigError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            ConfigError::ReadError(err) => write!(f, "read error: {}", err),
            ConfigError::ParseError(err) => write!(f, "parse error: {}", err),
        }
    }
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct Config {
    pub modes: HashMap<String, ConfigMode>,
    #[serde(default)]
    pub buttons: HashMap<String, ConfigActionsWrapper>,
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct ConfigMode {
    pub enter: Option<ConfigActionsWrapper>,
    pub exit: Option<ConfigActionsWrapper>,
    #[serde(default)]
    pub buttons: HashMap<String, ConfigActionsWrapper>,
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
pub struct ConfigActionsWrapper {
    pub actions: Vec<ConfigAction>,
}

#[derive(Debug, PartialEq, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum ConfigAction {
    #[serde(rename = "http")]
    Http { method: Option<String>, url: String },
    #[serde(rename = "chain")]
    Chain { actions: Vec<ConfigAction> },
}

impl Config {
    pub fn load(path: &str) -> Result<Config, ConfigError> {
        let file = File::open(path).map_err(|err| ConfigError::ReadError(err))?;
        let reader = BufReader::new(file);
        let config: Config =
            serde_yaml::from_reader(reader).map_err(|err| ConfigError::ParseError(err))?;
        return Result::Ok(config);
    }
}
