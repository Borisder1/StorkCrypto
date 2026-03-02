
import React from 'react';

interface FuturisticCardProps {
    children: React.ReactNode;
    className?: string;
    padding?: string;
}

const FuturisticCard: React.FC<FuturisticCardProps> = ({ children, className = '', padding = 'p-5' }) => {
    return (
        <div className={`relative rounded-[1.5rem] overflow-hidden backdrop-blur-xl bg-brand-card border border-white/10 shadow-lg group transition-all duration-300 hover:border-brand-cyan/40 hover:shadow-[0_0_30px_rgba(0,240,255,0.15)] ${className}`}>
            
            {/* Holographic Sheen */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            
            {/* Tech Corners - Glow Enhanced */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white/20 rounded-tl-lg group-hover:border-brand-cyan transition-colors"></div>
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-white/20 rounded-tr-lg group-hover:border-brand-cyan transition-colors"></div>
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-white/20 rounded-bl-lg group-hover:border-brand-cyan transition-colors"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white/20 rounded-br-lg group-hover:border-brand-cyan transition-colors"></div>

            {/* Content */}
            <div className={`relative z-20 ${padding}`}>
                {children}
            </div>
        </div>
    );
};

export default FuturisticCard;
