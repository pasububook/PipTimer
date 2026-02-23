/**
 * @module pip
 * @description Picture-in-Picture機能モジュール
 */

/**
 * Picture-in-Picture制御
 * @type {Object}
 */
const pipModule = {
    /** @type {boolean} PiPアクティブ状態 */
    isActive: false,

    /** @type {HTMLVideoElement} PiP用ビデオ要素 */
    videoElement: null,

    /** @type {number} キャンバス更新のアニメーションID */
    updateIntervalId: null,

    /**
     * ビデオ要素を作成
     * @returns {HTMLVideoElement} ビデオ要素
     */
    createVideoElement() {
        const video = document.createElement('video');
        video.style.display = 'none';
        document.body.appendChild(video);
        return video;
    },

    /**
     * PiP モードを起動
     * @param {HTMLCanvasElement} canvas - 描画キャンバス
     * @param {Function} drawCallback - 描画コールバック
     * @returns {Promise<void>}
     */
    async launch(canvas, drawCallback) {
        try {
            // キャンバスをセットアップ（1080p アスペクト比: 16:9）
            canvas.width = 960;
            canvas.height = 540;
            drawCallback();

            // ビデオ要素を作成
            if (!this.videoElement) {
                this.videoElement = this.createVideoElement();
            }

            // ストリームを取得
            const stream = canvas.captureStream(30);
            this.videoElement.srcObject = stream;

            // 再生を開始
            try {
                await this.videoElement.play();
            } catch (e) {
                console.warn('Video play warning:', e);
            }

            // メタデータ読み込みを待機
            await new Promise((resolve) => {
                if (this.videoElement.readyState >= 1) {
                    // メタデータ既読み込み
                    resolve();
                } else {
                    this.videoElement.onloadedmetadata = resolve;
                    // タイムアウト設定（3秒）
                    setTimeout(resolve, 3000);
                }
            });

            // PiP を開始
            await this.videoElement.requestPictureInPicture();

            this.isActive = true;

            // キャンバス更新を開始（requestAnimationFrameで滑らかに描画）
            const loop = () => {
                if (!this.isActive) return;
                drawCallback();
                this.updateIntervalId = requestAnimationFrame(loop);
            };
            this.updateIntervalId = requestAnimationFrame(loop);

            // PiP 終了イベントを監視
            document.addEventListener('leavepictureinpicture', () => this.close());

        } catch (error) {
            console.error('PiP launch error:', error);
            throw error;
        }
    },

    /**
     * PiP モードを閉じる
     */
    close() {
        this.isActive = false;

        if (this.updateIntervalId) {
            cancelAnimationFrame(this.updateIntervalId);
            this.updateIntervalId = null;
        }

        if (this.videoElement) {
            if (this.videoElement.srcObject) {
                const tracks = this.videoElement.srcObject.getTracks();
                tracks.forEach(track => track.stop());
                this.videoElement.srcObject = null;
            }
        }

        document.removeEventListener('leavepictureinpicture', () => this.close());
    }
};
