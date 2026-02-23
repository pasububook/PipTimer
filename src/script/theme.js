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
        return localStorage.getItem('theme') || 'light';
    },

    /**
     * テーマを適用
     * @param {string} theme - 'light' または 'dark'
     */
    applyTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        localStorage.setItem('theme', theme);
    },

    /**
     * テーマを切り替え
     * @returns {string} 切り替え後のテーマ
     */
    toggle() {
        const current = this.getCurrentTheme();
        const next = current === 'light' ? 'dark' : 'light';
        this.applyTheme(next);
        return next;
    }
};
