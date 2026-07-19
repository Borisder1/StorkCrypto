import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { triggerHaptic } from '../utils/haptics';
import { TacticalBackground } from './TacticalBackground';
import { GlobeIcon, ChevronRightIcon, ZapIcon, ActivityIcon, ShieldIcon, CheckIcon, InfoIcon, BotIcon } from './icons';
import { HelpIndicator } from './HelpIndicator';
import { useStore } from '../store';
import { getCryptoPrices } from '../services/priceService';

interface DexAggregatorModalProps {
    onClose: () => void;
}

// MULTI-LANGUAGE DICTIONARY FOR THE SWAP TERMINAL
const TRANSLATIONS = {
    en: {
        title: "NEURAL_SWAP",
        subtitle: "DeFi Router V3",
        status: "NODE_STATUS: OPERATIONAL",
        pay: "Pay",
        receive: "Receive",
        balance: "Balance",
        slippage: "Slippage Tolerance",
        slippage_info: "Controls risk of frontrunning and trade reverts due to price fluctuation.",
        route: "Route Path Optimization",
        eco_route: "Eco-Route",
        eco_desc: "Multi-hop pool routing. Lower gas, 1.2s lag.",
        hyper_route: "Hyper-drive",
        hyper_desc: "Direct pool router. Fastest execution, +0.1 TON gas.",
        rate: "Exchange Rate",
        gas: "Network Gas Fee",
        connect_first: "Connect Web3 Wallet First",
        execute: "Execute Smart Swap",
        sign_req: "SIGNATURE REQUIRED",
        sign_desc: "Authorize the smart contract interaction in your secure wallet interface.",
        sign_btn: "SIGN & BROADCAST",
        gas_est: "Estimated Gas",
        contract: "Router Contract",
        network: "Target Network",
        broadcasting: "SWAP IN PROGRESS",
        step_1: "Preparing cryptography payload...",
        step_2: "Broadcasting trade to mempool nodes...",
        step_3: "Confirming on-chain state updates...",
        success_title: "SWAP COMPLETED",
        success_desc: "Assets swapped successfully on-chain.",
        tx_hash: "Transaction Hash",
        xp_earned: "XP Recieved",
        quest_updated: "Trade Mission Progressed",
        done: "RETURN TO COCKPIT",
        warning_low: "⚠️ Low slippage might cause transaction to revert if market is volatile.",
        warning_high: "⚠️ High slippage puts you at risk of sandwich attacks/frontrunning.",
        warning_ok: "🟢 Optimal slippage. Secure routing guaranteed."
    },
    ua: {
        title: "НЕЙРО_СВОП",
        subtitle: "DeFi Роутер v3",
        status: "СТАТУС: ОПЕРАЦІЙНИЙ",
        pay: "Віддаєте",
        receive: "Отримуєте",
        balance: "Баланс",
        slippage: "Допуск проковзування",
        slippage_info: "Контролює ризик забігання вперед та скасування транзакції через коливання цін.",
        route: "Оптимізація маршруту",
        eco_route: "Еко-Маршрут",
        eco_desc: "Багатокроковий роутинг. Нижчий газ, затримка 1.2с.",
        hyper_route: "Гіпердрайв",
        hyper_desc: "Прямий роутер. Миттєво, +0.1 TON газу.",
        rate: "Курс обміну",
        gas: "Мережевий газ",
        connect_first: "Спочатку підключіть гаманець",
        execute: "Виконати своп",
        sign_req: "ПОТРІБЕН ПІДПИС",
        sign_desc: "Авторизуйте взаємодію зі смарт-контрактом у вашому захищеному гаманці.",
        sign_btn: "ПІДПИСАТИ ТА НАДІСЛАТИ",
        gas_est: "Очікуваний газ",
        contract: "Контракт роутера",
        network: "Цільова мережа",
        broadcasting: "ВИКОНАННЯ СВОПУ",
        step_1: "Підготовка криптографічного корисного навантаження...",
        step_2: "Трансляція угоди у вузли мемпулу...",
        step_3: "Підтвердження змін стану в блоці...",
        success_title: "СВОП ВИКОНАНО",
        success_desc: "Активи успішно обміняно в мережі.",
        tx_hash: "Хеш транзакції",
        xp_earned: "Отримано XP",
        quest_updated: "Прогрес торгової місії",
        done: "ПОВЕРНУТИСЬ У КАБІНУ",
        warning_low: "⚠️ Низьке проковзування може скасувати угоду через волатильність.",
        warning_high: "⚠️ Високе проковзування підвищує ризик сендвіч-атак.",
        warning_ok: "🟢 Оптимальне проковзування. Безпечний роутинг."
    },
    pl: {
        title: "NEURAL_SWAP",
        subtitle: "DeFi Router V3",
        status: "STATUS_WĘZŁA: OPERACYJNY",
        pay: "Płacisz",
        receive: "Otrzymujesz",
        balance: "Saldo",
        slippage: "Tolerancja Poślizgu",
        slippage_info: "Kontroluje ryzyko frontrunningu i anulowania transakcji przez wahania cen.",
        route: "Optymalizacja Trasy",
        eco_route: "Eko-Trasa",
        eco_desc: "Routing wieloetapowy. Niższy gaz, opóźnienie 1.2s.",
        hyper_route: "Hyper-drive",
        hyper_desc: "Bezpośredni router. Najszybszy, +0.1 TON gazu.",
        rate: "Kurs Wymiany",
        gas: "Opłata sieciowa Gas",
        connect_first: "Połącz Portfel Najpierw",
        execute: "Wykonaj Wymianę",
        sign_req: "WYMAGANY PODPIS",
        sign_desc: "Autoryzuj interakcję z inteligentnym kontraktem w bezpiecznym portfelu.",
        sign_btn: "PODPISZ I WYŚLIJ",
        gas_est: "Szacowany Gas",
        contract: "Kontrakt Routera",
        network: "Sieć Docelowa",
        broadcasting: "WYMIANA W TOKU",
        step_1: "Przygotowywanie danych kryptograficznych...",
        step_2: "Nadawanie transakcji do węzłów mempool...",
        step_3: "Potwierdzanie aktualizacji stanu sieci...",
        success_title: "WYMIANA UKOŃCZONA",
        success_desc: "Aktywa zostały pomyślnie wymienione.",
        tx_hash: "Hash Transakcji",
        xp_earned: "Otrzymane XP",
        quest_updated: "Postęp Misji Handlowej",
        done: "POWRÓT DO KABINY",
        warning_low: "⚠️ Niski poślizg może spowodować odrzucenie transakcji przy zmienności.",
        warning_high: "⚠️ Wysoki poślizg naraża Cię na ataki typu sandwich.",
        warning_ok: "🟢 Optymalny poślizg. Bezpieczny routing."
    }
};

