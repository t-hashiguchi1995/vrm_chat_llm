import { useState, useCallback, useEffect } from 'react';

interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
    resultIndex: number;
    interpretation: any;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message: string;
}

interface SpeechRecognitionResultList {
    [index: number]: SpeechRecognitionResult;
    length: number;
}

interface SpeechRecognitionResult {
    [index: number]: SpeechRecognitionAlternative;
    isFinal: boolean;
    length: number;
}

interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    maxAlternatives: number;
    onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
    onnomatch: ((this: SpeechRecognition, ev: Event) => any) | null;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    start(): void;
    stop(): void;
    abort(): void;
}

interface UseSpeechRecognitionProps {
    onTranscript: (transcript: string, isFinal: boolean) => void;
    onError?: (error: string) => void;
    language?: string;
}

interface SpeechRecognitionState {
    isListening: boolean;
    isSupported: boolean;
    error: string | null;
}

export const useSpeechRecognition = ({
    onTranscript,
    onError,
    language = 'ja-JP'
}: UseSpeechRecognitionProps): SpeechRecognitionState => {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Web Speech APIのサポート確認
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        setIsSupported(!!SpeechRecognition);
    }, []);

    const startListening = useCallback(() => {
        if (!isSupported) {
            setError('このブラウザは音声認識をサポートしていません。');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = language;
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onstart = () => {
            setIsListening(true);
            setError(null);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            const errorMessage = event.error === 'not-allowed'
                ? 'マイクの使用が許可されていません。'
                : `音声認識エラー: ${event.error}`;
            setError(errorMessage);
            setIsListening(false);
            onError?.(errorMessage);
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            const transcript = Array.from(event.results)
                .map(result => result[0].transcript)
                .join('');

            const isFinal = event.results[0].isFinal;
            onTranscript(transcript, isFinal);
        };

        try {
            recognition.start();
        } catch (err) {
            setError('音声認識の開始に失敗しました。');
            onError?.('音声認識の開始に失敗しました。');
        }
    }, [isSupported, language, onTranscript, onError]);

    const stopListening = useCallback(() => {
        if (!isSupported) return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.stop();
    }, [isSupported]);

    // コンポーネントのアンマウント時に音声認識を停止
    useEffect(() => {
        return () => {
            if (isListening) {
                stopListening();
            }
        };
    }, [isListening, stopListening]);

    return {
        isListening,
        isSupported,
        error
    };
};

// TypeScriptの型定義を拡張
declare global {
    interface Window {
        SpeechRecognition: new () => SpeechRecognition;
        webkitSpeechRecognition: new () => SpeechRecognition;
    }
} 