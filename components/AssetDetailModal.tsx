import React, { useState, useEffect, useRef } from 'react';
import { BotIcon, BarChartIcon, TrendingUpIcon, RadarIcon, ShieldIcon, ActivityIcon, EyeIcon, ChevronRightIcon, ZapIcon, BellIcon, PlusIcon, GlobeIcon } from './icons';
import { getOHLCData, TICKER_TO_ID, type OHLCData } from '../services/priceService';
import { binanceWS } from '../services/websocketService';
import { triggerHaptic } from '../utils/haptics';
import { useStore } from '../store';
import { Asset, TradingSignal, PriceAlert } from '../types';
import { createChart, ColorType, IChartApi, LineStyle, ISeriesApi } from 'lightweight-charts';
import { getTranslation } from '../utils/translations';
import { calculateZScore, calculateVolumeProfile, generateOrderHeatmap, calculateCumulativeDelta, calculateExhaustionIndex, calculateInstitutionalConviction, calculateSMA, calculateBollingerBands, runMonteCarloSimulation, calculateFractalDimension, calculateMarketEntropy, type VolumeBin, type OrderWall, type SimulationPath } from '../services/quantService';
import { generateSpecificAssetAnalysis } from '../services/geminiService';

const TIMEFRAMES = [
    { label: '1H', days: '0.04' },
    { label: '4H', days: '0.16' },
    { label: '24H', days: '1' },
    { label: '7D', days: '7' },
];

const MonteCarloChart: React.FC<{ startPrice: number, volatility: number, paths: SimulationPath[], takeProfit?: number, stopLoss?: number }> = ({ startPrice, volatility, paths, takeProfit, stopLoss }) => {
    if (!paths || paths.length === 0) return <div className="h-48 flex items-center justify-center text-xs text-slate-500 animate-pulse">RUNNING_SIMULATION...</div>;

    const minPrice = Math.min(...paths.flatMap(p => p.path), stopLoss || startPrice * 0.9);
    const maxPrice = Math.max(...paths.flatMap(p => p.path), takeProfit || startPrice * 1.1);
    const range = maxPrice - minPrice;

    const wins = paths.filter(p => takeProfit && p.path.some(price => price >= takeProfit)).length;
    const simWinRate = ((wins / paths.length) * 100).toFixed(1);

    return (
        <div className="relative h-56 w-full bg-black/40 rounded-xl border border-white/5 overflow-hidden">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full opacity-60">
                {paths.map((sim, i) => (
                    <polyline
                        key={i}
                        points={sim.path.map((price, idx) => `${(idx / (sim.path.length - 1)) * 100},${100 - ((price - minPrice) / range) * 100}`).join(' ')}
                        fill="none"
                        stroke={takeProfit && sim.path.some(p => p >= takeProfit) ? '#22c55e' : '#ef4444'}
                        strokeWidth="0.5"
                        strokeOpacity="0.4"
                    />
                ))}
            </svg>
            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur px-3 py-2 rounded-lg border border-white/10">
                <p className="text-[9px] text-slate-400 uppercase font-black mb-1">Neural_Prob_Matrix</p>
                <span className={`text-xl font-black font-orbitron ${Number(simWinRate) > 50 ? 'text-brand-green' : 'text-brand-danger'}`}>{simWinRate}%</span>
            </div>
        </div>
    );
};

