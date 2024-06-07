use std::{
    sync::{Arc, Mutex},
    thread::{self, JoinHandle},
};

use crate::{
    my_error::{MyError, Result},
    power::RawPowerData,
    AppState, Mode,
};
use local_ip_address::local_ip;
use serde;
use server_nano::Server;

const INDEX_HTML: &str = include_str!("./html/index.html");

const PORT: u16 = 8080;

pub struct WebServer {}

pub struct WebServerStartResult {
    thread: JoinHandle<()>,
}

impl WebServer {
    pub fn start(state: Arc<Mutex<AppState>>) -> Result<WebServerStartResult> {
        let thread = thread::spawn(move || {
            let mut app = Server::new();

            app.get("/", |_, res| res.send(INDEX_HTML));
            app.get("/state", move |_, res| {
                let s = state.lock().unwrap();
                let json = AppStateJson::new(&s);
                return res.json(&json);
            });

            let my_local_ip = local_ip().unwrap();
            log::info!("starting web server http://{}:{}/", my_local_ip, PORT);
            app.listen(format!("0.0.0.0:{}", PORT).as_str()).unwrap();
        });

        return Result::Ok(WebServerStartResult { thread });
    }
}

impl WebServerStartResult {
    pub fn stop(self) -> Result<()> {
        self.thread
            .join()
            .map_err(|err| MyError::new(format!("failed to join thread {:?}", err)))?;
        return Result::Ok(());
    }
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct AppStateJson {
    mode: Mode,
    raw_power_data: Vec<RawPowerData>,
}

impl AppStateJson {
    pub fn new(state: &AppState) -> Self {
        return AppStateJson {
            mode: state.mode,
            raw_power_data: Vec::from_iter(state.raw_power_data.iter().map(|d| d.clone())),
        };
    }
}
