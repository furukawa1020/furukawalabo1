import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Share2, Copy, Check, BookOpen, FileText, Microscope, ExternalLink } from 'lucide-react';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// コンテンツ — 文章は一字一句変更禁止
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const ONE_LINE = `心拍変動（HRV）を「ストレス値」として画面に表示するのではなく、フグ型ぬいぐるみ「めんふぐ」が物理的に膨らむ触覚・視覚フィードバックへ変換することで、同じ身体の変化でも「不安」と感じるか「挑戦」と感じるかという意味づけの個人差を、ユーザー自身が直感的に観察・内省できるようにした研究です。`;

type Section = { heading?: string; sub?: string; body: string; term?: { word: string; def: string }[] };

const SHORT_SECTIONS: Section[] = [
    {
        heading: `ストレスを"測る"から"感じる"へ`,
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
        heading: `ストレスを"測る"から"感じる"へ：研究の出発点`,
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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WebGL hook — 有機呼吸シェーダー (GLSL fragment shader)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const VERT = `attribute vec2 a;void main(){gl_Position=vec4(a,0,1);}`;

// フグの有機的膨張・心拍変動リズムのSDF シェーダー
const FRAG_FUGU = `
precision mediump float;
uniform vec2 u_res;
uniform float u_t;

#define PI 3.14159265359

float smin(float a,float b,float k){float h=max(k-abs(a-b),0.)/k;return min(a,b)-h*h*k*.25;}

// HRV的な不規則呼吸リズム (完全な正弦波にしない)
float breath(float t){
  float m=sin(t*.85)*.5+.5;
  float irr=sin(t*4.7)*.04+sin(t*2.3)*.025+sin(t*9.1)*.012;
  return m+irr;
}

float sdCircle(vec2 p,float r){return length(p)-r;}

void main(){
  vec2 uv=(gl_FragCoord.xy-u_res*.5)/min(u_res.x,u_res.y);
  float t=u_t;
  float b=clamp(breath(t),0.,1.3);

  // フグ本体 (SDF blob)
  float body=sdCircle(uv,.17+b*.09);

  // フグの棘 (9個のbump)
  for(int i=0;i<9;i++){
    float a=float(i)/9.*2.*PI+t*.06;
    float r=.14+b*.08;
    float bs=.055+b*.03+sin(t*2.+float(i)*1.4)*.009;
    body=smin(body,sdCircle(uv-vec2(cos(a),sin(a))*r,bs),.04);
  }
  body-=.022; // 丸みを増す

  // 色
  vec3 bg=vec3(.025,.02,.035);
  float fill=smoothstep(.012,-.012,body);
  float edge=clamp(-body,0.,1.);

  // 体のグラデーション: 中心=アンバー / 端=ローズ
  vec3 bodyCol=mix(
    vec3(.96,.58,.12),
    vec3(.88,.28,.42),
    1.-smoothstep(0.,.22,edge)
  );

  // 外側のオーラ
  float aura=exp(body*7.)*b*.22;
  vec3 auraCol=vec3(1.,.48,.16)*aura;

  vec3 col=bg+auraCol;
  col=mix(col,bodyCol,fill);

  // ハイライト (質感)
  float hl=exp(-length(uv-vec2(-.06,.07)*((.55+b*.12)))*24.)*fill;
  col+=vec3(1.,.92,.75)*hl*.5;

  // 呼吸リング (HRV可視化)
  float ring=abs(length(uv)-(.3+b*.09))-.007;
  col+=vec3(1.,.55,.18)*exp(-ring*ring*600.)*(b*.35);

  // ビニェット
  col*=max(0.,1.-dot(uv*vec2(1.,.85),uv*vec2(1.,.85))*1.1);

  gl_FragColor=vec4(col,1.);
}
`;

const useGLShader = (canvasRef: React.RefObject<HTMLCanvasElement>, frag: string) => {
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const gl = canvas.getContext('webgl');
        if (!gl) return;

        const mk = (type: number, src: string) => {
            const s = gl.createShader(type)!;
            gl.shaderSource(s, src);
            gl.compileShader(s);
            return s;
        };

        const prog = gl.createProgram()!;
        gl.attachShader(prog, mk(gl.VERTEX_SHADER, VERT));
        gl.attachShader(prog, mk(gl.FRAGMENT_SHADER, frag));
        gl.linkProgram(prog);
        gl.useProgram(prog);

        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

        const aLoc = gl.getAttribLocation(prog, 'a');
        gl.enableVertexAttribArray(aLoc);
        gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);

        const uRes = gl.getUniformLocation(prog, 'u_res');
        const uT = gl.getUniformLocation(prog, 'u_t');

        const resize = () => {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            gl.viewport(0, 0, canvas.width, canvas.height);
        };
        resize();
        window.addEventListener('resize', resize);

        let id: number;
        const t0 = performance.now();
        const loop = () => {
            gl.uniform2f(uRes, canvas.width, canvas.height);
            gl.uniform1f(uT, (performance.now() - t0) / 1000);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            id = requestAnimationFrame(loop);
        };
        id = requestAnimationFrame(loop);

        return () => { cancelAnimationFrame(id); window.removeEventListener('resize', resize); };
    }, []);
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// UI部品
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const TermBadge = ({ word, def }: { word: string; def: string }) => {
    const [open, setOpen] = useState(false);
    return (
        <span className="relative inline-block">
            <button
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
                onClick={() => setOpen(v => !v)}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-mono
                   bg-orange-950/60 text-orange-400 border border-orange-900/60 rounded
                   hover:bg-orange-900/40 transition-colors cursor-help"
            >
                <span className="w-1 h-1 rounded-full bg-orange-500 animate-pulse" />
                {word}
            </button>
            {open && (
                <span className="absolute z-50 left-0 top-full mt-2 w-72 p-3 rounded-lg shadow-2xl
                    bg-neutral-950 border border-neutral-700 text-[11px] leading-relaxed
                    text-neutral-300 font-sans pointer-events-none">
                    <strong className="block font-mono text-orange-400 mb-1">{word}</strong>
                    {def}
                </span>
            )}
        </span>
    );
};

