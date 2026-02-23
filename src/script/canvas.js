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
     */
    drawTimer(canvas, remainingSeconds, initialSeconds, isPaused, isRunning, theme) {
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 150;

        // 背景
        const isDark = theme === 'dark';
        ctx.fillStyle = isDark ? '#1e1e1e' : '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 外枠（円）
        ctx.strokeStyle = isDark ? '#666666' : '#cccccc';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.stroke();

        // プログレスバー（円弧）
        const progress = remainingSeconds >= 0
            ? remainingSeconds / initialSeconds
            : 0;

        // 色決定
        let progressColor = '#007bff'; // 青
        if (remainingSeconds < 0) {
            progressColor = '#dc3545'; // 赤（超過）
        } else if (remainingSeconds <= initialSeconds * 0.25) {
            progressColor = '#dc3545'; // 赤
        } else if (remainingSeconds <= initialSeconds * 0.5) {
            progressColor = '#ffc107'; // 黄
        }

        ctx.strokeStyle = progressColor;
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * progress);
        ctx.stroke();

        // 時間表示
        const time = this.formatTime(Math.abs(remainingSeconds));
        ctx.fillStyle = isDark ? '#ffffff' : '#000000';
        ctx.font = 'bold 56px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(time, centerX, centerY - 30);

        // ステータス表示
        ctx.font = '18px sans-serif';
        ctx.fillStyle = isDark ? '#bbbbbb' : '#555555';
        let statusText = '';
        if (remainingSeconds < 0) {
            statusText = '超過: ' + this.formatTime(Math.abs(remainingSeconds));
        } else if (isPaused) {
            statusText = '一時停止';
        } else if (isRunning) {
            statusText = '実行中';
        }
        ctx.fillText(statusText, centerX, centerY + 50);
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
