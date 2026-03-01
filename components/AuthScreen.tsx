
import React, { useState } from 'react';
import { StorkIcon, TelegramIcon, ShieldIcon, UserIcon, ChevronRightIcon } from './icons';
import { useStore } from '../store';
import { triggerHaptic } from '../utils/haptics';
import { getTranslation } from '../utils/translations';

const AuthScreen: React.FC = () => {
    const { login, settings } = useStore();
    const [isAdminMode, setIsAdminMode] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Secret tap logic for admin login
    const [tapCount, setTapCount] = useState(0);
    const [lastTap, setLastTap] = useState(0);

    const handleSecretTap = () => {
        const now = Date.now();
        if (now - lastTap > 1000) {
            setTapCount(1);
        } else {
            const newCount = tapCount + 1;
            setTapCount(newCount);
            if (newCount >= 5) {
                setIsAdminMode(true);
                setTapCount(0);
                triggerHaptic('heavy');
            }
        }
        setLastTap(now);
    };
    
    // Побудова шляху з урахуванням BASE_URL для коректної роботи в підпапках (GitHub Pages)
    const logoUrl = '/logo.jpg';
    const [imgError, setImgError] = useState(false);

    const t = (key: string) => getTranslation(settings.language, key);

    const handleSocialLogin = async (provider: 'telegram') => {
        setLoading(true);
        setError('');
        triggerHaptic('medium');
        try {
            const res = await login(provider); 
            if (!res.success) setError(res.message || 'Auth Failed');
        } catch (e) {
            setError(`${provider.toUpperCase()} Connection Error`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-[#020617] flex flex-col overflow-hidden h-[100dvh] w-full">
            <div className="absolute inset-0 bg-cyber-grid bg-[length:40px_40px] opacity-10"></div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar w-full flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-sm relative z-10 flex flex-col items-center my-auto animate-fade-in-up">
                    
                    {/* Brand Logo Container */}
                    <div className="relative mb-12" onClick={handleSecretTap}>
                        <div className="absolute -inset-6 bg-brand-cyan/20 blur-2xl rounded-full animate-pulse-slow"></div>
                        <div className="w-40 h-40 rounded-[2.5rem] bg-[#050b14] border-2 border-white/10 flex items-center justify-center shadow-2xl relative z-10 overflow-hidden cursor-pointer">
                            {!imgError ? (
                                <img 
                                    src={logoUrl}
                                    alt="StorkCrypto" 
                                    className="w-full h-full object-cover"
                                    onError={() => setImgError(true)}
                                />
                            ) : (
                                <StorkIcon className="w-20 h-20 text-brand-cyan drop-shadow-[0_0_15px_rgba(0,217,255,0.8)]" />
                            )}
                        </div>
                    </div>

                    <h1 className="font-orbitron font-black text-3xl text-white mb-2 tracking-tighter text-center uppercase">
                        STORK<span className="text-brand-cyan">CRYPTO</span>
                    </h1>
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em] mb-12 bg-black/40 px-4 py-1.5 rounded-full border border-white/5">
                        {t('auth.welcome')}
                    </p>

                    <button 
                        onClick={() => handleSocialLogin('telegram')}
                        disabled={loading}
                        className="w-full h-20 rounded-[2rem] bg-[#24A1DE] relative overflow-hidden group shadow-lg active:scale-[0.98] transition-all mb-4"
                    >
                        <div className="absolute inset-0 flex items-center justify-center gap-4">
                            <TelegramIcon className="w-8 h-8 text-white" />
                            <div className="flex flex-col items-start">
                                <span className="text-sm font-black text-white font-orbitron uppercase">{t('auth.telegram')}</span>
                                <span className="text-[9px] text-white/70 font-mono">{t('auth.connect_tg')}</span>
                            </div>
                        </div>
                    </button>

                    {error && <p className="mt-4 text-red-500 text-[10px] font-mono">{error}</p>}
                </div>
            </div>

            {/* Admin / Email Login Modal */}
            {isAdminMode && (
                <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-brand-card border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-zoom-in">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <ShieldIcon className="w-6 h-6 text-brand-purple" />
                                <h2 className="text-white font-black uppercase tracking-widest font-orbitron">Email Login</h2>
                            </div>
                            <button onClick={() => setIsAdminMode(false)} className="text-slate-400 hover:text-white">✕</button>
                        </div>
                        
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="text-[10px] text-slate-400 font-mono uppercase mb-1 block">Email Address</label>
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-purple outline-none font-mono text-sm"
                                    placeholder="admin@storkcrypto.com"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-slate-400 font-mono uppercase mb-1 block">Password</label>
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-purple outline-none font-mono text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button 
                            onClick={async () => {
                                setLoading(true);
                                const res = await login('email', email, password);
                                setLoading(false);
                                if (!res.success) setError(res.message || 'Login failed');
                                else setIsAdminMode(false);
                            }}
                            disabled={loading}
                            className="w-full py-3 bg-brand-purple hover:bg-brand-purple/80 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-colors"
                        >
                            {loading ? 'Authenticating...' : 'Access Terminal'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuthScreen;
