\# VRMキャラクターチャットシステム 設計書

\#\# 1\. はじめに

\#\#\# 1.1. プロジェクト概要

本プロジェクトは、VRM（Virtual Reality Model）アバターとユーザーがインタラクティブにチャットできるウェブアプリケーションを開発することを目的とする。ユーザーはテキストまたは音声で入力を行い、VRMアバターは大規模言語モデル（LLM）によって生成された応答を、Style-Bert-VITS2による合成音声とリップシンク（口パク同期）アニメーション付きで返す。

\#\#\# 1.2. 設計思想 (Project as Code)

本設計書は「Project as Code」の思想に基づき、システムの構成要素、インターフェース、データ構造などを可能な限りコードまたはコードに近い形式で記述する。これにより、設計の明確化、再現性の向上、および将来的な自動化の基盤を構築することを目指す。

\* \*\*スキーマ駆動開発\*\*: APIのインターフェースやデータ構造は、OpenAPI仕様やPydanticモデルなどのスキーマ定義に基づいて設計・実装する。  
\* \*\*設定のコード化\*\*: 環境設定やアプリケーション設定は、設定ファイル（例: YAML、JSON）や環境変数として管理し、バージョン管理システムに含める。  
\* \*\*インフラストラクチャのコード化 (将来展望)\*\*: 将来的には、TerraformやAnsibleなどのツールを用いてインフラ構成もコードで管理することを目指す。

\#\#\# 1.3. 本書の位置づけ

本書は、VRMキャラクターチャットシステムの開発に必要な技術的仕様、アーキテクチャ、コンポーネント設計、データフローなどを定義する。開発チームの共通理解を形成し、効率的な開発を促進するための指針となる。

\#\# 2\. システムアーキテクチャ

\#\#\# 2.1. 全体構成図

