use salvo::prelude::*;
use tokio::task::JoinHandle;

use crate::my_error::Result;
use local_ip_address::local_ip;

const PORT: u16 = 8080;

pub struct WebServer {}

pub struct WebServerStartResult {
    thread: JoinHandle<()>,
}

#[handler]
async fn hello() -> &'static str {
    "Hello World"
}

impl WebServer {
    pub fn start() -> Result<WebServerStartResult> {
        let thread = tokio::spawn(async move {
            WebServer::run().await;
        });

        return Result::Ok(WebServerStartResult { thread });
    }

    async fn run() -> () {
        let my_local_ip = local_ip().unwrap();
        log::info!("starting web server http://{}:{}/", my_local_ip, PORT);
        let router = Router::new().get(hello);
        let acceptor = TcpListener::new(format!("0.0.0.0:{}", PORT)).bind().await;
        let server = Server::new(acceptor);
        server.serve(router).await;
    }
}

impl WebServerStartResult {
    pub fn stop(self) -> Result<()> {
        self.thread.abort();
        return Result::Ok(());
    }
}
