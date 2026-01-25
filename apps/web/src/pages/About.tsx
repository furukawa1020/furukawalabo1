import { useEffect, useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { SEO } from '../components/SEO';
import { SocialLinks } from '../components/SocialLinks';
import { MediaLinks } from '../components/MediaLinks';

export const About = () => {
    // Currently re-using Home or just redirecting essentially, 
    // but typically About is a separate page. 
    // Since user content has "about.md", let's render it here.
    const [content, setContent] = useState('');

    useEffect(() => {
        axios.get('/content/pages/about.md')
            .then(res => {
                const raw = res.data;
                const body = raw.replace(/^---[\s\S]*?---/, '');
                setContent(body);
            })
            .catch(err => console.error('Failed to load about', err));
    }, []);

    return (
        <>
            <SEO title="About" description="Vision & Profile" />
            <div className="container mx-auto px-6 pt-32 pb-24 max-w-4xl">
                <article className="prose prose-neutral dark:prose-invert max-w-none 
                    prose-headings:font-bold prose-h1:text-4xl prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 
                    prose-p:leading-relaxed prose-li:marker:text-neutral-400
                    prose-a:text-cyan-600 dark:prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline">
                    <ReactMarkdown rehypePlugins={[rehypeRaw]}>{content}</ReactMarkdown>
                </article>

                <div className="mt-12 flex justify-center md:justify-start">
                    <SocialLinks />
                </div>

                <div className="mt-24 border-t border-neutral-800 pt-12">
                    <h2 className="text-2xl font-bold mb-8 text-neutral-200">Media Coverage & Third-party Validation</h2>
                    <MediaLinks />
                </div>
            </div>
        </>
    );
};
