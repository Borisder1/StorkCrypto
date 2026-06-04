
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RadarIcon, SearchIcon, FilterIcon, PlusIcon, BarChartIcon, InfoIcon, ChevronRightIcon, ZapIcon, GlobeIcon } from './icons';
import { useStore } from '../store';
import { getTranslation } from '../utils/translations';
import { scanMarket } from '../services/priceService';
import { type AssetMetrics, Asset } from '../types';
import AssetDetailModal from './AssetDetailModal';
import { triggerHaptic } from '../utils/haptics';
import { TacticalBackground } from './TacticalBackground';
import UpgradeBanner from './UpgradeBanner';
import HolographicGlobe from './HolographicGlobe';

interface ScannerModalProps {
    onClose: () => void;
}

// HEATMAP GRID COMPONENT
const HeatmapGrid: React.FC<{ data: AssetMetrics[], onItemClick: (a: AssetMetrics) => void }> = ({ data, onItemClick }) => {
    const weightedData = useMemo(() => {
        return [...data]
            .map(d => ({ ...d, weight: Math.random() * 100 + 10 }))
            .sort((a, b) => b.weight - a.weight); 
    }, [data]);

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 auto-rows-[100px] sm:auto-rows-[120px] p-1">
            {weightedData.map((coin, i) => {
                const isBig = i < 2; 
                // Enhanced Colors: More vibrant Green/Red
                const colorClass = coin.change > 0 
                    ? (coin.change > 5 ? 'bg-green-600' : 'bg-green-700/80') 
                    : (coin.change < -5 ? 'bg-red-600' : 'bg-red-700/80');
                
                return (
                    <div 
                        key={coin.ticker} 
                        onClick={() => onItemClick(coin)}
                        className={`${isBig ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1'} ${colorClass} rounded-lg p-3 relative overflow-hidden cursor-pointer hover:brightness-110 transition-all active:scale-[0.98] border border-black/20`}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
                        <div className="h-full flex flex-col justify-center items-center text-center">
                            <span className={`font-black text-white ${isBig ? 'text-2xl' : 'text-sm'} font-orbitron drop-shadow-md`}>{coin.ticker}</span>
                            <span className="text-xs font-bold text-white/90 font-mono mt-1">{coin.change > 0 ? '+' : ''}{coin.change.toFixed(2)}%</span>
                            {isBig && <span className="text-[9px] text-white/70 font-mono mt-2">${coin.price.toFixed(2)}</span>}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const ScannerListItem = React.memo(({ coin, onAssetClick, isAlpha, t }: { 
    coin: AssetMetrics, onAssetClick: (c: AssetMetrics) => void, isAlpha?: boolean, t: (key: string) => string
}) => {
    return (
        <div onClick={() => onAssetClick(coin)} className="w-full px-1">
            <div className={`relative overflow-hidden rounded-xl h-[80px] transition-all cursor-pointer active:scale-[0.98] group ${isAlpha ? 'bg-brand-purple/5 border-l-2 border-l-brand-purple border-y border-r border-white/5' : 'bg-[#0a0f1e]/60 border-b border-white/5 hover:bg-white/5'}`}>
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
                                {/* Reduced font size for mobile */}
                                <h4 className="font-bold text-white text-xs font-orbitron tracking-wide">{coin.ticker}</h4>
                                {isAlpha && <span className="text-[7px] font-black text-brand-purple bg-brand-purple/10 px-1 rounded animate-pulse">{t('scanner.alpha')}</span>}
                            </div>
                            <span className="text-[8px] font-mono text-slate-500 uppercase">{t('scanner.vol')} {coin.volatility}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className={`flex flex-col items-center w-12 py-1 rounded bg-black/20 border border-white/5`}>
                            <span className="text-[6px] text-slate-500 font-black uppercase">RSI</span>
                            <span className={`text-[9px] font-bold ${coin.rsi > 70 ? 'text-red-400' : coin.rsi < 30 ? 'text-green-400' : 'text-slate-300'}`}>{coin.rsi}</span>
                        </div>

                        <div className="flex flex-col items-end min-w-[50px]">
                            <p className="font-mono text-xs font-bold text-white tracking-tight">${coin.price < 1 ? coin.price.toFixed(4) : coin.price.toFixed(2)}</p>
                            <span className={`text-[9px] font-bold ${coin.change >= 0 ? 'text-brand-green' : 'text-brand-danger'}`}>
                                {coin.change > 0 ? '+' : ''}{coin.change.toFixed(2)}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

const ScannerModal: React.FC<ScannerModalProps> = ({ onClose }) => {
    const { settings, strategies } = useStore();
    const t = (key: string) => getTranslation(settings.language, key);
    const [scanning, setScanning] = useState(false);
    const [marketData, setMarketData] = useState<AssetMetrics[]>([]);
    const [activeStrategyId, setActiveStrategyId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'LIST' | 'HEATMAP'>('LIST');
    const [subFilter, setSubFilter] = useState<'ALL' | 'GAINERS' | 'LOSERS' | 'VOLUME'>('ALL');
    const [selectedAsset, setSelectedAsset] = useState<any>(null);
    
    // Tab State: MARKET | ALPHA | GLOBE
    const [activeTab, setActiveTab] = useState<'MARKET' | 'ALPHA' | 'GLOBE'>('MARKET');

    const performScan = async () => {
        if (activeTab === 'GLOBE') return;
        setScanning(true);
        triggerHaptic('medium');
        try {
            const data = await scanMarket();
            setMarketData(data);
        } catch (e) {} finally { setScanning(false); }
    };

    useEffect(() => { performScan(); }, [activeTab]);

    const filteredData = useMemo(() => {
        let sorted = [...marketData];
        if (activeTab === 'ALPHA') sorted = sorted.filter(m => Math.abs(m.change) > 5 || m.rsi > 70 || m.rsi < 35);
        
        if (subFilter === 'GAINERS') sorted = sorted.filter(m => m.change > 0).sort((a,b) => b.change - a.change);
        else if (subFilter === 'LOSERS') sorted = sorted.filter(m => m.change < 0).sort((a,b) => a.change - b.change);
        else if (subFilter === 'VOLUME') sorted = sorted.sort((a,b) => parseFloat(b.volatility || '0') - parseFloat(a.volatility || '0'));
        return sorted;
    }, [marketData, activeTab, subFilter]);

    return (
        <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[120] bg-brand-bg flex flex-col overflow-hidden"
        >
            <TacticalBackground />
            
            <div className="safe-area-pt bg-brand-card/90 backdrop-blur-2xl border-b border-white/10 px-6 py-5 flex items-center justify-between shrink-0 relative z-20">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => { triggerHaptic('light'); onClose(); }}
                        className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 active:scale-90 transition-all shadow-lg"
                    >
                        <ChevronRightIcon className="w-5 h-5 rotate-180" />
                    </button>
                    <div>
                        <h1 className="font-orbitron text-base sm:text-lg font-black text-white tracking-widest uppercase">{t('scanner.title')}</h1>
                        <p className="text-[8px] text-brand-cyan font-mono animate-pulse uppercase">{t('scanner.status')}</p>
                    </div>
                </div>
                <button onClick={performScan} disabled={scanning || activeTab === 'GLOBE'} className="w-8 h-8 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan font-black">
                    <SearchIcon className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="flex-grow overflow-y-auto custom-scrollbar relative z-10 p-4 space-y-6 pb-32">
                <UpgradeBanner />
                
                <div className="flex gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/5 shadow-inner shrink-0">
                    <button onClick={() => { setActiveTab('MARKET'); setViewMode('LIST'); }} className={`flex-1 py-3 rounded-xl text-[10px] font-black font-orbitron transition-all ${activeTab === 'MARKET' && viewMode === 'LIST' ? 'bg-brand-card text-brand-cyan border border-brand-cyan/20 shadow-xl' : 'text-slate-500'}`}>{t('scanner.list')}</button>
                    <button onClick={() => { setActiveTab('MARKET'); setViewMode('HEATMAP'); }} className={`flex-1 py-3 rounded-xl text-[10px] font-black font-orbitron transition-all ${activeTab === 'MARKET' && viewMode === 'HEATMAP' ? 'bg-brand-card text-brand-cyan border border-brand-cyan/20 shadow-xl' : 'text-slate-500'}`}>{t('scanner.heatmap')}</button>
                    <button onClick={() => setActiveTab('GLOBE')} className={`flex-1 py-3 rounded-xl text-[10px] font-black font-orbitron transition-all ${activeTab === 'GLOBE' ? 'bg-brand-card text-brand-cyan border border-brand-cyan/20 shadow-xl' : 'text-slate-500'}`}>{t('scanner.globe')}</button>
                </div>

                {activeTab !== 'GLOBE' && (
                    <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                        <button onClick={() => setSubFilter('ALL')} className={`shrink-0 px-4 py-2 rounded-xl text-[9px] font-black font-orbitron uppercase border transition-all ${subFilter === 'ALL' ? 'bg-brand-cyan/10 border-brand-cyan text-brand-cyan' : 'bg-transparent border-white/10 text-slate-500 hover:border-white/30'}`}>All</button>
                        <button onClick={() => setSubFilter('GAINERS')} className={`shrink-0 px-4 py-2 rounded-xl text-[9px] font-black font-orbitron uppercase border transition-all ${subFilter === 'GAINERS' ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-transparent border-white/10 text-slate-500 hover:border-white/30'}`}>Top Gainers</button>
                        <button onClick={() => setSubFilter('LOSERS')} className={`shrink-0 px-4 py-2 rounded-xl text-[9px] font-black font-orbitron uppercase border transition-all ${subFilter === 'LOSERS' ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-transparent border-white/10 text-slate-500 hover:border-white/30'}`}>Top Losers</button>
                        <button onClick={() => setSubFilter('VOLUME')} className={`shrink-0 px-4 py-2 rounded-xl text-[9px] font-black font-orbitron uppercase border transition-all ${subFilter === 'VOLUME' ? 'bg-brand-purple/10 border-brand-purple text-brand-purple' : 'bg-transparent border-white/10 text-slate-500 hover:border-white/30'}`}>Volume Leaders</button>
                    </div>
                )}

                {activeTab === 'GLOBE' ? (
                    <div className="h-[400px] relative rounded-3xl overflow-hidden border border-brand-cyan/20 bg-black/40 shadow-[0_0_50px_rgba(0,217,255,0.1)]">
                        <HolographicGlobe />
                    </div>
                ) : viewMode === 'HEATMAP' ? (
                    <div className="bg-black/30 p-2 rounded-2xl border border-white/5">
                        <HeatmapGrid 
                            data={filteredData} 
                            onItemClick={(coin) => { triggerHaptic('selection'); setSelectedAsset({ name: coin.ticker, ticker: coin.ticker, value: coin.price, change: coin.change }); }}
                        />
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center opacity-70">
                        <RadarIcon className="w-12 h-12 text-slate-500 mb-4 animate-pulse" />
                        <p className="text-slate-400 font-black uppercase text-[10px] font-orbitron">{t('scanner.no_results_title') || 'NO SIGNALS DETECTED'}</p>
                        <p className="text-slate-500 text-[9px] font-mono mt-2">{t('scanner.no_results_desc') || 'Try adjusting your filters'}</p>
                    </div>
                ) : (
                    <div className="space-y-2.5">
                        {filteredData.map((coin) => (
                            <ScannerListItem 
                                key={coin.ticker} 
                                isAlpha={coin.change > 10 || coin.change < -10}
                                coin={coin} 
                                onAssetClick={(c) => { triggerHaptic('selection'); setSelectedAsset({ name: c.ticker, ticker: c.ticker, value: c.price, change: c.change }); }}
                                t={t}
                            />
                        ))}
                    </div>
                )}
            </div>

            {selectedAsset && <AssetDetailModal asset={selectedAsset} onClose={() => setSelectedAsset(null)} />}
        </motion.div>
    );
};

export default ScannerModal;
