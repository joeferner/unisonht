use crate::actions::run_actions;
use crate::models::app_state::AppState;
use actix_web::{post, web, HttpResponse, Responder};
use log::{error, info};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct PressButtonResponse {}

#[post("/api/v1/button/{button_name}")]
pub async fn press_button(
    web::Path(button_name): web::Path<String>,
    data: web::Data<AppState>,
) -> impl Responder {
    info!("button press {}", button_name);
    return match data.get_button(&button_name) {
        Option::Some(button) => match run_actions(&button.actions) {
            Result::Ok(_) => HttpResponse::Ok().json(PressButtonResponse {}),
            Result::Err(err) => {
                error!("failed to press button {}: {}", button_name, err);
                HttpResponse::InternalServerError().finish()
            }
        },
        Option::None => HttpResponse::NotFound().finish(),
    };
}
