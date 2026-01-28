---
title: "Railwayでのデプロイ、めちゃくちゃ沼った話"
date: "2026-01-26"
summary: "502エラーの海から這い上がるまでの記録。Rust、Port、CORS、すべてが罠だった。"
---

## はじめに：順風満帆...のハズが

「Railwayって簡単らしいよ」というネットの噂を信じ、意気揚々とデプロイを開始。

**結果：3日間、502エラーと格闘しました。**

## 罠その1：Rustのバージョン地獄

### 症状
```
error: package `wit-bindgen v0.39.1` requires `rustc 1.87.0 or newer`
```

### 原因
DockerfileでRust安定版を使っていたが、依存ライブラリがNightlyを要求。

### 解決策
```dockerfile
FROM rustlang/rust:nightly-slim
```

**学び：依存関係は常にチェック。Cargoが優しいとは限らない。**

## 罠その2：ポートの不一致

### 症状
Railwayのログでは`Listening on 0.0.0.0:8000`なのに、Public Networking設定は`8080`になっていた。

### 原因
Railwayが自動検出したポートと、アプリが実際にBindしたポートが違った。

### 解決策
`Railway Settings > Networking > Service Port`を **8000** に手動修正。

**学び：自動検出を過信するな。最後は目grep。**

## 罠その3：CORS地獄（Netlify移行時）

### 症状
フロントエンド（Netlify）からAPIを叩くと、ブラウザコンソールで**CORS Error**。

### 原因
Edge Gateway（Rust/Axum）にCORS設定が抜けていた。

### 解決策
```rust
use tower_http::cors::{CorsLayer, Any};

let app = Router::new()
    .layer(CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any));
```

**学び：ドメインが分かれたら、CORSは必須。**

## 総括：デプロイは最高の学びの場

エラーログと格闘した3日間、正直しんどかった。

でも、**Rust、CORS、Railwayの仕組みを全部理解できた**。

個人開発でしか、こんな泥臭いデバッグはできない。だから、やる価値がある。

次は、CI/CDパイプライン組んで自動デプロイにしたい。GitHub ActionsでPush即反映、憧れる...！
