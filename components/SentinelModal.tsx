
import React, { useState } from 'react';
import { useStore } from '../store';
import { ShieldIcon, RadarIcon, ZapIcon, BellIcon, ChevronRightIcon } from './icons';
import { triggerHaptic } from '../utils/haptics';

interface SentinelModalProps {
    onClose: () => void;
}

const SentinelModal: React.FC<SentinelModalProps> = ({ onClose }) => {
    const { userStats, updateSentinelConfig, showToast } = useStore();
    const config = userStats.sentinel;

    // Local state for smoother UI interaction before save
    const [whaleThreshold, setWhaleThreshold] = useState(config.whaleThreshold);
    const [startHour, setStartHour] = useState(config.quietHoursStart);
    const [endHour, setEndHour] = useState(config.quietHoursEnd);

    const handleSave = () => {
        triggerHaptic('success');
        updateSentinelConfig({ 
            whaleThreshold, 
            quietHoursStart: startHour, 
            quietHoursEnd: endHour 
        });
        showToast('Sentinel Protocol Updated');
        setTimeout(onClose, 500);
    };

    const toggle = (key: keyof typeof config) => {
        triggerHaptic('light');
        updateSentinelConfig({ [key]: !config[key] });
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/95 backdrop-blur-md animate-fade-in" onClick={onClose}></div>
            
            <div className="relative z-10 w-full sm:max-w-md bg-brand-bg border-t sm:border border-white/10 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] animate-slide-up-mobile">
                
                {/* Header */}
                <div className="p-6 border-b border-white/5 bg-brand-card/50 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${config.active ? 'bg-brand-cyan/20 border-brand-cyan' : 'bg-white/5 border-white/10'}`}>
                            <ShieldIcon className={`w-6 h-6 ${config.active ? 'text-brand-cyan animate-pulse' : 'text-slate-500'}`} />
                        </div>
                        <div>
                            <h2 className="font-orbitron font-black text-lg text-white uppercase tracking-widest">Sentinel_Core</h2>
                            <p className="text-[9px] text-slate-500 font-mono uppercase">Autonomous Monitor V2</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400">✕</button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                    
                    {/* MASTER SWITCH */}
                    <div 
                        onClick={() => toggle('active')}
                        className={`p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden group ${config.active ? 'bg-brand-cyan/10 border-brand-cyan shadow-[0_0_20px_rgba(0,217,255,0.1)]' : 'bg-black/40 border-white/10'}`}
                    >
                        <div className="flex justify-between items-center relative z-10">
                            <div>
                                <h3 className={`font-black text-sm uppercase mb-1 ${config.active ? 'text-white' : 'text-slate-400'}`}>{config.active ? 'System Armed' : 'System Disarmed'}</h3>
                                <p className="text-[9px] font-mono text-slate-500">Global Monitoring Status</p>
                            </div>
                            <div className={`w-12 h-6 rounded-full border p-1 transition-colors ${config.active ? 'bg-brand-cyan border-brand-cyan' : 'bg-slate-800 border-slate-600'}`}>
                                <div className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform ${config.active ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </div>
                        </div>
                        {config.active && <div className="absolute inset-0 bg-brand-cyan/5 animate-pulse pointer-events-none"></div>}
                    </div>

                    {/* TRIGGER CONFIG */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Detection Parameters</h4>
                        
                        {/* WHALE TRACKER */}
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-2">
                                    <RadarIcon className="w-4 h-4 text-brand-purple" />
                                    <span className="text-xs font-bold text-white">Whale Movements</span>
                                </div>
                                <input 
                                    type="checkbox" 
                                    checked={config.trackWhales} 
                                    onChange={() => toggle('trackWhales')}
                                    className="accent-brand-cyan w-4 h-4"
                                />
                            </div>
                            {config.trackWhales && (
                                <div>
                                    <div className="flex justify-between text-[9px] font-mono text-slate-400 mb-2">
                                        <span>Threshold</span>
                                        <span className="text-white">${(whaleThreshold / 1000).toFixed(0)}k</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="100000" 
                                        max="10000000" 
                                        step="100000" 
                                        value={whaleThreshold} 
                                        onChange={(e) => setWhaleThreshold(Number(e.target.value))}
                                        className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-purple"
                                    />
                                </div>
                            )}
                        </div>

                        {/* OTHER TOGGLES */}
                        <div className="grid grid-cols-2 gap-3">
                            <div 
                                onClick={() => toggle('trackVolatility')}
                                className={`p-3 rounded-xl border cursor-pointer transition-all ${config.trackVolatility ? 'bg-brand-cyan/10 border-brand-cyan text-brand-cyan' : 'bg-white/5 border-white/5 text-slate-500'}`}
                            >
                                <ZapIcon className="w-5 h-5 mb-2" />
                                <p className="text-[9px] font-black uppercase">Volatility Spikes</p>
                            </div>
                            <div 
                                onClick={() => toggle('trackSentiment')}
                                className={`p-3 rounded-xl border cursor-pointer transition-all ${config.trackSentiment ? 'bg-brand-green/10 border-brand-green text-brand-green' : 'bg-white/5 border-white/5 text-slate-500'}`}
                            >
                                <ShieldIcon className="w-5 h-5 mb-2" />
                                <p className="text-[9px] font-black uppercase">Sentiment Shifts</p>
                            </div>
                        </div>
                    </div>

                    {/* QUIET HOURS */}
                    <div>
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Quiet Protocol (DND)</h4>
                        <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                            <BellIcon className="w-5 h-5 text-slate-400" />
                            <div className="flex-1 flex items-center gap-2">
                                <input type="time" value={startHour} onChange={e => setStartHour(e.target.value)} className="bg-black/30 text-white text-xs p-2 rounded border border-white/10 outline-none font-mono" />
                                <span className="text-slate-500">-</span>
                                <input type="time" value={endHour} onChange={e => setEndHour(e.target.value)} className="bg-black/30 text-white text-xs p-2 rounded border border-white/10 outline-none font-mono" />
                            </div>
                        </div>
                    </div>

                </div>

                <div className="p-6 border-t border-white/5 bg-brand-bg shrink-0 safe-area-pb">
                    <button onClick={handleSave} className="w-full py-4 bg-brand-cyan text-black font-black font-orbitron rounded-2xl shadow-xl hover:bg-white transition-all uppercase tracking-widest text-xs">
                        Update Directive
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SentinelModal;