const AssetDetailModal: React.FC<{ asset: Asset, signal?: TradingSignal | null, onClose: () => void }> = ({ asset, signal, onClose }) => {
    const { settings, addAlert, alerts, removeAlert, showToast } = useStore();
    const t = (key: string) => getTranslation(settings?.language || 'en', key);
    const [activeTab, setActiveTab] = useState<'CHART' | 'WATCHDOG' | 'AI_SETUP'>('CHART');
    const [timeframe, setTimeframe] = useState('7');
    const [chartType, setChartType] = useState<'CANDLE' | 'LINE'>('CANDLE');
    const [candleData, setCandleData] = useState<OHLCData[]>([]);
    const [quant, setQuant] = useState({ fdi: 1.5, entropy: 0.5, exhaustion: null as any, conviction: null as any });
    const [aiReport, setAiReport] = useState<any>(null);
    const [aiLoading, setAiLoading] = useState(false);

    const [alertPrice, setAlertPrice] = useState<string>('');

    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartInstance = useRef<IChartApi | null>(null);
    const mainSeriesRef = useRef<ISeriesApi<"Candlestick"> | ISeriesApi<"Area"> | null>(null);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                const data = await getOHLCData(TICKER_TO_ID[asset.ticker] || asset.ticker, timeframe);
                if (!mounted) return;
                setCandleData(data);

                // Stage 5 Quant Metrics
                const prices = data.map(d => d.close);
                const [fdi, entropy, exh, delta] = await Promise.all([
                    calculateFractalDimension(prices),
                    calculateMarketEntropy(prices),
                    calculateExhaustionIndex(data, calculateZScore(asset.value, prices)),
                    calculateCumulativeDelta(data)
                ]);

                const conv = await calculateInstitutionalConviction(data, delta.currentDelta);

                if (mounted) {
                    setQuant({ fdi, entropy, exhaustion: exh, conviction: conv });
                }
            } catch (e) { }
        };
        load();
        return () => { mounted = false; };
    }, [asset.ticker, timeframe]);

    useEffect(() => {
        if (activeTab === 'AI_SETUP' && !aiReport) {
            setAiLoading(true);
            generateSpecificAssetAnalysis(asset.ticker, asset.value, asset.change, settings.language).then(res => {
                setAiReport(res);
                setAiLoading(false);
            });
        }
    }, [activeTab, asset.ticker, settings.language, aiReport]);

    // WebSocket Update Guard
    useEffect(() => {
        if (!mainSeriesRef.current || candleData.length === 0 || activeTab !== 'CHART') return;

        const unsubscribe = binanceWS.subscribe((data) => {
            const update = data[asset.ticker];
            if (update && mainSeriesRef.current) {
                const lastCandle = candleData[candleData.length - 1];
                const updatedTime = (lastCandle.time / 1000) as any;

                if (chartType === 'CANDLE') {
                    (mainSeriesRef.current as ISeriesApi<"Candlestick">).update({
                        time: updatedTime,
                        open: lastCandle.open,
                        high: Math.max(lastCandle.high, update.price),
                        low: Math.min(lastCandle.low, update.price),
                        close: update.price
                    });
                } else {
                    (mainSeriesRef.current as ISeriesApi<"Area">).update({
                        time: updatedTime,
                        value: update.price
                    });
                }
            }
        });
        return () => { unsubscribe(); };
    }, [asset.ticker, candleData, chartType, activeTab]);

    // Chart Lifecycle Management
    useEffect(() => {
        if (!chartContainerRef.current || candleData.length === 0 || activeTab !== 'CHART') return;

        if (chartInstance.current) {
            chartInstance.current.remove();
            chartInstance.current = null;
        }

        const chart = createChart(chartContainerRef.current, {
            layout: { background: { type: ColorType.Solid, color: 'transparent' }, textColor: '#64748b' },
            grid: { vertLines: { visible: false }, horzLines: { color: 'rgba(255, 255, 255, 0.03)' } },
            width: chartContainerRef.current.clientWidth,
            height: 320,
            timeScale: { borderColor: 'rgba(255, 255, 255, 0.05)' },
        });

        let series: ISeriesApi<"Candlestick"> | ISeriesApi<"Area">;
        if (chartType === 'CANDLE') {
            series = chart.addCandlestickSeries({ upColor: '#22c55e', downColor: '#ef4444' });
            series.setData(candleData.map(d => ({ time: d.time / 1000 as any, open: d.open, high: d.high, low: d.low, close: d.close })));
        } else {
            series = chart.addAreaSeries({ lineColor: '#00d9ff', topColor: 'rgba(0, 217, 255, 0.1)', bottomColor: 'rgba(0, 217, 255, 0)' });
            series.setData(candleData.map(d => ({ time: d.time / 1000 as any, value: d.close })));
        }
        mainSeriesRef.current = series;
        chart.timeScale().fitContent();
        chartInstance.current = chart;

        // Resize Observer
        const handleResize = () => {
            if (chartContainerRef.current && chartInstance.current) {
                chartInstance.current.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };

        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(chartContainerRef.current);
        window.addEventListener('resize', handleResize);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('resize', handleResize);
            if (chartInstance.current) {
                chartInstance.current.remove();
                chartInstance.current = null;
            }
        };
    }, [candleData, chartType, activeTab]);

    const handleAddAlert = () => {
        if (!alertPrice) return;
        triggerHaptic('success');
        addAlert({
            id: Date.now().toString(),
            asset: asset.ticker,
            targetPrice: parseFloat(alertPrice),
            condition: parseFloat(alertPrice) > asset.value ? 'ABOVE' : 'BELOW',
            active: true,
            createdAt: new Date().toISOString()
        });
        setAlertPrice('');
        showToast(`Watchdog armed at $${alertPrice}`);
    };

    const assetAlerts = alerts.filter(a => a.asset === asset.ticker);

    return (
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={onClose}></div>
            <div className="relative z-10 w-full md:w-[650px] h-[95vh] bg-brand-bg border-t md:border border-white/10 rounded-t-[3rem] md:rounded-[3rem] flex flex-col shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-white/5 bg-brand-card/95 flex justify-between items-center relative">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center p-3 shadow-inner">
                            <img src={`https://assets.coincap.io/assets/icons/${asset.ticker.toLowerCase()}@2x.png`} className="w-full h-full object-contain" onError={e => (e.currentTarget.src = `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/${asset.ticker.toLowerCase()}.png`)} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white font-orbitron uppercase tracking-widest">{asset.name}</h2>
                            <p className={`text-sm font-bold font-mono ${asset.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>${asset.value.toFixed(2)} ({asset.change.toFixed(2)}%)</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 rounded-full bg-white/5 text-slate-400 flex items-center justify-center">✕</button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="flex gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/10 mb-8 shadow-inner">
                        {['CHART', 'WATCHDOG', 'AI_SETUP'].map(t => (
                            <button key={t} onClick={() => setActiveTab(t as any)} className={`flex-1 py-3 rounded-xl text-[10px] font-black font-orbitron transition-all ${activeTab === t ? 'bg-brand-card text-brand-cyan shadow-lg' : 'text-slate-500'}`}>{t.replace('_', ' ')}</button>
                        ))}
                    </div>

                    {activeTab === 'CHART' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-black/30 rounded-[2.5rem] border border-white/5 p-2 min-h-[350px] relative overflow-hidden">
                                <div className="flex justify-between p-4 absolute top-0 left-0 w-full z-20 pointer-events-none">
                                    <div className="flex gap-2 pointer-events-auto">
                                        <button onClick={() => setChartType('CANDLE')} className={`p-2 rounded-lg border ${chartType === 'CANDLE' ? 'border-brand-cyan text-brand-cyan' : 'border-white/5 text-slate-500'}`}><BarChartIcon className="w-4 h-4" /></button>
                                        <button onClick={() => setChartType('LINE')} className={`p-2 rounded-lg border ${chartType === 'LINE' ? 'border-brand-cyan text-brand-cyan' : 'border-white/5 text-slate-500'}`}><ActivityIcon className="w-4 h-4" /></button>
                                    </div>
                                    <div className="flex bg-black/60 rounded-xl p-1 border border-white/5 pointer-events-auto">
                                        {TIMEFRAMES.map(tf => <button key={tf.label} onClick={() => setTimeframe(tf.days)} className={`text-[8px] font-black px-3 py-1.5 rounded-lg ${timeframe === tf.days ? 'bg-brand-cyan/20 text-brand-cyan' : 'text-slate-500'}`}>{tf.label}</button>)}
                                    </div>
                                </div>
                                <div ref={chartContainerRef} className="w-full max-w-full h-[320px] mt-10 overflow-hidden" />
                            </div>

                            {/* Stage 5 Quant Panel */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-brand-card/60 border border-white/10 rounded-2xl p-4">
                                    <p className="text-[8px] text-slate-500 font-black uppercase mb-1">Fractal_Dimension (FDI)</p>
                                    <p className={`text-lg font-black font-orbitron ${quant.fdi > 1.5 ? 'text-brand-cyan' : 'text-brand-purple'}`}>{quant.fdi.toFixed(3)}</p>
                                    <p className="text-[7px] text-slate-600 mt-1 uppercase">{quant.fdi > 1.5 ? 'Random_Noise' : 'Trending_Order'}</p>
                                </div>
                                <div className="bg-brand-card/60 border border-white/10 rounded-2xl p-4">
                                    <p className="text-[8px] text-slate-500 font-black uppercase mb-1">Market_Entropy</p>
                                    <p className="text-lg font-black font-orbitron text-white">{quant.entropy.toFixed(3)}</p>
                                    <p className="text-[7px] text-slate-600 mt-1 uppercase">Complexity_Level</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'WATCHDOG' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-brand-cyan/5 border border-brand-cyan/20 rounded-[2.5rem] p-6">
                                <h3 className="text-[10px] text-brand-cyan font-black uppercase mb-4 flex items-center gap-2"><BellIcon className="w-4 h-4" /> Deploy_Price_Sentinel</h3>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-xs">$</span>
                                        <input
                                            type="number"
                                            value={alertPrice}
                                            onChange={(e) => setAlertPrice(e.target.value)}
                                            placeholder="Enter target price..."
                                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-8 pr-4 text-white font-mono text-sm focus:border-brand-cyan outline-none"
                                        />
                                    </div>
                                    <button
                                        onClick={handleAddAlert}
                                        className="bg-brand-cyan text-black px-6 rounded-xl font-black text-xs uppercase active:scale-95 transition-transform"
                                    >
                                        Deploy
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-[9px] text-slate-500 font-black uppercase tracking-widest ml-2">Active_Watchdogs ({assetAlerts.length})</h4>
                                {assetAlerts.length === 0 ? (
                                    <div className="py-10 text-center border border-dashed border-white/10 rounded-3xl opacity-40">
                                        <ShieldIcon className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                                        <p className="text-[10px] font-mono uppercase">No active sentinels for {asset.ticker}</p>
                                    </div>
                                ) : (
                                    (Array.isArray(assetAlerts) ? assetAlerts : []).map(alert => (
                                        <div key={alert.id} className="bg-brand-card/40 border border-white/5 rounded-2xl p-4 flex justify-between items-center group">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-2 h-2 rounded-full ${alert.active ? 'bg-brand-green animate-pulse' : 'bg-slate-600'}`}></div>
                                                <div>
                                                    <p className="text-white font-bold font-mono text-sm">${alert.targetPrice.toLocaleString()}</p>
                                                    <p className="text-[8px] text-slate-500 font-black uppercase">Trigger: {alert.condition}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => removeAlert(alert.id)} className="w-8 h-8 rounded-lg bg-red-900/20 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'AI_SETUP' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-brand-purple/5 border border-brand-purple/20 rounded-[2.5rem] p-8 relative overflow-hidden">
                                <h4 className="text-[10px] text-brand-purple font-black uppercase mb-6 flex items-center gap-2"><BotIcon className="w-5 h-5" /> Live_Neural_Synthetics</h4>
                                {aiLoading ? <div className="text-xs text-slate-500 animate-pulse font-mono">📡 LINKING_TO_GLOBAL_SEARCH...</div> : (
                                    <div className="space-y-4">
                                        <p className="text-sm text-slate-200 font-mono leading-relaxed italic">"{aiReport}"</p>
                                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
                                            <GlobeIcon className="w-3 h-3 text-brand-cyan" />
                                            <span className="text-[8px] text-slate-500 font-black uppercase">Verified via Google Search Grounding</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <MonteCarloChart startPrice={asset.value} volatility={0.05} paths={[]} />
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-white/5 bg-brand-bg shrink-0">
                    <button onClick={() => triggerHaptic('heavy')} className="w-full py-6 bg-brand-green text-black font-black font-orbitron rounded-[1.8rem] shadow-2xl text-sm tracking-[0.25em] uppercase active:scale-95">
                        EXECUTE_NEURAL_ORDER
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssetDetailModal;