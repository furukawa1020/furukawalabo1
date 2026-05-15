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

## Deployment Status

どこが本番稼働していて、どこが開発中・将来実装かを明示します。

| Component | Status | Hosting |
| --- | --- | --- |
| **Frontend (React)** | 本番稼働 | Vercel |
| **Backend (Rails API)** | 本番稼働 | Railway |
| **Worker (Go)** | 本番稼働（6時間ごとに自動同期） | Railway |
| **AI Service (Python / RAG)** | 本番稼働 | Railway |
| **Edge Gateway (Rust)** | ローカル・Docker Compose環境で動作確認済み。本番はVercel/Railwayのリバースプロキシに委任中 |  - |
| **Rate Limiting** | 未実装（Rust edge へのtower middleware追加として計画中） | - |
| **ActionCable / Redis** | 本番稼働（投げ銭リアルタイム通知） | Railway |

> `WORKER_AUTH_TOKEN` は本番環境では必須の環境変数です。未設定の場合、起動時にWARNINGログが出力されます（フォールバックはローカル開発専用）。

---

## Edge Gateway (Rust) — なぜRustで書いたか、何をやっているか

`apps/edge/src/main.rs` がこのプロジェクトで一番ハマったファイルです。

Rustを選んだ理由はシンプルで、「GCがない」ことです。RubyもPythonもGoもランタイムにGCを持っていて、タイミングによってはリクエスト処理中にGCが走ってレイテンシが跳ねる。Rustはそれがない。全てのメモリ管理をコンパイル時に所有権システムで解決するので、実行時に予期しない停止が起きない。ポートフォリオサイトとしてはオーバースペックですが、「エッジに置くならRust」という感覚を体で理解したくて作りました。

### 実装の構造

axum + tokio の非同期ランタイムで動いています。

```
クライアント
  |
  | HTTP
  v
Edge Gateway (Rust / axum)
  |
  |-- /api/* --> Rails API (Ruby)
  |-- /ai/*  --> AI Service (Python / FastAPI)
  +-- /health --> "Edge Gateway Operational"
```

ルーティングはこれだけ：

```rust
let app = Router::new()
    .route("/health", any(health_check))
    .route("/api/*path", any(proxy_api))   // Railsに転送
    .route("/ai/*path", any(proxy_ai))     // AI Serviceに転送
    .fallback(any(proxy_api));             // それ以外も全部Railsへ
```

### メモリ管理とゼロコピーの話

Rustで一番ハマったのが、リクエストボディのハンドリングです。

axumのリクエストボディは`Body`型という非同期ストリームで、そのままreqwestに渡せません。一度バイト列に収める必要がある。

```rust
// axumのBodyをバイト列に変換してからreqwestに渡す
let body_bytes = axum::body::to_bytes(body, usize::MAX).await.unwrap_or_default();
```

`usize::MAX`を上限に設定しているのは「制限なしで全部受け取る」という意味で、本番では適切に上限を設けるべき箇所です。ただ今回はプロキシなのでアップストリームのRails側に任せています。

レスポンス側は逆で、reqwestから返ってきた`bytes`をそのままaxumの`Body::from()`に包んでいます。このあたりは余計なコピーを避けてバイト列を一度だけ確保するようにしています。

```rust
let bytes = res.bytes().await.unwrap_or_default();
// ...
builder.body(Body::from(bytes))  // 所有権ごと渡す、コピーなし
```

### 所有権システムとの戦い

Rustで一番時間を溶かしたのはここです。

```rust
let (parts, body) = req.into_parts();
let method = parts.method;
let mut headers = parts.headers;
headers.remove("host");  // ← ここでheadersのmut借用が必要
```

`req.into_parts()`で所有権をmoveしてから`method`と`headers`を別々に使う、という流れは借用チェッカーと何度も格闘しました。特にヘッダーから`host`を除去した上でreqwestに渡す部分で、「既にmoveした値を参照している」というコンパイルエラーを何パターンも踏みました。

### tokioの非同期処理

`#[tokio::main]`でエントリポイント全体を非同期化し、各リクエストは`async fn`として並行処理されます。GCがない上に非同期I/Oなので、スレッドをブロックせずに多数のコネクションを捌けます。

```rust
#[tokio::main]
async fn main() {
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
```

`reqwest::Client`はリクエストごとに生成しています（本来は`Arc`で共有するのが正しい）。これも「Rustの共有状態どうするんだ問題」として今後改善したいポイントです。

---

## はくちゃん (Haku-chan) — サイト内AIエージェント

このサイト上には「**はくちゃん**」という名のAIエージェントが常駐しています。単なるチャットボットではなく、サイトのコンテンツ・研究・作品について**自分の知識ベースを持って答える**RAG（Retrieval-Augmented Generation）エージェントです。

### 名前の由来
- **「Hacking Thinking」** のHa + **「白山（Hakusan）」** のHaku → **「はくちゃん」**
- コンセプト：*LET'S ENJOY CONSTRAINTS HACK!* を体現するキャラクター
- 口調：幼児語・ハイテンション（toddler-like）

### AI / RAG アーキテクチャ

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

### 知識ベースの構築（RAG Ingestion）
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

### 特徴的な実装ポイント

