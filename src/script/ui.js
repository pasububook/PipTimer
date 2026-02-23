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

            // 入力セクション
            inputSection: document.getElementById('inputSection'),
            hoursInput: document.getElementById('hours'),
            minutesInput: document.getElementById('minutes'),
            secondsInput: document.getElementById('seconds'),
            startBtn: document.getElementById('startBtn'),

            // タイマーセクション
            timerSection: document.getElementById('timerSection'),
            timeDisplay: document.getElementById('timeDisplay'),
            timerStatus: document.getElementById('timerStatus'),
            pauseBtn: document.getElementById('pauseBtn'),
            stopBtn: document.getElementById('stopBtn'),
            pipBtn: document.getElementById('pipBtn'),

            // プログレスバー
            progressBar: document.getElementById('progressBar'),

            // キャンバス
            pipCanvas: document.getElementById('pipCanvas'),
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
     * プログレスバーを更新
     * @param {number} progress - 進捗率（0～1）
     * @param {string} colorClass - CSSクラス名サフィックス
     */
    updateProgressBar(progress, colorClass = '') {
        if (this.elements.progressBar) {
            const percentage = Math.max(0, progress * 100);
            this.elements.progressBar.style.width = percentage + '%';
            
            // カラークラスを更新
            this.elements.progressBar.className = 'progress-bar-fill' + (colorClass ? ' ' + colorClass : '');
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
        if (isActive) {
            this.elements.pipBtn.textContent = 'PiP: 有効';
            this.elements.pipBtn.disabled = true;
        } else {
            this.elements.pipBtn.textContent = 'PiP';
            this.elements.pipBtn.disabled = false;
        }
    }
};
