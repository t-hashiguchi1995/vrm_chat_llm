import { useState, useEffect, useCallback } from 'react';

interface WebSocketHook {
    sendMessage: (message: any) => void;
    lastMessage: string | null;
    isConnected: boolean;
}

export const useWebSocket = (url: string): WebSocketHook => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [lastMessage, setLastMessage] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const ws = new WebSocket(url);

        ws.onopen = () => {
            console.log('WebSocket接続が確立されました');
            setIsConnected(true);
        };

        ws.onclose = () => {
            console.log('WebSocket接続が切断されました');
            setIsConnected(false);
        };

        ws.onmessage = (event) => {
            setLastMessage(event.data);
        };

        ws.onerror = (error) => {
            console.error('WebSocketエラー:', error);
        };

        setSocket(ws);

        return () => {
            ws.close();
        };
    }, [url]);

    const sendMessage = useCallback((message: any) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(message));
        }
    }, [socket]);

    return { sendMessage, lastMessage, isConnected };
}; 