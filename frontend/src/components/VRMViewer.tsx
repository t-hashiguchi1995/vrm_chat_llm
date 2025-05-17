import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { VRM, VRMLoaderPlugin } from '@pixiv/three-vrm';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface VRMViewerProps {
    vrmUrl: string;
    onLoad?: (model: VRM) => void;
    onError?: (error: Error) => void;
}

const VRMScene: React.FC<VRMViewerProps> = ({ vrmUrl, onLoad, onError }) => {
    const { scene, camera } = useThree();
    const vrmRef = useRef<VRM | null>(null);

    useEffect(() => {
        // カメラの初期位置を設定（バストアップ表示用）
        camera.position.set(0, 1.2, 1.5); // 高さ1.2m、後ろ1.5mの位置
        camera.lookAt(0, 1.2, 0); // キャラクターの顔の高さを見る

        // VRMローダーの設定
        const loader = new GLTFLoader();
        loader.register((parser) => new VRMLoaderPlugin(parser));

        // VRMモデルの読み込み
        loader.load(
            vrmUrl,
            (gltf) => {
                const vrm = gltf.userData.vrm;
                if (!vrm) {
                    if (onError) onError(new Error('VRM model failed to load'));
                    return;
                }
                vrmRef.current = vrm;
                scene.add(vrm.scene);

                // モデルの初期位置を調整
                vrm.scene.position.set(0, 0, 0);
                vrm.scene.rotation.y = Math.PI;

                if (onLoad) {
                    onLoad(vrm);
                }
            },
            (progress) => {
                console.log('Loading model...', (progress.loaded / progress.total) * 100);
            },
            (error) => {
                console.error(error);
                if (onError) {
                    onError(error instanceof Error ? error : new Error('Unknown error occurred'));
                }
            }
        );

        return () => {
            if (vrmRef.current) {
                scene.remove(vrmRef.current.scene as unknown as THREE.Object3D);
            }
        };
    }, [vrmUrl, scene, camera, onLoad, onError]);

    useFrame((_, delta) => {
        if (vrmRef.current) {
            // アニメーションの更新
            vrmRef.current.update(delta);
        }
    });

    return (
        <>
            <ambientLight intensity={0.5} />
            <directionalLight
                position={[0, 2, 1]}
                intensity={1}
                castShadow
            />
            <OrbitControls
                enableZoom={false}
                enablePan={false}
                minPolarAngle={Math.PI / 4} // 下の角度制限
                maxPolarAngle={Math.PI / 2} // 上の角度制限
                target={[0, 1.2, 0]} // カメラの注視点（顔の高さ）
            />
        </>
    );
};

export const VRMViewer: React.FC<VRMViewerProps> = (props) => {
    return (
        <div style={{ width: '100%', height: '100%' }}>
            <Canvas shadows>
                <VRMScene {...props} />
            </Canvas>
        </div>
    );
}; 