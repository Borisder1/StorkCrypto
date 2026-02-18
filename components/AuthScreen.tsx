
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

    // Побудова абсолютного шляху для надійності
    const logoUrl = `${import.meta.env.BASE_URL}logo.jpg`;
    const [imgError, setImgError] = useState(false);

    const t = (key: string) => getTranslation(settings.language, key);

    const handleSocialLogin = async (provider: 'telegram') => {
        setLoading(true);
        setError('');
        triggerHaptic('heavy');
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
            {/* Animated Background */}
            <div className="absolute inset-0 bg-cyber-grid bg-[length:40px_40px] opacity-20 animate-pulse-slow"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-brand-cyan/5 via-transparent to-brand-purple/10 pointer-events-none"></div>

            {/* Animated Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-brand-cyan rounded-full animate-ping-slow opacity-20"></div>
                <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-brand-purple rounded-full animate-ping-slow opacity-20 animation-delay-1000"></div>
                <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-brand-green rounded-full animate-ping-slow opacity-30 animation-delay-2000"></div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar w-full flex flex-col items-center justify-center p-6 relative z-10">
                <div className="w-full max-w-md flex flex-col items-center my-auto animate-fade-in">

                    {/* Brand Logo Container with Holographic Effect */}
                    <div className="relative mb-12 group">
                        <div className="absolute -inset-8 bg-gradient-to-tr from-brand-cyan/30 to-brand-purple/30 blur-3xl rounded-full animate-pulse-slow opacity-60 group-hover:opacity-80 transition-opacity"></div>
                        <div className="w-44 h-44 rounded-[2.5rem] bg-[#050b14]/80 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-2xl relative z-10 overflow-hidden cyber-border">
                            {!imgError ? (
                                <img
                                    src={logoUrl}
                                    alt="StorkCrypto"
                                    className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                                    onError={() => setImgError(true)}
                                />
                            ) : (
                                <StorkIcon className="w-24 h-24 text-brand-cyan drop-shadow-[0_0_25px_rgba(0,217,255,0.6)]" />
                            )}
                            {/* Scanline over logo */}
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-[200%] w-full animate-scanline opacity-30 pointer-events-none"></div>
                        </div>
                    </div>

                    <h1 className="font-orbitron font-black text-4xl text-white mb-3 tracking-tighter text-center uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                        STORK<span className="text-brand-cyan holographic-badge">CRYPTO</span>
                    </h1>

                    <div className="relative mb-14">
                        <div className="absolute inset-0 bg-brand-cyan/20 blur-md rounded-full"></div>
                        <p className="relative text-[10px] font-mono text-brand-cyan/80 uppercase tracking-[0.4em] bg-black/60 px-6 py-2 rounded-full border border-brand-cyan/20 backdrop-blur-md">
                            {t('auth.welcome')}
                        </p>
                    </div>

                    <button
                        onClick={() => handleSocialLogin('telegram')}
                        disabled={loading}
                        className="w-full h-20 rounded-[2rem] bg-[#24A1DE] relative overflow-hidden group shadow-[0_0_30px_rgba(36,161,222,0.3)] active:scale-[0.98] transition-all hover:shadow-[0_0_50px_rgba(36,161,222,0.5)] border border-white/10 btn-glow"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out"></div>
                        <div className="absolute inset-0 flex items-center justify-center gap-5 relative z-10">
                            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
                                <TelegramIcon className="w-8 h-8 text-white drop-shadow-md" />
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="text-sm font-black text-white font-orbitron uppercase tracking-wide">{t('auth.telegram')}</span>
                                <span className="text-[9px] text-white/80 font-mono tracking-wider">{t('auth.connect_tg')}</span>
                            </div>
                        </div>
                    </button>

                    <div className="mt-8 flex items-center gap-2 opacity-50">
                        <ShieldIcon className="w-3 h-3 text-brand-green" />
                        <span className="text-[9px] font-mono text-brand-green uppercase tracking-widest">{t('auth.secure')}</span>
                    </div>

                    {error && (
                        <div className="mt-6 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-lg backdrop-blur-sm animate-shake">
                            <p className="text-brand-danger text-[10px] font-mono font-bold tracking-widest">{error}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthScreen;
