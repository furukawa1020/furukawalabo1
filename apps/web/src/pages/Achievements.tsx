import { useEffect, useState } from 'react';
import axios from 'axios';
import { SEO } from '../components/SEO';
import { Award, Briefcase, Users, FileText, Star, Mic } from 'lucide-react';

type AchievementItem = {
    year: string | number;
    title: string;
    detail: string;
    detail_secondary?: string;
    date?: string;
    image?: string;
};

type AchievementSection = {
    name: string;
    items: AchievementItem[];
    gallery?: string[];
};

type AchievementsData = {
    sections: AchievementSection[];
};

export const Achievements = () => {
    const [data, setData] = useState<AchievementsData | null>(null);

    useEffect(() => {
        // Fetch JSON directly
        axios.get(`/achievements.json?v=${new Date().getTime()}`)
            .then(res => {
                setData(res.data);
            })
            .catch(err => console.error('Failed to load achievements', err));
    }, []);

    const getIcon = (name: string) => {
        if (name.includes('受賞')) return <Award className="text-yellow-500" />;
        if (name.includes('起業') || name.includes('実務')) return <Briefcase className="text-blue-500" />;
        if (name.includes('コミュニティ')) return <Users className="text-green-500" />;
        if (name.includes('発表') || name.includes('採択')) return <Mic className="text-purple-500" />;
        if (name.includes('公開')) return <Star className="text-cyan-500" />;
        return <FileText className="text-neutral-500" />;
    };

    if (!data) return <div className="min-h-screen pt-24 flex justify-center text-neutral-500">Loading...</div>;

    return (
        <>
            <SEO title="Achievements" description="受賞歴・活動実績・登壇情報" />
            <div className="container mx-auto px-6 pt-32 pb-24">
                <h1 className="text-4xl font-bold mb-16 text-center tracking-tight">Achievements</h1>

                <div className="max-w-4xl mx-auto space-y-16">
                    {data.sections.map((section, idx) => (
                        <div key={idx} className="relative pl-8 md:pl-0">
                            {/* Mobile timeline line */}
                            <div className="absolute left-2 top-0 bottom-0 w-px bg-neutral-200 dark:bg-neutral-800 md:hidden" />

                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700">
                                    {getIcon(section.name)}
                                </div>
                                <h2 className="text-2xl font-bold">{section.name}</h2>
                            </div>

                            <div className="space-y-6">
                                {section.gallery && (
                                    <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {section.gallery.map((imgSrc, idx) => (
                                            <div key={idx} className="relative group cursor-pointer rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 shadow-sm">
                                                <img
                                                    src={imgSrc}
                                                    alt={`Award ${idx + 1}`}
                                                    className="w-full aspect-[4/3] object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {section.items.map((item, i) => (
                                    <div key={i} className="group relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl hover:border-neutral-300 dark:hover:border-neutral-700 transition-all hover:shadow-lg dark:hover:shadow-neutral-900/50">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-2">
                                            <h3 className="font-bold text-lg leading-snug group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                                                {item.title}
                                            </h3>
                                            <span className="shrink-0 text-sm font-mono text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-full">
                                                {item.year}
                                            </span>
                                        </div>
                                        <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">
                                            {item.detail}
                                        </p>
                                        {item.detail_secondary && (
                                            <p className="text-neutral-500 dark:text-neutral-500 text-xs mt-2 italic">
                                                {item.detail_secondary}
                                            </p>
                                        )}
                                        {item.image && (
                                            <div className="mt-4 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700">
                                                <img
                                                    src={item.image}
                                                    alt={item.title}
                                                    className="w-full h-auto max-h-64 object-cover hover:scale-105 transition-transform duration-500"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};
