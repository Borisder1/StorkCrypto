
import React, { useEffect } from 'react';
import { useStore } from '../store';
import { UserIcon, ShieldIcon } from './icons';
import { getTranslation } from '../utils/translations';
import { triggerHaptic } from '../utils/haptics';

const ReferralModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { settings, grantXp, showToast, userStats } = useStore();
    const t = (key: string) => getTranslation(settings.language, key);
    
    // Generate referral link based on user ID
    // Format: https://t.me/StorkCryptoBot/app?startapp=USER_ID
    const userId = userStats.id.replace('tg_', '') || 'guest';
    const referralLink = `https://t.me/StorkCryptoBot/app?startapp=${userId}`;

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        triggerHaptic('success');
        showToast(t('common.copy'));
        grantXp(10, 'Referral Link Copied');
    };

    return (
        <div className="fixed inset-0 z-[100] grid place-items-center p-4 overflow-hidden touch-none">
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md animate-fade-in touch-none" onClick={onClose}></div>
            
            <div className="relative z-10 w-full max-w-sm bg-brand-bg border border-brand-border rounded-[2rem] overflow-hidden shadow-[0_0_60px_rgba(168,85,247,0.15)] animate-zoom-in">
                <div className="p-6 text-center bg-gradient-to-b from-brand-card to-brand-bg border-b border-white/5">
                    <div className="w-16 h-16 rounded-2xl bg-brand-purple/10 border border-brand-purple/30 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                        <UserIcon className="w-8 h-8 text-brand-purple" />
                    </div>
                    <h2 className="font-orbitron font-bold text-xl text-white mb-2">{t('ref.title')}</h2>
                    <p className="text-slate-400 text-xs font-space-mono px-4">{t('ref.desc')}</p>
                </div>

                <div className="p-6">
                    <div className="bg-black/40 rounded-xl border border-white/10 p-4 mb-6 text-center">
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">YOUR_UPLINK_NODE</p>
                        <p className="text-[10px] font-mono font-bold text-brand-cyan tracking-wider select-all break-all">{referralLink}</p>
                    </div>

                    <div className="flex items-center gap-3 bg-brand-success/10 border border-brand-success/20 p-3 rounded-xl mb-6">
                        <ShieldIcon className="w-5 h-5 text-brand-success shrink-0" />
                        <p className="text-xs text-brand-success font-bold">{t('ref.reward')}</p>
                    </div>

                    <button 
                        onClick={handleCopy}
                        className="w-full py-4 rounded-xl bg-brand-purple text-white font-bold font-orbitron hover:opacity-90 transition-opacity shadow-lg"
                    >
                        {t('ref.copy')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReferralModal;
