import { VRM } from '@pixiv/three-vrm';

export interface VRMModel {
    vrm: VRM;
    modelId: string;
}

export interface VRMViewerProps {
    modelUrl: string;
    onModelLoaded?: (model: VRMModel) => void;
    onError?: (error: Error) => void;
}

export interface VRMAnimationState {
    isTalking: boolean;
    isThinking: boolean;
    emotion?: 'happy' | 'angry' | 'sad' | 'neutral';
} 