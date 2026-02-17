
import React, { useState, useEffect, useMemo } from 'react';
import { ShieldIcon, ChevronRightIcon, ActivityIcon, FileTextIcon, LinkIcon, BarChartIcon, BotIcon, ZapIcon, GlobeIcon, MoonIcon, StorkIcon } from '../icons';
import { useStore } from '../../store';
import { getTranslation } from '../../utils/translations';
import { walletService } from '../../services/walletService';
import WalletConnectModal from '../WalletConnectModal';
import TransactionHistoryModal from '../TransactionHistoryModal';
import AdminDashboard from '../AdminDashboard'; 
import SubscriptionModal from '../SubscriptionModal'; 
import AdInquiryModal from '../AdInquiryModal'; 
import AvatarSelectionModal from '../AvatarSelectionModal';
import { triggerHaptic } from '../../utils/haptics';
import { TacticalBackground } from '../TacticalBackground';
import UpgradeBanner from '../UpgradeBanner';

const StatItem: React.FC<{ label: string; value: string; sub: string; color: string }> = ({ label, value, sub, color }) => (
    <div className="bg-brand-card/40 backdrop-blur-xl shadow-inner border border-white/5 rounded-3xl p-4 flex flex-col items-center justify-center text-center h-28 group hover:border-white/20 transition-all">
        <p className={`text-2xl font-black font-orbitron ${color}`}>{value}</p>
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2">{label}</p>
        <p className="text-[8px] text-slate-600 font-mono mt-1">{sub}</p>
    </div>
);

