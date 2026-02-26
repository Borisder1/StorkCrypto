import React, { useState, useEffect, useMemo, useRef } from 'react';
import { RadarIcon, SearchIcon, FilterIcon, PlusIcon, BarChartIcon, InfoIcon, ChevronRightIcon, ZapIcon, GlobeIcon } from '../icons';
import { useStore } from '../../store';
import { getTranslation } from '../../utils/translations';
import { scanMarket } from '../../services/priceService';
import { type AssetMetrics, Asset } from '../../types';
import AssetDetailModal from '../AssetDetailModal';
import { triggerHaptic } from '../../utils/haptics';
import { TacticalBackground } from '../TacticalBackground';
import UpgradeBanner from '../UpgradeBanner';
import HolographicGlobe from '../HolographicGlobe';
import InfoModal from '../InfoModal';

const ScannerListItem = React.memo(({ coin, onAssetClick, style, isAlpha }: { 
    coin: AssetMetrics, onAssetClick: (c: AssetMetrics) => void, style?: React.CSSProperties, isAlpha?: boolean
}) => {
    return (
        <div onClick={() => onAssetClick(coin)} style={style} className="absolute w-full px-1">
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
                                {isAlpha && <span className="text-[7px] font-black text-brand-purple bg-brand-purple/10 px-1 rounded animate-pulse">ALPHA</span>}
                            </div>
                            <span className="text-[8px] font-mono text-slate-500 uppercase">Vol: {coin.volatility}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className={`flex flex-col items-center w-12 py-1 rounded bg-black/20 border border-white/5`}>
                            <span className="text-[6px] text-slate-500 font-black uppercase">RSI</span>
                            <span className={`text-[10px] font-bold ${coin.rsi > 70 ? 'text-red-400' : coin.rsi < 30 ? 'text-green-400' : 'text-slate-300'}`}>{coin.rsi}</span>
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

interface ScannerModalProps {
    onClose: () => void;
}

const ScannerModal: React.FC<ScannerModalProps> = ({ onClose }) => {
    const { settings, strategies } = useStore();
    const t = (key: string) => getTranslation(settings.language, key);
    const [scanning, setScanning] = useState(false);
    const [marketData, setMarketData] = useState<AssetMetrics[]>([]);
    const [activeTab, setActiveTab] = useState<'MARKET' | 'ALPHA' | 'GLOBE'>('MARKET');
    const [scrollTop, setScrollTop] = useState(0);
    const [selectedAsset, setSelectedAsset] = useState<any>(null);
    const [showInfo, setShowInfo] = useState(false);
    
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
        } catch (e) {} finally { setScanning(false); }
    };

    useEffect(() => { performScan(); }, [activeTab]);

    const filteredData = useMemo(() => {
        if (activeTab === 'ALPHA') return marketData.filter(m => Math.abs(m.change) > 5 || m.rsi > 70 || m.rsi < 35);
        return marketData;
    }, [marketData, activeTab]);

    const totalHeight = filteredData.length * itemHeight;
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 1);
    const endIndex = Math.min(filteredData.length, Math.ceil((scrollTop + windowHeight) / itemHeight) + 1);
    const visibleItems = filteredData.slice(startIndex, endIndex);

    return (
        <div className="fixed inset-0 z-[120] bg-brand-bg flex flex-col animate-fade-in overflow-hidden">
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
                        <h1 className="font-orbitron text-lg font-black text-white tracking-widest uppercase">Scanner_V8</h1>
                        <p className="text-[8px] text-brand-cyan font-mono animate-pulse uppercase">Neural_Grid: ONLINE</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setShowInfo(true)} className="w-8 h-8 rounded-xl border border-white/10 bg-brand-card flex items-center justify-center text-slate-400 hover:text-brand-cyan"><InfoIcon className="w-4 h-4" /></button>
                    <button onClick={performScan} disabled={scanning || activeTab === 'GLOBE'} className="w-8 h-8 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan">
                        <SearchIcon className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 p-4 space-y-6 pb-32">
                <UpgradeBanner />
                
                <div className="flex gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/5 shadow-inner shrink-0">
                    <button onClick={() => { setActiveTab('MARKET'); }} className={`flex-1 py-3 rounded-xl text-[10px] font-black font-orbitron transition-all ${activeTab === 'MARKET' ? 'bg-brand-card text-brand-cyan border border-brand-cyan/20 shadow-xl' : 'text-slate-500'}`}>LIST</button>
                    <button onClick={() => { setActiveTab('ALPHA'); }} className={`flex-1 py-3 rounded-xl text-[10px] font-black font-orbitron transition-all ${activeTab === 'ALPHA' ? 'bg-brand-card text-brand-cyan border border-brand-cyan/20 shadow-xl' : 'text-slate-500'}`}>ALPHA</button>
                    <button onClick={() => setActiveTab('GLOBE')} className={`flex-1 py-3 rounded-xl text-[10px] font-black font-orbitron transition-all ${activeTab === 'GLOBE' ? 'bg-brand-card text-brand-cyan border border-brand-cyan/20 shadow-xl' : 'text-slate-500'}`}>GLOBE</button>
                </div>

                {activeTab === 'GLOBE' ? (
                    <div className="h-[400px] relative rounded-3xl overflow-hidden border border-brand-cyan/20 bg-black/40 shadow-[0_0_50px_rgba(0,217,255,0.1)]">
                        <HolographicGlobe />
                    </div>
                ) : (
                    <div ref={containerRef} onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)} className="h-[500px] overflow-y-auto custom-scrollbar relative">
                        <div style={{ height: `${totalHeight}px` }} className="relative">
                            {visibleItems.map((coin, idx) => (
                                <ScannerListItem 
                                    key={coin.ticker} 
                                    isAlpha={coin.change > 10 || coin.change < -10}
                                    coin={coin} 
                                    style={{ transform: `translateY(${(startIndex + idx) * itemHeight}px)` }}
                                    onAssetClick={(c) => { triggerHaptic('selection'); setSelectedAsset({ name: c.ticker, ticker: c.ticker, value: c.price, change: c.change }); }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {selectedAsset && <AssetDetailModal asset={selectedAsset} onClose={() => setSelectedAsset(null)} />}
            {showInfo && <InfoModal title="MARKET_SCANNER" description="Real-time asset discovery tool." features={["Alpha Filter: High volatility / RSI extremes", "Globe: Live node visualization", "Heatmap: Market temperature"]} onClose={() => setShowInfo(false)} />}
        </div>
    );
};

export default ScannerModal;