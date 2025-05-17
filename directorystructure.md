# VRMキャラクターチャットシステム ディレクトリ構成案

以下のディレクトリ構造は、VRMキャラクターチャットシステムの開発における推奨構成です。フロントエンドはReact (Vite環境を想定)、バックエンドはPython (FastAPI) を使用することを前提としています。

/├── frontend/                     # フロントエンド (React + Vite)│   ├── public/                   # 静的アセット (VRMモデル、画像など)│   │   ├── models/               # VRMモデルファイル (.vrm)│   │   │   └── default_avatar.vrm│   │   └── favicon.ico│   ├── src/│   │   ├── assets/               # CSSで使用する画像など│   │   ├── components/           # Reactコンポーネント│   │   │   ├── ui/               # 基本的なUI要素 (Button, Input, Modalなど)│   │   │   │   ├── Button.tsx│   │   │   │   └── MessageBubble.tsx│   │   │   ├── layout/           # レイアウトコンポーネント (Header, Footer, Sidebar)│   │   │   ├── vrm/              # VRM関連コンポーネント│   │   │   │   ├── VRMViewer.tsx     # VRM表示・アニメーション│   │   │   │   └── VRMSelector.tsx   # VRMモデル選択UI│   │   │   └── ChatArea.tsx        # チャット表示エリア│   │   ├── contexts/             # React Context (状態管理)│   │   │   └── AppContext.tsx│   │   ├── features/             # 特定機能に関するモジュール群│   │   │   ├── chat/             # チャット機能関連│   │   │   │   ├── ChatInput.tsx│   │   │   │   └── useChatWebSocket.ts # WebSocket処理フック│   │   │   ├── speech/           # 音声入力関連│   │   │   │   ├── MicrophoneButton.tsx│   │   │   │   └── useSpeechRecognition.ts # Web Speech API処理フック│   │   │   └── lipsync/          # リップシンク関連│   │   │       └── useLipsync.ts     # Rhubarb WASM連携・ブレンドシェイプ制御│   │   ├── hooks/                # 共通カスタムフック│   │   ├── services/             # APIクライアント、外部サービス連携│   │   │   └── apiClient.ts│   │   ├── styles/               # グローバルCSS、テーマ│   │   │   └── global.css│   │   ├── types/                # TypeScript型定義 (フロントエンド固有)│   │   │   └── vrm.ts│   │   ├── utils/                # 共通ユーティリティ関数│   │   ├── App.tsx               # アプリケーションルートコンポーネント│   │   └── main.tsx              # アプリケーションエントリーポイント│   ├── index.html                # HTMLルートファイル│   ├── vite.config.ts            # Vite設定ファイル│   ├── tsconfig.json             # TypeScript設定ファイル│   └── package.json│├── backend/                      # バックエンド (Python/FastAPI)│   ├── app/│   │   ├── api/                  # APIルーター定義│   │   │   ├── v1/│   │   │   │   ├── endpoints/│   │   │   │   │   ├── chat.py       # WebSocketチャットエンドポイント│   │   │   │   │   ├── tts.py        # TTS関連HTTPエンドポイント│   │   │   │   │   └── config.py     # 設定関連HTTPエンドポイント│   │   │   │   └── api_v1.py     # v1 APIルーター集約│   │   │   └── deps.py           # 依存性注入関連│   │   ├── core/                 # コア設定、セキュリティなど│   │   │   ├── config.py         # アプリケーション設定読み込み│   │   │   └── security.py       # APIキー管理など│   │   ├── models/               # データモデル (Pydanticスキーマとは別、DBモデルなど)│   │   ├── schemas/              # Pydanticスキーマ (APIリクエスト/レスポンス)│   │   │   ├── chat_schemas.py│   │   │   ├── tts_schemas.py│   │   │   └── config_schemas.py│   │   ├── services/             # ビジネスロジック│   │   │   ├── llm_service.py    # LLM連携 (LangChain)│   │   │   ├── tts_service.py    # Style-Bert-VITS2連携│   │   │   └── context_service.py # 会話コンテキスト管理│   │   ├── utils/                # 共通ユーティリティ│   │   ├── main.py               # FastAPIアプリケーションエントリーポイント│   │   └── ws_manager.py         # WebSocket接続管理│   ├── tests/                    # テストコード│   │   ├── api/│   │   └── services/│   ├── config/                   # 設定ファイルディレクトリ│   │   └── default.yaml│   ├── models_tts/               # Style-Bert-VITS2モデルファイル格納場所 (例)│   ├── .env                      # 環境変数ファイル (Git管理外)│   ├── requirements.txt          # Python依存パッケージ (pip)│   ├── poetry.lock               # (Poetry使用時)│   └── pyproject.toml            # (Poetry使用時)│├── shared/                       # フロントエンドとバックエンドで共有する型定義など│   └── types/│       └── websocketMessages.ts  # WebSocketメッセージスキーマ (TypeScript)│├── .vscode/                      # VSCode設定 (任意)├── .git/                         # Gitリポジトリ├── .gitignore                    # Git除外設定├── README.md                     # プロジェクト説明ファイル└── docker-compose.yml            # Docker Compose設定 (任意)
### 主要ディレクトリ/ファイル説明

