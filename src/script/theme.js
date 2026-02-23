/**
 * @module theme
 * @description テーマ管理モジュール（ライト/ダークモード）
 */

/**
 * テーマ設定
 * @type {Object}
 */
const themeModule = {
    /**
     * 現在のテーマを取得
     * @returns {string} 'light' または 'dark'
     */
    getCurrentTheme() {
        // 1. ユーザーが明示的に設定した値を優先
        const stored = localStorage.getItem('theme');
        if (stored === 'light' || stored === 'dark') return stored;
        // 2. HTMLのdata-theme属性
        const attr = document.documentElement.getAttribute('data-theme');
        if (attr === 'dark') return 'dark';
        // 3. システムのカラースキーム設定
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    },

    applyTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        localStorage.setItem('theme', theme);
    },

    toggle() {
        const current = this.getCurrentTheme();
        const next = current === 'light' ? 'dark' : 'light';
        this.applyTheme(next);
        return next;
    }
};