\`\`\`mermaid  
graph TD  
    subgraph クライアント (Webブラウザ)  
        UI\_React\[UI (React \+ R3F)\] \--\> VRM\_Renderer\[VRMレンダラー (Three.js \+ @pixiv/three-vrm)\]  
        UI\_React \--\> Speech\_Input\[音声入力 (Web Speech API)\]  
        UI\_React \--\> Audio\_Playback\[音声再生 & リップシンク (HTML5 Audio \+ Rhubarb WASM)\]  
        UI\_React \-- WebSocket \--\> Backend\_FastAPI  
        UI\_React \-- HTTP/REST \--\> Backend\_FastAPI  
    end

    subgraph バックエンド (Pythonサーバー)  
        Backend\_FastAPI\[FastAPI APIサーバー\]  
        Backend\_FastAPI \-- WebSocket Handler \--\> Chat\_Logic  
        Backend\_FastAPI \-- HTTP Handler \--\> TTS\_Module  
        Backend\_FastAPI \-- HTTP Handler \--\> Config\_Module

        Chat\_Logic\[チャットロジック\] \--\> LLM\_Service\[LLM連携 (LangChain)\]  
        Chat\_Logic \--\> TTS\_Module\[Style-Bert-VITS2連携モジュール\]  
        Chat\_Logic \--\> Context\_Manager\[会話コンテキスト管理\]

        TTS\_Module \-- 推論 \--\> StyleBertVITS2\_Engine\[(Style-Bert-VITS2 本体)\]  
    end

    subgraph 外部サービス  
        LLM\_API\[大規模言語モデル API\]  
    end

    LLM\_Service \--\> LLM\_API

    %% スタイル調整  
    classDef client fill:\#D6EAF8,stroke:\#3498DB,stroke-width:2px;  
    classDef backend fill:\#D5F5E3,stroke:\#2ECC71,stroke-width:2px;  
    classDef external fill:\#FCF3CF,stroke:\#F1C40F,stroke-width:2px;

    class UI\_React,VRM\_Renderer,Speech\_Input,Audio\_Playback client;  
    class Backend\_FastAPI,Chat\_Logic,TTS\_Module,Context\_Manager,Config\_Module,StyleBertVITS2\_Engine backend;  
    class LLM\_API external;

### **2.2. コンポーネント概要**

#### **2.2.1. フロントエンド (Webブラウザ)**

* **UI (React \+ React Three Fiber)**: ユーザーインターフェースの構築と状態管理。  
* **VRMレンダラー (Three.js \+ @pixiv/three-vrm)**: VRMモデルの読み込み、表示、アニメーション。  
* **音声入力 (Web Speech API)**: ユーザーの音声認識とテキスト化。  
* **音声再生 & リップシンク (HTML5 Audio \+ Rhubarb Lip Sync WASM)**: 合成音声の再生と、口パクアニメーションデータの生成・適用。

#### **2.2.2. バックエンド (Python/FastAPI)**

* **FastAPI APIサーバー**: HTTP/REST APIおよびWebSocket通信のエンドポイントを提供。  
* **チャットロジック**: ユーザー入力の処理、LLMへの問い合わせ、応答の整形。  
* **LLM連携 (LangChain)**: 外部LLMサービスとの通信、プロンプト管理、会話履歴管理。  
* **Style-Bert-VITS2連携モジュール**: テキストから音声への変換処理。  
* **会話コンテキスト管理**: セッションごとの会話履歴の保持。  
* **設定モジュール**: アプリケーション設定の管理。

#### **2.2.3. 外部サービス**

* **大規模言語モデル (LLM) API**: 自然言語応答を生成する外部サービス。  
* **(内包) Style-Bert-VITS2 本体**: バックエンドサーバー内で実行される音声合成エンジン。

## **3\. 技術スタック**

### **3.1. フロントエンド**

* **UIフレームワーク**: React  
* **3Dレンダリング**: Three.js  
* **React \+ Three.js連携**: React Three Fiber (R3F)  
* **VRMローダー**: @pixiv/three-vrm  
* **音声入力**: Web Speech API  
* **音声再生**: HTML5 \<audio\> 要素, Web Audio API  
* **リップシンクデータ生成**: Rhubarb Lip Sync (WebAssembly版)  
* **状態管理**: Zustand (推奨) または Redux Toolkit  
* **HTTPクライアント**: Fetch API または Axios  
* **ビルドツール**: Vite または Create React App

### **3.2. バックエンド**

* **APIフレームワーク**: FastAPI  
* **プログラミング言語**: Python (3.9+)  
* **非同期サーバー**: Uvicorn  
* **データ検証・シリアライゼーション**: Pydantic (FastAPIに内包)  
* **依存関係管理**: Poetry または pip \+ requirements.txt

### **3.3. 音声合成**

* **TTSエンジン**: Style-Bert-VITS2 (事前学習済みモデルまたはカスタム学習モデル)  
* **Pythonラッパー**: Style-Bert-VITS2の推論コードをFastAPI内で直接利用、または軽量APIサーバーとして連携。

### **3.4. LLM連携**

* **LLM連携ライブラリ**: LangChain  
* **対象LLM**: OpenAI GPTシリーズ, Anthropic Claudeシリーズ, Google Geminiシリーズなど (LangChain経由で選択可能)

### **3.5. リップシンク**

* **ビゼーム生成ツール**: Rhubarb Lip Sync (WebAssembly版をクライアントサイドで使用)  
* **VRMブレンドシェイプ**: VRM標準の口形状ブレンドシェイプ (A, I, U, E, Oなど)

## **4\. データスキーマ定義**

### **4.1. APIリクエスト/レスポンススキーマ (OpenAPI準拠)**

OpenAPI仕様の詳細は、別途 openapi.yaml ファイルとして定義・管理する。以下は主要なデータモデルのPydanticによる表現例。

#### **4.1.1. チャットAPI (WebSocketメッセージとして定義、セクション4.2参照)**

チャットのやり取りは主にWebSocketで行うため、HTTP APIとしてのスキーマは限定的。

#### **4.1.2. TTS API (バックエンド内部またはHTTP)**

バックエンド内部で呼び出される場合、またはデバッグ用にHTTPエンドポイントを設ける場合のスキーマ。

\# backend/schemas/tts\_schemas.py  
from pydantic import BaseModel, Field  
from typing import Optional

class TTSRequest(BaseModel):  
    text: str \= Field(..., description="合成するテキスト", example="こんにちは、元気ですか？")  
    speaker\_id: Optional\[int\] \= Field(None, description="話者ID (Style-Bert-VITS2がマルチスピーカーモデルの場合)")  
    style\_wav: Optional\[str\] \= Field(None, description="スタイル参照用WAVファイルのパスまたはURL (Style-Bert-VITS2のスタイル指定)")  
    \# その他Style-Bert-VITS2特有のパラメータ  
    \# 例: language: Optional\[str\] \= Field(None, description="言語コード (例: 'JP')")

class TTSResponse(BaseModel):  
    audio\_url: Optional\[str\] \= Field(None, description="生成された音声ファイルのURL (ストリーミングしない場合)")  
    audio\_content\_b64: Optional\[str\] \= Field(None, description="Base64エンコードされた音声データ (直接返す場合)")  
    error\_message: Optional\[str\] \= Field(None, description="エラー発生時のメッセージ")

#### **4.1.3. VRM設定API (HTTP)**

クライアントが初期ロード時にVRMモデル情報や設定を取得するためのAPI。

\# backend/schemas/vrm\_schemas.py  
from pydantic import BaseModel, Field  
from typing import List, Optional

class VRMModelInfo(BaseModel):  
    id: str \= Field(..., description="VRMモデルの一意なID")  
    name: str \= Field(..., description="VRMモデルの表示名")  
    thumbnail\_url: Optional\[str\] \= Field(None, description="サムネイル画像のURL")  
    vrm\_url: str \= Field(..., description="VRMファイルのURL")

class VRMConfigResponse(BaseModel):  
    available\_models: List\[VRMModelInfo\] \= Field(..., description="利用可能なVRMモデルのリスト")  
    default\_model\_id: Optional\[str\] \= Field(None, description="デフォルトで表示するVRMモデルのID")

### **4.2. WebSocketメッセージスキーマ**

WebSocket通信で使用するメッセージの構造を定義する。JSON形式で送受信。

// frontend/src/types/websocketMessages.ts (TypeScript例)

export enum ClientMessageType {  
  USER\_MESSAGE \= 'user\_message', // ユーザーからのテキストメッセージ  
  VOICE\_TRANSCRIPT \= 'voice\_transcript', // 音声認識結果のテキスト  
  LOAD\_VRM \= 'load\_vrm', // VRMモデル読み込み要求  
  PING \= 'ping',  
}

export enum ServerMessageType {  
  LLM\_RESPONSE\_CHUNK \= 'llm\_response\_chunk', // LLM応答のチャンク (ストリーミング用)  
  LLM\_RESPONSE\_COMPLETE \= 'llm\_response\_complete', // LLM応答完了  
  TTS\_AUDIO\_READY \= 'tts\_audio\_ready', // TTS音声準備完了通知  
  ERROR\_MESSAGE \= 'error\_message', // エラー通知  
  VRM\_LOADED \= 'vrm\_loaded', // VRMモデル読み込み完了通知  
  PONG \= 'pong',  
}

// \--- Client to Server Messages \---  
export interface ClientUserMessage {  
  type: ClientMessageType.USER\_MESSAGE;  
  payload: {  
    text: string;  
    session\_id?: string; // セッション管理用  
  };  
}

export interface ClientVoiceTranscriptMessage {  
  type: ClientMessageType.VOICE\_TRANSCRIPT;  
  payload: {  
    transcript: string;  
    is\_final: boolean;  
    session\_id?: string;  
  };  
}

export interface ClientLoadVRMMessage {  
  type: ClientMessageType.LOAD\_VRM;  
  payload: {  
    model\_id: string;  
  };  
}

export interface ClientPingMessage {  
  type: ClientMessageType.PING;  
}

export type ClientMessage \=  
  | ClientUserMessage  
  | ClientVoiceTranscriptMessage  
  | ClientLoadVRMMessage  
  | ClientPingMessage;

// \--- Server to Client Messages \---  
export interface ServerLLMResponseChunk {  
  type: ServerMessageType.LLM\_RESPONSE\_CHUNK;  
  payload: {  
    text\_chunk: string;  
    conversation\_id: string; // 会話ID  
  };  
}

export interface ServerLLMResponseComplete {  
  type: ServerMessageType.LLM\_RESPONSE\_COMPLETE;  
  payload: {  
    full\_text: string;  
    conversation\_id: string;  
  };  
}

export interface ServerTTSAudioReady {  
  type: ServerMessageType.TTS\_AUDIO\_READY;  
  payload: {  
    audio\_url: string; // 音声ファイルを取得するためのURL  
    text\_for\_lipsync: string; // リップシンク生成用のテキスト  
    conversation\_id: string;  
  };  
}

export interface ServerErrorMessage {  
  type: ServerMessageType.ERROR\_MESSAGE;  
  payload: {  
    message: string;  
    code?: number;  
  };  
}

export interface ServerVRMLoadedMessage {  
  type: ServerMessageType.VRM\_LOADED;  
  payload: {  
    model\_id: string;  
    status: 'success' | 'error';  
    message?: string;  
  };  
}

export interface ServerPongMessage {  
  type: ServerMessageType.PONG;  
}

export type ServerMessage \=  
  | ServerLLMResponseChunk  
  | ServerLLMResponseComplete  
  | ServerTTSAudioReady  
  | ServerErrorMessage  
  | ServerVRMLoadedMessage  
  | ServerPongMessage;

### **4.3. 設定ファイルスキーマ (例: config.yaml または環境変数)**

バックエンドアプリケーションの設定。

\# backend/config/default.yaml (例)  
\# 環境変数で上書き可能

\# FastAPIサーバー設定  
server:  
  host: "0.0.0.0"  
  port: 8000  
  \# log\_level: "info" \# "debug", "info", "warning", "error", "critical"

\# LLMサービス設定  
llm:  
  provider: "openai" \# "openai", "anthropic", "google\_vertexai", etc.  
  api\_key: "${LLM\_API\_KEY}" \# 環境変数から読み込む  
  model\_name: "gpt-3.5-turbo"  
  \# temperature: 0.7  
  \# max\_tokens: 1000  
  \# LangChain特有の設定 (例: memory type)  
  \# memory:  
  \#   type: "ConversationBufferWindowMemory"  
  \#   k: 5

\# Style-Bert-VITS2設定  
tts:  
  \# model\_dir: "/path/to/style\_bert\_vits2\_models" \# モデルファイルが格納されているディレクトリ  
  \# default\_speaker\_id: 0  
  \# default\_language: "JP"  
  \# cache\_enabled: true \# 生成済み音声のキャッシュ  
  \# cache\_dir: "/tmp/tts\_cache"  
  \# Style-Bert-VITS2のAPIサーバーを別途立てる場合  
  \# api\_url: "http://localhost:5000/voice" \# Style-Bert-VITS2 APIサーバーのURL

\# VRMモデル設定  
vrm\_models:  
  default\_model\_id: "default\_avatar"  
  available:  
    \- id: "default\_avatar"  
      name: "デフォルトアバター"  
      vrm\_url: "/models/default\_avatar.vrm" \# 静的配信する場合のパス  
      thumbnail\_url: "/models/default\_avatar\_thumb.png"  
    \# \- id: "custom\_avatar\_1"  
    \#   name: "カスタムアバター1"  
    \#   vrm\_url: "\[https://example.com/path/to/custom\_avatar\_1.vrm\](https://example.com/path/to/custom\_avatar\_1.vrm)"  
    \#   thumbnail\_url: "\[https://example.com/path/to/custom\_avatar\_1\_thumb.png\](https://example.com/path/to/custom\_avatar\_1\_thumb.png)"

\# CORS設定 (フロントエンドのURLに合わせて調整)  
cors:  
  allow\_origins: \["http://localhost:3000", "\[http://127.0.0.1:3000\](http://127.0.0.1:3000)"\] \# フロントエンド開発サーバーのURL  
  allow\_credentials: true  
  allow\_methods: \["\*"\]  
  allow\_headers: \["\*"\]

\# その他  
\# logging\_config\_path: "logging.yaml"

環境変数は .env ファイルで管理し、Pythonの python-dotenv ライブラリで読み込むことを推奨。

## **5\. API設計**

### **5.1. バックエンドAPIエンドポイント**

#### **5.1.1. WebSocketエンドポイント (/ws)**

* **URL**: /ws  
* **プロトコル**: WebSocket  
* **責務**:  
  * クライアントからのメッセージ（テキスト入力、音声認識結果）受信。  
  * LLM応答のストリーミング送信。  
  * TTS音声準備完了通知の送信。  
  * エラー通知。  
  * VRMモデルロード関連の通知。  
* **メッセージ形式**: セクション4.2で定義されたJSON形式。

#### **5.1.2. HTTPエンドポイント**

* **GET /api/v1/config/vrm**:  
  * **責務**: 利用可能なVRMモデルリストとデフォルトモデルIDを返す。  
  * **レスポンス**: VRMConfigResponse (セクション4.1.3参照)  
* **GET /audio/{conversation\_id}/{filename.wav}** (例):  
  * **責務**: 生成されたTTS音声ファイルを返す。URLは ServerTTSAudioReady メッセージで通知される。  
  * **レスポンス**: 音声ファイル (例: audio/wav)。FastAPIの FileResponse または StreamingResponse を使用。  
  * **認証**: 必要に応じて、セッションIDやトークンベースの認証を検討。  
* **(オプション) POST /api/v1/tts/synthesize**:  
  * **責務**: テキストから音声を合成する (デバッグ用、またはWebSocketを使わない場合の代替)。  
  * **リクエストボディ**: TTSRequest (セクション4.1.2参照)  
  * **レスポンス**: TTSResponse (音声データまたはエラー)

### **5.2. フロントエンド・バックエンド間通信プロトコル**

通信の主要な流れは以下の通り。

1. **接続確立**: クライアントがバックエンドの /ws エンドポイントにWebSocket接続を確立。  
2. **ユーザー入力**:  
   * テキスト入力時: クライアントは ClientUserMessage を送信。  
   * 音声入力時: Web Speech APIがテキストを生成し、クライアントは ClientVoiceTranscriptMessage を送信（中間結果と最終結果）。  
3. **LLM処理と応答**:  
   * バックエンドはユーザーメッセージを受信し、LLMに処理を依頼。  
   * LLMからの応答はチャンクとして ServerLLMResponseChunk でクライアントにストリーミングされる。  
   * LLMの全応答が完了したら ServerLLMResponseComplete を送信。  
4. **TTS処理と音声配信**:  
   * LLMの全応答テキストが確定後、バックエンドはTTS処理を開始。  
   * 音声ファイル準備完了後、バックエンドは ServerTTSAudioReady をクライアントに送信。このメッセージには音声ファイルを取得するためのURLと、リップシンク生成用の正確なテキストが含まれる。  
   * クライアントは指定されたURLにHTTP GETリクエストを送信し、音声ファイルを取得。  
5. **エラー処理**:  
   * 処理中にエラーが発生した場合、バックエンドは ServerErrorMessage を送信。  
6. **VRMモデルロード**:  
   * クライアントが ClientLoadVRMMessage を送信。  
   * バックエンド（またはクライアント自身）がVRMファイルをロードし、結果を ServerVRMLoadedMessage で通知（主にクライアントサイドで処理し、状態通知のみバックエンド経由も可）。

## **6\. コンポーネント詳細設計**

### **6.1. フロントエンドコンポーネント (React)**

#### **6.1.1. VRMViewer コンポーネント**

* **責務**: Three.jsと@pixiv/three-vrmを使用し、指定されたVRMモデルをロード、表示、アニメーション（アイドル時、リップシンク時）する。  
* **主要機能**:  
  * VRMファイルURLを受け取り、モデルをロード。  
  * シーン、カメラ、ライトの設定。  
  * useFrame (R3F) フック内でモデルの更新（ボーン、ブレンドシェイプ）。  
  * リップシンクマネージャーから受け取ったブレンドシェイプ値を適用。  
  * アイドルアニメーションの再生（例: 呼吸、瞬き）。  
* **状態**: 現在のモデル、ロード状態、アニメーションパラメータ。

#### **6.1.2. UIコンポーネント群**

* ChatInput: テキスト入力フィールド、送信ボタン。  
* MicrophoneButton: マイクのON/OFF、録音状態表示。  
* VRMSelector: 利用可能なVRMモデルを選択するUI（サムネイル表示など）。  
* MessageArea: チャット履歴（ユーザー発言、アバター応答）を表示。  
* SettingsPanel: 音声設定、アバター選択などのためのパネル。

#### **6.1.3. SpeechInputHandler モジュール/フック**

* **責務**: Web Speech APIをラップし、音声認識の開始・停止、認識結果（中間・最終）のコールバック提供。  
* **主要機能**:  
  * マイク使用許可の取得。  
  * SpeechRecognition インスタンスの管理。  
  * 認識結果をWebSocket経由でバックエンドに送信。  
* **状態**: 録音中フラグ、最新の認識テキスト。

#### **6.1.4. AudioPlaybackLipsyncManager モジュール/フック**

* **責務**:  
  * バックエンドから通知された音声URLを元にHTML5 \<audio\> 要素で音声を再生・管理。  
  * 再生中の音声と対応するテキストをRhubarb Lip Sync WASMモジュールに渡し、ビゼーム（口形状）タイミングデータを生成。  
  * 生成されたビゼームデータをVRMのブレンドシェイプ値に変換し、VRMViewer コンポーネントに提供。  
* **主要機能**:  
  * 音声ファイルのプリロード、再生、一時停止、停止。  
  * audio.currentTime とビゼームデータを同期させ、適切なブレンドシェイプ値を計算。  
  * Rhubarb WASMモジュールの初期化と実行。  
* **状態**: 現在再生中の音声、再生状態、生成されたビゼームデータ、現在のブレンドシェイプ値。

### **6.2. バックエンドコンポーネント (FastAPI)**

#### **6.2.1. WebSocketManager / エンドポイントハンドラ**

* **責務**: WebSocket接続のライフサイクル管理、メッセージの受信・解析・ルーティング、メッセージの送信。  
* **主要機能**:  
  * 接続ごとのセッション管理（必要に応じて）。  
  * 受信メッセージタイプに応じた処理（チャットロジック呼び出し、VRMロード指示など）。  
  * LLM応答やTTS通知を適切なクライアントに送信。  
* **Pydanticモデル**: セクション4.2のメッセージスキーマを使用。

#### **6.2.2. LLMChatService (LangChain利用)**

* **責務**: LLMとの対話処理。  
* **主要機能**:  
  * ユーザー入力と会話履歴からLLMへのプロンプトを構築。  
  * LangChainのChainまたはAgentを使用してLLM APIを呼び出し。  
  * LLMからの応答をストリーミングで取得・処理。  
  * 会話履歴の管理（LangChainのMemoryモジュール利用）。  
* **設定**: config.yaml の llm セクションから読み込み。

#### **6.2.3. TTSService (Style-Bert-VITS2連携)**

* **責務**: テキストから音声を合成。  
* **主要機能**:  
  * Style-Bert-VITS2の推論関数を呼び出し、音声データを生成 (WAV形式)。  
  * 生成された音声ファイルの一時保存とURL提供（HTTP配信の場合）。  
  * オプションで音声キャッシュ機能。  
* **設定**: config.yaml の tts セクションから読み込み。  
* **Pydanticモデル**: TTSRequest, TTSResponse (セクション4.1.2参照)。

#### **6.2.4. ConversationContextManager**

* **責務**: ユーザーセッションごとの会話コンテキスト（履歴、LLMメモリなど）を管理。  
* **主要機能**:  
  * セッションIDに基づいたコンテキストの保存と取得。  
  * LangChainのMemoryオブジェクトと連携。  
* **ストレージ**: インメモリ（小規模向け）、Redis（スケール時）、またはデータベース。

## **7\. 主要ワークフロー**

### **7.1. テキストチャットフロー**

sequenceDiagram  
    participant C as クライアント (UI)  
    participant WS\_FE as クライアント (WebSocket)  
    participant WS\_BE as バックエンド (WebSocket)  
    participant LLM\_Svc as バックエンド (LLMService)  
    participant LLM\_API as 外部LLM API  
    participant TTS\_Svc as バックエンド (TTSService)  
    participant SBV2 as Style-Bert-VITS2

    C-\>\>WS\_FE: ユーザーがテキスト入力・送信  
    WS\_FE-\>\>WS\_BE: ClientUserMessage 送信  
    WS\_BE-\>\>LLM\_Svc: テキスト処理依頼 (会話履歴と共に)  
    LLM\_Svc-\>\>LLM\_API: プロンプト送信  
    LLM\_API--\>\>LLM\_Svc: 応答チャンク (ストリーミング)  
    LLM\_Svc--\>\>WS\_BE: 応答チャンク  
    WS\_BE--\>\>WS\_FE: ServerLLMResponseChunk 送信  
    WS\_FE--\>\>C: UIに応答チャンク表示  
    Note right of LLM\_API: 複数回繰り返す  
    LLM\_API-\>\>LLM\_Svc: 応答完了  
    LLM\_Svc-\>\>WS\_BE: 応答完了  
    WS\_BE-\>\>WS\_FE: ServerLLMResponseComplete 送信  
    WS\_FE-\>\>C: UIに全応答表示

    WS\_BE-\>\>TTS\_Svc: 全応答テキストで音声合成依頼  
    TTS\_Svc-\>\>SBV2: テキスト送信  
    SBV2--\>\>TTS\_Svc: 音声データ (WAV) 生成  
    TTS\_Svc--\>\>WS\_BE: 音声準備完了 (音声URL、リップシンク用テキスト)  
    WS\_BE--\>\>WS\_FE: ServerTTSAudioReady 送信  
    WS\_FE-\>\>C: 音声URLとテキスト受信  
    C-\>\>Audio\_Playback: 音声再生 & リップシンク開始 (HTTPで音声取得後)  
    Audio\_Playback-\>\>VRM\_Renderer: ブレンドシェイプ値更新

### **7.2. 音声入力チャットフロー**

テキストチャットフローの最初の部分が以下に置き換わる。

sequenceDiagram  
    participant C as クライアント (UI)  
    participant SpeechAPI as Web Speech API  
    participant WS\_FE as クライアント (WebSocket)  
    participant WS\_BE as バックエンド (WebSocket)

    C-\>\>SpeechAPI: ユーザーが発話開始 (マイクON)  
    SpeechAPI--\>\>C: 音声認識結果 (中間/最終)  
    C-\>\>WS\_FE: ClientVoiceTranscriptMessage 送信  
    WS\_FE-\>\>WS\_BE: ClientVoiceTranscriptMessage 転送  
    Note right of WS\_BE: 以降、テキストチャットフローのLLM処理へ続く

### **7.3. VRM読み込みフロー**

sequenceDiagram  
    participant C as クライアント (UI)  
    participant WS\_FE as クライアント (WebSocket)  
    participant HTTP\_FE as クライアント (HTTP)  
    participant BE\_HTTP as バックエンド (HTTP API)  
    participant VRM\_Renderer as VRMレンダラー

    C-\>\>HTTP\_FE: 初期設定取得リクエスト  
    HTTP\_FE-\>\>BE\_HTTP: GET /api/v1/config/vrm  
    BE\_HTTP--\>\>HTTP\_FE: VRMConfigResponse (利用可能モデルリスト)  
    HTTP\_FE--\>\>C: モデルリスト表示  
    C-\>\>C: ユーザーがVRMモデル選択  
    C-\>\>WS\_FE: ClientLoadVRMMessage 送信 (選択モデルID)  
    WS\_FE-\>\>VRM\_Renderer: モデルロード指示 (モデルURL)  
    VRM\_Renderer--\>\>VRM\_Renderer: VRMファイル非同期ロード  
    alt ロード成功  
        VRM\_Renderer--\>\>C: ロード成功通知  
        C-\>\>WS\_FE: (オプション) ServerVRMLoadedMessage (status: success) をバックエンド経由で通知/ログ  
    else ロード失敗  
        VRM\_Renderer--\>\>C: ロード失敗通知  
        C-\>\>WS\_FE: (オプション) ServerVRMLoadedMessage (status: error) をバックエンド経由で通知/ログ  
    end

(注: VRMロードは主にクライアントサイドで完結し、状態通知のみWebSocketを介するパターンも考えられる。)

## **8\. 非機能要件**

### **8.1. パフォーマンス**

* **応答性**: ユーザー入力からアバターの最初の応答（テキストまたは音声の開始）までの遅延を最小限に抑える。目標値: 2-3秒以内。  
* **リップシンク同期**: 音声と口パクアニメーションのズレを人間が知覚できないレベル（例: \+/- 50ms以内）に抑える。  
* **レンダリング**: VRM表示は最低30FPSを維持する。

### **8.2. セキュリティ**

* **APIキー管理**: LLMやその他の外部サービスのAPIキーはバックエンドで安全に管理し、クライアントに漏洩しないようにする。環境変数やシークレット管理サービスを利用。  
* **入力検証**: 全てのAPIエンドポイント（HTTP、WebSocketメッセージ）で入力値を検証し、不正な入力を拒否する。  
* **CORS**: 適切なCORSポリシーを設定し、許可されたオリジンからのリクエストのみを受け付ける。  
* **WebSocketセキュリティ**: wss:// (TLS) を本番環境で使用。プロンプトインジェクション対策を検討。

### **8.3. スケーラビリティ**

* **バックエンド**: FastAPIサーバーはUvicornワーカー数を調整することでスケール可能。ステートレスな設計を心がけ、必要に応じてロードバランサーを導入。  
* **TTS/LLM**: 外部サービスのレート制限とコストを考慮し、必要に応じてキャッシュ戦略やリトライ機構を導入。  
* **会話コンテキスト管理**: 多数の同時接続ユーザーに対応するため、スケーラブルなストレージ（Redisなど）を検討。

## **9\. 今後の拡張性**

* **感情表現**: LLMの応答から感情を分析し、VRMアバターの表情ブレンドシェイプ（喜怒哀楽など）やジェスチャーに反映させる。  
* **マルチモーダル入力**: テキストや音声だけでなく、画像やジェスチャーによる入力をサポート。  
* **カスタムアバターアップロード**: ユーザーが自身のVRMファイルをアップロードして使用できる機能。  
* **知識ベース連携 (RAG)**: 特定のドキュメントやデータベースを知識源としてLLMと連携させ、より専門的な応答を可能にする。  
* **多言語対応**: UI、LLM、TTSの多言語対応。  
* **高度な会話管理**: より複雑な対話フロー、タスク指向対話のサポート。  
* **オフラインTTS/STT**: より高速な応答やプライバシー向上のため、クライアントサイドまたはオンプレミスでの音声合成・認識エンジンの検討。

## **10\. テスト戦略**

### **10.1. 単体テスト**

* **フロントエンド**: Reactコンポーネント、ユーティリティ関数、状態管理ロジックのテスト (Jest, React Testing Library)。  
* **バックエンド**: FastAPIエンドポイントハンドラ、サービスクラス、ユーティリティ関数のテスト (pytest)。

### **10.2. 結合テスト**

* フロントエンドとバックエンド間のAPI通信 (WebSocket, HTTP) のテスト。  
* LLM連携モジュールと実際のLLM APIとの疎通テスト。  
* TTS連携モジュールとStyle-Bert-VITS2エンジンとの連携テスト。

### **10.3. E2Eテスト**

* ユーザーシナリオに基づいた全体の動作テスト (Playwright, Cypressなど)。  
  * VRMモデルのロードと表示。  
  * テキストチャットと期待される応答・リップシンク。  
  * 音声入力チャットと期待される応答・リップシンク。

### **10.4. パフォーマンステスト**

* 応答時間、FPS、リップシンク同期精度の計測。  
* 負荷テストによる同時接続ユーザー数への耐性評価。

## **11\. デプロイメント考慮事項**

### **11.1. フロントエンド**

* 静的サイトホスティングサービス (Vercel, Netlify, AWS S3 \+ CloudFrontなど) にデプロイ。  
* ビルドプロセスで最適化（コード分割、圧縮など）。

### **11.2. バックエンド**

* コンテナ化 (Docker)。  
* コンテナオーケストレーションサービス (Kubernetes, AWS ECS, Google Cloud Runなど) またはPaaS (Heroku, Renderなど) にデプロイ。  
* Style-Bert-VITS2のモデルファイルは、コンテナイメージに含めるか、永続ストレージからマウントする。  
* 環境変数はデプロイ環境のシークレット管理機能を利用する。  
* **ロギング**: アプリケーションログ（リクエスト、エラー、主要な処理ステップなど）を構造化ログとして出力し、集中ログ管理システム（例: Elasticsearch \+ Kibana (ELK Stack), AWS CloudWatch Logs, Google Cloud Logging）に集約する。  
* **モニタリング**: サーバーリソース（CPU、メモリ、ディスク、ネットワーク）、APIのレイテンシ、エラーレート、WebSocket接続数などを監視する。Prometheus \+ Grafana、Datadog、New Relicなどの監視ツールを利用。  
* **データベース/キャッシュ**: 会話コンテキスト管理にRedisなどの外部キャッシュ/データベースを使用する場合、それらのデプロイと管理も考慮する（マネージドサービス推奨）。  
* **セキュリティグループ/ファイアウォール**: 必要なポートのみを開放し、不正アクセスを防止する。  
* **オートスケーリング**: トラフィックに応じてサーバーインスタンス数を自動的に増減させる設定を検討（コンテナオーケストレーションサービスが提供