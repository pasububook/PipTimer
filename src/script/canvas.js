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

        // 背景（超過時は赤系、警告時は黄系、通常はデフォルト）
        if (remainingSeconds < 0 || remainingSeconds <= initialSeconds * 0.25) {
            ctx.fillStyle = isDark ? '#2a0a0a' : '#fceaea';
        } else if (remainingSeconds <= initialSeconds * 0.5) {
            ctx.fillStyle = isDark ? '#282000' : '#fffbe6';
        } else {
            ctx.fillStyle = isDark ? '#1a1a1a' : '#f8f8f8';
        }
        ctx.fillRect(0, 0, W, H);

        // 縁の太さ（キャンバス高さの約9%）
        const bw   = Math.round(H * 0.09);
        const half = bw / 2;
        const rx   = half;  // コーナー半径 = ストローク幅の半分（完全な半円コーナー）

        // セグメント長計算
        const topLen  = W - 2 * bw;         // 上下辺の直線部分
        const sideLen = H - 2 * bw;         // 左右辺の直線部分
        const arcLen  = Math.PI * rx / 2;   // 1コーナー分の弧長
        const perimeter = 2 * (topLen + sideLen) + 2 * Math.PI * rx;

        // トラック：ラウンドコーナー矩形（全周）
        ctx.strokeStyle = isDark ? '#2e2e2e' : '#dedede';
        ctx.lineWidth = bw;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'butt';
        ctx.beginPath();
        this._roundRectPath(ctx, half, half, W - bw, H - bw, rx);
        ctx.stroke();

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

        // プログレス：進捗分だけラウンドコーナー矩形の縁を辿る
        if (progress > 0) {
            ctx.strokeStyle = progressColor;
            ctx.lineWidth = bw;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'butt';
            ctx.beginPath();
            this._progressPath(ctx, half, half, W - bw, H - bw, rx, progress, perimeter, topLen, sideLen, arcLen);
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
     * ラウンドコーナー矩形の閉じたパスを描く（トラック用）
     */
    _roundRectPath(ctx, x, y, w, h, r) {
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.arcTo(x + w, y,     x + w, y + r,     r);
        ctx.lineTo(x + w, y + h - r);
        ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
        ctx.lineTo(x + r, y + h);
        ctx.arcTo(x,     y + h, x,     y + h - r, r);
        ctx.lineTo(x,     y + r);
        ctx.arcTo(x,     y,     x + r, y,         r);
        ctx.closePath();
    },

    /**
     * ラウンドコーナー矩形を progress 割合分だけ時計回りに描く（プログレス用）
     * 開始点: 左上コーナーの右端 (x+r, y)
     */
    _progressPath(ctx, x, y, w, h, r, progress, perimeter, topLen, sideLen, arcLen) {
        let rem = progress * perimeter;
        ctx.moveTo(x + r, y);

        // ① 上辺（左→右）
        { const d = Math.min(rem, topLen); ctx.lineTo(x + r + d, y); rem -= d; if (rem <= 0) return; }
        // ② 右上コーナー  (-π/2 → 0)
        { const d = Math.min(rem, arcLen); ctx.arc(x + w - r, y + r, r, -Math.PI / 2, -Math.PI / 2 + d / r); rem -= d; if (rem <= 0) return; }
        // ③ 右辺（上→下）
        { const d = Math.min(rem, sideLen); ctx.lineTo(x + w, y + r + d); rem -= d; if (rem <= 0) return; }
        // ④ 右下コーナー  (0 → π/2)
        { const d = Math.min(rem, arcLen); ctx.arc(x + w - r, y + h - r, r, 0, d / r); rem -= d; if (rem <= 0) return; }
        // ⑤ 下辺（右→左）
        { const d = Math.min(rem, topLen); ctx.lineTo(x + w - r - d, y + h); rem -= d; if (rem <= 0) return; }
        // ⑥ 左下コーナー  (π/2 → π)
        { const d = Math.min(rem, arcLen); ctx.arc(x + r, y + h - r, r, Math.PI / 2, Math.PI / 2 + d / r); rem -= d; if (rem <= 0) return; }
        // ⑦ 左辺（下→上）
        { const d = Math.min(rem, sideLen); ctx.lineTo(x, y + h - r - d); rem -= d; if (rem <= 0) return; }
        // ⑧ 左上コーナー  (π → 3π/2)
        { const d = Math.min(rem, arcLen); ctx.arc(x + r, y + r, r, Math.PI, Math.PI + d / r); }
    },

    /**
     * 秒数を hh:mm:ss 形式にフォーマット
     * @param {number} totalSeconds - 秒数
     * @returns {string} フォーマット済み時間
     */
    formatTime(totalSeconds) {
        const abs = Math.floor(Math.abs(totalSeconds));
        const hours = Math.floor(abs / 3600);
        const minutes = Math.floor((abs % 3600) / 60);
        const seconds = abs % 60;

        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
};
