# VRMキャラクターチャットシステム 技術スタック概要

## コア技術
- プログラミング言語 (バックエンド): Python (3.9+)
- プログラミング言語 (フロントエンド): JavaScript / TypeScript
- AIモデル連携: LangChain
- 音声合成エンジン: Style-Bert-VITS2
- 3Dアバターフォーマット: VRM

## フロントエンド
- UIフレームワーク: React
- 3Dレンダリング: Three.js
- React + Three.js連携: React Three Fiber (R3F)
- VRMローダー: @pixiv/three-vrm
- 音声入力: Web Speech API
- 音声再生: HTML5 `<audio>` 要素, Web Audio API
- リップシンクデータ生成: Rhubarb Lip Sync (WebAssembly版)
- 状態管理: Zustand (推奨) または Redux Toolkit
- HTTPクライアント: Fetch API または Axios

## バックエンド
- APIフレームワーク: FastAPI
- 非同期サーバー: Uvicorn
- データ検証・シリアライゼーション: Pydantic (FastAPIに内包)
- LLM連携ライブラリ: LangChain
- 音声合成エンジンラッパー: Style-Bert-VITS2 Python連携
- 会話コンテキスト管理ストレージ候補: インメモリ, Redis, データベース

## 開発ツール
- ビルドツール (フロントエンド): Vite または Create React App
- 依存関係管理 (バックエンド): uv または pip + requirements.txt
- コンテナ化: Docker (デプロイ時)
- CI/CDツール候補: GitHub Actions, GitLab CI, Jenkins

---

# 設計・設定管理の原則

## 重要な原則事項
- **スキーマ駆動開発**:
    - APIインターフェースとデータ構造はOpenAPI仕様に基づいて定義・管理。
    - バックエンドではPydanticモデル、フロントエンドではTypeScriptの型定義を利用し、型安全性を確保。
- **設定のコード化**:
    - アプリケーション設定（サーバー設定、外部APIキー、モデルパス等）は設定ファイル（例: `config.yaml`）および環境変数で管理。
    - 設定ファイルはバージョン管理システムに含め、環境固有の値は環境変数経由で注入 (`.env` ファイル等を利用)。
- **API定義の一元管理**:
    - WebSocketメッセージスキーマは、フロントエンド・バックエンド間で共有可能な型定義として管理（例: TypeScriptの型定義）。
    - HTTP APIはOpenAPI仕様 (`openapi.yaml`) で一元的に定義。

## 実装規則 (推奨)
- **型定義の参照**: フロントエンド・バックエンド間で共有されるデータ構造については、可能な限り共通のスキーマ定義または型定義を参照する。
- **設定アクセスの一元化**: アプリケーション内での設定値へのアクセスは、専用の設定管理モジュールを経由することを推奨。
- **LLMおよびTTSモデルのバージョン管理**:
    - 使用するLLMモデル名やバージョンは設定ファイル (`config.yaml` の `llm` セクション) で指定。
    - Style-Bert-VITS2のモデルファイルやバージョンも設定ファイル (`config.yaml` の `tts` セクション) または専用の管理方法で明確化。
