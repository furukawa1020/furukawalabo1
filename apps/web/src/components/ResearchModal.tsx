import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Share2, Copy, Check, BookOpen, FileText, Microscope, ExternalLink, Sparkles } from 'lucide-react';

// ─── コンテンツ定義 (完全維持) ────────────────────────────────────────────────

const ONE_LINE = `ストレスを当てるのではなく、「いつもの自分と今がどれくらい違うか」だけを捉え、その情報から本人特定や元データの復元がどこまでできてしまうかを攻撃実験で調べながら、「あなたはストレスです」のような断定をシステムが出せないようにした生体情報フィードバックの研究です。`;

type Section = { heading?: string; sub?: string; body: string; term?: { word: string; def: string }[] };

const SHORT_SECTIONS: Section[] = [
    {
        heading: "Claim-Capped Biosignal Feedback",
        body: "心拍や皮膚電気活動などの生体情報から、ストレスや感情状態を推定する研究は多くあります。\n\nしかし、心拍が普段より高いからといって、その原因が必ずストレスとは限りません。運動、暑さ、カフェイン、体調、興奮、仕事量、センサの誤差など、さまざまな理由が考えられます。\n\nそこで本研究では、「あなたはストレス状態です」と当てることを目的にせず、\n\n「今の生体・行動パターンが、その人自身の普段とどれくらい違うか」\n\nだけを扱います。",
    },
    {
        heading: "信号処理と圧縮",
        body: "まず、60秒ごとの生体信号から平均、標準偏差、中央値、傾き、周波数成分などを計算し、WESADとCASEでは208個の数値にまとめました。\n\n次に、その値を他人と比べるのではなく、本人の普段の値と比較して「自分の通常状態からどれだけずれているか」に変換します。\n\nさらにPCA（主成分分析）という手法を使い、208個ある特徴を、重要な変化をなるべく残しながら8個の値に圧縮しました。",
        term: [{ word: "PCA（主成分分析）", def: "似た動きをする多数の数値をまとめて、元の情報の大きな変化をなるべく残しながら、少ない数の値に圧縮する方法。" }],
    },
    {
        heading: "3種類の攻撃実験",
        body: "その圧縮後のデータに対して、\n\n● そのデータが誰のものか当てられるか\n● 元の208個の特徴をどこまで復元できるか\n● そのデータが学習用に使われたものか当てられるか\n\nという攻撃を行いました。\n\n主評価のWESADでは、「普段と違う状態」を順位づけるAUROCが0.994でした。一方で、本人特定に使える情報や元特徴を復元できる情報は、圧縮前より減少しました。\n\nただし、完全に安全になったわけではありません。学習データかどうかを当てるMembership InferenceはAUC 0.690で、まだ情報が残っています。",
        term: [{ word: "AUROC", def: "モデルが「普段と違う状態」を正しく順位づけられるかを表す指標。1.0が完璧、0.5が偶然と同じ。" }],
    },
    {
        heading: "断定文をシステム側で禁止する",
        body: "また、通知タイミングにも問題がありました。非baseline状態には反応できた一方、普段の状態でも60%の窓で通知条件を超えてしまいました。そのため、この研究は「そのまま日常利用できるシステムが完成した」とは主張していません。\n\nユーザーへ出せる文章そのものも制限しました。\n\nシステムが出せるのは、\n\n✓ 何も表示しない\n✓「現在のパターンが、普段と異なっています」\n✓「普段と少し違うようです。自分の状態を確認してみますか？」\n\nといった表現だけです。\n\n「あなたはストレス状態です」「集中できていません」「体調が悪いです」といった断定は、そもそも出力候補に入れていません。",
    },
    {
        heading: "この研究が考えたいこと",
        body: "AIが人について何を当てられるかだけでなく、何をデータとして残し、何をユーザーに言ってよいのかまで、システム側で設計する必要があるのではないか",
    },
];

