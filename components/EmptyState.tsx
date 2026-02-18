import React from 'react';
import { SearchIcon } from './icons';

interface EmptyStateProps {
    message: string;
    subMessage?: string;
    icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message, subMessage, icon }) => {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-brand-card/20 border border-white/5 rounded-[2rem] backdrop-blur-sm min-h-[200px] animate-fade-in w-full">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent animate-[spin_4s_linear_infinite]"></div>
                {icon || <SearchIcon className="w-6 h-6 text-slate-500 opacity-50" />}
            </div>
            <p className="text-slate-400 font-black font-orbitron text-xs uppercase tracking-widest mb-2 text-glow">{message}</p>
            {subMessage && <p className="text-slate-600 font-mono text-[10px] max-w-[200px] leading-relaxed">{subMessage}</p>}
        </div>
    );
};

export default EmptyState;
