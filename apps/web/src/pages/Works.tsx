import { SEO } from '../components/SEO';
import { ExternalLink, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../api/client';
import axios from 'axios';

export const Works = () => {
    const [works, setWorks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFallback, setShowFallback] = useState(false);

    useEffect(() => {
        let isMounted = true;

        // 1. Data Fetching
        const load = new Promise<void>((resolve, reject) => {
            Promise.all([
                api.get('/works'), // logical API doesn't cache usually
                axios.get(`/content/works.json?v=${new Date().getTime()}`).catch(() => ({ data: [] }))
            ])
                .then(([apiRes, localRes]) => {
                    if (isMounted) {
                        const apiWorks = apiRes.data.works || [];
                        const localWorks = localRes.data || [];
                        // Merge local works (RoboCup, etc) with API works
                        setWorks([...localWorks, ...apiWorks]);
                        resolve();
                    }
                })
                .catch(reject);
        });

        // 2. Timeout (3 seconds)
        const timeout = new Promise<void>((_, reject) => {
            setTimeout(() => {
                reject(new Error('Timeout'));
            }, 5000);
        });

        // Race them
        Promise.race([load, timeout])
            .then(() => {
                if (isMounted) setLoading(false);
            })
            .catch(() => {
                if (isMounted) {
                    setLoading(false);
                    setShowFallback(true);
                }
            });

        return () => { isMounted = false; };
    }, []);

    // Fallback Slideshow Component
    if (showFallback) {
        return <FallbackSlideshow />;
    }

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
                    </div>

                    {works.length === 0 ? (
                        <div className="bg-neutral-800/50 p-12 rounded-3xl border border-neutral-700 text-center">
                            <p className="text-2xl font-bold text-neutral-400 mb-4">No works found.</p>
                            <button onClick={() => window.location.reload()} className="text-pink-400 hover:text-pink-300 underline">Refresh</button>
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

const FallbackSlideshow = () => {
    const images = [
        '/images/works-fallback-1.png',
        '/images/works-fallback-2.png'
    ];
    const [idx, setIdx] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIdx(c => (c + 1) % images.length);
        }, 5000); // Switch every 5 seconds
        return () => clearInterval(timer);
    }, []);

    return (
        <a
            href="https://protopedia.net/prototyper/hatake"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden cursor-pointer"
        >
            {/* Blurred Background for Ambiance */}
            {images.map((src, i) => (
                <div
                    key={`bg-${src}`}
                    className={`absolute inset-0 transition-opacity duration-1000 ${i === idx ? 'opacity-30' : 'opacity-0'}`}
                >
                    <img
                        src={src}
                        className="w-full h-full object-cover blur-3xl scale-110"
                        alt="Background"
                    />
                </div>
            ))}

            {/* Main Image Container */}
            <div className="relative w-full max-w-2xl h-full overflow-hidden shadow-2xl border-x border-white/10 bg-black/50 backdrop-blur-sm">
                {images.map((src, i) => (
                    <div
                        key={src}
                        className={`absolute inset-0 transition-opacity duration-1000 ${i === idx ? 'opacity-100' : 'opacity-0'}`}
                    >
                        <img
                            src={src}
                            alt="Protopedia Works"
                            className={`
                                w-full absolute top-0 left-0 object-cover
                                ${i === idx ? 'animate-[scroll-vertical_20s_linear_infinite]' : ''}
                            `}
                            style={{ imageRendering: '-webkit-optimize-contrast' }} // Hint for browser
                        />
                        {/* Gradient tint for text readability */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />
                    </div>
                ))}
            </div>

            <div className="absolute bottom-12 left-0 right-0 text-center z-10 p-4 drop-shadow-xl">
                <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500 tracking-tighter mb-4">
                    View on Protopedia
                </h2>
                <p className="text-white font-bold text-lg animate-bounce">
                    Click to explore 40+ works
                </p>
            </div>
        </a>
    );
};
