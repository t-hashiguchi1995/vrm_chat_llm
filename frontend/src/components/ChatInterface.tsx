import { useState, useCallback } from 'react';
import { ClientMessageType } from '../types/websocket';
import { useWebSocket } from '../hooks/useWebSocket';

interface Message {
    text: string;
    isUser: boolean;
    timestamp: Date;
}

export const ChatInterface: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isRecording, setIsRecording] = useState(false);

    const handleWebSocketMessage = useCallback((message: any) => {
        if (message.type === 'llm_response_chunk') {
            setMessages(prev => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage && !lastMessage.isUser) {
                    return [
                        ...prev.slice(0, -1),
                        {
                            ...lastMessage,
                            text: lastMessage.text + message.payload.text_chunk
                        }
                    ];
                } else {
                    return [
                        ...prev,
                        {
                            text: message.payload.text_chunk,
                            isUser: false,
                            timestamp: new Date()
                        }
                    ];
                }
            });
        }
    }, []);

    const { sendMessage, isConnected } = useWebSocket(handleWebSocketMessage);

    const handleSendMessage = useCallback(() => {
        if (!inputText.trim()) return;

        const message: Message = {
            text: inputText,
            isUser: true,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, message]);
        sendMessage({
            type: ClientMessageType.USER_MESSAGE,
            payload: { text: inputText }
        });
        setInputText('');
    }, [inputText, sendMessage]);

    const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    }, [handleSendMessage]);

    const toggleRecording = useCallback(() => {
        if (!isRecording) {
            // 音声認識の開始
            if ('webkitSpeechRecognition' in window) {
                const recognition = new (window as any).webkitSpeechRecognition();
                recognition.lang = 'ja-JP';
                recognition.continuous = true;
                recognition.interimResults = true;

                recognition.onresult = (event: any) => {
                    const transcript = event.results[event.results.length - 1][0].transcript;
                    if (event.results[event.results.length - 1].isFinal) {
                        sendMessage({
                            type: ClientMessageType.VOICE_TRANSCRIPT,
                            payload: {
                                transcript,
                                is_final: true
                            }
                        });
                    }
                };

                recognition.start();
                setIsRecording(true);
            }
        } else {
            // 音声認識の停止
            setIsRecording(false);
        }
    }, [isRecording, sendMessage]);

    return (
        <div className="chat-interface">
            <div className="connection-status">
                {isConnected ? (
                    <span className="connected">接続中</span>
                ) : (
                    <span className="disconnected">接続待機中...</span>
                )}
            </div>
            <div className="messages">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`message ${message.isUser ? 'user' : 'bot'}`}
                    >
                        <div className="message-content">{message.text}</div>
                        <div className="message-timestamp">
                            {message.timestamp.toLocaleTimeString()}
                        </div>
                    </div>
                ))}
            </div>
            <div className="input-area">
                <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="メッセージを入力..."
                    disabled={!isConnected}
                />
                <button
                    onClick={handleSendMessage}
                    disabled={!isConnected || !inputText.trim()}
                >
                    送信
                </button>
                <button
                    onClick={toggleRecording}
                    className={isRecording ? 'recording' : ''}
                    disabled={!isConnected}
                >
                    {isRecording ? '停止' : '音声入力'}
                </button>
            </div>
            <style jsx>{`
                .chat-interface {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    padding: 1rem;
                }

                .connection-status {
                    text-align: center;
                    margin-bottom: 1rem;
                    font-size: 0.9rem;
                }

                .connected {
                    color: #28a745;
                }

                .disconnected {
                    color: #dc3545;
                }

                .messages {
                    flex: 1;
                    overflow-y: auto;
                    margin-bottom: 1rem;
                    padding: 0.5rem;
                }

                .message {
                    margin-bottom: 1rem;
                    padding: 0.75rem;
                    border-radius: 0.5rem;
                    max-width: 80%;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
                }

                .message.user {
                    background-color: #e3f2fd;
                    margin-left: auto;
                }

                .message.bot {
                    background-color: #f5f5f5;
                    margin-right: auto;
                }

                .message-content {
                    margin-bottom: 0.25rem;
                    word-wrap: break-word;
                }

                .message-timestamp {
                    font-size: 0.75rem;
                    color: #666;
                    text-align: right;
                }

                .input-area {
                    display: flex;
                    gap: 0.5rem;
                    padding: 0.5rem;
                    background-color: #f8f9fa;
                    border-radius: 0.5rem;
                }

                textarea {
                    flex: 1;
                    padding: 0.75rem;
                    border: 1px solid #dee2e6;
                    border-radius: 0.25rem;
                    resize: none;
                    height: 2.5rem;
                    font-size: 0.9rem;
                }

                textarea:focus {
                    outline: none;
                    border-color: #80bdff;
                    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
                }

                button {
                    padding: 0.5rem 1rem;
                    border: none;
                    border-radius: 0.25rem;
                    background-color: #007bff;
                    color: white;
                    cursor: pointer;
                    font-size: 0.9rem;
                    transition: background-color 0.2s;
                }

                button:hover {
                    background-color: #0056b3;
                }

                button:disabled {
                    background-color: #ccc;
                    cursor: not-allowed;
                }

                button.recording {
                    background-color: #dc3545;
                }

                button.recording:hover {
                    background-color: #c82333;
                }
            `}</style>
        </div>
    );
}; 