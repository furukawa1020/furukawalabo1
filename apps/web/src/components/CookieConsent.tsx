import { useState, useEffect } from 'react';
import { Cookie } from 'lucide-react';

export const CookieConsent = () => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie_consent');
        if (!consent) {
            setShow(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie_consent', 'accepted');
        setShow(false);
    };

    if (!show) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-neutral-900/95 backdrop-blur-md border-t border-neutral-800 p-6 z-50 shadow-2xl">
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-start gap-4 max-w-2xl">
                    <div className="p-2 bg-neutral-800 rounded-lg text-cyan-400 mt-1">
                        <Cookie size={24} />
                    </div>
                    <div className="space-y-1">
                        <p className="font-bold text-white text-sm">Cookie Policy</p>
                        <p className="text-sm text-neutral-400 leading-relaxed">
                            このサイトでは、より良い体験を作るためにCookieを使用しています（アクセス解析など）。
                            個人を特定するような怪しいことはしていませんが、念のためお知らせします。
                        </p>
                    </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto shrink-0">
                    <button
                        onClick={handleAccept}
                        className="flex-1 md:flex-none px-6 py-2.5 bg-cyan-600 text-white font-medium rounded-lg text-sm hover:bg-cyan-500 transition-all active:scale-95 shadow-lg shadow-cyan-900/20"
                    >
                        Accept All
                    </button>
                </div>
            </div>
        </div>
    );
};