const ProfileScreen: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
    const { settings, updateSettings, userStats, assets, exportData, wallet, disconnectWallet, logout, showAdInquiry, setShowAdInquiry, showToast, checkTrialStatus, hasProAccess, redeemXpForPro } = useStore();
    const [avatarUrl, setAvatarUrl] = useState<string | null>(localStorage.getItem('stork_user_avatar'));
    
    // Modals state
    const [showWalletModal, setShowWalletModal] = useState(false);
    const [showTxHistory, setShowTxHistory] = useState(false);
    const [showAdminPanel, setShowAdminPanel] = useState(false); 
    const [showSubscription, setShowSubscription] = useState(false);
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    
    const t = (key: string) => getTranslation(settings.language, key);
    const deviceId = userStats.id;

    // Ensure trial status is current
    useEffect(() => {
        checkTrialStatus();
    }, []);

    // NEW: Handle saving the selected avatar
    const handleAvatarUpdate = (newAvatarUrl: string) => {
        setAvatarUrl(newAvatarUrl);
        localStorage.setItem('stork_user_avatar', newAvatarUrl);
        showToast('Identity Updated');
    };

    const nextLevelXp = userStats.level * 500;
    const progressPercent = Math.min(100, (userStats.xp / nextLevelXp) * 100);

    const handleCopyAddress = () => {
        if (wallet.address) {
            navigator.clipboard.writeText(wallet.address);
            triggerHaptic('success');
            showToast('Address Copied');
        }
    };

    const handleXpRedeem = () => {
        const cost = settings.xpToProRate || 500;
        if (userStats.xp < cost) {
            triggerHaptic('error');
            showToast('Insufficient XP');
            return;
        }
        if (window.confirm(`Exchange ${cost} XP for 1 Day PRO Access?`)) {
            triggerHaptic('success');
            redeemXpForPro(1);
        }
    };

    // Calculate Trial/Sub visual data
    const subData = useMemo(() => {
        const isPaid = userStats.subscriptionTier !== 'FREE';
        const isTrial = userStats.trialActive;
        const tierName = isPaid ? userStats.subscriptionTier : isTrial ? 'TRIAL_PRO' : 'FREE';
        
        let timeLeftString = '';
        let progress = 0;

        // Use trialEndsAt as the master expiry for now
        const end = new Date(userStats.trialEndsAt).getTime();
        const now = Date.now();
        const diff = end - now;
        
        if (isPaid) {
            if (diff > 3 * 24 * 60 * 60 * 1000) {
                 timeLeftString = 'STATUS: SECURE';
                 progress = 100;
            } else {
                 const d = Math.floor(diff / (1000 * 60 * 60 * 24));
                 timeLeftString = `RENEWAL: ${d} DAYS`;
                 progress = 20; 
            }
        } else if (isTrial) {
            const totalTrial = 3 * 24 * 60 * 60 * 1000; // 3 days assumption
            progress = Math.max(0, Math.min(100, (diff / totalTrial) * 100));
            
            if (diff <= 0) timeLeftString = 'EXPIRED';
            else {
                const d = Math.floor(diff / (1000 * 60 * 60 * 24));
                const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                timeLeftString = `${d}D ${h}H REMAINING`;
            }
        } else {
            timeLeftString = 'RESTRICTED ACCESS';
            progress = 0;
        }

        return { tierName, timeLeftString, progress, isPaid, isTrial };
    }, [userStats]);

    return (
        <div className="fixed inset-0 z-[110] bg-brand-bg flex flex-col overflow-hidden animate-fade-in transition-colors duration-500">
            <TacticalBackground />
            
            <div className="safe-area-pt bg-brand-card/90 backdrop-blur-2xl border-b border-white/10 px-6 py-5 flex items-center justify-between shrink-0 relative z-20">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => { triggerHaptic('light'); onClose?.(); }}
                        className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 active:scale-90 transition-all shadow-lg"
                    >
                        <ChevronRightIcon className="w-6 h-6 rotate-180" />
                    </button>
                    <div>
                        <h1 className="font-orbitron text-lg font-black text-white tracking-widest uppercase italic">{t('profile.title')}</h1>
                        <p className="text-[8px] text-brand-cyan font-mono animate-pulse uppercase">{t('home.level')}_{userStats.level}_{t('profile.pilot')}</p>
                    </div>
                </div>
                {userStats.role === 'ADMIN' && (
                    <button onClick={() => setShowAdminPanel(true)} className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-500 shadow-lg">
                        <ShieldIcon className="w-5 h-5" />
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pt-8 pb-32 relative z-10">
                
                {/* --- PUMPED UP HERO SECTION --- */}
                <div className="relative mb-8">
                    {/* Holographic Card Background */}
                    <div className="absolute inset-0 bg-brand-card/60 backdrop-blur-xl border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden">
                        <div className="absolute top-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-cyan/30 to-transparent"></div>
                        <div className="absolute bottom-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-purple/30 to-transparent"></div>
                    </div>

                    <div className="relative z-10 p-6 flex flex-col items-center">
                        {/* Avatar */}
                        <div className="relative mb-4 group cursor-pointer active:scale-95 transition-transform" onClick={() => setShowAvatarModal(true)}>
                            <div className={`absolute -inset-3 blur-xl opacity-40 rounded-full transition-colors ${subData.isPaid ? 'bg-brand-purple' : subData.isTrial ? 'bg-brand-green' : 'bg-slate-500'}`}></div>
                            <div className={`w-28 h-28 rounded-full bg-brand-bg border-4 flex items-center justify-center overflow-hidden shadow-2xl relative z-10 ${subData.isPaid ? 'border-brand-purple' : subData.isTrial ? 'border-brand-green' : 'border-slate-700'}`}>
                                {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" /> :
                                <div className="text-4xl font-black text-slate-700 font-orbitron">{userStats.firstName ? userStats.firstName[0] : 'OP'}</div>}
                            </div>
                            <div className={`absolute bottom-0 right-0 w-8 h-8 rounded-full border-4 border-[#020617] flex items-center justify-center z-20 bg-brand-card text-white hover:bg-brand-cyan hover:text-black transition-colors`}>
                                <div className="text-[14px] font-bold">+</div>
                            </div>
                        </div>

                        {/* NAME DISPLAY */}
                        <h2 className="text-2xl font-black text-white font-orbitron uppercase tracking-tighter mb-1 flex items-center gap-2">
                            {userStats.firstName || t('profile.operator')} {userStats.subscriptionTier !== 'FREE' && <span className="text-xs bg-brand-purple px-1.5 rounded text-white">PRO</span>}
                        </h2>
                        
                        <div className="flex items-center gap-2 mb-6">
                            <p className="text-[9px] text-slate-500 font-mono tracking-widest uppercase">
                                ID: {userStats.username ? `@${userStats.username}` : deviceId.slice(0, 8) + '...'}
                            </p>
                            {/* CLOUD SYNC INDICATOR */}
                            <div className="flex items-center gap-1 bg-green-900/20 px-1.5 py-0.5 rounded border border-green-500/20">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_#22c55e]"></div>
                                <span className="text-[7px] font-black text-green-500 uppercase">CLOUD_SYNC</span>
                            </div>
                        </div>
                        
                        {/* XP Bar */}
                        <div className="w-full max-w-[200px] mb-4">
                            <div className="flex justify-between text-[8px] text-slate-500 font-black uppercase mb-1.5 tracking-[0.2em]">
                                <span>{t('profile.xp')}</span>
                                <span className="text-white">{userStats.xp} / {nextLevelXp}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5 p-[1px]">
                                <div className="h-full bg-gradient-to-r from-brand-cyan to-brand-purple shadow-[0_0_15px_#00d9ff] rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
                            </div>
                        </div>

                        {/* XP REDEMPTION (Black Market) */}
                        <button 
                            onClick={handleXpRedeem}
                            className="bg-black/40 border border-brand-purple/30 rounded-xl px-4 py-2 flex items-center gap-3 hover:bg-brand-purple/10 transition-colors shadow-lg active:scale-95"
                        >
                            <ZapIcon className="w-4 h-4 text-brand-purple" />
                            <div className="text-left">
                                <span className="block text-[8px] font-black text-slate-400 uppercase tracking-wide">Black Market Exchange</span>
                                <span className="block text-[9px] font-mono text-white">
                                    {settings.xpToProRate || 500} XP = 1 DAY PRO
                                </span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* --- UPGRADE BANNER (Logic inside handles visibility) --- */}
                <UpgradeBanner />

                {/* --- SUBSCRIPTION STATUS DETAIL (Always Visible in Profile) --- */}
                <div className="glass-panel rounded-[2.5rem] p-6 mb-8 shadow-inner relative overflow-hidden">
                    <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] font-orbitron flex items-center gap-2">
                            <ZapIcon className={`w-4 h-4 ${subData.isTrial ? 'text-brand-green' : subData.isPaid ? 'text-brand-purple' : 'text-slate-600'}`} /> 
                            Neural_Link_Status
                        </h3>
                        <span className={`text-[9px] font-black px-2 py-1 rounded border whitespace-nowrap ${subData.isTrial ? 'bg-green-500/10 border-green-500/30 text-green-400 text-glow' : subData.isPaid ? 'bg-purple-500/10 border-purple-500/30 text-purple-400 text-glow' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                            {subData.isPaid ? 'UNLIMITED' : subData.isTrial ? 'TRIAL_MODE' : 'BASIC'}
                        </span>
                    </div>
                    
                    <div className="bg-black/30 rounded-2xl p-4 border border-white/5">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-white font-bold text-xs font-mono tracking-tight">{subData.timeLeftString}</span>
                            <span className="text-[8px] text-slate-500 font-black">{subData.progress.toFixed(0)}%</span>
                        </div>
                        <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div 
                                className={`h-full transition-all duration-1000 ${subData.isTrial ? 'bg-brand-green' : subData.isPaid ? 'bg-brand-purple' : 'bg-slate-600'}`} 
                                style={{ width: `${subData.progress}%` }}
                            ></div>
                        </div>
                    </div>
                    
                    {/* Allow managing plan even if paid */}
                    <button onClick={() => setShowSubscription(true)} className="mt-4 w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase text-slate-400 hover:text-white transition-all">Manage Plan</button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <StatItem label={t('profile.generated')} value={userStats.signalsGenerated.toString()} sub="Signals_V8" color="text-brand-cyan" />
                    <StatItem label={t('profile.holdings')} value={assets.length.toString()} sub="Assets_Tracked" color="text-brand-purple" />
                </div>

                {/* --- SETTINGS RESTORED --- */}
                <div className="bg-brand-card/40 border border-white/5 rounded-[2.5rem] p-6 mb-8 shadow-inner relative overflow-hidden">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] font-orbitron flex items-center gap-2 mb-6">
                        <ShieldIcon className="w-4 h-4 text-brand-purple" /> {t('profile.preferences')}
                    </h3>
                    
                    <div className="space-y-6">
                        {/* Theme Mode (Density) */}
                        <div>
                            <p className="text-[9px] text-slate-500 font-bold uppercase mb-2 ml-1">Visual Density (Brightness)</p>
                            <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                                <button onClick={() => { updateSettings({ themeMode: 'midnight' }); triggerHaptic('selection'); }} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${settings.themeMode === 'midnight' ? 'bg-slate-900 text-white border border-slate-700' : 'text-slate-500'}`}>Midnight</button>
                                <button onClick={() => { updateSettings({ themeMode: 'twilight' }); triggerHaptic('selection'); }} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${settings.themeMode === 'twilight' ? 'bg-slate-800 text-white border border-slate-600' : 'text-slate-500'}`}>Twilight</button>
                                <button onClick={() => { updateSettings({ themeMode: 'concrete' }); triggerHaptic('selection'); }} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${settings.themeMode === 'concrete' ? 'bg-zinc-800 text-white border border-zinc-600' : 'text-slate-500'}`}>Graphite</button>
                            </div>
                        </div>

                        {/* Theme Color */}
                        <div>
                            <p className="text-[9px] text-slate-500 font-bold uppercase mb-2 ml-1">{t('profile.theme')}</p>
                            <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                                {['cyan', 'purple', 'green'].map(theme => (
                                    <button 
                                        key={theme} 
                                        onClick={() => { updateSettings({ theme: theme as any }); triggerHaptic('selection'); }}
                                        className={`flex-1 py-2 rounded-lg text-[10px] font-black font-orbitron transition-all uppercase ${settings.theme === theme ? (theme === 'cyan' ? 'bg-brand-cyan text-black' : theme === 'purple' ? 'bg-brand-purple text-white' : 'bg-brand-green text-black') : 'text-slate-500 hover:text-white'}`}
                                    >
                                        {theme}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Language */}
                        <div>
                            <p className="text-[9px] text-slate-500 font-bold uppercase mb-2 ml-1">{t('profile.language')}</p>
                            <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                                {['en', 'ua', 'pl'].map(lang => (
                                    <button 
                                        key={lang} 
                                        onClick={() => { updateSettings({ language: lang as any }); triggerHaptic('selection'); }}
                                        className={`flex-1 py-2 rounded-lg text-[10px] font-black font-orbitron transition-all uppercase ${settings.language === lang ? 'bg-brand-purple text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                                    >
                                        {lang}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Risk */}
                        <div>
                            <p className="text-[9px] text-slate-500 font-bold uppercase mb-2 ml-1">{t('profile.risk')}</p>
                            <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                                <button onClick={() => { updateSettings({ riskLevel: 'CONSERVATIVE' }); triggerHaptic('selection'); }} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${settings.riskLevel === 'CONSERVATIVE' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' : 'text-slate-500'}`}>Conservative</button>
                                <button onClick={() => { updateSettings({ riskLevel: 'AGGRESSIVE' }); triggerHaptic('selection'); }} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${settings.riskLevel === 'AGGRESSIVE' ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'text-slate-500'}`}>Aggressive</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-brand-card/40 border border-white/5 rounded-[2.5rem] p-6 mb-8 shadow-inner relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><ActivityIcon className="w-20 h-20 text-brand-cyan" /></div>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] font-orbitron flex items-center gap-2">
                            <LinkIcon className="w-4 h-4 text-brand-cyan" /> {t('profile.web3')}
                        </h3>
                        {wallet.isConnected && (
                            <button onClick={() => setShowTxHistory(true)} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black text-brand-cyan uppercase">{t('profile.history')}</button>
                        )}
                    </div>
                    
                    <div className="space-y-4">
                        <div className={`p-5 rounded-3xl border transition-all ${wallet.isConnected ? 'bg-brand-cyan/5 border-brand-cyan/30' : 'bg-black/40 border-dashed border-white/10'}`}>
                             <div className="flex items-center justify-between mb-4">
                                 <div className="flex items-center gap-4">
                                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${wallet.isConnected ? 'bg-brand-cyan/10 border-brand-cyan/40 text-brand-cyan' : 'bg-white/5 border-white/5 text-slate-700'}`}>
                                         {wallet.isConnected ? <ZapIcon className="w-6 h-6 animate-pulse" /> : <ShieldIcon className="w-6 h-6" />}
                                     </div>
                                     <div>
                                         <p className="text-white font-black text-xs uppercase tracking-widest">{wallet.isConnected ? (wallet.walletType || 'Connected Wallet') : 'No Wallet Found'}</p>
                                         <p className={`text-[9px] font-mono uppercase mt-0.5 ${wallet.isConnected ? 'text-brand-green' : 'text-slate-600'}`}>
                                            {wallet.isConnected ? `Status: ${t('profile.connected')} (${wallet.chain})` : `Status: ${t('profile.restricted')}`}
                                         </p>
                                     </div>
                                 </div>
                                 <button 
                                    onClick={() => wallet.isConnected ? disconnectWallet() : setShowWalletModal(true)} 
                                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase border transition-all ${wallet.isConnected ? 'border-red-500/30 text-red-500 hover:bg-red-500/10' : 'bg-brand-cyan text-black border-brand-cyan shadow-lg active:scale-95'}`}
                                 >
                                     {wallet.isConnected ? t('profile.disconnect') : 'Initialize'}
                                 </button>
                             </div>

                             {wallet.isConnected && wallet.address && (
                                <div className="bg-black/60 rounded-2xl p-4 border border-white/5 flex items-center justify-between cursor-copy active:bg-white/5 transition-colors" onClick={handleCopyAddress}>
                                    <div>
                                        <p className="text-[8px] text-slate-600 uppercase font-black mb-1">Contract_Address</p>
                                        <p className="text-xs font-mono text-brand-cyan font-bold tracking-tight">{walletService.formatAddress(wallet.address)}</p>
                                    </div>
                                    <FileTextIcon className="w-4 h-4 text-slate-600" />
                                </div>
                             )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    <button onClick={exportData} className="w-full py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase text-white hover:bg-white/10 transition-all flex items-center justify-center gap-3 tracking-[0.2em] group shadow-xl">
                        <FileTextIcon className="w-4 h-4 text-slate-500 group-hover:text-white" /> {t('profile.backup')}
                    </button>
                    <button onClick={logout} className="w-full py-5 border border-dashed border-red-500/30 rounded-2xl text-[10px] font-black uppercase text-red-500/70 hover:text-red-500 hover:bg-red-500/5 transition-all tracking-[0.2em] mt-2 shadow-inner">
                        {t('profile.logout')}
                    </button>
                </div>
            </div>

            {showWalletModal && <WalletConnectModal onClose={() => setShowWalletModal(false)} />}
            {showTxHistory && <TransactionHistoryModal onClose={() => setShowTxHistory(false)} />}
            {showAdminPanel && <AdminDashboard onClose={() => setShowAdminPanel(false)} />}
            {showSubscription && <SubscriptionModal onClose={() => setShowSubscription(false)} />}
            {showAdInquiry && <AdInquiryModal onClose={() => setShowAdInquiry(false)} />}
            {showAvatarModal && <AvatarSelectionModal onClose={() => setShowAvatarModal(false)} onSelect={handleAvatarUpdate} />}
        </div>
    );
};

export default ProfileScreen;
