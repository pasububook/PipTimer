/**
 * PipTimer - Picture-in-Picture タイマーアプリケーション
 */

// ========================================
// 状態管理
// ========================================

const state = {
    isRunning: false,
    isPaused: false,
    totalSeconds: 60,
    remainingSeconds: 60,
    initialSeconds: 60,
    intervalId: null,
    animationId: null,
    isInPip: false,
    theme: localStorage.getItem('theme') || 'light',
};

// ========================================
// DOM 要素
// ========================================

const elements = {
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

    // プログレス
    progressCircle: document.getElementById('progressCircle'),

    // キャンバス
    pipCanvas: document.getElementById('pipCanvas'),

    // コンテナ
    mainContainer: document.getElementById('mainContainer'),
};

// ========================================
// 初期化
// ========================================

function init() {
    applyTheme(state.theme);
    setupEventListeners();
    updateProgressCircle();
}

function setupEventListeners() {
    // テーマ切り替え
    elements.themeToggle.addEventListener('click', toggleTheme);

    // タイマー制御
    elements.startBtn.addEventListener('click', startTimer);
    elements.pauseBtn.addEventListener('click', pauseTimer);
    elements.stopBtn.addEventListener('click', stopTimer);
    elements.pipBtn.addEventListener('click', launchPip);

    // 入力フィールド
    elements.hoursInput.addEventListener('change', validateInput);
    elements.minutesInput.addEventListener('change', validateInput);
    elements.secondsInput.addEventListener('change', validateInput);
}

// ========================================
// テーマ管理
// ========================================

function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    applyTheme(state.theme);
    localStorage.setItem('theme', state.theme);
}

function applyTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
}

// ========================================
// 入力検証
// ========================================

function validateInput() {
    const hours = Math.max(0, Math.min(23, parseInt(elements.hoursInput.value) || 0));
    const minutes = Math.max(0, Math.min(59, parseInt(elements.minutesInput.value) || 0));
    const seconds = Math.max(0, Math.min(59, parseInt(elements.secondsInput.value) || 0));

    elements.hoursInput.value = hours;
    elements.minutesInput.value = minutes;
    elements.secondsInput.value = seconds;

    updateTimeDisplay();
}

function getInputSeconds() {
    const hours = parseInt(elements.hoursInput.value) || 0;
    const minutes = parseInt(elements.minutesInput.value) || 0;
    const seconds = parseInt(elements.secondsInput.value) || 0;

    return hours * 3600 + minutes * 60 + seconds;
}

// ========================================
// タイマーロジック
// ========================================

function startTimer() {
    const inputSeconds = getInputSeconds();

    if (inputSeconds <= 0) {
        alert('有効な時間を設定してください');
        return;
    }

    state.totalSeconds = inputSeconds;
    state.initialSeconds = inputSeconds;
    state.remainingSeconds = inputSeconds;
    state.isRunning = true;
    state.isPaused = false;

    // UI更新
    elements.inputSection.style.display = 'none';
    elements.timerSection.style.display = 'block';
    elements.pauseBtn.textContent = '一時停止';
    elements.timerStatus.textContent = '実行中';

    // タイマーとアニメーション開始
    runTimer();
    startAnimation();
}

function startAnimation() {
    const animate = () => {
        if (state.isRunning) {
            updateProgressCircle();
            state.animationId = requestAnimationFrame(animate);
        }
    };
    state.animationId = requestAnimationFrame(animate);
}

function runTimer() {
    state.intervalId = setInterval(() => {
        if (!state.isPaused && state.isRunning) {
            state.remainingSeconds--;
            updateTimerDisplay();

            // ビープ音（最後の3秒）
            if (state.remainingSeconds === 3 || state.remainingSeconds === 2 || state.remainingSeconds === 1) {
                playBeep();
            }

            // タイマー完了
            if (state.remainingSeconds === 0) {
                playCompletionSound();
                startCountUp();
            }
        }
    }, 1000); // 1秒ごとに更新（ビープ音をより正確に）
}

function pauseTimer() {
    if (!state.isRunning) return;

    state.isPaused = !state.isPaused;

    if (state.isPaused) {
        elements.pauseBtn.textContent = '再開';
        elements.timerStatus.textContent = '一時停止中';
    } else {
        elements.pauseBtn.textContent = '一時停止';
        elements.timerStatus.textContent = '実行中';
    }
}

function stopTimer() {
    state.isRunning = false;
    state.isPaused = false;

    if (state.intervalId) {
        clearInterval(state.intervalId);
        state.intervalId = null;
    }

    if (state.animationId) {
        cancelAnimationFrame(state.animationId);
        state.animationId = null;
    }

    // PiPウィンドウをクローズ（またはイベント発行）
    if (state.isInPip) {
        // PiPごウィンドウは自動的にクローズされるか、
        // ユーザーが手動でクローズする
        // 別途ボタンを追加する場合もあります
        state.isInPip = false;
    }

    // UI更新
    elements.timerSection.style.display = 'none';
    elements.inputSection.style.display = 'block';
    elements.timerStatus.textContent = '準備完了';
    elements.pauseBtn.textContent = '一時停止';
}

function startCountUp() {
    // タイマー完了後、カウントアップを開始
    state.isRunning = true;
    state.isPaused = false;
    elements.timerStatus.textContent = '超過中';
}

