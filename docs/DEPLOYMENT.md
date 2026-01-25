# Furukawa Archive OS デプロイガイド

このシステムは **Railway (推奨)** または標準的な **Linux VPS** で簡単にデプロイできます。

## オプション 1: Railway (推奨)

Railwayはこのマイクロサービス構成（DB, Redis, 複数アプリ）を自動で管理できるため、最も推奨されるデプロイ先です。

### 1. プロジェクトのセットアップ
1. [Railway](https://railway.app/) にログインします。
2. **New Project** > **Provision PostgreSQL** を選択してデータベースを作成します。
3. 同様に **Redis** も追加します。

### 2. リポジトリの連携
1. **New** > **GitHub Repo** > `furukawalab` リポジトリを選択します。
2. **モノレポ設定**: 
   * Railwayが自動検知する場合もありますが、基本的には手動で `api`, `web`, `edge`, `worker` の各サービスとして追加・設定する必要があります。
   * 各サービスの **Settings** > **Root Directory** を以下のように設定してください：
     * API: `apps/api`
     * Web: `apps/web`
     * Worker: `apps/worker`
     * Edge: `apps/edge` (必須ではありませんが、Rustプロキシを使いたい場合)

### 3. 環境変数の設定 (Variables)
Railwayのダッシュボードで設定します。PostgresとRedisプラグインからの変数は自動的に注入されます。

#### 共通自動設定
* `DATABASE_URL` (Postgresを連携させると自動設定)
* `REDIS_URL` (Redisを連携させると自動設定)

#### サービスごとの設定

**API Service (`apps/api`)**
* `STRIPE_SECRET_KEY`: Stripeのシークレットキー
* `STRIPE_WEBHOOK_SECRET`: StripeのWebhookシークレット
* `FRONTEND_URL`: `https://<あなたのWEBサービスのURL>.up.railway.app`
* ビルド・起動コマンド: Dockerfileが自動検出されるため設定不要です。

**Web Frontend (`apps/web`)**
* `VITE_API_URL`: APIサービスのURL (`https://<あなたのAPIサービスのURL>.up.railway.app/api/v1`)
  * ※Edge Gatewayを経由しない場合は直接APIを指定します。

**Worker Service (`apps/worker`)**
* `DATABASE_URL` が連携されていることを確認してください。

**AI Service (`apps/ai`)**
* Pythonベースのマイクロサービスです。
* **Root Directory**: `apps/ai`
* **Start Command**: `python app.py` (または Dockerfile 自動検出)
* ポート: 5000 (Railwayが自動検出できない場合は `PORT` 変数設定が必要ですが、Dockerfileがあれば基本OKです)

---

## オプション 2: Linux VPS (Docker Compose)

AWS EC2, Sakura VPS, ConoHa VPSなどのLinuxサーバー（Ubuntu 22.04推奨）を使用する場合の手順です。

### 前提条件
* サーバーに **Docker** と **Docker Compose** がインストールされていること
* ドメイン設定（例: `furukawalab.com`）

### デプロイ手順

1. **リポジトリのクローン**:
   ```bash
   git clone https://github.com/YOUR_GITHUB_USER/furukawalab.git
   cd furukawalab
   ```

2. **環境変数の作成**:
   ルートディレクトリに `.env` ファイルを作成します。
   ```bash
   # .env
   DATABASE_URL=postgres://postgres:password@db:5432/furukawa_os
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   FRONTEND_URL=https://furukawalab.com
   VITE_API_URL=https://furukawalab.com/api/v1
   ```

3. **起動**:
   ```bash
   docker compose -f infra/docker-compose.yml up -d --build
   ```
   * 初回はビルドに数分かかります。

### 運用・更新

* **更新**: ローカルでpushした後、サーバーで `git pull origin main` して再度 `docker compose up -d --build` します。
* **バックアップ**: `docker compose exec db pg_dump ...` でDBダンプが可能です。
