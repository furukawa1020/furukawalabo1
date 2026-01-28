---
slug: railway-api-crash-fix
title: RailwayでAPIがクラッシュして絶望した話
date: 2026-01-28
summary: Dockerfileの1行忘れとキャッシュ地獄で、APIが永遠にクラッシュし続けた闇の記録。
---

## 事の発端

Stripe決済のために特定商取引法ページを作成していたら、**突然APIサービスがクラッシュし始めた。**

何も変えてないのに壊れた（大嘘）。

## 地獄のエラーログ

Railwayのログを見ると、真っ赤なエラーが無限ループ。

![Railway Error Log](/content/blog/images/railway-error.png)

```
bundler: failed to load command: rake
Could not find redis-client-0.26.3, prism-1.8.0 in locally installed gems
```

**は？gemが見つからない？**

`bundle install`してるはずなのに、なぜ…？

## 原因究明の迷走

### 仮説1: Gemfile.lockがおかしい
→ `bundle lock --add-platform x86_64-linux` を実行
→ **変わらず**

### 仮説2: Railwayのキャッシュがバグってる
→ 何度Redeployしても状況変わらず
→ **絶望**

### 仮説3: コードを過去に戻せば直る？
→ Legal作成前のコミットに戻す
→ **それでもクラッシュ**
→ **大絶望**

## 真犯人

冷静にDockerfileを見直したら、

```dockerfile
COPY Gemfile ./        # ← これ
RUN bundle install
```

**`Gemfile.lock`をコピーしてない。**

## 解決策

![Dockerfile Fix](/content/blog/images/dockerfile-fix.png)

```dockerfile
COPY Gemfile Gemfile.lock ./   # ← 両方コピー
RUN bundle install
```

**たったこれだけ。**

## でも直らなかった

Dockerfileを修正してプッシュ。

→ **まだクラッシュする**

ビルドログを見ると、全ステップに `cached` の文字。

**Railwayがキャッシュを使い続けてる。**

## 最終兵器：キャッシュ破壊

Dockerfileの先頭にコメントを1行追加。

```dockerfile
# Updated 2026-01-28 to fix gem installation  ← これでキャッシュ無効化
FROM ruby:3.2.2-slim
```

プッシュ。

→ **ビルド成功**
→ **コンテナ起動成功**
→ **🎉🎉🎉**

## 学んだこと

1. **`Gemfile.lock`は必ずコピーする**
   - ないとbundlerが適当なバージョンを選んでカオスになる
   
2. **RailwayのDockerキャッシュは強力**
   - Dockerfileを変更しても、内容が同じならキャッシュされる
   - コメント追加や `--no-cache` で強制的に無効化
   
3. **エラーが出たらBuild logsとDeploy logsを両方見る**
   - Deploy logsだけ見ても原因が分からないことがある

## まとめ

たった1行のコピー忘れで2時間溶けました。

Dockerfileは丁寧に書きましょう。

**下のボタンから、この記事をシェアして私の苦労を拡散してください。** 🍪
