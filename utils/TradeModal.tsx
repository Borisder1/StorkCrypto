import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store';
import { triggerHaptic } from '../utils/haptics';
import { TrendingUpIcon, InfoIcon, ShieldIcon, ActivityIcon, PlusIcon, ChevronRightIcon } from '../components/icons';
import { createChart, ColorType, IChartApi, ISeriesApi } from 'lightweight-charts';
import { getOHLCData, TICKER_TO_ID } from '../services/priceService';
import { getTranslation } from '../utils/translations';

interface TradeModalProps {
    ticker: string;
    currentPrice: number;
    initialTP?: number;
    initialSL?: number;
    onClose: () => void;
}

const TradeModal: React.FC<TradeModalProps> = ({ ticker, currentPrice, initialTP, initialSL, onClose }) => {
    const { openPosition, userStats, settings } = useStore();
    const t = (key: string) => getTranslation(settings.language, key);
    
    const [side, setSide] = useState<'LONG' | 'SHORT'>('LONG');
    const [leverage, setLeverage] = useState(10);
    const [margin, setMargin] = useState<string>('');
    const [displayPrice, setDisplayPrice] = useState(currentPrice);
    const [takeProfit, setTakeProfit] = useState<string>(initialTP ? initialTP.toString() : '');
    const [stopLoss, setStopLoss] = useState<string>(initialSL ? initialSL.toString() : '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartInstance = useRef<IChartApi | null>(null);
    const observerRef = useRef<ResizeObserver | null>(null);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            const volatility = displayPrice * 0.0005; 
            const change = (Math.random() - 0.5) * volatility;
            setDisplayPrice(prev => prev + change);
        }, 1000);
        return () => clearInterval(interval);
    }, [displayPrice]);

    useEffect(() => {
        if (!chartContainerRef.current) return;
        
        if (chartInstance.current) {
            try {
                chartInstance.current.remove();
            } catch(e) {}
            chartInstance.current = null;
        }

        let isMounted = true;
        let chart: IChartApi | null = null;

        const loadDataAndInit = async () => {
            try {
                if (!chartContainerRef.current) return;

                chart = createChart(chartContainerRef.current, {
                    layout: { background: { type: ColorType.Solid, color: 'transparent' }, textColor: '#64748b' },
                    grid: { vertLines: { visible: false }, horzLines: { color: 'rgba(255, 255, 255, 0.05)' } },
                    width: chartContainerRef.current.clientWidth,
                    height: 120,
                    timeScale: { timeVisible: false, secondsVisible: false, borderColor: 'transparent' },
                    rightPriceScale: { borderColor: 'transparent', visible: false },
                    crosshair: { mode: 0 },
                    handleScale: false, handleScroll: false,
                });

                // Add ResizeObserver for responsiveness
                if (observerRef.current) observerRef.current.disconnect();
                observerRef.current = new ResizeObserver(() => {
                    if (chart && chartContainerRef.current) {
                        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
                    }
                });
                observerRef.current.observe(chartContainerRef.current);

                const series = chart.addAreaSeries({
                    lineColor: '#00d9ff', topColor: 'rgba(0, 217, 255, 0.1)', bottomColor: 'rgba(0, 217, 255, 0)', lineWidth: 2,
                });

                const id = TICKER_TO_ID[ticker] || ticker.toLowerCase();
                const data = await getOHLCData(id, '1');
                
                if (data && data.length > 0 && isMounted && chart) {
                    const formatted = data.map(d => ({ 
                        time: d.time / 1000 as any, 
                        value: d.close 
                    })).sort((a, b) => (a.time as number) - (b.time as number));
                    
                    series.setData(formatted);
                    chart.timeScale().fitContent();
                    chartInstance.current = chart;
                }
                
                // Cleanup observer on unmount (will be handled by closure, but good to track if needed)
                // Since we don't have a separate ref for observer, we rely on component unmount
            } catch (e) {
                console.warn("Trade chart init error", e);
            }
        };

        loadDataAndInit();

        return () => { 
            isMounted = false; 
            if (chartInstance.current) {
                try {
                    chartInstance.current.remove();
                } catch(e) {}
                chartInstance.current = null;
            }
            if (observerRef.current) {
                observerRef.current.disconnect();
                observerRef.current = null;
            }
        };
    }, [ticker]);

    const handleTrade = () => {
        if (!parseFloat(margin)) return;
        setIsSubmitting(true);
        triggerHaptic('success');
        setTimeout(() => {
            openPosition(ticker, side, parseFloat(margin), leverage, displayPrice, parseFloat(takeProfit) || undefined, parseFloat(stopLoss) || undefined);
            onClose();
        }, 800);
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center animate-fade-in">
            <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={onClose}></div>
            <div className="relative z-10 w-full sm:max-w-md bg-brand-bg rounded-t-[2.5rem] sm:rounded-3xl border-t sm:border border-white/10 shadow-2xl flex flex-col max-h-[95vh] animate-slide-up-mobile sm:animate-zoom-in overflow-hidden">
                
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-brand-card/50 shrink-0">
                    <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400">
                         <ChevronRightIcon className="w-5 h-5 rotate-180" />
                    </button>
                    <h2 className="font-orbitron font-black text-lg text-white tracking-widest uppercase">Execute_Order</h2>
                    <div className="w-10"></div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                    <div className="relative h-20 bg-black/20 rounded-2xl overflow-hidden border border-white/5">
                        <div ref={chartContainerRef} className="absolute inset-0 opacity-40 pointer-events-none" />
                        <div className="absolute inset-0 flex items-center justify-between px-4">
                             <div className="flex items-center gap-3">
                                <img 
                                    src={`https://assets.coincap.io/assets/icons/${ticker.toLowerCase()}@2x.png`} 
                                    className="w-8 h-8" 
                                    onError={(e) => {
                                        e.currentTarget.src = `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/${ticker.toLowerCase()}.png`;
                                    }}
                                />
                                <span className="text-white font-black font-orbitron">{ticker}/USDT</span>
                             </div>
                             <span className="text-brand-cyan font-mono font-black">${displayPrice.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/5">
                        <button onClick={() => setSide('LONG')} className={`py-3.5 rounded-xl font-black font-orbitron text-[10px] transition-all flex items-center justify-center gap-2 ${side === 'LONG' ? 'bg-brand-green text-black shadow-lg shadow-brand-green/20' : 'text-slate-500'}`}>LONG</button>
                        <button onClick={() => setSide('SHORT')} className={`py-3.5 rounded-xl font-black font-orbitron text-[10px] transition-all flex items-center justify-center gap-2 ${side === 'SHORT' ? 'bg-brand-danger text-white shadow-lg shadow-brand-danger/20' : 'text-slate-500'}`}>SHORT</button>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-brand-card border border-white/5 rounded-2xl p-5">
                            <div className="flex justify-between mb-2">
                                <span className="text-[9px] text-slate-500 font-black uppercase">Margin ($)</span>
                                <span className="text-[9px] text-slate-600 uppercase font-mono">Bal: {userStats.demoBalance.toFixed(0)}</span>
                            </div>
                            <input type="number" value={margin} onChange={(e) => setMargin(e.target.value)} placeholder="0.00" className="w-full bg-transparent text-3xl font-black text-white outline-none font-mono" />
                        </div>

                        <div className="bg-brand-card border border-white/5 rounded-2xl p-5">
                            <div className="flex justify-between mb-4">
                                <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Leverage</span>
                                <span className="text-[10px] text-brand-purple font-black font-mono">{leverage}x</span>
                            </div>
                            <input type="range" min="1" max="50" step="1" value={leverage} onChange={(e) => setLeverage(parseInt(e.target.value))} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-purple" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
                            <label className="text-[9px] text-slate-600 block mb-1 font-black uppercase">Take Profit</label>
                            <input type="number" value={takeProfit} onChange={(e) => setTakeProfit(e.target.value)} placeholder="Price" className="w-full bg-transparent text-sm font-mono text-brand-green outline-none font-bold" />
                        </div>
                        <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
                            <label className="text-[9px] text-slate-600 block mb-1 font-black uppercase">Stop Loss</label>
                            <input type="number" value={stopLoss} onChange={(e) => setStopLoss(e.target.value)} placeholder="Price" className="w-full bg-transparent text-sm font-mono text-brand-danger outline-none font-bold" />
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-white/5 bg-[#0f172a] shrink-0 safe-area-pb">
                    <button onClick={handleTrade} disabled={isSubmitting || !margin} className={`w-full py-5 rounded-2xl font-black font-orbitron text-xs tracking-[0.2em] shadow-2xl transition-all active:scale-95 ${side === 'LONG' ? 'bg-brand-green text-black hover:bg-green-400' : 'bg-brand-danger text-white hover:bg-red-400'} disabled:opacity-50 uppercase`}>
                        {isSubmitting ? 'Processing...' : `Confirm ${side} Order`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TradeModal;