export interface SpeechRecognitionResult {
    transcript: string;
    isFinal: boolean;
}

export interface SpeechRecognitionError {
    error: string;
    message: string;
}

export interface SpeechRecognitionState {
    isListening: boolean;
    transcript: string;
    error: SpeechRecognitionError | null;
}

export interface SpeechRecognitionProps {
    onResult: (result: SpeechRecognitionResult) => void;
    onError: (error: SpeechRecognitionError) => void;
    language?: string;
} 