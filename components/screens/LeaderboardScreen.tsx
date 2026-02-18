
import React, { useState, useEffect } from 'react';
import { useStore } from '../../store';
import { supabase } from '../../services/supabaseClient';
import { ShieldIcon, ActivityIcon, GlobeIcon, ZapIcon, UserIcon } from '../icons';
import { triggerHaptic } from '../../utils/haptics';
import UpgradeBanner from '../UpgradeBanner'; 
import EmptyState from '../EmptyState';

const RankPodium: React.FC<{ user: any, rank: number }> = ({ user, rank }) => {
    if (!user) return <div className="w-1/3 h-full"></div>;

    const height = rank === 1 ? 'h-48' : rank === 2 ? 'h-40' : 'h-32';
    const color = rank === 1 ? 'border-yellow-400 text-yellow-400 bg-yellow-400/10' : 
                  rank === 2 ? 'border-slate-300 text-slate-300 bg-slate-300/10' : 
                  'border-amber-600 text-amber-600 bg-amber-600/10';
    
    const glow = rank === 1 ? 'shadow-[0_0_30px_rgba(250,204,21,0.3)]' : '';

    return (
        <div className={`flex flex-col items-center justify-end ${height} w-1/3 px-1`}>
            <div className="flex flex-col items-center mb-2">
                <div className={`w-12 h-12 rounded-2xl border-2 ${color} flex items-center justify-center font-black text-lg font-orbitron mb-2 bg-[#020617] relative z-10`}>
                    {rank}
                </div>
                <p className="text-[10px] font-bold text-white truncate max-w-full text-center px-1">{user.first_name || 'Pilot'}</p>
                <p className={`text-[8px] font-mono ${rank === 1 ? 'text-yellow-400' : 'text-slate-500'}`}>{user.xp.toLocaleString()} XP</p>
            </div>
            <div className={`w-full h-full rounded-t-2xl border-t border-x ${color} ${glow} relative overflow-hidden`}>
                <div className={`absolute inset-0 opacity-20 ${color.replace('border-', 'bg-')}`}></div>
                <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-black to-transparent"></div>
            </div>
        </div>
    );
};

const LeaderboardScreen: React.FC = () => {
    const { userStats } = useStore();
    const [globalUsers, setGlobalUsers] = useState<any[]>([]);
    const [loadingRank, setLoadingRank] = useState(false);

    // FETCH REAL USERS FROM DB
    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoadingRank(true);
            try {
                // Fetch top 50 users by XP
                const { data, error } = await supabase
                    .from('profiles')
                    .select('id, username, first_name, xp, level, subscription_tier')
                    .order('xp', { ascending: false })
                    .limit(50);
                
                if (data) {
                    setGlobalUsers(data);
                }
            } catch (e) {
                console.error("Leaderboard fetch error", e);
            } finally {
                setLoadingRank(false);
            }
        };
        fetchLeaderboard();
    }, []);

    const topThree = [globalUsers[1], globalUsers[0], globalUsers[2]]; // 2nd, 1st, 3rd arrangement
    const restList = globalUsers.slice(3);

    return (
        <div className="p-4 md:p-6 pb-40 min-h-screen bg-brand-bg relative overflow-hidden flex flex-col">
            {/* Background FX */}
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-brand-cyan/5 blur-[100px] pointer-events-none"></div>
            <div className="absolute top-20 left-[-100px] w-[200px] h-[200px] bg-brand-purple/5 blur-[80px] pointer-events-none"></div>

            <div className="flex items-center justify-between mb-6 pt-4 relative z-10 shrink-0">
                <div>
                    <h1 className="font-orbitron text-2xl font-black text-white uppercase tracking-tighter">Leaderboard</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                        <p className="text-[10px] text-slate-500 font-space-mono uppercase">Global Pilot Rankings</p>
                    </div>
                </div>
                
                <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center">
                    <GlobeIcon className="w-5 h-5 text-brand-cyan" />
                </div>
            </div>

            <UpgradeBanner />

            {/* PODIUM SECTION */}
            <div className="relative mb-8 mt-4 shrink-0">
                <div className="flex items-end justify-center gap-2 relative z-10">
                    <RankPodium user={topThree[0]} rank={2} />
                    <RankPodium user={topThree[1]} rank={1} />
                    <RankPodium user={topThree[2]} rank={3} />
                </div>
                {/* Floor glow */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-10 bg-brand-cyan/10 blur-xl rounded-full pointer-events-none"></div>
            </div>

            {/* Current User Stats */}
            <div className="bg-brand-card border-y border-brand-cyan/20 p-3 mb-4 sticky top-0 z-20 backdrop-blur-md shadow-lg -mx-4 px-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-cyan text-black flex items-center justify-center font-bold text-xs">
                        ME
                    </div>
                    <div>
                        <p className="text-white font-bold text-xs uppercase">{userStats.firstName}</p>
                        <p className="text-[9px] text-slate-400 font-mono">{userStats.xp.toLocaleString()} XP</p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-[10px] text-brand-cyan font-black bg-brand-cyan/10 px-2 py-1 rounded">
                        LVL {userStats.level}
                    </span>
                </div>
            </div>

            {/* --- REST OF LIST --- */}
            <div className="flex-1 space-y-2 relative z-10 pb-10">
                {loadingRank ? (
                    <div className="py-20 text-center">
                        <div className="w-8 h-8 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-[10px] text-slate-500 font-mono">Syncing Neural Grid...</p>
                    </div>
                ) : globalUsers.length === 0 ? (
                    <EmptyState 
                        message="NO_PILOTS_FOUND" 
                        subMessage="No pilots found in sector. Be the first to claim the rank."
                        icon={<GlobeIcon className="w-6 h-6 text-slate-500 opacity-50" />}
                    />
                ) : (
                    restList.map((u, idx) => {
                        const isMe = u.id === userStats.id;
                        const isWhale = u.subscription_tier === 'WHALE';
                        const isPro = u.subscription_tier === 'PRO';
                        const realRank = idx + 4;

                        return (
                            <div key={u.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isMe ? 'bg-brand-cyan/10 border-brand-cyan/50 shadow-[0_0_15px_rgba(0,217,255,0.1)]' : 'bg-brand-card/40 border-white/5 hover:bg-white/5'}`}>
                                <div className="flex items-center gap-4">
                                    <div className="w-8 text-center font-mono text-slate-500 font-bold text-xs">
                                        #{realRank}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center text-slate-600">
                                            <UserIcon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className={`text-xs font-bold flex items-center gap-2 ${isMe ? 'text-brand-cyan' : 'text-white'}`}>
                                                {u.first_name || 'Anonymous'}
                                                {isWhale && <ZapIcon className="w-3 h-3 text-brand-purple" />}
                                                {isPro && <ActivityIcon className="w-3 h-3 text-brand-cyan" />}
                                            </p>
                                            <p className="text-[9px] text-slate-500 font-mono">Level {u.level || 1}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black font-mono text-white tracking-wide">{u.xp?.toLocaleString()}</p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default LeaderboardScreen;
