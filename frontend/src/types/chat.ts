export interface Message {
    id?: string;
    type: 'user' | 'assistant';
    content: string;
    timestamp: string;
    role?: 'user' | 'assistant';
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