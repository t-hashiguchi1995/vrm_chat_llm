import React from 'react';
import { Message } from '../types/chat';

interface ChatMessageProps {
    message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
    const isUser = message.role === 'user';

    return (
        <div style={{
            ...styles.container,
            justifyContent: isUser ? 'flex-end' : 'flex-start',
        }}>
            <div style={{
                ...styles.bubble,
                backgroundColor: isUser ? '#007AFF' : '#E9ECEF',
                color: isUser ? '#FFFFFF' : '#212529',
            }}>
                <p style={styles.text}>{message.content}</p>
                <span style={styles.timestamp}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                </span>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        marginBottom: '0.5rem',
    },
    bubble: {
        maxWidth: '70%',
        padding: '0.75rem 1rem',
        borderRadius: '1rem',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
    },
    text: {
        margin: 0,
        fontSize: '0.9rem',
        lineHeight: 1.4,
    },
    timestamp: {
        display: 'block',
        fontSize: '0.7rem',
        marginTop: '0.25rem',
        opacity: 0.7,
    },
}; 