
import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { ShieldIcon, SendIcon, BarChartIcon } from './icons';
import { getTranslation } from '../utils/translations';
import { triggerHaptic } from '../utils/haptics';

interface AdInquiryModalProps {
    onClose: () => void;
}

const AdInquiryModal: React.FC<AdInquiryModalProps> = ({ onClose }) => {
    const { settings, submitAdRequest, showToast } = useStore();
    const t = (key: string) => getTranslation(settings.language, key);

    const [brandName, setBrandName] = useState('');
    const [contact, setContact] = useState(''); // Telegram or Email
    const [budget, setBudget] = useState('');
    const [currency, setCurrency] = useState<'USDT' | 'TON' | 'BTC' | 'FIAT'>('USDT');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    const handleSubmit = () => {
        if (!brandName || !contact || !budget || !description) {
            triggerHaptic('error');
            showToast(t('common.fill_all'));
            return;
        }

        setLoading(true);
        triggerHaptic('medium');

        setTimeout(() => {
            submitAdRequest({
                brandName,
                contact,
                budget,
                currency,
                description
            });
            setLoading(false);
            setSuccess(true);
            triggerHaptic('success');
        }, 1500);
    };

    if (success) {
        return (
            <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in p-6">
                <div className="bg-brand-card border border-green-500 rounded-3xl p-8 text-center max-w-sm w-full animate-zoom-in">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-green-500 shadow-[0_0_30px_#22c55e]">
                        <ShieldIcon className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2 font-orbitron">{t('ad.success.title')}</h2>
                    <p className="text-slate-400 text-sm mb-6 font-mono">
                        {t('ad.success.msg')}
                    </p>
                    <button 
                        onClick={onClose}
                        className="w-full py-3 bg-green-500 text-black font-bold rounded-xl hover:bg-green-400 transition-colors"
                    >
                        {t('common.close').toUpperCase()}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[160] flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md animate-fade-in" onClick={onClose}></div>
            
            <div className="relative z-10 w-full sm:max-w-md bg-[#0a0e1a] rounded-t-3xl sm:rounded-2xl border-t sm:border border-brand-border shadow-2xl flex flex-col max-h-[90vh] animate-slide-up-mobile sm:animate-zoom-in">
                
                {/* Header */}
                <div className="p-5 border-b border-brand-border bg-brand-card flex justify-between items-center shrink-0">
                    <h2 className="font-orbitron font-bold text-lg text-white flex items-center gap-2">
                        <BarChartIcon className="w-5 h-5 text-brand-purple" /> {t('ad.form.title')}
                    </h2>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors">✕</button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                    <p className="text-xs text-slate-400 mb-6 font-mono leading-relaxed bg-brand-purple/10 p-3 rounded-xl border border-brand-purple/20">
                        {t('ad.info')}
                    </p>

                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">{t('ad.form.brand')}</label>
                            <input 
                                type="text" 
                                value={brandName}
                                onChange={e => setBrandName(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-brand-purple outline-none font-mono text-sm"
                                placeholder="CryptoX Exchange"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">{t('ad.form.contact')}</label>
                            <input 
                                type="text" 
                                value={contact}
                                onChange={e => setContact(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-brand-purple outline-none font-mono text-sm"
                                placeholder="@username / email@com"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">{t('ad.form.budget')}</label>
                                <input 
                                    type="number" 
                                    value={budget}
                                    onChange={e => setBudget(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-brand-purple outline-none font-mono text-sm"
                                    placeholder="1000"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">{t('ad.form.currency')}</label>
                                <select 
                                    value={currency}
                                    onChange={e => setCurrency(e.target.value as any)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-brand-purple outline-none font-mono text-sm"
                                >
                                    <option value="USDT">USDT</option>
                                    <option value="TON">TON</option>
                                    <option value="BTC">BTC</option>
                                    <option value="FIAT">USD/UAH</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">{t('ad.form.desc')}</label>
                            <textarea 
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-brand-purple outline-none font-mono text-sm h-24 resize-none"
                                placeholder="..."
                            />
                        </div>
                    </div>
                </div>

                <div className="p-5 border-t border-white/10 bg-brand-card shrink-0 safe-area-pb">
                    <button 
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full py-4 bg-brand-purple text-white font-bold font-orbitron rounded-xl shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? t('ad.form.sending') : <><SendIcon className="w-4 h-4"/> {t('ad.form.submit')}</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdInquiryModal;
