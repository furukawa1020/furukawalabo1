import { useState, useEffect } from 'react';
import api from '../api/client';
import { SEO } from '../components/SEO';
import { Save, Loader2, Check, Plus, Trash2, Edit } from 'lucide-react';

const FILES = [
    { id: 'achievements', name: 'Achievements (YAML)' },
    { id: 'about', name: 'About (Markdown)' },
    { id: 'research', name: 'Research (Markdown)' },
    { id: 'blogs', name: 'Blogs (Markdown)' },
    { id: 'images', name: 'Images (Upload)' }
];

type BlogPost = {
    slug: string;
    title: string;
    date: string;
    summary: string;
    body?: string;
};

export const Admin = () => {
    const [selectedFile, setSelectedFile] = useState(FILES[0].id);
    const [content, setContent] = useState('');
    const [images, setImages] = useState<{ name: string, url: string }[]>([]);

    // Blog State
    const [blogs, setBlogs] = useState<BlogPost[]>([]);
    const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
    const [isEditingBlog, setIsEditingBlog] = useState(false);
    const [blogForm, setBlogForm] = useState<BlogPost>({ slug: '', title: '', date: '', summary: '', body: '' });

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const [questions, setQuestions] = useState<any[]>([]);
    const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
    const [answer, setAnswer] = useState('');

    useEffect(() => {
        if (!isAuthenticated) return;

        if (selectedFile === 'images') {
            refreshImages();
        } else if (selectedFile === 'blogs') {
            refreshBlogs();
        } else if (selectedFile === 'inbox') {
            refreshQuestions();
        } else {
            setLoading(true);
            api.get(`/admin/contents/${selectedFile}`)
                .then(res => setContent(res.data.content))
                .catch(err => {
                    console.error(err);
                    if (err.response?.status === 401) {
                        alert('Authentication failed');
                        logout();
                    }
                })
                .finally(() => setLoading(false));
        }
    }, [selectedFile, isAuthenticated]); // Re-run when auth changes

    if (!isAuthenticated) {
        return (
            <>
                <SEO title="Admin Login" />
                <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-6">
                    <form onSubmit={handleLogin} className="bg-neutral-800 p-8 rounded-2xl border border-neutral-700 w-full max-w-sm shadow-2xl">
                        <h1 className="text-2xl font-bold text-white mb-6 text-center">Admin Access</h1>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-neutral-400 mb-1">Username</label>
                                <input
                                    type="text"
                                    value={credentials.username}
                                    onChange={e => setCredentials({ ...credentials, username: e.target.value })}
                                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-white focus:border-cyan-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-neutral-400 mb-1">Password</label>
                                <input
                                    type="password"
                                    value={credentials.password}
                                    onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-white focus:border-cyan-500 outline-none"
                                />
                            </div>
                            <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition-colors">
                                Login
                            </button>
                        </div>
                    </form>
                </div>
            </>
        );
    }

    const refreshImages = () => {
        setLoading(true);
        api.get('/admin/images')
            .then(res => setImages(res.data.images))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    const refreshBlogs = () => {
        setLoading(true);
        api.get('/admin/blogs')
            .then(res => setBlogs(res.data.posts))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    const refreshQuestions = () => {
        setLoading(true);
        api.get('/questions?status=pending')
            .then(res => setQuestions(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put(`/admin/contents/${selectedFile}`, { content });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (e) {
            alert('Save failed');
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    const handleBlogSave = async () => {
        if (!blogForm.slug || !blogForm.title) {
            alert('Slug and Title are required');
            return;
        }

        setSaving(true);
        try {
            if (isEditingBlog && selectedBlog) {
                // Update
                await api.put(`/admin/blogs/${selectedBlog.slug}`, {
                    new_slug: blogForm.slug,
                    title: blogForm.title,
                    date: blogForm.date,
                    summary: blogForm.summary,
                    body: blogForm.body
                });
            } else {
                // Create
                await api.post('/admin/blogs', blogForm);
            }
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);

            // Reset view to list
            setIsEditingBlog(false);
            setSelectedBlog(null);
            refreshBlogs();
        } catch (e) {
            alert('Save failed');
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    const handleBlogDelete = async (slug: string) => {
        if (!confirm('Are you sure you want to delete this post?')) return;
        setSaving(true);
        try {
            await api.delete(`/admin/blogs/${slug}`);
            refreshBlogs();
        } catch (e) {
            alert('Delete failed');
        } finally {
            setSaving(false);
        }
    };

    const handleAnswerSubmit = async () => {
        if (!selectedQuestion || !answer.trim()) return;
        setSaving(true);
        try {
            await api.put(`/questions/${selectedQuestion.id}`, {
                question: {
                    answer: answer,
                    status: 'answered'
                }
            });
            alert('Answer sent!');
            setSelectedQuestion(null);
            setAnswer('');
            refreshQuestions();
        } catch (error) {
            console.error(error);
            alert('Failed to send answer');
        } finally {
            setSaving(false);
        }
    };

    const startEditBlog = async (post: BlogPost) => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/blogs/${post.slug}`);
            const raw = res.data.content;

            // Basic parsing of frontmatter for body
            // This is a naive split
            const parts = raw.split('---');
            const body = parts.length > 2 ? parts.slice(2).join('---').trim() : raw;

            setBlogForm({ ...post, body });
            setSelectedBlog(post);
            setIsEditingBlog(true);
        } catch (e) {
            alert('Failed to load post');
        } finally {
            setLoading(false);
        }
    };

    const startNewBlog = () => {
        const today = new Date().toISOString().split('T')[0];
        setBlogForm({ slug: '', title: '', date: today, summary: '', body: '' });
        setSelectedBlog(null);
        setIsEditingBlog(true);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        setSaving(true);
        try {
            await api.post('/admin/images', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('アップロード完了！反映するには同期スクリプトを実行してください。');
            refreshImages();
        } catch (err) {
            console.error(err);
            alert('Upload failed');
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <SEO title="Admin" />
            <div className="container mx-auto px-6 py-24 h-screen flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold">Content Editor</h1>
                        <button onClick={logout} className="text-xs text-red-400 hover:text-red-300 underline">Logout</button>
                    </div>
                    <div className="flex gap-2 text-xs md:text-sm overflow-x-auto pb-2">
                        {FILES.map(f => (
                            <button
                                key={f.id}
                                onClick={() => {
                                    setSelectedFile(f.id);
                                    setIsEditingBlog(false);
                                    setSelectedQuestion(null);
                                }}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${selectedFile === f.id
                                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-black'
                                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                                    }`}
                            >
                                {f.name}
                            </button>
                        ))}
                        <button
                            onClick={() => setSelectedFile('inbox')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${selectedFile === 'inbox'
                                ? 'bg-neutral-900 text-white dark:bg-white dark:text-black'
                                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                                }`}
                        >
                            Inbox
                        </button>
                    </div>
                </div>

                <div className="flex-grow relative bg-neutral-900 rounded-xl overflow-hidden shadow-2xl border border-neutral-800">
                    {loading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/80 backdrop-blur-sm z-10 text-white">
                            <Loader2 className="animate-spin" />
                        </div>
                    ) : null}

                    {selectedFile === 'images' ? (
                        <div className="p-8 text-white h-full overflow-y-auto">
                            <div className="mb-8 p-6 border-2 border-dashed border-neutral-700 rounded-xl flex flex-col items-center justify-center gap-4 hover:border-cyan-500 transition-colors">
                                <Save size={32} className="text-neutral-500" />
                                <div className="text-center">
                                    <p className="font-bold mb-1">画像をアップロード</p>
                                    <p className="text-xs text-neutral-500">JPG, PNG, GIF</p>
                                </div>
                                <input
                                    type="file"
                                    onChange={handleFileUpload}
                                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"
                                />
                            </div>

                            <h3 className="font-bold mb-4">Uploaded Images (Click to Copy Markdown)</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {images.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            navigator.clipboard.writeText(`![${img.name}](/images/${img.name})`);
                                            alert(`Copied markdown for ${img.name}!`);
                                        }}
                                        className="group relative aspect-square bg-neutral-800 rounded-lg overflow-hidden border border-neutral-700 hover:border-cyan-500 transition-all text-left"
                                    >
                                        <div className="absolute inset-0 flex items-center justify-center text-xs text-neutral-500 break-all p-2 group-hover:text-cyan-400">
                                            {img.name}
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <p className="mt-4 text-xs text-yellow-500">
                                ※ 注意: アップロード後は必ず `UPDATE_CONTENT.bat` で同期（またはデプロイ）してください。
                            </p>
                        </div>
                    ) : selectedFile === 'blogs' ? (
                        <div className="h-full flex flex-col text-white">
                            {isEditingBlog ? (
                                // Blog Editor
                                <div className="flex flex-col h-full">
                                    <div className="p-4 border-b border-neutral-800 flex items-center gap-4 bg-neutral-900 z-10">
                                        <button onClick={() => setIsEditingBlog(false)} className="text-sm text-neutral-400 hover:text-white">
                                            ← List
                                        </button>
                                        <span className="font-bold">
                                            {selectedBlog ? 'Edit Post' : 'New Post'}
                                        </span>
                                    </div>
                                    <div className="flex-grow p-6 overflow-y-auto space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs text-neutral-500 mb-1">Title</label>
                                                <input
                                                    type="text"
                                                    value={blogForm.title}
                                                    onChange={e => setBlogForm({ ...blogForm, title: e.target.value })}
                                                    className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-neutral-500 mb-1">Slug (URL)</label>
                                                <input
                                                    type="text"
                                                    value={blogForm.slug}
                                                    onChange={e => setBlogForm({ ...blogForm, slug: e.target.value })}
                                                    className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-sm font-mono"
                                                    placeholder="my-new-post"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs text-neutral-500 mb-1">Date (YYYY-MM-DD)</label>
                                                <input
                                                    type="text"
                                                    value={blogForm.date}
                                                    onChange={e => setBlogForm({ ...blogForm, date: e.target.value })}
                                                    className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-sm font-mono"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-neutral-500 mb-1">Summary</label>
                                                <input
                                                    type="text"
                                                    value={blogForm.summary}
                                                    onChange={e => setBlogForm({ ...blogForm, summary: e.target.value })}
                                                    className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="h-full flex flex-col">
                                            <label className="block text-xs text-neutral-500 mb-1">Body (Markdown)</label>
                                            <textarea
                                                value={blogForm.body}
                                                onChange={e => setBlogForm({ ...blogForm, body: e.target.value })}
                                                className="w-full h-96 bg-neutral-800 border border-neutral-700 rounded p-4 font-mono text-sm resize-none focus:outline-none focus:border-cyan-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="p-4 border-t border-neutral-800 flex justify-end">
                                        <button
                                            onClick={handleBlogSave}
                                            disabled={saving}
                                            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg flex items-center gap-2"
                                        >
                                            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                            Save Post
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // Blog List
                                <div className="p-6 h-full overflow-y-auto">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-bold">Blog Posts</h2>
                                        <button
                                            onClick={startNewBlog}
                                            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg flex items-center gap-2 text-sm"
                                        >
                                            <Plus size={16} /> New Post
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {blogs.map(post => (
                                            <div key={post.slug} className="flex items-center justify-between p-4 bg-neutral-800 rounded-xl border border-neutral-700 hover:border-neutral-500 group">
                                                <div>
                                                    <h3 className="font-bold">{post.title}</h3>
                                                    <div className="flex gap-4 text-xs text-neutral-500 mt-1">
                                                        <span className="font-mono">{post.date}</span>
                                                        <span className="font-mono">{post.slug}</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => startEditBlog(post)}
                                                        className="p-2 bg-neutral-700 rounded-lg hover:bg-cyan-600/20 hover:text-cyan-400"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleBlogDelete(post.slug)}
                                                        className="p-2 bg-neutral-700 rounded-lg hover:bg-red-900/20 hover:text-red-400"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {blogs.length === 0 && (
                                            <p className="text-neutral-500 italic">No posts found.</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : selectedFile === 'inbox' ? (
                        <div className="p-6 h-full flex gap-6 text-white overflow-hidden">
                            {/* Question List */}
                            <div className="w-1/3 border-r border-neutral-800 pr-6 overflow-y-auto">
                                <h3 className="font-bold mb-4 sticky top-0 bg-neutral-900 py-2">Inbox ({questions.length})</h3>
                                <div className="space-y-3">
                                    {questions.map(q => (
                                        <button
                                            key={q.id}
                                            onClick={() => {
                                                setSelectedQuestion(q);
                                                setAnswer(q.answer || '');
                                            }}
                                            className={`w-full text-left p-4 rounded-xl border transition-all ${selectedQuestion?.id === q.id
                                                ? 'bg-cyan-900/20 border-cyan-500/50'
                                                : 'bg-neutral-800 border-neutral-700 hover:border-neutral-600'
                                                }`}
                                        >
                                            <p className="font-bold text-sm line-clamp-2 mb-2">{q.content}</p>
                                            <div className="flex justify-between text-xs text-neutral-500">
                                                <span>{new Date(q.created_at).toLocaleDateString()}</span>
                                                <span className={q.status === 'answered' ? 'text-green-500' : 'text-yellow-500'}>
                                                    {q.status}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                    {questions.length === 0 && (
                                        <p className="text-sm text-neutral-500">No pending questions.</p>
                                    )}
                                </div>
                            </div>

                            {/* Answer Area */}
                            <div className="flex-grow flex flex-col h-full overflow-hidden">
                                {selectedQuestion ? (
                                    <>
                                        <div className="mb-6 flex-shrink-0">
                                            <h4 className="text-xs text-neutral-500 mb-2">Selected Question</h4>
                                            <div className="bg-neutral-800 p-4 rounded-xl border border-neutral-700 text-lg">
                                                {selectedQuestion.content}
                                            </div>
                                            {selectedQuestion.ip_address && (
                                                <p className="text-xs text-neutral-600 mt-2 font-mono">IP: {selectedQuestion.ip_address}</p>
                                            )}
                                        </div>
                                        <div className="flex-grow flex flex-col min-h-0">
                                            <h4 className="text-xs text-neutral-500 mb-2">Your Answer</h4>
                                            <textarea
                                                value={answer}
                                                onChange={(e) => setAnswer(e.target.value)}
                                                placeholder="Write your answer here..."
                                                className="w-full flex-grow bg-neutral-800 border border-neutral-700 rounded-xl p-4 text-white resize-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                                            />
                                        </div>
                                        <div className="mt-4 flex justify-end flex-shrink-0">
                                            <button
                                                onClick={handleAnswerSubmit}
                                                disabled={saving || !answer.trim()}
                                                className="px-6 py-3 bg-cyan-600 text-white rounded-xl font-bold hover:bg-cyan-500 transition-colors flex items-center gap-2 disabled:opacity-50"
                                            >
                                                {saving ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                                                Send Answer
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-neutral-600">
                                        Select a question to answer
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full h-full p-6 font-mono text-sm bg-neutral-900 text-neutral-200 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            spellCheck={false}
                        />
                    )}
                </div>

                {selectedFile !== 'images' && selectedFile !== 'blogs' && selectedFile !== 'inbox' && (
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={saving || loading}
                            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white transition-all ${saved ? 'bg-green-600' : 'bg-cyan-600 hover:bg-cyan-500'
                                }`}
                        >
                            {saving ? <Loader2 className="animate-spin" size={18} /> :
                                saved ? <Check size={18} /> : <Save size={18} />}
                            {saved ? 'Saved!' : 'Save Changes'}
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};
