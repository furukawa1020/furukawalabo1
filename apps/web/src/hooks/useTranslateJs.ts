// translate.js (xnx3/translate) integration
// Loads the script dynamically so we know exactly when it's ready

declare global {
    interface Window {
        translate: any;
    }
}

const LANG_KEY = 'translatejs_language';
const CDN_URL  = 'https://res.zvo.cn/translate/translate.js';

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

let _initialized = false;

function _setup(t: any) {
    try {
        if (t.setUseVersion2)             t.setUseVersion2();
        if (t.language?.setDefaultTo)     t.language.setDefaultTo('japanese');
        if (t.listener?.start)            t.listener.start();

        const saved = localStorage.getItem(LANG_KEY);
        if (saved && saved !== 'japanese') {
            t.use(saved);
            setTimeout(() => { try { t.execute(); } catch (_) {} }, 800);
        }
        _initialized = true;
        console.log('[translate.js] ready, lang=', saved || 'japanese');
    } catch (e) {
        console.warn('[translate.js] setup error:', e);
    }
}

/** Load translate.js dynamically and initialize */
export function initTranslateJs() {
    if (_initialized) return;

    // Already loaded (e.g. hot-reload)
    if (window.translate) {
        _setup(window.translate);
        return;
    }

    // Dynamically inject the <script> tag
    const script = document.createElement('script');
    script.src = CDN_URL;
    script.async = true;
    script.onload = () => {
        if (window.translate) {
            _setup(window.translate);
        } else {
            console.warn('[translate.js] loaded but window.translate not found');
        }
    };
    script.onerror = () => {
        console.warn('[translate.js] failed to load from CDN:', CDN_URL);
    };
    document.head.appendChild(script);
}

/** Re-execute translation after route change */
export function reExecuteTranslation() {
    const lang = localStorage.getItem(LANG_KEY) || 'japanese';
    if (lang === 'japanese') return;
    const t = window.translate;
    if (!t) return;
    try {
        setTimeout(() => { t.execute(); }, 500);
    } catch (e) {
        console.warn('[translate.js] re-execute error:', e);
    }
}

/** Switch language */
export function switchLanguage(langCode: string) {
    if (langCode === 'japanese') {
        // Reset: clear key and reload so all original text is restored
        localStorage.removeItem(LANG_KEY);
        window.location.reload();
        return;
    }

    localStorage.setItem(LANG_KEY, langCode);

    const t = window.translate;
    if (!t) {
        // translate.js not loaded yet → reload, it will restore from localStorage
        window.location.reload();
        return;
    }

    try {
        t.use(langCode);
        t.execute();
    } catch (e) {
        console.warn('[translate.js] switch error:', e);
    }
}

/** Get currently selected language code */
export function getCurrentLanguage(): string {
    return localStorage.getItem(LANG_KEY) || 'japanese';
}
