// Netlify Edge Function: OGP injection for SNS crawlers
// /netlify/edge-functions/ogp.ts
//
// SNSクローラー(Twitterbot, facebookexternalhit etc.)がアクセスした場合のみ
// index.htmlのog:imageを記事固有の画像で書き換えて返す

import type { Context } from "https://edge.netlify.com";

// Blog posts with their OGP image mapping
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
};

const SITE_DEFAULT = {
  title: "古川耕太郎 公式サイト | Furukawa Archive OS",
  description: "古川耕太郎 (Kotaro Furukawa) の公式サイト・ポートフォリオ。研究・開発・デザイン・執筆など、様々な領域での活動とアウトプットをアーカイブしています。",
  image: "https://furukawalab.com/images/og-main.png",
};

function isCrawler(ua: string): boolean {
  return /twitterbot|facebookexternalhit|linkedinbot|slackbot|discordbot|telegrambot|whatsapp|googlebot|line-poker/i.test(ua);
}

function buildOGPHtml(meta: { title: string; description: string; image: string }, url: string): string {
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>${meta.title}</title>
  <meta name="description" content="${meta.description}">
  <meta property="og:title" content="${meta.title}">
  <meta property="og:description" content="${meta.description}">
  <meta property="og:image" content="${meta.image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${url}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Furukawa Archive OS">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@HATAKE55555">
  <meta name="twitter:creator" content="@HATAKE55555">
  <meta name="twitter:title" content="${meta.title}">
  <meta name="twitter:description" content="${meta.description}">
  <meta name="twitter:image" content="${meta.image}">
</head>
<body>
  <p>Redirecting...</p>
  <script>window.location.href = "${url}";</script>
</body>
</html>`;
}

export default async function handler(req: Request, context: Context) {
  const ua = req.headers.get("user-agent") || "";
  const url = new URL(req.url);

  // Only intercept crawlers
  if (!isCrawler(ua)) {
    return context.next();
  }

  // Check if it's a blog post URL: /blog?slug=xxx or /blog/xxx
  const slug = url.searchParams.get("slug") || url.pathname.replace(/^\/blog\/?/, "");

  let meta = SITE_DEFAULT;

  if (slug && BLOG_OGP[slug]) {
    meta = BLOG_OGP[slug];
  } else if (url.pathname.startsWith("/blog")) {
    meta = {
      ...SITE_DEFAULT,
      title: "Blog | Furukawa Archive OS",
      description: "研究の進捗や、作ったプロトタイプ、日々の気づき。古川耕太郎のブログ。",
    };
  }

  return new Response(buildOGPHtml(meta, req.url), {
    headers: { "content-type": "text/html;charset=UTF-8" },
  });
}

export const config = {
  path: ["/blog", "/blog/*"],
};
