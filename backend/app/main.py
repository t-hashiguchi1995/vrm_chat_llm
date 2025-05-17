from fastapi import FastAPI, WebSocket, Depends
from fastapi.middleware.cors import CORSMiddleware
from .core.config import get_settings
from .api.websocket import websocket_endpoint
import uuid

settings = get_settings()

app = FastAPI(title="VRM Chat Backend")

# CORSミドルウェアの設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ALLOW_ORIGINS,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=settings.CORS_ALLOW_METHODS,
    allow_headers=settings.CORS_ALLOW_HEADERS,
)

@app.get("/")
async def root():
    return {"message": "VRM Chat Backend API"}

@app.websocket("/ws/{client_id}")
async def websocket_route(websocket: WebSocket, client_id: str = None):
    if client_id is None:
        client_id = str(uuid.uuid4())
    await websocket_endpoint(websocket, client_id)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        log_level=settings.LOG_LEVEL,
        reload=True
    )