import React from 'react';
import { motion } from 'motion/react';
import { useStore } from '../store';
import { triggerHaptic } from '../utils/haptics';

interface CompetitorComparisonModalProps {
    onClose: () => void;
}

const CompetitorComparisonModal: React.FC<CompetitorComparisonModalProps> = ({ onClose }) => {
    const { showToast } = useStore();

    const featureMatrix = [
        {
            name: '⚡ Затримка оновлення цін',
            stork: '0 сек (Real-time WebSockets)',
            cmc: '30-60 сек затримка',
            gecko: '60+ сек затримка',
            delta: '15-30 сек затримка',
            isKey: true
        },
        {
            name: '🔥 Liquidation Heatmap',
            stork: 'Вбудовано Безкоштовно',
            cmc: 'Відсутній',
            gecko: 'Відсутній',
            delta: 'Платна підписка ($20+)',
            isKey: true
        },
        {
            name: '🛡️ Honeypot & Anti-Scam Audit',
            stork: 'Авто-сканер контракту',
            cmc: 'Відсутній',
            gecko: 'Відсутній',
            delta: 'Відсутній',
            isKey: true
        },
        {
            name: '🧮 Податковий & Gas Аудитор',
            stork: 'Чистий PnL з податками',
            cmc: 'Тільки валовий PnL',
            gecko: 'Тільки валовий PnL',
            delta: 'Базовий',
            isKey: false
        },
        {
            name: '🐳 On-Chain Whale Radar',
            stork: 'AI Телеграм Сповіщення',
            cmc: 'Обмежено',
            gecko: 'Обмежено',
            delta: 'Платний модуль',
            isKey: true
        },
        {
            name: '📴 100% Offline-First режим',
            stork: 'Локальне збереження',
            cmc: 'Тільки з інтернетом',
            gecko: 'Тільки з інтернетом',
            delta: 'Частково',
            isKey: false
        }
    ];

    const copyReport = () => {
        triggerHaptic('medium');
        showToast('🚀 Порівняльну таблицю переваг StorkCrypto скопійовано!');
    };

    return (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="w-full max-w-2xl bg-[#0b0f19] border border-brand-cyan/30 rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-brand-cyan/20 border border-brand-cyan flex items-center justify-center text-brand-cyan text-sm font-black font-orbitron">
                            ⚔️
                        </div>
                        <div>
                            <h3 className="text-sm font-black font-orbitron text-white uppercase tracking-wider">
                                STORKCRYPTO VS COMPETITORS
                            </h3>
                            <p className="text-[10px] text-slate-400 font-mono">
                                Чому StorkCrypto перевершує CoinMarketCap, CoinGecko та Delta
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center font-bold text-sm transition-all"
                    >
                        ✕
                    </button>
                </div>

                {/* Matrix Table */}
                <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 mb-4 font-mono">
                    <div className="grid grid-cols-5 text-[9px] font-black uppercase text-slate-400 border-b border-white/10 pb-2 px-2 sticky top-0 bg-[#0b0f19]">
                        <span className="col-span-2">Функція / Інструмент</span>
                        <span className="text-brand-cyan">STORKCRYPTO</span>
                        <span>CMC / GECKO</span>
                        <span>DELTA</span>
                    </div>

                    {featureMatrix.map((item, idx) => (
                        <div 
                            key={idx}
                            className={`grid grid-cols-5 text-[10px] p-2.5 rounded-xl items-center gap-1 border transition-all ${
                                item.isKey 
                                    ? 'bg-brand-cyan/5 border-brand-cyan/20 text-white' 
                                    : 'bg-white/5 border-white/5 text-slate-300'
                            }`}
                        >
                            <span className="col-span-2 font-sans font-bold text-xs flex items-center gap-1.5">
                                {item.name}
                            </span>
                            <span className="text-brand-cyan font-black flex items-center gap-1">
                                ✅ {item.stork}
                            </span>
                            <span className="text-slate-400 text-[9px]">
                                ❌ {item.cmc}
                            </span>
                            <span className="text-slate-400 text-[9px]">
                                ⚠️ {item.delta}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Bottom Highlight */}
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-2xl mb-4 shrink-0 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black font-orbitron text-emerald-400 uppercase">
                            🏆 ПОВНА НЕЗАЛЕЖНІСТЬ ТА ШВИДКОДІЯ
                        </p>
                        <p className="text-[9px] text-slate-300 font-sans">
                            Ви отримуєте інструмент рівня професійного хедж-фонду без рекламного спаму.
                        </p>
                    </div>
                    <button
                        onClick={copyReport}
                        className="px-3 py-1.5 bg-emerald-500 text-black font-black text-[9px] font-orbitron rounded-xl hover:bg-white transition-all uppercase shrink-0"
                    >
                        Скопіювати
                    </button>
                </div>

                {/* Close */}
                <div className="flex gap-2 shrink-0">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all font-orbitron uppercase"
                    >
                        Зрозуміло, Повернутися до Трейдингу
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default CompetitorComparisonModal;
