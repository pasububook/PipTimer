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
            mainSvg: document.getElementById('mainSvg'),
            pauseBtn: document.getElementById('pauseBtn'),
            stopBtn: document.getElementById('stopBtn'),
            pipBtn: document.getElementById('pipBtn'),

            // PiP用キャンバス
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
        this.elements.timerSection.style.display = 'flex';
    },

    /**
     * 入力セクションを表示
     */
    showInputSection() {
        this.elements.timerSection.style.display = 'none';
        this.elements.inputSection.style.display = 'block';
    },

    /**
     * 時間表示を更新（キャンバスが担当するためno-op）
     * @param {string} time
     */
    updateTimeDisplay(time) {},

    /**
     * ステータス表示を更新（キャンバスが担当するためno-op）
     * @param {string} status
     */
    updateStatus(status) {},

    /**
     * アラーム時刻を更新（キャンバスが担当するためno-op）
     * @param {number} alarmHours
     * @param {number} alarmMinutes
     */
    updateAlarmTime(alarmHours, alarmMinutes) {},

    /**
     * 終了時刻を更新（キャンバスが担当するためno-op）
     * @param {number} endHours
     * @param {number} endMinutes
     */
    updateEndTime(endHours, endMinutes) {},

    /**
     * プログレスバーを更新（キャンバスが担当するためno-op）
     * @param {number} progress
     * @param {string} colorClass
     */
    updateProgressBar(progress, colorClass = '') {},

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
