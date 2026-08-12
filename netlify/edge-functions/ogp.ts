// Netlify Edge Function: OGP injection for SNS crawlers
// /netlify/edge-functions/ogp.ts
//
// SNSクローラー(Twitterbot, facebookexternalhit etc.)がアクセスした場合のみ
// 記事固有のOGPタグを含む静的HTMLを返す。
// 一般ユーザーはそのまま React SPA へ。

import type { Context } from "https://edge.netlify.com";

// ブログ記事ごとのOGP設定
const BLOG_OGP: Record<string, { title: string; description: string; image: string }> = {
  "2026-08-13-translatejs-react-spa": {
    title: "React SPA に translate.js を組み込んだ話 | Furukawa Archive OS",
    description: "10言語対応を実現するために translate.js を React SPA に組み込んでみた。タイミング問題・API名の誤り・非同期フェッチとの敗北など、SPA特有のハマりどころについて実際のコードとともに記録。",
    image: "https://furukawalab.com/content/blog/images/translate-js-ogp.jpg",
  },
  "2026-08-12-why-i-stopped-stress-prediction": {
    title: "ストレスを当てる研究をやめた理由 | Furukawa Archive OS",
    description: "「分かりすぎないまま、役に立つ技術」— なぜ精度の高いストレス推定をやめ、解釈をユーザーに委ねるアプローチに行き着いたのか。最新研究の背景と思想。",
    image: "https://furukawalab.com/images/og-main.png",
  },
  "2026-02-23-rustker-desktop": {
    title: "Rustker（ラスッカー）Rust製の軽くて速いコンテナアプリをゼロから作ってみた!（失敗） | Furukawa Archive OS",
    description: "Docker Desktopが重いからとコンテナエンジン自作の旅に出た結果、本来の目的を忘れた最強のオチ。",
    image: "https://furukawalab.com/images/og-main.png",
  },
};

const SITE_DEFAULT = {
  title: "古川耕太郎 公式サイト | Furukawa Archive OS",
  description: "古川耕太郎 (Kotaro Furukawa) の公式サイト・ポートフォリオ。研究・開発・デザイン・執筆など、様々な領域での活動とアウトプットをアーカイブしています。",
  image: "https://furukawalab.com/images/og-main.png",
};

const CRAWLERS = [
  "twitterbot",
  "facebookexternalhit",
  "linkedinbot",
  "slackbot",
  "discordbot",
  "telegrambot",
  "whatsapp",
  "googlebot",
  "line-poker",
  "applebot",
  "bingbot",
  "iframely",
  "embedly",
  "outbrain",
  "pinterest",
];

function isCrawler(ua: string): boolean {
  const lower = ua.toLowerCase();
  return CRAWLERS.some((bot) => lower.includes(bot));
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildOGPHtml(
  meta: { title: string; description: string; image: string },
  canonicalUrl: string
): string {
  const t = escapeHtml(meta.title);
  const d = escapeHtml(meta.description);
  const img = escapeHtml(meta.image);
  const url = escapeHtml(canonicalUrl);

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>${t}</title>
  <meta name="description" content="${d}">
  <meta property="og:title" content="${t}">
  <meta property="og:description" content="${d}">
  <meta property="og:image" content="${img}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${url}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Furukawa Archive OS">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@HATAKE55555">
  <meta name="twitter:creator" content="@HATAKE55555">
  <meta name="twitter:title" content="${t}">
  <meta name="twitter:description" content="${d}">
  <meta name="twitter:image" content="${img}">
  <link rel="canonical" href="${url}">
</head>
<body>
  <h1>${t}</h1>
  <p>${d}</p>
</body>
</html>`;
}

export default async function handler(req: Request, context: Context) {
  const ua = req.headers.get("user-agent") || "";

  // 一般ユーザーはそのまま React SPA へ
  if (!isCrawler(ua)) {
    return context.next();
  }

  const url = new URL(req.url);
  const pathname = url.pathname; // e.g. /blog/2026-08-13-translatejs-react-spa

  // /blog/:slug からスラッグを取り出す
  const slugMatch = pathname.match(/^\/blog\/(.+)$/);
  const slug = slugMatch ? slugMatch[1] : null;

  let meta = { ...SITE_DEFAULT, title: "Blog | Furukawa Archive OS", description: "研究の進捗や、作ったプロトタイプ、日々の気づき。古川耕太郎のブログ。" };

  if (slug && BLOG_OGP[slug]) {
    meta = BLOG_OGP[slug];
  }

  return new Response(buildOGPHtml(meta, req.url), {
    headers: {
      "content-type": "text/html;charset=UTF-8",
      "cache-control": "public, max-age=300", // 5分キャッシュ
    },
  });
}
