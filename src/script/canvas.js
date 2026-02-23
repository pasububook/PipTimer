/**
 * @module canvas
 * @description キャンバス描画モジュール
 */

/**
 * キャンバス描画制御
 * @type {Object}
 */
const canvasModule = {
    /**
     * PiP用キャンバスにタイマーを描画
     * @param {HTMLCanvasElement} canvas - キャンバス要素
     * @param {number} remainingSeconds - 残り秒数
     * @param {number} initialSeconds - 初期秒数
     * @param {boolean} isPaused - 一時停止状態か
     * @param {boolean} isRunning - 実行中か
     * @param {string} theme - テーマ（light/dark）
     * @param {string|null} alarmTime - アラーム時刻文字列（例: "14:30"）
     */
    drawTimer(canvas, remainingSeconds, initialSeconds, isPaused, isRunning, theme, alarmTime) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const isDark = theme === 'dark';

        // 背景
        ctx.fillStyle = isDark ? '#1a1a1a' : '#f8f8f8';
        ctx.fillRect(0, 0, width, height);

        // リング幅とプログレス円の半径
        const ringWidth = Math.round(height * 0.055);
        const radius = Math.min(width, height) / 2 - ringWidth / 2 - 2;

        // トラック（背景リング）
        ctx.strokeStyle = isDark ? '#2e2e2e' : '#e0e0e0';
        ctx.lineWidth = ringWidth;
        ctx.lineCap = 'butt';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.stroke();

        // プログレスアーク（残り時間の割合、時計回り）
        const progress = remainingSeconds >= 0
            ? remainingSeconds / initialSeconds
            : 0;

        let progressColor = '#4a9eff';
        if (remainingSeconds < 0) {
            progressColor = '#e05555';
        } else if (remainingSeconds <= initialSeconds * 0.25) {
            progressColor = '#e05555';
        } else if (remainingSeconds <= initialSeconds * 0.5) {
            progressColor = '#f0a030';
        }

        if (progress > 0) {
            ctx.strokeStyle = progressColor;
            ctx.lineWidth = ringWidth;
            ctx.lineCap = 'butt';
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * progress);
            ctx.stroke();
        }

        // ---- 中央テキスト ----
        const FONT = "'Noto Sans JP', sans-serif";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const hasAlarm = alarmTime != null;
        const vertOffset = hasAlarm ? height * 0.075 : 0;

        // hh:mm:ss（残り時間）
        const remainingText = (remainingSeconds < 0 ? '-' : '') + this.formatTime(Math.abs(remainingSeconds));
        const timeFontSize = Math.round(height * 0.19);
        ctx.font = `700 ${timeFontSize}px ${FONT}`;
        ctx.fillStyle = isDark ? '#ffffff' : '#1a1a1a';
        ctx.fillText(remainingText, centerX, centerY - vertOffset);

        // hh:mm（アラーム時刻）
        if (hasAlarm) {
            const alarmFontSize = Math.round(height * 0.09);
            ctx.font = `400 ${alarmFontSize}px ${FONT}`;
            ctx.fillStyle = isDark ? '#999999' : '#777777';
            ctx.fillText(alarmTime, centerX, centerY + vertOffset * 1.8);
        }
    },

    /**
     * 秒数をMM:SS形式にフォーマット
     * @param {number} totalSeconds - 秒数
     * @returns {string} フォーマット済み時間
     */
    formatTime(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
};
