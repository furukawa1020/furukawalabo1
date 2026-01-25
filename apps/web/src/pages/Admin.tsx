import { useState, useEffect } from 'react';
import api from '../api/client';
import { SEO } from '../components/SEO';
import { Save, Loader2, Check } from 'lucide-react';

const FILES = [
    { id: 'achievements', name: 'Achievements (YAML)' },
    { id: 'about', name: 'About (Markdown)' },
    { id: 'research', name: 'Research (Markdown)' },
    { id: 'images', name: 'Images (Upload)' } // New Tab
];

export const Admin = () => {
    const [selectedFile, setSelectedFile] = useState(FILES[0].id);
    const [content, setContent] = useState('');
    const [images, setImages] = useState<{ name: string, url: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (selectedFile === 'images') {
            refreshImages();
        } else {
            setLoading(true);
            api.get(`/admin/contents/${selectedFile}`)
                .then(res => setContent(res.data.content))
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [selectedFile]);

    const refreshImages = () => {
        setLoading(true);
        api.get('/admin/images')
            .then(res => setImages(res.data.images))
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
                    <h1 className="text-2xl font-bold">Content Editor</h1>
                    <div className="flex gap-2 text-xs md:text-sm overflow-x-auto pb-2">
                        {FILES.map(f => (
                            <button
                                key={f.id}
                                onClick={() => setSelectedFile(f.id)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${selectedFile === f.id
                                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-black'
                                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                                    }`}
                            >
                                {f.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-grow relative bg-neutral-900 rounded-xl overflow-hidden">
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
                    ) : (
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full h-full p-6 font-mono text-sm bg-neutral-900 text-neutral-200 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            spellCheck={false}
                        />
                    )}
                </div>

                {selectedFile !== 'images' && (
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
