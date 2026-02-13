
import React, { useState, useEffect } from 'react';
import { SearchIcon, PlusIcon, TrendingUpIcon, ActivityIcon } from './icons';
import { useStore } from '../store';
import { getTranslation } from '../utils/translations';
import { triggerHaptic } from '../utils/haptics';
import { MASTER_ASSET_LIST } from '../services/priceService';

interface AddAssetModalProps {
    onClose: () => void;
    onAdd: (ticker: string, name: string, amount: number) => void;
    mode?: 'ADD' | 'TRADE';
    onTradeSelect?: (ticker: string) => void;
}

const AddAssetModal: React.FC<AddAssetModalProps> = ({ onClose, onAdd, mode = 'ADD', onTradeSelect }) => {
    const { settings } = useStore();
    const t = (key: string) => getTranslation(settings.language, key);
    
    const [search, setSearch] = useState('');
    const [selectedCoin, setSelectedCoin] = useState<{ticker: string, name: string, category?: string} | null>(null);
    const [amount, setAmount] = useState('');
    const [buyPrice, setBuyPrice] = useState('');

    // 🔒 Lock Body Scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    const filteredCoins = MASTER_ASSET_LIST.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) || 
        c.ticker.toLowerCase().includes(search.toLowerCase())
    );

    const trendingCoins = MASTER_ASSET_LIST.slice(0, 6);

    const handleSelect = (coin: any) => {
        triggerHaptic('light');
        if (mode === 'TRADE' && onTradeSelect) {
            onTradeSelect(coin.ticker);
            onClose();
        } else {
            setSelectedCoin(coin);
        }
    };

    const handleSubmit = () => {
        if (selectedCoin && amount) {
            triggerHaptic('success');
            onAdd(selectedCoin.ticker, selectedCoin.name, parseFloat(amount));
            onClose();
        } else {
            triggerHaptic('error');
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose}></div>
            
            {/* Bottom Sheet Container */}
            <div className="relative z-10 w-full sm:max-w-md bg-brand-bg rounded-t-3xl sm:rounded-2xl border-t sm:border border-brand-border shadow-[0_0_50px_rgba(0,229,255,0.2)] overflow-hidden flex flex-col max-h-[85vh] animate-slide-up-mobile sm:animate-zoom-in">
                
                {/* Drag Handle */}
                <div className="w-full flex justify-center pt-3 pb-1 sm:hidden bg-brand-card" onClick={onClose}>
                    <div className="w-12 h-1.5 bg-slate-600 rounded-full"></div>
                </div>

                {/* Header */}
                <div className="px-5 py-4 border-b border-brand-border bg-brand-card flex justify-between items-center shrink-0">
                    <h2 className="font-orbitron font-bold text-xl text-white">
                        {mode === 'TRADE' ? 'Select Pair' : t('add.title')}
                    </h2>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 flex items-center justify-center transition-colors">✕</button>
                </div>

                {/* Scrollable Content */}
                <div className="p-5 flex-1 overflow-y-auto custom-scrollbar flex flex-col bg-brand-bg overscroll-contain">
                    {!selectedCoin ? (
                        <>
                            <div className="relative mb-6 shrink-0">
                                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input 
                                    type="text" 
                                    placeholder={t('add.search')} 
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    autoFocus
                                    className="w-full bg-brand-bg border border-brand-border rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-brand-cyan transition-colors font-space-mono text-sm"
                                />
                            </div>
                            
                            {search === '' && (
                                <div className="mb-6 shrink-0">
                                    <div className="flex items-center gap-2 mb-3 px-1">
                                        <TrendingUpIcon className="w-4 h-4 text-brand-danger animate-pulse" />
                                        <span className="text-xs font-bold text-white uppercase tracking-wider">{t('add.trending')}</span>
                                    </div>
                                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                                        {trendingCoins.map(coin => (
                                            <button 
                                                key={`trend-${coin.ticker}`}
                                                onClick={() => handleSelect(coin)}
                                                className="min-w-[90px] bg-brand-card border border-white/5 rounded-2xl p-3 flex flex-col items-center gap-2 hover:border-brand-cyan/30 hover:bg-white/5 transition-all"
                                            >
                                                <img src={`https://assets.coincap.io/assets/icons/${coin.ticker.toLowerCase()}@2x.png`} alt={coin.ticker} className="w-8 h-8 rounded-full bg-white/5" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                                <span className="font-bold text-xs text-white">{coin.ticker}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <h3 className="text-xs font-bold text-slate-500 uppercase mb-2 px-1 shrink-0">{t('add.all')} ({filteredCoins.length})</h3>
                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 min-h-0">
                                {filteredCoins.map(coin => (
                                    <button key={coin.ticker} onClick={() => handleSelect(coin)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-brand-cyan/10 border border-transparent hover:border-brand-cyan/30 transition-all group">
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center p-1">
                                            <img src={`https://assets.coincap.io/assets/icons/${coin.ticker.toLowerCase()}@2x.png`} alt={coin.ticker} className="w-full h-full object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                        </div>
                                        <div className="text-left flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="text-white font-bold text-sm">{coin.name}</p>
                                                {coin.category && <span className="text-[8px] px-1.5 py-0.5 rounded bg-white/10 text-slate-400">{coin.category}</span>}
                                            </div>
                                            <p className="text-slate-500 text-xs font-space-mono">{coin.ticker}</p>
                                        </div>
                                        {mode === 'TRADE' ? <ActivityIcon className="w-5 h-5 text-brand-purple" /> : <PlusIcon className="w-5 h-5 text-slate-600 group-hover:text-brand-cyan" />}
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col h-full">
                            <div className="flex items-center gap-4 mb-6 p-4 bg-brand-card rounded-2xl border border-brand-border shrink-0">
                                <img src={`https://assets.coincap.io/assets/icons/${selectedCoin.ticker.toLowerCase()}@2x.png`} alt={selectedCoin.ticker} className="w-12 h-12 rounded-full bg-white/5" />
                                <div>
                                    <h3 className="text-xl font-bold text-white">{selectedCoin.name}</h3>
                                    <button onClick={() => setSelectedCoin(null)} className="text-xs text-brand-cyan hover:underline font-space-mono">Change</button>
                                </div>
                            </div>
                            <div className="mb-4 shrink-0">
                                <label className="block text-slate-400 text-xs font-space-mono uppercase mb-2">{t('add.amount')}</label>
                                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-brand-bg border border-brand-border rounded-xl py-4 px-4 text-2xl font-bold text-white placeholder-slate-700 focus:outline-none focus:border-brand-cyan transition-colors" />
                            </div>
                            <div className="mb-6 shrink-0">
                                <label className="block text-slate-400 text-xs font-space-mono uppercase mb-2 flex justify-between"><span>{t('add.buyPrice')}</span><span className="text-slate-600">{t('add.optional')}</span></label>
                                <input type="number" value={buyPrice} onChange={e => setBuyPrice(e.target.value)} placeholder="0.00 $" className="w-full bg-brand-bg border border-brand-border rounded-xl py-3 px-4 text-lg font-bold text-white placeholder-slate-700 focus:outline-none focus:border-brand-cyan transition-colors" />
                            </div>
                            
                            {/* Footer inside content area but pushed down */}
                            <div className="mt-auto shrink-0 safe-area-pb">
                                <button onClick={handleSubmit} disabled={!amount} className="w-full py-4 rounded-xl bg-brand-cyan text-black font-bold text-lg hover:bg-brand-cyan/90 disabled:opacity-50 shadow-[0_0_20px_rgba(0,229,255,0.3)]">{t('add.title')}</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddAssetModal;
