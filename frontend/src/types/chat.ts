export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

export interface ChatState {
    messages: Message[];
    isLoading: boolean;
    error: string | null;
}

export interface ChatInputProps {
    onSendMessage: (text: string) => void;
    isLoading: boolean;
}

export interface MessageListProps {
    messages: Message[];
} 