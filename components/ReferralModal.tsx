
import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useStore } from '../store';
import { UserIcon, ShieldIcon, SparklesIcon, ShareIcon, CopyIcon, ChevronRightIcon } from './icons';
import { getTranslation } from '../utils/translations';
import { triggerHaptic } from '../utils/haptics';

const ReferralModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { settings, grantXp, showToast, userStats } = useStore();
    const t = (key: string) => getTranslation(settings.language, key);
    
    // Generate referral link based on user ID
    const userId = userStats.id.replace('tg_', '') || 'pilot_77';
    const referralLink = `https://t.me/StorkCryptoBot/app?startapp=${userId}`;

    // Referral 2.0 State
    const [invitedCount] = useState<number>(userStats.referralCount || 3);
    const [storkEarned] = useState<number>((userStats as any).referralEarnings || 450);

    // Calculate Tier
    const currentTier = invitedCount >= 10 ? 'Ace Captain' : invitedCount >= 5 ? 'Vanguard Pilot' : 'Rookie Scout';
    const nextTierCount = invitedCount >= 10 ? 25 : invitedCount >= 5 ? 10 : 5;
    const tierBonus = invitedCount >= 10 ? '+25% XP' : invitedCount >= 5 ? '+15% XP' : '+5% XP';

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        triggerHaptic('success');
        showToast(t('common.copy'));
        grantXp(15, 'Referral Link Copied');
    };

    const handleTelegramShare = () => {
        triggerHaptic('selection');
        const text = encodeURIComponent("🚀 Join my Cyber-Pilot Neural Squad in StorkCrypto! Get +100 STORK tokens & AI Trading Insights:");
        const url = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${text}`;
        window.open(url, '_blank');
        grantXp(25, 'Shared to Telegram');
    };

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto overscroll-contain"
        >
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md" onClick={onClose}></div>
            
            <div className="relative z-10 w-full max-w-md bg-brand-bg border border-brand-purple/40 rounded-[2.5rem] overflow-hidden shadow-[0_0_60px_rgba(168,85,247,0.25)] my-auto max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-6 text-center bg-gradient-to-b from-brand-purple/20 via-brand-card to-brand-bg border-b border-white/10 relative">
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white"
                    >
                        ✕
                    </button>

                    <div className="w-16 h-16 rounded-2xl bg-brand-purple/20 border border-brand-purple/40 flex items-center justify-center mx-auto mb-3 shadow-[0_0_25px_rgba(168,85,247,0.4)]">
                        <UserIcon className="w-8 h-8 text-brand-purple" />
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-purple/20 border border-brand-purple/30 text-brand-purple text-[10px] font-orbitron font-black uppercase mb-2">
                        <SparklesIcon className="w-3 h-3" /> Referral Program 2.0
                    </div>
                    <h2 className="font-orbitron font-black text-xl text-white mb-1">{t('ref.title')}</h2>
                    <p className="text-slate-400 text-xs font-space-mono px-2">{t('ref.desc')}</p>
                </div>

                {/* Body Content */}
                <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar">
                    {/* Stats Overview */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-brand-card/60 border border-white/10 rounded-2xl p-3 text-center">
                            <p className="text-[9px] font-orbitron text-slate-500 uppercase font-black">Squad Pilots</p>
                            <p className="text-xl font-orbitron font-black text-brand-cyan mt-1">{invitedCount} / {nextTierCount}</p>
                            <p className="text-[8px] text-slate-400 mt-0.5">Recruits onboarded</p>
                        </div>
                        <div className="bg-brand-card/60 border border-white/10 rounded-2xl p-3 text-center">
                            <p className="text-[9px] font-orbitron text-slate-500 uppercase font-black">STORK Rewards</p>
                            <p className="text-xl font-orbitron font-black text-brand-purple mt-1">+{storkEarned}</p>
                            <p className="text-[8px] text-brand-green mt-0.5">Bonus Rate: {tierBonus}</p>
                        </div>
                    </div>

                    {/* Tier Progress */}
                    <div className="bg-black/50 border border-brand-purple/30 rounded-2xl p-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-orbitron font-bold text-slate-300">CURRENT RANK: <span className="text-brand-purple">{currentTier}</span></span>
                            <span className="text-[10px] font-orbitron font-bold text-brand-cyan">{invitedCount} / {nextTierCount} Recruits</span>
                        </div>
                        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-white/5">
                            <div 
                                className="h-full bg-gradient-to-r from-brand-purple to-brand-cyan transition-all duration-500 shadow-[0_0_10px_#a855f7]"
                                style={{ width: `${Math.min(100, (invitedCount / nextTierCount) * 100)}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Link Box */}
                    <div className="bg-black/60 rounded-2xl border border-white/10 p-4">
                        <p className="text-[9px] text-slate-400 uppercase font-orbitron font-bold tracking-widest mb-2 flex items-center gap-1">
                            <ChevronRightIcon className="w-3 h-3 text-brand-cyan" /> {t('ref.uplink')}
                        </p>
                        <p className="text-xs font-mono font-bold text-brand-cyan tracking-wider select-all break-all bg-white/5 p-2.5 rounded-xl border border-white/5">
                            {referralLink}
                        </p>
                    </div>

                    {/* Reward Policy Badge */}
                    <div className="flex items-center gap-3 bg-brand-success/10 border border-brand-success/30 p-3.5 rounded-2xl">
                        <ShieldIcon className="w-5 h-5 text-brand-success shrink-0" />
                        <div>
                            <p className="text-xs text-brand-success font-bold font-orbitron">{t('ref.reward')}</p>
                            <p className="text-[10px] text-slate-400">Earn +150 STORK + 10% lifetime trading fee rebates for every recruit.</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                        <button 
                            onClick={handleCopy}
                            className="py-3.5 px-4 rounded-xl bg-white/10 border border-white/20 text-white font-bold font-orbitron text-xs hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                        >
                            <CopyIcon className="w-4 h-4 text-brand-cyan" />
                            {t('ref.copy')}
                        </button>
                        <button 
                            onClick={handleTelegramShare}
                            className="py-3.5 px-4 rounded-xl bg-gradient-to-r from-brand-purple to-purple-600 text-white font-bold font-orbitron text-xs hover:opacity-90 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center justify-center gap-2"
                        >
                            <ShareIcon className="w-4 h-4 text-white" />
                            Telegram Share
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ReferralModal;

