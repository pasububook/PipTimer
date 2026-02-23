# アーキテクチャ

PipTimer は Plain JavaScript（フレームワーク不使用）でモジュール分割された設計を採用しています。  
各モジュールはグローバルオブジェクトとして定義され、`app.js` がエントリーポイントとなります。

## モジュール構成

```
themeModule   timerModule   uiModule
      ↑              ↑           ↑
      └──────────────┤           │
                   app           │
      ┌────────────────┘           │
      ↓                           ↓
 pipModule ──► canvasModule    timerSvgModule
```

### ロード順（index.html）

```html
<script src="./script/theme.js"></script>
<script src="./script/timer.js"></script>
<script src="./script/ui.js"></script>
<script src="./script/pip.js"></script>
<script src="./script/canvas.js"></script>
<script src="./script/timerSvg.js"></script>
<script src="./script/app.js"></script>   <!-- DOMContentLoaded で app.init() -->
```

---

## 各モジュールの責務

### `themeModule` — [theme.js](../src/script/theme.js)

テーマ（ライト / ダーク）の読み取り・適用・切り替えを担当。

| メソッド | 説明 |
|---|---|
| `getCurrentTheme()` | `localStorage` → `data-theme` 属性 → `prefers-color-scheme` の優先順で現在テーマを返す |
| `applyTheme(theme)` | `<html>` の `data-theme` 属性を設定し、`localStorage` に保存 |
| `toggle()` | ライト ↔ ダークを切り替え、次のテーマを返す |

---

### `timerModule` — [timer.js](../src/script/timer.js)

カウントダウン・カウントアップのロジックを担当。UI には触れない。

#### 状態 (`timerModule.state`)

| プロパティ | 型 | 説明 |
|---|---|---|
| `isRunning` | `boolean` | タイマー実行中フラグ |
| `isPaused` | `boolean` | 一時停止フラグ |
| `initialSeconds` | `number` | 開始時の設定秒数 |
| `remainingSeconds` | `number` | 1秒ごとに更新される残り秒数（整数） |
| `startTimestamp` | `number\|null` | `Date.now()` 基点（精密計算用） |
| `totalPausedMs` | `number` | 累積一時停止時間（ms） |
| `intervalId` | `number\|null` | `setInterval` ID |
| `animationId` | `number\|null` | `requestAnimationFrame` ID |

#### タイマーの時刻計算

`remainingSeconds` は `setInterval`（1秒周期）で整数更新されますが、プログレスバーや SVG の滑らかなアニメーションには `getExactRemainingSeconds()` を使用します。

```
exactRemaining = initialSeconds - (now - startTimestamp - totalPausedMs) / 1000
```

超過時は負の値になります（例: `-3.2` → `-00:00:03`）。

#### カウントアップへの移行

`remainingSeconds === 0` になると `onComplete` コールバックが発火し、`switchToCountUp()` が呼ばれます。  
`switchToCountUp()` は `isRunning = true` を保ちつつ `setInterval` を継続し、`remainingSeconds` がマイナスに進み続けます。

---

### `uiModule` — [ui.js](../src/script/ui.js)

DOM 要素のキャッシュと、セクション切り替え・ボタン状態更新を担当。

- `elements` オブジェクトに全 DOM 要素を保持（`initElements()` で初期化）
- `showInputSection()` / `showTimerSection()` で入力画面 ↔ タイマー画面を切り替え
- `updatePauseButton(isPaused)` / `updatePipButton(isActive)` でボタンラベル・スタイルを更新
- `updateTimeDisplay()` / `updateStatus()` / `updateProgressBar()` は現在 no-op（SVG / Canvas が直接描画）

---

### `timerSvgModule` — [timerSvg.js](../src/script/timerSvg.js)

メイン画面の SVG タイマーを `requestAnimationFrame` ループ内で更新する。

#### SVG 構造（viewBox: `0 0 480 270`）

| 要素 | ID | 役割 |
|---|---|---|
| `<rect class="svg-bg">` | — | 背景 |
| `<path class="svg-track">` | — | プログレストラック（全周、グレー） |
| `<path class="svg-progress">` | `svgProgress` | 残り時間分の進捗（`stroke-dashoffset` で制御） |
| `<text class="svg-time">` | `svgTime` | `hh:mm:ss` 残り時間 |
| `<text class="svg-alarm">` | `svgAlarm` | `hh:mm` アラーム時刻（アラームなしの場合は非表示） |

