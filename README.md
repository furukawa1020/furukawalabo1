# Furukawa Archive OS
[https://furukawalab.com](https://furukawalab.com)
=======
<img width="2379" height="1186" alt="image" src="https://github.com/user-attachments/assets/b46d0423-c7a4-4738-91f7-677a61ca3acb" />

古川の研究・作品・実績・思想・おやつ(決済・質問箱)
を統合したPWAプラットフォーム。なんやかんやたくさんいろいろ変なものを作ってきたつもりでしたが
# 💬 お前って結局何が作れるん？技術スタックは？(意訳）」と突っ込まれることが増えてきたのでここでひとつ、アーキテクチャ的に必然性があり美しい構成のフルスタックウェブポートフォリオサイトを作ろう！というノリで作りました。
第三者が「一目である程度の力感と全体像」を理解できる状態を作ることを目的としています。
## 🔧 Architecture: Microservices-like Monorepo
適材適所で言語を選定し、モダンな技術をフル活用した構成のつもりです。
| Component | Tech Stack | Role |
| --- | --- | --- |
| **Frontend** | **React, TypeScript, TailwindCSS, Framer Motion** | 「UX」「ユーザビリティ」「インタラクション」って改めてなんだ？どんなことだ？と考えながら実装。PWA対応でアプリ化可能。 |
| **Backend** | **Ruby on Rails (API Mode), ActionCable, PostgreSQL** | 堅牢なデータ管理とリアルタイム通知機能。 |
| **Worker** | **Go (Golang)** | Protopediaからのデータ収集・同期を高速に処理。（これ一番頑張ったのでその部分のコード見てくれると嬉しがります。 |
| **Edge** | **Rust** | エッジプロキシ。爆速のリクエスト処理（将来的な拡張を見据えてあえて作りました）。一番の沼ポイントでした。 |
| **AI** | **Python** | recomendAIアルゴリズム。 |

## 🗝️ Key Features
- **Real-time Interaction**: 訪問者が「おやつ代」を投げ銭すると、閲覧中の全員にリアルタイムで通知花火が上がります。質問もたくさんください！（ActionCable/Redis）。
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

>>>>>>> 6127db3e745f11dc9a76953b3ccc6c93fb9d2375

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

