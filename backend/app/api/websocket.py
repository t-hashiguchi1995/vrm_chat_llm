import json
from typing import Dict, Optional
from fastapi import WebSocket, WebSocketDisconnect
from ..services.llm_service import LLMService
from ..schemas.websocket import (
    ClientMessage,
    ServerMessage,
    ServerMessageType,
    ClientMessageType
)

class WebSocketManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.llm_service = LLMService()

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket

    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]

    async def send_message(self, client_id: str, message: ServerMessage):
        if client_id in self.active_connections:
            await self.active_connections[client_id].send_json(message.dict())

    async def handle_message(self, websocket: WebSocket, client_id: str, message: ClientMessage):
        try:
            if message.type == ClientMessageType.USER_MESSAGE:
                # LLM応答の生成とストリーミング
                async for chunk in self.llm_service.generate_response(
                    message.payload["text"],
                    message.payload.get("conversation_id")
                ):
                    await self.send_message(
                        client_id,
                        ServerMessage(
                            type=ServerMessageType.LLM_RESPONSE_CHUNK,
                            payload={"text_chunk": chunk}
                        )
                    )

                # 応答完了通知
                await self.send_message(
                    client_id,
                    ServerMessage(
                        type=ServerMessageType.LLM_RESPONSE_COMPLETE,
                        payload={"status": "success"}
                    )
                )

            elif message.type == ClientMessageType.PING:
                await self.send_message(
                    client_id,
                    ServerMessage(type=ServerMessageType.PONG)
                )

        except Exception as e:
            await self.send_message(
                client_id,
                ServerMessage(
                    type=ServerMessageType.ERROR_MESSAGE,
                    payload={"message": str(e)}
                )
            )

manager = WebSocketManager()

async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_text()
            message = ClientMessage.parse_raw(data)
            await manager.handle_message(websocket, client_id, message)
    except WebSocketDisconnect:
        manager.disconnect(client_id)
    except Exception as e:
        await manager.send_message(
            client_id,
            ServerMessage(
                type=ServerMessageType.ERROR_MESSAGE,
                payload={"message": str(e)}
            )
        )
        manager.disconnect(client_id) 