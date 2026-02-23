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
        const W = canvas.width;
        const H = canvas.height;
        const centerX = W / 2;
        const centerY = H / 2;
        const isDark = theme === 'dark';

        // 背景（超過時は赤系）
        if (remainingSeconds < 0) {
            ctx.fillStyle = isDark ? '#2a0a0a' : '#fceaea';
        } else {
            ctx.fillStyle = isDark ? '#1a1a1a' : '#f8f8f8';
        }
        ctx.fillRect(0, 0, W, H);

        // 縁の太さ（キャンバス高さの約9%）
        const bw = Math.round(H * 0.09);
        const half = bw / 2;

        // トラック：矩形の縁全体（背景色）
        ctx.strokeStyle = isDark ? '#2e2e2e' : '#dedede';
        ctx.lineWidth = bw;
        ctx.lineJoin = 'miter';
        ctx.strokeRect(half, half, W - bw, H - bw);

        // プログレスの割合
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

        // プログレス：矩形の縁を時計回りに（左上スタート）
        // 周囲長 = 上辺 + 右辺 + 下辺 + 左辺
        if (progress > 0) {
            const segW = W - bw;  // 横辺の長さ（線の中心を通るパス）
            const segH = H - bw;  // 縦辺の長さ
            const perimeter = 2 * (segW + segH);
            let remaining = progress * perimeter;

            // 時計回り: 左上 → 右上 → 右下 → 左下 → 左上
            const x0 = half, y0 = half;
            const x1 = W - half, y1 = H - half;

            ctx.strokeStyle = progressColor;
            ctx.lineWidth = bw;
            ctx.lineJoin = 'miter';
            ctx.lineCap = 'butt';
            ctx.beginPath();
            ctx.moveTo(x0, y0);

            // 上辺: 左→右
            const top = Math.min(remaining, segW);
            ctx.lineTo(x0 + top, y0);
            remaining -= top;

            // 右辺: 上→下
            if (remaining > 0) {
                const right = Math.min(remaining, segH);
                ctx.lineTo(x1, y0 + right);
                remaining -= right;
            }

            // 下辺: 右→左
            if (remaining > 0) {
                const bottom = Math.min(remaining, segW);
                ctx.lineTo(x1 - bottom, y1);
                remaining -= bottom;
            }

            // 左辺: 下→上
            if (remaining > 0) {
                const left = Math.min(remaining, segH);
                ctx.lineTo(x0, y1 - left);
            }

            ctx.stroke();
        }

        // ---- 中央テキスト ----
        const FONT = "'Noto Sans JP', sans-serif";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const hasAlarm = alarmTime != null;
        const vertOffset = hasAlarm ? H * 0.075 : 0;

        // hh:mm:ss（残り時間）
        const remainingText = (remainingSeconds < 0 ? '-' : '') + this.formatTime(Math.abs(remainingSeconds));
        const timeFontSize = Math.round(H * 0.19);
        ctx.font = `700 ${timeFontSize}px ${FONT}`;
        ctx.fillStyle = isDark ? '#ffffff' : '#1a1a1a';
        ctx.fillText(remainingText, centerX, centerY - vertOffset);

        // hh:mm（アラーム時刻）
        if (hasAlarm) {
            const alarmFontSize = Math.round(H * 0.09);
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
