import { useState, useEffect, useCallback } from 'react';
import { X, Share2, Copy, Check, BookOpen, FileText, Microscope, ExternalLink } from 'lucide-react';

// ─── コンテンツ定義 ────────────────────────────────────────────────

const ONE_LINE = `ストレスを当てるのではなく、「いつもの自分と今がどれくらい違うか」だけを捉え、その情報から本人特定や元データの復元がどこまでできてしまうかを攻撃実験で調べながら、「あなたはストレスです」のような断定をシステムが出せないようにした生体情報フィードバックの研究です。`;

type Section = { heading?: string; sub?: string; body: string; term?: { word: string; def: string }[] };

const SHORT_SECTIONS: Section[] = [
    {
        heading: "Claim-Capped Biosignal Feedback",
        body: "心拍や皮膚電気活動などの生体情報から、ストレスや感情状態を推定する研究は多くあります。\n\nしかし、心拍が普段より高いからといって、その原因が必ずストレスとは限りません。運動、暑さ、カフェイン、体調、興奮、仕事量、センサの誤差など、さまざまな理由が考えられます。",
    },
    {
        heading: "扱うのは「普段との差」だけ",
        body: "「あなたはストレス状態です」と当てることを目的にせず、\n\n「今の生体・行動パターンが、その人自身の普段とどれくらい違うか」\n\nだけを扱います。",
    },
    {
        heading: "信号処理と圧縮",
        body: "60秒ごとの生体信号から平均、標準偏差、中央値、傾き、周波数成分などを計算し、WESADとCASEでは208個の数値にまとめました。\n\n次に、その値を他人と比べるのではなく、本人の普段の値と比較して「自分の通常状態からどれだけずれているか」に変換します。\n\nさらにPCA（主成分分析・似た動きの数値をまとめて少ない数に圧縮する方法）を使い、208個の特徴を8個の値に圧縮しました。",
    },
    {
        heading: "3種類の攻撃実験",
        body: "圧縮後のデータに対して、\n\n● そのデータが誰のものか当てられるか\n● 元の208個の特徴をどこまで復元できるか\n● そのデータが学習用に使われたものか当てられるか\n\nという攻撃を行いました。\n\nWESADでは、「普段と違う状態」を順位づけるAUROCが0.994でした。一方で、本人特定に使える情報や元特徴を復元できる情報は、圧縮前より減少しました。\n\nただし、学習データかどうかを当てるMembership InferenceはAUC 0.690で、まだ情報が残っています。",
        term: [{ word: "AUROC", def: "モデルが「普段と違う状態」を正しく順位づけられるかを表す指標。1.0が完璧、0.5が偶然と同じ。" }],
    },
    {
        heading: "断定文をシステム側で禁止する",
        body: "通知タイミングにも問題がありました。非baseline状態には反応できた一方、普段の状態でも60%の窓で通知条件を超えてしまいました。\n\nまた、ユーザーへ出せる文章そのものを制限しました。\n\nシステムが出せるのは：\n\n✓「現在のパターンが、普段と異なっています」\n✓「普段と少し違うようです。自分の状態を確認してみますか？」\n\n「あなたはストレス状態です」「集中できていません」「体調が悪いです」といった断定は、そもそも出力候補に入れていません。",
    },
    {
        heading: "この研究が考えたいこと",
        body: "AIが人について何を当てられるかだけでなく、何をデータとして残し、何をユーザーに言ってよいのかまで、システム側で設計する必要があるのではないか。",
    },
];

type LongSection = { heading: string; sub?: string; body: string; items?: string[]; terms?: { word: string; def: string }[] };

const LONG_SECTIONS: LongSection[] = [
    {
        heading: "研究の背景と動機",
        body: "本研究では、スマートウォッチやウェアラブルセンサから得られる生体情報を使いながら、ユーザーに対して「あなたはストレス状態です」のような断定をしない生体情報フィードバックの仕組みを研究しました。\n\n心拍、皮膚電気活動、呼吸、体温、加速度などの情報から、ストレスや感情状態を推定する研究はすでに数多くあります。\n\nしかし、生体情報に変化があったことと、その原因が分かることは同じではありません。\n\nたとえば心拍数が普段より高かったとしても、その原因はストレスとは限りません。運動した直後かもしれません。暑い場所にいたのかもしれません。コーヒーを飲んだ影響かもしれません。\n\nそれにもかかわらず、システムが一つの原因に決めつけて「あなたはストレス状態です」と表示すると、生体信号の曖昧な変化が、本人や周囲から固定的な評価として扱われる可能性があります。",
    },
    {
        heading: "扱う情報：within-person atypicality",
        sub: "「今の自分が、普段の自分とどれくらい違うか」",
        body: "論文ではこれをwithin-person atypicality（個人内の非典型性）と呼んでいます。\n\nこれは「ストレスである確率」ではありません。病気、生産性、集中度、感情状態などを表す数値でもありません。\n\nあくまで「いつもの自分と比べると、現在の生体・行動パターンは少し違っている」という情報だけを扱います。",
        terms: [{ word: "within-person atypicality（個人内の非典型性）", def: "自分自身の過去の「普段の状態」と現在を比較したときのずれ量。他人との比較ではない。" }],
    },
    {
        heading: "生体信号の特徴化（60秒窓）",
        body: "今回の実装では、生体信号を重複しない60秒単位に区切りました。その60秒間について以下を計算します：",
        items: ["平均・標準偏差・中央値・四分位範囲・最小値・最大値", "10パーセンタイル・90パーセンタイル", "時間方向の傾き・信号のエネルギー", "最も強い周波数・歪度・尖度"],
    },
    {
        heading: "本人の普段と比較する",
        body: "たとえば、心拍が90だったとしても、それだけでは何も分かりません。普段60の人が90になった場合と、普段85の人が90になった場合では意味が違うからです。\n\n参加者ごとに普段の中央値とばらつきを計算し、現在の値をそこから比較して「本人の通常状態から、どの程度離れているか」に変換しました。\n\nただし、この処理だけでプライバシーが守られるわけではありません。本人固有の特徴が残っている可能性があるため、実際に攻撃を行って確認します。",
    },
    {
        heading: "PCAによる圧縮（208個 → 8個）",
        body: "WESADとCASEでは1窓につき208個の特徴があります。そのままでは多くの情報が残ります。\n\nPCA（主成分分析）を使い、「似た動きをする数値をまとめて、重要な変化をなるべく残しながら少ない数に圧縮する方法」で、208個を8個の値（論文ではz_pと表記）まで圧縮しました。\n\n狙いは「普段と違う」という情報は残す一方で、本人特定や元特徴の復元に使える情報を減らせないか、というものです。",
        terms: [{ word: "PCA（主成分分析）", def: "多数の数値の中から、最も変化が大きい「方向」を見つけ出し、それを軸に少ない数の値へ変換する統計手法。" }],
    },
    {
        heading: "本人識別に使われやすい情報をさらに除去",
        body: "参加者IDを当てる分類器を作り、「どの方向の情報が、誰のデータかを見分けるのに使われているか」を調べます。\n\nその方向の情報を表現から取り除いた後、PCAで圧縮した表現をidentity-suppressed representationと呼んでいます。\n\n重要なのは、この処理をしたから匿名になるわけではない、という点です。数学的にプライバシーを保証する方式ではないため、実際に攻撃モデルで確認します。",
        terms: [{ word: "identity-suppressed representation", def: "本人識別に使われやすい方向の情報を取り除いた後に圧縮した表現。匿名性を「保証」するものではなく、リスクを「低減する試み」。" }],
    },
    {
        heading: "3種類の攻撃実験",
        sub: "どこまで情報が残っているかを実際に調べる",
        body: "① 本人特定（Identity Attack）\n圧縮後のデータから「このデータは参加者A、B、Cの誰のものか」を推定します。\n\n② 元特徴の復元（Reconstruction Attack）\n圧縮後の8個の値から元の208個の特徴をどこまで復元できるかを調べました。なお、復元対象は60秒窓から作った標準化済みの特徴量であり、元の生のPPG波形そのものではありません。\n\n③ 学習データかどうか当てる（Membership Inference Attack）\n「この60秒窓は学習側に含まれていたデータか」を推定しました。「この人そのものが研究参加者だったか」を当てるparticipant-levelのmembershipとは異なります。",
        terms: [
            { word: "Membership Inference Attack", def: "「このデータが学習に使われたか」を推定する攻撃。高精度で当てられるほど、学習データに固有の情報が残っていることを意味する。" },
        ],
    },
    {
        heading: "3つの公開データセットで評価",
        body: "● WESAD（主評価）：15名、ストレス・感情研究でよく使われる公開データセット。526窓を使用。Neutralをbaselineとして扱い、StressとAmusementは「baselineとは異なる状態」としてまとめて扱います（分類するためではない）。\n\n● CASE（補助評価）：30名、1200窓。連続的なvalence/arousal評価あり。明確なbaselineラベルがないため、補助的な分析に使用。\n\n● SWELL-KW（境界条件の確認）：22名、1437窓。時間制約やメール割り込みを含む知識労働環境。WESADで有効だった方法が、仕事に近い文脈でも機能するかを確認。",
    },
    {
        heading: "WESADの結果：普段との差の検出",
        body: "identity-suppressed representationを使った場合：\n\nAUROC 0.994\n\n（元の特徴量そのまま: 0.750 → 個人内差分: 0.796 → PCA圧縮: 0.993 → Identity suppression後: 0.994）\n\nここで評価しているのは「ストレスを正しく分類できるか」ではなく、baseline状態とnon-baseline状態を「普段と違う状態ほど高いスコアになるよう順位づけできるか」です。",
        terms: [{ word: "AUROC", def: "Receiver Operating Characteristic曲線の下の面積。1.0が完璧、0.5が偶然と同じレベル。普段状態と非普段状態を正しく順位づける能力を表す。" }],
    },
    {
        heading: "WESADの結果：プライバシー関連",
        body: "本人特定のIdentity Advantage：\n元特徴: 0.882 → 個人内差分: 0.811 → PCA圧縮: 0.509 → Identity suppression後: 0.455\n\n元特徴の復元（Reconstruction AUC）：\n元特徴: 0.999 → 個人内差分: 0.594 → PCA圧縮: 0.389 → Identity suppression後: 0.388\n\n「普段と違う」情報を高く保ったまま、本人特定や元特徴復元に使える情報を減らす方向性は確認されました。\n\nただし、Membership InferenceはAUC 0.690と、まだ情報が残っています。この研究では「プライバシー問題を解決した」とは主張していません。",
    },
    {
        heading: "失敗結果：通知タイミングの問題",
        body: "WESADでは、non-baseline状態に対するtrigger rateは1.000でした。\n\n一方で、baseline状態でも60%の窓で通知条件を超えてしまいました（false alarm rate = 0.600）。\n\nつまり「普段と違う状態を順位づける」ことはできても、「本当に通知すべきタイミングだけで通知する」ことはできていません。\n\nそのため、この研究では「日常利用できる通知システムが完成した」とは主張していません。",
    },
    {
        heading: "WESAD以外の結果",
        body: "CASEでは、identity-suppressed representationと参加者内のvalence/arousal変化とのSpearman相関は0.219。強い関係ではありませんでした。\n\nSWELL-KWでは、個人内差分だけの場合はAUROC 0.656でしたが、identity suppression後は0.524まで低下しました。\n\nWESADで得られた結果が、そのまま仕事環境や別のデータセットに一般化したわけではありません。論文でもSWELL-KWは成功例ではなく、うまくいかない条件を示すboundary caseとして扱っています。",
    },
    {
        heading: "Claim Cap Layer：断定文を禁止する仕組み",
        body: "システムがユーザーに言ってよい文章そのものを制限する仕組みです。\n\n出力できる内容は3段階のみ：\n\nLevel 0：何も表示しない\nLevel 1：「現在のパターンが、あなたの普段の状態と異なっています」\nLevel 2：「普段と少し違うようです。自分の状態を確認してみますか？」\n\n「あなたはストレス状態です」「集中できていません」「体調が悪いです」はそもそも出力候補に含めていません。重要なのは、スコアが高くても「普段とかなり違う」から「だからストレスである」という意味の飛躍を許さない点です。\n\n今回のClaim Capは生成AIが自由に文章を作る方式ではなく、あらかじめ許可した固定文章のみを使います。「stress」「unwell」「performance」「diagnosis」など断定や評価につながる14種類の文字列が含まれていないことを検査した結果、Unsupported Claim Rate = 0.000、Diagnostic Label Rate = 0.000でした。",
        terms: [{ word: "Claim Cap Layer", def: "システムがユーザーに出力できる文章の種類を事前に制限する仕組み。断定的・評価的な言い回しを禁止リストとして管理する。" }],
    },
    {
        heading: "この研究でできたこと・できていないこと",
        body: "確認できたこと：\n✓ WESADでは、普段との差の情報を保持しながら本人特定・元特徴復元に使える情報を減らせる可能性\n✓ ユーザーへの出力内容をシステム側で実装として制限できること\n\nできていないこと・残っている課題：\n✗ Membership Inferenceはまだ残っている（AUC 0.690）\n✗ 通知のfalse alarm rateが0.600と高い\n✗ CASEでは効果が弱い\n✗ SWELL-KWではutilityが大きく低下\n✗ 実環境での長期評価は未実施\n✗ ユーザーが本当に役立つと感じるかは未調査",
    },
    {
        heading: "この研究が最も考えたかったこと",
        sub: "「当てられるか」だけでなく、「何をデータに残し、何をユーザーに言ってよいか」まで設計する",
        body: "生体情報AIでは「人について、どこまで正確に当てられるか」がよく研究されます。私はそれだけでは不十分だと考えました。\n\n当てられるようになったとしても、その情報をシステムの中に残す必要があるのか。その情報をユーザーに伝える必要があるのか。伝えるとして、どこまで断定してよいのか。も設計する必要があります。\n\n目標は、生体情報を使ってユーザーについてより多くのことを言えるようにすることではありません。\n\n必要な気づきは残しながら、必要以上の情報を残さず、必要以上のことを言わないシステムを作れるか。それを技術として検討した研究です。",
    },
];

