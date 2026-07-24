import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useStore } from '../store';
import { FlameIcon, SparklesIcon, ActivityIcon, BellIcon, ChevronRightIcon, ZapIcon } from './icons';
import { triggerHaptic } from '../utils/haptics';
import { getTranslation } from '../utils/translations';

interface LiquidationHeatmapModalProps {
    onClose: () => void;
}

export const LiquidationHeatmapModal: React.FC<LiquidationHeatmapModalProps> = ({ onClose }) => {
    const { settings, showToast, grantXp } = useStore();
    const t = (key: string) => getTranslation(settings.language, key);

    const [selectedAsset, setSelectedAsset] = useState<string>('BTC');

    const heatmapData = {
        BTC: {
            currentPrice: '$84,250',
            longShortRatio: '62% Long / 38% Short',
            cvdStatus: '+4,250 BTC (Bullish Order Flow)',
            magnetZones: [
                { price: '$85,400', intensity: 'EXTREME', totalPoolUsd: '$420M', side: 'Short Liquidation' },
                { price: '$82,100', intensity: 'TITAN', totalPoolUsd: '$680M', side: 'Long Liquidation' },
                { price: '$80,500', intensity: 'HIGH', totalPoolUsd: '$290M', side: 'Long Liquidation' },
            ]
        },
        TON: {
            currentPrice: '$7.35',
            longShortRatio: '71% Long / 29% Short',
            cvdStatus: '+850K TON (Institutional Accumulation)',
            magnetZones: [
                { price: '$7.85', intensity: 'TITAN', totalPoolUsd: '$18.5M', side: 'Short Liquidation' },
                { price: '$6.90', intensity: 'EXTREME', totalPoolUsd: '$24.2M', side: 'Long Liquidation' },
            ]
        },
        ETH: {
            currentPrice: '$3,480',
            longShortRatio: '54% Long / 46% Short',
            cvdStatus: '-1,200 ETH (Neutral Flow)',
            magnetZones: [
                { price: '$3,620', intensity: 'HIGH', totalPoolUsd: '$140M', side: 'Short Liquidation' },
                { price: '$3,320', intensity: 'TITAN', totalPoolUsd: '$210M', side: 'Long Liquidation' },
            ]
        },
        SOL: {
            currentPrice: '$188.50',
            longShortRatio: '68% Long / 32% Short',
            cvdStatus: '+45K SOL (Bullish Sweep)',
            magnetZones: [
                { price: '$198.00', intensity: 'TITAN', totalPoolUsd: '$65M', side: 'Short Liquidation' },
                { price: '$175.00', intensity: 'EXTREME', totalPoolUsd: '$88M', side: 'Long Liquidation' },
            ]
        }
    };

    const currentAssetData = heatmapData[selectedAsset as keyof typeof heatmapData] || heatmapData.BTC;

    const handleSetAlarm = (zonePrice: string) => {
        triggerHaptic('success');
        grantXp(25, 'Set Liquidation Sweep Alarm');
        showToast(`Liquidation Sweep Alarm Set for ${selectedAsset} at ${zonePrice}`);
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 overflow-y-auto"
        >
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md" onClick={onClose}></div>

            <div className="relative z-10 w-full max-w-xl bg-brand-bg border border-orange-500/40 rounded-[2.5rem] overflow-hidden shadow-[0_0_60px_rgba(249,115,22,0.25)] my-auto max-h-[92vh] flex flex-col">
                {/* Header */}
                <div className="p-6 bg-gradient-to-b from-orange-500/20 via-brand-card to-brand-bg border-b border-white/10 relative shrink-0">
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white"
                    >
                        ✕
                    </button>
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center mb-3 shadow-[0_0_25px_rgba(249,115,22,0.4)]">
                        <FlameIcon className="w-6 h-6 text-orange-500" />
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 text-[10px] font-orbitron font-black uppercase mb-2">
                        <SparklesIcon className="w-3 h-3" /> {t('heatmap.badge')}
                    </div>
                    <h2 className="font-orbitron font-black text-xl text-white">{t('heatmap.title')}</h2>
                    <p className="text-slate-400 text-xs font-space-mono">{t('heatmap.subtitle')}</p>
                </div>

                {/* Controls Bar */}
                <div className="p-4 bg-black/40 border-b border-white/10 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        {['BTC', 'TON', 'ETH', 'SOL'].map(asset => (
                            <button 
                                key={asset}
                                onClick={() => { triggerHaptic('selection'); setSelectedAsset(asset); }}
                                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${selectedAsset === asset ? 'bg-orange-500 text-black shadow-[0_0_15px_rgba(249,115,22,0.5)]' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                            >
                                {asset}
                            </button>
                        ))}
                    </div>
                    <div className="text-right">
                        <span className="text-[9px] font-mono text-slate-400 uppercase block">Mark Price</span>
                        <span className="text-xs font-orbitron font-bold text-white">{currentAssetData.currentPrice}</span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar flex-1">
                    {/* Order Flow Metric Cards */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-brand-card/80 border border-white/10 p-3.5 rounded-2xl">
                            <span className="text-[9px] font-mono text-slate-400 uppercase block mb-1">{t('heatmap.ratio_label')}</span>
                            <span className="text-xs font-orbitron font-black text-brand-green">{currentAssetData.longShortRatio}</span>
                        </div>
                        <div className="bg-brand-card/80 border border-white/10 p-3.5 rounded-2xl">
                            <span className="text-[9px] font-mono text-slate-400 uppercase block mb-1">CVD Order Delta</span>
                            <span className="text-xs font-orbitron font-black text-brand-cyan">{currentAssetData.cvdStatus}</span>
                        </div>
                    </div>

                    {/* Magnet Sweep Zones */}
                    <div>
                        <h4 className="text-xs font-orbitron font-bold text-slate-300 uppercase mb-3 flex items-center gap-2">
                            <ZapIcon className="w-4 h-4 text-orange-500" />
                            {t('heatmap.magnet_zones')}
                        </h4>
                        <div className="space-y-3">
                            {currentAssetData.magnetZones.map((zone, i) => (
                                <div key={i} className="bg-black/50 border border-orange-500/30 p-4 rounded-2xl flex items-center justify-between hover:border-orange-500 transition-all">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-orbitron font-black text-white">{zone.price}</span>
                                            <span className={`text-[8px] font-orbitron font-bold px-2 py-0.5 rounded ${zone.side.includes('Short') ? 'bg-brand-green/20 text-brand-green border border-brand-green/30' : 'bg-brand-danger/20 text-brand-danger border border-brand-danger/30'}`}>
                                                {zone.side}
                                            </span>
                                        </div>
                                        <p className="text-[10px] font-mono text-slate-400">Total Liquidation Cluster Pool: <span className="text-orange-400 font-bold">{zone.totalPoolUsd}</span></p>
                                    </div>
                                    <button 
                                        onClick={() => handleSetAlarm(zone.price)}
                                        className="px-3 py-1.5 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-400 text-[10px] font-orbitron font-bold hover:bg-orange-500/30 transition-all shrink-0 flex items-center gap-1"
                                    >
                                        ⚡ {t('heatmap.set_alarm')}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default LiquidationHeatmapModal;