#### プログレスのアニメーション

`stroke-dasharray` に矩形の周長（≈1383.4px）を設定し、`stroke-dashoffset` を `(1 - progress) * perimeter` で更新することで、枠の先頭から残り時間分だけ描画します。

#### 状態クラス

`<svg id="mainSvg">` に CSS クラスを付与して背景色・プログレス色を制御:

| クラス | 条件 | 配色 |
|---|---|---|
| （なし） | `progress > 0.5` | 通常（青） |
| `state-warning` | `0.25 < progress ≤ 0.5` | 注意（橙） |
| `state-danger` | `progress ≤ 0.25` または超過 | 警告（赤） |

---

### `pipModule` — [pip.js](../src/script/pip.js)

Picture-in-Picture の起動・終了を担当。

#### 起動フロー (`launch`)

```
canvas (960×540) 初期描画
    ↓
video.srcObject = canvas.captureStream(30fps)
    ↓
video.play() + loadedmetadata 待機（最大 3 秒）
    ↓
video.requestPictureInPicture()
    ↓
requestAnimationFrame ループで drawCallback() を繰り返し呼び出し
```

#### 終了フロー (`close`)

- `cancelAnimationFrame` でループ停止
- `leavepictureinpicture` イベントリスナーを削除
- `MediaStream` のトラックをすべて停止

---

### `canvasModule` — [canvas.js](../src/script/canvas.js)

PiP ウィンドウ用のキャンバス（960×540）に描画する。

#### 描画内容

1. **背景矩形** — 状態（通常 / 警告 / 超過）とテーマに応じた塗りつぶし色
2. **トラック** — 矩形の枠全周をグレーで描画（ラウンドコーナー）
3. **プログレス** — 残り時間の割合分だけ枠を色付きで描画
4. **中央テキスト**
   - `hh:mm:ss`（残り時間 / 超過時は `-hh:mm:ss`）
   - `hh:mm`（アラーム時刻、存在する場合）

アラーム時刻がある場合はテキストを少し上にオフセットして 2 行配置します。

#### プログレスの描画

`_roundRectPath()` / `_progressPath()` ヘルパーメソッドで、ラウンドコーナー矩形の輪郭を `progress` 割合分だけ `lineTo` / `arcTo` でトレースします。

---

### `app` — [app.js](../src/script/app.js)

アプリケーション全体のエントリーポイント。各モジュールを組み合わせ、イベントに反応してオーケストレーションします。

#### 初期化

```
DOMContentLoaded
    → uiModule.initElements()
    → themeModule.applyTheme(currentTheme)
    → setupEventListeners()
```

#### タイマー開始 (`startTimer`)

1. `timerModule.getInputSeconds()` で入力値を秒に変換
2. アラーム時刻（`Date.now() + seconds * 1000`）を `hh:mm` で計算・保持
3. `timerModule.start(seconds, onUpdate, onComplete)` でタイマー起動
4. `requestAnimationFrame` ループで `timerSvgModule.update()` を呼び続ける

#### PiP 起動 (`launchPip`)

```javascript
pipModule.launch(pipCanvas, () => drawPipCanvas(), () => updatePipButton(false))
```

`drawPipCanvas()` は `canvasModule.drawTimer()` に現在の状態を渡すだけのレイヤー。

---

## CSS 設計

### CSS カスタムプロパティ（[base.css](../src/style/base.css)）

`:root` にライトモードの値を定義し、`html[data-theme="dark"]` でダークモードの値を上書きします。

| 変数 | 用途 |
|---|---|
| `--timer-bg` / `--timer-bg-warning` / `--timer-bg-danger` | SVG タイマー背景色 |
| `--timer-track` | プログレストラック色 |
| `--timer-progress` / `--timer-progress-warning` / `--timer-progress-danger` | プログレス色 |
| `--timer-text` / `--timer-text-sub` | SVG テキスト色 |
| `--color-bg` / `--color-text` | ページ全体の背景・文字色 |

### ファイル分割

| ファイル | 内容 |
|---|---|
| `base.css` | カスタムプロパティ定義、CSS リセット、グローバルスタイル |
| `header.css` | ヘッダー・ボタン配置 |
| `layout.css` | メインコンテナ・セクション切り替え |
| `progress.css` | SVG タイマー（`.timer-svg`、状態クラス） |
| `controls.css` | コントロールボタン（`.btn-*`） |
