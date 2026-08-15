import { useRef, useEffect, useState, useCallback } from 'react';
import { X, ExternalLink } from 'lucide-react';

// ────────────────────────────────────────────────────────────────
// Canvas: Radial pulse background — fugu expanding metaphor
// ────────────────────────────────────────────────────────────────

function usePulseCanvas(ref: React.RefObject<HTMLCanvasElement>) {
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

        // Heartbeat rhythm pattern
        // Slow breath cycle (~0.25 Hz like HRV) + a QRS spike
        const pulseWave = (phase: number): number => {
            const t2 = phase % (Math.PI * 2);
            const breath = Math.sin(t2 * 0.4) * 0.5 + 0.5;
            const spike = Math.exp(-Math.pow((t2 - 2.0) / 0.15, 2)) * 0.6;
            return Math.max(0, breath + spike);
        };

        // Concentric ring bursts
        type Ring = { r: number; maxR: number; alpha: number; born: number };
        const rings: Ring[] = [];
        let lastBurst = 0;

        const draw = () => {
            const w = canvas.offsetWidth;
            const h = canvas.offsetHeight;
            ctx.clearRect(0, 0, w, h);

            const cx = w * 0.5;
            const cy = h * 0.5;

            // Spawn new ring on heartbeat
            const pulse = pulseWave(t * 1.1);
            if (t - lastBurst > 3.2 || (pulse > 0.85 && t - lastBurst > 1.5)) {
                rings.push({ r: 0, maxR: Math.max(w, h) * 0.55, alpha: 0.22, born: t });
                lastBurst = t;
            }

            // Draw rings
            rings.forEach((ring) => {
                const age = t - ring.born;
                const progress = Math.min(age / 4.0, 1);
                ring.r = ring.maxR * progress;
                ring.alpha = 0.18 * (1 - progress) * (1 - progress);

                if (ring.alpha < 0.003) return;

                ctx.beginPath();
                ctx.arc(cx, cy, ring.r, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(168,85,247,${ring.alpha})`;
                ctx.lineWidth = 1.2;
                ctx.stroke();

                // secondary inner ring
                if (ring.r > 30) {
                    ctx.beginPath();
                    ctx.arc(cx, cy, ring.r * 0.6, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(168,85,247,${ring.alpha * 0.5})`;
                    ctx.lineWidth = 0.6;
                    ctx.stroke();
                }
            });

            // Remove dead rings
            for (let i = rings.length - 1; i >= 0; i--) {
                if (rings[i].alpha < 0.003) rings.splice(i, 1);
            }

            // Breathing center glow
            const breathScale = 0.5 + pulse * 0.5;
            const glowR = 30 * breathScale;
            const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
            glow.addColorStop(0, `rgba(168,85,247,${0.12 * breathScale})`);
            glow.addColorStop(1, 'rgba(168,85,247,0)');
            ctx.beginPath();
            ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
            ctx.fillStyle = glow;
            ctx.fill();

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
    const text = `ストレスを「数値で測る」から「体で感じる」へ——フグ型膨張インターフェースによる主観的体験の観察法 / インタラクション2026 プレミアム発表`;
    const copy = () => { navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); };
    return (
        <div className="flex items-center gap-3">
            <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&via=HATAKE55555`}
                target="_blank" rel="noopener noreferrer"
                className="font-mono text-[11px] tracking-widest uppercase transition-colors"
                style={{ color: 'rgba(168,85,247,0.5)' }}
                onMouseOver={e => (e.currentTarget.style.color = 'rgba(168,85,247,0.9)')}
                onMouseOut={e => (e.currentTarget.style.color = 'rgba(168,85,247,0.5)')}
            >
                Share →
            </a>
            <button
                onClick={copy}
                className="font-mono text-[11px] tracking-widest uppercase transition-colors"
                style={{ color: 'rgba(168,85,247,0.5)' }}
                onMouseOver={e => (e.currentTarget.style.color = 'rgba(168,85,247,0.9)')}
                onMouseOut={e => (e.currentTarget.style.color = 'rgba(168,85,247,0.5)')}
            >
                {copied ? 'Copied.' : 'Copy URL'}
            </button>
        </div>
    );
};

// ────────────────────────────────────────────────────────────────
// Content
// ────────────────────────────────────────────────────────────────

const SHORT = () => (
    <article className="space-y-7 leading-[1.9]" style={{ color: '#d0c4e8' }}>
        <p className="text-xl md:text-2xl font-light" style={{ color: '#ede0ff', lineHeight: 1.5 }}>
            フグをふくらませた。
        </p>
        <p>
            心拍変動（HRV）の数値を画面に出すとき、それは観察の道具になるか、
            それとも評価の道具になるか。
        </p>
        <p>
            不安と挑戦は同じ心拍数から生まれる。
            同じ生理反応でも、その瞬間の文脈によって意味はまったく変わる——
            「測定してラベルを貼る」アプローチは、その多様性を消してしまう。
        </p>
        <blockquote className="border-l-2 pl-5 py-1" style={{ borderColor: 'rgba(168,85,247,0.4)' }}>
            <p className="text-base italic font-light" style={{ color: 'rgba(216,180,254,0.85)' }}>
                数値は観察できる。しかし意味は本人だけが知っている。
            </p>
        </blockquote>
        <p>
            Fitbit で取得した RMSSD（心拍変動指標）をリアルタイムで解析し、
            ESP32 経由でエアポンプを制御する。
            フグのぬいぐるみが——膨張し、収縮する。
        </p>
        <p>
            システムは「これはストレスですか？」と問わない。
            ユーザーが触れながら、<strong style={{ color: '#ede0ff' }}>「自分にとってこれは何だろう？」</strong>
            と自問する余白を作ることが目的だった。
        </p>
        <div className="grid grid-cols-2 gap-4 py-2">
            {[
                { label: '発表形態', val: 'プレミアム発表 ☆', sub: 'インタラクション2026' },
                { label: '論文ID', val: '1B33', sub: '情報処理学会' },
            ].map(d => (
                <div key={d.label} className="text-center border rounded-xl p-4" style={{ borderColor: 'rgba(168,85,247,0.15)', background: 'rgba(168,85,247,0.04)' }}>
                    <div className="font-mono text-lg font-bold" style={{ color: '#d8b4fe' }}>{d.val}</div>
                    <div className="text-[10px] font-mono tracking-widest uppercase mt-1" style={{ color: 'rgba(168,85,247,0.5)' }}>{d.label}</div>
                    <div className="text-[11px] mt-0.5" style={{ color: 'rgba(208,196,232,0.6)' }}>{d.sub}</div>
                </div>
            ))}
        </div>
        <p style={{ color: 'rgba(208,196,232,0.7)' }}>
            インタラクティブ発表（プレミアム選出）は全投稿の中から特に優秀な発表として選定される。
            共著: 秋田純一（金沢大学融合学域）
        </p>
    </article>
);

const LONG = () => (
    <article className="space-y-10 leading-[1.9]" style={{ color: '#d0c4e8' }}>
        <section className="space-y-4">
            <h3 className="font-mono text-[10px] tracking-[0.25em] uppercase" style={{ color: 'rgba(168,85,247,0.55)' }}>§ 1 &nbsp; 問題の核心</h3>
            <p className="text-xl font-light" style={{ color: '#ede0ff' }}>
                生体情報の「測定」と「意味づけ」は別の問題だ。
            </p>
            <p>
                スマートウォッチがストレススコアを表示するとき、
                それは生理変化という事実に、解釈というレイヤーを貼り付けている。
                この研究はその解釈のレイヤーをユーザーに返すことを試みた。
            </p>
            <p>
                ストレス研究の多くは精度を競う——どれだけ正確にラベルを当てられるか。
                しかし不安と挑戦を同じ心拍数から区別することは、
                そもそもシステムにできることなのか。
            </p>
        </section>

        <section className="space-y-4">
            <h3 className="font-mono text-[10px] tracking-[0.25em] uppercase" style={{ color: 'rgba(168,85,247,0.55)' }}>§ 2 &nbsp; めんふぐ — フグ型膨張インターフェース</h3>
            <p>
                この研究で実装したのは「めんふぐ」と呼ばれる物理インターフェースだ。
            </p>
            <div className="space-y-2">
                {[
                    'Fitbit / ウェアラブルセンサでHRV（RMSSD）を継続取得',
                    'ローカルで心拍変動の変化量をリアルタイム解析',
                    'ESP32 + エアポンプ + ソレノイドバルブを制御',
                    'フグのぬいぐるみが生理変化に合わせて膨張・収縮',
                ].map((item, i) => (
                    <div key={i} className="flex gap-3 text-sm">
                        <span className="font-mono shrink-0" style={{ color: 'rgba(168,85,247,0.5)' }}>0{i + 1}</span>
                        <span>{item}</span>
                    </div>
                ))}
            </div>
            <p>
                画面の数値に視線を固定するのではなく、手元で触れるもの・視野に入るものとして
                生理状態を身体の外に出す。アンビエントなフィードバックとして
                日常空間に溶け込む形を狙った。
            </p>
        </section>

        <section className="space-y-4">
            <h3 className="font-mono text-[10px] tracking-[0.25em] uppercase" style={{ color: 'rgba(168,85,247,0.55)' }}>§ 3 &nbsp; 意味づけの多様性を観察する</h3>
            <blockquote className="border-l-2 pl-5 py-1" style={{ borderColor: 'rgba(168,85,247,0.3)' }}>
                <p className="italic font-light" style={{ color: 'rgba(216,180,254,0.8)' }}>
                    同じ膨張パターンでも、プレゼン前なら「挑戦への興奮」に見えるかもしれない。<br />
                    締め切り前なら「焦り」に感じるかもしれない。
                </p>
            </blockquote>
            <p>
                この研究の提案は「正解を出す」ことではなく、
                「本人が自分の状態を観察する余白を作ること」だ。
                生理反応と主観的解釈の間にあるズレそのものを観察可能にする、
                新たな枠組みとして提案している。
            </p>
        </section>

        <section className="space-y-4">
            <h3 className="font-mono text-[10px] tracking-[0.25em] uppercase" style={{ color: 'rgba(168,85,247,0.55)' }}>§ 4 &nbsp; 三つの視点の転換</h3>
            <div className="space-y-4">
                {[
                    {
                        from: '「ストレスを診断する」',
                        to: '「自己観察のきっかけを作る」',
                        body: 'AIやシステムが答えを出すのではなく、ユーザーが「ふくらんでいる、今少し緊張しているのかな？」と自問する余白を残す。',
                    },
                    {
                        from: '「視覚的数値ディスプレイ」',
                        to: '「触覚・形状のアンビエントフィードバック」',
                        body: '画面通知に依存せず、ゆるやかな形状変化が日常生活に溶け込む。',
                    },
                    {
                        from: '「他者との比較」',
                        to: '「自分の普段との比較」',
                        body: 'ノルマや基準値ではなく、自分自身の通常状態からのずれを基準にする。',
                    },
                ].map((item, i) => (
                    <div key={i} className="border rounded-xl p-4 space-y-2" style={{ borderColor: 'rgba(168,85,247,0.12)', background: 'rgba(168,85,247,0.03)' }}>
                        <div className="flex items-center gap-3 text-xs font-mono" style={{ color: 'rgba(168,85,247,0.6)' }}>
                            <span style={{ textDecoration: 'line-through', opacity: 0.5 }}>{item.from}</span>
                            <span style={{ opacity: 0.4 }}>→</span>
                            <span style={{ color: '#d8b4fe' }}>{item.to}</span>
                        </div>
                        <p className="text-sm" style={{ color: 'rgba(208,196,232,0.8)' }}>{item.body}</p>
                    </div>
                ))}
            </div>
        </section>

        <section className="space-y-3">
            <h3 className="font-mono text-[10px] tracking-[0.25em] uppercase" style={{ color: 'rgba(168,85,247,0.55)' }}>§ 5 &nbsp; 発表情報</h3>
            <div className="font-mono text-sm space-y-1" style={{ color: 'rgba(208,196,232,0.7)' }}>
                <div>論文タイトル：<span style={{ color: '#d8b4fe' }}>ストレスを"測る"から"感じる"へ：膨張型インターフェースによる主観的体験の観察法</span></div>
                <div>著者：古川耕太郎, 秋田純一（金沢大学融合学域）</div>
                <div>会議：第30回 情報処理学会シンポジウム インタラクション2026</div>
                <div>発表区分：インタラクティブ発表 ☆ プレミアム発表選出</div>
                <div>論文ID：1B33</div>
            </div>
        </section>
    </article>
);

// ────────────────────────────────────────────────────────────────
// Modal
// ────────────────────────────────────────────────────────────────

export const Interaction2026Modal = ({ onClose }: { onClose: () => void }) => {
    const [tab, setTab] = useState<'short' | 'long'>('short');
    const canvasRef = useRef<HTMLCanvasElement>(null);
    usePulseCanvas(canvasRef);

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
                style={{ background: '#080512', border: '1px solid rgba(168,85,247,0.14)', boxShadow: '0 0 60px rgba(168,85,247,0.07), 0 40px 80px rgba(0,0,0,0.85)' }}
            >
                {/* Canvas background */}
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

                {/* Header */}
                <div className="relative flex-shrink-0 px-6 pt-6 pb-5" style={{ borderBottom: '1px solid rgba(168,85,247,0.1)' }}>
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                            <div className="font-mono text-[10px] tracking-[0.25em] uppercase" style={{ color: 'rgba(168,85,247,0.55)' }}>
                                情報処理学会 インタラクション2026 &nbsp;/&nbsp; ☆ プレミアム発表 &nbsp;/&nbsp; 1B33
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold leading-tight" style={{ color: '#f0eaff', letterSpacing: '-0.02em' }}>
                                ストレスを<wbr />"測る"から<wbr />"感じる"へ
                            </h2>
                            <div className="text-xs md:text-sm font-light" style={{ color: 'rgba(208,196,232,0.5)' }}>
                                膨張型インターフェースによる主観的体験の観察法
                            </div>
                            <div className="font-mono text-[11px]" style={{ color: 'rgba(208,196,232,0.35)' }}>
                                古川耕太郎, 秋田純一（金沢大学融合学域）
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-colors"
                            style={{ color: 'rgba(208,196,232,0.35)' }}
                            aria-label="閉じる"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Tab bar */}
                    <div className="flex gap-0 mt-5" style={{ borderBottom: '1px solid rgba(168,85,247,0.08)' }}>
                        {(['short', 'long'] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                className="relative pb-3 pr-6 font-mono text-[11px] tracking-[0.15em] uppercase transition-colors"
                                style={{ color: tab === t ? 'rgba(168,85,247,0.9)' : 'rgba(208,196,232,0.3)' }}
                            >
                                {t === 'short' ? '要旨' : '全文'}
                                {tab === t && (
                                    <span className="absolute bottom-0 left-0 right-6 h-px" style={{ background: 'rgba(168,85,247,0.6)' }} />
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
                    style={{ borderTop: '1px solid rgba(168,85,247,0.08)', background: 'rgba(8,5,18,0.9)' }}
                >
                    <a
                        href="https://www.interaction-ipsj.org/2026/"
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 font-mono text-[11px] tracking-widest uppercase transition-colors"
                        style={{ color: 'rgba(168,85,247,0.5)' }}
                        onMouseOver={e => (e.currentTarget.style.color = 'rgba(168,85,247,0.9)')}
                        onMouseOut={e => (e.currentTarget.style.color = 'rgba(168,85,247,0.5)')}
                    >
                        <ExternalLink size={11} /> 学会公式サイト
                    </a>
                    <ShareBar />
                </div>
            </div>
        </div>
    );
};
