
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

    const handleClaim = () => {
        triggerHaptic('success');
        if (minedAmount < 0.1) {
            showToast('Accumulating... Wait for more tokens.');
            return;
        }
        claimMining();
        showToast(`Harvested ${minedAmount.toFixed(2)} $STORK`);
        setMinedAmount(0);
    };

    const handleTaskClick = (task: any) => {
        if (task.isCompleted) return;
        
        triggerHaptic('medium');
        
        if (task.icon === 'INVITE') {
            setShowReferral(true);
            return;
        }

        if (task.link) {
            window.open(task.link, '_blank');
            setTimeout(() => {
                completeAirdropTask(task.id);
            }, 5000); // 5 sec delay for verification simulation
        } else {
            completeAirdropTask(task.id);
        }
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
        <div className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-md flex flex-col items-center animate-fade-in overflow-hidden">
            
            {/* Header */}
            <div className="w-full p-6 border-b border-white/5 flex justify-between items-center bg-brand-card/50 relative z-10 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center">
                        <PickaxeIcon className="w-5 h-5 text-brand-cyan animate-pulse" />
                    </div>
                    <div>
                        <h2 className="font-orbitron font-black text-lg text-white uppercase tracking-widest">MINING_HUB</h2>
                        <p className="text-[9px] text-slate-500 font-mono">NEURAL_HASH: {mining.miningRate.toFixed(2)} / SEC</p>
                    </div>
                </div>
                <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors">✕</button>
            </div>

            <div className="flex-1 w-full max-w-lg overflow-y-auto custom-scrollbar p-6 space-y-8 relative z-0">
                
                {/* MINING MONITOR */}
                <div className="bg-brand-card/30 border border-brand-cyan/30 rounded-[2.5rem] p-8 text-center relative overflow-hidden shadow-[0_0_50px_rgba(0,217,255,0.1)]">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-cyan/50 to-transparent animate-[scanline_2s_linear_infinite]"></div>
                    
                    {/* Hash Visualizer */}
                    <div className="absolute top-4 right-4 text-right">
                        <ActivityIcon className="w-4 h-4 text-brand-cyan/50 animate-spin-slow ml-auto" />
                    </div>

                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mb-4">ACCUMULATED_ASSETS</p>
                    
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-5xl font-black text-white font-orbitron tabular-nums tracking-tighter drop-shadow-[0_0_15px_rgba(0,217,255,0.6)]">
                            {minedAmount.toFixed(4)}
                        </span>
                        <span className="text-sm font-bold text-brand-cyan mt-4">$STORK</span>
                    </div>

                    <div className="mb-6 flex justify-center">
                        <div className="bg-black/40 px-3 py-1 rounded border border-white/5">
                             <HashLog />
                        </div>
                    </div>

                    <div className="relative h-2 w-full bg-slate-800 rounded-full overflow-hidden mb-2">
                        <div 
                            className="h-full bg-gradient-to-r from-brand-cyan to-white shadow-[0_0_15px_#00d9ff] transition-all duration-1000 ease-linear"
                            style={{ width: `${progressPercent}%` }}
                        ></div>
                    </div>
                    <p className="text-[9px] text-slate-500 font-mono uppercase text-right">{formatTimeLeft()}</p>

                    <button 
                        onClick={handleClaim}
                        disabled={minedAmount < 0.1}
                        className={`mt-6 w-full py-4 rounded-2xl font-black font-orbitron uppercase tracking-widest text-xs transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 ${minedAmount >= 0.1 ? 'bg-brand-cyan text-black hover:bg-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                    >
                        <PickaxeIcon className="w-4 h-4" /> HARVEST TOKENS
                    </button>
                </div>

                {/* TOTAL BALANCE */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-between items-center">
                    <div>
                        <p className="text-[9px] text-slate-500 uppercase font-black">Total Balance</p>
                        <p className="text-xl font-black text-white font-mono">{userStats.storkBalance.toFixed(2)} $STORK</p>
                    </div>
                    <GiftIcon className="w-8 h-8 text-brand-purple opacity-50" />
                </div>

                {/* TASKS LIST */}
                <div>
                    <h3 className="text-white font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                        <ShieldIcon className="w-4 h-4 text-brand-purple" /> AIRDROP_PROTOCOL
                    </h3>
                    
                    <div className="space-y-3">
                        {tasks.map(task => (
                            <div 
                                key={task.id}
                                onClick={() => handleTaskClick(task)}
                                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${task.isCompleted ? 'bg-brand-green/10 border-brand-green/30 opacity-60' : 'bg-brand-card/40 border-white/5 hover:border-brand-purple/40 active:scale-[0.98] cursor-pointer'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${task.isCompleted ? 'border-brand-green bg-brand-green/20 text-brand-green' : 'border-white/10 bg-black/40 text-slate-400'}`}>
                                        {task.icon === 'TELEGRAM' && <TelegramIcon className="w-5 h-5" />}
                                        {task.icon === 'TWITTER' && <LinkIcon className="w-5 h-5" />}
                                        {task.icon === 'WALLET' && <ShieldIcon className="w-5 h-5" />}
                                        {task.icon === 'INVITE' && <GiftIcon className="w-5 h-5" />}
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
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AirdropModal;
