import { useState } from 'react';
import { SEO } from '../components/SEO';
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';

export const Contact = () => {
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus('submitting');
        
        const form = e.currentTarget;
        const formData = new FormData(form);

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                setStatus('success');
                form.reset();
            } else {
                setStatus('error');
            }
        } catch (error) {
            setStatus('error');
        }
    };

    return (
        <>
            <SEO title="Contact" description="お問い合わせ・ご連絡はこちらから" />
            <div className="min-h-screen bg-neutral-900 text-white pt-32 pb-24">
                <div className="container mx-auto px-6 max-w-3xl">
                    <div className="mb-12 text-center">
                        <div className="flex justify-center mb-6">
                            <div className="p-4 bg-cyan-900/30 rounded-full border border-cyan-500/30">
                                <Mail size={40} className="text-cyan-400" />
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                            Contact
                        </h1>
                        <p className="text-lg text-neutral-400 leading-relaxed max-w-2xl mx-auto">
                            ご質問、プロジェクトのご相談、雑談など、なんでもお気軽にご連絡ください。<br />
                            以下のフォームから送信いただくと、直接私のメールアドレスに届きます。
                        </p>
                    </div>

                    <div className="bg-neutral-800/50 backdrop-blur-sm p-8 md:p-10 rounded-3xl border border-neutral-700 shadow-2xl relative overflow-hidden">
                        {/* 背景の装飾 */}
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />

                        {status === 'success' ? (
                            <div className="text-center py-12 relative z-10">
                                <CheckCircle size={64} className="text-green-400 mx-auto mb-6" />
                                <h3 className="text-2xl font-bold mb-2">送信完了しました！</h3>
                                <p className="text-neutral-400">
                                    ご連絡ありがとうございます。内容を確認次第、返信させていただきます。
                                </p>
                                <button
                                    onClick={() => setStatus('idle')}
                                    className="mt-8 px-6 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-full transition-colors text-sm font-medium"
                                >
                                    別のメッセージを送る
                                </button>
                            </div>
                        ) : (
                            <form 
                                action="https://formsubmit.co/f.kotaro.0530@gmail.com" 
                                method="POST"
                                className="space-y-6 relative z-10"
                                onSubmit={handleSubmit}
                            >
                                {/* FormSubmit settings */}
                                <input type="hidden" name="_subject" value="【Furukawa Archive】新しいお問い合わせ" />
                                <input type="hidden" name="_captcha" value="false" />
                                <input type="hidden" name="_template" value="table" />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="name" className="text-sm font-medium text-neutral-300">
                                            お名前
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            required
                                            className="w-full bg-neutral-900/50 border border-neutral-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all placeholder:text-neutral-600"
                                            placeholder="山田 太郎"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="email" className="text-sm font-medium text-neutral-300">
                                            メールアドレス
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            required
                                            className="w-full bg-neutral-900/50 border border-neutral-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all placeholder:text-neutral-600"
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="message" className="text-sm font-medium text-neutral-300">
                                        メッセージ
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        required
                                        rows={6}
                                        className="w-full bg-neutral-900/50 border border-neutral-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all resize-none placeholder:text-neutral-600"
                                        placeholder="こんにちは！プロジェクトについて相談したいことがあります..."
                                    ></textarea>
                                </div>

                                {status === 'error' && (
                                    <div className="p-4 bg-red-900/30 border border-red-500/50 rounded-xl text-red-300 text-sm">
                                        送信に失敗しました。しばらく経ってから再度お試しください。
                                    </div>
                                )}

                                <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-4">
                                    <p className="text-xs text-neutral-500 flex items-center gap-1.5">
                                        <AlertCircle size={14} />
                                        送信には formsubmit.co を使用しています
                                    </p>
                                    <button
                                        type="submit"
                                        disabled={status === 'submitting'}
                                        className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-xl font-bold transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {status === 'submitting' ? (
                                            <span className="animate-pulse">送信中...</span>
                                        ) : (
                                            <>
                                                <Send size={18} />
                                                メッセージを送信
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};
