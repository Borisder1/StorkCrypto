
import React, { useEffect, useRef } from 'react';
import { useStore } from '../store';
import { ShieldIcon } from './icons';

const LevelUpOverlay: React.FC = () => {
    const { levelUpState, closeLevelUp } = useStore();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Simple Particle System for Confetti
    useEffect(() => {
        if (!levelUpState.visible || !canvasRef.current) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles: any[] = [];
        const colors = ['#00F0FF', '#7000FF', '#FF003C', '#FFFFFF'];

        for (let i = 0; i < 150; i++) {
            particles.push({
                x: canvas.width / 2,
                y: canvas.height / 2,
                vx: (Math.random() - 0.5) * 20,
                vy: (Math.random() - 0.5) * 20,
                size: Math.random() * 5 + 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: 100 + Math.random() * 50
            });
        }

        const animate = () => {
            if (!levelUpState.visible) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((p, index) => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.2; // Gravity
                p.life--;

                ctx.fillStyle = p.color;
                ctx.fillRect(p.x, p.y, p.size, p.size);

                if (p.life <= 0) particles.splice(index, 1);
            });

            if (particles.length > 0) requestAnimationFrame(animate);
        };

        animate();
    }, [levelUpState.visible]);

    if (!levelUpState.visible) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl animate-fade-in">
            <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none"></canvas>
            
            <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center p-8 animate-fade-in-up">
                <div className="w-32 h-32 relative mb-6">
                    <div className="absolute inset-0 bg-brand-cyan blur-[60px] animate-pulse-slow"></div>
                    <div className="w-full h-full bg-gradient-to-br from-brand-cyan to-brand-purple rounded-3xl flex items-center justify-center border-2 border-white shadow-[0_0_40px_rgba(0,240,255,0.5)] relative z-10 rotate-3">
                         <ShieldIcon className="w-16 h-16 text-white" />
                    </div>
                </div>

                <h2 className="font-orbitron font-black text-5xl text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-white mb-2 drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]">
                    LEVEL UP!
                </h2>
                <p className="font-space-mono text-xl text-brand-purple font-bold mb-8">
                    LEVEL {levelUpState.level}
                </p>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 w-64">
                    <p className="text-xs text-slate-400 uppercase tracking-widest mb-4">Rewards Unlocked</p>
                    <ul className="space-y-2">
                        {levelUpState.rewards.map((r, i) => (
                            <li key={i} className="text-white font-bold text-sm flex items-center gap-2">
                                <span className="text-brand-success">✓</span> {r}
                            </li>
                        ))}
                    </ul>
                </div>

                <button 
                    onClick={closeLevelUp}
                    className="px-10 py-4 bg-brand-cyan text-black font-orbitron font-bold text-lg rounded-full hover:scale-105 transition-transform shadow-[0_0_30px_rgba(0,240,255,0.6)]"
                >
                    CLAIM REWARDS
                </button>
            </div>
        </div>
    );
};

export default LevelUpOverlay;
