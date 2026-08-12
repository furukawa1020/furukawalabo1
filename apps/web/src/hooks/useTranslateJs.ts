// translate.js (xnx3/translate v4) integration
// Correct API: translate.changeLanguage() — NOT translate.use()

declare global {
    interface Window {
        translate: any;
    }
}

const LANG_KEY = 'translatejs_language';

export const SUPPORTED_LANGUAGES = [
    { code: 'japanese',            label: '日本語',    flag: '🇯🇵', short: 'JA' },
    { code: 'english',             label: 'English',   flag: '🇺🇸', short: 'EN' },
    { code: 'chinese_simplified',  label: '中文(简)',   flag: '🇨🇳', short: 'ZH' },
    { code: 'chinese_traditional', label: '中文(繁)',   flag: '🇹🇼', short: 'ZT' },
    { code: 'korean',              label: '한국어',    flag: '🇰🇷', short: 'KO' },
    { code: 'french',              label: 'Français',  flag: '🇫🇷', short: 'FR' },
    { code: 'spanish',             label: 'Español',   flag: '🇪🇸', short: 'ES' },
    { code: 'german',              label: 'Deutsch',   flag: '🇩🇪', short: 'DE' },
    { code: 'portuguese',          label: 'Português', flag: '🇧🇷', short: 'PT' },
    { code: 'arabic',              label: 'العربية',   flag: '🇸🇦', short: 'AR' },
];

/** Call after React has rendered the initial DOM */
export function initTranslateJs() {
    const t = window.translate;
    if (!t) {
        console.warn('[translate.js] not found on window — was /translate.js loaded?');
        return;
    }
    // Execute translation now that React DOM is populated
    try {
        t.execute();
        console.log('[translate.js] execute() called on mount');
    } catch (e) {
        console.warn('[translate.js] execute error:', e);
    }
}

/** Call after each React route change */
export function reExecuteTranslation() {
    const lang = localStorage.getItem(LANG_KEY) || 'japanese';
    if (lang === 'japanese') return;
    const t = window.translate;
    if (!t) return;
    try {
        // Small delay so React has finished rendering the new page
        setTimeout(() => { t.execute(); }, 600);
    } catch (e) {
        console.warn('[translate.js] re-execute error:', e);
    }
}

/** Switch to a language */
export function switchLanguage(langCode: string) {
    if (langCode === 'japanese') {
        // Reload page with no saved language to restore original Japanese
        localStorage.removeItem(LANG_KEY);
        window.location.reload();
        return;
    }

    localStorage.setItem(LANG_KEY, langCode);

    const t = window.translate;
    if (!t) {
        // translate.js not ready — reload will pick up from localStorage
        window.location.reload();
        return;
    }

    try {
        // ✅ Correct API: translate.changeLanguage() not translate.use()
        t.changeLanguage(langCode);
        console.log('[translate.js] changeLanguage ->', langCode);
    } catch (e) {
        console.warn('[translate.js] changeLanguage error:', e);
    }
}

/** Get currently selected language code */
export function getCurrentLanguage(): string {
    return localStorage.getItem(LANG_KEY) || 'japanese';
}
