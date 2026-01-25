import { useEffect, useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { SEO } from '../components/SEO';
import { MediaLinks } from '../components/MediaLinks';

export const Research = () => {
    const [content, setContent] = useState('');

    useEffect(() => {
        axios.get('/pages/research.md')
            .then(res => setContent(res.data))
            .catch(err => console.error('Failed to load research', err));
    }, []);

    return (
        <>
            <SEO title="Research" description="生理反応と主観的意味づけの可変性" />
            <div className="min-h-screen bg-neutral-900 text-white pt-32 pb-24">
                <div className="container mx-auto px-6 max-w-5xl">
                    <div className="mb-16">
                        <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                            Research
                        </h1>
                        <p className="text-xl md:text-2xl text-neutral-300 font-bold leading-relaxed border-l-8 border-purple-500 pl-6 py-2">
                            Physiological Reaction & Subjective Meaning
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        <div className="lg:col-span-8 space-y-12">
                            <article className="bg-neutral-800/50 backdrop-blur-sm p-8 md:p-12 rounded-3xl border border-neutral-700 shadow-2xl">
                                <div className="prose prose-lg prose-invert max-w-none
                                    prose-headings:font-bold prose-headings:text-purple-300
                                    prose-p:text-lg prose-p:leading-loose prose-p:text-neutral-200
                                    prose-strong:text-white prose-a:text-purple-400">
                                    <ReactMarkdown>{content}</ReactMarkdown>
                                </div>
                            </article>
                        </div>

                        <div className="lg:col-span-4">
                            <div className="bg-neutral-800/80 p-8 rounded-3xl border border-neutral-700 sticky top-32">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-purple-400">
                                    <span className="p-2 bg-purple-900/30 rounded-lg">Featured</span>
                                </h3>
                                <p className="text-neutral-400 mb-6 text-sm">
                                    研究に関する詳細なインタビュー記事はこちら
                                </p>
                                <MediaLinks type="interview" className="grid-cols-1" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