#### `frontend/`
-   `public/models/`: VRMモデルファイル (`.vrm`) を配置します。
-   `src/components/vrm/`: VRMキャラクターの表示や選択に関連するReactコンポーネント。
-   `src/features/`: `chat/` (チャット機能)、`speech/` (音声入力)、`lipsync/` (リップシンク) など、主要機能ごとのモジュール。カスタムフックや関連コンポーネントをまとめます。
-   `src/services/apiClient.ts`: バックエンドAPIとの通信を行うクライアント。
-   `src/types/`: フロントエンド固有のTypeScript型定義。

#### `backend/`
-   `app/api/v1/endpoints/`: 各APIエンドポイントの実装 (例: `chat.py` でWebSocket処理、`tts.py` でTTS関連HTTP API)。
-   `app/core/config.py`: `config/default.yaml` や環境変数を読み込み、アプリケーション全体で利用可能な設定オブジェクトを提供。
-   `app/schemas/`: Pydanticモデルを使用してAPIのリクエスト/レスポンスのデータ構造を定義。
-   `app/services/`: `llm_service.py` (LangChainを使ったLLMとの連携)、`tts_service.py` (Style-Bert-VITS2による音声合成処理) など、コアなビジネスロジック。
-   `app/main.py`: FastAPIアプリケーションのインスタンス化とルーティング設定。
-   `app/ws_manager.py`: WebSocket接続の管理ロジック。
-   `config/default.yaml`: アプリケーションの基本設定ファイル。
-   `models_tts/`: Style-Bert-VITS2の学習済みモデルファイルなどを格納する想定。

#### `shared/`
-   `types/websocketMessages.ts`: フロントエンドとバックエンド間でWebSocket通信に使用するメッセージの型定義をTypeScriptで記述。これにより、型安全な通信を促進します。(バックエンド側ではこの型定義を参考にPydanticモデルを作成・検証)

### 配置ルール (推奨)

-   **フロントエンド UIコンポーネント**:
    -   汎用的なUI部品 (ボタン、カード等): `frontend/src/components/ui/`
    -   レイアウト関連コンポーネント: `frontend/src/components/layout/`
    -   VRM関連専門コンポーネント: `frontend/src/components/vrm/`
    -   特定機能に強く関連するコンポーネント: 各 `frontend/src/features/[feature_name]/` 内
-   **フロントエンド カスタムフック**:
    -   汎用的カスタムフック: `frontend/src/hooks/`
    -   特定機能専用カスタムフック: 各 `frontend/src/features/[feature_name]/` 内 (例: `useChatWebSocket.ts`)
-   **バックエンド APIエンドポイント**: `backend/app/api/v1/endpoints/` 以下に機能ごとにファイルを分割。
-   **バックエンド ビジネスロジック (サービス)**: `backend/app/services/` 以下に機能ごとにファイルを分割。
-   **バックエンド データスキーマ (Pydantic)**: `backend/app/schemas/` 以下に用途ごとにファイルを分割。
-   **共有型定義**: `shared/types/` (特にWebSocketメッセージなど)

このディレクトリ構成はあくまで一例であり、プロジェクトの規模やチームの慣習に応じて適宜調整してください。
