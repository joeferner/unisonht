use actix_web::{get, HttpResponse, Responder};

// created using https://github.com/remy/inliner
static SWAGGER_HTML: &str = include_str!("static/swagger.html");
static SWAGGER_JSON: &str = include_str!("static/swagger.json");

#[get("/swagger.html")]
pub async fn swagger_html() -> impl Responder {
    return HttpResponse::Ok()
        .content_type("text/html")
        .body(SWAGGER_HTML);
}

#[get("/swagger.json")]
pub async fn swagger_json() -> impl Responder {
    return HttpResponse::Ok()
        .content_type("application/json")
        .body(SWAGGER_JSON);
}
