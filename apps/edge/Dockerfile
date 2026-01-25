FROM rustlang/rust:nightly-slim

WORKDIR /app

# Install system dependencies required for OpenSSL
RUN apt-get update && apt-get install -y pkg-config libssl-dev ca-certificates && rm -rf /var/lib/apt/lists/*

COPY Cargo.toml .
# Create dummy main to cache dependencies
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo fetch

COPY . .
# Touch main.rs to force rebuild
RUN touch src/main.rs
RUN cargo build --release

CMD ["./target/release/edge"]
