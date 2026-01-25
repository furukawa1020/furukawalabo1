import { useState } from 'react';
import api from '../api/client';
import { SEO } from '../components/SEO';
import { Heart, CreditCard, ChevronRight, Loader2 } from 'lucide-react';

export const Donate = () => {
    const [amount, setAmount] = useState(1000);
    const [message, setMessage] = useState('');
    const [donorName, setDonorName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleDonate = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/donations/create', {
                amount,
                message,
                donor_name: donorName
            });
            // Redirect to Stripe Checkout
            window.location.href = res.data.url;
        } catch (e) {
            console.error(e);
            setError('決済の開始に失敗しました。');
            setLoading(false);
        }
    };

    return (
        <>
            <SEO title="Donate" description="ご支援のお願い" />
            <div className="container mx-auto px-6 py-24 max-w-2xl text-center">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-cyan-900/30 rounded-full text-cyan-400">
                        <Heart size={48} className="animate-pulse" />
                    </div>
                </div>
                <h1 className="text-3xl font-bold mb-6 tracking-tight">活動ご支援のお願い</h1>
                <p className="text-lg text-neutral-400 mb-12 leading-relaxed text-left max-w-xl mx-auto">
                    いつも活動をご覧いただきありがとうございます。<br />
                    もしよろしければ、研究・開発活動を少しだけご支援いただけないでしょうか。<br />
                    <br />
                    皆様からいただいたご支援は、サーバー維持費・実験機材・学習リソースとして<br />
                    大切に使わせていただき、「生きててよかった」と思える未来を作る活動に還元いたします。
                </p>

                <div className="bg-neutral-800 p-8 rounded-2xl border border-neutral-700 text-left">
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                            ご支援金額 (JPY)
                        </label>
                        <select
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-white"
                        >
                            <option value="500">¥500 (Coffee)</option>
                            <option value="1000">¥1,000 (Lunch)</option>
                            <option value="3000">¥3,000 (Book)</option>
                            <option value="5000">¥5,000 (Support)</option>
                            <option value="10000">¥10,000 (Sponsor)</option>
                            <option value="30000">¥30,000 (Bronze Sponsor)</option>
                            <option value="50000">¥50,000 (Silver Sponsor)</option>
                            <option value="100000">¥100,000 (Gold Sponsor)</option>
                        </select>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                            お名前 (任意)
                        </label>
                        <input
                            type="text"
                            value={donorName}
                            onChange={(e) => setDonorName(e.target.value)}
                            placeholder="ニックネームでも構いません"
                            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-white"
                        />
                    </div>

                    <div className="mb-8">
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                            メッセージ (任意)
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="もしよろしければ、応援メッセージをいただけると励みになります"
                            rows={3}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-white"
                        />
                    </div>

                    {error && <div className="text-red-500 mb-4 text-center">{error}</div>}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={handleDonate}
                            disabled={loading}
                            className="group relative flex items-center justify-center gap-3 px-6 py-4 bg-cyan-700 hover:bg-cyan-600 text-white font-bold rounded-xl transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-cyan-900/20 active:scale-[0.98]"
                        >
                            {loading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <>
                                    <CreditCard size={20} />
                                    <span>Card (Stripe)</span>
                                    <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 transition-all -ml-2 group-hover:ml-0" />
                                </>
                            )}
                        </button>

                        <a
                            href="https://qr.paypay.ne.jp/p2p01_zoSLHg15nVBSFYVH"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative flex items-center justify-center gap-3 px-6 py-4 bg-[#FF0033] hover:bg-[#D9002B] text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-red-900/20 active:scale-[0.98]"
                        >
                            <span className="font-bold text-lg">P</span>
                            <span>PayPayで送る</span>
                            <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 transition-all -ml-2 group-hover:ml-0" />
                        </a>
                    </div>
                </div>

                <div className="mt-8 text-xs text-neutral-500 text-center leading-relaxed">
                    ※ Stripe決済は安全な外部ページへ移動します。<br />
                    ※ PayPayはアプリが起動、または送金画面へ遷移します。
                </div>
            </div>
        </>
    );
};
