use std::thread::{self, JoinHandle};

use crate::my_error::{MyError, Result};
use local_ip_address::local_ip;
use server_nano::Server;

const PORT: u16 = 8080;

pub struct WebServer {}

pub struct WebServerStartResult {
    thread: JoinHandle<()>,
}

impl WebServer {
    pub fn start() -> Result<WebServerStartResult> {
        let thread = thread::spawn(move || {
            let mut app = Server::new();

            app.get("/", |_, res| res.send("hello"));

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
