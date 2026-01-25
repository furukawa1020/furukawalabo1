# 管理者向け：Protopedia同期の手動トリガー

## 概要
新しいProtopedia作品を公開したときに、即座にサイトへ反映させるための手動同期API

## 使い方

### 方法1：curlコマンド（推奨）

```bash
curl -X POST https://motivated-warmth-production.up.railway.app/api/v1/admin/sync/protopedia \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 方法2：ブラウザ（開発中のみ）

開発環境では認証なしでアクセス可能：
```
POST http://localhost:3000/api/v1/admin/sync/protopedia
```

## セキュリティ

### 必要な環境変数（Railway設定）

**APIサービス:**
- `ADMIN_API_TOKEN`: 管理者用トークン（ランダムな長い文字列を推奨）
- `WORKER_URL`: Workerサービスの内部URL（例: `http://worker.railway.internal:8080`）
- `WORKER_AUTH_TOKEN`: Worker認証用トークン（APIと同じ値でOK）

**Workerサービス:**
- `WORKER_AUTH_TOKEN`: 認証トークン（APIと同じ値）
- `PORT`: 8080（デフォルト）

## レスポンス例

### 成功時
```json
{
  "status": "success",
  "message": "Protopedia sync triggered",
  "worker_response": {
    "status": "accepted",
    "message": "Sync started in background"
  }
}
```

### エラー時
```json
{
  "status": "error",
  "message": "Unauthorized"
}
```

## 仕組み

1. 管理者がRails APIの `/admin/sync/protopedia` へPOSTリクエスト
2. Rails APIがGo WorkerのHTTPエンドポイント `/sync` を呼び出し
3. Go Workerが41作品すべてをスクレイピング（約20秒）
4. データベースへ保存・更新
5. フロントエンドから `/api/v1/works` にアクセスすると最新データが取得できる

## トラブルシューティング

- **401 Unauthorized**: `ADMIN_API_TOKEN` が設定されていないか、間違っています
- **502 Bad Gateway**: WorkerサービスがダウンしているかURLが間違っています
- **タイムアウト**: Workerの処理は20秒ほどかかりますが、バックグラウンドで実行されるため問題ありません

## 新しい作品の追加手順

1. Protopediaで新作を公開
2. 作品のID（URLの数字部分）を確認（例: `https://protopedia.net/prototype/8123` → `8123`）
3. `apps/worker/main.go` の `workIDs` リストに追加
4. GitHubへpush（Railwayが自動デプロイ）
5. または、この手動同期APIを実行（ただしコードに追加していない作品は同期されません）

**重要**: 現時点では、手動同期APIは既存の41作品のみを対象とします。新しい作品を追加するには、コードの更新が必要です。
