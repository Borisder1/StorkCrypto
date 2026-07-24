import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useStore } from '../store';
import { triggerHaptic } from '../utils/haptics';

interface TaxCalculatorModalProps {
    onClose: () => void;
}

const TaxCalculatorModal: React.FC<TaxCalculatorModalProps> = ({ onClose }) => {
    const { showToast } = useStore();

    const [ticker, setTicker] = useState('BTC');
    const [buyPrice, setBuyPrice] = useState(65000);
    const [sellPrice, setSellPrice] = useState(72000);
    const [amount, setAmount] = useState(0.5);
    const [cexFeePercent, setCexFeePercent] = useState(0.1); // 0.1% CEX fee
    const [networkGasUsd, setNetworkGasUsd] = useState(15); // $15 gas
    const [taxRatePercent, setTaxRatePercent] = useState(18); // 18% Capital Gains Tax

    // Calculations
    const grossCost = buyPrice * amount;
    const grossRevenue = sellPrice * amount;
    const grossProfit = grossRevenue - grossCost;

    const totalCexFee = (grossCost + grossRevenue) * (cexFeePercent / 100);
    const totalGasFee = networkGasUsd * 2; // Buy + Sell tx
    const totalExpenses = totalCexFee + totalGasFee;

    const profitBeforeTax = grossProfit - totalExpenses;
    const estimatedTax = profitBeforeTax > 0 ? profitBeforeTax * (taxRatePercent / 100) : 0;
    const netProfit = profitBeforeTax - estimatedTax;

    const netRoi = grossCost > 0 ? (netProfit / grossCost) * 100 : 0;
    const breakEvenPrice = amount > 0 ? (grossCost + totalExpenses) / amount : 0;

    const handleExportAudit = () => {
        triggerHaptic('medium');
        const reportText = `[STORK_CRYPTO_NET_PROFIT_AUDIT]
Asset: ${ticker}
Buy Price: $${buyPrice.toLocaleString()} | Sell Price: $${sellPrice.toLocaleString()}
Amount: ${amount}
Gross Profit: $${grossProfit.toFixed(2)}
Total Fees (CEX + Gas): $${totalExpenses.toFixed(2)}
Est. Capital Tax (${taxRatePercent}%): $${estimatedTax.toFixed(2)}
----------------------------------
NET PROFIT AFTER ALL TAXES & FEES: $${netProfit.toFixed(2)}
NET ROI: ${netRoi.toFixed(2)}%
REAL BREAK-EVEN PRICE: $${breakEvenPrice.toFixed(2)}
Generated via StorkCrypto Neural Engine`;

        navigator.clipboard.writeText(reportText);
        showToast('📋 Повний фінансовий аудит скопійовано в буфер!');
    };

    return (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="w-full max-w-xl bg-[#0b0f19] border border-brand-cyan/30 rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden relative"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-brand-cyan/20 border border-brand-cyan flex items-center justify-center text-brand-cyan text-sm font-black font-orbitron">
                            🧮
                        </div>
                        <div>
                            <h3 className="text-sm font-black font-orbitron text-white uppercase tracking-wider">
                                NET PROFIT & TAX AUDITOR
                            </h3>
                            <p className="text-[10px] text-slate-400 font-mono">
                                Розрахунок чистого прибутку з урахуванням Gas, комісій бірж та податків
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

                {/* Form Controls */}
                <div className="grid grid-cols-2 gap-3 mb-5 text-xs font-mono">
                    <div>
                        <label className="text-[10px] text-slate-400 font-sans block mb-1">Тикер криптоактиву</label>
                        <input
                            type="text"
                            value={ticker}
                            onChange={(e) => setTicker(e.target.value.toUpperCase())}
                            className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-brand-cyan font-bold uppercase"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-400 font-sans block mb-1">Кількість (Amount)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                            className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-brand-cyan font-bold"
                        />
                    </div>

                    <div>
                        <label className="text-[10px] text-slate-400 font-sans block mb-1">Ціна купівлі ($)</label>
                        <input
                            type="number"
                            value={buyPrice}
                            onChange={(e) => setBuyPrice(parseFloat(e.target.value) || 0)}
                            className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-brand-cyan font-bold"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-400 font-sans block mb-1">Ціна продажу ($)</label>
                        <input
                            type="number"
                            value={sellPrice}
                            onChange={(e) => setSellPrice(parseFloat(e.target.value) || 0)}
                            className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-brand-cyan font-bold"
                        />
                    </div>

                    <div>
                        <label className="text-[10px] text-slate-400 font-sans block mb-1">Комісія біржі (%)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={cexFeePercent}
                            onChange={(e) => setCexFeePercent(parseFloat(e.target.value) || 0)}
                            className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-brand-cyan font-bold"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-400 font-sans block mb-1">Gas / Мережевий збір ($)</label>
                        <input
                            type="number"
                            value={networkGasUsd}
                            onChange={(e) => setNetworkGasUsd(parseFloat(e.target.value) || 0)}
                            className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-brand-cyan font-bold"
                        />
                    </div>
                </div>

                {/* Tax Rate Slider */}
                <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl mb-5">
                    <div className="flex justify-between items-center text-xs font-mono mb-1">
                        <span className="text-slate-300 font-sans">Ставка податку на прибуток:</span>
                        <span className="text-brand-cyan font-black">{taxRatePercent}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="35"
                        value={taxRatePercent}
                        onChange={(e) => setTaxRatePercent(parseInt(e.target.value))}
                        className="w-full accent-brand-cyan cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
                        <span>0% (Безподаткова зона)</span>
                        <span>18% (ПДФО UA / Стандарт)</span>
                        <span>35% (Максимальна)</span>
                    </div>
                </div>

                {/* Audit Result Display */}
                <div className="bg-black/80 border border-brand-cyan/30 rounded-2xl p-4 space-y-2.5 font-mono mb-5">
                    <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Валовий прибуток (Gross PnL):</span>
                        <span className={grossProfit >= 0 ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                            ${grossProfit.toFixed(2)}
                        </span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Загальні комісії (Fees & Gas):</span>
                        <span className="text-amber-400 font-bold">-${totalExpenses.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Оціночний податок ({taxRatePercent}%):</span>
                        <span className="text-red-400 font-bold">-${estimatedTax.toFixed(2)}</span>
                    </div>

                    <div className="border-t border-white/10 pt-2.5 flex justify-between items-center">
                        <div>
                            <p className="text-[10px] text-slate-400 font-sans uppercase font-bold">Чистий прибуток (Net PnL)</p>
                            <p className="text-[9px] text-slate-500">Після всіх витрат та податків</p>
                        </div>
                        <div className="text-right">
                            <p className={`text-base font-black font-orbitron ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                ${netProfit.toFixed(2)}
                            </p>
                            <p className={`text-[10px] font-bold ${netRoi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                ROI: {netRoi >= 0 ? '+' : ''}{netRoi.toFixed(2)}%
                            </p>
                        </div>
                    </div>

                    <div className="bg-brand-cyan/10 border border-brand-cyan/20 p-2.5 rounded-xl flex justify-between items-center text-[10px] text-brand-cyan font-bold">
                        <span>🎯 Реальна точка беззбитковості (Breakeven):</span>
                        <span className="font-orbitron font-black text-xs">${breakEvenPrice.toFixed(2)}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <button
                        onClick={handleExportAudit}
                        className="flex-1 py-3 bg-brand-cyan text-black font-black text-xs font-orbitron rounded-xl hover:bg-white transition-all uppercase shadow-lg shadow-brand-cyan/20 active:scale-95"
                    >
                        📋 Скопіювати Аудит-Звіт
                    </button>
                    <button
                        onClick={onClose}
                        className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all"
                    >
                        Закрити
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default TaxCalculatorModal;
