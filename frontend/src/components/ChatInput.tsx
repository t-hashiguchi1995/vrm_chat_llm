import React, { useState, useRef } from 'react';

interface ChatInputProps {
    onSendMessage: (text: string) => void;
    onStartVoiceInput: () => void;
    onStopVoiceInput: () => void;
    isVoiceInputActive: boolean;
    isVoiceSupported: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
    onSendMessage,
    onStartVoiceInput,
    onStopVoiceInput,
    isVoiceInputActive
}) => {
    const [message, setMessage] = useState('');
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim()) {
            onSendMessage(message.trim());
            setMessage('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const containerStyle: React.CSSProperties = {
        display: 'flex',
        padding: '10px',
        backgroundColor: 'white',
        borderTop: '1px solid #E0E0E0',
    };

    const inputStyle: React.CSSProperties = {
        flex: 1,
        padding: '10px',
        borderRadius: '20px',
        border: '1px solid #E0E0E0',
        marginRight: '10px',
        resize: 'none',
        minHeight: '40px',
        maxHeight: '120px',
    };

    const buttonStyle: React.CSSProperties = {
        padding: '10px 20px',
        borderRadius: '20px',
        border: 'none',
        backgroundColor: '#007AFF',
        color: 'white',
        cursor: 'pointer',
    };

    const voiceButtonStyle: React.CSSProperties = {
        ...buttonStyle,
        backgroundColor: isVoiceInputActive ? '#FF3B30' : '#007AFF',
        marginRight: '10px',
    };

    return (
        <form onSubmit={handleSubmit} style={containerStyle}>
            <textarea
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="メッセージを入力..."
                style={inputStyle}
            />
            <button
                type="button"
                onClick={isVoiceInputActive ? onStopVoiceInput : onStartVoiceInput}
                style={voiceButtonStyle}
            >
                {isVoiceInputActive ? '停止' : '音声'}
            </button>
            <button type="submit" style={buttonStyle}>
                送信
            </button>
        </form>
    );
};

export default ChatInput; 