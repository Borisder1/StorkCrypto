
import React, { useEffect, useState, useMemo } from 'react';
import { getCryptoPrices, MASTER_ASSET_LIST } from '../services/priceService';
import { useStore } from '../store';
import { MarketPriceMap } from '../types';
import { getTranslation } from '../utils/translations';

const MarketTicker: React.FC = React.memo(() => {
    const { settings, updateMarketPrices } = useStore();
    const [prices, setPrices] = useState<MarketPriceMap>({});
    const [source, setSource] = useState<string>('SYNCING');

    const t = (key: string) => getTranslation(settings.language, key);

    useEffect(() => {
        let isMounted = true;
        const loadData = async () => {
            try {
                const data = await getCryptoPrices();
                if (isMounted) {
                    setPrices(data);
                    updateMarketPrices(data); // ✨ Sync to Store for Sentinel
                    const firstId = MASTER_ASSET_LIST[0].id;
                    setSource(data[firstId]?.source || 'CACHE');
                }
            } catch (e) { }
        };

        loadData();
        const interval = setInterval(loadData, 20000);
        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    // Реалістичні статичні ціни як fallback
    const STATIC_PRICES: Record<string, { price: number, change: number }> = {
        'BTC': { price: 90000, change: 2.5 },
        'ETH': { price: 2500, change: 1.8 },
        'BNB': { price: 320, change: -0.5 },
        'SOL': { price: 95, change: 4.2 },
        'XRP': { price: 0.52, change: -1.2 },
        'ADA': { price: 0.38, change: 0.8 },
        'DOGE': { price: 0.08, change: 3.5 },
        'MATIC': { price: 0.75, change: -0.3 },
        'DOT': { price: 5.2, change: 1.1 },
        'AVAX': { price: 18, change: 2.0 }
    };

    const manipulatedData = useMemo(() => {
        return MASTER_ASSET_LIST.map(asset => {
            const data = prices[asset.id];
            const staticData = STATIC_PRICES[asset.ticker] || { price: 1, change: 0 };
            let price = data?.usd || staticData.price;
            let change = data?.usd_24h_change || staticData.change;

            if (settings.marketOverride === 'PUMP') change = Math.abs(change) + 5;
            if (settings.marketOverride === 'DUMP') change = -(Math.abs(change) + 5);

            return { ticker: asset.ticker, price, change };
        });
    }, [prices, settings.marketOverride]);

    const getSourceLabel = () => {
        if (source === 'SYNCING') return t('ticker.syncing');
        if (source === 'CACHE') return t('ticker.cache');
        return source;
    };

    return (
        <div className="fixed top-0 left-0 w-full h-12 z-[80] flex items-center overflow-hidden pointer-events-none select-none border-b border-white/5">
            {/* Glass Background */}
            <div className="absolute inset-0 bg-[#020617]/60 backdrop-blur-md"></div>

            {/* Status Pill */}
            <div className={`relative flex items-center gap-2 pl-6 pr-4 h-full shrink-0 z-20 bg-gradient-to-r from-[#020617] to-transparent`}>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-md border border-white/5 backdrop-blur-sm">
                    <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${source === 'BINANCE' ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-brand-cyan shadow-[0_0_5px_#00d9ff]'}`}></div>
                    <span className="text-[8px] font-bold tracking-wider uppercase font-mono text-slate-300">
                        {getSourceLabel()}
                    </span>
                </div>
            </div>

            {/* Scrolling Ticker */}
            <div className="flex-1 overflow-hidden relative h-full flex items-center mask-linear-fade">
                <div className="flex animate-marquee w-max items-center hover:[animation-play-state:paused] pointer-events-auto cursor-help">
                    {[...manipulatedData, ...manipulatedData].map((coin, idx) => (
                        <div key={`${coin.ticker}-${idx}`} className="flex items-center gap-2 mx-6 group">
                            <span className="text-[10px] font-black text-slate-300 font-orbitron group-hover:text-white transition-colors">{coin.ticker}</span>
                            <span className="text-[10px] font-mono text-brand-cyan/80">
                                ${coin.price < 1 ? coin.price.toFixed(5) : coin.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </span>
                            <span className={`text-[9px] font-bold ${coin.change >= 0 ? 'text-brand-green' : 'text-brand-danger'}`}>
                                {coin.change >= 0 ? '▲' : '▼'}{Math.abs(coin.change).toFixed(1)}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="absolute top-0 right-0 w-12 h-full bg-gradient-to-l from-[#020617] to-transparent z-10"></div>
        </div>
    );
});

export default MarketTicker;
