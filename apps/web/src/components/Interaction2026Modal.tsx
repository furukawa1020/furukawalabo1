import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Share2, Copy, Check, BookOpen, FileText, Microscope, ExternalLink, Sparkles } from 'lucide-react';

// ─── コンテンツ定義 (完全維持) ────────────────────────────────────────────────

const ONE_LINE = `心拍変動（HRV）を「ストレス値」として画面に表示するのではなく、フグ型ぬいぐるみ「めんふぐ」が物理的に膨らむ触覚・視覚フィードバックへ変換することで、同じ身体の変化でも「不安」と感じるか「挑戦」と感じるかという意味づけの個人差を、ユーザー自身が直感的に観察・内省できるようにした研究です。`;

type Section = { heading?: string; sub?: string; body: string; term?: { word: string; def: string }[] };

const SHORT_SECTIONS: Section[] = [
    {
        heading: `ストレスを“測る”から“感じる”へ`,
        body: "心拍数や心拍変動（HRV）が生理的に変化したとき、従来のシステムは「ストレス状態です」と数値やグラフで表示しがちでした。\n\nしかし、同じ心拍の変化であっても、本人にとっては「不安」なこともあれば「挑戦へのワクワク」「緊張」「集中」であることもあります。\n\nさらに、数値を見ることで「私はストレスを感じているのか」という先入観が生まれ、実際の感覚を上書きしてしまうリスクもあります。",
        term: [{ word: "HRV（心拍変動）", def: "心拍と心拍の間隔がどれくらいばらついているかを表す指標。自律神経の活動状態を反映し、ストレス研究でよく使われる。" }],
    },
    {
        heading: "生理変化を「膨らむ」という動きに変換する",
        body: "本研究では、生理指標（HRVのRMSSDなど）を画面上の数値ではなく、ふくらんだりしぼんだりする物理的な「フグ型インターフェース（通称：めんふぐ）」の動きとして外在化しました。\n\nFitbitなどのウェアラブル端末から心拍データを取得し、ESP32で制御されたソレノイドバルブと真空ポンプが、フグ型ぬいぐるみを膨張・収縮させます。\n\n触覚や視覚を通じて生理変化を「感じ取る」ことで、数値化される前の「自分の感覚」と向き合うきっかけを作ります。",
        term: [
            { word: "RMSSD", def: "HRVの指標のひとつ。連続する心拍間隔の差の二乗平均平方根。副交感神経の活動を反映しやすく、ストレス研究で広く使われる。" },
            { word: "外在化（externalization）", def: "内部の状態（生理変化など）を、外から見たり触れたりできる形に変換すること。" },
        ],
    },
    {
        heading: "意味づけの多様性を観察する",
        body: "このシステムが目的にしているのは、「あなたはストレスです」と断定することではありません。\n\n同じ「膨らみ」という体験に対して、ある人は「不安だ」と感じ、別の人は「何かに向き合おうとしているのかも」と感じます。\n\nこの「同じ生理反応に対して、どんな意味をつけるか」という多様性こそ、本研究が観察しようとしているものです。\n\n「膨らむ」という単純な動きが、内省と対話の入口になることを狙っています。",
    },
    {
        heading: "認知的評価理論との接続",
        body: "本研究はPark & Folkmanの認知的評価理論を参考にしています。\n\nストレスを「脅威」と評価するか「挑戦」と評価するかは、同じ出来事でも人によって異なります。\n\n従来のHCI研究では、HRVなどの生理指標はストレスの「量」を推定するために使われてきました。\n\n本研究では、それを直接フィードバックに変換することで、ユーザー自身がその意味を自分で解釈する余地を残します。",
        term: [{ word: "認知的評価理論", def: "Park & Folkmanが提唱。同じストレス状況でも「脅威」と見るか「挑戦」と見るかは個人の評価プロセスによって異なるという理論。" }],
    },
    {
        heading: "この研究が提案すること",
        body: "生理的なフィードバックシステムの設計では、「正確にストレスを検出すること」が目標とされがちです。\n\nしかし本研究では、\n\n「ユーザーが自分の生理変化と対話できる環境をどう設計するか」\n\nという視点に立ち直します。\n\nめんふぐは、ストレスを「当てる」ためのシステムではなく、「自分の中に何かが起きているかもしれない」という気づきを、触覚と視覚を通じて届けるインターフェースです。",
    },
];