| 機能 | 実装 |
|---|---|
| **3段階フォールバック** | RAG → LLMOnly → ローカルエージェントの順で必ず応答を返す |
| **ヘルスチェック** | チャット起動時に `/health` を叩きステータス（online/connecting/offline）をリアルタイム表示 |
| **Hacking おみくじ** | RAGコンテキストを利用しポジティブな運勢のみを生成（大吉/神吉/ハック吉/優勝） |
| **会話履歴** | フロントエンド側で `[user, bot]` ペアの履歴を管理しAPIに渡す |
| **アバター連動** | `open-site-agent` カスタムイベント経由で3DアバターとチャットUIが連携 |
| **プライバシー保護** | システムプロンプトで未踏IT等の応募情報を絶対に漏洩しないよう制御 |
| **i18n対応** | `react-i18next` でUIテキストが日英切り替えに追従 |

### システムプロンプト設計
- キャラクター定義・口調・禁止事項をプロンプトに組み込み
- 「Hacking Thinking」は哲学として語るが、提案書の存在は開示しない
- 研究・作品・ビジョンについては誇りを持って答える

---

## SiteAvatar — 3D VRM アバターの動かし方

- **Three.js / `@pixiv/three-vrm`** でVRMモデルをWebブラウザ上でリアルタイム描画
- モデルファイル：`apps/ai/hakusan-avatar.vrm`（約15MB）
- 実装ファイル：`apps/web/src/components/SiteAvatar.tsx`

### ボーン直接操作でアニメーション制御

VRMの`humanoid.getRawBoneNode()`でボーンを直接取得し、`useFrame()`（毎フレームコールバック）の中でsinカーブを使って角度を手動で計算・適用しています。

```
アニメーション状態 (action)
  ├── 'idle'  : 待機（腕を自然に下ろし、呼吸する）
  ├── 'walk'  : 歩行（腕・脚の逆位相スウィング）
  ├── 'wave'  : 手を振る（右腕を振り上げてsin揺れ）
  └── 'peace' : 片手ピース
```

操作しているボーン一覧：

| ボーン | idle | walk | wave |
|---|---|---|---|
| `rightUpperArm` / `leftUpperArm` | z=±1.3（腕下げ）+ 呼吸 | z=±1.4 + x=sin（前後振り） | z=2.5+sin（振る） |
| `rightLowerArm` / `leftLowerArm` | z=0（リセット） | 肘曲げ・捻り | z=0.5 |
| `rightUpperLeg` / `leftUpperLeg` | x=0 | x=sin（逆位相） | - |
| `rightLowerLeg` / `leftLowerLeg` | x=0 | x=膝曲げ（max(0,sin)） | - |
| `spine` | y=0 | y=sin*0.08（体の捻り） | - |

### しっぽ物理（チェーンアニメーション）

VRMモデルのボーン名を`traverse()`でスキャンし、`tail` / `shippo` を含む全ボーンを配列に収集。各ボーンにオフセットをかけて**波状のしっぽスウェイ**を実現：

```typescript
// action='walk'時はハイスピード・大振り、idle時はゆっくり・小振り
const speed = action === 'walk' ? 8.0 : 1.5;
const amp   = action === 'walk' ? 0.2  : 0.08;
const offset = index * 0.3; // ボーンごとに位相ずらし → 波が伝播

bone.rotation.x = baseDroop + Math.sin(t * speed * 0.7 - offset) * (amp * 0.5);
bone.rotation.y = Math.cos(t * speed - offset) * amp;
bone.rotation.z = Math.sin(t * speed * 0.5 - offset) * (amp * 0.3);
```

### アイコンタクト（カメラ追従）

VRMの`lookAt.lookAt()`にThree.jsのカメラ位置を渡すことで、常にユーザーの目を見る動作を実現：

```typescript
if (vrm.lookAt) {
    vrm.lookAt.lookAt(state.camera.position);
}
```

### 移動ロジック（自律歩行）

毎フレーム1%の確率でランダムにアクション遷移。歩行時はターゲット座標に向かって`lerp`ではなく速度・方向制御で**ちゃんと歩いて移動**します（スライドしない）：

```typescript
// 向きも滑らかに回転
const turn = dist > 0 ? Math.PI / 2 : -Math.PI / 2;
sceneRef.current.rotation.y = THREE.MathUtils.lerp(current.rotation.y, turn, 0.2);

// 歩行ボブ（上下バウンス）
sceneRef.current.position.y = -1.3 + Math.abs(Math.cos(walkCycle)) * 0.05;
```

- **レスポンシブ対応**：モバイル（幅<768px）はX=0、デスクトップはX=-4.5にベース位置を切り替え
- 画面リサイズ時もidle状態なら即座に新しいベース位置に移動

### クリックでチャット起動

アバター上に透明な`<Html>`オーバーレイを重ね、クリックで `open-site-agent` カスタムイベントをdispatch。`SiteAgent.tsx`側でこれをリッスンしてチャットUIを開く：

```typescript
// SiteAvatar.tsx
window.dispatchEvent(new Event('open-site-agent'));

// SiteAgent.tsx
window.addEventListener('open-site-agent', () => setIsOpen(true));
```

### レンダリング設定

```typescript
<Canvas camera={{ position: [0, 1.3, 4.5], fov: 40 }} gl={{ alpha: true }}>
    {/* FOV 40で適度な望遠感・カメラY=1.3で俯瞰気味に */}
    <ambientLight intensity={1.0} />
    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
    <pointLight position={[-10, -10, -10]} />
</Canvas>
```

- `gl={{ alpha: true }}`でCanvas背景を透過し、ページのグラデーションが透けて見える
- 固定位置（`fixed bottom-0`）・`pointer-events-none`でページ操作を妨げない

---
