import { useState, useEffect, useCallback } from 'react';
import { X, Share2, Copy, Check, BookOpen, FileText, Microscope, ExternalLink } from 'lucide-react';

// ─── コンテンツ定義 ────────────────────────────────────────────────

const ONE_LINE = `ストレスを数値で「診断」するのではなく、心拍変動（HRV）の波を膨張するフグ型物理インターフェースの触覚・視覚フィードバックに変換し、不安・挑戦など個人による意味づけの多様性を直感的に観察できるようにした研究です。`;

type Section = { heading?: string; sub?: string; body: string; term?: { word: string; def: string }[] };

const SHORT_SECTIONS: Section[] = [
    {
        heading: "ストレスを“測る”から“感じる”へ",
        body: "心拍数や心拍変動（HRV）が生理的に変化したとき、従来のシステムは「ストレス状態です」と数値やグラフで表示しがちでした。\n\nしかし、同じ心拍の変化であっても、本人にとっては「不安」なこともあれば「挑戦へのワクワク」「緊張」「集中」であることもあります。",
    },
    {
        heading: "数値ではなく物理的な「膨張」で伝える",
        body: "本研究では、生理指標（HRVのRMSSDなど）を画面上の数値ではなく、ふくらんだりしぼんだりする物理的な「フグ型インターフェース（通称：めんふぐ）」の動きとして外在化しました。\n\n触覚や視覚を通じて生理変化を感じ取ることで、数値化される前の「自分の感覚」と向き合うきっかけを作ります。",
    },
    {
        heading: "主観的体験と「意味づけ」の観察",
        body: "システムが「あなたはストレスです」と決定づけるのではなく、膨張するぬいぐるみを触りながら「いま自分はどんな状態だろう？」と振り返る枠組みを提案しています。\n\n生理反応と本人の主観的解釈のズレや多様性を観察可能にすることが本研究の狙いです。",
        term: [{ word: "HRV (心拍変動)", def: "心拍の間隔がどれくらい変化しているかを表す指標。自律神経の活動状態を反映する。" }],
    },
    {
        heading: "学会での評価",
        body: "情報処理学会シンポジウム「インタラクション2026」において、厳正な査読のもと【プレミアム発表（☆）】として採択されました。",
    },
];

type LongSection = { heading: string; sub?: string; body: string; items?: string[]; terms?: { word: string; def: string }[] };

const LONG_SECTIONS: LongSection[] = [
    {
        heading: "研究の背景：数値による「評価の固定化」への問題意識",
        body: "スマートウォッチなどの普及により、リアルタイムで心拍数やストレススコアを測定できるようになりました。\n\nしかし、「ストレス＝悪」「HRV低下＝ストレス」といった一律の数値判定は、本人の多様な心理状態（ワクワク、心地よい緊張、集中など）を単一の意味に決めつけてしまうリスクがあります。\n\n本研究では、生理反応を自動診断の入力にするのではなく、本人が自分の状態を観察・意味づけするためのヒントとして提示する新たなインターフェースのあり方を模索しました。",
    },
    {
        heading: "提案手法：フグ型膨張インターフェース",
        sub: "生理指標の触覚・視覚的メッセージ化",
        body: "ウェアラブルデバイスで取得した心拍変動（HRV / RMSSD等）のデータをリアルタイムに解析し、ESP32等のマイコンを通じてエアポンプを制御。\n\nフグのぬいぐるみが膨張・収縮する物理的なフィードバックを提示します。\n\n画面の数値を見続けるストレスを避け、手で触れたり傍に置いたりすることで、自然に生理変化を知覚できる物理的インタラクションを実現しました。",
        terms: [
            { word: "RMSSD", def: "隣り合う心拍間隔の差の二乗平均平方根。心拍変動解析において副交感神経活動の指標としてよく用いられる。" },
            { word: "ESP32", def: "Wi-FiやBluetoothを標準搭載した小型・低価格のマイコンボード。物理デバイスの制御に使用。" }
        ],
    },
    {
        heading: "システム構成と動作フロー",
        body: "システムの全体フローは以下の通りです：",
        items: [
            "Fitbit / ウェアラブルセンサ：心拍データの取得とHRV（心拍変動）の抽出",
            "ローカル信号処理：リアルタイムで自律神経バランスの変化量を算出",
            "物理アクチュエーション：ESP32＋エアポンプ＋ソレノイドバルブによるフグの膨張・収縮制御",
            "ユーザの観察とリフレクション：触覚・視覚フィードバックを通じた主観的状態の意味づけ"
        ],
    },
    {
        heading: "本研究がもたらす新しい視点",
        body: "① 「診断」から「自己観察」へ\nAIやシステムが「ストレスです」と答えを出すのではなく、ユーザが「ふくらんでいるから、今少し緊張しているのかな？」と自問する余白を残します。\n\n② 生理データと主観の意味づけの分岐点\n同じ膨張パターンであっても、プレゼン前なら「挑戦の興奮」、締め切り前なら「焦り」というように、文脈に応じた多様な意味づけを許容・観察します。\n\n③ 身体性を伴うアンビエントフィードバック\n視覚的なディスプレイ通知に依存せず、触覚とゆるやかな形状変化によって日常生活に溶け込むフィードバックのあり方を検証しました。",
    },
    {
        heading: "採択・発表情報",
        body: "本研究「ストレスを“測る”から“感じる”へ：膨張型インターフェースによる主観的体験の観察法」（古川耕太郎, 秋田純一）は、情報処理学会シンポジウム【インタラクション2026】にてプレミアム発表（採択率の高い特別枠）として選出・発表されました。（論文ID: 1B33）",
    },
];

