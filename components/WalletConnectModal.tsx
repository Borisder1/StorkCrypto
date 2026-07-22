import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { ShieldIcon, TelegramIcon, ActivityIcon, ZapIcon, GlobeIcon, LinkIcon } from './icons';
import { triggerHaptic } from '../utils/haptics';
import { useStore } from '../store';
import { walletService } from '../services/walletService';

interface WalletConnectModalProps {
    onClose: () => void;
}

type ModalCategory = 'ton' | 'exchange' | 'web3' | 'custom';

export const WalletConnectModal: React.FC<WalletConnectModalProps> = ({ onClose }) => {
    const [tonConnectUI] = useTonConnectUI();
    const { wallet, connectWallet, disconnectWallet, showToast } = useStore();
    const [activeTab, setActiveTab] = useState<ModalCategory>('ton');
    const [customAddress, setCustomAddress] = useState('');
    const [customWalletType, setCustomWalletType] = useState('EVM / Exchange');
    const [customChain, setCustomChain] = useState<'ETH' | 'TON' | 'SOL'>('ETH');
    const [isConnecting, setIsConnecting] = useState(false);

    // Selected Provider State for user input flow
    const [selectedProvider, setSelectedProvider] = useState<{
        name: string;
        chain: 'ETH' | 'TON' | 'SOL';
        type: string;
    } | null>(null);
    const [providerAddressInput, setProviderAddressInput] = useState('');
    const [connectionMode, setConnectionMode] = useState<'uid' | 'api'>('uid');
    const [apiKeyInput, setApiKeyInput] = useState('');
    const [apiSecretInput, setApiSecretInput] = useState('');

    // Handle TON Connect launch with session cleanup
    const handleTonConnect = async () => {
        triggerHaptic('medium');
        try {
            // If already connected in SDK, force disconnect first for fresh session
            if (tonConnectUI.connected) {
                await tonConnectUI.disconnect();
            }
        } catch (e) {
            console.warn('[TON Connect] Disconnect before reconnect warning:', e);
        }

        onClose();
        setTimeout(() => {
            tonConnectUI.openModal();
        }, 120);
    };

    // Open provider input form when exchange or web3 wallet card is clicked
    const handleSelectProviderCard = (name: string, chain: 'ETH' | 'TON' | 'SOL', type: string = 'Exchange / Web3') => {
        triggerHaptic('light');
        setSelectedProvider({ name, chain, type });
        setProviderAddressInput('');
        setApiKeyInput('');
        setApiSecretInput('');
        setConnectionMode('uid');
    };

    // Confirm connection with user's inputted exchange address/UID or Read-Only API
    const handleConfirmProviderConnection = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProvider) return;

        if (connectionMode === 'api') {
            const key = apiKeyInput.trim();
            if (!key) {
                showToast('Будь ласка, введіть Read-Only API Key');
                return;
            }

            triggerHaptic('medium');
            setIsConnecting(true);

            try {
                if (tonConnectUI.connected) {
                    await tonConnectUI.disconnect().catch(() => {});
                }

                await connectWallet(key.slice(0, 16) + '...', `${selectedProvider.name} (API)`, selectedProvider.chain);
                showToast(`Успішно підключено ${selectedProvider.name} через Read-Only API Key`);
                setSelectedProvider(null);
                onClose();
            } catch (error) {
                console.error('[Wallet] CEX API Connect failed:', error);
                showToast('Помилка авторизації API');
            } finally {
                setIsConnecting(false);
            }
            return;
        }

        const trimmed = providerAddressInput.trim();
        if (!trimmed) {
            showToast('Будь ласка, введіть UID або адресу гаманця');
            return;
        }

        triggerHaptic('medium');
        setIsConnecting(true);

        try {
            if (tonConnectUI.connected) {
                await tonConnectUI.disconnect().catch(() => {});
            }

            await connectWallet(trimmed, selectedProvider.name, selectedProvider.chain);
            showToast(`Успішно підключено ${selectedProvider.name}: ${walletService.formatAddress(trimmed)}`);
            setSelectedProvider(null);
            onClose();
        } catch (error) {
            console.error('[Wallet] Connect failed:', error);
            showToast('Помилка підключення');
        } finally {
            setIsConnecting(false);
        }
    };

    const generateDemoAddress = () => {
        if (!selectedProvider) return;
        if (connectionMode === 'api') {
            setApiKeyInput('stork_key_' + Math.random().toString(36).substring(2, 14));
            setApiSecretInput('stork_sec_' + Math.random().toString(36).substring(2, 18));
            triggerHaptic('light');
            return;
        }
        let demo = '';
        if (selectedProvider.chain === 'ETH') {
            demo = '0x' + Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('');
        } else if (selectedProvider.chain === 'SOL') {
            demo = Array.from({length: 44}, () => '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'[Math.floor(Math.random() * 58)]).join('');
        } else {
            demo = 'EQ' + Array.from({length: 46}, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'[Math.floor(Math.random() * 64)]).join('');
        }
        setProviderAddressInput(demo);
        triggerHaptic('light');
    };

    const handlePasteClipboard = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                setProviderAddressInput(text.trim());
                triggerHaptic('light');
                showToast('Вставлено з буферу');
            }
        } catch (e) {
            showToast('Не вдалося вставити');
        }
    };

    // Handle Custom Address Linking
    const handleConnectCustom = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!customAddress.trim()) {
            showToast('Введіть коректну адресу гаманця');
            return;
        }

        triggerHaptic('medium');
        setIsConnecting(true);

        try {
            if (tonConnectUI.connected) {
                await tonConnectUI.disconnect().catch(() => {});
            }

            await connectWallet(customAddress.trim(), customWalletType, customChain);
            showToast(`Підключено адресу: ${walletService.formatAddress(customAddress.trim())}`);
            onClose();
        } catch (error) {
            showToast('Не вдалося підключити адресу');
        } finally {
            setIsConnecting(false);
        }
    };

    // Full Disconnect Handler
    const handleFullDisconnect = async () => {
        triggerHaptic('medium');
        try {
            if (tonConnectUI.connected) {
                await tonConnectUI.disconnect();
            }
        } catch (e) {
            console.warn('[TON Connect] Disconnect error:', e);
        }
        disconnectWallet();
        showToast('Гаманець повністю від\'єднано');
    };

    const cexExchanges = [
        { name: 'Binance CEX', type: 'Централізована Біржа (Spot/Futures)', chain: 'ETH' as const, color: 'from-amber-950/60 to-slate-950', border: 'border-amber-500/40', badge: 'CEX #1' },
        { name: 'WhiteBIT', type: 'CEX (Гривня UAH & Crypto)', chain: 'ETH' as const, color: 'from-sky-950/60 to-slate-950', border: 'border-sky-500/40', badge: 'CEX UAH' },
        { name: 'Bybit CEX', type: 'Централізована Біржа (Spot/Derivatives)', chain: 'ETH' as const, color: 'from-orange-950/60 to-slate-950', border: 'border-orange-500/40', badge: 'CEX Hot' },
        { name: 'OKX CEX', type: 'Централізована Біржа (Spot/Futures)', chain: 'TON' as const, color: 'from-zinc-900 to-black', border: 'border-white/30', badge: 'CEX Global' },
        { name: 'Kuna Exchange', type: 'Українська CEX Біржа', chain: 'ETH' as const, color: 'from-blue-950/60 to-slate-950', border: 'border-blue-500/40', badge: 'UA CEX' },
        { name: 'Bitget / Gate.io', type: 'Централізовані Біржі', chain: 'ETH' as const, color: 'from-emerald-950/60 to-slate-950', border: 'border-emerald-500/40', badge: 'CEX' },
    ];

    const web3Exchanges = [
        { name: 'OKX Web3 Wallet', type: 'Web3 / Multi-Chain', chain: 'TON' as const, color: 'from-black to-slate-900', border: 'border-white/20', badge: 'Web3 TON' },
        { name: 'Binance Web3 Wallet', type: 'Web3 Wallet', chain: 'ETH' as const, color: 'from-amber-950/40 to-black', border: 'border-amber-500/30', badge: 'BSC/EVM' },
        { name: 'Bybit Web3 Wallet', type: 'Web3 Wallet', chain: 'ETH' as const, color: 'from-orange-950/40 to-black', border: 'border-orange-500/30', badge: 'Web3' },
    ];

    const web3Wallets = [
        { name: 'MetaMask', chain: 'ETH' as const, badge: 'EVM' },
        { name: 'Trust Wallet', chain: 'ETH' as const, badge: 'Multi-Chain' },
        { name: 'Phantom Wallet', chain: 'SOL' as const, badge: 'Solana' },
    ];

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain"
        >
            <div className="fixed inset-0 bg-black/95 backdrop-blur-md animate-fade-in" onClick={onClose}></div>
            
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative z-10 w-full max-w-md bg-[#020617] border border-white/10 rounded-[2rem] overflow-hidden shadow-[0_0_80px_rgba(0,217,255,0.15)] flex flex-col my-auto max-h-[92vh]"
            >
                {/* Header Section */}
                <div className="p-5 text-center bg-brand-card/40 border-b border-white/5 relative overflow-hidden shrink-0">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-cyan/40 to-transparent"></div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan shadow-lg">
                                <ShieldIcon className="w-5 h-5 animate-pulse" />
                            </div>
                            <div className="text-left">
                                <h2 className="font-orbitron font-black text-sm text-white uppercase tracking-wider">Web3 Gateway</h2>
                                <p className="text-slate-500 text-[9px] font-mono uppercase tracking-widest">Connect Wallet & Exchanges</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-colors">✕</button>
                    </div>

                    {/* Active Connected Banner */}
                    {wallet.isConnected && (
                        <div className="mt-4 p-3 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-between text-left">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <div className="w-2 h-2 rounded-full bg-brand-green animate-ping shrink-0"></div>
                                <div className="min-w-0">
                                    <p className="text-[9px] text-brand-cyan font-black uppercase tracking-wider truncate">
                                        {wallet.walletType || 'Connected'} ({wallet.chain})
                                    </p>
                                    <p className="text-[10px] font-mono text-slate-300 font-bold truncate">
                                        {walletService.formatAddress(wallet.address)}
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={handleFullDisconnect}
                                className="px-2.5 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-[9px] font-black text-red-400 uppercase tracking-wider shrink-0 transition-all active:scale-95"
                            >
                                Від'єднати
                            </button>
                        </div>
                    )}
                </div>

                {/* Category Navigation Tabs */}
                <div className="grid grid-cols-4 bg-black/60 p-1.5 border-b border-white/5 gap-1 shrink-0">
                    <button 
                        onClick={() => { triggerHaptic('light'); setActiveTab('ton'); }} 
                        className={`py-2 px-1 rounded-xl text-[9px] font-black font-orbitron uppercase tracking-wider transition-all flex flex-col items-center gap-1 ${activeTab === 'ton' ? 'bg-brand-cyan text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        <TelegramIcon className="w-3.5 h-3.5" />
                        <span>TON</span>
                    </button>
                    <button 
                        onClick={() => { triggerHaptic('light'); setActiveTab('exchange'); }} 
                        className={`py-2 px-1 rounded-xl text-[9px] font-black font-orbitron uppercase tracking-wider transition-all flex flex-col items-center gap-1 ${activeTab === 'exchange' ? 'bg-brand-cyan text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        <GlobeIcon className="w-3.5 h-3.5" />
                        <span>Біржі</span>
                    </button>
                    <button 
                        onClick={() => { triggerHaptic('light'); setActiveTab('web3'); }} 
                        className={`py-2 px-1 rounded-xl text-[9px] font-black font-orbitron uppercase tracking-wider transition-all flex flex-col items-center gap-1 ${activeTab === 'web3' ? 'bg-brand-cyan text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        <ZapIcon className="w-3.5 h-3.5" />
                        <span>Web3</span>
                    </button>
                    <button 
                        onClick={() => { triggerHaptic('light'); setActiveTab('custom'); }} 
                        className={`py-2 px-1 rounded-xl text-[9px] font-black font-orbitron uppercase tracking-wider transition-all flex flex-col items-center gap-1 ${activeTab === 'custom' ? 'bg-brand-cyan text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        <LinkIcon className="w-3.5 h-3.5" />
                        <span>Адреса</span>
                    </button>
                </div>

                {/* Content Area */}
                <div className="p-5 flex-1 overflow-y-auto custom-scrollbar bg-brand-bg/50">
                    <AnimatePresence mode="wait">
                        {/* IF PROVIDER SELECTED: SHOW ADDRESS/UID INPUT FORM */}
                        {selectedProvider ? (
                            <motion.div 
                                key="provider-form"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="space-y-4"
                            >
                                <div className="flex items-center justify-between bg-white/5 p-3 rounded-2xl border border-white/10">
                                    <div>
                                        <h3 className="text-xs font-black text-white font-orbitron uppercase">{selectedProvider.name}</h3>
                                        <p className="text-[9px] text-brand-cyan font-mono font-bold uppercase">{selectedProvider.type} • {selectedProvider.chain}</p>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => setSelectedProvider(null)}
                                        className="px-2.5 py-1 rounded-lg bg-white/10 text-[9px] font-bold text-slate-300 hover:text-white"
                                    >
                                        ← Змінити
                                    </button>
                                </div>

                                <form onSubmit={handleConfirmProviderConnection} className="space-y-3">
                                    {/* Connection Mode Selector for CEX / Wallets */}
                                    <div className="flex bg-black/60 p-1 rounded-xl border border-white/10">
                                        <button 
                                            type="button" 
                                            onClick={() => { triggerHaptic('selection'); setConnectionMode('uid'); }}
                                            className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${connectionMode === 'uid' ? 'bg-brand-cyan text-black font-bold shadow' : 'text-slate-400'}`}
                                        >
                                            🆔 UID / Адреса
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => { triggerHaptic('selection'); setConnectionMode('api'); }}
                                            className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${connectionMode === 'api' ? 'bg-amber-400 text-black font-bold shadow' : 'text-slate-400'}`}
                                        >
                                            🔑 Read-Only API
                                        </button>
                                    </div>

                                    {connectionMode === 'api' ? (
                                        <div className="space-y-2">
                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <label className="text-[9px] font-black uppercase text-amber-300 font-mono">
                                                        API Key (Read-Only)
                                                    </label>
                                                    <button 
                                                        type="button" 
                                                        onClick={generateDemoAddress}
                                                        className="text-[9px] text-amber-400 hover:underline font-mono"
                                                    >
                                                        ⚡ Демо API
                                                    </button>
                                                </div>
                                                <input 
                                                    type="text"
                                                    value={apiKeyInput}
                                                    onChange={(e) => setApiKeyInput(e.target.value)}
                                                    placeholder="Введіть API Key биржи..."
                                                    className="w-full bg-black/60 border border-amber-500/30 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400 transition-colors placeholder:text-slate-600"
                                                    autoFocus
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-black uppercase text-slate-400 font-mono block mb-1">
                                                    API Secret (Read-Only)
                                                </label>
                                                <input 
                                                    type="password"
                                                    value={apiSecretInput}
                                                    onChange={(e) => setApiSecretInput(e.target.value)}
                                                    placeholder="••••••••••••••••••••"
                                                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400 transition-colors placeholder:text-slate-600"
                                                />
                                            </div>
                                            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-200 font-mono space-y-1">
                                                <p className="font-bold">🔒 Безпечний доступ Read-Only:</p>
                                                <p>Синхронізація балансу Spot & Futures без права зняття чи переказу коштів.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <label className="text-[9px] font-black uppercase text-slate-300 font-mono">
                                                    UID Біржі / Публічна Адреса ({selectedProvider.chain})
                                                </label>
                                                <div className="flex gap-2">
                                                    <button 
                                                        type="button" 
                                                        onClick={handlePasteClipboard}
                                                        className="text-[9px] text-brand-cyan hover:underline font-mono"
                                                    >
                                                        📋 Вставити
                                                    </button>
                                                    <button 
                                                        type="button" 
                                                        onClick={generateDemoAddress}
                                                        className="text-[9px] text-amber-400 hover:underline font-mono"
                                                    >
                                                        ⚡ Тест
                                                    </button>
                                                </div>
                                            </div>
                                            <input 
                                                type="text"
                                                value={providerAddressInput}
                                                onChange={(e) => setProviderAddressInput(e.target.value)}
                                                placeholder={selectedProvider.chain === 'ETH' ? '0x71C... або UID биржи' : selectedProvider.chain === 'SOL' ? 'Solana public address...' : 'EQA1... або Telegram UID'}
                                                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white font-mono focus:outline-none focus:border-brand-cyan transition-colors placeholder:text-slate-600"
                                                autoFocus
                                            />
                                            <div className="mt-2 p-3 rounded-xl bg-brand-cyan/5 border border-brand-cyan/20 text-[10px] text-slate-300 font-mono space-y-1">
                                                <p className="text-brand-cyan font-bold">ℹ️ Безпечне підключення:</p>
                                                <p>Використовується лише публічна адреса або UID для моніторингу балансу та транзакцій у реальному часі.</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-2 pt-1">
                                        <button 
                                            type="button"
                                            onClick={() => setSelectedProvider(null)}
                                            className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 font-bold font-orbitron text-xs uppercase"
                                        >
                                            Скасувати
                                        </button>
                                        <button 
                                            type="submit"
                                            disabled={isConnecting}
                                            className="flex-[2] py-3 rounded-xl bg-brand-cyan text-black font-black font-orbitron text-xs uppercase tracking-wider hover:bg-brand-cyan/90 transition-all active:scale-95 shadow-lg"
                                        >
                                            Підключити
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        ) : (
                            <>
                                {/* TAB 1: TON & TELEGRAM WALLETS */}
                                {activeTab === 'ton' && (
                                    <motion.div 
                                        key="tab-ton"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-4"
                                    >
                                        <p className="text-xs text-slate-300 font-mono leading-relaxed text-center">
                                            Офіційне підключення TON Connect для Telegram Wallet (@wallet), Tonkeeper та TON Space.
                                        </p>

                                        <button 
                                            onClick={handleTonConnect}
                                            className="w-full h-14 rounded-2xl bg-[#0098EA] relative overflow-hidden group shadow-[0_0_25px_rgba(0,152,234,0.3)] transition-all active:scale-[0.98] hover:shadow-[0_0_40px_rgba(0,152,234,0.5)] flex items-center justify-center gap-3"
                                        >
                                            <TelegramIcon className="w-6 h-6 text-white" />
                                            <span className="font-black text-white font-orbitron uppercase tracking-widest text-xs">
                                                TON Connect (Telegram / Tonkeeper)
                                            </span>
                                        </button>

                                        <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[10px] text-slate-400 font-mono space-y-1">
                                            <p className="text-brand-cyan font-bold">💡 Примітка щодо Telegram Wallet:</p>
                                            <p>При повторному підключенні сесію буде автоматично оновлено для миттєвого відкриття боту або додатка.</p>
                                        </div>
                                    </motion.div>
                                )}

                                {/* TAB 2: CRYPTO EXCHANGES (CEX & WEB3) */}
                                {activeTab === 'exchange' && (
                                    <motion.div 
                                        key="tab-exchange"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-4"
                                    >
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-wider text-amber-400 font-mono mb-2 flex items-center gap-1">
                                                🏦 Централізовані Біржі (CEX Spot / Futures)
                                            </p>
                                            <div className="space-y-2">
                                                {cexExchanges.map((ex) => (
                                                    <button 
                                                        key={ex.name}
                                                        onClick={() => handleSelectProviderCard(ex.name, ex.chain, ex.type)}
                                                        disabled={isConnecting}
                                                        className={`w-full p-3.5 rounded-2xl bg-gradient-to-r ${ex.color} border ${ex.border} flex items-center justify-between group transition-all active:scale-[0.98] hover:border-amber-400/60`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300 font-bold font-orbitron text-xs">
                                                                {ex.name.slice(0, 2)}
                                                            </div>
                                                            <div className="text-left">
                                                                <p className="text-white font-bold text-xs font-orbitron">{ex.name}</p>
                                                                <p className="text-[9px] text-slate-400 font-mono uppercase">{ex.type}</p>
                                                            </div>
                                                        </div>
                                                        <span className="text-[8px] font-black uppercase px-2 py-1 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                                                            {ex.badge}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="pt-2 border-t border-white/5">
                                            <p className="text-[10px] font-black uppercase tracking-wider text-brand-cyan font-mono mb-2 flex items-center gap-1">
                                                ⚡ Web3 Гаманці Бірж
                                            </p>
                                            <div className="space-y-2">
                                                {web3Exchanges.map((ex) => (
                                                    <button 
                                                        key={ex.name}
                                                        onClick={() => handleSelectProviderCard(ex.name, ex.chain, ex.type)}
                                                        disabled={isConnecting}
                                                        className={`w-full p-3.5 rounded-2xl bg-gradient-to-r ${ex.color} border ${ex.border} flex items-center justify-between group transition-all active:scale-[0.98] hover:border-brand-cyan/50`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white font-bold font-orbitron text-xs">
                                                                {ex.name.slice(0, 2)}
                                                            </div>
                                                            <div className="text-left">
                                                                <p className="text-white font-bold text-xs font-orbitron">{ex.name}</p>
                                                                <p className="text-[9px] text-slate-400 font-mono uppercase">{ex.type} • {ex.chain}</p>
                                                            </div>
                                                        </div>
                                                        <span className="text-[8px] font-black uppercase px-2 py-1 rounded bg-white/10 text-brand-cyan border border-brand-cyan/20">
                                                            {ex.badge}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* TAB 3: WEB3 MULTI-CHAIN WALLETS */}
                                {activeTab === 'web3' && (
                                    <motion.div 
                                        key="tab-web3"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-3"
                                    >
                                        <p className="text-xs text-slate-300 font-mono leading-relaxed mb-2">
                                            Оберіть Web3-гаманець для введення адреси або швидкої авторизації:
                                        </p>

                                        {web3Wallets.map((w) => (
                                            <button 
                                                key={w.name}
                                                onClick={() => handleSelectProviderCard(w.name, w.chain, 'Web3 Wallet')}
                                                disabled={isConnecting}
                                                className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between group transition-all active:scale-[0.98] hover:border-brand-cyan/50 hover:bg-white/10"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan font-bold text-xs">
                                                        {w.name[0]}
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-white font-bold text-xs font-orbitron">{w.name}</p>
                                                        <p className="text-[9px] text-slate-400 font-mono uppercase">Web3 Provider • {w.chain}</p>
                                                    </div>
                                                </div>
                                                <span className="text-[8px] font-black uppercase px-2 py-1 rounded bg-brand-cyan/20 text-brand-cyan">
                                                    {w.badge}
                                                </span>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </>
                        )}

                        {/* TAB 4: CUSTOM ADDRESS / API LINKING */}
                        {activeTab === 'custom' && (
                            <motion.div 
                                key="tab-custom"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-4"
                            >
                                <p className="text-xs text-slate-300 font-mono leading-relaxed">
                                    Введіть публічну адресу гаманця або ID облікового запису біржі для відстеження активів:
                                </p>

                                <form onSubmit={handleConnectCustom} className="space-y-3">
                                    <div>
                                        <label className="text-[9px] font-black uppercase text-slate-400 font-mono block mb-1">Мережа / Назва</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {(['ETH', 'TON', 'SOL'] as const).map(c => (
                                                <button 
                                                    type="button"
                                                    key={c}
                                                    onClick={() => setCustomChain(c)}
                                                    className={`py-2 rounded-xl text-[9px] font-black font-orbitron border transition-all ${customChain === c ? 'bg-brand-cyan text-black border-brand-cyan' : 'bg-white/5 border-white/10 text-slate-400'}`}
                                                >
                                                    {c}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[9px] font-black uppercase text-slate-400 font-mono block mb-1">Публічна адреса / Exchange UID</label>
                                        <input 
                                            type="text"
                                            value={customAddress}
                                            onChange={(e) => setCustomAddress(e.target.value)}
                                            placeholder={customChain === 'ETH' ? '0x1234...abcd' : customChain === 'TON' ? 'EQA123...xyz' : 'Solana Address...'}
                                            className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white font-mono focus:outline-none focus:border-brand-cyan transition-colors placeholder:text-slate-600"
                                        />
                                    </div>

                                    <button 
                                        type="submit"
                                        disabled={isConnecting}
                                        className="w-full py-3.5 rounded-xl bg-brand-cyan text-black font-black font-orbitron text-xs uppercase tracking-widest hover:bg-brand-cyan/90 transition-all active:scale-95 shadow-lg"
                                    >
                                        Прив'язати адресу
                                    </button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                
                {/* Footer status */}
                <div className="p-3 bg-black/60 text-center shrink-0 border-t border-white/5 relative overflow-hidden">
                    <p className="text-[9px] text-slate-500 font-mono flex items-center justify-center gap-2 uppercase font-black tracking-widest">
                        <ActivityIcon className="w-3 h-3 text-brand-green" /> Multi-Chain Encrypted Link v8.0
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default WalletConnectModal;
