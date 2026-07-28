
import React, { useState, useEffect } from 'react';
import { BellIcon, PlusIcon, TelegramIcon, ZapIcon, ShieldIcon } from './icons';
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
    const [condition, setCondition] = useState<'ABOVE' | 'BELOW'>('ABOVE');
    const [pushPermission, setPushPermission] = useState<NotificationPermission>(
        typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
    );

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    const requestWebPush = async () => {
        triggerHaptic('medium');
        if (typeof window === 'undefined' || !('Notification' in window)) {
            showToast('Браузерне Push-сповіщення не підтримується на цьому пристрої. Використовуйте Telegram Бот.');
            return;
        }

        try {
            const perm = await Notification.requestPermission();
            setPushPermission(perm);
            if (perm === 'granted') {
                showToast('✅ Web Push сповіщення успішно активовано!');
                new Notification('StorkCrypto Neural Link', {
                    body: '🎯 Сповіщення активовано! Ви будете отримувати сигнали про зміну цін.',
                    icon: '/logo.jpg'
                });
            } else if (perm === 'denied') {
                showToast('⚠️ Сповіщення заблоковано в налаштуваннях браузера.');
            }
        } catch (e) {
            console.error('[Push] Request error:', e);
            showToast('Не вдалося увімкнути сповіщення');
        }
    };

    const sendTestPush = () => {
        triggerHaptic('light');
        if (pushPermission === 'granted' && 'Notification' in window) {
            new Notification('⚡ STORKCRYPTO ALERT TEST', {
                body: `[TEST SIGNAL] ${asset.toUpperCase()} перетнув цінову позначку!`,
                icon: '/logo.jpg'
            });
            showToast('Тестове Push-сповіщення надіслано!');
        } else {
            showToast(`[TEST ALERT] ${asset.toUpperCase()} target $${price || '70,000'} triggered!`);
        }
    };

    const handleAdd = () => {
        if (!asset || !price) {
            showToast('Вкажіть тикер та цільову ціну');
            return;
        }
        triggerHaptic('success');
        
        const newAlert: PriceAlert = {
            id: Date.now().toString(),
            asset: asset.toUpperCase(),
            targetPrice: parseFloat(price),
            condition: condition, 
            active: true,
            createdAt: new Date().toISOString()
        };
        addAlert(newAlert);
        showToast(`Сповіщення створено: ${asset.toUpperCase()} ${condition === 'ABOVE' ? '≥' : '≤'} $${parseFloat(price).toLocaleString()}`);
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto overscroll-contain">
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md animate-fade-in" onClick={onClose}></div>
            
            <div className="relative z-10 w-full max-w-sm bg-brand-bg border border-brand-border rounded-[2rem] overflow-hidden shadow-[0_0_60px_rgba(0,240,255,0.15)] flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-zoom-in my-auto">
                <div className="p-5 border-b border-brand-border bg-brand-card flex justify-between items-center z-10 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center"><BellIcon className="w-5 h-5 text-brand-cyan" /></div>
                        <div>
                            <h2 className="font-orbitron font-bold text-lg text-white">{t('alerts.title')}</h2>
                            <p className="text-[9px] text-slate-400 font-mono uppercase">Push & Telegram Signal Hub</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors">✕</button>
                </div>
                
                <div className="p-5 flex-1 overflow-y-auto custom-scrollbar overscroll-contain space-y-4">
                    
                    {/* WEB BROWSER PUSH NOTIFICATIONS CONTROLLER */}
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden">
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                                <ZapIcon className="w-4 h-4 text-brand-cyan" />
                                <h3 className="font-bold text-white text-xs font-orbitron uppercase">Браузерні Web Push</h3>
                            </div>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase ${pushPermission === 'granted' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}`}>
                                {pushPermission === 'granted' ? 'УВІМКНЕНО' : 'ВИМКНЕНО'}
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-300 mb-3 leading-relaxed">
                            Отримуйте миттєві сповіщення про зміну цін та пампи прямо на екран смартфона чи ПК.
                        </p>
                        {pushPermission !== 'granted' ? (
                            <button 
                                onClick={requestWebPush}
                                className="w-full py-2 bg-brand-cyan text-black font-black text-xs font-orbitron rounded-xl shadow-lg hover:bg-white transition-all uppercase"
                            >
                                🔔 УВІМКНУТИ WEB PUSH
                            </button>
                        ) : (
                            <button 
                                onClick={sendTestPush}
                                className="w-full py-2 bg-white/10 hover:bg-white/20 text-brand-cyan font-bold text-xs rounded-xl border border-brand-cyan/30 transition-all font-mono"
                            >
                                ⚡ Тестове Push-сповіщення
                            </button>
                        )}
                    </div>

                    {/* TELEGRAM BOT SMART ALERTS INTEGRATION */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0088cc]/20 to-transparent border border-[#0088cc]/30 relative overflow-hidden">
                        <div className="flex justify-between items-start mb-2 relative z-10">
                            <div className="flex items-center gap-2">
                                <TelegramIcon className="w-5 h-5 text-[#0088cc]" />
                                <h3 className="font-bold text-white text-xs font-orbitron uppercase">Telegram Smart Bot</h3>
                            </div>
                            {telegramBotConnected ? (
                                <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded border border-emerald-500/30">ACTIVE</span>
                            ) : (
                                <span className="bg-red-500/20 text-red-400 text-[9px] font-bold px-2 py-0.5 rounded border border-red-500/30 animate-pulse">OFFLINE</span>
                            )}
                        </div>
                        <p className="text-[10px] text-slate-300 mb-3 relative z-10 leading-relaxed">
                            Синхронізація зі StorkCrypto Bot у Telegram для передачі сигналів 24/7.
                        </p>
                        {!telegramBotConnected ? (
                            <button 
                                onClick={handleConnectBot}
                                className="w-full py-2 bg-[#0088cc] hover:bg-[#0088cc]/80 text-white font-bold text-xs rounded-xl shadow-lg relative z-10 transition-colors uppercase font-orbitron"
                            >
                                ПІДКЛЮЧИТИ ТЕЛЕГРАМ БОТА
                            </button>
                        ) : (
                            <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                                <span>✓ Бот активований та готовий до розсилки.</span>
                            </div>
                        )}
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-[#0088cc]/20 rounded-full blur-xl pointer-events-none"></div>
                    </div>

                    {/* ADD NEW PRICE ALERT FORM */}
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                        <h3 className="text-xs font-bold text-white uppercase mb-3 font-orbitron">{t('alerts.add')}</h3>
                        
                        <div className="flex bg-black/60 p-1 rounded-xl border border-white/10 mb-3">
                            <button 
                                type="button" 
                                onClick={() => { triggerHaptic('selection'); setCondition('ABOVE'); }}
                                className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${condition === 'ABOVE' ? 'bg-emerald-500 text-black font-bold shadow' : 'text-slate-400'}`}
                            >
                                📈 Вище (≥ Price)
                            </button>
                            <button 
                                type="button" 
                                onClick={() => { triggerHaptic('selection'); setCondition('BELOW'); }}
                                className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${condition === 'BELOW' ? 'bg-red-500 text-white font-bold shadow' : 'text-slate-400'}`}
                            >
                                📉 Нижче (≤ Price)
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mb-3 font-mono">
                            <input 
                                type="text" 
                                value={asset} 
                                onChange={(e) => setAsset(e.target.value.toUpperCase())} 
                                className="col-span-1 bg-black/60 border border-white/10 rounded-xl p-3 text-white font-bold text-center uppercase focus:border-brand-cyan outline-none text-xs" 
                                placeholder="BTC"
                            />
                            <input 
                                type="number" 
                                value={price} 
                                onChange={(e) => setPrice(e.target.value)} 
                                className="col-span-2 bg-black/60 border border-white/10 rounded-xl p-3 text-white font-bold focus:border-brand-cyan outline-none text-xs" 
                                placeholder={t('alerts.target')}
                            />
                        </div>
                        <button 
                            onClick={handleAdd} 
                            className="w-full py-3 rounded-xl bg-brand-cyan text-black font-black text-xs font-orbitron uppercase flex items-center justify-center gap-2 hover:bg-white transition-all shadow-lg active:scale-95"
                        >
                            <PlusIcon className="w-4 h-4" /> {t('alerts.add')}
                        </button>
                    </div>

                    {/* ALERTS LIST */}
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase font-mono">Активні сповіщення ({alerts.length})</p>
                        {alerts.length > 0 ? alerts.map((alert) => (
                            <div key={alert.id} className="bg-brand-card border border-white/10 rounded-xl p-3 flex items-center justify-between animate-fade-in font-mono">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-brand-cyan/20 border border-brand-cyan/30 flex items-center justify-center font-black text-brand-cyan text-xs font-orbitron">
                                        {alert.asset.slice(0, 3)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white text-xs">{alert.asset}</p>
                                        <p className="text-[10px] text-brand-cyan">
                                            {alert.condition === 'BELOW' ? '📉 ≤' : '📈 ≥'} ${alert.targetPrice.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => { triggerHaptic('light'); removeAlert(alert.id); }} 
                                    className="px-2.5 py-1 rounded-lg bg-red-500/20 text-red-400 text-[9px] font-bold hover:bg-red-500/30 transition-colors uppercase border border-red-500/30"
                                >
                                    Видалити
                                </button>
                            </div>
                        )) : (
                            <div className="text-center py-6 text-slate-500 text-xs border border-dashed border-white/10 rounded-xl font-mono">
                                {t('alerts.empty')}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AlertsModal;