// ─── 共有ボタン ────────────────────────────────────────────────────

const ShareButton = () => {
    const [copied, setCopied] = useState(false);
    const url = `${window.location.origin}/research`;
    const text = "「ストレスを“測る”から“感じる”へ：膨張型インターフェースによる主観的体験の観察法」— インタラクション2026 プレミアム発表（古川耕太郎, 秋田純一）";

    const handleCopy = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&via=HATAKE55555`;

    return (
        <div className="flex gap-2 flex-wrap">
            <a
                href={tweetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full text-sm font-bold hover:opacity-80 transition-opacity"
            >
                <Share2 size={14} />
                X でシェア
            </a>
            <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-full text-sm font-bold hover:opacity-80 transition-opacity"
            >
                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                {copied ? "コピーしました" : "URLをコピー"}
            </button>
        </div>
    );
};

// ─── Term（専門用語）バッジ ────────────────────────────────────────

const TermBadge = ({ word, def }: { word: string; def: string }) => {
    const [open, setOpen] = useState(false);
    return (
        <span className="relative inline-block">
            <button
                onClick={() => setOpen(v => !v)}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-md text-xs font-mono cursor-help border border-purple-200 dark:border-purple-700 hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
            >
                📖 {word}
            </button>
            {open && (
                <span className="absolute z-50 left-0 top-full mt-1 w-72 p-3 bg-white dark:bg-neutral-800 border border-purple-200 dark:border-purple-700 rounded-xl shadow-2xl text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    <strong className="text-purple-600 dark:text-purple-400">{word}</strong>：{def}
                </span>
            )}
        </span>
    );
};

// ─── テキストを段落に分割して表示 ─────────────────────────────────

const BodyText = ({ text }: { text: string }) => (
    <div className="space-y-4">
        {text.split('\n\n').map((para, i) => (
            <p key={i} className="text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-line text-base">
                {para}
            </p>
        ))}
    </div>
);

// ─── モーダル本体 ─────────────────────────────────────────────────

type Tab = 'short' | 'long';

export const Interaction2026Modal = ({ onClose }: { onClose: () => void }) => {
    const [tab, setTab] = useState<Tab>('short');

    const handleKey = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
    }, [onClose]);

    useEffect(() => {
        document.addEventListener('keydown', handleKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKey);
            document.body.style.overflow = '';
        };
    }, [handleKey]);

    return (
        <div
            className="fixed inset-0 z-[999] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label="研究詳細モーダル - インタラクション2026"
        >
            {/* オーバーレイ */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* モーダルウィンドウ */}
            <div className="relative z-10 w-full max-w-3xl max-h-[90vh] flex flex-col bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">

                {/* ヘッダー */}
                <div className="flex-shrink-0 px-8 pt-8 pb-6 border-b border-neutral-100 dark:border-neutral-800">
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-full uppercase tracking-wider">
                                    情報処理学会 インタラクション2026 ☆ プレミアム発表
                                </span>
                                <span className="inline-block px-3 py-1 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-xs font-bold rounded-full">
                                    論文ID: 1B33
                                </span>
                            </div>
                            <h2 className="text-xl md:text-2xl font-black text-neutral-900 dark:text-white leading-tight">
                                ストレスを“測る”から“感じる”へ
                                <span className="block text-base font-medium text-neutral-500 dark:text-neutral-400 mt-1">
                                    膨張型インターフェースによる主観的体験の観察法
                                </span>
                            </h2>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">古川耕太郎, 秋田純一（金沢大学）</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="flex-shrink-0 p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                            aria-label="閉じる"
                        >
                            <X size={20} className="text-neutral-500" />
                        </button>
                    </div>

                    {/* 一言説明（常時表示） */}
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-2xl border border-purple-100 dark:border-purple-900/50">
                        <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed font-medium">
                            💡 {ONE_LINE}
                        </p>
                    </div>

                    {/* タブ */}
                    <div className="flex gap-2 mt-5">
                        <button
                            onClick={() => setTab('short')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${tab === 'short'
                                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                                }`}
                        >
                            <FileText size={15} />
                            短い版
                        </button>
                        <button
                            onClick={() => setTab('long')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${tab === 'long'
                                ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30'
                                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                                }`}
                        >
                            <Microscope size={15} />
                            長い版（全内容）
                        </button>
                    </div>
                </div>

                {/* スクロール可能なコンテンツ */}
                <div className="flex-1 overflow-y-auto px-8 py-6">
                    {tab === 'short' && (
                        <div className="space-y-8">
                            {SHORT_SECTIONS.map((sec, i) => (
                                <div key={i} className="space-y-3">
                                    {sec.heading && (
                                        <h3 className="text-lg font-black text-neutral-900 dark:text-white border-l-4 border-purple-500 pl-3">
                                            {sec.heading}
                                        </h3>
                                    )}
                                    <BodyText text={sec.body} />
                                    {sec.term && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {sec.term.map((t, j) => (
                                                <TermBadge key={j} word={t.word} def={t.def} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {tab === 'long' && (
                        <div className="space-y-10">
                            {LONG_SECTIONS.map((sec, i) => (
                                <div key={i} className="space-y-3">
                                    <div>
                                        <h3 className="text-xl font-black text-neutral-900 dark:text-white border-l-4 border-pink-500 pl-4 leading-snug">
                                            {sec.heading}
                                        </h3>
                                        {sec.sub && (
                                            <p className="mt-1 ml-5 text-base font-bold text-pink-600 dark:text-pink-400">
                                                {sec.sub}
                                            </p>
                                        )}
                                    </div>
                                    <BodyText text={sec.body} />
                                    {sec.items && (
                                        <ul className="ml-4 space-y-1">
                                            {sec.items.map((item, j) => (
                                                <li key={j} className="text-neutral-700 dark:text-neutral-300 text-sm flex gap-2">
                                                    <span className="text-purple-500 flex-shrink-0">▸</span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    {sec.terms && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {sec.terms.map((t, j) => (
                                                <TermBadge key={j} word={t.word} def={t.def} />
                                            ))}
                                        </div>
                                    )}
                                    {i < LONG_SECTIONS.length - 1 && (
                                        <div className="border-b border-neutral-100 dark:border-neutral-800 pt-4" />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* フッター（共有ボタン＆リンク） */}
                <div className="flex-shrink-0 px-8 py-5 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/80">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-2 text-sm text-neutral-500">
                                <BookOpen size={14} />
                                <span>1B33 · プレミアム発表（☆）</span>
                            </div>
                            <a
                                href="https://www.interaction-ipsj.org/2026/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-sm font-bold text-purple-600 dark:text-purple-400 hover:underline"
                            >
                                <ExternalLink size={13} />
                                学会公式サイト
                            </a>
                        </div>
                        <ShareButton />
                    </div>
                </div>
            </div>
        </div>
    );
};
