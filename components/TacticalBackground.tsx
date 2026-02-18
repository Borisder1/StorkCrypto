
import React from 'react';

export const TacticalBackground: React.FC = () => (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#0A0A2A]">
        {/* Deep Space Gradient with Indigo/Anthracite */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a1a3a] via-[#0A0A2A] to-[#050510]"></div>

        {/* 3D Grid System - Subtle & High Tech */}
        <div className="absolute inset-0 perspective-[800px]">
            <div className="absolute inset-0 origin-bottom transform-3d rotate-x-[60deg] translate-y-[150px] scale-[2.5]">
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(0, 240, 255, 0.4) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0, 240, 255, 0.4) 1px, transparent 1px)
                        `,
                        backgroundSize: '60px 60px',
                        animation: 'gridFly 30s linear infinite',
                    }}
                />
            </div>
        </div>

        {/* Horizon Glow - Bloom Effect */}
        <div className="absolute top-[20%] left-0 w-full h-[50%] bg-brand-cyan/5 blur-[120px] rounded-full opacity-40 mix-blend-screen"></div>
        <div className="absolute bottom-[-30%] right-[-10%] w-[70%] h-[60%] bg-brand-purple/10 blur-[150px] rounded-full opacity-30"></div>

        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050510_100%)] opacity-70"></div>

        <style>{`
            .perspective-[800px] { perspective: 800px; }
            .rotate-x-[60deg] { transform: rotateX(60deg); }
            @keyframes gridFly {
                0% { transform: translateY(0) rotateX(60deg); }
                100% { transform: translateY(60px) rotateX(60deg); }
            }
        `}</style>
    </div>
);
