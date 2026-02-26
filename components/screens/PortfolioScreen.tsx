
import React, { useState, useEffect, useMemo } from 'react';
import { PlusIcon, ActivityIcon, ShieldIcon, PieChartIcon, ChevronRightIcon, RadarIcon } from '../icons';
import { Asset } from '../../types';
import AddAssetModal from '../AddAssetModal';
import { useStore } from '../../store';
import NumberTicker from '../NumberTicker';
import { binanceWS } from '../../services/websocketService';
import { triggerHaptic } from '../../utils/haptics';
import { TacticalBackground } from '../TacticalBackground';
import { PortfolioTools } from '../PortfolioTools';
import UpgradeBanner from '../UpgradeBanner';
import Skeleton from '../Skeleton';

import { PortfolioDistributionChart } from '../PortfolioDistributionChart';

// OPTIMIZATION: Memoized component to prevent re-renders on parent state changes
const AssetEntry = React.memo(({ asset, totalPortfolioValue }: { asset: Asset, totalPortfolioValue: number }) => {
    const allocation = totalPortfolioValue > 0 ? (asset.value / totalPortfolioValue) * 100 : 0;
    
    return (
        <div className="relative overflow-hidden rounded-2xl bg-[#0f172a]/60 border border-white/5 mb-2 group hover:border-brand-cyan/30 transition-all active:scale-[0.99]">
            <div className="flex items-center justify-between p-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center p-1.5">
                        <img 
                            src={asset.icon?.startsWith('http') ? asset.icon : `https://assets.coincap.io/assets/icons/${asset.ticker.toLowerCase()}@2x.png`} 
                            className="w-full h-full object-contain rounded-full" 
                            onError={(e) => { e.currentTarget.src = `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/${asset.ticker.toLowerCase()}.png`; }}
                        />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-white font-bold text-sm font-orbitron tracking-wide">{asset.ticker}</h3>
                            {allocation > 20 && <span className="text-[7px] font-black bg-white/10 text-slate-300 px-1 rounded">MAJOR</span>}
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">{asset.amount.toLocaleString()} units</p>
                    </div>
                </div>
                
                <div className="text-right">
                    <p className="text-white font-bold font-mono text-sm">${asset.value.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                    <span className={`text-[9px] font-bold ${asset.change >= 0 ? 'text-brand-green' : 'text-brand-danger'}`}>
                        {asset.change > 0 ? '+' : ''}{Math.abs(asset.change).toFixed(2)}%
                    </span>
                </div>
            </div>
            
            {/* Allocation Line */}
            <div className="absolute bottom-0 left-0 h-[2px] bg-brand-cyan/50" style={{ width: `${allocation}%` }}></div>
        </div>
    );
});

const PortfolioScreen: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
    const { assets, updateAssetPrice, wallet, addAsset, syncChainAssets } = useStore();
    const [balanceType, setBalanceType] = useState<'NEURAL' | 'MAINNET'>('NEURAL');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    const isSyncing = wallet.isSyncing && balanceType === 'MAINNET';

    useEffect(() => {
        const unsubscribe = binanceWS.subscribe((data) => {
            assets.forEach(asset => {
                // Don't overwrite prices if we have real data from TON API (optional logic, but typically WS is fresher)
                const liveData = data[asset.ticker];
                if (liveData) updateAssetPrice(asset.ticker, liveData.price, liveData.change);
            });
        });
        return () => { unsubscribe(); };
    }, [assets]);

    const totalValue = useMemo(() => {
        // If Mainnet, recalculate based on current prices * amounts in store
        // (The wallet.totalValueUsd might be stale)
        if (balanceType === 'MAINNET') {
             return assets.reduce((sum, a) => sum + a.value, 0);
        }
        // Neural (Demo) Balance
        return assets.reduce((sum, a) => sum + a.value, 0);
    }, [assets, balanceType, wallet]);

    const handleRefresh = async () => {
        if (balanceType === 'MAINNET' && wallet.isConnected) {
            triggerHaptic('medium');
            setIsRefreshing(true);
            await syncChainAssets();
            setIsRefreshing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] bg-brand-bg flex flex-col overflow-hidden animate-fade-in">
            <TacticalBackground />
            
            <div className="safe-area-pt bg-brand-card/90 backdrop-blur-2xl border-b border-white/10 px-6 py-5 flex items-center justify-between shrink-0 relative z-20">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => { triggerHaptic('light'); onClose?.(); }}
                        className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 active:scale-90 transition-all shadow-lg"
                    >
                        <ChevronRightIcon className="w-6 h-6 rotate-180" />
                    </button>
                    <div>
                        <h1 className="font-orbitron text-lg font-black text-white tracking-widest uppercase italic">Vault_V8</h1>
                        <p className="text-[8px] text-brand-cyan font-mono animate-pulse uppercase">SECURE_STORAGE</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {balanceType === 'MAINNET' && (
                        <button onClick={handleRefresh} className={`w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-cyan shadow-lg ${isRefreshing ? 'animate-spin' : ''}`}>
                            <RadarIcon className="w-4 h-4" />
                        </button>
                    )}
                    <button onClick={() => { triggerHaptic('medium'); setIsAddModalOpen(true); }} className="w-8 h-8 rounded-xl bg-brand-cyan/20 border border-brand-cyan/40 flex items-center justify-center text-brand-cyan shadow-lg">
                        <PlusIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 relative z-10 pt-6 pb-32">
                <UpgradeBanner />
                
                <div className="flex p-1 bg-black/40 rounded-xl border border-white/5 mb-6 shadow-inner mx-2">
                    <button onClick={() => setBalanceType('NEURAL')} className={`flex-1 py-2 rounded-lg text-[9px] font-black font-orbitron transition-all uppercase tracking-widest ${balanceType === 'NEURAL' ? 'bg-brand-cyan text-black shadow-lg' : 'text-slate-500'}`}>Neural (Demo)</button>
                    <button onClick={() => setBalanceType('MAINNET')} className={`flex-1 py-2 rounded-lg text-[9px] font-black font-orbitron transition-all uppercase tracking-widest ${balanceType === 'MAINNET' ? 'bg-brand-green text-black shadow-lg' : 'text-slate-500'}`}>Mainnet (TON)</button>
                </div>

                <div className="relative mb-8 text-center bg-gradient-to-b from-brand-card/60 to-black/60 border border-white/10 rounded-[2rem] p-8 shadow-2xl overflow-hidden group mx-2">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-cyan/5 blur-3xl rounded-full pointer-events-none"></div>
                    
                    <div className="flex flex-col items-center">
                        <PortfolioDistributionChart assets={assets} />
                        
                        <div className="mt-4">
                            <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] font-orbitron mb-2 flex items-center justify-center gap-2">
                                <PieChartIcon className="w-3 h-3 text-brand-cyan" /> NET_WORTH
                            </p>
                            <div className="text-white font-black text-4xl tracking-tighter font-orbitron drop-shadow-md">
                                {isSyncing ? (
                                    <Skeleton className="w-32 h-10 mx-auto rounded-lg" />
                                ) : (
                                    <NumberTicker value={totalValue} prefix="$" fractionDigits={2} />
                                )}
                            </div>
                        </div>
                    </div>
                    {balanceType === 'MAINNET' && !wallet.isConnected && (
                        <p className="text-[10px] text-red-400 mt-2 font-mono bg-red-900/20 inline-block px-2 py-1 rounded">WALLET DISCONNECTED</p>
                    )}
                </div>

                {/* Active Positions Section */}
                {balanceType === 'NEURAL' && useStore.getState().positions.length > 0 && (
                    <div className="px-2 mb-8">
                        <h3 className="text-[10px] font-black text-brand-cyan uppercase tracking-widest mb-3 ml-1 flex items-center gap-2">
                            <ActivityIcon className="w-3 h-3" /> ACTIVE_POSITIONS
                        </h3>
                        <div className="space-y-2">
                            {useStore.getState().positions.map(pos => (
                                <div key={pos.id} className="bg-brand-card/40 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-black text-white font-orbitron">{pos.ticker}</span>
                                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${pos.side === 'LONG' ? 'bg-brand-green/20 text-brand-green' : 'bg-brand-danger/20 text-brand-danger'}`}>{pos.side} {pos.leverage}x</span>
                                        </div>
                                        <p className="text-[9px] text-slate-500 font-mono mt-1">Entry: ${pos.entryPrice.toFixed(2)}</p>
                                    </div>
                                    <div className="text-right flex items-center gap-4">
                                        <div>
                                            <p className={`text-xs font-black font-mono ${pos.pnl >= 0 ? 'text-brand-green' : 'text-brand-danger'}`}>
                                                {pos.pnl >= 0 ? '+' : ''}${pos.pnl.toFixed(2)}
                                            </p>
                                            <p className="text-[8px] text-slate-500 font-mono">ROI: {pos.roi.toFixed(2)}%</p>
                                        </div>
                                        <div className="flex gap-1">
                                            <button 
                                                onClick={() => {
                                                    triggerHaptic('medium');
                                                    const text = `Check out my ${pos.side} trade on ${pos.ticker} with ${pos.roi.toFixed(2)}% ROI on StorkCrypto! 🚀\nJoin the project: @storkcrypto`;
                                                    const url = `https://t.me/share/url?url=${encodeURIComponent('https://t.me/storkcrypto')}&text=${encodeURIComponent(text)}`;
                                                    window.open(url, '_blank');
                                                }}
                                                className="bg-[#0088cc]/20 text-[#0088cc] hover:bg-[#0088cc]/40 border border-[#0088cc]/30 text-[9px] font-black px-3 py-2 rounded-xl transition-all"
                                            >
                                                SHARE
                                            </button>
                                            <button 
                                                onClick={() => { triggerHaptic('medium'); useStore.getState().closePosition(pos.id, pos.currentPrice); }}
                                                className="bg-white/5 hover:bg-white/10 border border-white/10 text-[9px] font-black px-3 py-2 rounded-xl transition-all"
                                            >
                                                CLOSE
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <PortfolioTools />

                <div className="px-2">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">ASSET_ALLOCATION</h3>
                    <div className="space-y-1">
                        {isSyncing ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="h-16 rounded-2xl bg-white/5 animate-pulse border border-white/5"></div>
                            ))
                        ) : assets.length === 0 ? (
                            <div className="py-12 text-center border border-dashed border-white/10 rounded-2xl bg-white/5 opacity-50 flex flex-col items-center">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-3">
                                    <PieChartIcon className="w-8 h-8 text-slate-600" />
                                </div>
                                <p className="text-[10px] font-black font-orbitron uppercase tracking-widest text-slate-500">Vault_Empty</p>
                                <p className="text-[9px] font-mono text-slate-600 mt-1">Add assets or connect wallet</p>
                            </div>
                        ) : (
                            assets.map((asset) => <AssetEntry key={asset.ticker} asset={asset} totalPortfolioValue={totalValue} />)
                        )}
                    </div>
                </div>
            </div>

            {isAddModalOpen && <AddAssetModal onClose={() => setIsAddModalOpen(false)} onAdd={(t, n, a) => addAsset({ name: n, ticker: t, icon: t.toLowerCase(), amount: a, value: 0, change: 0 })} />}
        </div>
    );
};

export default PortfolioScreen;