// ─── 共有ボタン ────────────────────────────────────────────────────

const ShareButton = () => {
    const [copied, setCopied] = useState(false);
    const url = `${window.location.origin}/research`;
    const text = "Claim-Capped Biosignal Feedback — 「ストレスを当てる」のではなく「普段との差」だけを扱い、断定を禁止した生体情報フィードバック研究";

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
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 rounded-md text-xs font-mono cursor-help border border-cyan-200 dark:border-cyan-700 hover:bg-cyan-200 dark:hover:bg-cyan-800 transition-colors"
            >
                📖 {word}
            </button>
            {open && (
                <span className="absolute z-50 left-0 top-full mt-1 w-72 p-3 bg-white dark:bg-neutral-800 border border-cyan-200 dark:border-cyan-700 rounded-xl shadow-2xl text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    <strong className="text-cyan-600 dark:text-cyan-400">{word}</strong>：{def}
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

export const ResearchModal = ({ onClose }: { onClose: () => void }) => {
    const [tab, setTab] = useState<Tab>('short');

    // ESCで閉じる
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
            aria-label="研究詳細モーダル"
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
                                <span className="inline-block px-3 py-1 bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 text-xs font-bold rounded-full uppercase tracking-wider">
                                    EAI MobiQuitous 2026 · Regular Paper
                                </span>
                                <span className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-full">
                                    単著
                                </span>
                            </div>
                            <h2 className="text-xl md:text-2xl font-black text-neutral-900 dark:text-white leading-tight">
                                Claim-Capped Biosignal Feedback
                                <span className="block text-base font-medium text-neutral-500 dark:text-neutral-400 mt-1">
                                    for Privacy-Calibrated Self-Observation on Mobile and Wearable Devices
                                </span>
                            </h2>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Kotaro Furukawa</p>
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
                    <div className="p-4 bg-gradient-to-r from-cyan-50 to-purple-50 dark:from-cyan-950/30 dark:to-purple-950/30 rounded-2xl border border-cyan-100 dark:border-cyan-900/50">
                        <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed font-medium">
                            💡 {ONE_LINE}
                        </p>
                    </div>

                    {/* タブ */}
                    <div className="flex gap-2 mt-5">
                        <button
                            onClick={() => setTab('short')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${tab === 'short'
                                ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30'
                                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                                }`}
                        >
                            <FileText size={15} />
                            短い版
                        </button>
                        <button
                            onClick={() => setTab('long')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${tab === 'long'
                                ? 'bg-purple-500 text-white shadow-md shadow-purple-500/30'
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
                                        <h3 className="text-lg font-black text-neutral-900 dark:text-white border-l-4 border-cyan-500 pl-3">
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
                                        <h3 className="text-xl font-black text-neutral-900 dark:text-white border-l-4 border-purple-500 pl-4 leading-snug">
                                            {sec.heading}
                                        </h3>
                                        {sec.sub && (
                                            <p className="mt-1 ml-5 text-base font-bold text-purple-600 dark:text-purple-400">
                                                {sec.sub}
                                            </p>
                                        )}
                                    </div>
                                    <BodyText text={sec.body} />
                                    {sec.items && (
                                        <ul className="ml-4 space-y-1">
                                            {sec.items.map((item, j) => (
                                                <li key={j} className="text-neutral-700 dark:text-neutral-300 text-sm flex gap-2">
                                                    <span className="text-cyan-500 flex-shrink-0">▸</span>
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

                {/* フッター（共有ボタン） */}
                <div className="flex-shrink-0 px-8 py-5 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/80">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-2 text-sm text-neutral-500">
                                <BookOpen size={14} />
                                <span>カメラレディ完了・DOI取得待ち</span>
                            </div>
                            <a
                                href="https://confyplus.eai.eu/app#manage-paper/id/367209/cid/53753/tid/5314"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-sm font-bold text-cyan-600 dark:text-cyan-400 hover:underline"
                            >
                                <ExternalLink size={13} />
                                論文管理ページ
                            </a>
                            <a
                                href="https://mobiquitous.eai-conferences.org/2026/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-sm font-bold text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                            >
                                <ExternalLink size={13} />
                                会議公式サイト
                            </a>
                        </div>
                        <ShareButton />
                    </div>
                </div>
            </div>
        </div>
    );
};
