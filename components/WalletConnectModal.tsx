import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useStore } from '../store';
import { ShieldIcon, TelegramIcon } from './icons';
import { triggerHaptic } from '../utils/haptics';
import { walletService } from '../services/walletService';
import { getTonConnectUI } from '../services/tonConnectService';
import { useScrollLock } from '../utils/useScrollLock';
import { useIsConnectionRestored, useTonAddress, useTonWallet } from '@tonconnect/ui-react';

interface WalletConnectModalProps {
    onClose: () => void;
}

export const WalletConnectModal: React.FC<WalletConnectModalProps> = ({ onClose }) => {
    const { wallet, disconnectWallet, showToast, connectWallet } = useStore();
    const [isConnecting, setIsConnecting] = useState(false);
    useScrollLock(true);

    const isConnectionRestored = useIsConnectionRestored();
    const tonAddress = useTonAddress();
    const tonWallet = useTonWallet();

    // Auto sync store when wallet connects via TON Connect UI
    useEffect(() => {
        if (tonAddress && tonWallet) {
            connectWallet(tonAddress, tonWallet.device?.appName || 'TON Wallet', 'TON');
        }
    }, [tonAddress, tonWallet, connectWallet]);

    // Handle ESC key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Listen to TON Connect UI status change to auto-close picker immediately on connect
    useEffect(() => {
        const tonConnectUI = getTonConnectUI();
        if (!tonConnectUI) return;

        const unsubscribe = tonConnectUI.onStatusChange((newWallet) => {
            if (newWallet) {
                const addr = newWallet.account.address;
                const appName = newWallet.device?.appName || 'TON Wallet';
                connectWallet(addr, appName, 'TON');
                showToast(`TON Wallet підключено: ${walletService.formatAddress(addr)}`);
                triggerHaptic('success');
                onClose();
            }
        });

        return () => {
            unsubscribe();
        };
    }, [connectWallet, onClose, showToast]);

    const handleConnectTon = async () => {
        triggerHaptic('medium');
        setIsConnecting(true);
        try {
            const tonConnectUI = getTonConnectUI();
            if (!tonConnectUI) {
                showToast('Модуль TON Connect ініціалізується, зачекайте...');
                setIsConnecting(false);
                return;
            }

            if (tonConnectUI.connected) {
                await tonConnectUI.disconnect();
            }

            onClose();
            setTimeout(() => {
                tonConnectUI.openModal().catch(err => {
                    console.error('[TON Connect] Open modal error:', err);
                });
            }, 100);
        } catch (err: any) {
            console.error('[TON Connect Connect Error]:', err);
            showToast('Помилка відкриття TON Connect');
            setIsConnecting(false);
        }
    };

    const handleDisconnect = async () => {
        triggerHaptic('medium');
        try {
            const tonConnectUI = getTonConnectUI();
            if (tonConnectUI?.connected) {
                await tonConnectUI.disconnect();
            }
        } catch (e) {
            console.warn('[TON Connect] Disconnect error:', e);
        }
        disconnectWallet();
        showToast('Гаманець від\'єднано');
    };

    const shortenAddress = (addr: string | null) => {
        if (!addr) return '';
        if (addr.length <= 12) return addr;
        return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
    };

    const activeAddress = tonAddress || wallet.address;
    const isWalletConnected = Boolean(activeAddress && (wallet.isConnected || tonWallet));

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 overflow-y-auto overscroll-contain"
        >
            <div className="fixed inset-0 bg-black/95 backdrop-blur-md" onClick={onClose} aria-hidden="true" />
            
            <motion.div 
                role="dialog"
                aria-modal="true"
                aria-labelledby="wallet-connect-title"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative z-10 w-full max-w-sm bg-[#020617] border border-white/10 rounded-[2rem] overflow-hidden shadow-[0_0_80px_rgba(0,217,255,0.15)] flex flex-col my-auto"
            >
                {/* Header Section */}
                <div className="p-6 text-center bg-brand-card/40 border-b border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-cyan/40 to-transparent" />
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan shadow-lg">
                                <ShieldIcon className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <h2 id="wallet-connect-title" className="font-orbitron font-black text-sm text-white uppercase tracking-wider">TON Wallet</h2>
                                <p className="text-slate-500 text-[9px] font-mono uppercase tracking-widest">TON Connect Protocol</p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose} 
                            aria-label="Закрити вікно підключення гаманця"
                            className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Body Content */}
                <div className="p-6 space-y-5">
                    {isWalletConnected ? (
                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-black/60 border border-brand-cyan/30 text-left space-y-3 font-mono text-xs shadow-[0_0_20px_rgba(0,240,255,0.08)]">
                                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                        <span className="text-emerald-400 font-bold font-orbitron text-[11px] uppercase tracking-wider">Connected</span>
                                    </div>
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5 font-mono">
                                        {tonWallet?.device?.appName || wallet.walletType || 'TON Wallet'}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Address:</span>
                                    <code className="text-white font-bold font-mono text-sm tracking-wider">
                                        {shortenAddress(activeAddress)}
                                    </code>
                                </div>

                                <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (activeAddress) {
                                                navigator.clipboard?.writeText(activeAddress);
                                                triggerHaptic('success');
                                                showToast('Адресу скопійовано');
                                            }
                                        }}
                                        aria-label="Скопіювати адресу"
                                        className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-mono transition-all min-h-[38px]"
                                    >
                                        Copy
                                    </button>
                                    <a
                                        href={`https://tonscan.org/address/${encodeURIComponent(activeAddress || '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="Відкрити в оглядачі"
                                        className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-brand-cyan border border-brand-cyan/20 text-xs font-mono transition-all min-h-[38px] flex items-center justify-center"
                                    >
                                        Explorer
                                    </a>
                                    <button
                                        type="button"
                                        onClick={handleDisconnect}
                                        aria-label="Від'єднати гаманець"
                                        className="flex-1 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-mono transition-all min-h-[38px]"
                                    >
                                        Disconnect
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : !isConnectionRestored ? (
                        <div className="py-6 text-center space-y-3 font-mono">
                            <div className="w-8 h-8 rounded-full border-2 border-brand-cyan border-t-transparent animate-spin mx-auto" />
                            <p className="text-xs text-slate-400">Відновлення сесії TON Connect...</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-xs text-slate-300 font-mono leading-relaxed text-center">
                                Підключення офіційних гаманців екосистеми TON (Tonkeeper, Telegram Wallet, MyTonWallet) через TON Connect.
                            </p>

                            <button
                                type="button"
                                onClick={handleConnectTon}
                                disabled={isConnecting}
                                aria-label="Connect TON Wallet"
                                className="w-full h-14 rounded-2xl bg-[#0098EA] hover:bg-[#0087d1] active:scale-[0.98] transition-all shadow-[0_0_25px_rgba(0,152,234,0.3)] flex items-center justify-center gap-3 font-orbitron font-bold text-xs uppercase tracking-widest text-white min-h-[48px]"
                            >
                                <TelegramIcon className="w-6 h-6 text-white" />
                                <span>{isConnecting ? 'Opening TON Connect...' : 'Connect TON Wallet'}</span>
                            </button>

                            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[10px] text-slate-400 font-mono text-center">
                                🔒 Підключення гаманця використовується виключно для ончейн-балансу портфеля і не активує PRO-підписку.
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default WalletConnectModal;
