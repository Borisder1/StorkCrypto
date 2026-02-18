import React, { useEffect } from 'react';
import { useStore } from '../store';
import { ShieldIcon, UserIcon, GlobeIcon, FileTextIcon, SendIcon } from './icons';
import { getTranslation } from '../utils/translations';
import { triggerHaptic } from '../utils/haptics';

const AboutModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { settings } = useStore();
    const t = (key: string) => getTranslation(settings.language, key);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    const team = [
        {
            name: 'Borys Verbovskyi',
            role: 'Owner & Developer',
            email: 'storkcrypto90@gmail.com',
            icon: <UserIcon className="w-6 h-6" />
        }
    ];

    return (
        <div className="fixed inset-0 z-[200] grid place-items-center p-4 overflow-hidden overscroll-none touch-none animate-fade-in">
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md touch-none" onClick={onClose}></div>

            <div className="relative z-10 w-full max-w-sm bg-brand-card border border-brand-border rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(0,217,255,0.15)] animate-zoom-in flex flex-col max-h-[85dvh]">

                {/* Header */}
                <div className="p-5 border-b border-white/5 flex justify-between items-center bg-brand-card/50">
                    <button
                        onClick={() => { triggerHaptic('light'); onClose(); }}
                        className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                    >
                        ←
                    </button>
                    <span className="text-[10px] font-black text-brand-cyan uppercase tracking-widest font-orbitron">
                        {t('about.title') || 'ПРО_НАС'}
                    </span>
                    <div className="w-10"></div>
                </div>

                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar overscroll-contain">
                    {/* Logo Section */}
                    <div className="flex flex-col items-center text-center mb-6">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-cyan/20 to-brand-purple/20 border border-brand-cyan/30 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(0,217,255,0.2)]">
                            <ShieldIcon className="w-10 h-10 text-brand-cyan" />
                        </div>
                        <h2 className="text-xl font-bold text-white font-orbitron mb-1 uppercase tracking-tight">
                            STORKCRYPTO
                        </h2>
                        <p className="text-[10px] text-slate-500 font-mono">v8.0.0 • Neural Trading Terminal</p>
                    </div>

                    {/* Description */}
                    <div className="bg-black/30 rounded-xl p-4 border border-white/5 mb-6">
                        <p className="text-xs text-slate-300 leading-relaxed font-space-mono text-center">
                            {t('about.description') || 'Передова торгова платформа з нейронним аналізом для криптовалютних ринків. Побудована для професійних трейдерів.'}
                        </p>
                    </div>

                    {/* Team Section */}
                    <div className="mb-6">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <FileTextIcon className="w-3 h-3" /> {t('about.team') || 'КОМАНДА'}
                        </h3>

                        {team.map((member, idx) => (
                            <div key={idx} className="bg-brand-card/60 rounded-xl p-4 border border-white/5 hover:border-brand-cyan/20 transition-all">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-cyan/20 to-brand-purple/20 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan">
                                        {member.icon}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">{member.name}</p>
                                        <p className="text-[10px] text-brand-cyan font-mono uppercase">{member.role}</p>
                                    </div>
                                </div>

                                <a
                                    href={`mailto:${member.email}`}
                                    className="flex items-center gap-2 text-xs text-slate-400 hover:text-brand-cyan transition-colors bg-black/30 rounded-lg px-3 py-2"
                                >
                                    <SendIcon className="w-4 h-4" />
                                    <span className="font-mono">{member.email}</span>
                                </a>
                            </div>
                        ))}
                    </div>

                    {/* Links */}
                    <div className="space-y-2">
                        <a
                            href="https://t.me/StorkCryptoBot"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 bg-brand-cyan/10 border border-brand-cyan/20 rounded-xl p-3 hover:bg-brand-cyan/20 transition-all"
                        >
                            <GlobeIcon className="w-5 h-5 text-brand-cyan" />
                            <div>
                                <p className="text-xs font-bold text-white">Telegram Bot</p>
                                <p className="text-[9px] text-slate-500 font-mono">@StorkCryptoBot</p>
                            </div>
                        </a>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 pt-4 border-t border-white/5 text-center">
                        <p className="text-[9px] text-slate-600 font-mono">
                            © 2024-2026 StorkCrypto. All rights reserved.
                        </p>
                    </div>
                </div>

                <div className="p-5 bg-black/40 border-t border-white/5 shrink-0 touch-none">
                    <button
                        onClick={() => { triggerHaptic('medium'); onClose(); }}
                        className="w-full py-4 rounded-2xl bg-brand-cyan text-black font-black font-orbitron hover:opacity-90 transition-opacity uppercase text-[10px] tracking-[0.2em] shadow-2xl"
                    >
                        {t('common.close') || 'ЗАКРИТИ'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AboutModal;
