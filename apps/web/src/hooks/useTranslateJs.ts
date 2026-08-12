// translate.js (xnx3/translate) integration hook
// Handles: initialization, language switching, SPA route-change re-execution

declare global {
    interface Window {
        translate: any;
    }
}

const LANG_KEY = 'translatejs_language';

export const SUPPORTED_LANGUAGES = [
    { code: 'japanese',             label: '日本語',    flag: '🇯🇵', short: 'JA' },
    { code: 'english',              label: 'English',   flag: '🇺🇸', short: 'EN' },
    { code: 'chinese_simplified',   label: '中文(简)',   flag: '🇨🇳', short: 'ZH' },
    { code: 'chinese_traditional',  label: '中文(繁)',   flag: '🇹🇼', short: 'ZT' },
    { code: 'korean',               label: '한국어',    flag: '🇰🇷', short: 'KO' },
    { code: 'french',               label: 'Français',  flag: '🇫🇷', short: 'FR' },
    { code: 'spanish',              label: 'Español',   flag: '🇪🇸', short: 'ES' },
    { code: 'german',               label: 'Deutsch',   flag: '🇩🇪', short: 'DE' },
    { code: 'portuguese',           label: 'Português', flag: '🇧🇷', short: 'PT' },
    { code: 'arabic',               label: 'العربية',   flag: '🇸🇦', short: 'AR' },
];

/** Initialize translate.js once after React mounts */
export function initTranslateJs() {
    const t = window.translate;
    if (!t) return;

    try {
        // Use v2 API (better accuracy)
        if (t.setUseVersion2) t.setUseVersion2();
        // Tell the library the page's native language is Japanese
        if (t.language?.setDefaultTo) t.language.setDefaultTo('japanese');
        // SPA: auto-re-translate when DOM mutates
        if (t.listener?.start) t.listener.start();

        // Restore persisted language on page load
        const saved = localStorage.getItem(LANG_KEY);
        if (saved && saved !== 'japanese') {
            t.use(saved);
            setTimeout(() => t.execute(), 600);
        }
    } catch (e) {
        console.warn('[translate.js] init error:', e);
    }
}

/** Re-execute translation (call after route change / new DOM) */
export function reExecuteTranslation() {
    const t = window.translate;
    const lang = localStorage.getItem(LANG_KEY) || 'japanese';
    if (!t || lang === 'japanese') return;
    try {
        setTimeout(() => t.execute(), 400);
    } catch (e) {
        console.warn('[translate.js] execute error:', e);
    }
}

/** Switch to a language */
export function switchLanguage(langCode: string) {
    const t = window.translate;
    if (!t) return;

    try {
        localStorage.setItem(LANG_KEY, langCode);
        if (langCode === 'japanese') {
            // Reset to original Japanese (reload is cleanest for translate.js)
            localStorage.removeItem(LANG_KEY);
            window.location.reload();
        } else {
            t.use(langCode);
            t.execute();
        }
    } catch (e) {
        console.warn('[translate.js] switch error:', e);
    }
}

/** Get currently active language code */
export function getCurrentLanguage(): string {
    return localStorage.getItem(LANG_KEY) || 'japanese';
}
