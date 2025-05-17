import React, { useState } from 'react';
import { VRMViewer } from './VRMViewer';
import VRMAnimationController from './VRMAnimationController';
import { VRMModel, VRMAnimationState } from '../types/vrm';
import { VRM } from '@pixiv/three-vrm';

interface VRMContainerProps {
    modelUrl: string;
    onError?: (error: Error) => void;
}

const VRMContainer: React.FC<VRMContainerProps> = ({ modelUrl, onError }) => {
    const [vrmModel, setVrmModel] = useState<VRMModel | null>(null);
    const [animationState, setAnimationState] = useState<VRMAnimationState>({
        isTalking: false,
        isThinking: false,
        emotion: 'neutral'
    });

    const handleModelLoaded = (vrm: VRM) => {
        setVrmModel({ vrm, modelId: modelUrl });
    };

    const handleError = (error: Error) => {
        if (onError) {
            onError(error);
        }
    };

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <VRMViewer
                vrmUrl={modelUrl}
                onLoad={handleModelLoaded}
                onError={handleError}
            />
            {vrmModel && (
                <VRMAnimationController
                    vrm={vrmModel.vrm}
                    animationState={animationState}
                />
            )}
        </div>
    );
};

export default VRMContainer; 