const BodyText = ({ text }: { text: string }) => {
    const paras = text.split('\n\n');
    return (
        <div className="space-y-3.5">
            {paras.map((para, i) => {
                const lines = para.split('\n');

                if (lines.some(l => l.startsWith('✓') || l.startsWith('✗'))) {
                    return (
                        <div key={i} className="space-y-1.5 my-2">
                            {lines.map((line, j) => {
                                if (line.startsWith('✓')) return (
                                    <div key={j} className="flex gap-2.5 items-start">
                                        <span className="mt-0.5 flex-shrink-0 font-mono text-xs text-emerald-400">✓</span>
                                        <span className="text-sm text-neutral-300 font-mono leading-relaxed">{line.slice(1).trim()}</span>
                                    </div>
                                );
                                if (line.startsWith('✗')) return (
                                    <div key={j} className="flex gap-2.5 items-start opacity-50">
                                        <span className="mt-0.5 flex-shrink-0 font-mono text-xs text-red-500">✗</span>
                                        <span className="text-sm text-neutral-500 font-mono leading-relaxed line-through">{line.slice(1).trim()}</span>
                                    </div>
                                );
                                return <p key={j} className="text-sm text-neutral-400 leading-relaxed">{line}</p>;
                            })}
                        </div>
                    );
                }

                // 引用的な問い (「」で始まる短い段落)
                if (para.startsWith('「') && para.length < 80) {
                    return (
                        <p key={i} className="pl-3 border-l-2 border-orange-800/60 text-[15px] text-orange-200/70 leading-relaxed italic my-2">
                            {para}
                        </p>
                    );
                }

                return (
                    <p key={i} className="text-[15px] text-neutral-300 leading-[1.75] whitespace-pre-line">
                        {para}
                    </p>
                );
            })}
        </div>
    );
};

const ShareButton = () => {
    const [copied, setCopied] = useState(false);
    const url = typeof window !== 'undefined' ? `${window.location.origin}/research` : '';
    const tweet = `https://twitter.com/intent/tweet?text=${encodeURIComponent('めんふぐ — HRVを「ストレス値」から「感じる余地」へ。フグ型インターフェースで意味づけを観察する研究 #インタラクション2026')}&url=${encodeURIComponent(url)}&via=HATAKE55555`;
    return (
        <div className="flex gap-2">
            <a href={tweet} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono font-bold uppercase tracking-widest
                   bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 rounded transition-colors">
                <Share2 size={11} />X
            </a>
            <button onClick={() => { navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono font-bold uppercase tracking-widest
                   bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 rounded transition-colors">
                {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                {copied ? 'copied' : 'URL'}
            </button>
        </div>
    );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// メインモーダル
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type Tab = 'short' | 'long';

export const Interaction2026Modal = ({ onClose }: { onClose: () => void }) => {
    const [tab, setTab] = useState<Tab>('short');
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useGLShader(canvasRef, FRAG_FUGU);

    const onKey = useCallback((e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }, [onClose]);
    useEffect(() => {
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
    }, [onKey]);

    return (
        <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={onClose} />

            <div className="relative z-10 w-full max-w-3xl sm:mx-4
                h-[92vh] sm:h-[88vh]
                flex flex-col
                bg-neutral-950 border border-neutral-800
                sm:rounded-xl overflow-hidden shadow-2xl">

                {/* ─── ヘッダー: フグ膨張WebGL + タイトル ─── */}
                <div className="relative flex-shrink-0 overflow-hidden" style={{ minHeight: 180 }}>
                    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

                    <div className="relative z-10 px-5 sm:px-7 pt-5 pb-4 flex flex-col justify-between h-full"
                        style={{ background: 'linear-gradient(to bottom, rgba(5,3,8,.72) 0%, rgba(5,3,8,.45) 55%, rgba(5,3,8,.93) 100%)' }}>

                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <span className="font-mono text-[10px] text-orange-500 uppercase tracking-widest border border-orange-900/60 px-2 py-0.5 rounded">
                                        インタラクション 2026
                                    </span>
                                    <span className="font-mono text-[10px] text-amber-600 uppercase tracking-widest border border-amber-900/50 px-2 py-0.5 rounded">
                                        ☆ プレミアム発表
                                    </span>
                                </div>
                                <h2 className="font-sans text-base sm:text-xl font-bold text-white leading-tight tracking-tight">
                                    ストレスを"測る"から"感じる"へ
                                </h2>
                                <p className="font-mono text-[10px] text-neutral-600 mt-0.5">
                                    古川耕太郎, 秋田純一（金沢大学融合学域） · 1B33
                                </p>
                            </div>
                            <button onClick={onClose} aria-label="閉じる"
                                className="p-1.5 rounded-lg text-neutral-600 hover:text-white hover:bg-white/10 transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        {/* システム構成サマリー */}
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10 font-mono text-[10px] text-neutral-500 flex-wrap">
                            <span className="text-orange-600">Fitbit</span>
                            <span className="text-neutral-700">→</span>
                            <span>BLE</span>
                            <span className="text-neutral-700">→</span>
                            <span>ESP32</span>
                            <span className="text-neutral-700">→</span>
                            <span>ソレノイドバルブ</span>
                            <span className="text-neutral-700">→</span>
                            <span className="text-orange-500 font-bold">🐡 膨張</span>
                            <span className="text-neutral-700">→</span>
                            <span className="text-amber-600">自己内省</span>
                        </div>
                    </div>
                </div>

                {/* ─── タブ ─── */}
                <div className="flex-shrink-0 flex gap-0 border-b border-neutral-800 bg-neutral-950">
                    {(['short', 'long'] as Tab[]).map(t => (
                        <button key={t} onClick={() => setTab(t)}
                            className={`flex items-center gap-2 px-5 py-2.5 font-mono text-[11px] uppercase tracking-widest border-b-2 transition-all
                                ${tab === t
                                    ? 'border-orange-500 text-orange-400 bg-orange-950/20'
                                    : 'border-transparent text-neutral-600 hover:text-neutral-400 hover:bg-white/5'}`}>
                            {t === 'short' ? <><FileText size={12} />短い版</> : <><Microscope size={12} />長い版</>}
                        </button>
                    ))}
                </div>

                {/* ─── スクロール本文 ─── */}
                <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-6 space-y-7 bg-neutral-950">
                    {/* 一言説明 */}
                    <div className="flex gap-3 p-4 rounded-lg border border-neutral-800 bg-neutral-900/60">
                        <span className="flex-shrink-0 font-mono text-[10px] text-orange-700 uppercase tracking-widest mt-0.5 w-16">🐡 研究</span>
                        <p className="text-[13px] sm:text-sm text-neutral-400 leading-relaxed font-medium">{ONE_LINE}</p>
                    </div>

                    {/* 短い版 */}
                    {tab === 'short' && SHORT_SECTIONS.map((sec, i) => (
                        <div key={i} className="space-y-3">
                            {sec.heading && (
                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-[10px] text-neutral-700 w-6 flex-shrink-0 tabular-nums">
                                        {String(i + 1).padStart(2, '0')}
                                    </span>
                                    <h3 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug">{sec.heading}</h3>
                                </div>
                            )}
                            <div className="pl-9">
                                <BodyText text={sec.body} />
                                {sec.term && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {sec.term.map((t, j) => <TermBadge key={j} {...t} />)}
                                    </div>
                                )}
                            </div>
                            {i < SHORT_SECTIONS.length - 1 && <div className="border-b border-neutral-900 mt-4" />}
                        </div>
                    ))}

                    {/* 長い版 */}
                    {tab === 'long' && LONG_SECTIONS.map((sec, i) => (
                        <div key={i} className="space-y-3">
                            <div className="flex items-start gap-3">
                                <span className="font-mono text-[10px] text-neutral-700 mt-1 w-6 flex-shrink-0 tabular-nums">
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                                <div>
                                    <h3 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug">{sec.heading}</h3>
                                    {sec.sub && <p className="font-mono text-[11px] text-orange-700 uppercase tracking-wider mt-0.5">— {sec.sub}</p>}
                                </div>
                            </div>
                            <div className="pl-9 space-y-3">
                                <BodyText text={sec.body} />
                                {sec.items && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 p-3 bg-neutral-900/60 rounded border border-neutral-800/60 mt-2">
                                        {sec.items.map((item, j) => (
                                            <span key={j} className="font-mono text-[11px] text-neutral-500 flex items-center gap-1.5">
                                                <span className="w-1 h-1 rounded-full bg-orange-900 flex-shrink-0" />{item}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {sec.terms && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {sec.terms.map((t, j) => <TermBadge key={j} {...t} />)}
                                    </div>
                                )}
                            </div>
                            {i < LONG_SECTIONS.length - 1 && <div className="border-b border-neutral-900 mt-4" />}
                        </div>
                    ))}
                </div>

                {/* ─── フッター ─── */}
                <div className="flex-shrink-0 flex items-center justify-between gap-3 flex-wrap
                    px-5 sm:px-7 py-3 border-t border-neutral-800 bg-neutral-950">
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-1.5 font-mono text-[10px] text-neutral-600">
                            <BookOpen size={11} />インタラクション2026 · 1B33
                        </div>
                        <a href="https://www.interaction-ipsj.org/proceedings/2026/data/pdf/1B33.pdf"
                            target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 font-mono text-[10px] text-orange-700 hover:text-orange-500 transition-colors">
                            <ExternalLink size={10} />論文PDF
                        </a>
                        <a href="https://www.interaction-ipsj.org/2026/"
                            target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 font-mono text-[10px] text-neutral-700 hover:text-neutral-500 transition-colors">
                            <ExternalLink size={10} />会議
                        </a>
                    </div>
                    <ShareButton />
                </div>
            </div>
        </div>
    );
};
