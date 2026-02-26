
import React, { useEffect, useRef } from 'react';

const BlockRain: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const columns = Math.floor(canvas.width / 20);
        const drops: number[] = new Array(columns).fill(1);
        
        // Hex chars for crypto feel
        const chars = "0123456789ABCDEFx";

        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'; // Fade effect
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#00F0FF'; // Brand Cyan
            ctx.font = '10px monospace';

            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                
                // Random opacity for depth
                ctx.globalAlpha = Math.random() * 0.5 + 0.1;
                ctx.fillText(text, i * 20, drops[i] * 20);
                ctx.globalAlpha = 1.0;

                if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        };

        const interval = setInterval(draw, 50);

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);

        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-20 z-0" />;
};

export default BlockRain;
