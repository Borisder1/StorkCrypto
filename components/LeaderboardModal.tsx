import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useStore } from '../store';
import { ShieldIcon, ChevronRightIcon, ActivityIcon, RadarIcon } from './icons';
import { triggerHaptic } from '../utils/haptics';

interface LeaderboardEntry {
    id: string;
    rank: number;
    username: string;
    avatarUrl?: string;
    xp: number;
    storkBalance: number;
}

export const LeaderboardModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { userStats } = useStore();
    const [loading, setLoading] = useState(true);
    const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
    
    // In a real scenario, this would fetch from Supabase.
    // We are mocking this for the frontend prototype.
    useEffect(() => {
        const fetchLeaders = async () => {
            setLoading(true);
            try {
                // Mock network delay
                await new Promise(res => setTimeout(res, 800));
                
                // Mock data including current user
                const mockData: LeaderboardEntry[] = [
                    { id: '1', rank: 1, username: 'WhaleSniper', xp: 45000, storkBalance: 1200 },
                    { id: '2', rank: 2, username: 'CryptoNinja', xp: 32000, storkBalance: 850 },
                    { id: '3', rank: 3, username: '0xFlash', xp: 28500, storkBalance: 400 },
                    { id: '4', rank: 4, username: 'DataSiren', xp: 21000, storkBalance: 320 },
                    { 
                        id: userStats.id, 
                        rank: 42, 
                        username: userStats.username || userStats.firstName || 'You', 
                        avatarUrl: userStats.avatarUrl,
                        xp: userStats.xp, 
                        storkBalance: userStats.storkBalance 
                    }
                ];
                
                // Sort just in case
                setLeaders(mockData.sort((a, b) => b.xp - a.xp));
            } catch (err) {
                console.error("Failed to load leaderboard");
            } finally {
                setLoading(false);
            }
        };
        fetchLeaders();
    }, [userStats]);

    return (
        <motion.div 
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[150] bg-brand-bg flex flex-col h-[100dvh]"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 relative bg-brand-card/30">
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-purple/50 to-transparent"></div>
                <div>
                    <h2 className="text-xl font-black text-white font-orbitron tracking-widest flex items-center gap-2">
                        <ShieldIcon className="w-5 h-5 text-brand-purple" />
                        GLOBAL TOP
                    </h2>
                    <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mt-1">Operator Rankings</p>
                </div>
                <button 
                    onClick={() => { triggerHaptic('light'); onClose(); }}
                    className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                >
                    <ChevronRightIcon className="w-5 h-5 rotate-180" />
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24 no-scrollbar">
                {loading ? (
                    Array.from({length: 5}).map((_, i) => (
                        <div key={i} className="h-16 w-full bg-white/5 rounded-2xl animate-pulse"></div>
                    ))
                ) : (
                    leaders.map((user, idx) => {
                        const isCurrentUser = user.id === userStats.id;
                        return (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                key={user.id} 
                                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${isCurrentUser ? 'bg-brand-purple/10 border-brand-purple/50 shadow-[0_0_20px_rgba(139,92,246,0.15)]' : 'bg-brand-card/40 border-white/5'}`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black font-orbitron text-xs ${idx === 0 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' : idx === 1 ? 'bg-slate-300/20 text-slate-300 border border-slate-300/30' : idx === 2 ? 'bg-amber-700/20 text-amber-600 border border-amber-700/30' : 'bg-black/40 text-slate-500'}`}>
                                    {user.rank}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-bold text-white truncate font-orbitron">{user.username}</p>
                                        {isCurrentUser && <span className="px-1.5 py-0.5 bg-brand-purple text-white text-[8px] rounded uppercase font-black tracking-widest">You</span>}
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{user.storkBalance.toFixed(2)} STORK</p>
                                </div>
                                
                                <div className="text-right">
                                    <p className="text-sm font-black text-brand-cyan">{user.xp}</p>
                                    <p className="text-[8px] text-slate-500 uppercase tracking-widest font-mono">XP</p>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </motion.div>
    );
};

export default LeaderboardModal;
