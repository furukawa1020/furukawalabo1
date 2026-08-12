# React SPA に translate.js を組み込んだ話

![translate.js × React SPA](/content/blog/images/translate-js-ogp.jpg)

このサイト（furukawalab）では、日本語・英語・中国語など**10言語への翻訳切り替え**に対応しています。

その裏側で使っているのが **[translate.js](https://github.com/xnx3/translate)** というOSSライブラリです。

このブログ記事では、「どんな問題があったか」「どう組み込んだか」「どこでハマったか」を実際のコードと一緒に書いていきます。

---

## そもそも translate.js とは

**[xnx3/translate](https://github.com/xnx3/translate)**（GitHub）は、JavaScriptで書かれたオープンソースの多言語翻訳ライブラリです。

特徴は：

- **スクリプト1本で動く** — バックエンド不要、CDN or セルフホストで使える
- **DOM全体を対象にできる** — `translate.whole.enableAll()` でページ上のテキストを丸ごと翻訳
- **SPAのDOM変化を監視できる** — `translate.listener.start()` でReactの動的レンダリングにも追従
- **10言語以上に対応** — 英語・中国語・韓国語・フランス語など

Google Translate APIを直接叩くより格段に手軽で、個人サイトやポートフォリオには十分な選択肢です。

---

## React SPA に組み込む上での問題

### 問題1：スクリプトの読み込みタイミング

最初はCDNから `<script>` タグで読み込んでいたのですが、Reactの仮想DOMレンダリングが先に走ってしまい、`window.translate` が `undefined` になることが多発しました。

```html
<!-- ❌ これだとReactが先にマウントされてしまうことがある -->
<script src="https://res.zvo.cn/translate/translate.js"></script>
```

**解決策：セルフホスト + React起動前初期化**

translate.jsの本体（156KB）を `public/translate.js` に配置し、`index.html` の `<body>` 先頭でReactの `<div id="root">` より先に同期ロードするようにしました。

```html
<!-- index.html -->
<body>
  <!-- ① React起動前に同期ロード -->
  <script src="/translate.js"></script>
  <script>
    // ② Reactが描画する前に初期化 → DOM変化の監視が確実に始まる
    translate.whole.enableAll();           // 要素内テキストを丸ごと翻訳対象に
    translate.language.setLocal('japanese'); // ページの原文言語を宣言
    translate.listener.start();            // React の動的レンダリングを監視
    translate.service.use('client.edge'); // 翻訳サービスのチャネル指定

    // ③ 前回選択した言語をlocalStorageから復元
    (function () {
      var saved = localStorage.getItem('translatejs_language');
      if (saved && saved !== 'japanese') {
        translate.language.setDefaultTo(saved);
      }
    })();
  </script>

  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
```

---

### 問題2：APIの関数名が間違っていた

`translate.js` はv3→v4でAPIが変わっています。ドキュメントを読み違えて `translate.use()` を呼んでいたのですが、v4では **`translate.changeLanguage()`** が正しいメソッドです。

```typescript
// ❌ 間違い — 存在しないメソッド
translate.use('english');

// ✅ 正解
translate.changeLanguage('english');
```

この1行のミスで「ボタンを押しても何も変わらない」という状態になっていました。

---

### 問題3：日本語に戻すときの挙動

「日本語に戻す」ボタンを押したとき、ページをリロードすると `window.translate` が内部キャッシュとして「前回の言語」を保持したまま初期化されることがありました。

**解決策：明示的に `changeLanguage('japanese')` を呼ぶ**

```typescript
export function switchLanguage(langCode: string) {
  if (langCode === 'japanese') {
    localStorage.removeItem('translatejs_language');
  } else {
    localStorage.setItem('translatejs_language', langCode);
  }

  // リロードではなく明示的に言語を切り替える
  window.translate.changeLanguage(langCode);
}
```

---

### 問題4：非同期フェッチ後のコンテンツが翻訳されない

このサイトはReact SPAなので、ブログ記事やWorks一覧はAPIやJSONファイルから非同期でフェッチして描画します。

`translate.listener.start()` がDOM変化を監視してくれるのですが、非同期フェッチのタイミングによっては翻訳が漏れることがありました。

**解決策：時間差で複数回 `translate.execute()` を発火**

```typescript
export function reExecuteTranslation() {
  const lang = localStorage.getItem('translatejs_language') || 'japanese';
  if (lang === 'japanese') return;

  const executeSafe = () => {
    try { window.translate.execute(); } catch (e) { /* ignore */ }
  };

  // 即時・0.5秒後・1.5秒後・3秒後と時間差で実行
  // → fetch完了 → Reactレンダリング → 翻訳 の順が確実に揃う
  executeSafe();
  setTimeout(executeSafe, 500);
  setTimeout(executeSafe, 1500);
  setTimeout(executeSafe, 3000);
}
```

ルート変更のたびにこの関数を呼んでいます：

```typescript
// App.tsx
function TranslateExecutor() {
  const location = useLocation();
  useEffect(() => {
    reExecuteTranslation();
  }, [location.pathname]);
  return null;
}
```

---

## まとめ：組み込みの全体像

```
index.html
  └── <script src="/translate.js"> (同期ロード・セルフホスト)
       └── translate.whole.enableAll()       // 全テキストを翻訳対象に
       └── translate.language.setLocal('japanese') // 原文言語を宣言
       └── translate.listener.start()        // DOM変化を継続監視
       └── translate.language.setDefaultTo() // 保存済み言語を復元

React起動
  └── App.tsx の TranslateExecutor
       └── ルート変更ごとに reExecuteTranslation()
            └── 0ms / 500ms / 1500ms / 3000ms で translate.execute()

LanguageSwitcher.tsx (言語切替UI)
  └── switchLanguage(langCode)
       └── localStorage に保存
       └── translate.changeLanguage(langCode) で即時切替
```

---

## 参考リンク

- **translate.js GitHub**: [https://github.com/xnx3/translate](https://github.com/xnx3/translate)
- 今回の実装コード: [furukawalab GitHub](https://github.com/furukawa1020/furukawalabo1) の `apps/web/src/hooks/useTranslateJs.ts`

小さいライブラリでもReact SPA特有のライフサイクルとかみ合わせるのは意外と難しかったです。同じ問題で詰まっている人の参考になれば！
