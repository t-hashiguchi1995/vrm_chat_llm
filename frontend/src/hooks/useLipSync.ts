import { useState, useCallback } from 'react';

interface LipSyncHook {
    generateLipSyncData: (text: string) => Promise<LipSyncData>;
    getCurrentLipShape: (currentTime: number) => LipShape;
}

interface LipSyncData {
    phonemes: Phoneme[];
    duration: number;
}

interface Phoneme {
    start: number;
    end: number;
    phoneme: string;
}

interface LipShape {
    a: number;  // あ
    i: number;  // い
    u: number;  // う
    e: number;  // え
    o: number;  // お
}

// 音素から口形状への変換マッピング
const PHONEME_TO_LIP_SHAPE: Record<string, LipShape> = {
    'a': { a: 1.0, i: 0.0, u: 0.0, e: 0.0, o: 0.0 },
    'i': { a: 0.0, i: 1.0, u: 0.0, e: 0.0, o: 0.0 },
    'u': { a: 0.0, i: 0.0, u: 1.0, e: 0.0, o: 0.0 },
    'e': { a: 0.0, i: 0.0, u: 0.0, e: 1.0, o: 0.0 },
    'o': { a: 0.0, i: 0.0, u: 0.0, e: 0.0, o: 1.0 },
    'sil': { a: 0.0, i: 0.0, u: 0.0, e: 0.0, o: 0.0 },
};

export const useLipSync = (): LipSyncHook => {
    const [lipSyncData, setLipSyncData] = useState<LipSyncData | null>(null);

    const generateLipSyncData = useCallback(async (text: string): Promise<LipSyncData> => {
        try {
            // 注: 実際のリップシンクデータ生成は、Rhubarb Lip Syncなどの
            // 外部ライブラリを使用して実装する必要があります
            // ここでは簡易的な実装として、テキストを音素に分割し、
            // 各音素に適当な時間を割り当てています
            
            const phonemes: Phoneme[] = [];
            let currentTime = 0;
            const phonemeDuration = 0.1; // 各音素の長さ（秒）

            // テキストを音素に分割（簡易実装）
            for (const char of text) {
                const phoneme = char.toLowerCase();
                if (phoneme in PHONEME_TO_LIP_SHAPE) {
                    phonemes.push({
                        start: currentTime,
                        end: currentTime + phonemeDuration,
                        phoneme
                    });
                    currentTime += phonemeDuration;
                }
            }

            const data: LipSyncData = {
                phonemes,
                duration: currentTime
            };

            setLipSyncData(data);
            return data;
        } catch (error) {
            console.error('リップシンクデータの生成に失敗しました:', error);
            throw error;
        }
    }, []);

    const getCurrentLipShape = useCallback((currentTime: number): LipShape => {
        if (!lipSyncData) {
            return { a: 0, i: 0, u: 0, e: 0, o: 0 };
        }

        // 現在の時間に対応する音素を探す
        const currentPhoneme = lipSyncData.phonemes.find(
            p => currentTime >= p.start && currentTime < p.end
        );

        if (currentPhoneme) {
            return PHONEME_TO_LIP_SHAPE[currentPhoneme.phoneme];
        }

        return { a: 0, i: 0, u: 0, e: 0, o: 0 };
    }, [lipSyncData]);

    return {
        generateLipSyncData,
        getCurrentLipShape
    };
}; 