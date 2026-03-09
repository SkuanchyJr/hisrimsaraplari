/**
 * Casa Hısrım — Internationalization System
 * Loads translations from /i18n/*.json and applies them to [data-i18n] elements
 */

const I18n = (() => {
    const SUPPORTED = ['en', 'tr', 'es'];
    const DEFAULT_LANG = 'en';
    const STORAGE_KEY = 'hisrim-lang';
    const LANG_LABELS = { en: 'English', tr: 'Türkçe', es: 'Español' };

    let currentLang = DEFAULT_LANG;
    let translations = {};

    // Detect base path (works from / or /pages/)
    function getBasePath() {
        const path = window.location.pathname;
        if (path.includes('/pages/')) {
            return '../';
        }
        return './';
    }

    async function loadTranslation(lang) {
        try {
            const base = getBasePath();
            const res = await fetch(`${base}i18n/${lang}.json`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (e) {
            console.warn(`[i18n] Failed to load ${lang} translations:`, e);
            return null;
        }
    }

    function flattenObj(obj, prefix = '') {
        const result = {};
        for (const key in obj) {
            const path = prefix ? `${prefix}.${key}` : key;
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                Object.assign(result, flattenObj(obj[key], path));
            } else {
                result[path] = obj[key];
            }
        }
        return result;
    }

    function applyTranslations() {
        const flat = flattenObj(translations);
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (flat[key] !== undefined) {
                // Support HTML content
                if (el.hasAttribute('data-i18n-html')) {
                    el.innerHTML = flat[key];
                } else {
                    el.textContent = flat[key];
                }
            }
        });

        // Update html lang attribute
        document.documentElement.lang = currentLang;

        // Update active lang indicator
        document.querySelectorAll('[data-lang-btn]').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-lang-btn') === currentLang);
        });

        // Update the current lang display
        const currentDisplay = document.querySelector('.lang-current-text');
        if (currentDisplay) {
            currentDisplay.textContent = currentLang.toUpperCase();
        }
    }

    async function setLanguage(lang) {
        if (!SUPPORTED.includes(lang)) lang = DEFAULT_LANG;
        currentLang = lang;
        localStorage.setItem(STORAGE_KEY, lang);

        const data = await loadTranslation(lang);
        if (data) {
            translations = data;
            applyTranslations();
        }
    }

    function init() {
        // Determine initial language
        const stored = localStorage.getItem(STORAGE_KEY);
        const browserLang = navigator.language?.slice(0, 2);
        const initial = stored || (SUPPORTED.includes(browserLang) ? browserLang : DEFAULT_LANG);

        // Bind dropdown clicks
        document.querySelectorAll('[data-lang-btn]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const lang = btn.getAttribute('data-lang-btn');
                setLanguage(lang);
                // Close dropdown
                const selector = document.querySelector('.lang-selector');
                if (selector) selector.classList.remove('open');
            });
        });

        // Toggle dropdown
        const selector = document.querySelector('.lang-selector');
        const currentBtn = document.querySelector('.lang-current');
        if (currentBtn && selector) {
            currentBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                selector.classList.toggle('open');
            });
            document.addEventListener('click', () => {
                selector.classList.remove('open');
            });
        }

        setLanguage(initial);
    }

    return { init, setLanguage, SUPPORTED, LANG_LABELS };
})();

document.addEventListener('DOMContentLoaded', () => {
    I18n.init();
});
