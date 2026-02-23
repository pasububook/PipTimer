/**
 * @module ui
 * @description UI更新モジュール
 */

/**
 * UI制御
 * @type {Object}
 */
const uiModule = {
    /**
     * DOM要素のキャッシュ
     * @type {Object}
     */
    elements: null,

    /**
     * 要素を初期化
     */
    initElements() {
        this.elements = {
            // ヘッダー
            themeToggle: document.getElementById('themeToggle'),
            fullscreenBtn: document.getElementById('fullscreenBtn'),

            // 入力セクション
            inputSection: document.getElementById('inputSection'),
            hoursInput: document.getElementById('hours'),
            minutesInput: document.getElementById('minutes'),
            secondsInput: document.getElementById('seconds'),
            startBtn: document.getElementById('startBtn'),

            // タイマーセクション
            timerSection: document.getElementById('timerSection'),
            timeDisplay: document.getElementById('timeDisplay'),
            alarmTime: document.getElementById('alarmTime'),
            endTime: document.getElementById('endTime'),
            timerStatus: document.getElementById('timerStatus'),
            pauseBtn: document.getElementById('pauseBtn'),
            stopBtn: document.getElementById('stopBtn'),
            pipBtn: document.getElementById('pipBtn'),

            // プログレスバー
            progressCircle: document.getElementById('progressCircle'),

            // キャンバス
            pipCanvas: document.getElementById('pipCanvas'),

            // メインコンテナ
            mainContainer: document.getElementById('mainContainer'),
        };
    },

    /**
     * タイマー表示セクションを表示
     */
    showTimerSection() {
        this.elements.inputSection.style.display = 'none';
        this.elements.timerSection.style.display = 'block';
    },

    /**
     * 入力セクションを表示
     */
    showInputSection() {
        this.elements.timerSection.style.display = 'none';
        this.elements.inputSection.style.display = 'block';
    },

    /**
     * 時間表示を更新
     * @param {string} time - 時間文字列（HH:MM:SS）
     */
    updateTimeDisplay(time) {
        this.elements.timeDisplay.textContent = time;
    },

    /**
     * ステータス表示を更新
     * @param {string} status - ステータステキスト
     */
    updateStatus(status) {
        this.elements.timerStatus.textContent = status;
    },

    /**
     * アラーム時刻を更新
     * @param {number} alarmHours - アラーム時間（24時間制）
     * @param {number} alarmMinutes - アラーム分
     */
    updateAlarmTime(alarmHours, alarmMinutes) {
        const hours = String(alarmHours).padStart(2, '0');
        const minutes = String(alarmMinutes).padStart(2, '0');
        this.elements.alarmTime.textContent = `アラーム: ${hours}:${minutes}`;
    },

    /**
     * 終了時刻を更新
     * @param {number} endHours - 終了時間（24時間制）
     * @param {number} endMinutes - 終了分
     */
    updateEndTime(endHours, endMinutes) {
        const hours = String(endHours).padStart(2, '0');
        const minutes = String(endMinutes).padStart(2, '0');
        this.elements.endTime.textContent = `終了: ${hours}:${minutes}`;
    },

    /**
     * プログレスバーを更新（円形）
     * @param {number} progress - 進捗率（0～1）
     * @param {string} colorClass - CSSクラス名サフィックス
     */
    updateProgressBar(progress, colorClass = '') {
        if (this.elements.progressCircle) {
            const radius = 90;
            const circumference = 2 * Math.PI * radius;
            const remaining = Math.max(0, progress);
            const offset = circumference * (1 - remaining);

            this.elements.progressCircle.style.strokeDasharray = `${circumference}`;
            this.elements.progressCircle.style.strokeDashoffset = offset;
            
            // カラークラスを更新
            this.elements.progressCircle.className = 'progress-fill' + (colorClass ? ' ' + colorClass : '');
        }
    },

    /**
     * 一時停止/再開ボタンテキストを更新
     * @param {boolean} isPaused - 一時停止状態か
     */
    updatePauseButton(isPaused) {
        this.elements.pauseBtn.textContent = isPaused ? '再開' : '一時停止';
    },

    /**
     * PiPボタンの状態を更新
     * @param {boolean} isActive - アクティブ状態か
     */
    updatePipButton(isActive) {
        this.elements.pipBtn.disabled = isActive;
        if (isActive) {
            this.elements.pipBtn.style.opacity = '0.6';
        } else {
            this.elements.pipBtn.style.opacity = '1';
        }
    }
};
