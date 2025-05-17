import { useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ClientMessage, ServerMessage } from '../types/websocket';

interface WebSocketHook {
    sendMessage: (message: ClientMessage) => void;
    isConnected: boolean;
}

export const useWebSocket = (
    onMessage: (message: ServerMessage) => void,
    onError?: (error: Error) => void
): WebSocketHook => {
    const ws = useRef<WebSocket | null>(null);
    const clientId = useRef(uuidv4());
    const isConnected = useRef(false);

    const connect = useCallback(() => {
        const wsUrl = `ws://localhost:8000/ws/${clientId.current}`;
        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => {
            console.log('WebSocket接続が確立されました');
            isConnected.current = true;
        };

        ws.current.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data) as ServerMessage;
                onMessage(message);
            } catch (error) {
                console.error('メッセージの解析に失敗しました:', error);
                onError?.(error as Error);
            }
        };

        ws.current.onerror = (error: Event) => {
            console.error('WebSocketエラー:', error);
            onError?.(new Error('WebSocket接続エラー'));
        };

        ws.current.onclose = () => {
            console.log('WebSocket接続が閉じられました');
            isConnected.current = false;
            // 再接続を試みる
            setTimeout(connect, 3000);
        };
    }, [onMessage, onError]);

    useEffect(() => {
        connect();
        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [connect]);

    const sendMessage = useCallback((message: ClientMessage) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(message));
        } else {
            console.error('WebSocketが接続されていません');
            onError?.(new Error('WebSocketが接続されていません'));
        }
    }, [onError]);

    return {
        sendMessage,
        isConnected: isConnected.current
    };
}; 