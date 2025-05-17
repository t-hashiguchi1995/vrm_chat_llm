import React, { useEffect, useRef, useCallback } from 'react';
import { VRM } from '@pixiv/three-vrm';

interface LipSyncManagerProps {
    vrm: VRM;
    audioElement: HTMLAudioElement;
    text: string;
    onError?: (error: Error) => void;
}

export const LipSyncManager: React.FC<LipSyncManagerProps> = ({
    vrm,
    audioElement,
    text,
    onError
}) => {
    const animationFrameRef = useRef<number>();
    const lastTimeRef = useRef<number>(0);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
    const dataArrayRef = useRef<Uint8Array | null>(null);

    // オーディオコンテキストの初期化
    const initAudioContext = useCallback(() => {
        if (!audioElement || audioContextRef.current) return;

        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaElementSource(audioElement);

            analyser.fftSize = 256; // FFTサイズを小さくしてパフォーマンスを向上
            source.connect(analyser);
            analyser.connect(audioContext.destination);

            audioContextRef.current = audioContext;
            analyserRef.current = analyser;
            sourceRef.current = source;
            dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
        } catch (error) {
            console.error('Error initializing audio context:', error);
            onError?.(error as Error);
        }
    }, [audioElement, onError]);

    // リップシンクの更新
    const updateLipSync = useCallback((time: number) => {
        if (!audioElement.paused && analyserRef.current && dataArrayRef.current) {
            const currentTime = audioElement.currentTime;
            const deltaTime = time - lastTimeRef.current;
            lastTimeRef.current = time;

            analyserRef.current.getByteFrequencyData(dataArrayRef.current);

            // 低周波帯域（0-1000Hz）の振幅を計算（より自然な口の動きのため）
            const lowFreqData = dataArrayRef.current.slice(0, 10);
            const average = lowFreqData.reduce((a, b) => a + b) / lowFreqData.length;
            const normalizedAmplitude = Math.min(average / 128.0, 1.0);

            // 口の形状を更新（より自然な動きのため）
            const mouthOpen = Math.min(normalizedAmplitude * 1.5, 1.0);
            const mouthWide = Math.min(normalizedAmplitude * 0.8, 1.0);
            const mouthRound = Math.min(normalizedAmplitude * 0.4, 1.0);

            vrm.expressionManager?.setValue('Aa', mouthOpen);
            vrm.expressionManager?.setValue('Ih', mouthWide);
            vrm.expressionManager?.setValue('Ou', mouthRound);
        }

        animationFrameRef.current = requestAnimationFrame(updateLipSync);
    }, [audioElement, vrm]);

    useEffect(() => {
        initAudioContext();
        animationFrameRef.current = requestAnimationFrame(updateLipSync);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }

            // オーディオリソースの解放
            if (sourceRef.current) {
                sourceRef.current.disconnect();
            }
            if (analyserRef.current) {
                analyserRef.current.disconnect();
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, [initAudioContext, updateLipSync]);

    return null;
}; 