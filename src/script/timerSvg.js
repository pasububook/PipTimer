/**
 * @module timerSvg
 * @description SVGタイマー描画モジュール（メイン画面用・ベクター描画でジャギーなし）
 */

const timerSvgModule = {
    /** SVG viewBox 幅 */
    W: 480,
    /** SVG viewBox 高さ */
    H: 270,
    /** 縁のストローク幅 */
    SW: 24,

    /** 矩形縁の周囲長（ラウンドコーナー rx=SW/2 を考慮） */
    get perimeter() {
        const rx = this.SW / 2;
        const topLen  = this.W - 2 * this.SW;  // 上下辺の直線部分
        const sideLen = this.H - 2 * this.SW;  // 左右辺の直線部分
        // 4コーナー分の弧 = 円1周分 = 2π*rx
        return 2 * (topLen + sideLen) + 2 * Math.PI * rx;
    },

    /**
     * SVGタイマーを更新
     * @param {number} exactRemaining - 正確な残り秒数（浮動小数点、超過時は負）
     * @param {number} initialSeconds - 初期秒数
     * @param {string|null} alarmTime  - アラーム時刻文字列（"HH:MM"）
     */
    update(exactRemaining, initialSeconds, alarmTime) {
        const svg = document.getElementById('mainSvg');
        if (!svg) return;

        const progressEl = document.getElementById('svgProgress');
        const timeEl     = document.getElementById('svgTime');
        const alarmEl    = document.getElementById('svgAlarm');

        // ---- プログレス ----
        const progress = initialSeconds > 0
            ? Math.max(0, exactRemaining / initialSeconds)
            : 0;
        progressEl.style.strokeDashoffset = (1 - progress) * this.perimeter;

        // ---- 時間テキスト（hh:mm:ss、小数点以下なし） ----
        const isNeg = exactRemaining < 0;
        const abs   = Math.floor(Math.abs(exactRemaining));
        const h = Math.floor(abs / 3600);
        const m = Math.floor((abs % 3600) / 60);
        const s = abs % 60;
        timeEl.textContent =
            (isNeg ? '-' : '') +
            [h, m, s].map(n => String(n).padStart(2, '0')).join(':');

        // ---- アラームテキスト & 縦位置調整 ----
        const hasAlarm = alarmTime != null && alarmTime !== '';
        if (hasAlarm) {
            alarmEl.textContent = alarmTime;
            alarmEl.removeAttribute('display');
            timeEl.setAttribute('y', '112');
        } else {
            alarmEl.textContent = '';
            alarmEl.setAttribute('display', 'none');
            timeEl.setAttribute('y', '135');
        }

        // ---- 状態クラス（背景色・プログレス色をCSSで制御） ----
        svg.classList.remove('state-warning', 'state-danger');
        if (isNeg || progress <= 0.25) {
            svg.classList.add('state-danger');
        } else if (progress <= 0.5) {
            svg.classList.add('state-warning');
        }
    }
};
