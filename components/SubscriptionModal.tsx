import React, { useEffect, useState } from 'react';
import { useStore } from '../store';
import { StorkIcon, TelegramIcon, LinkIcon, ActivityIcon, ShieldIcon, BotIcon } from './icons';
import { triggerHaptic } from '../utils/haptics';
import { getTranslation } from '../utils/translations';

interface SubscriptionModalProps {
    onClose: () => void;
}

type PaymentMethod = 'TON' | 'STRIPE' | 'CRYPTO' | 'STARS';

const StarIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
);

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ onClose }) => {
    const { settings, showToast, requestSubscriptionAction, userStats, upgradeUserTier } = useStore();
    const t = (key: string) => getTranslation(settings?.language || 'en', key);
    
    const [step, setStep] = useState<'SELECT' | 'PAY' | 'REDIRECT' | 'VERIFY'>('SELECT');
    const [selectedPlan, setSelectedPlan] = useState<'PRO' | 'WHALE' | null>(null);
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('STARS');
    const [txHash, setTxHash] = useState('');
    
    const adminWallet = settings?.adminTreasuryWallet || "NOT_SET";
    const plans = settings?.subscriptionPlans || [];

    const handleSelectPlan = (planId: 'PRO' | 'WHALE') => {
        triggerHaptic('medium');
        setSelectedPlan(planId);
        setStep('PAY');
    };

    // Stage 3: Native Telegram Stars Payment
    const handleStarsPayment = async () => {
        triggerHaptic('heavy');
        
        // @ts-ignore
        const tg = window.Telegram?.WebApp;
        if (!tg || !tg.openInvoice) {
            showToast('Telegram native payments unavailable');
            return;
        }

        setStep('REDIRECT');

        try {
            // В реальному застосунку ви отримуєте цей URL від вашого бота/бекенда
            // Тут ми симулюємо запит до бекенда
            await new Promise(r => setTimeout(r, 1000));
            
            // Наприклад: const invoiceUrl = await fetchInvoiceFromBot(selectedPlan);
            // Для демонстрації ми показуємо як викликати нативне вікно:
            // tg.openInvoice(invoiceUrl, (status) => { ... });

            // Оскільки ми в пісочниці, симулюємо успіх після "закриття" вікна
            setTimeout(() => {
                setStep('VERIFY');
                const mockHash = 'STARS_' + Math.random().toString(36).substring(7).toUpperCase();
                setTxHash(mockHash);
                
                // Автоматично активуємо Tier для демонстрації успіху
                if (selectedPlan) upgradeUserTier(selectedPlan);
                showToast('Telegram Stars Payment Success');
            }, 2000);

        } catch (e) {
            setStep('PAY');
            showToast('Payment initialization failed');
        }
    };

    const handleManualPaymentNotify = () => {
        if (!selectedPlan || !txHash) {
            showToast('Enter Transaction ID');
            triggerHaptic('error');
            return;
        }
        triggerHaptic('success');
        requestSubscriptionAction(userStats?.id || 'GUEST', selectedPlan, selectedMethod, txHash);
        setStep('VERIFY');
    };

    const getPriceInStars = (usdPrice: number) => {
        return Math.ceil(usdPrice / 0.02); // 1 Star ~ $0.02
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={onClose}></div>

            <div className="relative z-10 w-full sm:max-w-md bg-brand-bg rounded-t-[2.5rem] sm:rounded-[2.5rem] border-t sm:border border-white/10 shadow-[0_-10px_60px_rgba(139,92,246,0.3)] flex flex-col max-h-[90vh] overflow-hidden">
                
                <div className="shrink-0 px-6 py-5 text-center border-b border-white/5 relative bg-brand-card/50">
                    <button onClick={onClose} className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/5 text-slate-400 flex items-center justify-center btn-interactive hover:bg-white/10 transition-colors">✕</button>
                    <div className="flex items-center justify-center gap-3 mb-1">
                        <div className="w-10 h-10 bg-brand-purple/20 rounded-xl flex items-center justify-center border border-brand-purple/30">
                            <StorkIcon className="w-6 h-6 text-brand-purple" />
                        </div>
                        <h2 className="text-xl font-black text-white font-orbitron uppercase tracking-widest">{t('sub.title')}</h2>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar overscroll-contain pb-12">
                    
                    {step === 'SELECT' && (
                        <div className="space-y-4">
                            {plans.map((p) => (
                                <div key={p.id} className={`border ${p.id === 'WHALE' ? 'border-brand-purple/40 bg-brand-purple/5' : 'border-brand-cyan/40 bg-brand-cyan/5'} rounded-3xl p-6 relative active:scale-[0.98] transition-transform group overflow-hidden`}>
                                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_3s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"></div>
                                    
                                    <div className="flex justify-between items-start mb-4 relative z-10">
                                        <div>
                                            <h3 className={`font-black text-white text-lg font-orbitron uppercase ${p.id === 'WHALE' ? 'text-brand-purple' : ''}`}>{p.name}</h3>
                                            <p className="text-[10px] text-slate-500 font-mono uppercase">Full Neural Access</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-1 justify-end">
                                                <StarIcon className="w-4 h-4 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
                                                <p className="text-xl font-black text-white font-orbitron tracking-tighter">{getPriceInStars(p.price)}</p>
                                            </div>
                                            <span className="text-[8px] text-slate-500 font-mono uppercase">(${p.price}) / MONTH</span>
                                        </div>
                                    </div>
                                    <ul className="space-y-2 mb-6 relative z-10">
                                        {(p.features || []).map((feat: string, i: number) => (
                                            <li key={i} className="text-xs text-slate-300 flex items-center gap-3"><div className={`w-1.5 h-1.5 rounded-full ${p.id === 'WHALE' ? 'bg-brand-purple' : 'bg-brand-cyan'}`}></div>{feat}</li>
                                        ))}
                                    </ul>
                                    <button onClick={() => handleSelectPlan(p.id as any)} className={`relative z-10 w-full py-4 font-black font-orbitron text-[10px] rounded-2xl transition-all uppercase tracking-[0.2em] shadow-lg btn-interactive ${p.id === 'WHALE' ? 'bg-brand-purple text-white hover:shadow-[0_0_20px_#8b5cf6]' : 'bg-brand-cyan text-black hover:shadow-[0_0_20px_#00d9ff]'}`}>
                                        Initialize {p.name}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {step === 'PAY' && (
                        <div className="space-y-5 animate-fade-in">
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={() => setSelectedMethod('STARS')} className={`p-4 rounded-2xl border flex flex-col items-center gap-2 btn-interactive ${selectedMethod === 'STARS' ? 'bg-yellow-500/20 border-yellow-500' : 'bg-white/5 border-transparent opacity-60'}`}>
                                    <StarIcon className="w-8 h-8 text-yellow-400" />
                                    <span className="font-black text-[10px] text-white uppercase">Telegram Stars</span>
                                </button>
                                <button onClick={() => setSelectedMethod('TON')} className={`p-4 rounded-2xl border flex flex-col items-center gap-2 btn-interactive ${selectedMethod === 'TON' ? 'bg-brand-cyan/20 border-brand-cyan' : 'bg-white/5 border-transparent opacity-60'}`}>
                                    <TelegramIcon className="w-8 h-8 text-brand-cyan" />
                                    <span className="font-black text-[10px] text-white uppercase">TON Wallet</span>
                                </button>
                            </div>

                            {selectedMethod === 'STARS' ? (
                                <div className="bg-black/60 rounded-3xl p-6 border border-white/5 text-center">
                                    <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-500/30">
                                        <StarIcon className="w-8 h-8 text-yellow-400" />
                                    </div>
                                    <p className="text-4xl font-black text-white font-orbitron mb-6">
                                        {getPriceInStars(plans.find(p => p.id === selectedPlan)?.price || 0)}
                                    </p>
                                    <button onClick={handleStarsPayment} className="w-full py-4 bg-[#0088cc] text-white font-black rounded-2xl uppercase text-xs tracking-widest shadow-lg btn-interactive">
                                        Pay with Stars
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-black/60 rounded-3xl p-6 border border-white/5">
                                    <p className="text-[10px] text-slate-500 uppercase font-black mb-3">Deposit Wallet (TON)</p>
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 mb-4 break-all cursor-copy" onClick={() => { navigator.clipboard.writeText(adminWallet); showToast('Copied'); }}>
                                        <p className="text-xs font-mono text-brand-cyan">{adminWallet}</p>
                                    </div>
                                    <input type="text" value={txHash} onChange={(e) => setTxHash(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs font-mono mb-4" placeholder="Transaction Hash..." />
                                    <button onClick={handleManualPaymentNotify} className="w-full py-4 bg-brand-green text-black font-black rounded-2xl uppercase text-xs btn-interactive">Verify Hash</button>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 'REDIRECT' && (
                        <div className="py-20 text-center animate-pulse">
                            <div className="w-20 h-20 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                            <h3 className="text-white font-black font-orbitron uppercase tracking-widest">Awaiting Native UI...</h3>
                        </div>
                    )}

                    {step === 'VERIFY' && (
                        <div className="py-16 text-center animate-zoom-in">
                            <div className="w-20 h-20 bg-brand-green/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-brand-green shadow-[0_0_30px_rgba(34,197,94,0.4)]">
                                <ShieldIcon className="w-10 h-10 text-brand-green" />
                            </div>
                            <h3 className="text-xl font-black text-white font-orbitron uppercase">LINK_ESTABLISHED</h3>
                            <p className="text-slate-500 text-xs mt-2 font-mono uppercase">{txHash}</p>
                            <button onClick={onClose} className="mt-8 px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase text-white btn-interactive">Back to Terminal</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubscriptionModal;