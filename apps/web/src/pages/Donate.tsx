import { useState, useEffect } from 'react';
import { SEO } from '../components/SEO';
import { Heart, ExternalLink, Check, AlertCircle, Clock } from 'lucide-react';

export const Donate = () => {
    const [selectedAmount, setSelectedAmount] = useState(1000);

    // QR Code Expiration Management
    const QR_EXPIRATION_DATE = new Date('2026-02-08T17:36:00+09:00');
    const [daysUntilExpiration, setDaysUntilExpiration] = useState(0);
    const [isExpired, setIsExpired] = useState(false);
    const [isExpiringSoon, setIsExpiringSoon] = useState(false);

    useEffect(() => {
        const checkExpiration = () => {
            const now = new Date();
            const diffMs = QR_EXPIRATION_DATE.getTime() - now.getTime();
            const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

            setDaysUntilExpiration(diffDays);
            setIsExpired(diffDays < 0);
            setIsExpiringSoon(diffDays >= 0 && diffDays <= 7);
        };

        checkExpiration();
        // Check every hour
        const interval = setInterval(checkExpiration, 1000 * 60 * 60);
        return () => clearInterval(interval);
    }, []);

    const amounts = [
        { value: 500, label: 'Coffee', emoji: '☕', color: 'bg-amber-900/30 border-amber-700 hover:border-amber-500' },
        { value: 1000, label: 'Lunch', emoji: '🍱', color: 'bg-green-900/30 border-green-700 hover:border-green-500' },
        { value: 3000, label: 'Book', emoji: '📚', color: 'bg-blue-900/30 border-blue-700 hover:border-blue-500' },
        { value: 5000, label: 'Support', emoji: '💪', color: 'bg-purple-900/30 border-purple-700 hover:border-purple-500' },
        { value: 10000, label: 'Sponsor', emoji: '⭐', color: 'bg-pink-900/30 border-pink-700 hover:border-pink-500' },
    ];

    return (
        <>
            <SEO title="寄付のお願い" description="活動ご支援のお願い" />
            <div className="min-h-screen bg-neutral-900 text-white pt-32 pb-24">
                <div className="container mx-auto px-6 max-w-4xl">
                    {/* QR Code Expiration Warning */}
                    {isExpired && (
                        <div className="mb-8 p-6 bg-red-900/50 border-2 border-red-500 rounded-2xl flex items-start gap-4 animate-pulse">
                            <AlertCircle size={32} className="text-red-400 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="font-bold text-xl mb-2 text-red-300">⚠️ QRコードの有効期限切れ</h3>
                                <p className="text-red-200">PayPayのQRコードの有効期限が切れています。新しいQRコードへの更新をお願いします。</p>
                            </div>
                        </div>
                    )}
                    {isExpiringSoon && !isExpired && (
                        <div className="mb-8 p-6 bg-yellow-900/50 border-2 border-yellow-500 rounded-2xl flex items-start gap-4">
                            <Clock size={32} className="text-yellow-400 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="font-bold text-xl mb-2 text-yellow-300">🔔 有効期限が近づいています</h3>
                                <p className="text-yellow-200">
                                    PayPayのQRコードの有効期限まであと <span className="font-bold text-2xl">{daysUntilExpiration}日</span> です。
                                    新しいQRコードの準備をお願いします。
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Header */}
                    <div className="text-center mb-16">
                        <div className="flex justify-center mb-6">
                            <div className="p-6 bg-red-900/30 rounded-full">
                                <Heart size={64} className="text-red-400 animate-pulse" fill="currentColor" />
                            </div>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-400">
                            活動ご支援のお願い
                        </h1>
                        <p className="text-xl md:text-2xl text-neutral-300 font-bold leading-relaxed max-w-2xl mx-auto border-l-8 border-red-500 pl-6 py-2 text-left">
                            Support Our Mission
                        </p>
                    </div>

                    {/* Message */}
                    <div className="bg-neutral-800/50 backdrop-blur-sm p-8 md:p-12 rounded-3xl border border-neutral-700 shadow-2xl mb-12">
                        <p className="text-lg leading-loose text-neutral-200 mb-6">
                            いつも活動をご覧いただきありがとうございます。
                        </p>
                        <p className="text-lg leading-loose text-neutral-200 mb-6">
                            もしよろしければ、研究・開発活動を少しだけご支援いただけないでしょうか。
                        </p>
                        <p className="text-base leading-relaxed text-neutral-300">
                            皆様からいただいたご支援は、サーバー維持費・実験機材・学習リソースとして大切に使わせていただき、
                            <span className="text-cyan-300 font-bold mx-1">「生きててよかった」</span>
                            と思える未来を作る活動に還元いたします。
                        </p>
                    </div>

                    {/* Amount Selection */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold mb-6 text-center text-neutral-200">
                            応援金額の目安
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {amounts.map((amount) => (
                                <button
                                    key={amount.value}
                                    onClick={() => setSelectedAmount(amount.value)}
                                    className={`relative p - 6 rounded - 2xl border - 2 transition - all duration - 200 ${amount.color} ${selectedAmount === amount.value
                                            ? 'scale-105 shadow-xl ring-2 ring-white/20'
                                            : 'hover:scale-105'
                                        } `}
                                >
                                    {selectedAmount === amount.value && (
                                        <div className="absolute -top-2 -right-2 bg-cyan-500 rounded-full p-1">
                                            <Check size={16} className="text-white" />
                                        </div>
                                    )}
                                    <div className="text-4xl mb-2">{amount.emoji}</div>
                                    <div className="text-xl font-black mb-1">¥{amount.value.toLocaleString()}</div>
                                    <div className="text-xs text-neutral-400 font-medium">{amount.label}</div>
                                </button>
                            ))}
                        </div>
                        <p className="text-center text-sm text-neutral-500 mt-4">
                            ※ PayPay送金画面で金額を自由に変更できます
                        </p>
                    </div>

                    {/* PayPay Section with QR Code */}
                    <div className="bg-neutral-800/80 p-8 md:p-12 rounded-3xl border border-neutral-700">
                        <div className="text-center mb-8">
                            <h3 className="text-3xl font-bold mb-2">
                                <span className="text-red-400">PayPay</span>で送る
                            </h3>
                            <p className="text-neutral-400 text-sm">
                                目安金額: <span className="font-bold text-white text-lg">¥{selectedAmount.toLocaleString()}</span>
                            </p>
                        </div>

                        {/* QR Code Image */}
                        <div className="mb-8 flex justify-center">
                            <div className="bg-white p-6 rounded-3xl shadow-2xl">
                                <img
                                    src="/images/paypay-qr.jpg"
                                    alt="PayPay QR Code"
                                    className="w-64 h-64 md:w-80 md:h-80 object-contain"
                                />
                                <p className="text-center text-xs text-neutral-600 mt-4 font-medium">
                                    有効期限: 2026年2月8日まで
                                </p>
                            </div>
                        </div>

                        {/* PayPay Link Button (fallback) */}
                        <a
                            href="https://qr.paypay.ne.jp/p2p01_P2xTNoMO89rAPgqM"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block"
                        >
                            <div className="relative overflow-hidden bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-2xl py-6 px-8 rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-red-900/50">
                                <div className="flex items-center justify-center gap-4">
                                    <div className="text-5xl font-black">P</div>
                                    <div className="text-left">
                                        <div className="text-sm font-normal opacity-90">QRが読めない場合</div>
                                        <div className="flex items-center gap-2">
                                            リンクから送金
                                            <ExternalLink size={20} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                            </div>
                        </a>

                        <p className="text-center text-xs text-neutral-500 mt-6 leading-relaxed">
                            QRコードをスマホで読み取るか、ボタンをタップしてPayPayアプリで送金できます
                        </p>
                    </div>

                    {/* Thank You Message */}
                    <div className="mt-12 text-center">
                        <p className="text-neutral-400 text-sm leading-relaxed">
                            ご支援いただいた皆様、本当にありがとうございます。<br />
                            いただいたご支援は責任を持って活動に活かします。
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};
