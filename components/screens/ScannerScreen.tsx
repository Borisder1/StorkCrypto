
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { RadarIcon, SearchIcon, GlobeIcon, ZapIcon } from '../icons';
import { useStore } from '../../store';
import { getTranslation } from '../../utils/translations';
import { scanMarket } from '../../services/priceService';
import { type AssetMetrics, Asset } from '../../types';
import AssetDetailModal from '../AssetDetailModal';
import { triggerHaptic } from '../../utils/haptics';
import { TacticalBackground } from '../TacticalBackground';
import UpgradeBanner from '../UpgradeBanner';
import HolographicGlobe from '../HolographicGlobe';
import EmptyState from '../EmptyState';

const ScannerListItem = React.memo(({ coin, onAssetClick, style, isAlpha }: {
    coin: AssetMetrics, onAssetClick: (c: AssetMetrics) => void, style?: React.CSSProperties, isAlpha?: boolean
}) => {
    const isBullish = coin.rsi > 50;

    return (
        <div onClick={() => onAssetClick(coin)} style={style} className="absolute w-full px-1">
            <div className={`relative overflow-hidden rounded-xl h-[80px] transition-all cursor-pointer active:scale-[0.98] group ${isAlpha ? 'bg-brand-purple/5 border-l-2 border-l-brand-purple border-y border-r border-white/5' : 'bg-[#0a0f1e]/60 border-b border-white/5 hover:bg-white/5'}`}>

                {/* Active Hover Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-brand-cyan/0 via-brand-cyan/5 to-brand-cyan/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none"></div>

                <div className="relative z-10 flex items-center justify-between p-3 h-full">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center p-1.5 border border-white/5 group-hover:border-white/20 transition-colors">
                            <img
                                src={`https://assets.coincap.io/assets/icons/${coin.ticker.toLowerCase()}@2x.png`}
                                className="w-full h-full object-contain opacity-90"
                                loading="lazy"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                        </div>

                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="font-bold text-white text-sm font-orbitron tracking-wide">{coin.ticker}</h4>
                                {isAlpha && <span className="text-[7px] font-black text-brand-purple bg-brand-purple/10 px-1 rounded animate-pulse">ALPHA</span>}
                            </div>
                            <span className="text-[9px] font-mono text-slate-500 uppercase">Vol: {coin.volatility}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* RSI Pill */}
                        <div className={`flex flex-col items-center w-16 py-1 rounded bg-black/20 border border-white/5`}>
                            <span className="text-[7px] text-slate-500 font-black uppercase">RSI</span>
                            <span className={`text-[10px] font-bold ${coin.rsi > 70 ? 'text-red-400' : coin.rsi < 30 ? 'text-green-400' : 'text-slate-300'}`}>{coin.rsi}</span>
                        </div>

                        <div className="flex flex-col items-end min-w-[60px]">
                            <p className="font-mono text-sm font-bold text-white tracking-tight">${coin.price < 1 ? coin.price.toFixed(4) : coin.price.toFixed(2)}</p>
                            <span className={`text-[10px] font-bold ${coin.change >= 0 ? 'text-brand-green' : 'text-brand-danger'}`}>
                                {coin.change > 0 ? '+' : ''}{coin.change.toFixed(2)}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

const ScannerScreen: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { settings } = useStore();
    const t = (key: string) => getTranslation(settings.language, key);
    const [scanning, setScanning] = useState(false);
    const [marketData, setMarketData] = useState<AssetMetrics[]>([]);
    const [activeTab, setActiveTab] = useState<'MARKET' | 'ALPHA' | 'GLOBE'>('MARKET');
    const [scrollTop, setScrollTop] = useState(0);
    const [selectedAssetForDetail, setSelectedAssetForDetail] = useState<Asset | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);
    const itemHeight = 84;
    const windowHeight = 600;

    const performScan = async () => {
        if (activeTab === 'GLOBE') return;
        setScanning(true);
        triggerHaptic('medium');
        try {
            const data = await scanMarket();
            setMarketData(data);
        } catch (e) { } finally { setScanning(false); }
    };

    useEffect(() => { performScan(); }, []);

    const processedData = useMemo(() => {
        if (activeTab === 'MARKET') return marketData || [];
        if (activeTab === 'ALPHA') return (marketData || []).filter(m => m.rsi > 65 || m.rsi < 35).slice(0, 15);
        return [];
    }, [marketData, activeTab]);

    const totalHeight = processedData.length * itemHeight;
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 1);
    const endIndex = Math.min(processedData.length, Math.ceil((scrollTop + windowHeight) / itemHeight) + 1);
    const visibleItems = processedData.slice(startIndex, endIndex);

    return (
        <div className="p-4 md:p-6 pb-40 min-h-screen bg-[#020617] relative flex flex-col overflow-hidden animate-fade-in">
            <TacticalBackground />

            <div className="flex items-center justify-between mb-6 pt-4 relative z-10 shrink-0">
                <div>
                    <h1 className="font-orbitron text-2xl font-black text-white italic tracking-tighter uppercase">{t('scanner.title')}</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${scanning ? 'bg-brand-cyan animate-ping' : 'bg-brand-green'}`}></div>
                        <p className="text-[9px] text-slate-500 font-mono uppercase tracking-[0.2em] font-black">
                            {activeTab === 'GLOBE' ? 'GEOSPATIAL_NET_V2' : t('scanner.subtitle')}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={performScan} disabled={scanning || activeTab === 'GLOBE'} className="w-10 h-10 rounded-xl border border-white/10 bg-brand-card flex items-center justify-center text-slate-400 hover:text-brand-cyan active:scale-95 transition-all disabled:opacity-30 shadow-lg">
                        <SearchIcon className={`w-5 h-5 ${scanning ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-xl border border-white/10 bg-brand-card flex items-center justify-center text-slate-400 hover:text-white active:scale-90 transition-all shadow-lg"
                    >
                        <span className="text-lg font-bold">✕</span>
                    </button>
                </div>
            </div>

            <UpgradeBanner />

            <div className="flex gap-2 bg-black/40 p-1 rounded-xl border border-white/5 mb-4 relative z-10 shrink-0">
                {['MARKET', 'ALPHA', 'GLOBE'].map(tab => (
                    <button key={tab} onClick={() => { triggerHaptic('selection'); setActiveTab(tab as any); }} className={`flex-1 py-2.5 rounded-lg text-[9px] font-black font-orbitron tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${activeTab === tab ? 'bg-white/10 text-white shadow-sm border border-white/10' : 'text-slate-500 hover:text-slate-300'}`}>
                        {tab === 'ALPHA' && <ZapIcon className="w-3 h-3" />}
                        {tab === 'GLOBE' && <GlobeIcon className="w-3 h-3" />}
                        {t(`scanner.${tab.toLowerCase()}`)}
                    </button>
                ))}
            </div>

            {activeTab === 'GLOBE' ? (
                <div className="flex-1 relative z-10 rounded-3xl overflow-hidden border border-brand-cyan/20 bg-black/40 shadow-[0_0_50px_rgba(0,217,255,0.1)] animate-fade-in">
                    <HolographicGlobe />
                </div>
            ) : (
                <div ref={containerRef} onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)} className="flex-1 overflow-y-auto custom-scrollbar relative z-10 pt-2">
                    {processedData.length === 0 && !scanning ? (
                        <EmptyState
                            message={t('scanner.no_data')}
                            subMessage="Market scan returned zero results matching current parameters."
                            icon={<SearchIcon className="w-6 h-6 text-slate-500 opacity-50" />}
                        />
                    ) : (
                        <div className="relative" style={{ height: `${totalHeight}px` }}>
                            {visibleItems?.map((coin, idx) => (
                                <ScannerListItem 
                                    key={coin.ticker} 
                                    isAlpha={activeTab === 'ALPHA'}
                                    coin={coin} 
                                    style={{ transform: `translateY(${(startIndex + idx) * itemHeight}px)` }} 
                                    onAssetClick={(c) => { triggerHaptic('light'); setSelectedAssetForDetail({ name: c.ticker, ticker: c.ticker, icon: c.ticker, amount: 0, value: c.price, change: c.change }); }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {selectedAssetForDetail && <AssetDetailModal asset={selectedAssetForDetail} onClose={() => setSelectedAssetForDetail(null)} />}
        </div>
    );
};

export default ScannerScreen;
