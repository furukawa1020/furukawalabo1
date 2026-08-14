# ---- Build stage ----
FROM rust:1.88-slim AS builder

WORKDIR /app

# Cache dependencies separately from source
COPY Cargo.toml ./
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release
RUN rm src/main.rs

# Build the real binary
COPY src ./src
RUN touch src/main.rs && cargo build --release

# ---- Runtime stage ----
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/target/release/edge /usr/local/bin/edge

ENV PORT=8000
EXPOSE 8000

CMD ["edge"]
