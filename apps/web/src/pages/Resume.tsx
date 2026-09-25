import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { SEO } from '../components/SEO';
import { ExternalLink, Download, Mail, Github, Globe } from 'lucide-react';

type AchievementItem = {
    year: string | number;
    title: string;
    detail: string;
    detail_secondary?: string;
    url?: string;
    url_paper?: string;
};

type AchievementSection = {
    name: string;
    items: AchievementItem[];
    gallery?: string[];
};

type AchievementsData = {
    sections: AchievementSection[];
};

const SECTION_ORDER = [
    '受託開発・業務委託',
    '学会・採択',
    '受賞（大学以降）',
    '起業・チーム活動',
    '企業実務経験',
    'コミュニティ・運営',
    '学外発表',
    '公開・アウトプット量',
    'その他・資格／実績',
    '大会実績（大学入学前）',
];

export const Resume = () => {
    const [data, setData] = useState<AchievementsData | null>(null);
    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        axios.get(`/achievements.json?v=${Date.now()}`)
            .then(res => setData(res.data))
            .catch(err => console.error(err));
    }, []);

    const handlePrint = () => {
        window.print();
    };

    const sorted = data
        ? SECTION_ORDER
            .map(name => data.sections.find(s => s.name === name))
            .filter(Boolean) as AchievementSection[]
        : [];

    return (
        <>
            <SEO
                title="職務経歴書・実績一覧 | 古川耕太郎 — 製造業DX・プロトタイプ受託開発・AI・ハードウェア"
                description="古川耕太郎（Kotaro Furukawa）の職務経歴書・実績一覧。製造業DXでのソフトウェア開発実務、ハードウェアおよびソフトウェア両面でのプロトタイプ受託開発・業務委託・Web・IoT・AI実装。仕事・採用のご相談はContactより受諾受付中。"
            />

            {/* Print button — hidden in print */}
            <div className="no-print fixed top-20 right-6 z-50 flex gap-2">
                <a
                    href="/achievements"
                    className="px-4 py-2 text-sm bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                >
                    ← 通常ページ
                </a>
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-neutral-800 transition-colors"
                >
                    <Download size={14} />
                    PDF / 印刷
                </button>
            </div>

            {/* Resume body */}
            <div
                ref={printRef}
                className="resume-page bg-white text-black min-h-screen pt-24 pb-16 print:pt-8"
                style={{ fontFamily: '"Noto Sans JP", "Hiragino Kaku Gothic ProN", sans-serif' }}
            >
                <div className="max-w-3xl mx-auto px-8">

                    {/* Header */}
                    <div className="border-b-2 border-black pb-6 mb-8">
                        <h1 className="text-3xl font-bold tracking-tight mb-1">古川 耕太郎</h1>
                        <p className="text-lg text-neutral-600 mb-4">Kotaro Furukawa — エンジニア / 研究者 / プロトタイパー</p>
                        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-neutral-700">
                            <a href="mailto:f.kotaro.0530@gmail.com" className="flex items-center gap-1.5 hover:text-black">
                                <Mail size={13} /> f.kotaro.0530@gmail.com
                            </a>
                            <a href="https://furukawalab.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-black">
                                <Globe size={13} /> furukawalab.com
                            </a>
                            <a href="https://github.com/furukawa1020" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-black">
                                <Github size={13} /> furukawa1020
                            </a>
                            <a href="https://furukawalab.com/contact" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-blue-700 hover:text-blue-900 font-medium">
                                <ExternalLink size={13} /> 仕事・採用のご相談はContactより受け付けています
                            </a>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="mb-10 p-5 bg-neutral-50 border border-neutral-200 rounded-lg">
                        <h2 className="text-base font-bold mb-3 uppercase tracking-widest text-neutral-500">Summary</h2>
                        <p className="text-sm leading-relaxed text-neutral-800">
                            金沢大学在学のエンジニア・研究者・プロトタイパー。
                            大同工業等における製造業DXでのソフトウェア開発実務・ハードウェア実務、TPS改善・品質工学の経験を保有。
                            ハードウェア（M5Stack・Arduino・センサー・機械駆動部）およびソフトウェア（React・Next.js・FastAPI・Rails・AI連携）の両面におけるプロトタイプ受託開発を業務委託として多数受諾・納品。
                            EAI MobiQuitous 2026 Regular Paper 採択（単著）、OpenAI Codex Student Builder Fest 2026 優勝など研究・開発実績多数。受託開発・業務委託・案件相談を随時受け付けています。
                        </p>
                    </div>

                    {/* Skills */}
                    <div className="mb-10">
                        <h2 className="text-base font-bold mb-4 pb-1 border-b border-neutral-300 uppercase tracking-widest text-neutral-500">Skills</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                            {[
                                { cat: 'Frontend', tags: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Next.js'] },
                                { cat: 'Backend', tags: ['Ruby on Rails', 'FastAPI', 'Python', 'PostgreSQL'] },
                                { cat: 'AI / ML', tags: ['Gemini API', 'OpenAI Codex', '生体信号解析', 'scikit-learn'] },
                                { cat: 'Hardware / IoT', tags: ['M5Stack', 'Arduino', 'センサー', '駆動系設計', 'ロボカップ'] },
                                { cat: 'Infra / DevOps', tags: ['Railway', 'Netlify', 'Docker', 'GitHub Actions'] },
                                { cat: 'Research', tags: ['EAI MobiQuitous', 'プライバシー設計', 'HCI', 'Interaction2026'] },
                            ].map(({ cat, tags }) => (
                                <div key={cat}>
                                    <p className="font-semibold text-neutral-600 mb-1.5 text-xs uppercase tracking-wider">{cat}</p>
                                    <div className="flex flex-wrap gap-1">
                                        {tags.map(t => (
                                            <span key={t} className="px-2 py-0.5 text-xs bg-neutral-100 border border-neutral-200 rounded text-neutral-700">{t}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sections */}
                    {sorted.map((section) => (
                        <div key={section.name} className="mb-10">
                            <h2 className="text-base font-bold mb-4 pb-1 border-b border-neutral-300 uppercase tracking-widest text-neutral-500">
                                {section.name}
                            </h2>
                            <div className="space-y-4">
                                {section.items.map((item, i) => (
                                    <div key={i} className="flex gap-4">
                                        <span className="shrink-0 font-mono text-xs text-neutral-400 mt-1 w-20 text-right">{item.year}</span>
                                        <div className="flex-1 border-l border-neutral-200 pl-4">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="font-semibold text-sm text-black leading-snug">{item.title}</p>
                                                {item.url && (
                                                    <a
                                                        href={item.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="shrink-0 text-blue-600 hover:text-blue-800 print:text-neutral-500"
                                                    >
                                                        <ExternalLink size={12} />
                                                    </a>
                                                )}
                                            </div>
                                            <p className="text-xs text-neutral-600 mt-1 leading-relaxed">{item.detail}</p>
                                            {item.detail_secondary && (
                                                <p className="text-xs text-neutral-400 mt-1 italic leading-relaxed">{item.detail_secondary}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Contact CTA */}
                    <div className="mt-12 p-6 border-2 border-black rounded-lg text-center no-print">
                        <p className="font-bold text-lg mb-2">お仕事・採用のご相談はこちら</p>
                        <p className="text-sm text-neutral-600 mb-4">受託開発・プロトタイプ開発・共同研究・インターン等、お気軽にお問い合わせください。</p>
                        <a
                            href="/contact"
                            className="inline-block px-8 py-3 bg-black text-white font-bold rounded-lg hover:bg-neutral-800 transition-colors"
                        >
                            Contact →
                        </a>
                    </div>

                    {/* Print footer */}
                    <div className="hidden print:block mt-8 pt-4 border-t border-neutral-300 text-xs text-neutral-400 text-center">
                        furukawalab.com / f.kotaro.0530@gmail.com — {new Date().getFullYear()}
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    header, footer { display: none !important; }
                    .resume-page { padding-top: 0 !important; }
                    body { background: white !important; }
                }
            `}</style>
        </>
    );
};
