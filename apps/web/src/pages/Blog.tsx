import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import { SEO } from '../components/SEO';
import { Calendar } from 'lucide-react';

type BlogPost = {
    slug: string;
    title: string;
    date: string;
    summary: string;
};

// Mocking the list since we don't have a backend to list directory contents yet.
// In v1.0, this would be generated or fetched from an index.json
export const Blog = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [selectedPost, setSelectedPost] = useState<string | null>(null);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch list from static index
        axios.get('/content/blog/index.json')
            .then(res => setPosts(res.data))
            .catch(err => console.error('Failed to load blog index', err))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (selectedPost) {
            setLoading(true);
            axios.get(`/content/blog/${selectedPost}.md`)
                .then(res => {
                    // Extract body from markdown (removing frontmatter if present)
                    const raw = res.data;
                    const body = raw.replace(/^---[\s\S]*?---/, '');
                    setContent(body);
                })
                .catch(err => console.error('Failed to load post', err))
                .finally(() => setLoading(false));
        }
    }, [selectedPost]);

    return (
        <>
            <SEO title="Blog" description="研究の進捗や、作ったプロトタイプ、日々の気づき。" />
            <div className="container mx-auto px-6 pt-32 pb-24 max-w-4xl">
                {!selectedPost ? (
                    <>
                        <h1 className="text-4xl font-bold mb-12">Blog</h1>
                        {loading ? <div className="text-center py-12">Loading...</div> : (
                            <div className="grid gap-8">
                                {posts.map(post => (
                                    <div
                                        key={post.slug}
                                        onClick={() => setSelectedPost(post.slug)}
                                        className="cursor-pointer group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-8 rounded-2xl hover:border-cyan-500 dark:hover:border-cyan-500 transition-all"
                                    >
                                        <div className="flex items-center gap-2 text-sm text-neutral-500 mb-2">
                                            <Calendar size={14} />
                                            <span>{post.date}</span>
                                        </div>
                                        <h2 className="text-2xl font-bold mb-3 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">{post.title}</h2>
                                        <p className="text-neutral-600 dark:text-neutral-400">{post.summary}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div>
                        <button
                            onClick={() => setSelectedPost(null)}
                            className="text-sm text-neutral-500 hover:text-cyan-600 mb-8 flex items-center gap-1"
                        >
                            ← Back to list
                        </button>
                        <article className="prose prose-neutral dark:prose-invert max-w-none 
                            prose-headings:font-bold prose-h1:text-4xl prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 
                            prose-p:leading-relaxed prose-li:marker:text-neutral-400
                            prose-a:text-cyan-600 dark:prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline">
                            <ReactMarkdown>{content}</ReactMarkdown>
                        </article>
                    </div>
                )}
            </div>
        </>
    );
};
