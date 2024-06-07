use std::{
    sync::{mpsc::Sender, Arc, Mutex},
    thread::{self, JoinHandle},
};

use crate::{
    my_error::{MyError, Result},
    power::RawPowerData,
    AppState, Message, Mode,
};
use local_ip_address::local_ip;
use serde;
use server_nano::{json, Server};

const INDEX_HTML: &str = include_str!("./html/index.html");

const PORT: u16 = 8080;

pub struct WebServer {}

pub struct WebServerStartResult {
    thread: JoinHandle<()>,
}

impl WebServer {
    pub fn start(state: Arc<Mutex<AppState>>, tx: Sender<Message>) -> Result<WebServerStartResult> {
        let thread = thread::spawn(move || {
            let mut app = Server::new();

            app.get("/", |_, res| res.send(INDEX_HTML));

            app.get("/state", move |_, res| {
                let s = state.lock().unwrap();
                let json = AppStateJson::new(&s);
                return res.json(&json);
            });

            app.post("/mode", move |req, res| {
                let json = req.json_body();
                match json {
                    Ok(json) => {
                        let mode = json.get("mode");
                        match mode {
                            Some(mode) => {
                                let new_mode = if mode == "on" {
                                    Mode::On
                                } else if mode == "off" {
                                    Mode::Off
                                } else {
                                    return res
                                        .status_code(400, "invalid json")
                                        .send("invalid mode");
                                };
                                if let Result::Err(err) = tx
                                    .send(Message::SetMode(new_mode))
                                    .map_err(|err| MyError::new(format!("send: {}", err)))
                                {
                                    log::error!("failed to set mode {}", err);
                                    return res
                                        .status_code(500, "internal server error")
                                        .send("could not set mode");
                                }
                                let json_res = json!({});
                                return res.json(&json_res);
                            }
                            None => {
                                return res.status_code(400, "invalid json").send("missing mode");
                            }
                        }
                    }
                    Err(_err) => {
                        return res.status_code(400, "invalid json").send("invalid json");
                    }
                }
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
