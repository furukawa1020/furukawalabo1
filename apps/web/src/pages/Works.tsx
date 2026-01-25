import { SEO } from '../components/SEO';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../api/client';
import { Loader2 } from 'lucide-react';

export const Works = () => {
    const [works, setWorks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchWorks = () => {
        setLoading(true);
        setError(false);
        api.get('/works')
            .then(res => {
                if (res.data.works) {
                    setWorks(res.data.works);
                }
            })
            .catch(() => {
                setError(true);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchWorks();
    }, []);

    if (loading) return <div className="min-h-screen bg-neutral-900 flex items-center justify-center"><Loader2 className="animate-spin text-cyan-400 w-12 h-12" /></div>;

    return (
        <>
            <SEO title="Works" description="制作物・プロジェクト一覧" />
            <div className="min-h-screen bg-neutral-900 text-white pt-32 pb-24">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="mb-16 flex flex-col md:flex-row justify-between items-end gap-6">
                        <div>
                            <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-amber-400">
                                Works
                            </h1>
                            <p className="text-xl md:text-2xl text-neutral-300 font-bold leading-relaxed border-l-8 border-pink-500 pl-6 py-2">
                                40+ Prototypes from Protopedia
                            </p>
                        </div>
                        {error && (
                            <button
                                onClick={fetchWorks}
                                className="flex items-center gap-2 px-6 py-3 bg-neutral-800 text-pink-400 rounded-full font-bold hover:bg-neutral-700 transition-colors"
                            >
                                <RefreshCw size={20} /> Retry Sync
                            </button>
                        )}
                    </div>

                    {works.length === 0 && !loading ? (
                        <div className="bg-neutral-800/50 p-12 rounded-3xl border border-neutral-700 text-center">
                            <p className="text-2xl font-bold text-neutral-400 mb-4">No works found.</p>
                            <p className="text-neutral-500">Syncing data from Protopedia...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {works.map((work) => (
                                <article key={work.id} className="group flex flex-col bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 rounded-3xl overflow-hidden hover:shadow-2xl hover:border-pink-500/50 hover:-translate-y-2 transition-all duration-300">
                                    <div className="relative aspect-video bg-neutral-900 overflow-hidden">
                                        {work.thumbnail_url ? (
                                            <img
                                                src={work.thumbnail_url}
                                                alt={work.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-neutral-800 text-neutral-600 font-bold">
                                                NO IMAGE
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4">
                                            <span className="bg-neutral-900/80 backdrop-blur text-pink-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border border-pink-500/30">
                                                {work.category || "Protopedia"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-8 flex flex-col grow">
                                        <div className="mb-4">
                                            <h2 className="text-2xl font-bold leading-tight mb-2 group-hover:text-pink-400 transition-colors">
                                                {work.title}
                                            </h2>
                                            <span className="text-neutral-500 text-sm font-mono block">
                                                {work.published_at ? new Date(work.published_at).getFullYear() : '2025'}
                                            </span>
                                        </div>

                                        <p className="text-neutral-300 text-base leading-relaxed mb-8 grow line-clamp-3">
                                            {work.summary}
                                        </p>

                                        {work.tags && (
                                            <div className="flex flex-wrap gap-2 mb-8">
                                                {work.tags.map((tag: string) => (
                                                    <span key={tag} className="text-xs font-bold px-3 py-1 bg-neutral-900 rounded-full text-neutral-400 border border-neutral-700">
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="mt-auto grid grid-cols-2 gap-4">
                                            {work.url && (
                                                <a
                                                    href={work.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-pink-600 text-white font-bold rounded-xl hover:bg-pink-500 transition-colors col-span-2"
                                                >
                                                    <ExternalLink size={18} /> View on Protopedia
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
