mod models;
mod routes;

use actix_web::{App, HttpServer};
use models::app_state::AppState;
use routes::index::index_html;
use routes::mode::get_mode;
use routes::swagger::{swagger_html, swagger_json};
use simple_logger::SimpleLogger;
use std::env;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    SimpleLogger::new().init().unwrap();

    let bind = format!(
        "{}:{}",
        env::var("HOST").unwrap_or("0.0.0.0".to_string()),
        env::var("PORT").unwrap_or("8080".to_string())
    );
    let http = HttpServer::new(|| {
        let data = AppState::new();
        App::new()
            .data(data)
            .service(index_html)
            .service(swagger_html)
            .service(swagger_json)
            .service(get_mode)
    })
    .bind(bind.clone())?
    .run();
    println!("listening http://{}", bind);
    return http.await;
}
