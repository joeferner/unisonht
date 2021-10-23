mod actions;
mod models;
mod routes;

use crate::models::config::Config;
use crate::routes::button::press_button;
use actix_web::{App, HttpServer};
use log::info;
use models::app_state::AppState;
use routes::index::index_html;
use routes::mode::{get_mode, switch_mode};
use routes::swagger::{swagger_html, swagger_json};
use simple_logger::SimpleLogger;
use std::env;
use std::process;
use std::sync::Arc;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    SimpleLogger::new().init().unwrap();

    let config_path = env::var("CONFIG").unwrap_or_else(|_| {
        eprintln!("missing CONFIG environment variable");
        process::exit(1);
    });
    let config = Arc::new(Config::load(&config_path).unwrap_or_else(|err| {
        eprintln!("failed to parse config \"{}\": {}", config_path, err);
        process::exit(1);
    }));

    let bind = format!(
        "{}:{}",
        env::var("HOST").unwrap_or("0.0.0.0".to_string()),
        env::var("PORT").unwrap_or("8080".to_string())
    );
    let http = HttpServer::new(move || {
        let data = AppState::new(config.clone());
        App::new()
            .data(data)
            .service(index_html)
            .service(swagger_html)
            .service(swagger_json)
            .service(get_mode)
            .service(switch_mode)
            .service(press_button)
    })
    .bind(bind.clone())?
    .run();
    info!("listening http://{}", bind);
    return http.await;
}
