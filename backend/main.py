from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from typing import Dict, List, Optional
import json
import asyncio
from pydantic import BaseModel
from datetime import datetime
from services.tts_service import TTSService
import os
import base64
import numpy as np

app = FastAPI()

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # フロントエンドのURL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 静的ファイルのマウント
app.mount("/audio", StaticFiles(directory="temp"), name="audio")

# TTSサービスの初期化
tts_service = TTSService(
    model_path="models/style_bert_vits2",
    config_path="models/style_bert_vits2/config.json"
)

# WebSocket接続を管理するクラス
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket

    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]

    async def send_message(self, message: dict, client_id: str):
        if client_id in self.active_connections:
            await self.active_connections[client_id].send_json(message)

    async def send_audio_chunk(self, audio_chunk: np.ndarray, client_id: str):
        if client_id in self.active_connections:
            # 音声データをBase64エンコード
            audio_base64 = base64.b64encode(audio_chunk.tobytes()).decode('utf-8')
            message = {
                "type": "audio_chunk",
                "payload": {
                    "audio": audio_base64,
                    "timestamp": datetime.now().timestamp()
                }
            }
            await self.active_connections[client_id].send_json(message)

manager = ConnectionManager()

# リアルタイム音声合成のコールバック
async def audio_chunk_callback(audio_chunk: np.ndarray, client_id: str):
    await manager.send_audio_chunk(audio_chunk, client_id)

# WebSocketエンドポイント
@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # メッセージタイプに応じた処理
            if message["type"] == "user_message":
                # LLM応答のシミュレーション（実際のLLM連携は後で実装）
                response_text = "こんにちは！VRMアバターとお話しできて嬉しいです。"
                
                # 応答をチャンクで送信
                response = {
                    "type": "llm_response_chunk",
                    "payload": {
                        "text_chunk": response_text,
                        "conversation_id": str(datetime.now().timestamp())
                    }
                }
                await manager.send_message(response, client_id)
                
                # 応答完了メッセージ
                complete_response = {
                    "type": "llm_response_complete",
                    "payload": {
                        "full_text": response_text,
                        "conversation_id": str(datetime.now().timestamp())
                    }
                }
                await manager.send_message(complete_response, client_id)
                
                # リアルタイム音声合成
                try:
                    await tts_service.synthesize_stream(
                        text=response_text,
                        speaker_id=0,
                        callback=lambda chunk: audio_chunk_callback(chunk, client_id)
                    )
                except Exception as e:
                    error_response = {
                        "type": "error_message",
                        "payload": {
                            "message": f"音声生成に失敗しました: {str(e)}",
                            "code": 500
                        }
                    }
                    await manager.send_message(error_response, client_id)

    except WebSocketDisconnect:
        manager.disconnect(client_id)

# ヘルスチェックエンドポイント
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# 利用可能な話者リストを取得するエンドポイント
@app.get("/api/v1/tts/speakers")
async def get_speakers():
    return {"speakers": tts_service.get_available_speakers()}

# リアルタイム音声合成エンドポイント
@app.post("/api/v1/tts/synthesize/stream")
async def synthesize_stream(
    text: str,
    speaker_id: int = 0,
    style_id: Optional[int] = None,
    style_weight: float = 0.7
):
    try:
        # 音声合成の開始
        await tts_service.synthesize_stream(
            text=text,
            speaker_id=speaker_id,
            style_id=style_id,
            style_weight=style_weight
        )
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 