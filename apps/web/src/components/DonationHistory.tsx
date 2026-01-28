import React, { useEffect, useState } from 'react';
import { Coffee, Trophy, Clock } from 'lucide-react';
import axios from 'axios';

interface Donation {
    id: number;
    amount: number;
    donor_name: string;
    message: string;
    created_at: string;
}

interface DonationStats {
    total_amount: number;
    total_count: number;
}

const DonationHistory: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'recent' | 'top'>('recent');
    const [recentDonations, setRecentDonations] = useState<Donation[]>([]);
    const [topDonations, setTopDonations] = useState<Donation[]>([]);
    const [stats, setStats] = useState<DonationStats>({ total_amount: 0, total_count: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/donations`);
                setRecentDonations(response.data.recent);
                setTopDonations(response.data.top);
                setStats(response.data.stats);
            } catch (error) {
                console.error('Failed to fetch donation history:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    if (loading) return <div className="text-center py-8 text-neutral-400">Loading history...</div>;

    const List = ({ items }: { items: Donation[] }) => (
        <div className="space-y-4">
            {items.map((donation) => (
                <div key={donation.id} className="bg-neutral-800/50 p-4 rounded-xl flex items-start gap-3 border border-neutral-700/50">
                    <div className="bg-yellow-500/20 p-2 rounded-lg text-yellow-500">
                        {activeTab === 'recent' ? <Clock size={20} /> : <Trophy size={20} />}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-white">{donation.donor_name || "Anonymous"}</span>
                            <span className="text-yellow-500 font-bold text-sm">${donation.amount.toLocaleString()}</span>
                        </div>
                        {donation.message && (
                            <p className="text-neutral-400 text-sm">{donation.message}</p>
                        )}
                        <p className="text-neutral-500 text-xs mt-2">
                            {new Date(donation.created_at).toLocaleDateString(('ja-JP'))}
                        </p>
                    </div>
                </div>
            ))}
            {items.length === 0 && (
                <div className="text-center text-neutral-500 py-4">
                    まだ支援データがありません。最初の支援者になりませんか？
                </div>
            )}
        </div>
    );

    return (
        <div className="bg-neutral-900/50 rounded-3xl p-6 border border-neutral-800">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Coffee className="text-yellow-500" />
                <span>おやつカウンター</span>
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-neutral-800 p-4 rounded-2xl text-center">
                    <div className="text-neutral-400 text-sm mb-1">累計おやつ代</div>
                    <div className="text-2xl font-black text-yellow-500">${stats.total_amount.toLocaleString()}</div>
                </div>
                <div className="bg-neutral-800 p-4 rounded-2xl text-center">
                    <div className="text-neutral-400 text-sm mb-1">支援回数</div>
                    <div className="text-2xl font-black text-white">{stats.total_count}回</div>
                </div>
            </div>

            <div className="flex gap-2 mb-6 bg-neutral-800 p-1 rounded-xl">
                <button
                    onClick={() => setActiveTab('recent')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'recent'
                        ? 'bg-neutral-700 text-white shadow-sm'
                        : 'text-neutral-400 hover:text-white'
                        }`}
                >
                    最近のおやつ
                </button>
                <button
                    onClick={() => setActiveTab('top')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'top'
                        ? 'bg-neutral-700 text-white shadow-sm'
                        : 'text-neutral-400 hover:text-white'
                        }`}
                >
                    ランキング
                </button>
            </div>

            <List items={activeTab === 'recent' ? recentDonations : topDonations} />
        </div>
    );
};

export default DonationHistory;
