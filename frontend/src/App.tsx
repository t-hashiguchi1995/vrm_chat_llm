import React from 'react';
import { useState } from 'react';
import { VRMViewer } from './components/VRMViewer';
import { ChatInterface } from './components/ChatInterface';

// デフォルトのVRMモデルURLを修正
const DEFAULT_VRM_URL = 'https://cdn.jsdelivr.net/gh/pixiv/three-vrm@master/packages/three-vrm/examples/models/VRM1_Constraint_Twist_Sample.vrm';

const App: React.FC = () => {
    const [vrmUrl, setVrmUrl] = useState(DEFAULT_VRM_URL);

    return (
        <div className="app">
            <h1>VRMキャラクターチャット</h1>
            <div className="vrm-container">
                <VRMViewer
                    vrmUrl={vrmUrl}
                    onError={(error) => console.error('VRM読み込みエラー:', error)}
                />
            </div>
            <div className="chat-container">
                <ChatInterface />
            </div>
            <style jsx>{`
                .app {
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    width: 100vw;
                    overflow: hidden;
                }

                h1 {
                    text-align: center;
                    margin: 0;
                    padding: 1rem;
                    background-color: #f8f9fa;
                    border-bottom: 1px solid #dee2e6;
                }

                .vrm-container {
                    flex: 1;
                    position: relative;
                    background-color: #f0f0f0;
                }

                .chat-container {
                    height: 400px;
                    background-color: white;
                    border-top: 1px solid #dee2e6;
                }
            `}</style>
        </div>
    );
};

export default App; 