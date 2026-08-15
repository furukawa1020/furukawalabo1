import { useRef, useEffect, useState, useCallback } from 'react';
import { X, Share2, Copy, Check, ExternalLink } from 'lucide-react';

// ────────────────────────────────────────────────────────────────
// Canvas: ECG waveform background (8 channels = 8 PCA components)
// ────────────────────────────────────────────────────────────────

function useECGCanvas(ref: React.RefObject<HTMLCanvasElement>) {
    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animId: number;
        let t = 0;

        const resize = () => {
            canvas.width = canvas.offsetWidth * window.devicePixelRatio;
            canvas.height = canvas.offsetHeight * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(canvas);

        // 8 channels — the 8 PCA components after compression from 208
        const channels = [
            { freq: 0.9, phase: 0.0, alpha: 0.07, speed: 1.0 },
            { freq: 1.7, phase: 0.8, alpha: 0.05, speed: 0.7 },
            { freq: 2.3, phase: 1.6, alpha: 0.04, speed: 1.3 },
            { freq: 0.5, phase: 2.4, alpha: 0.06, speed: 0.5 },
            { freq: 3.1, phase: 3.2, alpha: 0.03, speed: 1.6 },
            { freq: 1.2, phase: 4.0, alpha: 0.05, speed: 0.9 },
            { freq: 4.0, phase: 4.8, alpha: 0.03, speed: 1.1 },
            { freq: 0.7, phase: 5.6, alpha: 0.06, speed: 0.6 },
        ];

        const W = () => canvas.offsetWidth;
        const H = () => canvas.offsetHeight;

        const draw = () => {
            const w = W(), h = H();
            ctx.clearRect(0, 0, w, h);

            channels.forEach((ch, i) => {
                const yBase = h * 0.5;
                const amp = h * 0.16;
                ctx.beginPath();
                ctx.lineWidth = 0.8;
                ctx.strokeStyle = `rgba(34,211,238,${ch.alpha})`;

                for (let px = 0; px <= w; px += 1) {
                    const nx = px / w;
                    // multi-harmonic wave
                    const wave =
                        Math.sin(nx * ch.freq * 14 + t * ch.speed + ch.phase) * 0.7 +
                        Math.sin(nx * ch.freq * 37 + t * ch.speed * 1.3) * 0.2 +
                        Math.sin(nx * ch.freq * 5 + t * ch.speed * 0.5) * 0.1;
                    // QRS spike — sharp spike at approx x=42% per channel
                    const spikeX = 0.38 + i * 0.04;
                    const spike = Math.exp(-Math.pow((nx - spikeX) / 0.006, 2)) * 2.4;
                    const y = yBase + (wave + spike) * amp * 0.45;
                    px === 0 ? ctx.moveTo(px, y) : ctx.lineTo(px, y);
                }
                ctx.stroke();
            });

            // faint horizontal scan line
            const scan = ((t * 60) % w);
            const scanGrad = ctx.createLinearGradient(scan - 60, 0, scan + 20, 0);
            scanGrad.addColorStop(0, 'rgba(34,211,238,0)');
            scanGrad.addColorStop(0.7, 'rgba(34,211,238,0.04)');
            scanGrad.addColorStop(1, 'rgba(34,211,238,0)');
            ctx.fillStyle = scanGrad;
            ctx.fillRect(scan - 60, 0, 80, h);

            t += 0.012;
            animId = requestAnimationFrame(draw);
        };
        draw();

        return () => { cancelAnimationFrame(animId); ro.disconnect(); };
    }, [ref]);
}

// ────────────────────────────────────────────────────────────────
// Share
// ────────────────────────────────────────────────────────────────

