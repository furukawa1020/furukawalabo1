import { useState } from 'react';
import { SEO } from '../components/SEO';
import { CreditCard, Loader2, AlertCircle } from 'lucide-react';
import api from '../api/client';

export const Donate = () => {
    const [selectedAmount, setSelectedAmount] = useState(1000);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const amounts = [
        { value: 500, label: 'Coffee', emoji: '☕', color: 'bg-amber-900/30 border-amber-700 hover:border-amber-500' },
        { value: 1000, label: 'Lunch', emoji: '🍱', color: 'bg-green-900/30 border-green-700 hover:border-green-500' },
        { value: 3000, label: 'Book', emoji: '📚', color: 'bg-blue-900/30 border-blue-700 hover:border-blue-500' },
        { value: 5000, label: 'Support', emoji: '💪', color: 'bg-purple-900/30 border-purple-700 hover:border-purple-500' },
        { value: 10000, label: 'Sponsor', emoji: '⭐', color: 'bg-pink-900/30 border-pink-700 hover:border-pink-500' },
    ];

    const [question, setQuestion] = useState("");

    const handleDonate = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.post('/donations', {
                amount: selectedAmount,
                message: question || "No question provided", // Send the question as message
                donor_name: "Anonymous" // Simplify for now
            });
            if (res.data.url) {
                window.location.href = res.data.url;
            } else {
                throw new Error("No checkout URL returned");
            }
        } catch (err) {
            console.error("Donation failed", err);
            setError("決済の準備に失敗しました。しばらく経ってから再度お試しください。");
            setLoading(false);
        }
    };

    return (
        <>
            <SEO title="おやつ代と質問ボックス" description="おやつ代と一緒に質問を送ろう" />
            <div className="min-h-screen bg-neutral-900 text-white pt-32 pb-24">
                <div className="container mx-auto px-6 max-w-4xl">

                    {/* Header */}
                    <div className="text-center mb-16">
                        <div className="flex justify-center mb-6">
                            <div className="p-6 bg-amber-900/30 rounded-full">
                                <span className="text-6xl animate-bounce block">🍪</span>
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                            おやつ代と質問ボックス
                        </h1>
                        <p className="text-xl md:text-2xl text-neutral-300 font-bold leading-relaxed max-w-2xl mx-auto border-l-8 border-amber-500 pl-6 py-2 text-left">
                            Snacks & Questions
                        </p>
                    </div>

                    {/* Message / Form */}
                    <div className="bg-neutral-800/50 backdrop-blur-sm p-8 md:p-12 rounded-3xl border border-neutral-700 shadow-2xl mb-12">
                        <div className="mb-8">
                            <label htmlFor="question" className="block text-xl font-bold text-neutral-200 mb-4">
                                聞きたいことをどうぞ！
                            </label>
                            <textarea
                                id="question"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="例：好きなプログラミング言語は？ 研究のモチベーションは？ (ここに質問を入力)"
                                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-6 text-lg text-white placeholder-neutral-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all min-h-[150px]"
                            />
                        </div>

                        <p className="text-base leading-relaxed text-neutral-300 mb-4">
                            おやつ代（50円〜）を添えて送ると、回答が返ってくるかも...？
                            <br />
                            <span className="text-amber-300 font-bold">おいしいおやつ</span>を楽しみに待ってます！
                        </p>
                    </div>

                    {/* Amount Selection */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold mb-6 text-center text-neutral-200">
                            おやつ代を選ぶ
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {amounts.map((amount) => (
                                <button
                                    key={amount.value}
                                    onClick={() => setSelectedAmount(amount.value)}
                                    className={`relative p-6 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center ${amount.color} ${selectedAmount === amount.value
                                        ? 'scale-105 shadow-xl ring-2 ring-white/20'
                                        : 'hover:scale-105'
                                        } `}
                                >
                                    <div className="text-4xl mb-3">{amount.emoji}</div>
                                    <div className="text-xl font-black mb-1">¥{amount.value.toLocaleString()}</div>
                                    <div className="text-xs text-neutral-400 font-medium uppercase tracking-wide">{amount.label}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Stripe Payment Button */}
                    <div className="flex flex-col items-center gap-6">
                        {error && (
                            <div className="flex items-center gap-2 text-red-400 bg-red-900/20 px-4 py-2 rounded-lg border border-red-800">
                                <AlertCircle size={20} />
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            onClick={handleDonate}
                            disabled={loading}
                            className="group relative w-full max-w-md overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-neutral-700 disabled:to-neutral-800 disabled:cursor-not-allowed text-white font-black text-2xl py-6 px-8 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/30 active:scale-[0.98]"
                        >
                            <div className="flex items-center justify-center gap-4 relative z-10">
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={32} />
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <CreditCard size={32} />
                                        <span>おやつを送る (¥{selectedAmount.toLocaleString()})</span>
                                    </>
                                )}
                            </div>
                            {!loading && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                            )}
                        </button>

                        <div className="flex items-center gap-2 text-neutral-500 text-sm">
                            <CreditCard size={14} />
                            <span>Powered by Stripe Secure Payment</span>
                        </div>
                    </div>

                    {/* Thank You Note */}
                    <div className="mt-16 text-center border-t border-neutral-800 pt-8">
                        <p className="text-neutral-500 text-sm">
                            ※ 決済はStripeの安全なページに移動して行われます。<br />
                            クレジットカード情報がこのサイトに保存されることはありません。
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};
