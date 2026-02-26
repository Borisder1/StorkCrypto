import React from 'react';
import { useStore } from '../store';
import { UserIcon, TrendingUpIcon, ActivityIcon, ShieldIcon } from './icons';

export const SocialFeedWidget: React.FC = () => {
    const { socialFeed } = useStore();

    return (
        <div className="bg-brand-card/20 border border-brand-border/50 rounded-[2rem] p-5 mb-6 relative overflow-hidden group">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-black text-xs font-orbitron tracking-widest flex items-center gap-2">
                    <ActivityIcon className="w-4 h-4 text-brand-purple animate-pulse" /> SYNDICATE_PULSE
                </h3>
                <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-brand-green rounded-full animate-pulse"></span>
                    <span className="text-[8px] font-mono text-slate-500 uppercase">Live_Feed</span>
                </div>
            </div>

            <div className="space-y-4">
                {socialFeed.map(item => (
                    <div key={item.id} className="flex items-start gap-3 border-l-2 border-white/5 pl-3 py-1 hover:border-brand-purple/40 transition-all">
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                            <UserIcon className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-white">{item.userName}</span>
                                <span className="text-[8px] text-slate-600 font-mono">{item.timestamp}</span>
                            </div>
                            <p className="text-[9px] text-slate-400 font-mono mt-0.5 leading-tight">
                                {item.type === 'TRADE_PROFIT' && <span className="text-brand-green">Captured {item.value} on {item.asset}_PAIR</span>}
                                {item.type === 'TRADE_OPEN' && <span className="text-brand-cyan">Deployed Margin on {item.asset}</span>}
                                {item.type === 'RANK_UP' && <span className="text-brand-purple">Ascended to {item.value}</span>}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-brand-bg/80 to-transparent pointer-events-none"></div>
        </div>
    );
};