type LongSection = { heading: string; sub?: string; body: string; items?: string[]; terms?: { word: string; def: string }[] };

const LONG_SECTIONS: LongSection[] = [
    {
        heading: `ストレスを“測る”から“感じる”へ：研究の出発点`,
        body: "心拍、皮膚電気活動、HRVなどの生理指標から、ストレスや感情状態を推定する研究はすでに数多くあります。\n\nこれらの研究の多くは、「ストレスである確率」や「ストレススコア」を高精度で推定することを目的にしています。\n\nしかし本研究の出発点は、「測って当てること」への疑問です。\n\n同じ心拍変動の変化であっても、それを「不安」と感じるか「挑戦へのワクワク」と感じるか「集中」と感じるかは、人によって、状況によって、大きく異なります。\n\n数値やグラフで「あなたはストレス状態です」と表示することで、ユーザーはその解釈に引きずられ、自分が本当にどう感じているかよりも、「システムに言われたこと」を正解として受け取ってしまうかもしれません。\n\nそこで本研究では、「ストレスを当てて伝える」のではなく、「生理変化を感じ取れる形にして渡す」という方向を探りました。",
    },
    {
        heading: "ストレスの「意味づけ」とは何か",
        sub: "認知的評価理論（Park & Folkman）",
        body: "本研究は、Park & Folkmanの認知的評価理論（Cognitive Appraisal Theory）を理論的背景として参照しています。\n\nこの理論では、ストレスは単なる刺激ではなく、「人がある状況をどのように評価するか」という認知プロセスによって生まれると考えます。\n\n同じ状況でも、\n\n一次的評価：「これは自分にとって脅威か、チャレンジか、それとも無関係か」\n二次的評価：「自分はこれに対処できるか」\n\nという評価が異なれば、感じるストレスの質と量は異なります。\n\nたとえば、重要な発表の前に心拍が上がったとき、「怖い（脅威）」と評価する人もいれば、「興奮している（挑戦）」と評価する人もいます。生理的な変化は同じでも、意味づけは正反対になりえます。\n\n本研究はこの「意味づけの多様性」こそが、生体情報フィードバックの設計において重要な問いだと考えています。",
        terms: [{ word: "認知的評価理論", def: "ストレスの感じ方は、出来事そのものではなく、その出来事に対して個人がどのような意味を付与するかによって決まるという理論（Park & Folkman, 1984）。" }],
    },
    {
        heading: "HRV（心拍変動）とは何か、そしてなぜ「測る」だけでは足りないか",
        body: "HRV（Heart Rate Variability：心拍変動）は、心拍と心拍の間隔がどれくらいばらついているかを表す指標です。\n\n一般に、副交感神経が優位な「リラックス状態」では心拍間隔のばらつきが大きく、交感神経が優位な「ストレス・緊張状態」ではばらつきが小さくなります。\n\nRMSSD（Root Mean Square of Successive Differences）はHRVの代表的な指標のひとつで、連続する心拍間隔の差の二乗平均平方根を表します。ストレス研究でよく使われます。\n\nしかし、HRVの変化は「ストレス」以外にも、運動、カフェイン、睡眠不足、気温、呼吸のパターンなど、さまざまな要因によって起こります。\n\nまた前述のように、HRVが変化していても、それが「不安」なのか「挑戦」なのかは生理指標だけでは判断できません。\n\nそのため本研究では、HRVを「ストレス診断の根拠」として使うのではなく、「身体の中で何かが変化しているかもしれないというシグナル」として扱い、その先の意味づけはユーザーに委ねる設計を選びました。",
        terms: [
            { word: "RMSSD", def: "連続する心拍間隔の差を2乗して平均し、その平方根を取った値。副交感神経活動の指標として使われる。" },
            { word: "交感神経・副交感神経", def: "自律神経系の2つの枝。交感神経は「戦うか逃げるか」の興奮状態を、副交感神経はリラックス・回復状態を担う。" },
        ],
    },
    {
        heading: "外在化という設計思想",
        sub: "内部状態を「触れるもの」へ",
        body: "本研究の中心的な設計思想は「外在化（externalization）」です。\n\n外在化とは、内部の状態（生理変化）を、外から見たり触れたりできる形に変換することです。\n\n従来の生体情報フィードバックの多くは、数値、グラフ、色の変化、スコアなどを画面に表示します。これらは情報を「読む」インターフェースです。\n\n一方でめんふぐは、HRVの変化を「膨らみ」という物理的な動きに変換します。これは情報を「感じる」インターフェースです。\n\n膨らんでいるものを目で見ること、手で触れること、隣に置いておくことで、「今の自分の身体状態」が意識の外から少しずつ入ってきます。\n\nこれは、スマートウォッチの振動通知や画面のポップアップとは異なる、アンビエント（環境的・周辺的）なフィードバックの形です。\n\n「どう感じるかは自分が決める」という余白を、インターフェース側が意図的に作っています。",
        terms: [
            { word: "アンビエントインターフェース", def: "中心的な注意を必要とせず、周辺視野や触覚などを通じてさりげなく情報を届ける設計思想。情報を「読む」のではなく「感じる」に近い。" },
        ],
    },
    {
        heading: "めんふぐシステムの全体構成",
        sub: "Fitbit → ESP32 → ソレノイドバルブ → フグ膨張",
        body: "システムは大きく「センシング」「処理・通信」「アクチュエーション」の3層で構成されています。\n\n【センシング層】\nFitbitなどのウェアラブルデバイスから心拍データを取得します。心拍間隔（RR間隔）のデータを使い、RMSSDなどのHRV指標を計算します。\n\n【処理・通信層】\n計算したHRV値をBLE（Bluetooth Low Energy）でESP32マイコンへ送信します。ESP32はHRV値に基づいて、どの程度膨らませるかを判断します。\n\n【アクチュエーション層】\nESP32がソレノイドバルブと真空ポンプを制御し、フグ型ぬいぐるみ内部の風船に空気を送り込むことで膨張させます。HRV値が「普段と異なる状態」を示すほど、膨らみが大きくなります。\n\nシステム設計でこだわったのは、静音性・低消費電力・応答の速さです。日常の空間に置いても邪魔にならない、環境に溶け込む存在感を目指しました。",
        items: ["Fitbit（心拍データ取得）", "BLE通信", "ESP32マイコン（制御・判断）", "ソレノイドバルブ（空気流量の制御）", "真空ポンプ（空気の送排出）", "フグ型ぬいぐるみ本体（膨張・収縮する出力部）"],
        terms: [
            { word: "BLE（Bluetooth Low Energy）", def: "低消費電力のBluetooth通信規格。ウェアラブルデバイスとマイコン間のデータ送受信に使用。" },
            { word: "ソレノイドバルブ", def: "電磁石のON/OFFで空気の流れを制御する弁。ここでは膨張・収縮のタイミング制御に使用。" },
        ],
    },
    {
        heading: "「ふくらむ」という体験のデザイン",
        body: "なぜフグなのか。\n\nフグは「怒ると膨らむ」という特性を持つ生き物です。この「感情・状態と膨らみの直結」というイメージが、ユーザーが「これは自分の状態の変化かもしれない」と直感的に受け取りやすくする働きをします。\n\nまた、ぬいぐるみという素材を選んだことには意図があります。\n\n医療機器や計測器のような外観ではなく、日常空間に自然に置けるものにすることで、「スコアを見て自分を評価する」のではなく「隣にいる何かが変化している」という感覚的な受け取り方を促します。\n\n膨らみは段階的です。HRV値の変化幅に応じて膨らみの大きさが変わり、急激な変化ではなくゆるやかな変化として届きます。\n\nユーザーはその変化を見て、あるいは触れて、「これは何だろう」「今自分はどういう状態なんだろう」と立ち止まる瞬間を持つことができます。",
    },
    {
        heading: "同じ膨らみに、違う意味づけ",
        sub: "意味づけの多様性を「観察可能」にする",
        body: "本研究の核心的な問いは、「同じフィードバックが届いたとき、人はそれにどんな意味をつけるか」です。\n\nめんふぐが膨らんだとき、\n\nある人は「何か怖いことが起きている」と感じるかもしれません。\nある人は「頑張っているんだな」と感じるかもしれません。\nある人は「ちょっと休みなさいということかな」と感じるかもしれません。\n\nこれらはすべて、生理的な変化（HRVの低下）に対する、それぞれ正当な意味づけです。\n\nシステムが「あなたはストレスです」と断定することは、この多様な意味づけの可能性を一つに収束させてしまいます。\n\n本研究では、意味づけを収束させるのではなく、「今の自分はどんな状態だろうと問いかける余白」をインターフェース側が持つ設計を提案しています。",
    },
    {
        heading: "HCI研究としての位置づけ",
        body: "本研究はHCI（ヒューマン・コンピュータ・インタラクション）における生体情報フィードバック研究の系譜に位置します。\n\n関連する先行研究として、Takashimaらのぬいぐるみ型デバイスHugvie（遠隔コミュニケーション時に心拍を伝える触覚デバイス）や、Park & Sundarの研究（フィードバックが認知・感情・社会的認識にどのような段階で影響するか）などがあります。\n\nHugvieとの違いは、本研究が「コミュニケーション支援」ではなく「自己観察・内省支援」を目的としている点です。\n\nまた、多くの生体情報フィードバック研究が「どのモダリティ（視覚・聴覚・触覚）で何を伝えるか」に焦点を当てるのに対し、本研究は「何を伝えないか（=断定しないか）」という制約設計に注目しています。\n\nこの点でMobiQuitous 2026で発表した「Claim-Capped Biosignal Feedback」研究とも問題意識が共鳴しています。どちらも、「生体情報から何を当てて何を言うか」の設計を問い直す研究です。",
        terms: [
            { word: "HCI（ヒューマン・コンピュータ・インタラクション）", def: "人間とコンピュータの接点（インターフェース・インタラクション）を研究する学問分野。" },
            { word: "Hugvie", def: "Takashimaらが開発した筒型ぬいぐるみ型デバイス。通話相手の声と心拍を振動として伝え、遠隔でも存在感を共有できる。" },
        ],
    },
    {
        heading: "学会での評価",
        body: "本研究は、第30回 情報処理学会シンポジウム「インタラクション2026」にてインタラクティブ発表として発表されました。\n\n発表番号：1B33\n著者：古川耕太郎、秋田純一（金沢大学融合学域）\n\n情報処理学会インタラクションシンポジウムは、HCI・インタラクション分野で国内最大規模の研究会のひとつです。\n\n本研究は、査読による選考を経て【プレミアム発表（☆）】として採択されました。\n\nプレミアム発表は、研究の新規性・完成度・インタラクティブ性が特に高いと評価された発表に与えられる区分です。",
    },
    {
        heading: "この研究でできたこと・できていないこと",
        body: "【確認できたこと】\n\n✓ HRVの変化を物理的な膨張として外在化する実装が動作することを確認した\n✓ 同じ「膨らみ」に対して、複数の異なる意味づけが生まれることを観察した\n✓ 数値やスコアを使わずに生体変化を伝える設計が成立することを示した\n\n【できていないこと・残っている課題】\n\n✗ 意味づけの多様性を「どう計測するか」の定量的な評価フレームがまだない\n✗ 長期間の日常使用データがない（実験室内での評価にとどまる）\n✗ 膨らみの量と感じ方の関係の個人差をさらに詳しく調べる必要がある\n✗ ユーザーが「めんふぐ」の意味を学習した後、どのように体験が変わるかは未検討\n✗ ストレスではなく「意味づけ」を扱うシステムの有効性を、どう評価するかの枠組みがまだ発展途上",
    },
    {
        heading: "この研究で一番考えたかったこと",
        sub: "「当てる」のではなく「感じる余地を渡す」インターフェースの設計",
        body: "生体情報を使ったシステムでは、「ストレスを正確に検出して通知する」ことが長らく目標とされてきました。\n\n私はそこに疑問を持ちました。\n\n心拍が変化したとき、それを「ストレスです」と告げるシステムは、ユーザーの自己理解を助けているでしょうか。それとも、自分の感覚よりもシステムの診断を信じてしまう状況を作り出しているでしょうか。\n\n同じ身体の変化でも、人によって、そのときの状況によって、意味はまったく異なります。\n\nめんふぐが問うのは、「この膨らみは何を意味しているのか」という問いではありません。\n\n「今の自分に、何が起きているのかもしれない」と立ち止まる時間を作ることです。\n\n生体情報技術は、人について「より多くを言えるようにする」方向で発展してきました。\n\nこの研究では、あえて逆の方向を探ります。\n\nシステムが言う言葉を減らし、ユーザーが感じる余地を増やす。\n\nそれが、生体情報フィードバックの別の形になれないかを探った研究です。",
    },
];

// ─── 物理膨張・有機呼吸のCanvasグラフィック (めぐふぐの物理運動) ─────────────────
const OrganicPuffCanvas = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let width = (canvas.width = canvas.offsetWidth);
        let height = (canvas.height = canvas.offsetHeight);

        const handleResize = () => {
            if (!canvas) return;
            width = canvas.width = canvas.offsetWidth;
            height = canvas.height = canvas.offsetHeight;
        };

        window.addEventListener('resize', handleResize);

        let t = 0;

        const render = () => {
            t += 0.02;
            ctx.clearRect(0, 0, width, height);

            const centerX = width * 0.85;
            const centerY = height * 0.5;

            // 呼吸・物理膨張の脈動サイクル (有機的な変形)
            const breath = Math.sin(t * 1.2) * 0.5 + 0.5; // 0 to 1
            const baseRadius = 40 + breath * 35; // 40px to 75px への膨張

            // 膨らむ流体的なオーラ・波紋 (HRV のゆらぎ)
            for (let ring = 3; ring >= 1; ring--) {
                const ringRadius = baseRadius + ring * (15 + Math.sin(t * 2 + ring) * 6);
                const alpha = (0.15 - ring * 0.03) * (0.8 + breath * 0.4);

                ctx.beginPath();
                ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(249, 115, 22, ${alpha})`; // Amber/Orange 500
                ctx.fill();
            }

            // フグの有機的な曲面シェイプ (ノイズ付き膨張体)
            ctx.beginPath();
            const pointsCount = 36;
            for (let i = 0; i <= pointsCount; i++) {
                const angle = (i / pointsCount) * Math.PI * 2;
                // 有機的ノイズ (呼吸と連動して形が伸び縮みする)
                const deform = Math.sin(angle * 4 + t * 3) * (4 + breath * 6) + Math.cos(angle * 2 - t * 2) * 3;
                const r = baseRadius + deform;
                const x = centerX + Math.cos(angle) * r;
                const y = centerY + Math.sin(angle) * r;

                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();

            // グラデーション（ぬくもりのある有機質感）
            const grad = ctx.createRadialGradient(
                centerX - baseRadius * 0.2,
                centerY - baseRadius * 0.2,
                baseRadius * 0.1,
                centerX,
                centerY,
                baseRadius * 1.2
            );
            grad.addColorStop(0, 'rgba(254, 215, 170, 0.6)'); // Orange 200
            grad.addColorStop(0.6, 'rgba(249, 115, 22, 0.4)'); // Orange 500
            grad.addColorStop(1, 'rgba(225, 29, 72, 0.15)'); // Rose 600

            ctx.fillStyle = grad;
            ctx.fill();

            // 脈動する境界線
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = `rgba(249, 115, 22, ${0.4 + breath * 0.3})`;
            ctx.stroke();

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none opacity-85"
        />
    );
};

// ─── 共有ボタン ────────────────────────────────────────────────────

const ShareButton = () => {
    const [copied, setCopied] = useState(false);
    const url = `${window.location.origin}/research`;
    const text = "めんふぐ — HRVを「測る」から「感じる」へ。フグ型インターフェースで意味づけの多様性を観察する研究 #インタラクション2026";

    const handleCopy = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&via=HATAKE55555`;

    return (
        <div className="flex gap-2 flex-wrap items-center">
            <a
                href={tweetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-white text-white dark:text-neutral-900 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all shadow-sm"
            >
                <Share2 size={13} />
                Xでシェア
            </a>
            <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-lg text-xs font-semibold tracking-wider transition-all border border-neutral-200/80 dark:border-neutral-700/80"
            >
                {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                {copied ? "コピー完了" : "URLコピー"}
            </button>
        </div>
    );
};

// ─── Term（専門用語）バッジ ────────────────────────────────────────

const TermBadge = ({ word, def }: { word: string; def: string }) => {
    const [open, setOpen] = useState(false);
    return (
        <span className="relative inline-block my-1 mx-0.5">
            <button
                onClick={() => setOpen(v => !v)}
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 rounded-md text-xs font-mono tracking-tight border border-orange-200 dark:border-orange-800/80 hover:bg-orange-100 dark:hover:bg-orange-900/60 transition-all cursor-help"
            >
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                {word}
            </button>
            {open && (
                <span className="absolute z-50 left-0 top-full mt-1.5 w-72 p-3.5 bg-neutral-900/95 dark:bg-neutral-900 backdrop-blur-md border border-neutral-700 dark:border-neutral-700 rounded-xl shadow-2xl text-xs text-neutral-200 leading-relaxed pointer-events-none">
                    <strong className="block text-orange-400 font-mono mb-1">{word}</strong>
                    {def}
                </span>
            )}
        </span>
    );
};

// ─── テキストを段落に分割して表示 (可読性極大化エディトリアル) ─────────────────

const BodyText = ({ text }: { text: string }) => (
    <div className="space-y-4 font-sans text-neutral-800 dark:text-neutral-200 leading-relaxed tracking-normal text-base md:text-[15px]">
        {text.split('\n\n').map((para, i) => (
            <p key={i} className="whitespace-pre-line leading-7 text-neutral-700 dark:text-neutral-300 font-normal">
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
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-4 md:p-6" role="dialog" aria-modal="true">
            {/* 背景オーバーレイ */}
            <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-md transition-opacity" onClick={onClose} />

            {/* メインウィンドウ (エディトリアル・有機建築的デザイン) */}
            <div className="relative z-10 w-full max-w-3xl h-[88vh] md:h-[88vh] flex flex-col bg-white dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden font-sans">

                {/* ヘッダーセクション（有機呼吸アートCanvas統合） */}
                <div className="relative flex-shrink-0 px-6 sm:px-8 pt-7 pb-5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/60 backdrop-blur-sm overflow-hidden">
                    <OrganicPuffCanvas />

                    <div className="relative z-10">
                        <div className="flex items-start justify-between gap-4 mb-3">
                            <div>
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-500/10 dark:bg-orange-400/10 text-orange-700 dark:text-orange-300 border border-orange-500/20 rounded-full text-xs font-mono font-medium">
                                        <Sparkles size={12} className="text-orange-500" />
                                        インタラクション2026
                                    </span>
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-500/10 dark:bg-amber-400/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 rounded-full text-xs font-mono font-semibold">
                                        ☆ プレミアム発表
                                    </span>
                                </div>
                                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white leading-tight font-sans">
                                    ストレスを"測る"から"感じる"へ
                                </h2>
                                <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400 mt-1">
                                    古川耕太郎, 秋田純一（金沢大学融合学域） · 1B33
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="flex-shrink-0 p-2 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 transition-all"
                                aria-label="閉じる"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* タブ切り替え */}
                        <div className="flex gap-2 pt-1">
                            <button
                                onClick={() => setTab('short')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold tracking-wider transition-all ${tab === 'short'
                                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-md'
                                    : 'bg-neutral-200/60 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-300 dark:hover:bg-neutral-700'
                                    }`}
                            >
                                <FileText size={14} />
                                短い版
                            </button>
                            <button
                                onClick={() => setTab('long')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold tracking-wider transition-all ${tab === 'long'
                                    ? 'bg-rose-900 text-white dark:bg-rose-500 dark:text-white shadow-md'
                                    : 'bg-neutral-200/60 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-300 dark:hover:bg-neutral-700'
                                    }`}
                            >
                                <Microscope size={14} />
                                長い版（論文全文）
                            </button>
                        </div>
                    </div>
                </div>

                {/* スクロール可能な文章ビューワー（最高の可読性） */}
                <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-7 space-y-8 bg-white dark:bg-neutral-950 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-800">
                    {/* 一言説明（常時表示カード） */}
                    <div className="relative p-5 bg-gradient-to-br from-orange-500/5 via-rose-500/5 to-transparent dark:from-orange-500/10 dark:via-rose-500/10 rounded-xl border border-orange-500/20 dark:border-orange-500/30">
                        <div className="flex gap-3">
                            <span className="text-base flex-shrink-0">🐡</span>
                            <div className="space-y-1">
                                <span className="block text-xs font-mono font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                                    一言で説明
                                </span>
                                <p className="text-sm sm:text-[15px] text-neutral-800 dark:text-neutral-200 leading-relaxed font-medium">
                                    {ONE_LINE}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 短い版コンテンツ */}
                    {tab === 'short' && (
                        <div className="space-y-8">
                            {SHORT_SECTIONS.map((sec, i) => (
                                <div key={i} className="group space-y-3 pb-6 border-b border-neutral-100 dark:border-neutral-900 last:border-0">
                                    {sec.heading && (
                                        <h3 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
                                            <span className="w-1.5 h-4 bg-orange-500 rounded-full" />
                                            {sec.heading}
                                        </h3>
                                    )}
                                    <BodyText text={sec.body} />
                                    {sec.term && (
                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                            {sec.term.map((t, j) => (
                                                <TermBadge key={j} word={t.word} def={t.def} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 長い版コンテンツ (論文フルテキスト) */}
                    {tab === 'long' && (
                        <div className="space-y-10">
                            {LONG_SECTIONS.map((sec, i) => (
                                <div key={i} className="space-y-4 pb-8 border-b border-neutral-100 dark:border-neutral-900 last:border-0">
                                    <div>
                                        <h3 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900 dark:text-white leading-snug">
                                            {sec.heading}
                                        </h3>
                                        {sec.sub && (
                                            <p className="mt-1 text-sm font-mono font-medium text-rose-600 dark:text-rose-400 tracking-wide">
                                                — {sec.sub}
                                            </p>
                                        )}
                                    </div>
                                    <BodyText text={sec.body} />
                                    {sec.items && (
                                        <ul className="my-3 grid grid-cols-1 sm:grid-cols-2 gap-2 p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border border-neutral-200/60 dark:border-neutral-800/60">
                                            {sec.items.map((item, j) => (
                                                <li key={j} className="text-xs font-mono text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    {sec.terms && (
                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                            {sec.terms.map((t, j) => (
                                                <TermBadge key={j} word={t.word} def={t.def} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* フッター */}
                <div className="flex-shrink-0 px-6 sm:px-8 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/90">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4 flex-wrap text-xs font-mono text-neutral-500 dark:text-neutral-400">
                            <div className="flex items-center gap-1.5">
                                <BookOpen size={14} className="text-orange-500" />
                                <span>インタラクション2026 · 1B33</span>
                            </div>
                            <a
                                href="https://www.interaction-ipsj.org/proceedings/2026/data/pdf/1B33.pdf"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 font-bold text-orange-600 dark:text-orange-400 hover:underline"
                            >
                                <ExternalLink size={12} />
                                論文PDF
                            </a>
                            <a
                                href="https://www.interaction-ipsj.org/2026/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
                            >
                                <ExternalLink size={12} />
                                会議サイト
                            </a>
                        </div>
                        <ShareButton />
                    </div>
                </div>
            </div>
        </div>
    );
};
