/**
 * @module timer
 * @description タイマーロジックモジュール
 */

/**
 * タイマーの状態と制御
 * @type {Object}
 */
const timerModule = {
    /**
     * タイマー状態
     * @type {Object}
     */
    state: {
        isRunning: false,
        isPaused: false,
        totalSeconds: 60,
        remainingSeconds: 60,
        initialSeconds: 60,
        intervalId: null,
        animationId: null,
    },

    /**
     * 入力された秒数を取得
     * @param {HTMLInputElement} hoursInput - 時間入力
     * @param {HTMLInputElement} minutesInput - 分入力
     * @param {HTMLInputElement} secondsInput - 秒入力
     * @returns {number} 合計秒数
     */
    getInputSeconds(hoursInput, minutesInput, secondsInput) {
        const hours = parseInt(hoursInput.value) || 0;
        const minutes = parseInt(minutesInput.value) || 0;
        const seconds = parseInt(secondsInput.value) || 0;
        return hours * 3600 + minutes * 60 + seconds;
    },

    /**
     * 入力値を検証・正規化
     * @param {HTMLInputElement} hoursInput - 時間入力
     * @param {HTMLInputElement} minutesInput - 分入力
     * @param {HTMLInputElement} secondsInput - 秒入力
     */
    validateInput(hoursInput, minutesInput, secondsInput) {
        const hours = Math.max(0, Math.min(23, parseInt(hoursInput.value) || 0));
        const minutes = Math.max(0, Math.min(59, parseInt(minutesInput.value) || 0));
        const seconds = Math.max(0, Math.min(59, parseInt(secondsInput.value) || 0));

        hoursInput.value = hours;
        minutesInput.value = minutes;
        secondsInput.value = seconds;
    },

    /**
     * タイマーを開始
     * @param {number} seconds - 秒数
     * @param {Function} onUpdate - 更新時のコールバック
     * @param {Function} onComplete - 完了時のコールバック
     */
    start(seconds, onUpdate, onComplete) {
        if (seconds <= 0) {
            throw new Error('有効な時間を設定してください');
        }

        this.state.totalSeconds = seconds;
        this.state.initialSeconds = seconds;
        this.state.remainingSeconds = seconds;
        this.state.isRunning = true;
        this.state.isPaused = false;

        this.state.intervalId = setInterval(() => {
            if (!this.state.isPaused && this.state.isRunning) {
                this.state.remainingSeconds--;

                if (onUpdate) {
                    onUpdate(this.state.remainingSeconds);
                }

                if (this.state.remainingSeconds === 0 && onComplete) {
                    onComplete();
                }
            }
        }, 1000);
    },

    /**
     * タイマーを一時停止/再開
     * @returns {boolean} 一時停止状態なら true
     */
    togglePause() {
        if (!this.state.isRunning) return false;
        this.state.isPaused = !this.state.isPaused;
        return this.state.isPaused;
    },

    /**
     * タイマーを停止
     */
    stop() {
        this.state.isRunning = false;
        this.state.isPaused = false;

        if (this.state.intervalId) {
            clearInterval(this.state.intervalId);
            this.state.intervalId = null;
        }

        if (this.state.animationId) {
            cancelAnimationFrame(this.state.animationId);
            this.state.animationId = null;
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
    },

    /**
     * 進捗率を取得（0～1）
     * @returns {number} 進捗率
     */
    getProgress() {
        if (this.state.initialSeconds <= 0) return 0;
        return Math.max(0, this.state.remainingSeconds / this.state.initialSeconds);
    },

    /**
     * カウントアップに切り替え
     */
    switchToCountUp() {
        this.state.isRunning = true;
        this.state.isPaused = false;
    }
};
