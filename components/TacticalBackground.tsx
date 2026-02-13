
import React from 'react';

export const TacticalBackground: React.FC = () => (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#020617]">
        {/* Deep Space Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#050b14] to-[#0f172a]"></div>

        {/* 3D Grid System */}
        <div className="absolute inset-0 perspective-[500px]">
            <div className="absolute inset-0 origin-bottom transform-3d rotate-x-[60deg] translate-y-[100px] scale-[2]">
                <div 
                    className="absolute inset-0 opacity-20" 
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(0, 217, 255, 0.3) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0, 217, 255, 0.3) 1px, transparent 1px)
                        `,
                        backgroundSize: '40px 40px',
                        animation: 'gridFly 20s linear infinite',
                    }}
                />
            </div>
        </div>

        {/* Horizon Glow */}
        <div className="absolute top-[30%] left-0 w-full h-[40%] bg-brand-cyan/10 blur-[100px] rounded-full opacity-30 mix-blend-screen"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[50%] bg-brand-purple/10 blur-[120px] rounded-full opacity-20"></div>

        {/* Vignette & Scanlines */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020617_100%)] opacity-80"></div>
        
        <style>{`
            .perspective-[500px] { perspective: 500px; }
            .rotate-x-[60deg] { transform: rotateX(60deg); }
            @keyframes gridFly {
                0% { transform: translateY(0) rotateX(60deg); }
                100% { transform: translateY(40px) rotateX(60deg); }
            }
        `}</style>
    </div>
);
