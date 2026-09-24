// Netlify Edge Function: Full-page prerender for search crawlers
// All routes → returns full HTML with all text content so Googlebot can index everything

import type { Context } from "https://edge.netlify.com";

const BASE_URL = "https://furukawalab.com";
const OG_IMAGE = "https://furukawalab.com/images/og-main.png";

const CRAWLERS = [
  "googlebot", "bingbot", "duckduckbot", "slurp", "baiduspider",
  "yandexbot", "sogou", "exabot", "facebot", "facebookexternalhit",
  "twitterbot", "linkedinbot", "slackbot", "discordbot", "telegrambot",
  "whatsapp", "line-poker", "applebot", "iframely", "embedly",
  "outbrain", "pinterest", "rogerbot", "ahrefsbot", "semrushbot",
  "mj12bot", "dotbot", "petalbot",
];

function isCrawler(ua: string): boolean {
  const lower = ua.toLowerCase();
  return CRAWLERS.some((bot) => lower.includes(bot));
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ──────────────────────────────────────────────
// All achievement content (kept in-sync with achievements.json)
// ──────────────────────────────────────────────
const ACHIEVEMENTS_TEXT = `
古川耕太郎（Kotaro Furukawa）の実績・受賞歴・論文・受託開発経歴一覧です。

## 受託開発・業務委託
- プロトタイプ開発受諾（個人）2025〜: ハードウェア・IoT・Webシステムのプロトタイプ開発を業務委託として受諾。M5Stack・センサー・組み込み・AI連携・Webアプリ等。受諾実績：複数件。
- Webサイト・アプリ開発 2025〜: React / Next.js / TypeScript等を使ったWebフロントエンド開発、FastAPI / Railsを使ったバックエンド開発の受諾実績あり。

## 学会・採択
- EAI MobiQuitous 2026 — 査読付き Regular Paper 採択（単著）2026: Kotaro Furukawa, "Claim-Capped Biosignal Feedback for Privacy-Calibrated Self-Observation on Mobile and Wearable Devices." 23rd EAI International Conference on Mobile and Ubiquitous Systems: Computing, Networking and Services, 2026. カメラレディ完了・DOI取得待ち（出版予定）
- インタラクション2026 2026: インタラクティブ発表（プレミアム）採択：「ストレスを〈測る〉から〈感じる〉へ― 膨張型インターフェースによる主観的体験の観察法」

## 受賞（大学以降）
- OpenAI Codex Student Builder Fest 2026 — 優勝 2026.09: チーム Poietra で参加。応募264チームから24チームに選抜され、上位4チームによる最終プレゼンを経て優勝。Codexを活用したIssue実装を担当。優勝特典として OpenAI DevDay [2026] San Francisco に招待。上位4チームへのChatGPT Pro 12か月分。
- 全国学生対抗SFプロトタイピング ハッカソン Electric Sheep 2026 — THE NEXT MOVE賞 (Presented by 株式会社アイシン) 2026.09: ハードウェア／駆動部の設計・実装を担当。副賞としてギフト券10万円分、アイシン試験場特別見学会・共創ディスカッション、スーパー耐久シリーズ第7戦＠富士スピードウェイのペアチケット等を獲得。
- M5Stack Global Innovation Contest 2026 — Special Mentions Game Innovation Award 2026: 「M5flick Punch A Giant Cushion To Type Japanese（フリック昇竜拳）」
- みらい共創Award2026（CoLabField主催）— CoLabField特別賞 2026: 「めんふぐ 〜ストレスを〈測る〉から〈感じる〉へ〜」
- SecHack365'26 研究駆動コース 採択 2026
- 日本財団HUMAIプログラム 第二期 — 奨励金A 採択 2026
- 技育CAMPハッカソン2026 vol.1 第2部 — サポーターズ賞 2026: 「脈アリ！？脈ナシ！？教えて！AI君！」
- 異能ベーションジェネレーションアワード — ノミネート 2025: 「ストレスを〈測る〉から〈感じる〉へ― 膨張型インターフェースによる主観的体験の観察法」 古川 耕太郎 (石川県)
- 技育博2025 vol.5（サポーターズ）— スポンサー賞（株式会社ゆめみ賞）2025: 「お寿司deゲーミングピアノ！」
- 技育博2025 vol.2（サポーターズ）— 企業賞（株式会社ゆめみ賞）2025: 「めんふぐ」
- ヒーローズリーグ2025 — MAID賞 2025: 「FrogEcho 〜カエルの合唱!!!〜」
- ヒーローズリーグ2025 — xorium賞 2025: 「めんふぐ」
- 学生アイデアファクトリー2025 — Springer Nature Gold賞（ポスター賞）2025: 「ストレスは挑戦か、不安か、それとも？〜意味づけの多様性を可視化するフグ型インタフェース〜」

## 起業・チーム活動
- 金沢大学の教員と共同で起業準備中（Bloomlandlabo）2025: 起業準備プロジェクトで、技術設計・実装・外部検証を主に担当

## コミュニティ・運営
- 100Program アラムナイメンター 2026
- STECH 所属（上位1%の学生エンジニアが集う審査制コミュニティ）2026
- 地域創造カフェ 初代代表 2024
- しらみね大学村 システム部 2025〜

## 学外発表
- 第15回日本ジオパーク全国大会（十勝岳大会）2025: ポスター発表「白山手取川ジオパーク資源を活用した観光商品開発の試み」

## 企業実務経験
- 大同工業（アルバイト）2024: 標準化活動、実装・評価プロセス、TPSに基づく改善・品質工学等（ハードウェア実務）

## 公開・アウトプット量
- GitHub 2025-2026: 240 OSSリポジトリ公開・10,000+contribute!! https://github.com/furukawa1020
- Protopedia 2025-2026: 50作品以上公開中（100いいね以上） https://protopedia.net/user/hatake

## その他・資格
- 書道師範資格（弥今本圖師範）2015
- 金沢大学公式サイト インタビュー記事掲載（2025-12-05）

## スキル
React, TypeScript, Vite, Tailwind CSS, Next.js, Ruby on Rails, FastAPI, Python, PostgreSQL,
Gemini API, OpenAI Codex, 生体信号解析, scikit-learn, M5Stack, Arduino, センサー, 駆動系設計,
ロボカップ, Railway, Netlify, Docker, GitHub Actions, HCI, プライバシー設計, プロトタイプ開発, 受託開発

受託開発・業務委託・プロトタイプ開発・採用のご相談は https://furukawalab.com/contact にて受け付けています。
`;

// ──────────────────────────────────────────────
// Route-specific config
// ──────────────────────────────────────────────
type PageMeta = { title: string; description: string; image?: string; body?: string };

function getPageMeta(pathname: string): PageMeta {
  if (pathname === "/" || pathname === "") {
    return {
      title: "古川耕太郎 公式サイト | Furukawa Archive OS — エンジニア・研究者・プロトタイパー",
      description: "古川耕太郎（Kotaro Furukawa / hatake）のポートフォリオ。EAI MobiQuitous 2026 採択・OpenAI Codex優勝・M5Stack受賞。受託開発・プロトタイプ・IoT・AI・Web開発を受け付けています。",
    };
  }
  if (pathname.startsWith("/achievements") || pathname.startsWith("/resume")) {
    return {
      title: "実績・受賞・論文・受託開発 | 古川耕太郎 (Kotaro Furukawa)",
      description: "古川耕太郎の全実績一覧。OpenAI Codex Student Builder Fest 2026優勝・Electric Sheep THE NEXT MOVE賞・EAI MobiQuitous 2026 Regular Paper採択・M5Stack受賞・異能ベーション・SecHack365・ヒーローズリーグ・技育博・ゆめみ賞・Springer Nature Gold賞等。受託開発・業務委託受付中。",
      body: ACHIEVEMENTS_TEXT,
    };
  }
  if (pathname.startsWith("/research")) {
    return {
      title: "研究 | 古川耕太郎 — Claim-Capped Biosignal Feedback / フグ型インターフェース",
      description: "古川耕太郎の研究：「Claim-Capped Biosignal Feedback for Privacy-Calibrated Self-Observation」(EAI MobiQuitous 2026)、インタラクション2026プレミアム採択「膨張型インターフェースによる主観的体験の観察法」。",
    };
  }
  if (pathname.startsWith("/works")) {
    return {
      title: "Works | 古川耕太郎 — プロトタイプ作品集",
      description: "古川耕太郎（hatake）のプロトタイプ・制作物一覧。M5flick・めんふぐ・FrogEcho・金沢競馬予想AI等。ハードウェア・IoT・Web・AI領域の240以上のリポジトリ。",
    };
  }
  if (pathname.startsWith("/about")) {
    return {
      title: "About | 古川耕太郎（Kotaro Furukawa）— プロフィール",
      description: "古川耕太郎（Kotaro Furukawa / はたけ / hatake）のプロフィール。金沢大学在学。エンジニア・研究者・プロトタイパー。受託開発・業務委託受付中。",
    };
  }
  if (pathname.startsWith("/contact")) {
    return {
      title: "Contact | 古川耕太郎 — 仕事・採用・受託開発のご相談",
      description: "古川耕太郎へのお問い合わせ。受託開発・業務委託・プロトタイプ開発・共同研究・インターン・採用のご相談はこちら。",
    };
  }
  if (pathname.startsWith("/blog/")) {
    return {
      title: "Blog | 古川耕太郎 — 研究・開発ブログ",
      description: "古川耕太郎のブログ。研究の進捗、プロトタイプ開発の記録、日々の気づき。",
    };
  }
  return {
    title: "古川耕太郎 公式サイト | Furukawa Archive OS",
    description: "古川耕太郎（Kotaro Furukawa / hatake）のポートフォリオサイト。研究・開発・受賞実績・受託開発情報。",
  };
}

function buildHtml(meta: PageMeta, canonicalUrl: string): string {
  const t = esc(meta.title);
  const d = esc(meta.description);
  const img = esc(meta.image || OG_IMAGE);
  const url = esc(canonicalUrl);
  const bodyText = meta.body ? meta.body.split("\n").map(l => `<p>${esc(l)}</p>`).join("\n") : "";

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${t}</title>
  <meta name="description" content="${d}">
  <meta name="keywords" content="古川耕太郎, Kotaro Furukawa, hatake, furukawa1020, OpenAI Codex優勝, EAI MobiQuitous, M5Stack受賞, Electric Sheep THE NEXT MOVE賞, SecHack365, 異能ベーション, ヒーローズリーグ, 技育博, ゆめみ賞, Springer Nature Gold賞, 受託開発, 業務委託, プロトタイプ開発, IoT, AI, React, FastAPI, M5Stack, 金沢大学">
  <meta property="og:title" content="${t}">
  <meta property="og:description" content="${d}">
  <meta property="og:image" content="${img}">
  <meta property="og:url" content="${url}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Furukawa Archive OS">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@HATAKE55555">
  <meta name="twitter:creator" content="@HATAKE55555">
  <meta name="twitter:title" content="${t}">
  <meta name="twitter:description" content="${d}">
  <meta name="twitter:image" content="${img}">
  <link rel="canonical" href="${url}">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "古川耕太郎",
    "alternateName": ["Kotaro Furukawa", "hatake", "furukawa1020", "ko1020"],
    "url": "https://furukawalab.com/",
    "email": "k.furu1020@gmail.com",
    "jobTitle": "エンジニア / 研究者 / プロトタイパー",
    "sameAs": [
      "https://twitter.com/HATAKE55555",
      "https://github.com/furukawa1020",
      "https://protopedia.net/prototyper/hatake"
    ],
    "hasOccupation": {
      "@type": "Occupation",
      "name": "フリーランスエンジニア / 受託開発",
      "description": "受託開発・業務委託・プロトタイプ開発・AI開発・ハードウェア開発を受け付けています。"
    },
    "award": [
      "OpenAI Codex Student Builder Fest 2026 優勝",
      "EAI MobiQuitous 2026 Regular Paper 採択（単著）",
      "Electric Sheep 2026 THE NEXT MOVE賞 (Presented by 株式会社アイシン)",
      "M5Stack Global Innovation Contest 2026 Special Mentions Game Innovation Award",
      "みらい共創Award2026 CoLabField特別賞",
      "SecHack365'26 研究駆動コース採択",
      "日本財団HUMAIプログラム 奨励金A採択",
      "異能ベーションジェネレーションアワード2025 ノミネート",
      "Springer Nature Gold賞（ポスター賞）",
      "ヒーローズリーグ2025 MAID賞・xorium賞",
      "技育博2025 ゆめみ賞（vol.2・vol.5）",
      "技育CAMPハッカソン2026 サポーターズ賞"
    ],
    "knowsAbout": ["React", "TypeScript", "FastAPI", "Ruby on Rails", "M5Stack", "IoT", "HCI", "生体信号処理", "AI開発", "プロトタイプ開発", "受託開発", "ハッカソン", "プライバシー設計"]
  }
  </script>
</head>
<body>
  <h1>${t}</h1>
  <p>${d}</p>
  <section>
    <h2>古川耕太郎（Kotaro Furukawa）について</h2>
    <p>金沢大学在学のエンジニア・研究者・プロトタイパー。ハードウェア（M5Stack・Arduino・センサー）からWebフルスタック（React・Rails・FastAPI）・AI（Gemini・Codex・生体信号解析）まで一貫して実装できます。受託開発・業務委託・プロトタイプ開発を随時受け付けています。</p>
  </section>
  <section>
    ${bodyText}
  </section>
  <footer>
    <p>お問い合わせ: <a href="https://furukawalab.com/contact">https://furukawalab.com/contact</a></p>
    <p>GitHub: <a href="https://github.com/furukawa1020">furukawa1020</a></p>
  </footer>
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
  const meta = getPageMeta(url.pathname);

  return new Response(buildHtml(meta, req.url), {
    headers: {
      "content-type": "text/html;charset=UTF-8",
      "cache-control": "public, max-age=600",
    },
  });
}
