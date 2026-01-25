# Furukawa Archive OS

古川耕太郎の研究・作品・実績・思想・寄付導線を統合したPWAプラットフォーム。
第三者が「一目で地力と全体像」を理解できる状態を作ることを目的としています。

## System Requirements
- Docker Desktop
- Node.js (v20+)
- Ruby (v3.2+)
- Go (v1.21+)
- Rust (v1.75+)
- Python (v3.10+)

## 🚀 Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed instructions on deploying to a VPS using Docker Compose.

## 🛠 Tech Stack
```bash
# Start all services
docker compose up --build
```

- Web: http://localhost:3000
- API: http://localhost:8000
- Protopedia Sync: automatic (every 6h)

## Project Structure
- `apps/`
  - `web`: Frontend (Vite + React + TS)
  - `api`: Backend (Rails API)
  - `gateway`: Edge Gateway (Rust)
  - `worker`: Background Worker (Go)
  - `ai`: AI Service (Python)
- `content/`: Managed content (Markdown/YAML)
- `infra/`: Infrastructure config (Docker)
- `docs/`: Documentation
