use axum::{
    routing::any,
    Router,
    response::IntoResponse,
    http::{StatusCode, Uri, Request, HeaderMap},
    body::Body,
};
use std::net::SocketAddr;
use reqwest::Client;
use std::env;
use tower_http::cors::{CorsLayer, Any};


#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    // In a real scenario, we might use tower-http for more complex proxy/rewrite
    let app = Router::new()
        .route("/health", any(health_check))
        .route("/api/*path", any(proxy_api)) // Forward to Rails
        .route("/ai/*path", any(proxy_ai))   // Forward to AI
        .fallback(any(proxy_api)) // Forward everything else to Rails API
        .layer(CorsLayer::new()
            .allow_origin(Any)
            .allow_methods(Any)
            .allow_headers(Any));

    let port = env::var("PORT").unwrap_or_else(|_| "8000".to_string());
    let addr_str = format!("0.0.0.0:{}", port);
    let addr: SocketAddr = addr_str.parse().expect("Invalid address");
    println!("Edge Gateway listening on {}", addr);
    
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn health_check() -> impl IntoResponse {
    (StatusCode::OK, "Edge Gateway Operational")
}

// Real proxy handler for API
async fn proxy_api(mut req: Request<Body>) -> impl IntoResponse {
    let client = match Client::builder().build() {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to create HTTP client: {}", e)).into_response(),
    };
    let path = req.uri().path();
    let query = req.uri().query().map(|q| format!("?{}", q)).unwrap_or_default();
    
    // Get upstream URL from env
    let api_base = env::var("API_URL").unwrap_or_else(|_| "http://api:3000".to_string());
    let target_url = format!("{}{}", api_base, path); 
    
    let (parts, body) = req.into_parts();
    let method = parts.method;
    let headers = parts.headers;
    
    // Convert axum body to reqwest body
    let body_bytes = axum::body::to_bytes(body, usize::MAX).await.unwrap_or_default();

    let resp = client.request(method, target_url + &query)
        .headers(headers)
        .body(body_bytes)
        .send()
        .await;

    match resp {
        Ok(res) => {
            let status = res.status();
            let headers = res.headers().clone();
            let bytes = res.bytes().await.unwrap_or_default();
            
            // Build Axum response
            let mut builder = axum::http::Response::builder().status(status);
            if let Some(h) = builder.headers_mut() {
                *h = headers;
            }
            builder.body(Body::from(bytes)).unwrap_or_else(|e| {
                (StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to build response body: {}", e)).into_response()
            })
        },
        Err(e) => {
            (StatusCode::BAD_GATEWAY, format!("Proxy Error: {}", e)).into_response()
        }
    }
}


// Real proxy handler for AI
async fn proxy_ai(mut req: Request<Body>) -> impl IntoResponse {
    let client = match Client::builder().build() {
        Ok(c) => c,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to create HTTP client: {}", e)).into_response(),
    };
    let path = req.uri().path(); // e.g. /ai/predict
    
    let path_no_prefix = if path.starts_with("/ai") {
        &path[3..]
    } else {
        path
    };
    let query = req.uri().query().map(|q| format!("?{}", q)).unwrap_or_default();
    
    // Get upstream URL from env
    let ai_base = env::var("AI_URL").unwrap_or_else(|_| "http://ai:5000".to_string());
    let target_url = format!("{}{}", ai_base, path_no_prefix); 
    
    let (parts, body) = req.into_parts();
    let method = parts.method;
    let headers = parts.headers;
    let body_bytes = axum::body::to_bytes(body, usize::MAX).await.unwrap_or_default();

    let resp = client.request(method, target_url + &query)
        .headers(headers)
        .body(body_bytes)
        .send()
        .await;

    match resp {
        Ok(res) => {
            let status = res.status();
            let headers = res.headers().clone();
            let bytes = res.bytes().await.unwrap_or_default();
            let mut builder = axum::http::Response::builder().status(status);
            if let Some(h) = builder.headers_mut() {
                *h = headers;
            }
            builder.body(Body::from(bytes)).unwrap_or_else(|e| {
                (StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to build response body: {}", e)).into_response()
            })
        },
        Err(e) => {
            (StatusCode::BAD_GATEWAY, format!("AI Proxy Error: {}", e)).into_response()
        }
    }
}
