import { useEffect, useState } from 'react';
import { createConsumer } from '@rails/actioncable';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, X } from 'lucide-react';

interface DonationData {
    amount: number;
    donor_name: string;
    message: string;
    timestamp: string;
}

export const DonationNotification = () => {
    const [donations, setDonations] = useState<DonationData[]>([]);

    useEffect(() => {
        // Connect to ActionCable
        // Adjust logic to point to the correct WS endpoint.
        // If VITE_API_URL is http, replace with ws. If https, wss.
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        const wsUrl = apiUrl.replace(/^http/, 'ws') + '/cable';

        const cable = createConsumer(wsUrl);

        const subscription = cable.subscriptions.create("DonationsChannel", {
            received(data: DonationData) {
                console.log("Donation received!", data);
                setDonations(prev => [...prev, data]);
                // Auto dismiss after 8 seconds
                setTimeout(() => {
                    setDonations(prev => prev.filter(d => d !== data));
                }, 8000);
            }
        });

        return () => {
            subscription.unsubscribe();
            cable.disconnect();
        };
    }, []);

    return (
        <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-2 pointer-events-none">
            <AnimatePresence>
                {donations.map((donation, index) => (
                    <motion.div
                        key={`${donation.timestamp}-${index}`}
                        initial={{ opacity: 0, x: -50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -20, scale: 0.9 }}
                        className="bg-white dark:bg-neutral-800 border border-cyan-500/30 shadow-2xl p-4 rounded-xl max-w-sm pointer-events-auto flex items-start gap-3 backdrop-blur-md bg-opacity-90"
                    >
                        <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-full text-cyan-600 dark:text-cyan-400 shrink-0">
                            <Gift size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-neutral-900 dark:text-white truncate">
                                {donation.donor_name || 'Anonymous'} sent some snacks!
                            </p>
                            <p className="text-cyan-600 dark:text-cyan-400 font-bold text-lg">
                                ¥{donation.amount.toLocaleString()}
                            </p>
                            {donation.message && (
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
                                    "{donation.message}"
                                </p>
                            )}
                        </div>
                        <button
                            onClick={() => setDonations(prev => prev.filter(d => d !== donation))}
                            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};
