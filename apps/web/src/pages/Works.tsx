import { SEO } from '../components/SEO';
import { ExternalLink, Github, Monitor } from 'lucide-react';

import { useEffect, useState } from 'react';
import api from '../api/client';
import { Loader2 } from 'lucide-react';

// Fallback Mock for Demo if API fails or is empty initially
const MOCK_WORKS = [
    {
        id: 1,
        title: "LoopCutMini2",
        category: "Hardware",
        year: "2024",
        tags: ["ESP32", "Motors", "3D Printing"],
        image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
        summary: "Automated tape cutter with precise length control."
    },
    // ... items ...
    {
        id: 4,
        title: "Kanazawa Horse Racing AI",
        category: "AI",
        year: "2026",
        tags: ["Python", "Machine Learning", "RTX5060"],
        image: "https://images.unsplash.com/photo-1520333789090-1afc82db536a?auto=format&fit=crop&q=80&w=800",
        summary: "Predictive model for local horse racing using historical data."
    }
];

export const Works = () => {
    const [works, setWorks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/works')
            .then(res => {
                if (res.data.works && res.data.works.length > 0) {
                    setWorks(res.data.works);
                } else {
                    setWorks(MOCK_WORKS);
                }
            })
            .catch(err => {
                console.error("API Error, using fallback", err);
                setWorks(MOCK_WORKS);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
    return (
        <>
            <SEO title="Works" description="制作物・プロジェクト一覧" />
            <div className="container mx-auto px-6 pt-32 pb-24">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                    <div>
                        <h1 className="text-4xl font-bold mb-4">Works</h1>
                        <p className="text-neutral-500 dark:text-neutral-400">Latest 40+ Prototypes synced from Protopedia</p>
                    </div>
                    {/* Filters Mock */}
                    <div className="flex gap-2 text-sm overflow-x-auto pb-2">
                        {['All', 'HCI', 'AI', 'Hardware', 'Community'].map(filter => (
                            <button key={filter} className="px-4 py-2 rounded-full border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors whitespace-nowrap">
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {works.map(work => (
                        <div key={work.id} className="group flex flex-col bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden hover:shadow-xl dark:hover:shadow-neutral-900/50 hover:-translate-y-1 transition-all duration-300">
                            <div className="relative aspect-video bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                                <img src={work.thumbnail_url || work.image} alt={work.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute top-4 left-4">
                                    <span className="bg-black/70 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold">
                                        {work.category || "Work"}
                                    </span>
                                </div>
                            </div>
                            <div className="p-6 flex flex-col grow">
                                <div className="flex justify-between items-start mb-3">
                                    <h2 className="text-xl font-bold line-clamp-1">{work.title}</h2>
                                    <span className="text-neutral-400 text-sm font-mono">{work.year}</span>
                                </div>
                                <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-6 line-clamp-2 grow">
                                    {work.summary}
                                </p>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {work.tags.map((tag: string) => (
                                        <span key={tag} className="text-xs px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded text-neutral-600 dark:text-neutral-400">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                                <div className="flex gap-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                                    <button className="flex items-center gap-2 text-sm font-bold text-neutral-600 dark:text-neutral-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">
                                        <Monitor size={16} /> Demo
                                    </button>
                                    <button className="flex items-center gap-2 text-sm font-bold text-neutral-600 dark:text-neutral-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">
                                        <Github size={16} /> Code
                                    </button>
                                    <button className="flex items-center gap-2 text-sm font-bold text-neutral-600 dark:text-neutral-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors ml-auto">
                                        <ExternalLink size={16} /> Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};
