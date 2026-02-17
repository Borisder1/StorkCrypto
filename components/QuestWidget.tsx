import React from 'react';
import { useStore } from '../store';
import { ShieldIcon, TrendingUpIcon, ActivityIcon } from './icons';
import { triggerHaptic } from '../utils/haptics';
import { getTranslation } from '../utils/translations';

const QuestWidget: React.FC = () => {
    const { quests, claimQuestReward, settings } = useStore();
    const t = (key: string) => getTranslation(settings?.language || 'en', key);

    const visibleQuests = quests.filter(q => !q.isClaimed || q.progress >= q.target).slice(0, 2);

    if (visibleQuests.length === 0) return (
        <div className="bg-brand-card/30 border border-brand-border rounded-[2rem] p-6 flex flex-col items-center justify-center min-h-[140px] text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-purple/50 to-transparent animate-[scanline_4s_linear_infinite]"></div>

            <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center mb-3 relative">
                <ShieldIcon className="w-6 h-6 text-slate-700" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-brand-purple rounded-full animate-ping"></div>
            </div>

            <h3 className="text-white font-black text-[10px] font-orbitron uppercase tracking-widest mb-1 text-glow">{t('missions.offline') || 'MISSIONS_OFFLINE'}</h3>
            <p className="text-slate-500 text-[8px] font-mono max-w-[180px]">
                {t('whale.awaiting') || 'System upgrading to V2 protocol. New objectives will be broadcasted shortly.'}
            </p>

            <div className="mt-3 px-3 py-1 rounded bg-brand-purple/10 border border-brand-purple/20 text-[7px] font-mono text-brand-purple flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-purple animate-pulse"></div>
                V2 COMING SOON
            </div>
        </div>
    );

    return (
        <div className="bg-brand-card/60 backdrop-blur-xl border border-brand-border rounded-[2rem] p-4 relative overflow-hidden group">
            <div className="absolute top-0 left-8 w-[1px] h-full bg-brand-cyan/5"></div>

            <div className="flex justify-between items-center mb-4 relative z-10">
                <div>
                    <h3 className="text-white font-black text-[10px] font-orbitron tracking-widest flex items-center gap-2 uppercase">
                        <ShieldIcon className="w-3 h-3 text-brand-purple" /> MISSIONS
                    </h3>
                </div>
                <div className="px-2 py-0.5 bg-black/40 border border-white/5 rounded text-[7px] font-mono text-slate-500">
                    NEXT_SYNC: 04:12:00
                </div>
            </div>

            <div className="space-y-3 relative z-10">
                {visibleQuests.map(quest => {
                    const isCompleted = quest.progress >= quest.target;
                    const percent = (quest.progress / quest.target) * 100;

                    return (
                        <div key={quest.id} className="relative group/q">
                            <div className="flex justify-between items-end mb-1.5">
                                <div className="flex items-start gap-2">
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border transition-all ${isCompleted ? 'bg-brand-green/20 border-brand-green text-brand-green' : 'bg-white/5 border-white/10 text-slate-500'}`}>
                                        <TrendingUpIcon className="w-3.5 h-3.5" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-200 font-black block leading-none">{quest.title}</span>
                                        <span className="text-[8px] text-brand-cyan font-mono mt-0.5 inline-block">+{quest.rewardXp} XP</span>
                                    </div>
                                </div>
                                {isCompleted ? (
                                    <button
                                        onClick={() => { triggerHaptic('success'); claimQuestReward(quest.id); }}
                                        className="px-2.5 py-1 bg-brand-cyan text-black text-[8px] font-black rounded-md shadow-[0_0_10px_var(--primary-color)] transition-all hover:scale-105 active:scale-95 uppercase font-orbitron"
                                    >
                                        CLAIM
                                    </button>
                                ) : (
                                    <span className="text-[9px] text-slate-500 font-mono font-bold">
                                        {quest.progress}/{quest.target}
                                    </span>
                                )}
                            </div>

                            <div className="h-0.5 w-full bg-slate-800 rounded-full overflow-hidden flex items-center">
                                <div
                                    className={`h-full transition-all duration-1000 ease-out ${isCompleted ? 'bg-brand-green' : 'bg-brand-purple'}`}
                                    style={{ width: `${percent}%` }}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default QuestWidget;