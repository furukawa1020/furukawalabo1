use axum::{
    routing::any,
    Router,
    response::IntoResponse,
    http::{StatusCode, Uri, Request, HeaderMap},
    body::Body,
};
use std::net::SocketAddr;
use reqwest::Client;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    // In a real scenario, we might use tower-http for more complex proxy/rewrite
    let app = Router::new()
        .route("/health", any(health_check))
        .route("/api/*path", any(proxy_api)) // Forward to Rails
        .route("/ai/*path", any(proxy_ai))   // Forward to AI
        .fallback(proxy_web); // Forward everything else to Web

    let addr = SocketAddr::from(([0, 0, 0, 0], 8000));
    println!("Edge Gateway listening on {}", addr);
    
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn health_check() -> impl IntoResponse {
    (StatusCode::OK, "Edge Gateway Operational")
}

// Real proxy handler for API
async fn proxy_api(mut req: Request<Body>) -> impl IntoResponse {
    let client = Client::new();
    let path = req.uri().path();
    let query = req.uri().query().map(|q| format!("?{}", q)).unwrap_or_default();
    
    // Assume API is on proper host/port in Docker network.
    // In docker-compose, service name is "api", internal port 3000 (Rails default usually 3000)
    // IMPORTANT: Make sure `api` service is actually listening on 3000 inside container.
    let target_url = format!("http://api:3000{}", path); 
    
    let (parts, body) = req.into_parts();
    let method = parts.method;
    let headers = parts.headers;
    
    // Convert axum body to reqwest body
    let body_bytes = axum::body::to_bytes(body, usize::MAX).await.unwrap_or_default();

    let resp = client.request(method, &target_url + &query)
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
            *builder.headers_mut().unwrap() = headers;
            builder.body(Body::from(bytes)).unwrap()
        },
        Err(e) => {
            (StatusCode::BAD_GATEWAY, format!("Proxy Error: {}", e)).into_response()
        }
    }
}

async fn proxy_web(req: Request<Body>) -> impl IntoResponse {
    let client = Client::new();
    let path = req.uri().path();
    let query = req.uri().query().map(|q| format!("?{}", q)).unwrap_or_default();
    let target_url = format!("http://web:80{}{}", path, query);
    
    let (parts, body) = req.into_parts();
    let method = parts.method;
    let headers = parts.headers;
    let body_bytes = axum::body::to_bytes(body, usize::MAX).await.unwrap_or_default();

    let resp = client.request(method, target_url)
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
            *builder.headers_mut().unwrap() = headers;
            builder.body(Body::from(bytes)).unwrap()
        },
        Err(e) => {
            (StatusCode::BAD_GATEWAY, format!("Proxy Error: {}", e)).into_response()
        }
    }
}

// Real proxy handler for AI
async fn proxy_ai(mut req: Request<Body>) -> impl IntoResponse {
    let client = Client::new();
    let path = req.uri().path(); // e.g. /ai/predict
    // Strip /ai prefix if needed? usually services expect their own root, or we keep it.
    // For simplicity, we forward as is, assuming AI service handles /ai/xxx or we rewrite.
    // Let's rewrite: /ai/foo -> /foo
    let path_no_prefix = if path.starts_with("/ai") {
        &path[3..]
    } else {
        path
    };
    let query = req.uri().query().map(|q| format!("?{}", q)).unwrap_or_default();
    
    // AI service is on port 5000
    let target_url = format!("http://ai:5000{}", path_no_prefix); 
    
    let (parts, body) = req.into_parts();
    let method = parts.method;
    let headers = parts.headers;
    let body_bytes = axum::body::to_bytes(body, usize::MAX).await.unwrap_or_default();

    let resp = client.request(method, &target_url + &query)
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
            *builder.headers_mut().unwrap() = headers;
            builder.body(Body::from(bytes)).unwrap()
        },
        Err(e) => {
            (StatusCode::BAD_GATEWAY, format!("AI Proxy Error: {}", e)).into_response()
        }
    }
}
