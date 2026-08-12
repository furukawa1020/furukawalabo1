import { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';
import {
    SUPPORTED_LANGUAGES,
    switchLanguage,
    getCurrentLanguage,
} from '../hooks/useTranslateJs';

export const LanguageSwitcher = () => {
    const [currentLang, setCurrentLang] = useState(getCurrentLanguage());
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const currentInfo = SUPPORTED_LANGUAGES.find(l => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

    // Close on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleSelect = (langCode: string) => {
        setCurrentLang(langCode);
        setOpen(false);
        switchLanguage(langCode);
    };

    return (
        // translate="no" prevents translate.js from translating the switcher itself
        <div ref={ref} className="relative" translate="no">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium
                           hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title="言語切り替え / Change Language"
                aria-expanded={open}
            >
                <Globe size={16} className="shrink-0" />
                <span>{currentInfo.flag}</span>
                <span className="hidden sm:inline">{currentInfo.short}</span>
                <svg
                    className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`}
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                >
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </button>

            {open && (
                <div
                    className="absolute right-0 top-full mt-2 z-[100]
                               bg-white dark:bg-neutral-900
                               border border-neutral-200 dark:border-neutral-700
                               rounded-xl shadow-2xl overflow-hidden
                               min-w-[170px] py-1"
                    style={{ backdropFilter: 'blur(10px)' }}
                >
                    <div className="px-3 py-1.5 text-xs text-neutral-500 dark:text-neutral-400 font-semibold border-b border-neutral-100 dark:border-neutral-800">
                        🌐 言語 / Language
                    </div>
                    {SUPPORTED_LANGUAGES.map(lang => (
                        <button
                            key={lang.code}
                            onClick={() => handleSelect(lang.code)}
                            className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2.5
                                       transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800
                                       ${currentLang === lang.code
                                           ? 'text-cyan-500 font-bold bg-cyan-50 dark:bg-cyan-950'
                                           : 'text-neutral-700 dark:text-neutral-300'
                                       }`}
                        >
                            <span className="text-base">{lang.flag}</span>
                            <span>{lang.label}</span>
                            {currentLang === lang.code && (
                                <svg className="ml-auto w-3.5 h-3.5 text-cyan-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <path d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
