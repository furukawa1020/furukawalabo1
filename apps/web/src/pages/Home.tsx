import { Link } from 'react-router-dom';
import { ArrowRight, Trophy, Code, Star, Activity } from 'lucide-react';
import { SEO } from '../components/SEO';
import { useEffect, useState } from 'react';
import axios from 'axios';
import api from '../api/client';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

export const Home = () => {
    const { t } = useTranslation();

    return (
        <>
            <SEO />
            {/* Hero Section */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                <div className="absolute top-6 right-6 z-50">
                    <LanguageSwitcher />
                </div>
                <h1 className="sr-only">
                    古川耕太郎 (Kotaro Furukawa) - Portfolio.
                    HATAKE / 金沢大学 / 未踏 / 技育博 / 感情コンピューティング / 生理反応 / インタラクション研究
                </h1>
                <div className="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-slate-800/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <h2 className="text-xl md:text-2xl font-bold tracking-[0.3em] text-cyan-400 mb-6 uppercase drop-shadow-md">
                        Furukawa Archive OS v1.0
                    </h2>
                    <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-10 leading-[0.9] 
                        bg-gradient-to-br from-white via-cyan-300 to-purple-400 bg-clip-text text-transparent filter drop-shadow-2xl whitespace-pre-line">
                        {t('hero.title')}
                    </h1>
                    <p className="text-xl md:text-3xl text-neutral-300 dark:text-neutral-300 font-bold mb-12 max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
                        {t('hero.subtitle')}<span className="inline-block text-cyan-600 dark:text-cyan-400 font-black">{t('hero.subtitle_highlight')}</span>
                    </p>
                    <div className="flex flex-col md:flex-row gap-4 justify-center">
                        <Link to="/research" className="group px-8 py-4 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-full font-bold transition-all hover:scale-105 flex items-center justify-center gap-2">
                            {t('hero.explore_research')}
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link to="/works" className="px-8 py-4 bg-transparent border border-neutral-300 dark:border-neutral-700 rounded-full font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all">
                            {t('hero.view_works')}
                        </Link>
                    </div>
                </div>
            </section>

            {/* Highlights Section */}
            <section className="py-24 bg-neutral-50 dark:bg-neutral-900/50">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold mb-12 text-center text-neutral-900 dark:text-white">{t('highlights.title')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <HighlightCard
                            icon={<Star className="text-cyan-500" />}
                            title={t('highlights.interaction.title')}
                            desc={t('highlights.interaction.desc')}
                        />
                        <HighlightCard
                            icon={<Trophy className="text-yellow-500" />}
                            title={t('highlights.gikihaku.title')}
                            desc={t('highlights.gikihaku.desc')}
                        />
                        <HighlightCard
                            icon={<Code className="text-purple-500" />}
                            title={t('highlights.github.title')}
                            desc={t('highlights.github.desc')}
                        />
                        <HighlightCard
                            icon={<Activity className="text-green-500" />}
                            title={t('highlights.prototypes.title')}
                            desc={t('highlights.prototypes.desc')}
                        />
                    </div>
                </div>
            </section>

            {/* Latest Content Section */}
            <LatestContent />
        </>
    );
};

const LatestContent = () => {
    const { t } = useTranslation();
    const [works, setWorks] = useState<any[]>([]);
    const [posts, setPosts] = useState<any[]>([]);

    useEffect(() => {
        // Fetch works
        api.get('/works')
            .then(res => {
                if (res.data.works && res.data.works.length > 0) {
                    setWorks(res.data.works.slice(0, 6));
                } else {
                    throw new Error("Empty works");
                }
            })
            .catch(() => {
                axios.get('/content/works.json')
                    .then(res => setWorks(res.data.slice(0, 6)))
                    .catch(() => { });
            });

        // Fetch blogs from static index
        axios.get('/content/blog/index.json')
            .then(res => setPosts(res.data.slice(0, 3)))
            .catch(() => { });
    }, []);

    if (works.length === 0 && posts.length === 0) return null;

    return (
        <section className="py-24 border-t border-neutral-200 dark:border-neutral-800">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Latest Works */}
                    <div>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold">{t('latest.works')}</h2>
                            <Link to="/works" className="text-cyan-600 dark:text-cyan-400 font-bold hover:underline flex items-center gap-1">
                                {t('latest.view_all')} <ArrowRight size={16} />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {works.map((work) => (
                                <Link to={`/works`} key={work.id} className="group block bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden hover:border-cyan-500 transition-colors">
                                    <div className="aspect-video bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                                        <img src={work.thumbnail_url || work.image} alt={work.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold mb-1 truncate group-hover:text-cyan-600 dark:group-hover:text-cyan-400">{work.title}</h3>
                                        <p className="text-xs text-neutral-500 line-clamp-2">{work.summary}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Latest Blogs */}
                    <div>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold">{t('latest.articles')}</h2>
                            <Link to="/blog" className="text-cyan-600 dark:text-cyan-400 font-bold hover:underline flex items-center gap-1">
                                {t('latest.read_more')} <ArrowRight size={16} />
                            </Link>
                        </div>
                        <div className="space-y-6">
                            {posts.map((post) => (
                                <Link to={`/blog`} key={post.slug} className="group block p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:border-cyan-500 transition-colors">
                                    <div className="flex items-center gap-2 text-xs text-neutral-500 mb-2">
                                        <span>{post.date}</span>
                                    </div>
                                    <h3 className="font-bold text-lg mb-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400">{post.title}</h3>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">{post.summary}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const HighlightCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
    <div className="p-6 bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-700 hover:shadow-md transition-shadow">
        <div className="mb-4 text-neutral-900 dark:text-white p-3 bg-neutral-100 dark:bg-neutral-700/50 rounded-xl w-fit">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-2 text-neutral-900 dark:text-white">{title}</h3>
        <p className="text-neutral-500 dark:text-neutral-400">{desc}</p>
    </div>
);
