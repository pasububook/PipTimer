/**
 * @module app
 * @description PipTimer メインアプリケーション
 */

/**
 * アプリケーション制御
 * @type {Object}
 */
const app = {
    /**
     * アラーム時刻文字列（例: "14:30"）
     * @type {string|null}
     */
    alarmTime: null,

    /**
     * アプリケーションを初期化
     */
    init() {
        // UI要素を初期化
        uiModule.initElements();

        // テーマを適用
        const currentTheme = themeModule.getCurrentTheme();
        themeModule.applyTheme(currentTheme);

        // イベントリスナーをセットアップ
        this.setupEventListeners();
    },

    /**
     * イベントリスナーをセットアップ
     */
    setupEventListeners() {
        // テーマ切り替え
        uiModule.elements.themeToggle.addEventListener('click', () => {
            themeModule.toggle();
        });

        // 全画面表示
        uiModule.elements.fullscreenBtn.addEventListener('click', () => {
            this.toggleFullscreen();
        });

        // タイマー制御
        uiModule.elements.startBtn.addEventListener('click', () => this.startTimer());
        uiModule.elements.pauseBtn.addEventListener('click', () => this.pauseTimer());
        uiModule.elements.stopBtn.addEventListener('click', () => this.stopTimer());
        uiModule.elements.pipBtn.addEventListener('click', async () => await this.launchPip());

        // 入力フィールド検証
        [uiModule.elements.hoursInput, uiModule.elements.minutesInput, uiModule.elements.secondsInput]
            .forEach(input => {
                input.addEventListener('change', () => this.validateInput());
            });
    },

    /**
     * 入力値を検証
     */
    validateInput() {
        timerModule.validateInput(
            uiModule.elements.hoursInput,
            uiModule.elements.minutesInput,
            uiModule.elements.secondsInput
        );
    },

    /**
     * タイマーを開始
     */
    startTimer() {
        const seconds = timerModule.getInputSeconds(
            uiModule.elements.hoursInput,
            uiModule.elements.minutesInput,
            uiModule.elements.secondsInput
        );

        if (seconds <= 0) {
            alert('有効な時間を設定してください');
            return;
        }

        try {
            uiModule.showTimerSection();
            uiModule.updateStatus('実行中');
            uiModule.updatePauseButton(false);

            // アラーム時刻・終了時刻を計算して表示
            const now = new Date();
            const alarmDate = new Date(now.getTime() + seconds * 1000);
            const hh = String(alarmDate.getHours()).padStart(2, '0');
            const mm = String(alarmDate.getMinutes()).padStart(2, '0');
            this.alarmTime = `${hh}:${mm}`;
            uiModule.updateAlarmTime(alarmDate.getHours(), alarmDate.getMinutes());
            uiModule.updateEndTime(alarmDate.getHours(), alarmDate.getMinutes());

            timerModule.start(seconds, (remaining) => {
                // 毎秒更新
                uiModule.updateTimeDisplay(timerModule.formatTime(remaining));
                this.updateProgressBar();
                this.updateBackgroundColor();
            }, () => {
                // 完了時の処理
                this.playCompletionSound();
                timerModule.switchToCountUp();
                uiModule.updateStatus('超過中');
                this.updateBackgroundColor();
            });

            // プログレスバーアニメーション開始
            this.startProgressAnimation();

        } catch (error) {
            alert(error.message);
        }
    },

    /**
     * タイマーを一時停止/再開
     */
    pauseTimer() {
        const isPaused = timerModule.togglePause();
        uiModule.updatePauseButton(isPaused);
        uiModule.updateStatus(isPaused ? '一時停止中' : '実行中');
    },

    /**
     * タイマーを停止
     */
    stopTimer() {
        timerModule.stop();
        pipModule.close();
        uiModule.updatePipButton(false);
        this.alarmTime = null;
        
        // 背景色をリセット
        uiModule.elements.mainContainer.style.backgroundColor = '';
        
        uiModule.showInputSection();
    },

    /**
     * プログレスバーアニメーション開始
     */
    startProgressAnimation() {
        const animate = () => {
            if (timerModule.state.isRunning) {
                this.updateProgressBar();
                timerModule.state.animationId = requestAnimationFrame(animate);
            }
        };
        timerModule.state.animationId = requestAnimationFrame(animate);
    },

    /**
     * プログレスバーを更新
     */
    updateProgressBar() {
        const progress = timerModule.getProgress();
        let colorClass = '';

        const remaining = timerModule.state.remainingSeconds;
        const initial = timerModule.state.initialSeconds;

        if (remaining < 0) {
            colorClass = 'danger';
        } else if (remaining <= initial * 0.25) {
            colorClass = 'danger';
        } else if (remaining <= initial * 0.5) {
            colorClass = 'warning';
        }

        uiModule.updateProgressBar(progress, colorClass);
    },

    /**
     * PiP モードを起動
     */
    async launchPip() {
        try {
            uiModule.updatePipButton(true);

            await pipModule.launch(
                uiModule.elements.pipCanvas,
                () => this.drawPipCanvas()
            );

        } catch (error) {
            console.error('PiP launch failed:', error);
            alert('Picture-in-Pictureが利用できません\n詳細: ' + error.message);
            uiModule.updatePipButton(false);
        }
    },

    /**
     * PiP用キャンバスを描画
     */
    drawPipCanvas() {
        canvasModule.drawTimer(
            uiModule.elements.pipCanvas,
            timerModule.state.remainingSeconds,
            timerModule.state.initialSeconds,
            timerModule.state.isPaused,
            timerModule.state.isRunning,
            themeModule.getCurrentTheme(),
            this.alarmTime
        );
    },

    /**
     * 背景色を更新（超過時は赤系）
     */
    updateBackgroundColor() {
        const remaining = timerModule.state.remainingSeconds;
        const mainContainer = uiModule.elements.mainContainer;
        
        if (remaining < 0) {
            // 超過時：赤系背景
            mainContainer.style.backgroundColor = '#2d1515';
        } else {
            // 通常時：デフォルト
            mainContainer.style.backgroundColor = '';
        }
    },

    /**
     * 全画面表示を切り替え
     */
    toggleFullscreen() {
        const element = document.documentElement;
        
        if (!document.fullscreenElement) {
            element.requestFullscreen?.() ||
            element.webkitRequestFullscreen?.() ||
            element.mozRequestFullScreen?.() ||
            element.msRequestFullscreen?.();
        } else {
            document.exitFullscreen?.() ||
            document.webkitExitFullscreen?.() ||
            document.mozCancelFullScreen?.() ||
            document.msExitFullscreen?.();
        }
    },

    /**
     * 完了音を再生
     */
    playCompletionSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();

            const notes = [800, 600, 800];
            const noteDuration = 150;

            let time = audioContext.currentTime;

            notes.forEach((frequency) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.value = frequency;
                oscillator.type = 'sine';

                gainNode.gain.setValueAtTime(0.3, time);
                gainNode.gain.exponentialRampToValueAtTime(0.01, time + noteDuration / 1000);

                oscillator.start(time);
                oscillator.stop(time + noteDuration / 1000);

                time += noteDuration / 1000;
            });
        } catch (error) {
            console.log('Audio not available');
        }
    }
};

// アプリケーション起動
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
