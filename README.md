# Furukawa Archive OS
![Status](https://img.shields.io/badge/development-1%20day-blueviolet) ![Stack](https://img.shields.io/badge/stack-Full--Stack-blue)

**「1日で構築された、AIネイティブ・フルスタックポートフォリオ」**

古川耕太郎の研究・作品・実績・思想・寄付導線を統合したPWAプラットフォーム。
HCI研究者としての「技術力」と「実装力」を一目で伝えるために設計されています。

[https://furukawalab.com](https://furukawalab.com)

## 🚀 Architecture: Microservices-like Monorepo

適材適所で言語を選定し、モダンな技術をフル活用した構成です。

| Component | Tech Stack | Role |
| --- | --- | --- |
| **Frontend** | **React, TypeScript, TailwindCSS, Framer Motion** | 圧倒的な表現力とUX。PWA対応でアプリ化可能。 |
| **Backend** | **Ruby on Rails (API Mode), ActionCable, PostgreSQL** | 堅牢なデータ管理とリアルタイム通知機能。 |
| **Worker** | **Go (Golang)** | Protopediaからのデータ収集・同期を高速に処理。 |
| **Edge** | **Rust** | エッジプロキシ。爆速のリクエスト処理（将来的な拡張）。 |
| **AI** | **Python** | 競馬予想AIなどの機械学習モデル推論。 |

## ✨ Key Features
- **Real-time Interaction**: 訪問者が「おやつ代」を投げ銭すると、閲覧中の全員にリアルタイムで通知花火が上がります（ActionCable/Redis）。
- **Headless CMS**: 自作のAdmin管理画面から、ブログや実績をマークダウンで更新可能。
- **Responsive & PWA**: スマホアプリとしてもインストール可能。App-likeな操作感。
- **SEO Optimized**: SSR/SSGを意識した構成と、最適化されたメタデータ。

## 🛠 Local Development
```bash
# Start all services with Docker Compose
docker compose up --build
```
- Web: http://localhost:3000
- API: http://localhost:3000 (Proxy)

## 📂 Project Structure
- `apps/`
  - `web`: Frontend (Vite + React + TS)
  - `api`: Backend (Rails API)
  - `worker`: Background Worker (Go)
  - `edge`: Edge Gateway (Rust)
  - `ai`: AI Service (Python)
- `content/`: Managed content (Markdown/YAML)

