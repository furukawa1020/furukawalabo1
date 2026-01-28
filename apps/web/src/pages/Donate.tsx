import { useState } from 'react';
import { Share2, Gift, Send } from 'lucide-react';
import { SEO } from '../components/SEO';
import DonationHistory from '../components/DonationHistory';
import axios from 'axios';

export const Donate = () => {
    const [question, setQuestion] = useState('');
    const [isSending, setIsSending] = useState(false);

    // 金額設定（表示用）
    // 金額設定（表示用）
    const amounts = [
        { value: 1, label: 'Mini', emoji: '🍬', color: 'bg-neutral-800 border-neutral-600 hover:border-neutral-400' },
        { value: 3, label: 'Snack', emoji: '🍘', color: 'bg-stone-900/40 border-stone-700 hover:border-stone-500' },
        { value: 5, label: 'Coffee', emoji: '☕', color: 'bg-amber-900/30 border-amber-700 hover:border-amber-500' },
        { value: 10, label: 'Lunch', emoji: '🍱', color: 'bg-green-900/30 border-green-700 hover:border-green-500' },
        { value: 30, label: 'Book', emoji: '📚', color: 'bg-blue-900/30 border-blue-700 hover:border-blue-500' },
        { value: 50, label: 'Support', emoji: '💪', color: 'bg-purple-900/30 border-purple-700 hover:border-purple-500' },
        { value: 100, label: 'Sponsor', emoji: '⭐', color: 'bg-pink-900/30 border-pink-700 hover:border-pink-500' },
    ];

    const handleAskQuestion = async () => {
        if (!question.trim()) return;

        setIsSending(true);
        try {
            // 1. APIに質問を保存
            await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/questions`, {
                question: { content: question }
            });

            // 2. Twitterインテントを開く
            const text = encodeURIComponent(`@HATAKE55555 \n${question}\n\n#FurukawaLab #質問`);
            window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');

            setQuestion('');
        } catch (error) {
            console.error('Failed to send question:', error);
            alert('質問の送信に失敗しました。もう一度お試しください。');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <>
            <SEO
                title="Donate & Ask"
                description="古川ラボの研究活動を支援する・質問を送る"
            />

            <div className="pt-32 pb-20 px-4 min-h-screen">
                <div className="max-w-6xl mx-auto space-y-12">

                    {/* Header */}
                    <div className="text-center space-y-6">
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4">
                            DONATE <span className="text-neutral-600">&</span> ASK
                        </h1>
                        <p className="text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
                            研究活動継続のため、温かいご支援（おやつ代）をお願いします。<br />
                            いただいたご支援はサーバー代や技術書の購入、<br />
                            そして研究の合間の糖分補給に使わせていただきます。
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 items-start">
                        {/* Left Column: Donation Section */}
                        <div className="space-y-8">
                            <div className="bg-neutral-800/30 p-8 rounded-3xl border border-neutral-700/50 text-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="relative z-10">
                                    <div className="text-6xl mb-6 animate-bounce-slow">🍪</div>
                                    <h2 className="text-3xl font-bold mb-4">おやつ代を送る</h2>
                                    <p className="text-neutral-400 mb-8">
                                        Buy Me a Coffee経由で安全に支援できます。<br />
                                        登録不要・クレジットカード対応です。
                                    </p>

                                    <div className="flex flex-col items-center gap-6">
                                        <a
                                            href="https://buymeacoffee.com/furukawalab"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group relative w-full max-w-md overflow-hidden bg-[#FFDD00] hover:bg-[#FFDD00]/90 text-black font-black text-2xl py-6 px-8 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-500/30 active:scale-[0.98] flex items-center justify-center gap-3"
                                        >
                                            <span className="text-3xl">🍪</span>
                                            <span>おやつと質問箱</span>
                                        </a>

                                        <div className="flex items-center gap-2 text-neutral-500 text-sm">
                                            <Gift size={16} />
                                            <span>会員登録なしで1分で完了します</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Amount Preview (Non-interactive) */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 opacity-60 pointer-events-none grayscale">
                                {amounts.slice(0, 6).map((amount) => (
                                    <div
                                        key={amount.value}
                                        className={`p-4 rounded-xl border border-neutral-700 bg-neutral-800/50 text-center ${amount.color}`}
                                    >
                                        <div className="text-2xl mb-2">{amount.emoji}</div>
                                        <div className="font-bold text-sm mb-1">{amount.label}</div>
                                        <div className="text-neutral-500 text-xs">${amount.value}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Share Donation */}
                            <div className="bg-neutral-800/30 p-8 rounded-3xl border border-neutral-700/50 text-center">
                                <h3 className="text-xl font-bold mb-4">応援をシェア！</h3>
                                <p className="text-neutral-400 mb-6 text-sm">
                                    「おやつ代」を送ったことをシェアして、<br />
                                    古川ラボの活動を広めてください！
                                </p>
                                <a
                                    href="https://twitter.com/intent/tweet?text=Furukawa%20Lab%E3%81%AB%E3%80%8C%E3%81%8A%E3%82%84%E3%81%A4%E4%BB%A3%E3%80%8D%E3%82%92%E9%80%81%E3%82%8A%E3%81%BE%E3%81%97%E3%81%9F%EF%BC%81%20%F0%9F%8D%AA%20%23Oyatsu%20%23FurukawaLab&url=https%3A%2F%2Ffurukawalab.com%2Fdonate"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-full font-bold hover:bg-amber-700 transition-colors"
                                >
                                    <Share2 size={20} />
                                    <span className="font-bold">応援をシェアする</span>
                                </a>
                            </div>
                        </div>

                        {/* Right Column: Question Box & History */}
                        <div className="space-y-8">
                            {/* Question Box */}
                            <div className="bg-neutral-800/30 p-8 rounded-3xl border border-neutral-700/50">
                                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                    <span className="text-3xl">📮</span>
                                    <span>質問箱</span>
                                </h3>
                                <div className="space-y-4">
                                    <textarea
                                        value={question}
                                        onChange={(e) => setQuestion(e.target.value)}
                                        placeholder="研究内容、技術的な質問、人生相談など..."
                                        className="w-full bg-black/50 border border-neutral-700 rounded-xl p-4 min-h-[150px] focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all resize-none text-lg text-white"
                                    />
                                    <p className="text-sm text-neutral-500">
                                        ※ 質問内容はDBに保存され、X(Twitter)でもメンション付きで投稿されます。
                                        (おやつ付きの方が優先回答されるかも...？)
                                    </p>
                                    <button
                                        onClick={handleAskQuestion}
                                        disabled={!question.trim() || isSending}
                                        className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-black text-white rounded-xl font-bold hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-neutral-700"
                                    >
                                        {isSending ? (
                                            '送信中...'
                                        ) : (
                                            <>
                                                <Send size={20} />
                                                <span>質問を送る (X & DB)</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Donation History & Leaderboard */}
                            <DonationHistory />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
