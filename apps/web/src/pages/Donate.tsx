import { useState } from 'react';
import { SEO } from '../components/SEO';
import { CreditCard, Loader2, AlertCircle, Share2 } from 'lucide-react';
import api from '../api/client';

export const Donate = () => {
    const [selectedAmount, setSelectedAmount] = useState(100);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const amounts = [
        { value: 50, label: 'Mini', emoji: '🍬', color: 'bg-neutral-800 border-neutral-600 hover:border-neutral-400' },
        { value: 100, label: 'Snack', emoji: '🍘', color: 'bg-stone-900/40 border-stone-700 hover:border-stone-500' },
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

                {/* Social Sharing Actions */}
                <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Ask on X */}
                    <div className="bg-neutral-800/30 p-8 rounded-3xl border border-neutral-700/50 text-center">
                        <h3 className="text-xl font-bold mb-4">質問だけしたい場合は...</h3>
                        <p className="text-neutral-400 mb-6 text-sm">
                            おやつ代なしでも大丈夫！Xで質問してくれれば、リプライで回答します。<br />
                            (おやつ付きの方が優先回答されるかも...？)
                        </p>
                        <a
                            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("@HATAKE55555 \n" + (question || "質問があります！") + "\n\n#FurukawaLab")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full font-bold hover:bg-neutral-800 transition-colors"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                            Xで質問する
                        </a>
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
                            応援をシェアする
                        </a>
                    </div>
                </div>
            </>
            );
};
