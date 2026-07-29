
import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { getCryptoPrices, MASTER_ASSET_LIST } from '../services/priceService';
import { useStore } from '../store';
import { MarketPriceMap, Asset } from '../types';
import { getTranslation } from '../utils/translations';
import { triggerHaptic } from '../utils/haptics';
import AssetDetailModal from './AssetDetailModal';

const MarketTicker: React.FC = React.memo(() => {
    const { settings, updateSettings, showToast } = useStore();
    const [prices, setPrices] = useState<MarketPriceMap>({});
    const [source, setSource] = useState<string>('SYNCING');
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    
    const t = (key: string) => getTranslation(settings.language, key);

    const toggleSunlightMode = (e: React.MouseEvent) => {
        e.stopPropagation();
        const newMode = settings.themeMode === 'daylight' ? 'midnight' : 'daylight';
        updateSettings({ themeMode: newMode });
        if (showToast) {
            showToast(newMode === 'daylight' ? '☀️ Режим "Сонячний день" (Високий контраст)' : '🌙 Нічний режим');
        }
    };

    useEffect(() => {
        let isMounted = true;
        const loadData = async () => {
            try {
                const data = await getCryptoPrices();
                if (isMounted) {
                    setPrices(data);
                    const firstId = MASTER_ASSET_LIST[0].id;
                    setSource(data[firstId]?.source || 'CACHE');
                }
            } catch (e) {}
        };

        loadData();
        const interval = setInterval(loadData, 20000); 
        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    const manipulatedData = useMemo(() => {
        return MASTER_ASSET_LIST.map(asset => {
            const data = prices[asset.id];
            let price = data?.usd || 0;
            let change = data?.usd_24h_change || 0;

            if (settings.marketOverride === 'PUMP') change = Math.abs(change) + 5;
            if (settings.marketOverride === 'DUMP') change = -(Math.abs(change) + 5);
            
            return { ticker: asset.ticker, name: asset.name, price, change };
        });
    }, [prices, settings.marketOverride]);

    const getSourceLabel = () => {
        if (source === 'SYNCING') return 'LIVE...';
        return 'LIVE'; 
    };

    const handleCoinClick = (coin: { ticker: string; name: string; price: number; change: number }) => {
        triggerHaptic('light');
        setSelectedAsset({
            ticker: coin.ticker,
            name: coin.name || coin.ticker,
            icon: '',
            amount: 0,
            value: coin.price,
            change: coin.change,
            buyPrice: coin.price
        });
    };

    const isDaylight = settings.themeMode === 'daylight';

    return (
        <>
            <motion.div 
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', damping: 20, stiffness: 100, delay: 0.2 }}
                className={`fixed top-0 left-0 w-full h-9 z-[30] flex items-center overflow-hidden select-none border-b transition-colors ${
                    isDaylight 
                        ? 'bg-slate-100/95 border-slate-300 text-slate-900 shadow-sm' 
                        : 'bg-[#020617]/90 border-white/10 text-white'
                }`}
            >
                {/* Status Pill Badge */}
                <div className={`relative flex items-center gap-1.5 pl-3 pr-3 h-full shrink-0 z-20 ${
                    isDaylight ? 'bg-gradient-to-r from-slate-100 via-slate-100 to-transparent' : 'bg-gradient-to-r from-[#020617] via-[#020617] to-transparent'
                }`}>
                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border backdrop-blur-sm ${
                        isDaylight 
                            ? 'bg-slate-200/80 border-slate-300 text-slate-900 shadow-sm' 
                            : 'bg-white/10 border-white/10 text-slate-200'
                    }`}>
                        <div className={`w-2 h-2 rounded-full animate-pulse ${source === 'BINANCE' || source === 'LIVE' ? 'bg-emerald-500 shadow-[0_0_6px_#22c55e]' : 'bg-cyan-500 shadow-[0_0_6px_#06b6d4]'}`}></div>
                        <span className="text-[10px] font-black tracking-widest uppercase font-mono">
                            {getSourceLabel()}
                        </span>
                    </div>
                </div>
                
                {/* Scrolling Ticker (with Hover/Touch Pause & Hardware-Accelerated crisp text) */}
                <div className="flex-1 overflow-hidden relative h-full flex items-center pointer-events-auto cursor-pointer">
                    <div className="flex w-max items-center shrink-0 animate-marquee">
                        {[...manipulatedData, ...manipulatedData, ...manipulatedData].map((coin, idx) => (
                            <button
                                key={`${coin.ticker}-${idx}`} 
                                onClick={() => handleCoinClick(coin)}
                                title={`Клікніть для відкриття аналітики ${coin.ticker}`}
                                className={`flex items-center gap-2 mx-3 px-2 py-1 rounded-md transition-all shrink-0 border ${
                                    isDaylight 
                                        ? 'bg-white/80 border-slate-200 hover:bg-sky-50 hover:border-sky-300 shadow-sm' 
                                        : 'bg-white/5 border-white/5 hover:bg-white/15 hover:border-cyan-500/40'
                                }`}
                            >
                                <span className={`text-xs font-black font-mono tracking-tight ${isDaylight ? 'text-slate-900' : 'text-slate-100'}`}>
                                    {coin.ticker}
                                </span>
                                <span className={`text-xs font-mono font-bold ${isDaylight ? 'text-sky-700' : 'text-cyan-300'}`}>
                                    ${coin.price < 1 ? coin.price.toFixed(4) : coin.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                </span>
                                <span className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded ${
                                    coin.change >= 0 
                                        ? (isDaylight ? 'text-emerald-800 bg-emerald-100 border border-emerald-300' : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20')
                                        : (isDaylight ? 'text-rose-800 bg-rose-100 border border-rose-300' : 'text-rose-400 bg-rose-500/10 border border-rose-500/20')
                                }`}>
                                    {coin.change >= 0 ? '▲ +' : '▼ '}{coin.change.toFixed(2)}%
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
                
                {/* Theme Toggle Button & Right Gradient */}
                <div className={`relative z-20 flex items-center pr-3 pl-2 h-full shrink-0 pointer-events-auto ${
                    isDaylight ? 'bg-gradient-to-l from-slate-100 via-slate-100 to-transparent' : 'bg-gradient-to-l from-[#020617] via-[#020617] to-transparent'
                }`}>
                    <button 
                        onClick={toggleSunlightMode}
                        title={isDaylight ? "Переключити на Нічний режим" : "Переключити на Денний режим"}
                        className={`px-2 py-1 rounded-lg border text-xs font-bold transition-all active:scale-95 flex items-center gap-1 shadow-sm ${
                            isDaylight 
                                ? 'bg-amber-100 border-amber-300 text-amber-900 hover:bg-amber-200' 
                                : 'bg-white/10 border-white/15 text-slate-200 hover:bg-white/20'
                        }`}
                    >
                        <span>{isDaylight ? '☀️' : '🌙'}</span>
                        <span className="text-[10px] hidden sm:inline uppercase tracking-wider">{isDaylight ? 'DAY' : 'NIGHT'}</span>
                    </button>
                </div>
            </motion.div>

            {/* Modal preview when user clicks on a ticker item */}
            {selectedAsset && (
                <AssetDetailModal 
                    asset={selectedAsset} 
                    onClose={() => setSelectedAsset(null)} 
                />
            )}
        </>
    );
});

export default MarketTicker;

