
import React from 'react';
import { type NavItem } from '../types';
import { triggerHaptic } from '../utils/haptics';

interface BottomNavProps {
    items: { id: string; label: string; icon: React.ReactElement<{ className?: string }> }[];
    activeTab: NavItem;
    onTabChange: (tab: NavItem) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ items, activeTab, onTabChange }) => {

    const handleTabChange = (id: string) => {
        // Telegram Haptic Feedback
        // @ts-ignore
        if (window.Telegram?.WebApp?.HapticFeedback) {
            // @ts-ignore
            window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
        triggerHaptic('selection');
        onTabChange(id as NavItem);
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pb-4 px-4 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none">
            {/* Glass Capsule - Compact mobile design */}
            <nav className="bg-[#050b14]/90 backdrop-blur-2xl border border-white/10 rounded-3xl px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex items-center justify-around gap-1 w-full max-w-sm pointer-events-auto relative overflow-visible transition-all hover:border-brand-cyan/20">

                {/* Glow behind capsule */}
                <div className="absolute inset-0 rounded-3xl bg-brand-cyan/5 blur-xl -z-10"></div>

                {items.map(item => {
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => handleTabChange(item.id)}
                            className={`relative flex flex-col items-center justify-center group min-h-[48px] min-w-[48px] transition-all duration-300 ${isActive ? '-translate-y-1' : ''}`}
                        >
                            {/* Active Light Pillar */}
                            {isActive && (
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-6 h-10 bg-gradient-to-t from-brand-cyan/20 to-transparent blur-md pointer-events-none"></div>
                            )}

                            <div className={`relative z-10 transition-all duration-300 mb-1 ${isActive ? 'text-brand-cyan scale-110 drop-shadow-[0_0_8px_rgba(0,217,255,0.8)]' : 'text-slate-500 hover:text-slate-200'}`}>
                                {React.cloneElement(item.icon, {
                                    className: `w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.5]'}`
                                })}
                            </div>

                            {/* Text Label */}
                            <span className={`text-[10px] font-orbitron font-bold tracking-wider uppercase transition-all duration-300 ${isActive ? 'text-brand-cyan opacity-100' : 'text-slate-600 opacity-70 group-hover:text-slate-400'}`}>
                                {item.label}
                            </span>

                            {/* Dot Indicator */}
                            <div className={`absolute -bottom-1 w-1 h-1 rounded-full transition-all duration-300 ${isActive ? 'bg-brand-cyan scale-100 shadow-[0_0_5px_#00d9ff]' : 'bg-transparent scale-0'}`}></div>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};

export default BottomNav;
