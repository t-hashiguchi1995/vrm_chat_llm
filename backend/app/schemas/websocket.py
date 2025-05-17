from enum import Enum
from typing import Optional, Union
from pydantic import BaseModel, Field

class ClientMessageType(str, Enum):
    USER_MESSAGE = "user_message"
    VOICE_TRANSCRIPT = "voice_transcript"
    LOAD_VRM = "load_vrm"
    PING = "ping"

class ServerMessageType(str, Enum):
    LLM_RESPONSE_CHUNK = "llm_response_chunk"
    LLM_RESPONSE_COMPLETE = "llm_response_complete"
    TTS_AUDIO_READY = "tts_audio_ready"
    ERROR_MESSAGE = "error_message"
    VRM_LOADED = "vrm_loaded"
    PONG = "pong"

# Client to Server Messages
class ClientUserMessage(BaseModel):
    type: ClientMessageType = ClientMessageType.USER_MESSAGE
    payload: dict = Field(..., description="メッセージのペイロード")

class ClientVoiceTranscriptMessage(BaseModel):
    type: ClientMessageType = ClientMessageType.VOICE_TRANSCRIPT
    payload: dict = Field(..., description="音声認識結果のペイロード")

class ClientLoadVRMMessage(BaseModel):
    type: ClientMessageType = ClientMessageType.LOAD_VRM
    payload: dict = Field(..., description="VRMモデル読み込み要求のペイロード")

class ClientPingMessage(BaseModel):
    type: ClientMessageType = ClientMessageType.PING

# Server to Client Messages
class ServerLLMResponseChunk(BaseModel):
    type: ServerMessageType = ServerMessageType.LLM_RESPONSE_CHUNK
    payload: dict = Field(..., description="LLM応答チャンクのペイロード")

class ServerLLMResponseComplete(BaseModel):
    type: ServerMessageType = ServerMessageType.LLM_RESPONSE_COMPLETE
    payload: dict = Field(..., description="LLM応答完了のペイロード")

class ServerTTSAudioReady(BaseModel):
    type: ServerMessageType = ServerMessageType.TTS_AUDIO_READY
    payload: dict = Field(..., description="TTS音声準備完了のペイロード")

class ServerErrorMessage(BaseModel):
    type: ServerMessageType = ServerMessageType.ERROR_MESSAGE
    payload: dict = Field(..., description="エラーメッセージのペイロード")

class ServerVRMLoadedMessage(BaseModel):
    type: ServerMessageType = ServerMessageType.VRM_LOADED
    payload: dict = Field(..., description="VRMモデル読み込み完了のペイロード")

class ServerPongMessage(BaseModel):
    type: ServerMessageType = ServerMessageType.PONG

# Union types for message handling
ClientMessage = Union[
    ClientUserMessage,
    ClientVoiceTranscriptMessage,
    ClientLoadVRMMessage,
    ClientPingMessage
]

ServerMessage = Union[
    ServerLLMResponseChunk,
    ServerLLMResponseComplete,
    ServerTTSAudioReady,
    ServerErrorMessage,
    ServerVRMLoadedMessage,
    ServerPongMessage
] 