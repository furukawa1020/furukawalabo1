--- File: apps/web/src/components/ResearchModal.tsx ---
import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Share2, Copy, Check, BookOpen, FileText, Microscope, ExternalLink } from 'lucide-react';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// コンテンツ — 文章は一字一句変更禁止
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WebGL hook — ECG圧縮シェーダー (GLSL fragment shader)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const VERT = `attribute vec2 a;void main(){gl_Position=vec4(a,0,1);}`;

// 生体信号→208次元→PCA→8次元圧縮の可視化シェーダー
const FRAG_BIOSIGNAL = `
precision mediump float;
uniform vec2 u_res;
uniform float u_t;

float h(vec2 p){p=fract(p*vec2(234.34,435.345));p+=dot(p,p+34.23);return fract(p.x*p.y);}
float sn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}

// ECG waveform: P-QRS-T complex
float ecg(float x){
  float t=fract(x);
  if(t<.05) return 0.;
  if(t<.13) return sin((t-.05)/.08*3.14159)*.28;
  if(t<.20) return 0.;
  if(t<.23) return -(t-.20)/.03*.4;
  if(t<.265)return (t-.23)/.035*9.5-.4;
  if(t<.32) return -(t-.265)/.055*9.1+9.1;
  if(t<.36) return (t-.32)/.04*.4-.4;
  if(t<.40) return 0.;
  if(t<.56) return sin((t-.40)/.16*3.14159)*.42;
  return 0.;
}

void main(){
  vec2 uv=gl_FragCoord.xy/u_res;
  float t=u_t;
  vec3 col=vec3(.012,.014,.03);

  // 10本の信号線 — 上が高次元(ノイジー)、下が圧縮後(クリーン)
  for(int i=0;i<10;i++){
    float fi=float(i)/9.;
    float yc=.08+fi*.84;
    float dy=abs(uv.y-yc);
    if(dy>.1) continue;

    float comp=fi; // 0=raw, 1=compressed
    float spd=.22+(.5-comp*.3);
    float phase=float(i)*.892+sin(float(i)*2.17)*.9;
    float freq=mix(1.6,.5,comp);

    float x=uv.x*freq+t*spd+phase;
    float s=ecg(x)*.055*(1.-comp*.35);

    // ノイズ: 圧縮前の信号に付加
    float ns=(sn(vec2(uv.x*14.+t*.8,fi*9.3))-.5)*.03*(1.-comp);
    s+=ns;

    float dist=abs(uv.y-yc-s);
    // 信号の輝度: 圧縮後は細く鮮明に
    float w=.00015+comp*.00025;
    float glow=exp(-dist*dist/w);

    // 色: シアン(生) → 紫(圧縮済み)
    vec3 sc=mix(vec3(.0,.78,.92),vec3(.72,.28,1.),comp);

    // 圧縮後は一部の信号を消す (208→8の視覚化)
    float exists=1.;
    if(comp>.55&&mod(float(i),3.)>0.) exists=max(0.,1.-(comp-.55)*2.8);

    col+=sc*glow*.55*exists;
  }

  // 微細グリッド (技術的質感)
  vec2 gv=fract(uv*vec2(22.,11.));
  col+=vec3(.03,.06,.1)*step(.96,max(gv.x,gv.y))*.6;

  // スキャンライン
  col*=.88+.12*step(.5,fract(gl_FragCoord.y*.5));

  // ビニェット
  vec2 v=uv-.5;
  col*=max(0.,1.-dot(v,v)*1.6);

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
// 研究専用UI部品
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 研究パイプライン メトリクスバー
const MetricsBar = () => (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-3 border-t border-white/10 mt-3">
        <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest">AUROC</span>
            <span className="font-mono text-xl font-black text-cyan-300 tabular-nums">0.994</span>
        </div>
        <div className="hidden sm:block w-px h-5 bg-white/10" />
        <div className="flex items-center gap-1.5 font-mono text-sm">
            <span className="text-neutral-500">208</span>
            <span className="text-neutral-600 text-xs">dim</span>
            <span className="text-neutral-600 mx-0.5">→</span>
            <span className="text-purple-300 font-bold">8</span>
            <span className="text-neutral-500 text-xs">dim</span>
        </div>
        <div className="hidden sm:block w-px h-5 bg-white/10" />
        <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest">MI&#8209;AUC</span>
            <span className="font-mono text-lg font-bold text-amber-400 tabular-nums">0.690</span>
            <span className="font-mono text-[9px] text-amber-700 uppercase">残存</span>
        </div>
        <div className="hidden sm:block w-px h-5 bg-white/10" />
        <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest">Identity&#8209;Adv</span>
            <span className="font-mono text-sm text-neutral-400 tabular-nums">0.882</span>
            <span className="text-neutral-600 text-xs">→</span>
            <span className="font-mono text-sm font-bold text-green-400 tabular-nums">0.455</span>
        </div>
    </div>
);

// 専門用語バッジ — ホバーで定義表示
const TermBadge = ({ word, def }: { word: string; def: string }) => {
    const [open, setOpen] = useState(false);
    return (
        <span className="relative inline-block">
            <button
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
                onClick={() => setOpen(v => !v)}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-mono
                   bg-cyan-950/60 text-cyan-400 border border-cyan-800/60 rounded
                   hover:bg-cyan-900/60 transition-colors cursor-help"
            >
                <span className="w-1 h-1 rounded-full bg-cyan-500 animate-pulse" />
                {word}
            </button>
            {open && (
                <span className="absolute z-50 left-0 top-full mt-2 w-72 p-3 rounded-lg shadow-2xl
                    bg-neutral-950 border border-neutral-700 text-[11px] leading-relaxed
                    text-neutral-300 font-sans pointer-events-none">
                    <strong className="block font-mono text-cyan-400 mb-1">{word}</strong>
                    {def}
                </span>
            )}
        </span>
    );
};

// 本文レンダラー — ✓/✗/●/【】 を研究ドキュメント的に表示
const BodyText = ({ text }: { text: string }) => {
    const paras = text.split('\n\n');
    return (
        <div className="space-y-3.5">
            {paras.map((para, i) => {
                const lines = para.split('\n');

                // ✓ / ✗ を含む段落 → リスト表示
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

                // ● 箇条書き
                if (lines.some(l => l.startsWith('●'))) {
                    return (
                        <div key={i} className="space-y-1.5 my-1">
                            {lines.map((line, j) =>
                                line.startsWith('●')
                                    ? <div key={j} className="flex gap-2.5 items-start">
                                        <span className="mt-1.5 w-1 h-1 rounded-full bg-cyan-500 flex-shrink-0" />
                                        <span className="text-[15px] text-neutral-300 leading-relaxed">{line.replace('● ', '')}</span>
                                    </div>
                                    : <p key={j} className="text-[15px] text-neutral-300 leading-relaxed">{line}</p>
                            )}
                        </div>
                    );
                }

                // 数値強調行 (AUROC / AUC 単独行)
                if (/^AUROC\s[\d.]+$/.test(para.trim()) || /^AUC\s[\d.]+$/.test(para.trim())) {
                    return (
                        <p key={i} className="font-mono text-2xl font-black text-cyan-300 tracking-tight py-1">
                            {para}
                        </p>
                    );
                }

                // 引用文 (「」で始まる短い段落)
                if (para.startsWith('「') && para.length < 80) {
                    return (
                        <p key={i} className="pl-3 border-l-2 border-cyan-700/60 text-[15px] text-cyan-200/80 italic leading-relaxed my-2">
                            {para}
                        </p>
                    );
                }

                // 通常段落
                return (
                    <p key={i} className="text-[15px] text-neutral-300 leading-[1.75] whitespace-pre-line">
                        {para}
                    </p>
                );
            })}
        </div>
    );
};

// シェアボタン
const ShareButton = () => {
    const [copied, setCopied] = useState(false);
    const url = typeof window !== 'undefined' ? `${window.location.origin}/research` : '';
    const tweet = `https://twitter.com/intent/tweet?text=${encodeURIComponent('Claim-Capped Biosignal Feedback — 生体情報から断定を切り離す研究 #MobiQuitous2026')}&url=${encodeURIComponent(url)}&via=HATAKE55555`;
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

