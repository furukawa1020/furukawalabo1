import { Link } from 'react-router-dom';
import { ArrowRight, Trophy, Code, Star, Activity } from 'lucide-react';
import { SEO } from '../components/SEO';
import { useEffect, useState } from 'react';
import axios from 'axios';
import api from '../api/client';

export const Home = () => {
    return (
        <>
            <SEO />
            {/* Hero Section */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-slate-800/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-gradient-to-r from-neutral-900 to-neutral-500 dark:from-white dark:to-neutral-500 bg-clip-text text-transparent">
                        Re-designing<br />
                        Tech & Society
                    </h1>
                    <p className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                        For a future where everyone can say "I'm glad to be alive."
                        <br />
                        <span className="text-base md:text-lg opacity-80 mt-2 block">
                            HCI Researcher / Prototyper / Community Builder
                        </span>
                    </p>
                    <div className="flex flex-col md:flex-row gap-4 justify-center">
                        <Link to="/research" className="group px-8 py-4 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-full font-bold transition-all hover:scale-105 flex items-center justify-center gap-2">
                            Explore Research
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link to="/works" className="px-8 py-4 bg-transparent border border-neutral-300 dark:border-neutral-700 rounded-full font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all">
                            View Works
                        </Link>
                    </div>
                </div>
            </section>

            {/* Highlights Section */}
            <section className="py-24 bg-neutral-50 dark:bg-neutral-900/50">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold mb-12 text-center text-neutral-900 dark:text-white">Highlights</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <HighlightCard
                            icon={<Star className="text-yellow-500" />}
                            title="Interaction 2026"
                            desc="Premium Interactive Presentation Accepted"
                        />
                        <HighlightCard
                            icon={<Trophy className="text-cyan-500" />}
                            title="Jigieki Expo 2025"
                            desc="Sponsor Award (Yumemi) & Corporate Award"
                        />
                        <HighlightCard
                            icon={<Code className="text-purple-500" />}
                            title="GitHub Activity"
                            desc="225+ Repos / 2600+ Contributions in 1 year"
                        />
                        <HighlightCard
                            icon={<Activity className="text-green-500" />}
                            title="40+ Prototypes"
                            desc="Published on Protopedia with 70+ likes"
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
                            <h2 className="text-2xl font-bold">Latest Works</h2>
                            <Link to="/works" className="text-cyan-600 dark:text-cyan-400 font-bold hover:underline flex items-center gap-1">
                                View All <ArrowRight size={16} />
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
                            <h2 className="text-2xl font-bold">Latest Articles</h2>
                            <Link to="/blog" className="text-cyan-600 dark:text-cyan-400 font-bold hover:underline flex items-center gap-1">
                                Read More <ArrowRight size={16} />
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
