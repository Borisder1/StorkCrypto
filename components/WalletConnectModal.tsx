
import React from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { ShieldIcon, TelegramIcon, ActivityIcon } from './icons';
import { triggerHaptic } from '../utils/haptics';

interface WalletConnectModalProps {
    onClose: () => void;
}

const WalletConnectModal: React.FC<WalletConnectModalProps> = ({ onClose }) => {
    const [tonConnectUI] = useTonConnectUI();

    const handleConnect = async () => {
        triggerHaptic('medium');
        // Close our internal modal and open the official TON Connect modal
        onClose();
        setTimeout(() => {
            tonConnectUI.openModal();
        }, 100);
    };

    return (
        <div className="fixed inset-0 z-[120] grid place-items-center p-4 overflow-hidden overscroll-none touch-none">
            <div className="fixed inset-0 bg-black/95 backdrop-blur-md animate-fade-in touch-none" onClick={onClose}></div>
            
            <div className="relative z-10 w-full max-w-sm bg-[#020617] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_0_80px_rgba(0,217,255,0.15)] flex flex-col animate-zoom-in">
                
                {/* Header Section */}
                <div className="p-8 text-center bg-brand-card/40 border-b border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-cyan/40 to-transparent"></div>
                    <div className="w-16 h-16 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center mx-auto mb-4 shadow-lg relative z-10">
                        <ShieldIcon className="w-8 h-8 text-brand-cyan animate-pulse" />
                    </div>
                    <h2 className="font-orbitron font-black text-xl text-white mb-1 uppercase tracking-widest">Web3_Handshake</h2>
                    <p className="text-slate-500 text-[10px] font-space-mono uppercase tracking-[0.2em]">Authorized Protocols Only</p>
                    <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-colors">✕</button>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-center items-center bg-brand-bg/50 space-y-6">
                    
                    <p className="text-center text-xs text-slate-300 font-mono leading-relaxed">
                        Підключіть свій TON гаманець для доступу до портфелю, стейкінгу та преміум функцій StorkCrypto.
                    </p>

                    <button 
                        onClick={handleConnect}
                        className="w-full h-16 rounded-2xl bg-[#0098EA] relative overflow-hidden group shadow-[0_0_30px_rgba(0,152,234,0.3)] transition-all active:scale-[0.98] hover:shadow-[0_0_50px_rgba(0,152,234,0.5)] flex items-center justify-center gap-3"
                    >
                        <TelegramIcon className="w-6 h-6 text-white" />
                        <span className="font-black text-white font-orbitron uppercase tracking-widest text-sm">
                            Connect TON Wallet
                        </span>
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    </button>

                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-brand-green rounded-full animate-pulse"></div>
                        <p className="text-[9px] text-slate-500 font-mono uppercase">SECURED BY TON CONNECT 2.0</p>
                    </div>
                </div>
                
                <div className="p-4 bg-black/40 text-center shrink-0 border-t border-white/5 relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-cyan/20 to-transparent"></div>
                    <p className="text-[9px] text-slate-600 font-mono flex items-center justify-center gap-2 uppercase font-black tracking-widest">
                        <ActivityIcon className="w-3 h-3 text-brand-green" /> Data_Encryption_Active
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WalletConnectModal;
