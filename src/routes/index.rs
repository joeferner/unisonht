use actix_web::{get, HttpResponse, Responder};

static INDEX_HTML: &str = include_str!("static/index.html");

#[get("/")]
pub async fn index_html() -> impl Responder {
    return HttpResponse::Ok()
        .content_type("text/html")
        .body(INDEX_HTML);
}
