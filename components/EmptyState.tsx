import React from 'react';

interface EmptyStateProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    actionText?: string;
    onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, actionText, onAction }) => (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="text-4xl mb-4 opacity-50 text-slate-400">{icon}</div>
        <h3 className="text-lg font-orbitron text-brand-cyan mb-2 font-black uppercase">{title}</h3>
        <p className="text-sm text-slate-400 mb-6 max-w-xs font-mono">{description}</p>
        {actionText && (
            <button
                onClick={onAction}
                className="px-6 py-2 bg-brand-cyan/20 border border-brand-cyan/50 rounded-lg text-brand-cyan text-sm font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(0,217,255,0.3)] hover:bg-brand-cyan/30 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan"
            >
                {actionText}
            </button>
        )}
    </div>
);

export default EmptyState;