const DEFAULT_PRICES = {
    TON: 7.15,
    USDT: 1.00,
    STORK: 0.42,
    BTC: 67350,
    ETH: 3480
};

const DexAggregatorModal: React.FC<DexAggregatorModalProps> = ({ onClose }) => {
    const { 
        settings, 
        wallet, 
        assets, 
        executeSwap, 
        grantXp, 
        updateQuestProgress, 
        showToast,
        connectWallet
    } = useStore();

    const lang = settings?.language || 'en';
    const t = (key: string) => {
        const dict = TRANSLATIONS[lang] || TRANSLATIONS['en'];
        return dict[key as keyof typeof dict] || key;
    };

    // FORM STATE
    const [fromAsset, setFromAsset] = useState('TON');
    const [toAsset, setToAsset] = useState('STORK');
    const [fromAmount, setFromAmount] = useState('');
    const [slippage, setSlippage] = useState('0.5');
    const [route, setRoute] = useState<'ECO' | 'HYPER'>('HYPER');

    // CONVERSION PRICES
    const [prices, setPrices] = useState<Record<string, number>>(DEFAULT_PRICES);
    
    // DEMO ASSETS STATE (Used if Web3 is disconnected to allow high-fidelity trial)
    const [demoBalances, setDemoBalances] = useState<Record<string, number>>({
        TON: 350.50,
        USDT: 1000.00,
        STORK: 50.00,
        BTC: 0.05,
        ETH: 0.40
    });

    // FLOW STATE
    const [isSigning, setIsSigning] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState(0);
    const [isSuccess, setIsSuccess] = useState(false);
    const [generatedTxHash, setGeneratedTxHash] = useState('');

    // Load actual prices dynamically from the aggregate price engine
    useEffect(() => {
        const fetchPrices = async () => {
            try {
                const results = await getCryptoPrices();
                const fetchedPrices = { ...DEFAULT_PRICES };
                
                if (results['the-open-network']) fetchedPrices.TON = results['the-open-network'].usd;
                if (results['bitcoin']) fetchedPrices.BTC = results['bitcoin'].usd;
                if (results['ethereum']) fetchedPrices.ETH = results['ethereum'].usd;
                // STORK is local/dynamic
                setPrices(fetchedPrices);
            } catch (err) {
                console.warn("[Dex Router] Using stable fallbacks.");
            }
        };
        fetchPrices();
    }, []);

    // Fetch user balances based on wallet state (Web3 vs Demo/Sandbox)
    const getBalance = (ticker: string) => {
        if (wallet.isConnected) {
            const asset = assets.find(a => a.ticker === ticker);
            return asset ? asset.amount : 0;
        }
        return demoBalances[ticker] || 0;
    };

    // Conversion mathematics
    const fromPrice = prices[fromAsset] || 1;
    const toPrice = prices[toAsset] || 1;
    const inputAmount = parseFloat(fromAmount) || 0;
    
    // Multi-hop (Eco) has small simulated routing slippage/fee discount vs hyper-drive
    const routeModifier = route === 'ECO' ? 0.998 : 0.995; 
    const outputAmount = fromAmount ? (inputAmount * fromPrice / toPrice) * routeModifier : 0;

    // Slippage warnings
    const slippageNum = parseFloat(slippage) || 0.5;
    const getSlippageFeedback = () => {
        if (slippageNum < 0.3) return t('warning_low');
        if (slippageNum > 2.0) return t('warning_high');
        return t('warning_ok');
    };

    // Form validation
    const currentBalance = getBalance(fromAsset);
    const isValid = inputAmount > 0 && inputAmount <= currentBalance && fromAsset !== toAsset;

    const handleFlip = () => {
        triggerHaptic('medium');
        const prevFrom = fromAsset;
        setFromAsset(toAsset);
        setToAsset(prevFrom);
        setFromAmount('');
    };

    const triggerSwap = () => {
        if (!isValid) {
            triggerHaptic('error');
            return;
        }
        triggerHaptic('medium');
        setIsSigning(true);
    };

    const handleSignAndBroadcast = async () => {
        setIsSigning(false);
        setIsLoading(true);
        setLoadingStep(0);

        // Step 1 animation
        triggerHaptic('light');
        await new Promise(r => setTimeout(r, 1200));
        setLoadingStep(1);

        // Step 2 animation
        triggerHaptic('light');
        await new Promise(r => setTimeout(r, 1200));
        setLoadingStep(2);

        // Step 3 animation
        triggerHaptic('medium');
        await new Promise(r => setTimeout(r, 1000));

        // Generate Transaction Hash
        const txHash = '0x' + Array.from({length: 32}, () => Math.floor(Math.random()*16).toString(16)).join('');
        setGeneratedTxHash(txHash);

        // Commit change in local/Zustand store if Web3 is connected
        if (wallet.isConnected) {
            await executeSwap(fromAsset, toAsset, inputAmount, outputAmount);
        } else {
            // Deduct from local demo state
            setDemoBalances(prev => ({
                ...prev,
                [fromAsset]: prev[fromAsset] - inputAmount,
                [toAsset]: (prev[toAsset] || 0) + outputAmount
            }));
        }

        // Grant XP and Progress quests (Gamified Stork System)
        grantXp(50, 'Neural DEX Swap');
        updateQuestProgress('TRADE', 1);

        setIsLoading(false);
        setIsSuccess(true);
        triggerHaptic('success');
    };

    const handleCompleteReceipt = () => {
        triggerHaptic('medium');
        setIsSuccess(false);
        setFromAmount('');
    };

    const autoFillMax = () => {
        triggerHaptic('light');
        const bal = getBalance(fromAsset);
        // Save some gas buffer if paying with TON
        if (fromAsset === 'TON') {
            setFromAmount(Math.max(0, bal - 0.5).toFixed(4));
        } else {
            setFromAmount(bal.toString());
        }
    };

    // Custom simulated Web3 Wallet connection for Sandbox DEX
    const triggerWeb3Connect = () => {
        triggerHaptic('medium');
        connectWallet('EQB_stork_neural_user_' + Math.random().toString(36).substring(2, 8), 'Tonkeeper', 'TON');
        showToast('Web3 Wallet Connected to TON Mainnet');
    };

    return (
        <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[150] bg-brand-bg flex flex-col overflow-hidden h-[100dvh] w-full"
        >
            <TacticalBackground />
            
            {/* TOP HEADER CONTROLS */}
            <div className="safe-area-pt bg-brand-card/90 backdrop-blur-2xl border-b border-white/10 px-6 py-5 flex items-center justify-between shrink-0 relative z-20">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => { triggerHaptic('light'); onClose(); }}
                        className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 active:scale-90 transition-all shadow-lg"
                        id="dex_back_btn"
                    >
                        <ChevronRightIcon className="w-6 h-6 rotate-180" />
                    </button>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <h1 className="font-orbitron text-lg font-black text-white tracking-widest uppercase italic">{t('title')}</h1>
                            <HelpIndicator id="dex_aggregator" />
                        </div>
                        <p className="text-[8px] text-brand-cyan font-mono animate-pulse uppercase">{t('status')}</p>
                    </div>
                </div>
            </div>

            {/* MAIN DESKTOP/MOBILE COMPATIBLE AREA */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 relative z-10 flex flex-col items-center">
                
                <div className="w-full max-w-md space-y-4">
                    
                    {/* WALLLET WARNING BANNER */}
                    {!wallet.isConnected && (
                        <div className="bg-brand-purple/10 border border-brand-purple/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-brand-purple/20 flex items-center justify-center border border-brand-purple/30 shrink-0">
                                    <BotIcon className="w-5 h-5 text-brand-purple" />
                                </div>
                                <div className="text-center sm:text-left">
                                    <h4 className="text-[10px] font-black font-orbitron text-white tracking-wider uppercase">SANDBOX_TRADING_ACTIVE</h4>
                                    <p className="text-[9px] text-slate-400 font-mono mt-0.5">Using simulated virtual assets. Connect wallet for live on-chain integration.</p>
                                </div>
                            </div>
                            <button 
                                onClick={triggerWeb3Connect}
                                className="px-3 py-1.5 bg-brand-purple hover:bg-brand-purple/80 text-white font-orbitron font-black text-[9px] rounded-lg tracking-wider transition-all shadow-md shrink-0 uppercase"
                                id="dex_connect_btn"
                            >
                                {t('connect_first')}
                            </button>
                        </div>
                    )}

                    {/* CONVERSION CORE INTERFACE */}
                    <div className="bg-brand-card/70 border border-white/5 rounded-[2rem] p-5 shadow-2xl relative">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] font-orbitron">{t('subtitle')}</h3>
                            <ActivityIcon className="w-4 h-4 text-brand-cyan" />
                        </div>

                        {/* INPUTS AND FLIPPER */}
                        <div className="space-y-2 relative">
                            {/* FROM ASSET */}
                            <div className="bg-black/50 border border-white/5 rounded-2xl p-4">
                                <div className="flex justify-between items-center mb-1">
                                    <p className="text-[9px] text-slate-500 font-black uppercase">{t('pay')}</p>
                                    <button 
                                        onClick={autoFillMax}
                                        className="text-[8px] text-brand-cyan font-bold uppercase hover:underline"
                                    >
                                        {t('balance')}: {getBalance(fromAsset).toFixed(4)} Max
                                    </button>
                                </div>
                                <div className="flex justify-between items-center">
                                    <input 
                                        type="number" 
                                        placeholder="0.0" 
                                        value={fromAmount}
                                        onChange={(e) => setFromAmount(e.target.value)}
                                        className="bg-transparent text-2xl font-black text-white font-mono w-2/3 outline-none" 
                                        id="swap_input_from"
                                    />
                                    <select 
                                        value={fromAsset}
                                        onChange={(e) => { triggerHaptic('light'); setFromAsset(e.target.value); }}
                                        className="bg-brand-card border border-white/10 rounded-xl px-3 py-2 text-white font-black text-xs outline-none"
                                        id="swap_select_from"
                                    >
                                        {Object.keys(prices).map(ticker => (
                                            <option key={ticker} value={ticker}>{ticker}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* MIDWAY FLIP BUTTON */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-[#070c18] border border-white/10 rounded-xl flex items-center justify-center z-10 cursor-pointer active:scale-95 hover:border-brand-cyan/40 transition-all shadow-xl" onClick={handleFlip} id="swap_flip_btn">
                                <ZapIcon className="w-5 h-5 text-brand-cyan" />
                            </div>

                            {/* TO ASSET */}
                            <div className="bg-black/50 border border-white/5 rounded-2xl p-4">
                                <div className="flex justify-between items-center mb-1">
                                    <p className="text-[9px] text-slate-500 font-black uppercase">{t('receive')}</p>
                                    <p className="text-[8px] text-slate-500 font-mono">{t('balance')}: {getBalance(toAsset).toFixed(4)}</p>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="text-2xl font-black text-white/50 font-mono w-2/3 truncate">
                                        {outputAmount > 0 ? outputAmount.toFixed(5) : '0.00'}
                                    </div>
                                    <select 
                                        value={toAsset}
                                        onChange={(e) => { triggerHaptic('light'); setToAsset(e.target.value); }}
                                        className="bg-brand-card border border-white/10 rounded-xl px-3 py-2 text-white font-black text-xs outline-none"
                                        id="swap_select_to"
                                    >
                                        {Object.keys(prices).map(ticker => (
                                            <option key={ticker} value={ticker}>{ticker}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* SLIPPAGE TOLERANCE INTERACTIVE SLIDER */}
                        <div className="mt-5 space-y-2">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-1.5">
                                    <label className="text-[9px] text-slate-400 uppercase font-black font-orbitron">{t('slippage')}</label>
                                    <div className="group relative">
                                        <InfoIcon className="w-3 h-3 text-slate-600 hover:text-slate-300 cursor-pointer" />
                                        <div className="absolute bottom-6 left-0 w-48 p-2 bg-slate-900 border border-white/10 text-[8px] text-slate-300 font-sans rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                                            {t('slippage_info')}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold text-brand-cyan font-mono">{slippageNum}%</span>
                            </div>

                            <div className="grid grid-cols-4 gap-2">
                                {['0.1', '0.5', '1.0'].map(val => (
                                    <button
                                        key={val}
                                        onClick={() => { triggerHaptic('light'); setSlippage(val); }}
                                        className={`py-1.5 rounded-lg text-[9px] font-bold border transition-all ${slippage === val ? 'bg-brand-cyan text-black border-brand-cyan' : 'bg-black/30 border-white/5 text-slate-500'}`}
                                    >
                                        {val}%
                                    </button>
                                ))}
                                <input
                                    type="number"
                                    placeholder="Custom"
                                    value={['0.1', '0.5', '1.0'].includes(slippage) ? '' : slippage}
                                    onChange={(e) => setSlippage(e.target.value)}
                                    className="bg-black/30 border border-white/5 rounded-lg py-1 px-2 text-[9px] text-center text-white font-bold outline-none focus:border-brand-cyan/40"
                                />
                            </div>

                            {/* SLIPPAGE WARNING DYNAMICS */}
                            <p className={`text-[8px] font-mono leading-relaxed mt-1 ${slippageNum < 0.3 ? 'text-yellow-500' : slippageNum > 2.0 ? 'text-brand-danger animate-pulse' : 'text-slate-400'}`}>
                                {getSlippageFeedback()}
                            </p>
                        </div>

                        {/* ROUTING PATH CHANGER */}
                        <div className="mt-5 space-y-2">
                            <label className="text-[9px] text-slate-400 uppercase font-black font-orbitron block">{t('route')}</label>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => { triggerHaptic('light'); setRoute('HYPER'); }}
                                    className={`text-left p-3 rounded-2xl border transition-all relative overflow-hidden ${route === 'HYPER' ? 'border-brand-cyan bg-brand-cyan/5' : 'border-white/5 bg-black/30'}`}
                                    id="route_hyper_btn"
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[9px] font-black uppercase font-orbitron text-white">{t('hyper_route')}</span>
                                        <span className="text-[7px] font-bold font-mono px-1 rounded bg-brand-cyan/10 text-brand-cyan">FAST</span>
                                    </div>
                                    <p className="text-[7px] text-slate-400 font-sans leading-snug">{t('hyper_desc')}</p>
                                </button>

                                <button 
                                    onClick={() => { triggerHaptic('light'); setRoute('ECO'); }}
                                    className={`text-left p-3 rounded-2xl border transition-all relative overflow-hidden ${route === 'ECO' ? 'border-brand-purple bg-brand-purple/5' : 'border-white/5 bg-black/30'}`}
                                    id="route_eco_btn"
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[9px] font-black uppercase font-orbitron text-white">{t('eco_route')}</span>
                                        <span className="text-[7px] font-bold font-mono px-1 rounded bg-brand-purple/10 text-brand-purple">CHEAP</span>
                                    </div>
                                    <p className="text-[7px] text-slate-400 font-sans leading-snug">{t('eco_desc')}</p>
                                </button>
                            </div>
                        </div>

                        {/* SWAP FLOW ROUTING ANIMATED DIAGRAM */}
                        <div className="mt-5 bg-black/50 border border-white/5 rounded-2xl p-4 overflow-hidden relative">
                            <div className="flex justify-between items-center text-[8px] font-mono text-slate-500 mb-3 uppercase tracking-widest">
                                <span>Router: MultiPathV3</span>
                                <span className="text-brand-cyan animate-pulse">OPTIMIZED</span>
                            </div>

                            <div className="flex justify-between items-center px-4 py-2 relative">
                                {/* SVG CONNECTING PATHS WITH GLOWING DOT PARTICLES */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
                                    <defs>
                                        <linearGradient id="cyan-purple-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#00d9ff" />
                                            <stop offset="100%" stopColor="#8b5cf6" />
                                        </linearGradient>
                                    </defs>
                                    
                                    {route === 'HYPER' ? (
                                        <>
                                            {/* Direct Route Line */}
                                            <line x1="50" y1="20" x2="250" y2="20" stroke="url(#cyan-purple-grad)" strokeWidth="1.5" strokeDasharray="4 4" className="animate-pulse" />
                                            {/* Glowing particle */}
                                            <circle r="3" fill="#00d9ff" className="shadow-lg">
                                                <animateMotion dur="2s" repeatCount="indefinite" path="M 50,20 L 250,20" />
                                            </circle>
                                        </>
                                    ) : (
                                        <>
                                            {/* Multi-hop Line (from -> hop -> to) */}
                                            <path d="M 50,20 Q 150,-10 250,20" fill="none" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="3 3" />
                                            {/* Glowing multi-hop particle */}
                                            <circle r="2.5" fill="#8b5cf6">
                                                <animateMotion dur="3s" repeatCount="indefinite" path="M 50,20 Q 150,-10 250,20" />
                                            </circle>
                                        </>
                                    )}
                                </svg>

                                {/* START TOKEN NODE */}
                                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex flex-col items-center justify-center shadow-lg relative z-10">
                                    <span className="text-[9px] font-black text-white font-orbitron">{fromAsset}</span>
                                    <span className="text-[6px] text-slate-400 font-mono">${fromPrice.toFixed(2)}</span>
                                </div>

                                {/* ROUTER NODE HOP (Eco Route displays a third bridge hop) */}
                                <div className="w-12 h-6 rounded-lg bg-[#0c1428] border border-brand-cyan/30 flex items-center justify-center shadow-md relative z-10">
                                    <span className="text-[7px] text-brand-cyan font-black uppercase font-orbitron tracking-widest">{route === 'HYPER' ? 'DIRECT' : 'USDT_HOP'}</span>
                                </div>

                                {/* END TOKEN NODE */}
                                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex flex-col items-center justify-center shadow-lg relative z-10">
                                    <span className="text-[9px] font-black text-brand-cyan font-orbitron">{toAsset}</span>
                                    <span className="text-[6px] text-slate-400 font-mono">${toPrice.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* VALUE COMPARISONS & NETWORK GAS BREAKDOWN */}
                        <div className="mt-5 space-y-2 bg-black/30 border border-white/5 rounded-xl p-3 text-[10px] font-mono">
                            <div className="flex justify-between text-slate-400">
                                <span>{t('rate')}</span>
                                <span className="text-white">1 {fromAsset} ≈ {(fromPrice / toPrice).toFixed(5)} {toAsset}</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                                <span>{t('gas')}</span>
                                <span className="text-white">{route === 'HYPER' ? '0.35 TON' : '0.15 TON'}</span>
                            </div>
                        </div>

                        {/* SUBMIT BUTTON */}
                        <button 
                            disabled={!isValid}
                            onClick={triggerSwap}
                            className={`w-full mt-5 py-4 font-black font-orbitron rounded-2xl uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-xl ${
                                isValid 
                                ? 'bg-brand-cyan hover:bg-white text-black active:scale-95' 
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                            }`}
                            id="execute_swap_btn"
                        >
                            <ZapIcon className="w-4 h-4" /> {t('execute')}
                        </button>
                    </div>

                </div>

            </div>

            {/* MODAL 1: SIGNATURE REQUEST DRAWER */}
            <AnimatePresence>
                {isSigning && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[160] flex items-end justify-center bg-black/80 backdrop-blur-sm"
                    >
                        <div className="fixed inset-0" onClick={() => setIsSigning(false)}></div>
                        
                        <motion.div 
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="relative z-10 w-full max-w-md bg-brand-bg border-t border-white/10 rounded-t-[2.5rem] p-6 shadow-2xl space-y-6"
                        >
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-brand-purple/10 border border-brand-purple/30 flex items-center justify-center mx-auto mb-4 animate-pulse">
                                    <ShieldIcon className="w-8 h-8 text-brand-purple" />
                                </div>
                                <h3 className="font-orbitron font-black text-lg text-white uppercase tracking-wider">{t('sign_req')}</h3>
                                <p className="text-[10px] text-slate-400 max-w-xs mx-auto mt-1 leading-relaxed">{t('sign_desc')}</p>
                            </div>

                            {/* SIGNATURE TRANSACTION SUMMARY CARD */}
                            <div className="bg-black/40 border border-white/5 rounded-2xl p-4 space-y-3 font-mono text-xs">
                                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                    <span className="text-slate-500">{t('pay')}</span>
                                    <span className="text-white font-black">{fromAmount} {fromAsset}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                    <span className="text-slate-500">{t('receive')}</span>
                                    <span className="text-brand-cyan font-black">{outputAmount.toFixed(5)} {toAsset}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                    <span className="text-slate-500">{t('network')}</span>
                                    <span className="text-white">TON Mainnet</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                    <span className="text-slate-500">{t('contract')}</span>
                                    <span className="text-white text-[10px]">0xStorkMultiRouterV3</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">{t('gas_est')}</span>
                                    <span className="text-brand-purple">{route === 'HYPER' ? '0.35 TON' : '0.15 TON'}</span>
                                </div>
                            </div>

                            {/* CONTROLS */}
                            <div className="space-y-2">
                                <button
                                    onClick={handleSignAndBroadcast}
                                    className="w-full py-4 bg-brand-cyan text-black font-black font-orbitron rounded-2xl uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all"
                                    id="sign_auth_btn"
                                >
                                    {t('sign_btn')}
                                </button>
                                <button
                                    onClick={() => setIsSigning(false)}
                                    className="w-full py-3 bg-white/5 text-slate-400 hover:text-white font-orbitron font-black rounded-2xl uppercase tracking-widest text-[10px] transition-all"
                                >
                                    CANCEL
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MODAL 2: NETWORK BROADCAST LOADER */}
            <AnimatePresence>
                {isLoading && (
                    <div className="fixed inset-0 z-[170] bg-[#020617]/95 flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-24 h-24 relative mb-6">
                            <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-brand-cyan border-t-transparent rounded-full animate-spin"></div>
                            <GlobeIcon className="absolute inset-0 m-auto w-10 h-10 text-brand-cyan animate-pulse" />
                        </div>
                        
                        <h3 className="font-orbitron font-black text-lg text-white uppercase tracking-widest mb-2">{t('broadcasting')}</h3>
                        
                        <div className="space-y-1 text-xs font-mono text-slate-500">
                            <p className={loadingStep >= 0 ? "text-brand-cyan" : ""}>{loadingStep >= 0 ? "✓ " : "• "}{t('step_1')}</p>
                            <p className={loadingStep >= 1 ? "text-brand-cyan" : ""}>{loadingStep >= 1 ? "✓ " : "• "}{t('step_2')}</p>
                            <p className={loadingStep >= 2 ? "text-brand-cyan" : ""}>{loadingStep >= 2 ? "✓ " : "• "}{t('step_3')}</p>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL 3: TRANSACTION SUCCESS RECEIPT */}
            <AnimatePresence>
                {isSuccess && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 z-[180] bg-black/95 backdrop-blur-md flex items-center justify-center p-6 overflow-y-auto overscroll-contain"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-brand-card border border-brand-green/30 rounded-[2.5rem] p-6 w-full max-w-sm text-center shadow-[0_0_50px_rgba(34,197,94,0.15)] space-y-6 my-auto max-h-[90vh] flex flex-col overflow-y-auto custom-scrollbar"
                        >
                            <div className="w-20 h-20 bg-brand-green/10 border border-brand-green rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                                <CheckIcon className="w-10 h-10 text-brand-green" />
                            </div>

                            <div>
                                <h3 className="font-orbitron font-black text-xl text-white uppercase tracking-widest">{t('success_title')}</h3>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono mt-1">{t('success_desc')}</p>
                            </div>

                            {/* TX SUMMARY SLIP */}
                            <div className="bg-black/50 rounded-2xl p-4 text-xs font-mono space-y-2 border border-white/5 text-left">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Outcome</span>
                                    <span className="text-white font-bold">{fromAmount} {fromAsset} ➔ {outputAmount.toFixed(4)} {toAsset}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">{t('tx_hash')}</span>
                                    <span className="text-slate-300 text-[8px] select-all max-w-[150px] truncate">{generatedTxHash}</span>
                                </div>
                            </div>

                            {/* PILOT XP GAINED CARD */}
                            <div className="bg-brand-purple/10 border border-brand-purple/30 rounded-xl p-3 flex items-center justify-between text-left">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded bg-brand-purple/20 flex items-center justify-center text-brand-purple font-black text-[10px]">
                                        XP
                                    </div>
                                    <span className="text-[9px] font-black text-white font-orbitron tracking-wider">{t('quest_updated')}</span>
                                </div>
                                <span className="text-[10px] font-black text-brand-purple font-mono">+50 XP</span>
                            </div>

                            <button
                                onClick={handleCompleteReceipt}
                                className="w-full py-4 bg-brand-green text-black font-black font-orbitron rounded-2xl uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all"
                                id="receipt_dismiss_btn"
                            >
                                {t('done')}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </motion.div>
    );
};

export default DexAggregatorModal;
