
import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { PickaxeIcon, TimerIcon, GiftIcon, ShieldIcon, TelegramIcon, LinkIcon, ChevronRightIcon, ActivityIcon } from './icons';
import { triggerHaptic } from '../utils/haptics';
import { getTranslation } from '../utils/translations';

interface AirdropModalProps {
    onClose: () => void;
}

const HashLog: React.FC = () => {
    const [hashes, setHashes] = useState<string[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            const hash = '0x' + Math.random().toString(16).substr(2, 8) + '...';
            setHashes(prev => [hash, ...prev].slice(0, 5));
        }, 300);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="font-mono text-[8px] text-green-500/60 leading-tight h-16 overflow-hidden flex flex-col-reverse">
            {hashes.map((h, i) => (
                <div key={i} className="opacity-70">&gt; MINING_BLOCK: {h} [OK]</div>
            ))}
        </div>
    );
};

const AirdropModal: React.FC<AirdropModalProps> = ({ onClose }) => {
    const { userStats, claimMining, completeAirdropTask, settings, showToast, setShowReferral } = useStore();
    const t = (key: string) => getTranslation(settings.language, key);

    const [currentTime, setCurrentTime] = useState(Date.now());
    const [minedAmount, setMinedAmount] = useState(0);
    const [progressPercent, setProgressPercent] = useState(0);
    const [isClaiming, setIsClaiming] = useState(false);
    const [isShaking, setIsShaking] = useState(false);
    const [verifyingTaskId, setVerifyingTaskId] = useState<string | null>(null);

    const mining = userStats.mining;
    const tasks = userStats.tasks;

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(Date.now());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!mining) return;

        const lastClaim = new Date(mining.lastClaimTime).getTime();
        const diffSeconds = (currentTime - lastClaim) / 1000;
        const maxSeconds = mining.storageCapacity * 3600;

        const effectiveSeconds = Math.min(diffSeconds, maxSeconds);
        const earned = effectiveSeconds * mining.miningRate;

        setMinedAmount(earned);
        setProgressPercent((effectiveSeconds / maxSeconds) * 100);
    }, [currentTime, mining]);

    const handleClaim = async () => {
        if (minedAmount < 0.1) {
            triggerHaptic('error');
            showToast('Accumulating... Wait for more tokens.');
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 600);
            return;
        }

        triggerHaptic('success');
        setIsClaiming(true);
        // Simulate network delay for better UX
        await new Promise(resolve => setTimeout(resolve, 1500));

        claimMining();
        showToast(`Harvested ${minedAmount.toFixed(2)} $STORK`);
        setMinedAmount(0);
        setIsClaiming(false);
    };

    const handleTaskClick = (task: any) => {
        if (task.isCompleted || verifyingTaskId) return;

        triggerHaptic('medium');

        if (task.icon === 'INVITE') {
            setShowReferral(true);
            return;
        }

        setVerifyingTaskId(task.id);
        showToast('Verifying Task...');

        if (task.link) {
            // Use Telegram WebApp for better integration if available
            if (window.Telegram?.WebApp) {
                (window.Telegram.WebApp as any).openLink(task.link);
            } else {
                window.open(task.link, '_blank');
            }
        }

        // Simulate verification delay
        setTimeout(() => {
            completeAirdropTask(task.id);
            showToast('Task Verified');
            setVerifyingTaskId(null);
        }, 3000);
    };

    const formatTimeLeft = () => {
        const lastClaim = new Date(mining.lastClaimTime).getTime();
        const elapsed = currentTime - lastClaim;
        const maxTime = mining.storageCapacity * 3600 * 1000;
        const remaining = maxTime - elapsed;

        if (remaining <= 0) return "STORAGE FULL";

        const h = Math.floor(remaining / (1000 * 60 * 60));
        const m = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        return `${h}h ${m}m to fill`;
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/60 backdrop-blur-md animate-fade-in">
            <style>{`
                @keyframes harvestShake {
                    0%, 100% { transform: translateX(0); }
                    20% { transform: translateX(-6px); }
                    40% { transform: translateX(6px); }
                    60% { transform: translateX(-4px); }
                    80% { transform: translateX(4px); }
                }
                .harvest-shake { animation: harvestShake 0.5s ease-in-out; }
            `}</style>
            <div className="glass-panel w-full sm:max-w-md h-full sm:h-[85vh] border-t sm:border border-white/10 rounded-t-[3rem] sm:rounded-[3rem] overflow-hidden flex flex-col shadow-2xl box-glow">

                {/* Header */}
                <div className="w-full p-6 border-b border-white/5 flex justify-between items-center bg-white/5 relative z-10 shrink-0 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center box-glow">
                            <PickaxeIcon className="w-5 h-5 text-brand-cyan animate-pulse text-glow" />
                        </div>
                        <div>
                            <h2 className="font-orbitron font-black text-lg text-white uppercase tracking-widest text-glow">MINING_HUB</h2>
                            <p className="text-[10px] text-slate-400 font-inter tracking-wider">NEURAL_HASH: {mining.miningRate.toFixed(2)} / SEC</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/20">✕</button>
                </div>

                <div className="flex-1 w-full overflow-y-auto custom-scrollbar p-6 space-y-8 relative z-0">

                    {/* MINING MONITOR */}
                    <div className="glass-panel border border-brand-cyan/30 rounded-[2.5rem] p-8 text-center relative overflow-hidden shadow-[0_0_30px_rgba(0,217,255,0.1)] group hover:shadow-[0_0_50px_rgba(0,217,255,0.2)] transition-shadow duration-500">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-cyan/50 to-transparent animate-[scanline_3s_linear_infinite]"></div>

                        {/* Hash Visualizer */}
                        <div className="absolute top-4 right-4 text-right">
                            <ActivityIcon className="w-4 h-4 text-brand-cyan/50 animate-spin-slow ml-auto" />
                        </div>

                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mb-4 font-orbitron">ACCUMULATED_ASSETS</p>

                        <div className="flex items-center justify-center gap-2 mb-2">
                            <span className="text-5xl font-black text-white font-orbitron tabular-nums tracking-tighter drop-shadow-[0_0_15px_rgba(0,217,255,0.6)] text-glow">
                                {minedAmount.toFixed(4)}
                            </span>
                            <span className="text-sm font-bold text-brand-cyan mt-4 font-inter">$STORK</span>
                        </div>

                        <div className="mb-6 flex justify-center">
                            <div className="bg-black/40 px-3 py-1 rounded border border-white/5 backdrop-blur-sm">
                                <HashLog />
                            </div>
                        </div>

                        <div className="relative h-2 w-full bg-slate-800/50 rounded-full overflow-hidden mb-2 border border-white/5">
                            <div
                                className="h-full bg-gradient-to-r from-brand-cyan to-white shadow-[0_0_15px_#00d9ff] transition-all duration-1000 ease-linear relative"
                                style={{ width: `${progressPercent}%` }}
                            >
                                <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                            </div>
                        </div>
                        <p className="text-[9px] text-slate-500 font-inter uppercase text-right tracking-wider">{formatTimeLeft()}</p>

                        <button
                            onClick={handleClaim}
                            disabled={isClaiming}
                            className={`mt-6 w-full py-4 rounded-2xl font-black font-orbitron uppercase tracking-widest text-xs transition-all shadow-xl active:scale-90 active:shadow-none flex items-center justify-center gap-2 relative overflow-hidden ${isShaking ? 'harvest-shake' : ''} ${minedAmount >= 0.1 ? 'bg-brand-cyan text-black hover:bg-white box-glow active:bg-brand-cyan/80' : 'bg-slate-800/50 text-slate-500 border border-white/5 cursor-not-allowed hover:bg-slate-800/70'}`}
                        >
                            {isClaiming ? (
                                <>
                                    <ActivityIcon className="w-4 h-4 animate-spin" /> PROCESSING...
                                </>
                            ) : (
                                <>
                                    <PickaxeIcon className="w-4 h-4" /> HARVEST TOKENS
                                </>
                            )}
                        </button>
                    </div>

                    {/* UPGRADE SYSTEM */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => useStore.getState().upgradeMining('RATE')}
                            className="bg-black/40 border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-white/5 active:scale-95 transition-all group"
                        >
                            <div className="w-8 h-8 rounded-full bg-brand-cyan/20 flex items-center justify-center border border-brand-cyan/50 group-hover:shadow-[0_0_15px_#00d9ff]">
                                <PickaxeIcon className="w-4 h-4 text-brand-cyan" />
                            </div>
                            <div className="text-center">
                                <span className="text-[9px] font-black text-white uppercase block">Turbo Mode</span>
                                <span className="text-[8px] font-mono text-brand-cyan">500 $STORK</span>
                            </div>
                        </button>

                        <button
                            onClick={() => useStore.getState().upgradeMining('STORAGE')}
                            className="bg-black/40 border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-white/5 active:scale-95 transition-all group"
                        >
                            <div className="w-8 h-8 rounded-full bg-brand-purple/20 flex items-center justify-center border border-brand-purple/50 group-hover:shadow-[0_0_15px_#8b5cf6]">
                                <ShieldIcon className="w-4 h-4 text-brand-purple" />
                            </div>
                            <div className="text-center">
                                <span className="text-[9px] font-black text-white uppercase block">Deep Storage</span>
                                <span className="text-[8px] font-mono text-brand-purple">300 $STORK</span>
                            </div>
                        </button>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-between items-center hover:bg-white/10 transition-colors duration-300">
                        <div>
                            <p className="text-[9px] text-slate-500 uppercase font-black font-inter tracking-wider">Total Balance</p>
                            <p className="text-xl font-black text-white font-mono tracking-tight">{userStats.storkBalance.toFixed(2)} $STORK</p>
                        </div>
                        <GiftIcon className="w-8 h-8 text-brand-purple opacity-50 drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
                    </div>

                    {/* TASKS LIST */}
                    <div>
                        <h3 className="text-white font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2 font-orbitron">
                            <ShieldIcon className="w-4 h-4 text-brand-purple text-glow" /> AIRDROP_PROTOCOL
                        </h3>

                        <div className="space-y-3">
                            {tasks.length === 0 ? (
                                <div className="bg-brand-card/30 border border-brand-border rounded-[2rem] p-6 flex flex-col items-center justify-center min-h-[140px] text-center relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none"></div>
                                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-purple/50 to-transparent animate-[scanline_4s_linear_infinite]"></div>

                                    <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center mb-3 relative">
                                        <ShieldIcon className="w-6 h-6 text-slate-700" />
                                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-brand-purple rounded-full animate-ping"></div>
                                    </div>

                                    <h3 className="text-white font-black text-[10px] font-orbitron uppercase tracking-widest mb-1 text-glow">NO_TASKS_AVAILABLE</h3>
                                    <p className="text-slate-500 text-[8px] font-mono max-w-[180px]">
                                        All protocols executed. Stand by for new directives from command.
                                    </p>
                                </div>
                            ) : (
                                tasks.map(task => (
                                    <div
                                        key={task.id}
                                        onClick={() => handleTaskClick(task)}
                                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 ${task.isCompleted ? 'bg-brand-green/10 border-brand-green/30 opacity-60' : verifyingTaskId === task.id ? 'bg-brand-cyan/10 border-brand-cyan/50 animate-pulse' : 'bg-white/5 border-white/5 hover:border-brand-purple/40 hover:bg-white/10 active:scale-[0.95] active:bg-brand-purple/20 cursor-pointer'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors duration-300 ${task.isCompleted ? 'border-brand-green bg-brand-green/20 text-brand-green' : verifyingTaskId === task.id ? 'border-brand-cyan bg-brand-cyan/20 text-brand-cyan' : 'border-white/10 bg-black/40 text-slate-400'}`}>
                                                {verifyingTaskId === task.id ? (
                                                    <ActivityIcon className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <>
                                                        {task.icon === 'TELEGRAM' && <TelegramIcon className="w-5 h-5" />}
                                                        {task.icon === 'TWITTER' && <LinkIcon className="w-5 h-5" />}
                                                        {task.icon === 'WALLET' && <ShieldIcon className="w-5 h-5" />}
                                                        {task.icon === 'INVITE' && <GiftIcon className="w-5 h-5" />}
                                                    </>
                                                )}
                                            </div>
                                            <div>
                                                <p className={`text-xs font-bold ${task.isCompleted ? 'text-brand-green line-through' : 'text-white'}`}>{task.title}</p>
                                                <p className="text-[9px] text-brand-purple font-mono font-bold">+{task.reward} $STORK</p>
                                            </div>
                                        </div>
                                        {task.isCompleted ? (
                                            <span className="text-[9px] font-black text-brand-green uppercase bg-brand-green/10 px-2 py-1 rounded">DONE</span>
                                        ) : (
                                            <ChevronRightIcon className="w-4 h-4 text-slate-600" />
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AirdropModal;
