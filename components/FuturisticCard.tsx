
import React from 'react';

interface FuturisticCardProps {
    children: React.ReactNode;
    className?: string;
    padding?: string;
}

const FuturisticCard: React.FC<FuturisticCardProps> = ({ children, className = '', padding = 'p-5' }) => {
    return (
        <div className={`relative rounded-[1.5rem] overflow-hidden backdrop-blur-md bg-[#0f172a]/40 border border-white/5 shadow-lg group transition-all duration-300 hover:border-brand-cyan/30 hover:shadow-[0_0_30px_rgba(0,217,255,0.1)] ${className}`}>
            
            {/* Holographic Sheen */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            
            {/* Tech Corners */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20 rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20 rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/20 rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20 rounded-br-lg"></div>

            {/* Content */}
            <div className={`relative z-20 ${padding}`}>
                {children}
            </div>
        </div>
    );
};

export default FuturisticCard;
