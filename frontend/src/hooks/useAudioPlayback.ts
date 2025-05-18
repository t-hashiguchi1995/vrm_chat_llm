import { useState, useRef, useCallback } from 'react';

interface AudioPlaybackHook {
    playAudio: (audioUrl: string) => Promise<void>;
    playAudioStream: (audioChunk: Float32Array) => void;
    stopAudio: () => void;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
}

export const useAudioPlayback = (): AudioPlaybackHook => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioQueueRef = useRef<Float32Array[]>([]);
    const isProcessingRef = useRef(false);

    const processAudioQueue = useCallback(async () => {
        if (isProcessingRef.current || audioQueueRef.current.length === 0) return;

        isProcessingRef.current = true;
        const audioContext = audioContextRef.current;
        if (!audioContext) return;

        while (audioQueueRef.current.length > 0) {
            const audioChunk = audioQueueRef.current.shift();
            if (!audioChunk) continue;

            const audioBuffer = audioContext.createBuffer(1, audioChunk.length, 44100);
            audioBuffer.getChannelData(0).set(audioChunk);

            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);
            source.start();

            // チャンクの再生時間を待機
            await new Promise(resolve => setTimeout(resolve, (audioChunk.length / 44100) * 1000));
        }

        isProcessingRef.current = false;
    }, []);

    const playAudioStream = useCallback((audioChunk: Float32Array) => {
        if (!audioContextRef.current) {
            audioContextRef.current = new AudioContext();
        }

        audioQueueRef.current.push(audioChunk);
        setIsPlaying(true);
        processAudioQueue();
    }, [processAudioQueue]);

    const playAudio = useCallback(async (audioUrl: string) => {
        try {
            if (!audioRef.current) {
                audioRef.current = new Audio();
            }

            // 既存のイベントリスナーをクリア
            audioRef.current.onended = null;
            audioRef.current.ontimeupdate = null;
            audioRef.current.ondurationchange = null;

            // 新しい音声を設定
            audioRef.current.src = audioUrl;
            
            // イベントリスナーを設定
            audioRef.current.onended = () => {
                setIsPlaying(false);
                setCurrentTime(0);
            };

            audioRef.current.ontimeupdate = () => {
                if (audioRef.current) {
                    setCurrentTime(audioRef.current.currentTime);
                }
            };

            audioRef.current.ondurationchange = () => {
                if (audioRef.current) {
                    setDuration(audioRef.current.duration);
                }
            };

            // 音声を再生
            await audioRef.current.play();
            setIsPlaying(true);
        } catch (error) {
            console.error('音声の再生に失敗しました:', error);
            throw error;
        }
    }, []);

    const stopAudio = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlaying(false);
            setCurrentTime(0);
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        audioQueueRef.current = [];
        isProcessingRef.current = false;
    }, []);

    return {
        playAudio,
        playAudioStream,
        stopAudio,
        isPlaying,
        currentTime,
        duration
    };
}; 