const ShareBar = () => {
    const [copied, setCopied] = useState(false);
    const url = `${window.location.origin}/research`;
    const text = `Claim-Capped Biosignal Feedback — 「ストレスを当てる」ではなく「普段との差」だけを扱い、断定文をシステム側で禁止した研究 / EAI MobiQuitous 2026`;
    const copy = () => { navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); };
    return (
        <div className="flex items-center gap-3">
            <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&via=HATAKE55555`}
                target="_blank" rel="noopener noreferrer"
                className="text-[11px] font-mono tracking-widest text-cyan-400/60 hover:text-cyan-400 transition-colors uppercase"
            >
                Share →
            </a>
            <button onClick={copy} className="text-[11px] font-mono tracking-widest text-cyan-400/60 hover:text-cyan-400 transition-colors uppercase">
                {copied ? 'Copied.' : 'Copy URL'}
            </button>
        </div>
    );
};

// ────────────────────────────────────────────────────────────────
// Content
// ────────────────────────────────────────────────────────────────

const SHORT = () => (
    <article className="space-y-8 text-[#c8d4e0] leading-[1.85]">
        <p className="text-lg md:text-xl font-light">
            心拍の変化は、ストレスではないかもしれない。
        </p>
        <p>
            運動、カフェイン、暑さ、興奮——同じ生理反応が何を意味するかは
            その文脈でしか決まらない。
            それにもかかわらず多くのシステムは「あなたはストレスです」と断言する。
            この研究はその断定をやめた。
        </p>
        <blockquote className="border-l-2 border-cyan-500/40 pl-5 py-1 my-6">
            <p className="text-base text-cyan-200/80 italic font-light leading-relaxed">
                "Observation is a fact.&ensp;Interpretation is a claim."
            </p>
            <p className="text-[12px] text-cyan-400/50 mt-2 font-mono tracking-widest uppercase">— Research Stance</p>
        </blockquote>
        <p>
            扱うのはただ一つの問いだ——<br />
            <strong className="text-white">いまの自分は、普段の自分とどれだけ違うか。</strong>
        </p>
        <p>
            60秒ごとの生体信号から{' '}
            <span className="font-mono text-cyan-300">208</span> 個の特徴量を抽出し、
            本人基準値との差に変換する。
            その差を{' '}<span className="font-mono text-cyan-300">PCA</span>{' '}で
            <span className="font-mono text-cyan-300">8</span> 次元に圧縮した。
        </p>
        <p>
            圧縮後のデータに対し、3種の攻撃を試みた。
            本人特定、特徴量復元、学習データ推定——
            それぞれがどこまで情報を引き出せるかを測る。
        </p>
        <div className="grid grid-cols-3 gap-4 py-2">
            {[
                { label: 'AUROC', val: '0.994', sub: '普段との差の検出' },
                { label: 'Identity', val: '0.455', sub: '本人特定への抵抗' },
                { label: 'Membership', val: '0.690', sub: 'まだ残る情報' },
            ].map(d => (
                <div key={d.label} className="text-center">
                    <div className="font-mono text-2xl md:text-3xl text-cyan-300 leading-none">{d.val}</div>
                    <div className="text-[10px] font-mono tracking-widest uppercase text-cyan-500/60 mt-1">{d.label}</div>
                    <div className="text-[11px] text-[#8899aa] mt-0.5">{d.sub}</div>
                </div>
            ))}
        </div>
        <p>
            最後に言語層を絞った。
            システムが出せる文章は3種類のみ——
            <span className="italic text-white/70">「何も表示しない」「普段と異なっています」「確認してみますか？」</span>。
            「あなたはストレス状態です」という文は出力候補に存在しない。
        </p>
        <p className="text-[#667788]">
            Unsupported Claim Rate ={' '}
            <span className="font-mono text-cyan-300/70">0.000</span>。
            Diagnostic Label Rate ={' '}
            <span className="font-mono text-cyan-300/70">0.000</span>。
        </p>
    </article>
);

const LONG = () => (
    <article className="space-y-10 text-[#c8d4e0] leading-[1.85]">
        <section className="space-y-4">
            <h3 className="font-mono text-[11px] tracking-[0.2em] uppercase text-cyan-500/60">§ 1 &nbsp; 問題意識</h3>
            <p className="text-lg md:text-xl font-light">
                生体情報に変化があったことと、その原因が分かることは同じではない。
            </p>
            <p>
                心拍数が普段より高い。それは事実だ。しかしその事実から「ストレス」という解釈を引き出すとき、
                そこには巨大な飛躍がある。ストレスを当てることが研究目標になると、
                システムは必然的にラベルを出力する。そのラベルが本人や周囲から
                固定的な評価として扱われるとき、曖昧な生理変化は意味を持ちすぎる。
            </p>
        </section>

        <section className="space-y-4">
            <h3 className="font-mono text-[11px] tracking-[0.2em] uppercase text-cyan-500/60">§ 2 &nbsp; Within-Person Atypicality</h3>
            <blockquote className="border-l-2 border-cyan-500/40 pl-5 py-1">
                <p className="text-base text-cyan-200/80 italic font-light">
                    "Observation is a fact.&ensp;Interpretation is a claim."
                </p>
            </blockquote>
            <p>
                この研究が扱うのは <span className="text-white font-medium">個人内の非典型性（within-person atypicality）</span> だ。
                「ストレスである確率」ではない。
                あなたの普段の状態を基準として、いまがどれだけ離れているかだけを捉える。
                他者との比較はない。ラベルも診断もない。
            </p>
            <p>
                参加者ごとに baseline の中央値とばらつきを算出し、
                現在の特徴量を「本人通常状態からの距離」に変換する。
                心拍{' '}<span className="font-mono text-cyan-300">90</span> が何を意味するかは、
                普段 <span className="font-mono text-cyan-300">60</span> の人と
                普段 <span className="font-mono text-cyan-300">85</span> の人では違う。
            </p>
        </section>

        <section className="space-y-4">
            <h3 className="font-mono text-[11px] tracking-[0.2em] uppercase text-cyan-500/60">§ 3 &nbsp; 208 → 8 &nbsp; 特徴量圧縮</h3>
            <p>
                生体信号を重複なし <span className="font-mono text-cyan-300">60</span> 秒単位で区切り、
                各窓につき平均・標準偏差・中央値・四分位範囲・傾き・周波数成分・歪度・尖度などを計算する。
                WESAD と CASE では 1窓 ＝ <span className="font-mono text-cyan-300">208</span> 個の数値になった。
            </p>
            <p>
                この <span className="font-mono text-cyan-300">208</span> 次元を
                PCA（主成分分析）で <span className="font-mono text-cyan-300">8</span> 次元に圧縮する。
                目的は二つ——重要な変化を残すこと、と、余分な情報を削ること。
                さらに、本人識別に使われやすい方向の成分を取り除いた。
                この表現を <em>identity-suppressed representation</em>（z_p）と呼ぶ。
            </p>
        </section>

        <section className="space-y-4">
            <h3 className="font-mono text-[11px] tracking-[0.2em] uppercase text-cyan-500/60">§ 4 &nbsp; 攻撃実験</h3>
            <p>
                圧縮後のデータに対して3種の攻撃モデルを走らせた。
            </p>
            <div className="space-y-3">
                {[
                    { n: '① Identity Attack', body: 'このデータは誰のものか——参加者IDを当てる分類器。z_p では Identity Advantage が 0.455 まで低下（元特徴: 0.882）。' },
                    { n: '② Reconstruction Attack', body: '8次元から元の208次元特徴量をどこまで復元できるか。Reconstruction AUC は 0.388 まで低下（元: 0.999）。' },
                    { n: '③ Membership Inference Attack', body: 'この60秒窓が学習データに含まれていたか——AUC 0.690。まだ情報は残っている。これが「プライバシー解決」と言えない理由だ。' },
                ].map(item => (
                    <div key={item.n} className="p-4 border border-cyan-900/40 rounded-xl bg-cyan-950/10">
                        <div className="font-mono text-[11px] tracking-widest uppercase text-cyan-500/70 mb-1">{item.n}</div>
                        <p className="text-sm text-[#aabbcc]">{item.body}</p>
                    </div>
                ))}
            </div>
        </section>

        <section className="space-y-4">
            <h3 className="font-mono text-[11px] tracking-[0.2em] uppercase text-cyan-500/60">§ 5 &nbsp; 評価データセット</h3>
            <div className="grid grid-cols-3 gap-3 font-mono text-center">
                {[
                    { ds: 'WESAD', n: '15名 / 526窓', note: '主評価' },
                    { ds: 'CASE', n: '30名 / 1200窓', note: '補助評価' },
                    { ds: 'SWELL-KW', n: '22名 / 1437窓', note: 'Boundary case' },
                ].map(d => (
                    <div key={d.ds} className="border border-cyan-900/30 rounded-lg p-3">
                        <div className="text-cyan-300 text-sm font-bold">{d.ds}</div>
                        <div className="text-[11px] text-[#8899aa] mt-1">{d.n}</div>
                        <div className="text-[10px] text-cyan-500/50 mt-0.5">{d.note}</div>
                    </div>
                ))}
            </div>
            <p className="text-sm text-[#8899aa]">
                WESAD では AUROC <span className="font-mono text-cyan-300">0.994</span>。
                SWELL-KW では identity suppression 後に <span className="font-mono text-cyan-300">0.524</span> まで低下——
                この方法がうまくいかない条件を示す境界事例として扱っている。
            </p>
        </section>

        <section className="space-y-4">
            <h3 className="font-mono text-[11px] tracking-[0.2em] uppercase text-cyan-500/60">§ 6 &nbsp; Claim Cap Layer</h3>
            <p>
                出力できる文章を3段階に制限した。スコアがどれほど高くても、
                「あなたはストレス状態です」「集中できていません」への意味の飛躍を許さない設計だ。
            </p>
            <div className="space-y-2 font-mono text-sm">
                {[
                    { level: 'Level 0', text: '（何も表示しない）', dim: true },
                    { level: 'Level 1', text: '「現在のパターンが、あなたの普段の状態と異なっています」', dim: false },
                    { level: 'Level 2', text: '「普段と少し違うようです。自分の状態を確認してみますか？」', dim: false },
                ].map(l => (
                    <div key={l.level} className={`flex gap-3 ${l.dim ? 'opacity-40' : ''}`}>
                        <span className="text-cyan-500/60 shrink-0">{l.level}</span>
                        <span className="text-[#c8d4e0]">{l.text}</span>
                    </div>
                ))}
            </div>
            <p className="text-sm text-[#667788]">
                Unsupported Claim Rate = <span className="font-mono text-cyan-300">0.000</span>{' '}
                — Diagnostic Label Rate = <span className="font-mono text-cyan-300">0.000</span>
            </p>
        </section>

        <section className="space-y-4">
            <h3 className="font-mono text-[11px] tracking-[0.2em] uppercase text-cyan-500/60">§ 7 &nbsp; この研究が主張しないこと</h3>
            <p>
                ストレスを正しく診断できる研究ではない。プライバシーを数学的に保証した研究でもない。
                日常利用できるシステムが完成したとも言えない——
                false alarm rate は <span className="font-mono text-cyan-300">0.600</span> のままだ。
            </p>
            <p className="text-white/60 border-l border-white/10 pl-4 italic">
                AIが人について何を当てられるかだけでなく、
                何をデータとして残し、何をユーザーに言ってよいのかまで、
                システム側で設計する必要があるのではないか。
            </p>
        </section>
    </article>
);

// ────────────────────────────────────────────────────────────────
// Modal
// ────────────────────────────────────────────────────────────────

export const ResearchModal = ({ onClose }: { onClose: () => void }) => {
    const [tab, setTab] = useState<'short' | 'long'>('short');
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useECGCanvas(canvasRef);

    const handleKey = useCallback((e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }, [onClose]);
    useEffect(() => {
        document.addEventListener('keydown', handleKey);
        document.body.style.overflow = 'hidden';
        return () => { document.removeEventListener('keydown', handleKey); document.body.style.overflow = ''; };
    }, [handleKey]);

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 md:p-6" role="dialog" aria-modal="true">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

            {/* Window */}
            <div
                className="relative z-10 w-full max-w-2xl h-[90vh] flex flex-col rounded-2xl overflow-hidden"
                style={{ background: '#050a12', border: '1px solid rgba(34,211,238,0.12)', boxShadow: '0 0 60px rgba(34,211,238,0.06), 0 40px 80px rgba(0,0,0,0.8)' }}
            >
                {/* Canvas background */}
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 1 }} />

                {/* Header */}
                <div className="relative flex-shrink-0 px-6 pt-6 pb-5" style={{ borderBottom: '1px solid rgba(34,211,238,0.08)' }}>
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                            <div className="font-mono text-[10px] tracking-[0.25em] uppercase" style={{ color: 'rgba(34,211,238,0.5)' }}>
                                EAI MobiQuitous 2026 &nbsp;/&nbsp; Regular Paper &nbsp;/&nbsp; 単著
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold leading-tight" style={{ color: '#e8f4ff', letterSpacing: '-0.02em' }}>
                                Claim-Capped<br className="md:hidden" /> Biosignal Feedback
                            </h2>
                            <div className="font-mono text-[11px]" style={{ color: 'rgba(200,212,224,0.45)' }}>
                                Kotaro Furukawa
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-colors"
                            style={{ color: 'rgba(200,212,224,0.4)' }}
                            aria-label="閉じる"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Tab bar */}
                    <div className="flex gap-0 mt-5" style={{ borderBottom: '1px solid rgba(34,211,238,0.08)' }}>
                        {(['short', 'long'] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                className="relative pb-3 pr-6 font-mono text-[11px] tracking-[0.15em] uppercase transition-colors"
                                style={{ color: tab === t ? 'rgba(34,211,238,0.9)' : 'rgba(200,212,224,0.3)' }}
                            >
                                {t === 'short' ? '要旨' : '全文'}
                                {tab === t && (
                                    <span className="absolute bottom-0 left-0 right-6 h-px" style={{ background: 'rgba(34,211,238,0.6)' }} />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Scrollable content */}
                <div className="relative flex-1 overflow-y-auto px-6 md:px-8 py-7">
                    {tab === 'short' ? <SHORT /> : <LONG />}
                </div>

                {/* Footer */}
                <div
                    className="relative flex-shrink-0 flex items-center justify-between flex-wrap gap-3 px-6 py-4"
                    style={{ borderTop: '1px solid rgba(34,211,238,0.08)', background: 'rgba(5,10,18,0.9)' }}
                >
                    <div className="flex items-center gap-4">
                        <a
                            href="https://confyplus.eai.eu/app#manage-paper/id/367209/cid/53753/tid/5314"
                            target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 font-mono text-[11px] tracking-widest uppercase transition-colors"
                            style={{ color: 'rgba(34,211,238,0.5)' }}
                            onMouseOver={e => (e.currentTarget.style.color = 'rgba(34,211,238,0.9)')}
                            onMouseOut={e => (e.currentTarget.style.color = 'rgba(34,211,238,0.5)')}
                        >
                            <ExternalLink size={11} /> Paper
                        </a>
                        <a
                            href="https://mobiquitous.eai-conferences.org/2026/"
                            target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 font-mono text-[11px] tracking-widest uppercase transition-colors"
                            style={{ color: 'rgba(34,211,238,0.35)' }}
                            onMouseOver={e => (e.currentTarget.style.color = 'rgba(34,211,238,0.7)')}
                            onMouseOut={e => (e.currentTarget.style.color = 'rgba(34,211,238,0.35)')}
                        >
                            <ExternalLink size={11} /> Conf.
                        </a>
                    </div>
                    <ShareBar />
                </div>
            </div>
        </div>
    );
};
