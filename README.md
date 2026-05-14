# Furukawa Archive OS
[https://furukawalab.com](https://furukawalab.com)
=======
<img width="2379" height="1186" alt="image" src="https://github.com/user-attachments/assets/b46d0423-c7a4-4738-91f7-677a61ca3acb" />

古川の研究・作品・実績・思想・おやつ(決済・質問箱)
を統合したPWA一応フルスタックポートフォリオサイト。

なんやかんやたくさんいろいろ変なものを作ってきたつもりでしたが
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

---

## 🐶 はくちゃん (Haku-chan) — サイト内AIエージェント

このサイト上には「**はくちゃん**」という名のAIエージェントが常駐しています。単なるチャットボットではなく、サイトのコンテンツ・研究・作品について**自分の知識ベースを持って答える**RAG（Retrieval-Augmented Generation）エージェントです。

### 🧠 名前の由来
- **「Hacking Thinking」** のHa + **「白山（Hakusan）」** のHaku → **「はくちゃん」**
- コンセプト：*LET'S ENJOY CONSTRAINTS HACK!* を体現するキャラクター
- 口調：幼児語・ハイテンション（toddler-like）

### ⚙️ AI / RAG アーキテクチャ

```
[Frontend: SiteAgent.tsx]
  │
  │  POST /chat  (message + history)
  ▼
[AI Service: FastAPI (Python) — apps/ai/main.py]
  │
  ├─── [RAG Mode: FAISS Vector Store + LangChain]
  │       ├── ローカル埋め込みモデル: sentence-transformers/all-MiniLM-L6-v2
  │       ├── LLM: HuggingFace Endpoint (Mistral-7B-Instruct-v0.2)
  │       └── ConversationalRetrievalChain でコンテキスト付き回答
  │
  ├─── [LLM-Only Fallback: HuggingFace Router API]
  │       └── Qwen/Qwen2.5-7B-Instruct (OpenAI互換APIフォーマット)
  │
  └─── [オフライン最終保護: LocalFallbackAgent]
          └── トークンなし・外部API障害時もユーザーを見捨てない
```

### 📚 知識ベースの構築（RAG Ingestion）
- `apps/ai/content/` 以下のMarkdown/JSONファイルをすべてロード
- PDF → Markdown 変換スクリプト（`ingest_pdf.py`）でリサーチ論文・提案書を投入
- テキストを300文字チャンク・50文字オーバーラップで分割しFAISSにインデックス
- バッチサイズ2・リトライ付きの「ジェントルモード」でレートリミット対策済み

```python
# 知識ベースに追加するPDFの処理例
reader = PdfReader(pdf_path)
markdown_content = "# Project Proposal: Hacking Thinking\n\n..."
# → apps/ai/content/*.md として保存 → 次回起動時に自動インデックス化
```

### 🎯 特徴的な実装ポイント

| 機能 | 実装 |
|---|---|
| **3段階フォールバック** | RAG → LLMOnly → ローカルエージェントの順で必ず応答を返す |
| **ヘルスチェック** | チャット起動時に `/health` を叩きステータス（online/connecting/offline）をリアルタイム表示 |
| **Hacking おみくじ** | RAGコンテキストを利用しポジティブな運勢のみを生成（大吉/神吉/ハック吉/優勝） |
| **会話履歴** | フロントエンド側で `[user, bot]` ペアの履歴を管理しAPIに渡す |
| **アバター連動** | `open-site-agent` カスタムイベント経由で3DアバターとチャットUIが連携 |
| **プライバシー保護** | システムプロンプトで未踏IT等の応募情報を絶対に漏洩しないよう制御 |
| **i18n対応** | `react-i18next` でUIテキストが日英切り替えに追従 |

### 🔒 システムプロンプト設計
- キャラクター定義・口調・禁止事項をプロンプトに組み込み
- 「Hacking Thinking」は哲学として語るが、提案書の存在は開示しない
- 研究・作品・ビジョンについては誇りを持って答える

---

## 🖥️ SiteAvatar — 3D VRM アバター

- **Three.js / `@pixiv/three-vrm`** でVRMモデルをWebブラウザ上で動作
- アイドル時：腕を自然に下ろし、尻尾と体に微細なスウェイアニメーション
- クリック時：チャットUIを `open-site-agent` カスタムイベントで呼び出す
- モデルファイル：`apps/ai/hakusan-avatar.vrm`

---
