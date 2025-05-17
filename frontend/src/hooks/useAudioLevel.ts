import { useState, useEffect, useCallback } from 'react';

interface UseAudioLevelProps {
    isActive: boolean;
    onError?: (error: string) => void;
}

export const useAudioLevel = ({ isActive, onError }: UseAudioLevelProps) => {
    const [volume, setVolume] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const startAudioAnalysis = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const audioContext = new AudioContext();
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);

            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            const updateVolume = () => {
                if (!isActive) {
                    setVolume(0);
                    return;
                }

                analyser.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
                const normalizedVolume = average / 128; // 0-1の範囲に正規化
                setVolume(normalizedVolume);

                requestAnimationFrame(updateVolume);
            };

            updateVolume();

            return () => {
                stream.getTracks().forEach(track => track.stop());
                audioContext.close();
            };
        } catch (err) {
            const errorMessage = 'マイクへのアクセスに失敗しました。';
            setError(errorMessage);
            onError?.(errorMessage);
            return () => {};
        }
    }, [isActive, onError]);

    useEffect(() => {
        if (isActive) {
            const cleanup = startAudioAnalysis();
            return () => {
                cleanup.then(cleanupFn => cleanupFn());
            };
        } else {
            setVolume(0);
        }
    }, [isActive, startAudioAnalysis]);

    return { volume, error };
}; 