// ========================================
// 表示更新
// ========================================

function updateTimerDisplay() {
    const time = formatTime(state.remainingSeconds);
    elements.timeDisplay.textContent = time;
}

function updateTimeDisplay() {
    const inputSeconds = getInputSeconds();
    const time = formatTime(inputSeconds);
    elements.timeDisplay.textContent = time;
}

function formatTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function updateProgressCircle() {
    if (state.initialSeconds <= 0) return;

    const radius = 90;
    const circumference = 2 * Math.PI * radius;
    const remaining = Math.max(0, state.remainingSeconds / state.initialSeconds);
    const offset = circumference * (1 - remaining);

    elements.progressCircle.style.strokeDasharray = `${circumference}`;
    elements.progressCircle.style.strokeDashoffset = offset;

    // 色を変更（進行状況に応じて）
    elements.progressCircle.classList.remove('warning', 'danger');
    if (state.remainingSeconds <= 0) {
        // カウントアップ中
        elements.progressCircle.classList.add('danger');
    } else if (state.remainingSeconds <= state.initialSeconds * 0.25) {
        // 残り25%未満で赤
        elements.progressCircle.classList.add('danger');
    } else if (state.remainingSeconds <= state.initialSeconds * 0.5) {
        // 残り50%未満で黄
        elements.progressCircle.classList.add('warning');
    }
}

// ========================================
// Picture-in-Picture
// ========================================

let updatePipInterval = null;

async function launchPip() {
    try {
        // キャンバスをセットアップ
        setupPipCanvas();
        
        // キャンバスからストリームを取得
        const stream = elements.pipCanvas.captureStream(30);
        
        // 動画要素を作成
        const video = document.createElement('video');
        video.srcObject = stream;
        video.play();
        
        // PictureInPictureを開始
        await video.requestPictureInPicture();
        
        state.isInPip = true;
        elements.pipBtn.textContent = 'PiP: 有効';
        elements.pipBtn.disabled = true;
        
        // キャンバスの定期的な更新を開始
        updatePipInterval = setInterval(() => {
            if (state.isInPip) {
                drawPipCanvas();
            }
        }, 100);
        
        // PiPが閉じられたときの処理
        document.addEventListener('leavepictureinpicture', handlePipClosed);
        
    } catch (error) {
        console.error('PiP launch failed:', error);
        alert('Picture-in-Pictureが利用できません\n詳細: ' + error.message);
    }
}

function handlePipClosed() {
    state.isInPip = false;
    elements.pipBtn.textContent = 'PiP';
    elements.pipBtn.disabled = false;
    
    if (updatePipInterval) {
        clearInterval(updatePipInterval);
        updatePipInterval = null;
    }
    
    // ビデオストリームをクリーンアップ
    if (elements.pipCanvas.srcObject) {
        const tracks = elements.pipCanvas.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        elements.pipCanvas.srcObject = null;
    }
    
    document.removeEventListener('leavepictureinpicture', handlePipClosed);
}

function setupPipCanvas() {
    const canvas = elements.pipCanvas;
    canvas.width = 400;
    canvas.height = 400;
    drawPipCanvas();
}

function drawPipCanvas() {
    const canvas = elements.pipCanvas;
    const ctx = canvas.getContext('2d');

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 150;

    // 背景
    const isDark = state.theme === 'dark';
    ctx.fillStyle = isDark ? '#1e1e1e' : '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 外枠（円）
    ctx.strokeStyle = isDark ? '#666666' : '#cccccc';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();

    // プログレスバー（円弧）
    const progress = state.remainingSeconds >= 0 
        ? state.remainingSeconds / state.initialSeconds 
        : 0;
    
    // 色決定
    let progressColor = '#007bff'; // 青
    if (state.remainingSeconds < 0) {
        progressColor = '#dc3545'; // 赤（超過）
    } else if (state.remainingSeconds <= state.initialSeconds * 0.25) {
        progressColor = '#dc3545'; // 赤
    } else if (state.remainingSeconds <= state.initialSeconds * 0.5) {
        progressColor = '#ffc107'; // 黄
    }

    ctx.strokeStyle = progressColor;
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * progress);
    ctx.stroke();

    // 時間表示
    const time = formatTime(Math.abs(state.remainingSeconds));
    ctx.fillStyle = isDark ? '#ffffff' : '#000000';
    ctx.font = 'bold 56px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(time, centerX, centerY - 30);

    // ステータス表示
    ctx.font = '18px sans-serif';
    ctx.fillStyle = isDark ? '#bbbbbb' : '#555555';
    let statusText = '';
    if (state.remainingSeconds < 0) {
        statusText = '超過: ' + formatTime(Math.abs(state.remainingSeconds));
    } else if (state.isPaused) {
        statusText = '一時停止';
    } else if (state.isRunning) {
        statusText = '実行中';
    }
    ctx.fillText(statusText, centerX, centerY + 50);
}

// ========================================
// サウンド
// ========================================

function playBeep(frequency = 800, duration = 200) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (error) {
        console.log('Audio not available');
    }
}

function playCompletionSound() {
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

// ========================================
// アプリケーション起動
// ========================================

document.addEventListener('DOMContentLoaded', init);
