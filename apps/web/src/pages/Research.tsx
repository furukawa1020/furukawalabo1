import { useEffect, useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { SEO } from '../components/SEO';

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
            <div className="container mx-auto px-6 pt-32 pb-24 max-w-4xl">
                <article className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-4xl prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-p:leading-relaxed prose-li:marker:text-neutral-400">
                    <ReactMarkdown>{content}</ReactMarkdown>
                </article>
            </div>
        </>
    );
};
