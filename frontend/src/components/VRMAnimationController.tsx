import React, { useEffect, useRef } from 'react';
import { VRM } from '@pixiv/three-vrm';
import { VRMAnimationState } from '../types/vrm';

interface VRMAnimationControllerProps {
    vrm: VRM;
    animationState: VRMAnimationState;
}

const VRMAnimationController: React.FC<VRMAnimationControllerProps> = ({ vrm, animationState }) => {
    const prevStateRef = useRef<VRMAnimationState>(animationState);
    const animationTimeRef = useRef(0);

    useEffect(() => {
        // ブレンドシェイプの値を更新
        if (vrm.expressionManager) {
            // 話している時の口の動き
            if (animationState.isTalking) {
                vrm.expressionManager.setValue('aa', 0.5);
                vrm.expressionManager.setValue('ih', 0.3);
                vrm.expressionManager.setValue('ou', 0.2);
            } else {
                vrm.expressionManager.setValue('aa', 0);
                vrm.expressionManager.setValue('ih', 0);
                vrm.expressionManager.setValue('ou', 0);
            }

            // 感情表現
            if (animationState.emotion) {
                switch (animationState.emotion) {
                    case 'happy':
                        vrm.expressionManager.setValue('happy', 1.0);
                        vrm.expressionManager.setValue('angry', 0);
                        vrm.expressionManager.setValue('sad', 0);
                        break;
                    case 'angry':
                        vrm.expressionManager.setValue('happy', 0);
                        vrm.expressionManager.setValue('angry', 1.0);
                        vrm.expressionManager.setValue('sad', 0);
                        break;
                    case 'sad':
                        vrm.expressionManager.setValue('happy', 0);
                        vrm.expressionManager.setValue('angry', 0);
                        vrm.expressionManager.setValue('sad', 1.0);
                        break;
                    default:
                        vrm.expressionManager.setValue('happy', 0);
                        vrm.expressionManager.setValue('angry', 0);
                        vrm.expressionManager.setValue('sad', 0);
                }
            }

            // 考えている時の表情
            if (animationState.isThinking) {
                vrm.expressionManager.setValue('thinking', 1.0);
            } else {
                vrm.expressionManager.setValue('thinking', 0);
            }
        }

        // ボーンのアニメーション
        if (vrm.humanoid) {
            const humanoid = vrm.humanoid;
            const time = animationTimeRef.current;

            // アイドルアニメーション
            if (!animationState.isTalking && !animationState.isThinking) {
                // 呼吸の動き
                const breath = Math.sin(time * 2) * 0.02;
                humanoid.getBoneNode('spine')?.rotation.set(breath, 0, 0);
                humanoid.getBoneNode('chest')?.rotation.set(breath * 0.5, 0, 0);

                // 自然な首の動き
                const neckRotation = Math.sin(time * 0.5) * 0.05;
                humanoid.getBoneNode('neck')?.rotation.set(neckRotation, 0, 0);
            }

            // 感情に応じた姿勢
            if (animationState.emotion) {
                switch (animationState.emotion) {
                    case 'happy':
                        // 明るい姿勢
                        humanoid.getBoneNode('spine')?.rotation.set(0.1, 0, 0);
                        humanoid.getBoneNode('chest')?.rotation.set(0.05, 0, 0);
                        break;
                    case 'angry':
                        // 前傾姿勢
                        humanoid.getBoneNode('spine')?.rotation.set(-0.1, 0, 0);
                        humanoid.getBoneNode('chest')?.rotation.set(-0.05, 0, 0);
                        break;
                    case 'sad':
                        // うなだれた姿勢
                        humanoid.getBoneNode('spine')?.rotation.set(-0.15, 0, 0);
                        humanoid.getBoneNode('chest')?.rotation.set(-0.1, 0, 0);
                        break;
                }
            }
        }

        // アニメーション時間の更新
        animationTimeRef.current += 0.016; // 約60FPS

        prevStateRef.current = animationState;
    }, [vrm, animationState]);

    return null;
};

export default VRMAnimationController; 