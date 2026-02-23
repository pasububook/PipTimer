# PipTimer

Picture-in-Picture で動作するシンプルなカウントダウンタイマー

## 機能

### タイマー機能
- 時間・分・秒を入力してカウントダウン開始
- 一時停止・再開・停止が可能
- カウントダウン完了後、自動的にカウントアップ（超過時間の表示）に移行

### タイマー表示
- **SVG ベースの矩形プログレスバー**（ベクター描画でジャギーなし）
- 残り時間を `hh:mm:ss` 形式で表示
- タイマー完了予定時刻（アラーム時刻）を `hh:mm` 形式で表示
- 残り時間の割合に応じてプログレスバーの色が変化:
  - **青**: 通常状態（残り 50% 以上）
  - **橙**: 注意状態（残り 25〜50%）
  - **赤**: 警告状態（残り 25% 未満、または超過中）

### Picture-in-Picture
- PiP ボタンでタイマーを別ウィンドウにフローティング表示
- Canvas API（960×540）でリアルタイム描画し、`captureStream()` で映像化
- ライト/ダークテーマに追従した配色
- PiP ウィンドウをユーザーが閉じると、UI 上の PiP ボタンが自動的にリセット

### ダークモード
- ヘッダーの月/太陽アイコンでライト・ダーク切り替え
- 設定は `localStorage` に永続化
- システムの `prefers-color-scheme` にも対応（明示的な設定がない場合のフォールバック）

### 全画面表示
- ヘッダーの全画面ボタンで Fullscreen API を使用した全画面表示に対応

### サウンド
- タイマー完了時に Web Audio API で完了音（シンプルな 3 音）を再生

## 使用方法

1. **ローカルサーバーを起動**
   ```bash
   python3 -m http.server 8000 --directory src
   ```
   `http://localhost:8000` にアクセス

2. **タイマーを設定・開始**
   - 時間 / 分 / 秒を入力して「開始」をクリック
   - タイマー画面に切り替わり、カウントダウンと完了予定時刻が表示される

3. **タイマー制御**
   | ボタン | 動作 |
   |--------|------|
   | 一時停止 | 一時停止 / 再開のトグル |
   | 停止 | タイマーをリセットして入力画面へ戻る |
   | PiP | Picture-in-Picture ウィンドウで表示 |

4. **テーマ切り替え**
   - ヘッダーの月 / 太陽アイコンをクリック

## 技術仕様

### 使用技術
- **HTML5** / **CSS3** / **JavaScript (Vanilla)**
- **Web APIs**: Picture-in-Picture API, Canvas API, Web Audio API, Fullscreen API, localStorage

### ディレクトリ構成

```
src/
├── index.html
├── script/
│   ├── theme.js       # テーマ管理（ライト/ダーク、localStorage 永続化）
│   ├── timer.js       # タイマーロジック（カウントダウン・カウントアップ・一時停止）
│   ├── ui.js          # DOM要素キャッシュと UI 切り替え
│   ├── pip.js         # Picture-in-Picture 起動・終了
│   ├── canvas.js      # PiP 用キャンバス描画
│   ├── timerSvg.js    # メイン画面 SVG タイマー描画
│   └── app.js         # アプリケーション初期化・イベント制御
└── style/
    ├── base.css        # CSS カスタムプロパティ（カラー定義）とリセット
    ├── header.css      # ヘッダーレイアウト
    ├── layout.css      # メインレイアウト
    ├── progress.css    # SVG タイマー / プログレスバー
    └── controls.css    # コントロールボタン
```

詳細なモジュール設計は [docs/architecture.md](docs/architecture.md) を参照してください。

## ブラウザ互換性

| 機能 | Chrome | Edge | Safari | Firefox |
|------|:------:|:----:|:------:|:-------:|
| 基本機能 | ✅ | ✅ | ✅ | ✅ |
| Picture-in-Picture | ✅ | ✅ | ✅ | ✅ |
| Web Audio | ✅ | ✅ | ✅ | ✅ |
| Fullscreen API | ✅ | ✅ | ✅ | ✅ |

**推奨環境**: Google Chrome 最新版

## 制約事項

- Plain HTML / CSS / JavaScript のみ（フレームワーク不使用）
- アイコンは SVG のみ（`src/public/img/` に配置）
- クライアントサイドのみで動作