export const ResearchModal = ({ onClose }: { onClose: () => void }) => {
    const [tab, setTab] = useState<Tab>('short');
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useGLShader(canvasRef, FRAG_BIOSIGNAL);

    const onKey = useCallback((e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }, [onClose]);
    useEffect(() => {
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
    }, [onKey]);

    return (
        <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={onClose} />

            {/* ウィンドウ: 全体的にダーク研究ドキュメント風 */}
            <div className="relative z-10 w-full max-w-3xl sm:mx-4
                h-[92vh] sm:h-[88vh]
                flex flex-col
                bg-neutral-950 border border-neutral-800
                sm:rounded-xl overflow-hidden shadow-2xl">

                {/* ─── ヘッダー: WebGL生体信号アート + タイトル + メトリクス ─── */}
                <div className="relative flex-shrink-0 overflow-hidden" style={{ minHeight: 180 }}>
                    {/* WebGL Canvas — フルブリード */}
                    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

                    {/* コンテンツオーバーレイ */}
                    <div className="relative z-10 px-5 sm:px-7 pt-5 pb-4 flex flex-col justify-between h-full"
                        style={{ background: 'linear-gradient(to bottom, rgba(1,2,8,.7) 0%, rgba(1,2,8,.5) 60%, rgba(1,2,8,.92) 100%)' }}>

                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="font-mono text-[10px] text-cyan-500 uppercase tracking-widest border border-cyan-900/60 px-2 py-0.5 rounded">
                                        EAI MobiQuitous 2026
                                    </span>
                                    <span className="font-mono text-[10px] text-neutral-600 uppercase tracking-widest">
                                        Regular Paper · 単著
                                    </span>
                                </div>
                                <h2 className="font-mono text-base sm:text-lg font-bold text-white leading-tight tracking-tight">
                                    Claim&#8209;Capped Biosignal Feedback
                                </h2>
                                <p className="font-mono text-[10px] text-neutral-600 mt-0.5">
                                    Kotaro Furukawa — カメラレディ完了・DOI取得待ち
                                </p>
                            </div>
                            <button onClick={onClose} aria-label="閉じる"
                                className="p-1.5 rounded-lg text-neutral-600 hover:text-white hover:bg-white/10 transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        {/* メトリクスバー */}
                        <MetricsBar />
                    </div>
                </div>

                {/* ─── タブ ─── */}
                <div className="flex-shrink-0 flex gap-0 border-b border-neutral-800 bg-neutral-950">
                    {(['short', 'long'] as Tab[]).map(t => (
                        <button key={t} onClick={() => setTab(t)}
                            className={`flex items-center gap-2 px-5 py-2.5 font-mono text-[11px] uppercase tracking-widest border-b-2 transition-all
                                ${tab === t
                                    ? 'border-cyan-500 text-cyan-400 bg-cyan-950/20'
                                    : 'border-transparent text-neutral-600 hover:text-neutral-400 hover:bg-white/5'}`}>
                            {t === 'short' ? <><FileText size={12} />短い版</> : <><Microscope size={12} />長い版</>}
                        </button>
                    ))}
                </div>

                {/* ─── スクロール本文 ─── */}
                <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-6 space-y-7 bg-neutral-950">
                    {/* 一言説明 — 常時表示 */}
                    <div className="flex gap-3 p-4 rounded-lg border border-neutral-800 bg-neutral-900/60">
                        <span className="flex-shrink-0 font-mono text-[10px] text-cyan-700 uppercase tracking-widest mt-0.5 w-16">one&#8209;liner</span>
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
                            <div>
                                <div className="flex items-start gap-3">
                                    <span className="font-mono text-[10px] text-neutral-700 mt-1 w-6 flex-shrink-0 tabular-nums">
                                        {String(i + 1).padStart(2, '0')}
                                    </span>
                                    <div>
                                        <h3 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug">{sec.heading}</h3>
                                        {sec.sub && <p className="font-mono text-[11px] text-cyan-700 uppercase tracking-wider mt-0.5">— {sec.sub}</p>}
                                    </div>
                                </div>
                            </div>
                            <div className="pl-9 space-y-3">
                                <BodyText text={sec.body} />
                                {sec.items && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 p-3 bg-neutral-900/60 rounded border border-neutral-800/60 mt-2">
                                        {sec.items.map((item, j) => (
                                            <span key={j} className="font-mono text-[11px] text-neutral-500 flex items-center gap-1.5">
                                                <span className="w-1 h-1 rounded-full bg-cyan-800 flex-shrink-0" />{item}
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
                            <BookOpen size={11} />EAI MobiQuitous 2026
                        </div>
                        <a href="https://confyplus.eai.eu/app#manage-paper/id/367209/cid/53753/tid/5314"
                            target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 font-mono text-[10px] text-cyan-700 hover:text-cyan-500 transition-colors">
                            <ExternalLink size={10} />論文管理
                        </a>
                        <a href="https://mobiquitous.eai-conferences.org/2026/"
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


--- File: apps/web/src/components/Interaction2026Modal.tsx ---
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
