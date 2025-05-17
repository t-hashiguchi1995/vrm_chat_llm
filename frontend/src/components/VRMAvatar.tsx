import React, { useState, useRef, useCallback } from 'react';
import { VRMViewer } from './VRMViewer';
import { LipSyncManager } from './LipSyncManager';
import { VRM } from '@pixiv/three-vrm';
import { VRMModel } from '../types/vrm';

interface VRMAvatarProps {
    vrmUrl: string;
    audioUrl?: string;
    text?: string;
    onError?: (error: Error) => void;
}

export const VRMAvatar: React.FC<VRMAvatarProps> = ({
    vrmUrl,
    audioUrl,
    text,
    onError
}) => {
    const [vrm, setVrm] = useState<VRM | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const handleVRMLoad = (vrm: VRM) => {
        setVrm(vrm);
    };

    return (
        <div style={styles.container}>
            <VRMViewer
                vrmUrl={vrmUrl}
                onLoad={handleVRMLoad}
                onError={onError}
            />
            {vrm && audioUrl && text && (
                <>
                    <audio
                        ref={audioRef}
                        src={audioUrl}
                        style={{ display: 'none' }}
                    />
                    <LipSyncManager
                        vrm={vrm}
                        audioElement={audioRef.current!}
                        text={text}
                        onError={onError}
                    />
                </>
            )}
        </div>
    );
};

const styles = {
    container: {
        width: '100%',
        height: '100%',
        position: 'relative' as const,
        overflow: 'hidden',
    },
}; 