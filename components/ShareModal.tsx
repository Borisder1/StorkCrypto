
import React, { useEffect } from 'react';
import { StorkIcon, TrendingUpIcon, BarChartIcon } from './icons';
import { useStore } from '../store';
import { getTranslation } from '../utils/translations';

interface ShareModalProps {
    onClose: () => void;
    totalValue: number;
    totalPnL: number;
    pnlPercent: number;
}

const ShareModal: React.FC<ShareModalProps> = ({ onClose, totalValue, totalPnL, pnlPercent }) => {
    const { settings, userStats, grantXp } = useStore();
    const t = (key: string) => getTranslation(settings.language, key);
    const isPositive = totalPnL >= 0;

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    const handleShare = async () => {
        grantXp(50, 'Shared Portfolio'); // XP REWARD

        const shareText = `🚀 My StorkCrypto Portfolio\n\n💰 Balance: $${totalValue.toFixed(0)}\n${isPositive ? '📈' : '📉'} PnL: ${isPositive ? '+' : ''}${pnlPercent.toFixed(2)}% ($${totalPnL.toFixed(0)})\n🏆 Status: ${userStats.subscriptionTier}\n\nAnalyzed by StorkCrypto AI.`;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'StorkCrypto Portfolio',
                    text: shareText,
                });
            } catch (error) {
                console.log('Error sharing', error);
            }
        } else {
            navigator.clipboard.writeText(shareText);
            alert('Stats copied to clipboard!');
        }
    };

    return (
        <div className="fixed inset-0 z-[80] grid place-items-center p-6 overflow-hidden overscroll-none touch-none">
            <div className="fixed inset-0 bg-black/90 backdrop-blur-lg animate-fade-in touch-none" onClick={onClose}></div>
            
            <div className="relative z-10 w-full max-w-sm animate-zoom-in max-h-[90dvh] flex flex-col justify-center">
                
                <div className="bg-brand-bg border border-brand-border rounded-[2rem] overflow-hidden shadow-[0_0_60px_rgba(0,240,255,0.15)] relative transform transition-transform hover:scale-[1.01]">
                    <div className="absolute inset-0 bg-cyber-grid opacity-20"></div>
                    <div className="absolute -top-20 -right-20 w-60 h-60 bg-brand-cyan/20 rounded-full blur-[50px]"></div>
                    <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-brand-purple/20 rounded-full blur-[50px]"></div>

                    <div className="p-8 relative z-10 text-center">
                        <div className="flex justify-center mb-6">
                             <div className="w-16 h-16 bg-gradient-to-br from-brand-bg to-brand-dark border border-brand-cyan/50 rounded-2xl flex items-center justify-center shadow-lg">
                                <StorkIcon className="w-8 h-8 text-brand-cyan" />
                             </div>
                        </div>

                        <h2 className="text-slate-400 text-xs font-space-mono uppercase tracking-widest mb-2">{t('share.title')}</h2>
                        <p className="font-orbitron text-4xl font-black text-white mb-6">
                            ${totalValue.toLocaleString('en-US', {maximumFractionDigits: 0})}
                        </p>

                        <div className={`inline-flex items-center gap-3 px-5 py-2 rounded-xl border backdrop-blur-md mb-8 ${isPositive ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                             <TrendingUpIcon className={`w-5 h-5 ${!isPositive && 'rotate-180'}`} />
                             <span className="font-bold font-space-mono text-xl">
                                 {isPositive ? '+' : ''}{pnlPercent.toFixed(2)}%
                             </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-2">
                             <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                <p className="text-[10px] text-slate-500 mb-1">Total PnL</p>
                                <p className={`font-bold text-sm ${isPositive ? 'text-white' : 'text-brand-danger'}`}>
                                    {isPositive ? '+' : ''}${Math.abs(totalPnL).toFixed(0)}
                                </p>
                             </div>
                             <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                <p className="text-[10px] text-slate-500 mb-1">Member Tier</p>
                                <p className="font-bold text-sm text-brand-purple">{userStats.subscriptionTier}</p>
                             </div>
                        </div>
                    </div>

                    <div className="bg-black/30 p-4 text-center border-t border-white/5">
                        <p className="text-[9px] text-slate-500 font-space-mono">GENERATED BY STORKCRYPTO AI</p>
                    </div>
                </div>

                <div className="mt-8 flex flex-col gap-3">
                    <button 
                        onClick={handleShare}
                        className="w-full py-4 rounded-2xl bg-brand-cyan text-black font-bold font-orbitron text-sm hover:bg-white transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center justify-center gap-2"
                    >
                        <BarChartIcon className="w-4 h-4" /> {t('share.button')} <span className="text-[10px] bg-black/20 px-1 rounded ml-1 text-black/60">+50 XP</span>
                    </button>
                    <button 
                        onClick={onClose}
                        className="text-slate-500 text-xs font-bold py-2 hover:text-white transition-colors"
                    >
                        Close
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ShareModal;
