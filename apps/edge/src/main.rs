use axum::{
    routing::any,
    Router,
    response::IntoResponse,
    http::{StatusCode, Request},
    body::Body,
    extract::State,
};
use reqwest::Client;
use std::{env, net::SocketAddr, sync::Arc};
use tower_http::cors::{CorsLayer, Any};
use tower_http::trace::TraceLayer;

/// Shared application state — one HTTP client reused across all requests.
/// reqwest::Client manages a connection pool internally; creating one per
/// request (the previous behaviour) wastes connections and defeats keep-alive.
#[derive(Clone)]
struct AppState {
    client: Arc<Client>,
    api_url: String,
    ai_url: String,
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "edge=info,tower_http=info".into()),
        )
        .init();

    let api_url = env::var("API_URL").unwrap_or_else(|_| {
        tracing::warn!("API_URL not set, falling back to http://api:3000");
        "http://api:3000".to_string()
    });
    let ai_url = env::var("AI_URL").unwrap_or_else(|_| {
        tracing::warn!("AI_URL not set, falling back to http://ai:5000");
        "http://ai:5000".to_string()
    });

    let client = Client::builder()
        .redirect(reqwest::redirect::Policy::none())
        .timeout(std::time::Duration::from_secs(30))
        .build()
        .expect("Failed to build HTTP client");

    let state = AppState {
        client: Arc::new(client),
        api_url: api_url.trim_end_matches('/').to_string(),
        ai_url: ai_url.trim_end_matches('/').to_string(),
    };

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/health", any(health_check))
        .route("/api/*path", any(proxy_api))
        .route("/ai/*path", any(proxy_ai))
        .fallback(any(proxy_api))
        .layer(cors)
        .layer(TraceLayer::new_for_http())
        .with_state(state);

    let port = env::var("PORT").unwrap_or_else(|_| "8000".to_string());
    let addr: SocketAddr = format!("0.0.0.0:{}", port)
        .parse()
        .expect("Invalid address");

    tracing::info!("Edge Gateway listening on {}", addr);
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn health_check() -> impl IntoResponse {
    (StatusCode::OK, "Edge Gateway Operational")
}

async fn proxy_api(
    State(state): State<AppState>,
    req: Request<Body>,
) -> impl IntoResponse {
    proxy(state.client, state.api_url, req, None).await
}

async fn proxy_ai(
    State(state): State<AppState>,
    req: Request<Body>,
) -> impl IntoResponse {
    proxy(state.client, state.ai_url, req, Some("/ai")).await
}

/// Generic reverse proxy.
/// Forwards `req` to `base_url`, optionally stripping `strip_prefix` from the path first.
async fn proxy(
    client: Arc<Client>,
    base_url: String,
    req: Request<Body>,
    strip_prefix: Option<&str>,
) -> axum::response::Response {
    let (parts, body) = req.into_parts();

    let raw_path = parts.uri.path();
    let path = match strip_prefix {
        Some(prefix) if raw_path.starts_with(prefix) => &raw_path[prefix.len()..],
        _ => raw_path,
    };
    let path = if path.is_empty() { "/" } else { path };
    let query = parts
        .uri
        .query()
        .map(|q| format!("?{}", q))
        .unwrap_or_default();

    let target_url = format!("{}{}{}", base_url, path, query);

    let mut headers = parts.headers;
    headers.remove("host"); // let reqwest set the correct Host for the upstream

    // 16 MB body limit — large enough for uploads, small enough to limit abuse
    let body_bytes = match axum::body::to_bytes(body, 16 * 1024 * 1024).await {
        Ok(b) => b,
        Err(e) => {
            tracing::error!("Failed to read request body: {}", e);
            return StatusCode::BAD_REQUEST.into_response();
        }
    };

    match client
        .request(parts.method, &target_url)
        .headers(headers)
        .body(body_bytes)
        .send()
        .await
    {
        Ok(res) => {
            let status = res.status();
            let resp_headers = res.headers().clone();
            let bytes = res.bytes().await.unwrap_or_default();

            let mut builder = axum::http::Response::builder().status(status);
            if let Some(h) = builder.headers_mut() {
                *h = resp_headers;
            }
            builder
                .body(Body::from(bytes))
                .unwrap_or_else(|_| StatusCode::INTERNAL_SERVER_ERROR.into_response())
        }
        Err(e) => {
            tracing::error!("Proxy error -> {}: {}", target_url, e);
            (StatusCode::BAD_GATEWAY, format!("Proxy error: {}", e)).into_response()
        }
    }
}
