use crate::models::app_state::{AppState, AppStateError};
use actix_web::{get, post, web, HttpResponse, Responder};
use log::error;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct GetModeResponse {
    mode: String,
}

#[get("/api/v1/mode")]
pub async fn get_mode(data: web::Data<AppState>) -> impl Responder {
    return HttpResponse::Ok().json(GetModeResponse {
        mode: data.get_mode(),
    });
}

#[derive(Serialize, Deserialize)]
pub struct SetModeResponse {
    #[serde(rename = "previousMode")]
    previous_mode: String,
    mode: String,
}

#[post("/api/v1/mode/{mode_name}")]
pub async fn switch_mode(
    web::Path(mode_name): web::Path<String>,
    data: web::Data<AppState>,
) -> impl Responder {
    let previous_mode = data.get_mode();
    return match data.switch_mode(&mode_name) {
        Result::Ok(mode) => HttpResponse::Ok().json(SetModeResponse {
            previous_mode,
            mode,
        }),
        Result::Err(err) => {
            error!("failed to switch mode {}: {}", mode_name, err);
            match err {
                AppStateError::InvalidMode(_mode) => HttpResponse::NotFound().finish(),
                _ => HttpResponse::InternalServerError().finish(),
            }
        }
    };
}
