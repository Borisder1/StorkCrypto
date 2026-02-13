
import React from 'react';
import { ShieldIcon, ZapIcon } from './icons';
import { useStore } from '../store';
import { triggerHaptic } from '../utils/haptics';

interface LockedFeatureProps {
    minLevel: number;
    title: string;
    children: React.ReactNode;
}

const LockedFeature: React.FC<LockedFeatureProps> = ({ minLevel, title, children }) => {
    const { userStats, setSubscriptionOpen } = useStore();
    const currentLevel = userStats.level;
    
    // If user is PRO or WHALE, they bypass level locks (Monetization Benefit)
    const isSubscriber = userStats.subscriptionTier !== 'FREE';
    const isLocked = currentLevel < minLevel && !isSubscriber;

    if (!isLocked) {
        return <>{children}</>;
    }

    const handleUnlock = () => {
        triggerHaptic('medium');
        setSubscriptionOpen(true);
    };

    return (
        <div className="relative overflow-hidden rounded-2xl border border-dashed border-slate-700 bg-black/40 p-6 flex flex-col items-center justify-center text-center group cursor-pointer" onClick={handleUnlock}>
            {/* Blurred Background Content */}
            <div className="absolute inset-0 opacity-10 blur-md pointer-events-none bg-brand-card"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-brand-purple/10"></div>
            
            <div className="relative z-10 flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center mb-1 group-hover:border-brand-purple transition-colors shadow-lg">
                    <ShieldIcon className="w-6 h-6 text-slate-400 group-hover:text-brand-purple transition-colors" />
                </div>
                
                <div>
                    <h3 className="text-sm font-bold text-white font-orbitron uppercase tracking-wider mb-2">
                        {title}
                    </h3>
                    <div className="flex flex-col gap-1 text-[10px] text-slate-400 font-mono">
                        <p>REQUIRES <span className="text-white font-bold">LEVEL {minLevel}</span></p>
                        <p className="opacity-50">OR</p>
                    </div>
                </div>

                <div className="mt-2 w-full max-w-[120px] h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-slate-600" 
                        style={{ width: `${(currentLevel / minLevel) * 100}%` }}
                    ></div>
                </div>
                
                <button 
                    onClick={(e) => { e.stopPropagation(); handleUnlock(); }}
                    className="mt-3 w-full py-3 bg-brand-purple text-white text-[10px] font-black font-orbitron rounded-xl hover:bg-brand-purple/80 transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] flex items-center justify-center gap-2 uppercase tracking-wider"
                >
                    <ZapIcon className="w-3 h-3" /> Get Instant Access
                </button>
            </div>
        </div>
    );
};

export default LockedFeature;
