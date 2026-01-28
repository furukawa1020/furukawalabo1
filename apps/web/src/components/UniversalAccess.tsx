import { useState, useEffect } from 'react';
import { PersonStanding, Type, Sun, ZapOff, Check, X } from 'lucide-react';

export const UniversalAccess = () => {
    const [isOpen, setIsOpen] = useState(false);

    // Load settings from localStorage or use defaults
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('ua_settings');
        return saved ? JSON.parse(saved) : {
            textSize: 'normal', // normal, large, xlarge
            highContrast: false,
            reduceMotion: false,
            readableFont: false,
        };
    });

    // Save settings to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('ua_settings', JSON.stringify(settings));

        const root = document.documentElement;

        // Text Size
        root.classList.remove('ua-text-large', 'ua-text-xlarge');
        if (settings.textSize === 'large') root.classList.add('ua-text-large');
        if (settings.textSize === 'xlarge') root.classList.add('ua-text-xlarge');

        // High Contrast
        if (settings.highContrast) root.classList.add('ua-high-contrast');
        else root.classList.remove('ua-high-contrast');

        // Reduce Motion
        if (settings.reduceMotion) root.classList.add('ua-reduce-motion');
        else root.classList.remove('ua-reduce-motion');

        // Readable Font
        if (settings.readableFont) root.classList.add('ua-readable-font');
        else root.classList.remove('ua-readable-font');

    }, [settings]);

    const toggleOpen = () => setIsOpen(!isOpen);

    return (
        <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-4">
            {/* Panel */}
            <div className={`
                bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 
                rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 origin-bottom-left
                ${isOpen ? 'scale-100 opacity-100 mb-4 w-72' : 'scale-90 opacity-0 w-0 h-0 pointer-events-none'}
            `}>
                <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center bg-neutral-100/50 dark:bg-neutral-800/50">
                    <h3 className="font-bold flex items-center gap-2 text-sm">
                        <PersonStanding size={16} />
                        Universal Access
                    </h3>
                    <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded full transition-colors">
                        <X size={16} />
                    </button>
                </div>

                <div className="p-4 space-y-6">
                    {/* Text Size */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-neutral-500 font-medium">
                            <Type size={16} /> 文字サイズ
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {(['normal', 'large', 'xlarge'] as const).map((size) => (
                                <button
                                    key={size}
                                    onClick={() => setSettings((s: any) => ({ ...s, textSize: size }))}
                                    className={`
                                        py-2 px-1 rounded-lg text-sm border transition-all
                                        ${settings.textSize === size
                                            ? 'bg-cyan-500 text-white border-cyan-500 font-bold'
                                            : 'bg-neutral-100 dark:bg-neutral-800 border-transparent hover:border-neutral-300 dark:hover:border-neutral-600'}
                                    `}
                                >
                                    {size === 'normal' && '標準'}
                                    {size === 'large' && '大'}
                                    {size === 'xlarge' && '特大'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Toggles */}
                    <div className="space-y-3">
                        <button
                            onClick={() => setSettings((s: any) => ({ ...s, highContrast: !s.highContrast }))}
                            className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${settings.highContrast
                                ? 'bg-yellow-400 text-black border-yellow-500 font-bold'
                                : 'bg-neutral-100 dark:bg-neutral-800 border-transparent hover:border-neutral-300 dark:hover:border-neutral-600'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <Sun size={18} />
                                <span className="text-sm">ハイコントラスト</span>
                            </div>
                            {settings.highContrast && <Check size={16} />}
                        </button>

                        <button
                            onClick={() => setSettings((s: any) => ({ ...s, reduceMotion: !s.reduceMotion }))}
                            className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${settings.reduceMotion
                                ? 'bg-cyan-500 text-white border-cyan-500 font-bold'
                                : 'bg-neutral-100 dark:bg-neutral-800 border-transparent hover:border-neutral-300 dark:hover:border-neutral-600'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <ZapOff size={18} />
                                <span className="text-sm">モーション低減</span>
                            </div>
                            {settings.reduceMotion && <Check size={16} />}
                        </button>

                        <button
                            onClick={() => setSettings((s: any) => ({ ...s, readableFont: !s.readableFont }))}
                            className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${settings.readableFont
                                ? 'bg-cyan-500 text-white border-cyan-500 font-bold'
                                : 'bg-neutral-100 dark:bg-neutral-800 border-transparent hover:border-neutral-300 dark:hover:border-neutral-600'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <Type size={18} />
                                <span className="text-sm">UDフォント優先</span>
                            </div>
                            {settings.readableFont && <Check size={16} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Floating Trigger Button */}
            <button
                onClick={toggleOpen}
                className={`
                    p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95
                    ${isOpen
                        ? 'bg-neutral-900 text-white rotate-90 ring-4 ring-neutral-200 dark:ring-neutral-800'
                        : 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700'}
                `}
                aria-label="Universal Access Menu"
            >
                <PersonStanding size={24} />
            </button>
        </div>
    );
};
