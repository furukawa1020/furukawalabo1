import { useEffect, useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
// @ts-ignore
import rehypeRaw from 'rehype-raw';
import { SEO } from '../components/SEO';
import { SocialLinks } from '../components/SocialLinks';
import { MediaLinks } from '../components/MediaLinks';

export const About = () => {
    const [content, setContent] = useState('');

    useEffect(() => {
        axios.get('/content/pages/about.md')
            .then(res => {
                const raw = res.data;
                // Remove frontmatter
                const body = raw.replace(/^---[\s\S]*?---/, '');
                setContent(body);
            })
            .catch(err => console.error('Failed to load about', err));
    }, []);

    return (
        <>
            <SEO title="About" description="Vision & Profile" />
            <div className="min-h-screen bg-neutral-900 text-white pt-32 pb-24">
                <div className="container mx-auto px-6 max-w-5xl">
                    {/* Header Section */}
                    <div className="mb-16">
                        <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                            About / Profile
                        </h1>
                        <p className="text-xl md:text-2xl text-neutral-300 font-bold leading-relaxed border-l-8 border-cyan-500 pl-6 py-2">
                            Vision & Identity
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Main Content - Card Style */}
                        <div className="lg:col-span-8 space-y-12">
                            <article className="bg-neutral-800/50 backdrop-blur-sm p-8 md:p-12 rounded-3xl border border-neutral-700 shadow-2xl">
                                <div className="prose prose-lg prose-invert max-w-none 
                                    prose-headings:font-bold prose-headings:text-cyan-300 mr-2
                                    prose-p:text-lg prose-p:leading-loose prose-p:text-neutral-200
                                    prose-li:text-lg prose-li:text-neutral-200
                                    prose-strong:text-white prose-strong:bg-neutral-700/50 prose-strong:px-1 prose-strong:rounded
                                    prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline hover:prose-a:text-cyan-300">
                                    <ReactMarkdown rehypePlugins={[rehypeRaw]}>{content}</ReactMarkdown>
                                </div>
                            </article>

                            {/* Skills / Keywords Section could go here */}
                        </div>

                        {/* Sidebar - Quick Access */}
                        <div className="lg:col-span-4 space-y-8">
                            <div className="bg-neutral-800/80 p-8 rounded-3xl border border-neutral-700 sticky top-32">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-cyan-400">
                                    <span className="p-2 bg-cyan-900/30 rounded-lg">Connect</span>
                                </h3>
                                <div className="flex justify-center">
                                    <SocialLinks variant="default" />
                                </div>

                                <div className="mt-8 pt-8 border-t border-neutral-700">
                                    <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-purple-400">
                                        <span className="p-2 bg-purple-900/30 rounded-lg">Media</span>
                                    </h3>
                                    <MediaLinks className="grid-cols-1" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
