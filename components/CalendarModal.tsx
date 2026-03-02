
import React, { useEffect } from 'react';
import { useStore } from '../store';
import { getTranslation } from '../utils/translations';
import { ActivityIcon } from './icons';

const EVENTS = [
    { time: '14:30', event: 'cal.event.cpi', impact: 'HIGH', forecast: '3.1%', previous: '3.2%' },
    { time: '19:00', event: 'cal.event.fomc', impact: 'HIGH', forecast: '-', previous: '-' },
    { time: 'cal.time.tomorrow', event: 'cal.event.jobless', impact: 'MED', forecast: '215K', previous: '210K' },
    { time: 'cal.time.fri', event: 'cal.event.pce', impact: 'HIGH', forecast: '0.3%', previous: '0.3%' },
    { time: 'cal.time.fri', event: 'cal.event.sentiment', impact: 'LOW', forecast: '76.5', previous: '76.9' },
];

const CalendarModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { settings } = useStore();
    const t = (key: string) => getTranslation(settings.language, key);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    const getImpactColor = (impact: string) => {
        if (impact === 'HIGH') return 'text-red-500 bg-red-500/10 border-red-500/30';
        if (impact === 'MED') return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
        return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    };

    return (
        <div className="fixed inset-0 z-[100] grid place-items-center p-4 overflow-hidden touch-none">
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md animate-fade-in touch-none" onClick={onClose}></div>
            
            <div className="relative z-10 w-full max-w-sm bg-brand-bg border border-brand-border rounded-[2rem] overflow-hidden shadow-[0_0_60px_rgba(0,240,255,0.15)] flex flex-col max-h-[85dvh] animate-zoom-in">
                <div className="p-5 border-b border-brand-border bg-brand-card flex justify-between items-center shrink-0">
                    <h2 className="font-orbitron font-bold text-lg text-white">{t('cal.title')}</h2>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white">✕</button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                    {EVENTS.map((ev, i) => (
                        <div key={i} className="bg-black/30 border border-white/5 rounded-xl p-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="text-center w-10">
                                    <p className="text-[10px] text-slate-500 font-mono">{ev.time.startsWith('cal.') ? t(ev.time) : ev.time}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white">{t(ev.event)}</p>
                                    <p className="text-[9px] text-slate-500">{t('cal.forecast')}: {ev.forecast} • {t('cal.previous')}: {ev.previous}</p>
                                </div>
                            </div>
                            <span className={`text-[8px] font-bold px-2 py-1 rounded border ${getImpactColor(ev.impact)}`}>
                                {t(`cal.impact.${ev.impact.toLowerCase()}`)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CalendarModal;
