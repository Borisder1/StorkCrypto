
import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { ShieldIcon, StorkIcon, ZapIcon, ActivityIcon } from './icons';
import { triggerHaptic } from '../utils/haptics';

const UpgradeBanner: React.FC = () => {
    const { userStats, setSubscriptionOpen } = useStore();
    const [timeLeftLabel, setTimeLeftLabel] = useState('');
    const [isUrgent, setIsUrgent] = useState(false);

    // LOGIC:
    // 1. FREE Tier: Always Show.
    // 2. PRO/WHALE Tier: 
    //    - If > 3 days remaining: HIDE.
    //    - If <= 3 days remaining: SHOW (Warning Mode).

    const isFree = userStats.subscriptionTier === 'FREE';
    const expiryTime = new Date(userStats.trialEndsAt).getTime(); // Using trialEndsAt as generic expiry for this implementation
    const now = Date.now();
    const msUntilExpiry = expiryTime - now;
    const daysUntilExpiry = msUntilExpiry / (1000 * 60 * 60 * 24);

    const shouldShow = isFree || (daysUntilExpiry <= 3 && daysUntilExpiry > 0);

    useEffect(() => {
        if (shouldShow) {
            const calculateTime = () => {
                const diff = expiryTime - Date.now();
                
                if (diff <= 0) {
                    setTimeLeftLabel('EXPIRED');
                    setIsUrgent(true);
                } else {
                    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
                    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    
                    if (d < 3) setIsUrgent(true); // Urgent if less than 3 days
                    else setIsUrgent(false);

                    if (d > 0) setTimeLeftLabel(`${d}D ${h}H`);
                    else setTimeLeftLabel(`${h}H ${Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))}M`);
                }
            };
            
            calculateTime();
            const interval = setInterval(calculateTime, 60000);
            return () => clearInterval(interval);
        }
    }, [expiryTime, shouldShow]);

    if (!shouldShow) return null;

    const handleUpgrade = () => {
        triggerHaptic('selection');
        setSubscriptionOpen(true);
    };

    // VISUAL STYLES based on state
    // Free/Trial: Green/Cyan friendly prompt
    // Expiring Paid: Red/Orange warning
    
    const isPaidExpiring = !isFree && isUrgent;
    
    const borderColor = isPaidExpiring ? 'border-red-500/50' : 'border-brand-green/30';
    const glowColor = isPaidExpiring ? 'from-red-500/20 via-orange-500/20 to-red-500/20' : 'from-brand-green/20 via-brand-cyan/20 to-brand-green/20';
    const btnColor = isPaidExpiring ? 'bg-red-500 text-white' : 'bg-brand-green text-black';
    const icon = isPaidExpiring ? <ActivityIcon className="w-6 h-6 text-red-400 animate-pulse" /> : <ZapIcon className="w-6 h-6 text-black" />;

    return (
        <div className="relative group w-full mb-4 cursor-pointer animate-fade-in" onClick={handleUpgrade}>
            <div className={`absolute inset-0 bg-gradient-to-r blur-md opacity-50 transition-opacity group-hover:opacity-80 ${glowColor}`}></div>
            
            <div className={`relative bg-black/60 border rounded-2xl p-4 flex items-center justify-between backdrop-blur-md overflow-hidden ${borderColor}`}>
                {/* Shimmer Effect */}
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"></div>

                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.4)] ${isPaidExpiring ? 'from-red-900 to-black' : 'from-brand-green to-brand-cyan'}`}>
                        {icon}
                    </div>
                    <div>
                        <h3 className={`text-sm font-bold font-orbitron tracking-wide flex items-center gap-2 ${isPaidExpiring ? 'text-red-400' : 'text-white'}`}>
                            {isPaidExpiring ? 'RENEWAL IMMINENT' : (isFree ? 'TRIAL ACCESS' : 'UPGRADE TO PRO')}
                            {!isPaidExpiring && <span className="text-[8px] bg-brand-green text-black px-1.5 rounded font-black animate-pulse">ACTIVE</span>}
                        </h3>
                        <p className="text-[10px] text-slate-300 font-mono">
                            {isPaidExpiring ? `System locking in: ${timeLeftLabel}` : `Expires in: ${timeLeftLabel || 'Calculating...'}`}
                        </p>
                    </div>
                </div>

                <button className={`font-bold text-[10px] px-4 py-2 rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center gap-1 ${btnColor}`}>
                    <ShieldIcon className="w-3 h-3" />
                    {isPaidExpiring ? 'RENEW' : 'EXTEND'}
                </button>
            </div>
        </div>
    );
};

export default UpgradeBanner;