type LongSection = { heading: string; sub?: string; body: string; items?: string[]; terms?: { word: string; def: string }[] };

const LONG_SECTIONS: LongSection[] = [
    {
        heading: "Claim-Capped Biosignal Feedback for Privacy-Calibrated Self-Observation on Mobile and Wearable Devices",
        body: "本研究では、スマートウォッチやウェアラブルセンサから得られる生体情報を使いながら、ユーザーに対して「あなたはストレス状態です」のような断定をしない生体情報フィードバックの仕組みを研究しました。\n\n心拍、皮膚電気活動、呼吸、体温、加速度などの情報から、ストレスや感情状態を推定する研究はすでに数多くあります。\n\nしかし、生体情報に変化があったことと、その原因が分かることは同じではありません。\n\nたとえば心拍数が普段より高かったとしても、その原因はストレスとは限りません。\n\n運動した直後かもしれません。暑い場所にいたのかもしれません。コーヒーを飲んだ影響かもしれません。体調が悪い、緊張している、楽しくて興奮している、仕事量が多い、あるいは単純にセンサの測定がずれた可能性もあります。\n\nそれにもかかわらず、システムが一つの原因に決めつけて「あなたはストレス状態です」「集中できていません」「体調が悪いです」と表示すると、生体信号の曖昧な変化が、本人や周囲から固定的な評価として扱われる可能性があります。\n\nそこで本研究では、最初からストレス分類を目的にしませんでした。\n\n代わりに扱うのは、\n\n「今の自分が、普段の自分とどれくらい違うか」\n\nという情報です。\n\n論文ではこれをwithin-person atypicality、つまり個人内の非典型性と呼んでいます。\n\nこれは「ストレスである確率」ではありません。\n\n病気、生産性、集中度、感情状態などを表す数値でもありません。\n\nあくまで、\n\n「いつもの自分と比べると、現在の生体・行動パターンは少し違っている」\n\nという情報だけを扱います。",
        terms: [{ word: "within-person atypicality（個人内の非典型性）", def: "自分自身の過去の「普段の状態」と現在を比較したときのずれ量。他人との比較ではない。" }],
    },
    {
        heading: "生体信号を60秒ごとに区切って特徴を計算する",
        body: "今回の実装では、生体信号を重複しない60秒単位に区切りました。\n\nその60秒間について、以下を計算します。\n\nWESADとCASEというデータセットでは、最終的に1つの60秒窓を208個の数値で表しました。\n\nつまり、生の波形そのものを直接比較するのではなく、\n\n「この60秒間の生体信号にはどんな特徴があったか」\n\nを208個の数値に変換しています。",
        items: ["平均", "標準偏差", "中央値", "四分位範囲", "最小値・最大値", "10パーセンタイル・90パーセンタイル", "時間方向の傾き", "信号のエネルギー", "最も強い周波数", "歪度", "尖度"],
    },
    {
        heading: "他人と比べず、その人自身の普段と比較する",
        body: "次に、その208個の値をそのまま使うのではなく、その人自身の普段の状態と比較します。\n\nたとえば、心拍が90だったとしても、それだけでは何も分かりません。\n\n普段60の人が90になった場合と、普段85の人が90になった場合では意味が違うからです。\n\nそこで参加者ごとに、普段の状態の中央値と、どれくらいばらついているかを計算します。\n\n現在の値をそこから比較し、\n\n「本人の通常状態から、どの程度離れているか」\n\nという値に変換しました。\n\nこの処理によって、絶対的な生理値そのものよりも、本人の中で起きた変化を中心に扱うことを狙っています。\n\nただし、この処理だけでプライバシーが守られるわけではありません。本人の普段との差に変換したとしても、その中に本人固有の特徴が残っている可能性があります。そのため、実際に攻撃を行って確認します。",
    },
    {
        heading: "208個の特徴を8個に圧縮する",
        body: "WESADとCASEでは、1つの60秒窓について208個の特徴があります。\n\nこの208個をそのまま保持すると、多くの情報が残ります。\n\nそこでPCAという方法を使いました。\n\nPCAは「主成分分析」と呼ばれる方法です。\n\n簡単に言えば、「似た動きをする多数の数値をまとめて、元の情報の大きな変化をなるべく残しながら、少ない数の値に圧縮する方法」です。\n\nたとえば208個の特徴の中には、互いに強く関連して動くものがあります。PCAでは、それらを組み合わせて、「このデータで大きく変化する方向」を新しい軸として作ります。\n\n今回の研究では、208個の特徴を最終的に8個の値まで圧縮しました。\n\nこの圧縮後の表現を論文ではz_pと呼んでいます。\n\n狙いは、「普段と違う」という情報は残す一方で、本人を特定したり元の細かい特徴を復元したりするために使える情報は減らせないか、というものです。",
        terms: [{ word: "PCA（主成分分析）", def: "多数の数値の中から最も大きな変化が起きている「方向」を見つけ出し、それを軸に少ない数の値へ変換する統計的手法。" }],
    },
    {
        heading: "本人特定に使われやすい情報をさらに減らす",
        body: "さらに、どの情報が本人識別に利用されやすいかを学習データから調べました。\n\n参加者IDを当てる分類器を作り、「どの方向の情報が、誰のデータかを見分けるのに使われているか」を調べます。\n\nそして、その方向の情報を表現から取り除きました。\n\nその後、先ほどのPCAによる圧縮を行います。\n\nこの表現をidentity-suppressed representationと呼んでいます。\n\nただし、ここで重要なのは、「この処理をしたから匿名になるわけではない」という点です。\n\n数学的にプライバシーを保証する方式ではありません。そのため、実際に攻撃モデルを使い、「どの程度情報が残っているか」を測ります。",
        terms: [{ word: "identity-suppressed representation", def: "本人特定に使われやすい方向の情報を取り除いた後に圧縮した表現。「匿名を保証」するものではなく、リスクを「低減する試み」。" }],
    },
    {
        heading: "3種類の攻撃を行った",
        sub: "どこまで情報が残っているかを実際に測る",
        body: "今回の研究では、圧縮後のデータに対して主に3種類の攻撃を行いました。\n\n【1. このデータが誰のものか当てる（Identity Attack）】\n\n圧縮後のデータから、「このデータは参加者A、B、Cの誰のものか」を推定します。\n\nもし高い精度で本人を当てられるなら、圧縮後のデータにも本人固有の情報が多く残っていることになります。\n\n【2. 元の特徴を復元する（Reconstruction Attack）】\n\n次に、圧縮後の8個の値から、元の208個の特徴をどこまで復元できるかを調べました。\n\nここで復元対象にしているのは、元の生のPPG波形そのものではありません。60秒窓から作った標準化済みの特徴量です。\n\nそのため、この結果を「元の心拍波形を完全に復元できた／できなくなった」と解釈することはできません。\n\n【3. 学習に使われたデータかどうか当てる（Membership Inference Attack）】\n\nさらに、「この60秒窓は学習側に含まれていたデータか、それともテスト側のデータか」を推定しました。\n\nこれはMembership Inference Attackと呼ばれる攻撃です。\n\n今回扱ったのは60秒窓単位のmembershipです。「この人そのものが研究参加者だったか」を当てるparticipant-levelのmembershipとは異なります。",
        terms: [{ word: "Membership Inference Attack", def: "「このデータが学習に使われたか」を推定する攻撃。高い確率で当てられるほど、学習データに固有の情報が残っていることを示す。" }],
    },
    {
        heading: "3つの公開データセットで評価した",
        body: "【WESAD（主評価・15名、526窓）】\n\nWESADはストレス・感情研究でよく使われる公開データセットです。今回の研究では15名分を使用しました。\n\nNeutralを本人のbaselineとして扱い、StressとAmusementは「baselineとは異なる状態」というオフライン評価用の目印として使っています。\n\n重要なのは、StressとAmusementを分類することが目的ではない、という点です。StressもAmusementも「普段とは異なる状態」としてまとめて扱います。\n\n【CASE（補助評価・30名、1200窓）】\n\nCASEには連続的なvalence（好ましさ）、arousal（活性度）の評価があります。\n\n明確なbaselineラベルがないため、「普段との差を表す値」と「参加者内の感情評価の変化」がどの程度関係するかを補助的に調べました。\n\n【SWELL-KW（境界事例の確認・22名、1437窓）】\n\nこれは、時間制約やメール割り込みなどを含む知識労働環境の公開データセットです。\n\nWESADでうまくいった方法が、仕事に近い文脈でも同じように機能するのかを確認するために使いました。",
    },
    {
        heading: "WESADでは高い「普段との差」の検出性能が得られた",
        body: "主評価であるWESADでは、identity-suppressed representationを使った場合、\n\nAUROC 0.994\n\nとなりました。\n\nここで評価しているのは「ストレスを正しく分類できるか」ではありません。\n\nbaseline状態とnon-baseline状態について、「普段と違う状態ほど高いスコアになるように順位づけできるか」を見ています。\n\n元の特徴量をそのまま使った場合のAUROCは0.750でした。\n本人の普段との差に変換すると0.796。\nPCAで圧縮すると0.993。\n本人識別に利用されやすい方向を減らした表現では0.994でした。",
        terms: [{ word: "AUROC", def: "Receiver Operating Characteristic曲線の下の面積。1.0が完璧、0.5が偶然と同じレベル。普段の状態と非普段の状態を正しく順位づける能力を表す。" }],
    },
    {
        heading: "本人特定や特徴復元に使える情報は減った",
        body: "WESADでは、元特徴から本人を当てるIdentity Advantageは0.882でした。\n\nこれが、\n個人内差分：0.811\nPCA圧縮：0.509\nIdentity suppression後：0.455\n\nまで低下しました。\n\n元特徴の復元についても、\n元特徴：0.999\n個人内差分：0.594\nPCA圧縮：0.389\nIdentity suppression後：0.388\n\nまで低下しました。\n\nつまりWESADでは、「普段と違う」という情報を高く保ったまま、本人特定や元特徴の復元に使える情報を減らすという方向性が確認できました。",
    },
    {
        heading: "ただし、プライバシー問題を解決したわけではない",
        body: "Membership Inferenceについては、\n\nidentity-suppressed representationでもAUC 0.690でした。\n\n偶然に近い状態まで下がったわけではありません。\n\nそのため、この研究では、「プライバシー問題を解決した」「個人情報が残っていない」とは主張していません。\n\n正確には、「今回試した攻撃に対して、本人特定と特徴復元は難しくなったが、学習データかどうかを推定する情報はまだ残っている」という結果です。",
    },
    {
        heading: "0.994という値が高すぎるため、追加確認も行った",
        body: "WESADのAUROC 0.994は非常に高い値です。\n\nそのため、「単にデータの並び順やラベルの付け方を覚えているだけではないか」という可能性を調べました。\n\nテスト側のラベルを参加者内でランダムに入れ替えると、AUROCは0.498まで低下しました。\n\nまた、意味のないランダムな表現を使うと、AUROCは0.518でした。\n\nそのため、0.994という結果が単純なラベル順序や完全にランダムな特徴だけで説明される可能性は低いと考えています。\n\nただし、「だから実環境でも0.994で動く」という意味ではありません。",
    },
    {
        heading: "通知タイミングはうまくいかなかった",
        body: "今回の研究で重要な失敗結果があります。\n\nWESADでは、non-baseline状態に対するtrigger rateは1.000でした。\n\n一方で、baseline状態でも、60%の窓で通知条件を超えてしまいました。\n\nfalse alarm rateは0.600です。\n\nつまり、「普段と違う状態を順位づける」ことはできても、「本当に通知すべきタイミングだけで通知する」ことはできていません。\n\nそのため、この研究では「日常利用できる通知システムが完成した」とは主張していません。\n\n今後は、より長期間のbaseline、周囲の状況を考慮した通知、本人による通知頻度設定などが必要です。",
    },
    {
        heading: "WESAD以外では結果が弱かった",
        body: "CASEでは、identity-suppressed representationと参加者内のvalence/arousal変化とのSpearman相関は、0.219でした。\n\n強い関係ではありません。\n\nSWELL-KWでは、個人内差分だけの場合はAUROC 0.656でしたが、identity suppression後は0.524まで低下しました。\n\nつまり、WESADで得られた結果が、そのまま仕事環境や別のデータセットに一般化したわけではありません。\n\nそのため論文でも、SWELL-KWは成功例ではなく、今回の方法がうまくいかない条件を示すboundary caseとして扱っています。",
    },
    {
        heading: "「あなたはストレスです」を出せないようにした",
        sub: "Claim Cap Layer",
        body: "もう一つの中心的な仕組みがClaim Cap Layerです。\n\nこれは、「システムがユーザーに言ってよい文章そのものを制限する仕組み」です。\n\n今回、出力できる内容は3段階だけにしました。\n\nLevel 0：何も表示しません。\n\nLevel 1：「現在のパターンが、あなたの普段の状態と異なっています」という、観察できた変化だけを提示します。\n\nLevel 2：「普段と少し違うようです。自分の状態を確認してみますか？」という、本人による自己確認を促します。\n\n一方で、「あなたはストレス状態です」「集中できていません」「体調が悪いです」といった文章は、そもそも出力候補に含めていません。\n\n重要なのは、「普段との差が大きくなったからといって、より強い意味の文章を出せるようにはならない」という点です。\n\nスコアが高くても、「普段とかなり違う」から「だからストレスである」という意味の飛躍を許しません。",
        terms: [{ word: "Claim Cap Layer", def: "システムがユーザーに出力できる文章の種類を事前に制限する仕組み。断定的・評価的な言い回しを禁止リストとして管理する。" }],
    },
    {
        heading: "Claim Capは生成AIではなく固定文章で実装した",
        body: "今回のClaim Capは、生成AIが自由に文章を作る方式ではありません。\n\nあらかじめ許可した固定文章だけを使います。\n\nそのため、出力可能な文章をすべて調べ、「stress」「unwell」「performance」「diagnosis」など、断定や評価につながる14種類の文字列が含まれていないことを検査しました。\n\nその結果、\n\nClaim-Capped feedbackでは、\nUnsupported Claim Rate = 0.000\nDiagnostic Label Rate = 0.000\n\nでした。\n\nただし、これは「どんな文章をAIが生成しても安全」という意味ではありません。今回用意した固定文章の集合には禁止表現が存在しなかった、という結果です。",
    },
    {
        heading: "この研究でできたこと・できていないこと",
        body: "今回の研究で確認できたのは、\n\n✓ WESADでは、本人の普段との差を表す情報を保持しながら、本人特定や元特徴の復元に使える情報を減らせる可能性がある\n✓ システムがユーザーに対して言える内容そのものを、実装として制限できる\n\nということです。\n\n一方で、\n\n✗ Membership Inferenceはまだ残っている（AUC 0.690）\n✗ 通知のfalse alarm rateが0.600と高い\n✗ CASEでは効果が弱い\n✗ SWELL-KWではutilityが大きく低下\n✗ 実環境での長期間評価は未実施\n✗ ユーザーがこの提示を本当に役立つと感じるかは未調査\n\nという課題があります。",
    },
    {
        heading: "この研究が主張していないこと",
        body: "この研究は、\n\n✗ ストレスを正しく診断できる研究ではありません。\n✗ プレゼンティーズムを推定する研究でもありません。\n✗ 病気、集中度、生産性を測定する研究でもありません。\n✗「この表現なら絶対に個人情報が漏れない」と数学的に保証した研究でもありません。\n✗「このままスマートウォッチに搭載して日常利用できる」というところまで到達した研究でもありません。\n\n今回確認したのは、「普段との差を表す情報をどこまで残せるか、その圧縮後のデータからどこまで本人や元情報を推定できてしまうか、そしてユーザーへの断定的な文章をシステム側で禁止できるか」という技術的な部分です。",
    },
    {
        heading: "この研究で一番考えたかったこと",
        sub: "「当てられるか」だけでなく、「何をデータに残し、何をユーザーに言ってよいか」まで設計する",
        body: "生体情報AIでは、「人について、どこまで正確に当てられるか」がよく研究されます。\n\n私はそれだけでは不十分だと考えました。\n\n当てられるようになったとしても、\n\nその情報をシステムの中に残す必要があるのか。\nその情報をユーザーに伝える必要があるのか。\n伝えるとして、どこまで断定してよいのか。\n\nも設計する必要があります。\n\nこの研究では、「ストレスを高精度に当てる」のではなく、「普段の自分と違う」というところまでで情報を止めるという方法を試しました。\n\nさらに、その圧縮後の情報から本人特定や元特徴の復元がどこまでできてしまうかを実際に攻撃し、最後に「あなたはストレスです」という文章そのものをシステムが出せないようにするところまで実装しました。\n\n目標は、生体情報を使ってユーザーについてより多くのことを言えるようにすることではありません。\n\n必要な気づきは残しながら、必要以上の情報を残さず、必要以上のことを言わないシステムを作れるか。\n\nそれを技術として検討した研究です。",
    },
];

