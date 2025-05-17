import React, { useState } from 'react';
import { Message } from '../types/chat';
import { MessageList } from './MessageList';
import ChatInput from './ChatInput';
import VoiceInputAnimation from './VoiceInputAnimation';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useAudioLevel } from '../hooks/useAudioLevel';

interface ChatContainerProps {
    messages: Message[];
    onSendMessage: (message: string) => void;
    isLoading?: boolean;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
    messages,
    onSendMessage,
    isLoading = false,
}) => {
    const [isVoiceInputActive, setIsVoiceInputActive] = useState(false);
    const [currentTranscript, setCurrentTranscript] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleTranscript = (transcript: string, isFinal: boolean) => {
        setCurrentTranscript(transcript);
        if (isFinal) {
            setIsEditing(true);
        }
    };

    const handleError = (error: string) => {
        setError(error);
    };

    const { isSupported } = useSpeechRecognition({
        onTranscript: handleTranscript,
        onError: handleError,
        language: 'ja-JP',
    });

    const { volume, error: audioError } = useAudioLevel({
        isActive: isVoiceInputActive,
        onError: handleError,
    });

    const handleStartVoiceInput = () => {
        setIsVoiceInputActive(true);
        setError(null);
        setIsEditing(false);
    };

    const handleStopVoiceInput = () => {
        setIsVoiceInputActive(false);
        if (currentTranscript) {
            setIsEditing(true);
        }
    };

    const handleEditSubmit = () => {
        if (currentTranscript.trim()) {
            onSendMessage(currentTranscript.trim());
            setCurrentTranscript('');
            setIsEditing(false);
        }
    };

    const handleEditCancel = () => {
        setCurrentTranscript('');
        setIsEditing(false);
    };

    return (
        <div style={styles.container}>
            <div style={styles.messagesContainer}>
                <MessageList messages={messages} />
                {isLoading && (
                    <div style={styles.loadingContainer}>
                        <div style={styles.loadingIndicator} />
                    </div>
                )}
            </div>
            <div style={styles.inputContainer}>
                {isVoiceInputActive && (
                    <div style={styles.animationContainer}>
                        <VoiceInputAnimation isActive={isVoiceInputActive} volume={volume} />
                    </div>
                )}
                {currentTranscript && (
                    <div style={styles.transcriptContainer}>
                        {isEditing ? (
                            <div style={styles.editContainer}>
                                <textarea
                                    value={currentTranscript}
                                    onChange={(e) => setCurrentTranscript(e.target.value)}
                                    style={styles.editTextarea}
                                    rows={3}
                                />
                                <div style={styles.editButtons}>
                                    <button
                                        onClick={handleEditSubmit}
                                        style={styles.editButton}
                                    >
                                        送信
                                    </button>
                                    <button
                                        onClick={handleEditCancel}
                                        style={styles.cancelButton}
                                    >
                                        キャンセル
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p style={styles.transcript}>{currentTranscript}</p>
                        )}
                    </div>
                )}
                {(error || audioError) && (
                    <div style={styles.errorContainer}>
                        <p style={styles.error}>{error || audioError}</p>
                    </div>
                )}
                <ChatInput
                    onSendMessage={onSendMessage}
                    onStartVoiceInput={handleStartVoiceInput}
                    onStopVoiceInput={handleStopVoiceInput}
                    isVoiceInputActive={isVoiceInputActive}
                    isVoiceSupported={isSupported}
                />
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column' as const,
        height: '100%',
        backgroundColor: '#f5f5f5',
    },
    messagesContainer: {
        flex: 1,
        overflowY: 'auto' as const,
        padding: '1rem',
    },
    loadingContainer: {
        display: 'flex',
        justifyContent: 'center',
        padding: '1rem',
    },
    loadingIndicator: {
        width: '2rem',
        height: '2rem',
        border: '3px solid #f3f3f3',
        borderTop: '3px solid #3498db',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    inputContainer: {
        padding: '1rem',
        backgroundColor: '#fff',
        borderTop: '1px solid #e0e0e0',
    },
    animationContainer: {
        height: '60px',
        marginBottom: '1rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        overflow: 'hidden',
    },
    transcriptContainer: {
        marginBottom: '1rem',
        padding: '0.5rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
    },
    transcript: {
        margin: 0,
        fontSize: '0.9rem',
        color: '#666',
    },
    editContainer: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '0.5rem',
    },
    editTextarea: {
        width: '100%',
        padding: '0.5rem',
        borderRadius: '4px',
        border: '1px solid #dee2e6',
        fontSize: '0.9rem',
        resize: 'vertical' as const,
        minHeight: '60px',
    },
    editButtons: {
        display: 'flex',
        gap: '0.5rem',
        justifyContent: 'flex-end',
    },
    editButton: {
        padding: '0.5rem 1rem',
        backgroundColor: '#28a745',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.9rem',
    },
    cancelButton: {
        padding: '0.5rem 1rem',
        backgroundColor: '#dc3545',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.9rem',
    },
    errorContainer: {
        marginBottom: '1rem',
        padding: '0.5rem',
        backgroundColor: '#fff3f3',
        borderRadius: '8px',
    },
    error: {
        margin: 0,
        fontSize: '0.9rem',
        color: '#dc3545',
    },
}; 