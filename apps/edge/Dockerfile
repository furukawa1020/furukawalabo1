FROM rust:1.84-slim

WORKDIR /app

COPY Cargo.toml .
# Create dummy main to cache dependencies
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo fetch

COPY . .
# Touch main.rs to force rebuild
RUN touch src/main.rs
RUN cargo build --release

CMD ["./target/release/edge"]
