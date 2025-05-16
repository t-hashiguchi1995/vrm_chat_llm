<img src="./assets/header.svg" alt="Header" style="display: block; margin: 0 auto;" />

# 🚀 VRMキャラクターチャットシステム

## 📖 プロジェクト概要
本プロジェクトは、VRMアバターとユーザーがインタラクティブにチャットできるウェブアプリケーションを開発することを目的としています。

## 🧩 システム構成
- **フロントエンド**: React, Three.js, React Three Fiber, Web Speech API, HTML5 Audio
- **バックエンド**: FastAPI, WebSocket, LangChain, Style-Bert-VITS2
- **通信プロトコル**: WebSocketおよびHTTP/REST

## ⚙️ セットアップ
### バックエンド
1. Python3.9以上をインストールしてください。
2. `backend/requirements.txt` を元に必要なパッケージをインストールしてください。
3. 設定ファイルは `backend/config/default.yaml` を参照してください。

### フロントエンド
1. Node.jsをインストールしてください。
2. フロントエンドディレクトリで `npm install` を実行してください。
3. `npm run dev` で開発サーバーが起動します。

## 📑 仕様書
詳細な設計は [VRMキャラクターチャットシステム 設計書.md](./VRMキャラクターチャットシステム%20設計書.md) をご覧ください。

## 🔧 コード規約
- 変数名、関数名は英語で記述。
- コメント、ドキュメントは日本語で記述。
- 各変更は個別にコミットします。