import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { useStore } from '../store';
import { StorkIcon, ShieldIcon } from './icons';
import { triggerHaptic } from '../utils/haptics';
import { getTranslation } from '../utils/translations';
import { safeOpenTelegramInvoice } from '../utils/telegram';
import { useScrollLock } from '../utils/useScrollLock';

interface SubscriptionModalProps {
    onClose: () => void;
}

export type PaymentStatus = 
    | 'BASIC'
    | 'Invoice preparing...'
    | 'Waiting for Telegram payment...'
    | 'Payment verification...'
    | 'PRO active'
    | 'Payment canceled'
    | 'Payment failed'
    | 'Payment pending';

const StarIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
);

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ onClose }) => {
    const { settings, showToast, userStats, upgradeUserTier } = useStore();
    const t = (key: string) => getTranslation(settings?.language || 'en', key);
    
    useScrollLock(true);

    const isCurrentPro = userStats?.subscriptionTier === 'PRO' || userStats?.subscriptionTier === 'WHALE';
    const [selectedPlan, setSelectedPlan] = useState<'PRO' | 'WHALE'>('PRO');
    const [status, setStatus] = useState<PaymentStatus>(isCurrentPro ? 'PRO active' : 'BASIC');
    const [orderId, setOrderId] = useState<string>('');
    const [chargeId, setChargeId] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string>('');
    const [invoiceLink, setInvoiceLink] = useState<string>('');

    const isMountedRef = useRef(true);
    const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const timeoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const plans = settings?.subscriptionPlans || [
        { id: 'PRO', name: 'PRO Neural Tier', price: 5, features: ['Live Neural Signals', 'Priority AI Processing', 'Whale Radar Pro'] },
        { id: 'WHALE', name: 'WHALE Tier', price: 10, features: ['Unlimited AI Copilot', 'Sub-second Order Blocks', 'Alpha VIP Group'] }
    ];

    const getStarsAmount = (plan: 'PRO' | 'WHALE') => (plan === 'PRO' ? 250 : 500);

    const clearTimers = () => {
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
        }
        if (timeoutTimerRef.current) {
            clearTimeout(timeoutTimerRef.current);
            timeoutTimerRef.current = null;
        }
    };

    useEffect(() => {
        isMountedRef.current = true;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            isMountedRef.current = false;
            clearTimers();
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    // Backend order status check: strictly server-authoritative
    const checkBackendStatus = async (targetOrderId: string, silent: boolean = false) => {
        if (!targetOrderId) return;
        try {
            const tgInitData = window.Telegram?.WebApp?.initData || '';
            const res = await fetch(`/api/subscription/status?orderId=${encodeURIComponent(targetOrderId)}`, {
                headers: {
                    'Authorization': `tma ${tgInitData}`
                }
            });
            if (!res.ok) throw new Error('Status fetch failed');
            const data = await res.json();

            if (!isMountedRef.current) return;

            if (data?.order?.status === 'PAID' || data?.isPro === true || data?.status === 'active') {
                clearTimers();
                setStatus('PRO active');
                setChargeId(data.order?.telegramPaymentChargeId || 'VERIFIED_ON_SERVER');
                setIsProcessing(false);
                // Activate on frontend strictly after backend verification
                upgradeUserTier(data.order?.planId || selectedPlan, 30);
                triggerHaptic('success');
                showToast('Оплату успішно підтверджено сервером! Доступ активовано.');
            } else if (data?.order?.status === 'CANCELLED') {
                clearTimers();
                setStatus('Payment canceled');
                setIsProcessing(false);
                setStatusMessage('Платіж скасовано');
            } else if (data?.order?.status === 'FAILED') {
                clearTimers();
                setStatus('Payment failed');
                setIsProcessing(false);
                setStatusMessage('Помилка обробки замовлення сервером');
            } else {
                if (!silent) {
                    showToast('Статус замовлення: Очікує підтвердження');
                }
            }
        } catch {
            if (!silent && isMountedRef.current) {
                showToast('Не вдалося зв\'язатися з сервером перевірки');
            }
        }
    };

    // P0-1: Create Order & Open Invoice link
    const handlePayWithStars = async () => {
        if (isProcessing) return;
        setIsProcessing(true);
        setStatus('Invoice preparing...');
        setStatusMessage('Підготовка рахунку...');
        triggerHaptic('heavy');
        clearTimers();

        const clientRequestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        try {
            const tg = window.Telegram?.WebApp;
            const tgInitData = tg?.initData || '';
            const res = await fetch('/api/payments/stars/create', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `tma ${tgInitData}`
                },
                body: JSON.stringify({
                    plan: selectedPlan === 'PRO' ? 'pro_monthly' : 'whale_monthly',
                    planId: selectedPlan,
                    clientRequestId,
                    initData: tgInitData,
                    userId: userStats?.id || 'tg_user'
                })
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || 'Failed to create order');
            }

            const data = await res.json();
            const createdOrder = data.order;
            const link = data.invoiceUrl || data.invoiceLink;

            setOrderId(createdOrder.orderId);
            setInvoiceLink(link);
            setStatus('Waiting for Telegram payment...');
            setStatusMessage('Очікуємо оплату через Telegram Stars...');

            // Start 75s timeout (between 60-90s)
            timeoutTimerRef.current = setTimeout(() => {
                if (isMountedRef.current && status !== 'PRO active') {
                    clearTimers();
                    setIsProcessing(false);
                    setStatus('Payment pending');
                    setStatusMessage('Час очікування минув. Перевірте статус або спробуйте знову.');
                }
            }, 75000);

            // Open invoice in Telegram WebApp
            const opened = safeOpenTelegramInvoice(link, async (invoiceStatus: string) => {
                if (!isMountedRef.current) return;
                
                setStatus('Payment verification...');
                setStatusMessage('Підтвердження оплати на сервері...');

                if (invoiceStatus === 'paid') {
                    // Poll backend to confirm successful_payment receipt
                    checkBackendStatus(createdOrder.orderId);
                    pollIntervalRef.current = setInterval(() => {
                        checkBackendStatus(createdOrder.orderId, true);
                    }, 2000);
                } else if (invoiceStatus === 'cancelled') {
                    clearTimers();
                    setStatus('Payment canceled');
                    setIsProcessing(false);
                    setStatusMessage('Платіж було скасовано у вікні рахунку.');
                    triggerHaptic('error');
                } else {
                    clearTimers();
                    setStatus('Payment failed');
                    setIsProcessing(false);
                    setStatusMessage(`Статус рахунку: ${invoiceStatus}`);
                }
            });

            if (!opened) {
                // In standalone browser / preview where openInvoice is not natively injected
                setIsProcessing(false);
                setStatusMessage('Рахунок створено. Відкрийте Telegram для завершення оплати.');
                // Poll backend in browser mode
                pollIntervalRef.current = setInterval(() => {
                    checkBackendStatus(createdOrder.orderId, true);
                }, 3000);
            }
        } catch (err: any) {
            if (isMountedRef.current) {
                clearTimers();
                setStatus('Payment failed');
                setIsProcessing(false);
                setStatusMessage(err?.message || 'Помилка створення рахунку');
                triggerHaptic('error');
            }
        }
    };

    // Dev Simulator trigger for end-to-end verification without real stars
    const handleSimulatePayment = async () => {
        if (!orderId) {
            showToast('Спершу створіть замовлення');
            return;
        }
        setIsProcessing(true);
        setStatus('Payment verification...');
        setStatusMessage('Симуляція webhook successful_payment...');
        try {
            const res = await fetch('/api/payments/stars/webhook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'simulate_payment',
                    orderId,
                    chargeId: `tg_test_charge_${Date.now()}`
                })
            });
            const data = await res.json();
            if (res.ok && data.ok) {
                await checkBackendStatus(orderId);
            } else {
                setStatus('Payment failed');
                setIsProcessing(false);
                showToast(data.error || 'Помилка симуляції');
            }
        } catch {
            setStatus('Payment failed');
            setIsProcessing(false);
            showToast('Збій запиту до сервера');
        }
    };

    const handleCancelPayment = async () => {
        triggerHaptic('light');
        clearTimers();
        setIsProcessing(false);
        if (orderId && (status === 'Waiting for Telegram payment...' || status === 'Payment verification...' || status === 'Payment pending')) {
            try {
                await fetch('/api/payments/stars/webhook', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'cancel_order',
                        orderId
                    })
                });
            } catch {}
            setStatus('Payment canceled');
            setStatusMessage('Замовлення скасовано.');
        } else {
            onClose();
        }
    };

    const handleRetryPayment = () => {
        triggerHaptic('medium');
        clearTimers();
        setStatus('BASIC');
        setStatusMessage('');
        setOrderId('');
        setChargeId('');
        setIsProcessing(false);
    };

    const getStatusBadgeClass = () => {
        switch (status) {
            case 'PRO active':
                return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
            case 'Waiting for Telegram payment...':
            case 'Payment verification...':
            case 'Invoice preparing...':
                return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30 animate-pulse';
            case 'Payment failed':
                return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
            case 'Payment canceled':
                return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
            case 'Payment pending':
                return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
            default:
                return 'text-brand-cyan bg-brand-cyan/10 border-brand-cyan/30';
        }
    };

    return (
        <motion.div 
            data-modal-layer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-layer modal-layer--compact"
        >
            <button 
                data-modal-backdrop 
                className="modal-backdrop"
                aria-label="Закрити вікно підписки"
                onClick={onClose}
            />

            <motion.section 
                role="dialog"
                aria-modal="true"
                aria-labelledby="subscription-modal-title"
                tabIndex={-1}
                data-modal-panel
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="modal-panel w-full max-w-md bg-brand-bg rounded-[1.5rem] sm:rounded-[2rem] border border-white/10 shadow-[0_0_60px_rgba(139,92,246,0.3)] flex flex-col max-h-[90dvh] overflow-hidden my-auto"
            >
                {/* Header */}
                <div className="shrink-0 px-6 py-5 text-center border-b border-white/5 relative bg-brand-card/50">
                    <button 
                        onClick={onClose} 
                        aria-label="Закрити вікно підписки"
                        className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/5 text-slate-400 flex items-center justify-center hover:bg-white/10 transition-colors"
                    >
                        ✕
                    </button>
                    <div className="flex items-center justify-center gap-3 mb-1">
                        <div className="w-10 h-10 bg-brand-purple/20 rounded-xl flex items-center justify-center border border-brand-purple/30">
                            <StorkIcon className="w-6 h-6 text-brand-purple" />
                        </div>
                        <h2 id="subscription-modal-title" className="text-xl font-black text-white font-orbitron uppercase tracking-widest">
                            {t('sub.title') || 'PRO MEMBERSHIP'}
                        </h2>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar overscroll-contain pb-8 space-y-5">
                    
                    {/* Plan Selector (when not yet active) */}
                    {status !== 'PRO active' && (
                        <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="План підписки">
                            <button
                                type="button"
                                role="radio"
                                aria-checked={selectedPlan === 'PRO'}
                                onClick={() => { setSelectedPlan('PRO'); triggerHaptic('selection'); }}
                                disabled={isProcessing}
                                className={`p-4 rounded-2xl border text-left transition-all ${selectedPlan === 'PRO' ? 'border-brand-cyan bg-brand-cyan/10 ring-1 ring-brand-cyan' : 'border-white/10 bg-white/5 opacity-70'}`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-white text-xs font-orbitron">PRO TIER</span>
                                    <StarIcon className="w-4 h-4 text-yellow-400" />
                                </div>
                                <div className="text-lg font-black text-white font-orbitron">250 XTR</div>
                                <div className="text-[10px] text-slate-400 font-mono">30 днів доступу</div>
                            </button>

                            <button
                                type="button"
                                role="radio"
                                aria-checked={selectedPlan === 'WHALE'}
                                onClick={() => { setSelectedPlan('WHALE'); triggerHaptic('selection'); }}
                                disabled={isProcessing}
                                className={`p-4 rounded-2xl border text-left transition-all ${selectedPlan === 'WHALE' ? 'border-brand-purple bg-brand-purple/10 ring-1 ring-brand-purple' : 'border-white/10 bg-white/5 opacity-70'}`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-brand-purple text-xs font-orbitron">WHALE TIER</span>
                                    <StarIcon className="w-4 h-4 text-yellow-400" />
                                </div>
                                <div className="text-lg font-black text-white font-orbitron">500 XTR</div>
                                <div className="text-[10px] text-slate-400 font-mono">30 днів VIP доступу</div>
                            </button>
                        </div>
                    )}

                    {/* Strict UX Specification Box */}
                    <div className="bg-black/60 rounded-2xl p-5 border border-white/10 space-y-3 font-mono text-xs">
                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                            <span className="text-slate-400 uppercase tracking-wider">Payment method:</span>
                            <span className="text-white font-bold">Telegram Stars</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                            <span className="text-slate-400 uppercase tracking-wider">Currency:</span>
                            <span className="text-yellow-400 font-bold">XTR</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                            <span className="text-slate-400 uppercase tracking-wider">Amount:</span>
                            <span className="text-white font-bold">{getStarsAmount(selectedPlan)} XTR</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400 uppercase tracking-wider">Status:</span>
                            <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${getStatusBadgeClass()}`}>
                                {status}
                            </span>
                        </div>
                        {orderId && (
                            <div className="pt-2 border-t border-white/5 flex justify-between items-center text-[10px] text-slate-500">
                                <span>Order ID:</span>
                                <span className="text-slate-300 font-mono">{orderId}</span>
                            </div>
                        )}
                        {chargeId && (
                            <div className="flex justify-between items-center text-[10px] text-emerald-400">
                                <span>Charge ID:</span>
                                <span className="font-mono">{chargeId}</span>
                            </div>
                        )}
                    </div>

                    {statusMessage && (
                        <p className="text-center text-xs text-slate-300 font-mono animate-fade-in bg-white/5 py-2 px-3 rounded-xl border border-white/5">
                            {statusMessage}
                        </p>
                    )}

                    {/* Features list */}
                    {(status === 'BASIC' || status === 'Invoice preparing...') && (
                        <div className="bg-white/[0.02] rounded-2xl p-4 border border-white/5">
                            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Включено в підписку:</div>
                            <ul className="space-y-1.5 text-xs text-slate-300">
                                {(plans.find(p => p.id === selectedPlan)?.features || []).map((f: string, idx: number) => (
                                    <li key={idx} className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan shrink-0" />
                                        <span>{f}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Success Screen when PRO active */}
                    {status === 'PRO active' && (
                        <div className="py-6 text-center space-y-4">
                            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                                <ShieldIcon className="w-8 h-8 text-emerald-400" />
                            </div>
                            <h3 className="text-lg font-black text-white font-orbitron uppercase">
                                PRO АКТИВОВАНО
                            </h3>
                            <p className="text-xs text-slate-400 font-mono">
                                Сервер підтвердив платіж. Доступ активовано на 30 днів.
                            </p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-2">
                        {status === 'BASIC' && (
                            <button
                                onClick={handlePayWithStars}
                                disabled={isProcessing}
                                aria-label="Pay with Telegram Stars"
                                className="w-full py-4 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-black font-orbitron text-xs rounded-2xl uppercase tracking-widest shadow-[0_0_25px_rgba(234,179,8,0.3)] active:scale-[0.99] transition-all flex items-center justify-center gap-2 min-h-[48px]"
                            >
                                <StarIcon className="w-4 h-4 text-black" />
                                Pay with Telegram Stars ({getStarsAmount(selectedPlan)} XTR)
                            </button>
                        )}

                        {status === 'Invoice preparing...' && (
                            <button
                                disabled
                                aria-label="Invoice preparing"
                                className="w-full py-4 bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 font-bold font-orbitron text-xs rounded-2xl uppercase tracking-widest flex items-center justify-center gap-2 min-h-[48px] cursor-not-allowed"
                            >
                                <span className="w-4 h-4 border-2 border-yellow-300 border-t-transparent rounded-full animate-spin" />
                                Invoice preparing...
                            </button>
                        )}

                        {(status === 'Waiting for Telegram payment...' || status === 'Payment verification...') && (
                            <>
                                {invoiceLink && (
                                    <a
                                        href={invoiceLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="Open in Telegram"
                                        className="w-full py-3.5 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-black font-orbitron text-xs rounded-2xl uppercase tracking-widest transition-all flex items-center justify-center gap-2 min-h-[44px] shadow-md"
                                    >
                                        <StarIcon className="w-4 h-4 text-black" />
                                        Open in Telegram
                                    </a>
                                )}

                                <button
                                    onClick={() => checkBackendStatus(orderId)}
                                    aria-label="View payment status"
                                    className="w-full py-3.5 bg-brand-cyan text-black font-bold font-orbitron text-xs rounded-2xl uppercase tracking-widest hover:bg-cyan-300 transition-all shadow-md min-h-[44px]"
                                >
                                    View payment status
                                </button>
                                
                                {/* Dev test simulation helper */}
                                <button
                                    onClick={handleSimulatePayment}
                                    aria-label="Simulate payment confirmation"
                                    className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-slate-300 font-mono text-[10px] rounded-xl uppercase tracking-wider transition-colors border border-white/10 min-h-[36px]"
                                >
                                    ⚡ Simulate Test Confirmation (Dev)
                                </button>

                                <button
                                    onClick={handleCancelPayment}
                                    aria-label="Cancel"
                                    className="w-full py-3 bg-white/5 hover:bg-white/10 text-slate-400 font-semibold text-xs rounded-xl uppercase transition-colors min-h-[40px]"
                                >
                                    Cancel
                                </button>
                            </>
                        )}

                        {(status === 'Payment failed' || status === 'Payment canceled' || status === 'Payment pending') && (
                            <>
                                <button
                                    onClick={handleRetryPayment}
                                    aria-label="Retry payment"
                                    className="w-full py-4 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-black font-orbitron text-xs rounded-2xl uppercase tracking-widest transition-all min-h-[48px]"
                                >
                                    Retry payment
                                </button>
                                <button
                                    onClick={onClose}
                                    aria-label="Cancel"
                                    className="w-full py-3 bg-white/5 text-slate-400 font-semibold text-xs rounded-xl uppercase transition-colors min-h-[40px]"
                                >
                                    Cancel
                                </button>
                            </>
                        )}

                        {status === 'PRO active' && (
                            <button
                                onClick={onClose}
                                aria-label="Закрити"
                                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black font-orbitron text-xs rounded-2xl uppercase tracking-widest transition-all min-h-[48px]"
                            >
                                Повернутися до терміналу
                            </button>
                        )}
                    </div>

                </div>
            </motion.section>
        </motion.div>
    );
};

export default SubscriptionModal;