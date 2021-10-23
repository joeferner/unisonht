use crate::AppState;
use actix_web::{get, web, HttpResponse, Responder};
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
