import React, { useEffect, useRef } from 'react';

interface VoiceInputAnimationProps {
    isActive: boolean;
    volume?: number;
}

const VoiceInputAnimation: React.FC<VoiceInputAnimationProps> = ({ isActive, volume = 0 }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const drawWave = () => {
            if (!ctx || !canvas) return;

            // キャンバスをクリア
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (!isActive) {
                // 非アクティブ時は静かな波を表示
                ctx.beginPath();
                ctx.strokeStyle = '#007AFF';
                ctx.lineWidth = 2;
                ctx.moveTo(0, canvas.height / 2);
                ctx.lineTo(canvas.width, canvas.height / 2);
                ctx.stroke();
                return;
            }

            // 音声レベルに基づいて波を描画
            const centerY = canvas.height / 2;
            const amplitude = Math.max(5, volume * 50); // 最小振幅を5pxに設定
            const frequency = 0.02;

            ctx.beginPath();
            ctx.strokeStyle = '#007AFF';
            ctx.lineWidth = 2;

            for (let x = 0; x < canvas.width; x++) {
                const y = centerY + Math.sin(x * frequency) * amplitude;
                if (x === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }

            ctx.stroke();

            // アニメーションを継続
            animationRef.current = requestAnimationFrame(drawWave);
        };

        drawWave();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isActive, volume]);

    const containerStyle: React.CSSProperties = {
        width: '100%',
        height: '60px',
        backgroundColor: '#F5F5F5',
        borderRadius: '10px',
        overflow: 'hidden',
        marginBottom: '10px',
    };

    const canvasStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
    };

    return (
        <div style={containerStyle}>
            <canvas
                ref={canvasRef}
                width={300}
                height={60}
                style={canvasStyle}
            />
        </div>
    );
};

export default VoiceInputAnimation; 