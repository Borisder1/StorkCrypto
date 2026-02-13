
import React, { useState, useEffect } from 'react';
import { BellIcon, PlusIcon, TelegramIcon } from './icons';
import { useStore } from '../store';
import { getTranslation } from '../utils/translations';
import { triggerHaptic } from '../utils/haptics';
import { PriceAlert } from '../types';

interface AlertsModalProps {
    onClose: () => void;
}

const AlertsModal: React.FC<AlertsModalProps> = ({ onClose }) => {
    const { settings, alerts, addAlert, removeAlert, showToast, telegramBotConnected, connectTelegramBot, userStats } = useStore();
    const t = (key: string) => getTranslation(settings.language, key);

    const [asset, setAsset] = useState('BTC');
    const [price, setPrice] = useState('');

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    const handleAdd = () => {
        if (!asset || !price) return;
        triggerHaptic('success');
        
        const newAlert: PriceAlert = {
            id: Date.now().toString(),
            asset: asset.toUpperCase(),
            targetPrice: parseFloat(price),
            condition: 'ABOVE', 
            active: true,
            createdAt: new Date().toISOString()
        };
        addAlert(newAlert);
        showToast(t('toast.alert_added'));
        setPrice('');
    };

    const handleConnectBot = () => {
        // Generate deep link with user ID to link bot chat to web app user
        const userId = userStats.id.replace('tg_', '') || 'guest';
        const deepLink = `https://t.me/StorkCryptoBot?start=${userId}`;
        
        triggerHaptic('selection');
        window.open(deepLink, '_blank');
        connectTelegramBot(); // Optimistic update
        showToast('Bot Connected Successfully');
    };

    return (
        <div className="fixed inset-0 z-[100] grid place-items-center p-4 overflow-hidden overscroll-none touch-none">
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md animate-fade-in touch-none" onClick={onClose}></div>
            
            <div className="relative z-10 w-full max-w-sm bg-brand-bg border border-brand-border rounded-[2rem] overflow-hidden shadow-[0_0_60px_rgba(0,240,255,0.15)] flex flex-col max-h-[85dvh] animate-zoom-in">
                <div className="p-5 border-b border-brand-border bg-brand-card flex justify-between items-center z-10 shrink-0 touch-none">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center"><BellIcon className="w-5 h-5 text-brand-cyan" /></div>
                        <h2 className="font-orbitron font-bold text-lg text-white">{t('alerts.title')}</h2>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors">✕</button>
                </div>
                
                <div className="p-5 flex-1 overflow-y-auto custom-scrollbar overscroll-contain">
                    
                    {/* SMART ALERTS INTEGRATION */}
                    <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-[#0088cc]/20 to-transparent border border-[#0088cc]/30 relative overflow-hidden">
                        <div className="flex justify-between items-start mb-2 relative z-10">
                            <div className="flex items-center gap-2">
                                <TelegramIcon className="w-5 h-5 text-[#0088cc]" />
                                <h3 className="font-bold text-white text-sm">Smart Alerts</h3>
                            </div>
                            {telegramBotConnected ? (
                                <span className="bg-green-500/20 text-green-400 text-[9px] font-bold px-2 py-0.5 rounded border border-green-500/30">ACTIVE</span>
                            ) : (
                                <span className="bg-red-500/20 text-red-400 text-[9px] font-bold px-2 py-0.5 rounded border border-red-500/30 animate-pulse">OFFLINE</span>
                            )}
                        </div>
                        <p className="text-[10px] text-slate-300 mb-3 relative z-10 leading-relaxed">
                            Отримуйте сповіщення про рух цін та сигнали в Telegram, навіть коли додаток закритий.
                        </p>
                        {!telegramBotConnected && (
                            <button 
                                onClick={handleConnectBot}
                                className="w-full py-2 bg-[#0088cc] hover:bg-[#0088cc]/80 text-white font-bold text-xs rounded-xl shadow-lg relative z-10 transition-colors"
                            >
                                ПІДКЛЮЧИТИ БОТА
                            </button>
                        )}
                        {/* Decor */}
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-[#0088cc]/20 rounded-full blur-xl pointer-events-none"></div>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10 mb-6">
                        <h3 className="text-xs font-bold text-white uppercase mb-3">{t('alerts.add')}</h3>
                        <div className="grid grid-cols-3 gap-2 mb-3">
                            <input type="text" value={asset} onChange={(e) => setAsset(e.target.value)} className="col-span-1 bg-black/30 border border-white/10 rounded-xl p-3 text-white font-bold text-center uppercase focus:border-brand-cyan outline-none" placeholder="BTC"/>
                            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="col-span-2 bg-black/30 border border-white/10 rounded-xl p-3 text-white font-mono focus:border-brand-cyan outline-none" placeholder={t('alerts.target')}/>
                        </div>
                        <button onClick={handleAdd} className="w-full py-3 rounded-xl bg-brand-cyan text-black font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"><PlusIcon className="w-4 h-4" /> {t('alerts.add')}</button>
                    </div>
                    <div className="space-y-3">
                        {alerts.length > 0 ? alerts.map((alert) => (
                            <div key={alert.id} className="bg-brand-card border border-brand-border rounded-xl p-3 flex items-center justify-between animate-fade-in">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center font-bold text-[10px]">{alert.asset[0]}</div>
                                    <div>
                                        <p className="font-bold text-white text-sm">{alert.asset}</p>
                                        <p className="text-xs text-brand-cyan font-mono">${alert.targetPrice.toLocaleString()}</p>
                                    </div>
                                </div>
                                <button onClick={() => removeAlert(alert.id)} className="px-3 py-1 rounded bg-brand-danger/10 text-brand-danger text-[10px] font-bold hover:bg-brand-danger/20 transition-colors">DEL</button>
                            </div>
                        )) : <div className="text-center py-8 text-slate-500 text-xs border border-dashed border-white/10 rounded-xl">{t('alerts.empty')}</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AlertsModal;