// ─── 生体信号・高次元ベクトル幾何学のCanvasグラフィック ─────────────────────────────
const SignalArtCanvas = () => {
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

        // 208次元から8次元への主成分圧縮ベクトルパーティクル
        const points = Array.from({ length: 40 }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            radius: Math.random() * 2 + 1,
            phase: Math.random() * Math.PI * 2,
        }));

        let t = 0;

        const render = () => {
            t += 0.015;
            ctx.clearRect(0, 0, width, height);

            // 背景波形 (ECG/PPG 脈流)
            ctx.beginPath();
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)'; // Cyan 500

            for (let x = 0; x < width; x += 2) {
                // 生体信号の周期とP-Q-R-S-T波形シミュレーション
                const cycle = (x + t * 60) % 240;
                let yOffset = Math.sin((x + t * 20) * 0.01) * 6;

                if (cycle > 90 && cycle < 100) {
                    yOffset -= (cycle - 90) * 2; // P波
                } else if (cycle >= 100 && cycle < 105) {
                    yOffset += (cycle - 100) * 6; // Q波
                } else if (cycle >= 105 && cycle < 115) {
                    yOffset -= (115 - cycle) * 8; // R波 (鋭いスパイク)
                } else if (cycle >= 115 && cycle < 125) {
                    yOffset += (cycle - 115) * 5; // S波
                } else if (cycle >= 140 && cycle < 170) {
                    yOffset -= Math.sin((cycle - 140) / 30 * Math.PI) * 12; // T波
                }

                const y = height * 0.4 + yOffset;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();

            // 8次元圧縮空間の接続線 (幾何学的グラフ)
            ctx.strokeStyle = 'rgba(168, 85, 247, 0.12)'; // Purple
            ctx.lineWidth = 1;

            for (let i = 0; i < points.length; i++) {
                const p = points[i];
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > width) p.vx *= -1;
                if (p.y < 0 || p.y > height) p.vy *= -1;

                // 点の描画
                const pulse = Math.sin(t * 2 + p.phase) * 0.5 + 1;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius * pulse, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(6, 182, 212, 0.5)';
                ctx.fill();

                // 近接点とのクラスタリング線（次元圧縮の表現）
                for (let j = i + 1; j < points.length; j++) {
                    const p2 = points[j];
                    const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
                    if (dist < 90) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            }

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
            className="absolute inset-0 w-full h-full pointer-events-none opacity-80"
        />
    );
};

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
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 rounded-md text-xs font-mono tracking-tight border border-cyan-200 dark:border-cyan-800/80 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 transition-all cursor-help"
            >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                {word}
            </button>
            {open && (
                <span className="absolute z-50 left-0 top-full mt-1.5 w-72 p-3.5 bg-neutral-900/95 dark:bg-neutral-900 backdrop-blur-md border border-neutral-700 dark:border-neutral-700 rounded-xl shadow-2xl text-xs text-neutral-200 leading-relaxed z-50 pointer-events-none">
                    <strong className="block text-cyan-400 font-mono mb-1">{word}</strong>
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

export const ResearchModal = ({ onClose }: { onClose: () => void }) => {
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

            {/* メインウィンドウ (エディトリアル・モダン建築的デザイン) */}
            <div className="relative z-10 w-full max-w-3xl h-[88vh] md:h-[88vh] flex flex-col bg-white dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden font-sans">

                {/* ヘッダーセクション（幾何学・生体信号アート統合） */}
                <div className="relative flex-shrink-0 px-6 sm:px-8 pt-7 pb-5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/60 backdrop-blur-sm overflow-hidden">
                    <SignalArtCanvas />

                    <div className="relative z-10">
                        <div className="flex items-start justify-between gap-4 mb-3">
                            <div>
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 dark:bg-cyan-400/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20 rounded-full text-xs font-mono font-medium">
                                        <Sparkles size={12} className="text-cyan-500" />
                                        EAI MobiQuitous 2026
                                    </span>
                                    <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400 tracking-wider">
                                        Regular Paper · 単著
                                    </span>
                                </div>
                                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white leading-tight font-sans">
                                    Claim-Capped Biosignal Feedback
                                </h2>
                                <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400 mt-1">
                                    Kotaro Furukawa · カメラレディ完了・DOI取得待ち
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
                                    ? 'bg-purple-900 text-white dark:bg-purple-500 dark:text-white shadow-md'
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
                    <div className="relative p-5 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-transparent dark:from-cyan-500/10 dark:via-purple-500/10 rounded-xl border border-cyan-500/20 dark:border-cyan-500/30">
                        <div className="flex gap-3">
                            <span className="text-base flex-shrink-0">💡</span>
                            <div className="space-y-1">
                                <span className="block text-xs font-mono font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
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
                                            <span className="w-1.5 h-4 bg-cyan-500 rounded-full" />
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
                                            <p className="mt-1 text-sm font-mono font-medium text-purple-600 dark:text-purple-400 tracking-wide">
                                                — {sec.sub}
                                            </p>
                                        )}
                                    </div>
                                    <BodyText text={sec.body} />
                                    {sec.items && (
                                        <ul className="my-3 grid grid-cols-1 sm:grid-cols-2 gap-2 p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border border-neutral-200/60 dark:border-neutral-800/60">
                                            {sec.items.map((item, j) => (
                                                <li key={j} className="text-xs font-mono text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
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
                                <BookOpen size={14} className="text-cyan-500" />
                                <span>カメラレディ完了・DOI取得待ち</span>
                            </div>
                            <a
                                href="https://confyplus.eai.eu/app#manage-paper/id/367209/cid/53753/tid/5314"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 font-bold text-cyan-600 dark:text-cyan-400 hover:underline"
                            >
                                <ExternalLink size={12} />
                                論文管理
                            </a>
                            <a
                                href="https://mobiquitous.eai-conferences.org/2026/"
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
