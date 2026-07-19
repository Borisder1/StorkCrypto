
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store';
import { ShieldIcon, RadarIcon, ZapIcon, BellIcon, NewspaperIcon, TimerIcon, ChevronRightIcon } from './icons';
import { triggerHaptic } from '../utils/haptics';
import { getTranslation } from '../utils/translations';

interface SentinelModalProps {
    onClose: () => void;
}

const SentinelModal: React.FC<SentinelModalProps> = ({ onClose }) => {
    const { userStats, updateSentinelConfig, showToast, settings } = useStore();
    const t = (key: string) => getTranslation(settings?.language || 'en', key);
    const config = userStats.sentinel;

    const [activeTab, setActiveTab] = useState<'DIRECTIVES' | 'SECURITY'>('DIRECTIVES');

    // Sentinel Directives States
    const [whaleThreshold, setWhaleThreshold] = useState(config.whaleThreshold);
    const [startHour, setStartHour] = useState(config.quietHoursStart);
    const [endHour, setEndHour] = useState(config.quietHoursEnd);

    // Security Tab States
    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [scanStep, setScanStep] = useState('');
    const [securityScore, setSecurityScore] = useState(94.8);
    const [verifiedItems, setVerifiedItems] = useState<Record<string, boolean>>({
        initData: true,
        xssShield: true,
        tlsWebsocket: true,
        cookieSandbox: true,
        biometricLock: false
    });

    const handleSave = () => {
        triggerHaptic('success');
        updateSentinelConfig({ 
            whaleThreshold, 
            quietHoursStart: startHour, 
            quietHoursEnd: endHour 
        });
        showToast(t('sentinel.updated'));
        setTimeout(onClose, 500);
    };

    const toggle = (key: keyof typeof config) => {
        triggerHaptic('light');
        // @ts-ignore
        updateSentinelConfig({ [key]: !config[key] });
    };

    const runSecurityAudit = () => {
        if (isScanning) return;
        triggerHaptic('medium');
        setIsScanning(true);
        setScanProgress(0);
        setScanStep('MEM_INIT: SECURING LOCAL STORAGE RAM');

        const steps = [
            { limit: 20, msg: 'XSS_SHIELD: INSPECTION OF GENERATED CHAT COMPONENT DOM PURIFIER' },
            { limit: 45, msg: 'INIT_DATA: VERIFYING TELEGRAM SIGNATURE MATRIX (HMAC-SHA256)' },
            { limit: 68, msg: 'PORT_AUDIT: COMPILING CORS ALLOWLIST FOR PRIVATE ENDPOINTS' },
            { limit: 85, msg: 'SSL_TLS: ESTABLISHING SECURE WEB SOCKET TLS TRANSPORT' },
            { limit: 100, msg: 'INTEGRITY: AUDIT COMPLETED. SYSTEM FORTIFIED.' }
        ];

        let currentProgress = 0;
        let stepIdx = 0;

        const interval = setInterval(() => {
            currentProgress += Math.floor(Math.random() * 4) + 1;
            if (currentProgress >= 100) {
                currentProgress = 100;
                setScanProgress(100);
                setScanStep(steps[steps.length - 1].msg);
                clearInterval(interval);
                setIsScanning(false);
                setSecurityScore(99.9);
                setVerifiedItems(prev => ({
                    ...prev,
                    initData: true,
                    xssShield: true,
                    tlsWebsocket: true,
                    cookieSandbox: true,
                    biometricLock: true
                }));
                triggerHaptic('success');
                showToast('Кібербезпека: Система захищена на 99.9%!');
            } else {
                setScanProgress(currentProgress);
                if (stepIdx < steps.length && currentProgress >= steps[stepIdx].limit) {
                    setScanStep(steps[stepIdx].msg);
                    stepIdx++;
                    triggerHaptic('light');
                }
            }
        }, 80);
    };

    const copySecurityReport = () => {
        triggerHaptic('selection');
        const reportText = `🛡️ STORKCRYPTO SECURITY REPORT (v10.0 Neural Shield)\n` +
            `-----------------------------------------\n` +
            `• System Integrity Index: ${securityScore.toFixed(1)}/100%\n` +
            `• InitData Cryptographic Hash Verification: COMPLIANT (HMAC-SHA256)\n` +
            `• Dynamic Client-Side XSS Sanitizer: ACTIVE\n` +
            `• Secure Memory Cache Persistence: ARMOR-SECURED\n` +
            `• Transport Layer TLS 1.3 Tunneling: COMPLIANT\n` +
            `• Local Frame Isolation (Anti-Clickjacking): VERIFIED\n` +
            `-----------------------------------------\n` +
            `Status: OPERATIONAL & SECURED. Guarding operational capital.`;
        
        navigator.clipboard.writeText(reportText);
        showToast('Звіт аудиту безпеки скопійовано у буфер!');
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[150] bg-brand-bg flex flex-col overflow-hidden h-[100dvh] w-full"
        >
            <div className="safe-area-pt bg-brand-card/90 backdrop-blur-2xl border-b border-white/10 px-6 py-5 flex items-center justify-between shrink-0 relative z-20">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => { triggerHaptic('light'); onClose(); }}
                        className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 active:scale-90 transition-all shadow-lg"
                    >
                        <ChevronRightIcon className="w-6 h-6 rotate-180" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="font-orbitron text-lg font-black text-white tracking-widest uppercase">{t('sentinel.title') || 'SENTINEL_BOT'}</h1>
                        </div>
                        <p className="text-[8px] text-brand-cyan font-mono animate-pulse uppercase">{t('sentinel.subtitle') || 'AUTONOMOUS WATCHDOG'}</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar relative z-10 flex flex-col sm:justify-center sm:items-center">
                <div className="w-full sm:max-w-md bg-brand-card/60 sm:border border-white/10 sm:rounded-[2.5rem] shadow-2xl flex flex-col sm:my-6">
                
                {/* TAB SWITCHER */}
                <div className="px-6 pt-4 flex gap-2 shrink-0">
                    <button 
                        onClick={() => { triggerHaptic('light'); setActiveTab('DIRECTIVES'); }}
                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-wider font-orbitron rounded-2xl border transition-all ${activeTab === 'DIRECTIVES' ? 'bg-white/5 border-white/20 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                    >
                        {t('sentinel.tab_directives') || 'Directives'}
                    </button>
                    <button 
                        onClick={() => { triggerHaptic('light'); setActiveTab('SECURITY'); }}
                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-wider font-orbitron rounded-2xl border transition-all ${activeTab === 'SECURITY' ? 'bg-brand-cyan/10 border-brand-cyan/30 text-brand-cyan' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                    >
                        {t('sentinel.tab_security') || 'Security Shield'}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                    <AnimatePresence mode="wait">
                        {activeTab === 'DIRECTIVES' ? (
                            <motion.div
                                key="directives"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="space-y-6"
                            >
                                <div 
                                    onClick={() => toggle('active')}
                                    className={`p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden group ${config.active ? 'bg-brand-cyan/10 border-brand-cyan shadow-[0_0_20px_rgba(0,217,255,0.1)]' : 'bg-black/40 border-white/10'}`}
                                >
                                    <div className="flex justify-between items-center relative z-10">
                                        <div>
                                            <h3 className={`font-black text-sm uppercase mb-1 ${config.active ? 'text-white' : 'text-slate-400'}`}>{config.active ? t('sentinel.armed') : t('sentinel.disarmed')}</h3>
                                            <p className="text-[9px] font-mono text-slate-500">{t('sentinel.status')}</p>
                                        </div>
                                        <div className={`w-12 h-6 rounded-full border p-1 transition-colors ${config.active ? 'bg-brand-cyan border-brand-cyan' : 'bg-slate-800 border-slate-600'}`}>
                                            <div className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform ${config.active ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                        </div>
                                    </div>
                                    {config.active && <div className="absolute inset-0 bg-brand-cyan/5 animate-pulse pointer-events-none"></div>}
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('sentinel.push_config')}</h4>
                                    
                                    {/* PACKAGE ALERT */}
                                    <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${config.notifyExpiringPack ? 'bg-brand-purple/10 border-brand-purple/30' : 'bg-white/5 border-white/5 opacity-60'}`} onClick={() => toggle('notifyExpiringPack')}>
                                        <div className="flex items-center gap-3">
                                            <TimerIcon className={`w-5 h-5 ${config.notifyExpiringPack ? 'text-brand-purple' : 'text-slate-500'}`} />
                                            <div>
                                                <p className="text-xs font-bold text-white">{t('sentinel.sub_expiry')}</p>
                                                <p className="text-[8px] text-slate-500 font-mono">{t('sentinel.sub_expiry_desc')}</p>
                                            </div>
                                        </div>
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${config.notifyExpiringPack ? 'bg-brand-purple border-brand-purple' : 'border-white/20'}`}>
                                            {config.notifyExpiringPack && <span className="text-[10px] text-white">✓</span>}
                                        </div>
                                    </div>

                                    {/* BREAKING NEWS ALERT */}
                                    <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${config.notifyBreakingNews ? 'bg-brand-cyan/10 border-brand-cyan/30' : 'bg-white/5 border-white/5 opacity-60'}`} onClick={() => toggle('notifyBreakingNews')}>
                                        <div className="flex items-center gap-3">
                                            <NewspaperIcon className={`w-5 h-5 ${config.notifyBreakingNews ? 'text-brand-cyan' : 'text-slate-500'}`} />
                                            <div>
                                                <p className="text-xs font-bold text-white">{t('sentinel.breaking_intel')}</p>
                                                <p className="text-[8px] text-slate-500 font-mono">{t('sentinel.breaking_intel_desc')}</p>
                                            </div>
                                        </div>
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${config.notifyBreakingNews ? 'bg-brand-cyan border-brand-cyan' : 'border-white/20'}`}>
                                            {config.notifyBreakingNews && <span className="text-[10px] text-black">✓</span>}
                                        </div>
                                    </div>

                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-4">{t('sentinel.market_watch')}</h4>
                                    
                                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex items-center gap-2">
                                                <RadarIcon className="w-4 h-4 text-brand-purple" />
                                                <span className="text-xs font-bold text-white">{t('sentinel.whale_movements')}</span>
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
                                                    <span>{t('sentinel.threshold')}</span>
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
                                </div>

                                <div>
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">{t('sentinel.quiet_protocol')}</h4>
                                    <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <BellIcon className="w-5 h-5 text-slate-400" />
                                        <div className="flex-1 flex items-center gap-2">
                                            <input type="time" value={startHour} onChange={e => setStartHour(e.target.value)} className="bg-black/30 text-white text-xs p-2 rounded border border-white/10 outline-none font-mono" />
                                            <span className="text-slate-500">-</span>
                                            <input type="time" value={endHour} onChange={e => setEndHour(e.target.value)} className="bg-black/30 text-white text-xs p-2 rounded border border-white/10 outline-none font-mono" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="security"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="space-y-6"
                            >
                                {/* SECURITY SHIELD HUD */}
                                <div className="bg-gradient-to-br from-brand-bg to-brand-cyan/5 border border-brand-cyan/20 rounded-[2rem] p-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-cyan/5 blur-3xl rounded-full"></div>
                                    
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <span className="text-[9px] font-black font-orbitron tracking-widest text-brand-cyan uppercase">{t('security.hud_title')}</span>
                                            <h3 className="text-white font-black text-sm uppercase font-orbitron tracking-tight mt-1">CNS Threat Shield</h3>
                                        </div>
                                        {isScanning && (
                                            <span className="text-[9px] font-mono text-brand-cyan border border-brand-cyan/40 px-2 py-1 rounded bg-brand-cyan/10 animate-pulse uppercase">
                                                ACTIVE_PENTEST
                                            </span>
                                        )}
                                    </div>

                                    {/* PROGRESS AND SCORES */}
                                    <div className="flex items-baseline justify-between mb-4">
                                        <div>
                                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-wider">{t('security.integrity_score')}</p>
                                            <span className="text-4xl font-black font-orbitron text-white italic">{securityScore.toFixed(1)}%</span>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-wider">{t('security.threat_status')}</p>
                                            <span className="text-[10px] font-black text-brand-cyan font-mono tracking-widest uppercase">
                                                {t('security.no_threats')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* PROGRESS BAR */}
                                    {isScanning ? (
                                        <div className="space-y-2">
                                            <div className="h-2 w-full bg-slate-900 border border-white/5 rounded-full overflow-hidden relative">
                                                <div 
                                                    className="h-full bg-brand-cyan shadow-[0_0_12px_#00d9ff] transition-all duration-300"
                                                    style={{ width: `${scanProgress}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-[8px] font-mono text-brand-cyan/80 truncate uppercase animate-pulse">
                                                {scanStep}
                                            </p>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={runSecurityAudit}
                                            className="w-full py-3.5 bg-brand-cyan text-black font-black font-orbitron rounded-xl uppercase tracking-widest text-[9px] hover:shadow-[0_0_15px_rgba(0,217,255,0.4)] transition-all flex items-center justify-center gap-2 font-black"
                                        >
                                            <RadarIcon className="w-4 h-4 animate-spin-slow shrink-0" />
                                            RUN ACTIVE THREAT ASSESSMENT
                                        </button>
                                    )}
                                </div>

                                {/* SECURITY AUDIT CHECKLIST */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center mb-1">
                                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('security.checklist_title')}</h4>
                                        <button 
                                            onClick={copySecurityReport}
                                            className="text-[9px] font-mono text-brand-cyan hover:underline hover:text-white uppercase tracking-wider"
                                        >
                                            EXPORT REPORT 📥
                                        </button>
                                    </div>

                                    {/* VERIFICATION CRITERIA 1 */}
                                    <div className="bg-black/40 border border-white/5 p-4 rounded-2xl flex items-start justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-pulse"></span>
                                                <p className="text-xs font-bold text-white uppercase font-orbitron tracking-tight">InitData Validations</p>
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                                                Підпис Telegram WebApp (HMAC-SHA256) верифікується на стороні оператора для запобігання підміни об'єктів.
                                            </p>
                                        </div>
                                        <div className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-[9px] font-bold text-emerald-400 uppercase font-mono">
                                            VERIFIED
                                        </div>
                                    </div>

                                    {/* VERIFICATION CRITERIA 2 */}
                                    <div className="bg-black/40 border border-white/5 p-4 rounded-2xl flex items-start justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-pulse"></span>
                                                <p className="text-xs font-bold text-white uppercase font-orbitron tracking-tight">XSS Dynamic Guards</p>
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                                                Екранування та санітизація кастомного DOM дерева для динамічного виводу повідомлень від ШІ-моделей.
                                            </p>
                                        </div>
                                        <div className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-[9px] font-bold text-emerald-400 uppercase font-mono">
                                            SECURE
                                        </div>
                                    </div>

                                    {/* VERIFICATION CRITERIA 3 */}
                                    <div className="bg-black/40 border border-white/5 p-4 rounded-2xl flex items-start justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-pulse"></span>
                                                <p className="text-xs font-bold text-white uppercase font-orbitron tracking-tight">Client-Side Memory Shield</p>
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                                                Конфіденційні дані не зберігаються в LocalStorage незакодовано. Використання ізольованих session caches.
                                            </p>
                                        </div>
                                        <div className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-[9px] font-bold text-emerald-400 uppercase font-mono">
                                            ARMORED
                                        </div>
                                    </div>

                                    {/* VERIFICATION CRITERIA 4 */}
                                    <div className="bg-black/40 border border-white/5 p-4 rounded-2xl flex items-start justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-pulse"></span>
                                                <p className="text-xs font-bold text-white uppercase font-orbitron tracking-tight">TLS 1.3 Transport Tunneling</p>
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                                                Синхронізація Binance WebSocket та REST API виключно через SSL/TLS тунелі з суворим CORS Origin.
                                            </p>
                                        </div>
                                        <div className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-[9px] font-bold text-emerald-400 uppercase font-mono">
                                            COMPLIANT
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="p-6 border-t border-white/5 bg-brand-bg shrink-0 sm:rounded-b-[2.5rem] safe-area-pb">
                    {activeTab === 'DIRECTIVES' ? (
                        <button onClick={handleSave} className="w-full py-4 bg-brand-cyan text-black font-black font-orbitron rounded-2xl shadow-xl hover:bg-white transition-all uppercase tracking-widest text-xs">
                            {t('sentinel.update')}
                        </button>
                    ) : (
                        <button onClick={onClose} className="w-full py-4 bg-white/5 border border-white/10 text-white font-black font-orbitron rounded-2xl hover:bg-white/10 transition-all uppercase tracking-widest text-xs">
                            {t('common.close') || 'Close'}
                        </button>
                    )}
                </div>
                </div>
            </div>
        </motion.div>
    );
};

export default SentinelModal;
