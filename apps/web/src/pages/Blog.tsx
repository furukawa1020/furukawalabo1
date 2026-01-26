import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import { SEO } from '../components/SEO';
import { Calendar, Link as LinkIcon, Check } from 'lucide-react';

type BlogPost = {
    slug: string;
    title: string;
    date: string;
    summary: string;
    image?: string;
};

// Helper to parse frontmatter without a heavy library
const parseFrontmatter = (content: string) => {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
    const match = content.match(frontmatterRegex);

    if (!match) return { attributes: {}, body: content };

    const frontmatterBlock = match[1];
    const body = content.replace(frontmatterRegex, '').trim();

    const attributes: Record<string, string> = {};
    frontmatterBlock.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length > 0) {
            attributes[key.trim()] = valueParts.join(':').trim();
        }
    });

    return { attributes, body };
};

const XIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

export const Blog = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [meta, setMeta] = useState<{ title: string; image?: string; date?: string }>({ title: '' });
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        // Fetch list from static index
        axios.get('/content/blog/index.json')
            .then(res => setPosts(res.data))
            .catch(err => console.error('Failed to load blog index', err))
            .finally(() => {
                if (!slug) setLoading(false);
            });
    }, [slug]);

    useEffect(() => {
        if (slug) {
            setLoading(true);
            axios.get(`/content/blog/${slug}.md`)
                .then(res => {
                    const { attributes, body } = parseFrontmatter(res.data);

                    // Extract first image from body if not in frontmatter
                    let image = attributes.image;
                    if (!image) {
                        const imageMatch = body.match(/!\[.*?\]\((.*?)\)/);
                        if (imageMatch) image = imageMatch[1];
                    }

                    setMeta({
                        title: attributes.title || slug,
                        date: attributes.date,
                        image: image
                    });
                    setContent(body);
                    window.scrollTo(0, 0);
                })
                .catch(err => {
                    console.error('Failed to load post', err);
                    navigate('/blog'); // Redirect to list on error
                })
                .finally(() => setLoading(false));
        }
    }, [slug, navigate]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareUrl = window.location.href;
    const shareText = meta.title;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}&hashtags=FurukawaLab,古川耕太郎`;

    return (
        <>
            <SEO
                title={slug ? meta.title : "Blog"}
                description={slug ? `${meta.title} - Furukawa Archive OS Blog` : "研究の進捗や、作ったプロトタイプ、日々の気づき。"}
                image={meta.image}
                type={slug ? "article" : "website"}
            />
            <div className="container mx-auto px-6 pt-32 pb-24 max-w-4xl">
                {!slug ? (
                    <>
                        <h1 className="text-4xl font-bold mb-12">Blog</h1>
                        {loading ? <div className="text-center py-12">Loading...</div> : (
                            <div className="grid gap-8">
                                {posts.map(post => (
                                    <Link
                                        key={post.slug}
                                        to={`/blog/${post.slug}`}
                                        className="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-8 rounded-2xl hover:border-cyan-500 dark:hover:border-cyan-500 transition-all block"
                                    >
                                        <div className="flex items-center gap-2 text-sm text-neutral-500 mb-2">
                                            <Calendar size={14} />
                                            <span>{post.date}</span>
                                        </div>
                                        <h2 className="text-2xl font-bold mb-3 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">{post.title}</h2>
                                        <p className="text-neutral-600 dark:text-neutral-400">{post.summary}</p>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div>
                        <Link
                            to="/blog"
                            className="text-sm text-neutral-500 hover:text-cyan-600 mb-8 flex items-center gap-1 inline-block"
                        >
                            ← Back to list
                        </Link>

                        {loading ? <div className="text-center py-12">Loading...</div> : (
                            <article>
                                <header className="mb-12">
                                    <div className="flex items-center gap-2 text-sm text-neutral-500 mb-4">
                                        <Calendar size={14} />
                                        <span>{meta.date}</span>
                                    </div>
                                    <h1 className="text-3xl md:text-5xl font-black mb-8 leading-tight">{meta.title}</h1>

                                    {/* Share Buttons */}
                                    <div className="flex gap-3 mb-8">
                                        <a
                                            href={tweetUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full font-bold text-sm flex items-center gap-2 hover:opacity-80 transition-opacity"
                                        >
                                            <XIcon className="w-4 h-4" />
                                            Share Post
                                        </a>
                                        <button
                                            onClick={handleCopyLink}
                                            className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                                        >
                                            {copied ? <Check size={16} /> : <LinkIcon size={16} />}
                                            {copied ? "Copied!" : "Copy Link"}
                                        </button>
                                    </div>
                                    <hr className="border-neutral-200 dark:border-neutral-800" />
                                </header>

                                <div className="prose prose-neutral dark:prose-invert max-w-none 
                                    prose-headings:font-bold prose-h1:text-4xl prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 
                                    prose-p:leading-relaxed prose-li:marker:text-neutral-400
                                    prose-a:text-cyan-600 dark:prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline
                                    prose-img:rounded-xl prose-img:shadow-lg">
                                    <ReactMarkdown>{content}</ReactMarkdown>
                                </div>

                                <div className="mt-16 pt-8 border-t border-neutral-200 dark:border-neutral-800">
                                    <h3 className="font-bold text-xl mb-6">Share this post</h3>
                                    <div className="flex gap-3">
                                        <a
                                            href={tweetUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform"
                                        >
                                            <XIcon className="w-5 h-5" />
                                            Share on X
                                        </a>
                                    </div>
                                </div>
                            </article>
                        )}
                    </div>
                )}
            </div>
        </>
    );
};
