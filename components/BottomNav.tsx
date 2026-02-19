
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
        triggerHaptic('selection');
        onTabChange(id as NavItem);
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pb-8 pt-4 px-4 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none">
            {/* Glass Capsule - Enhanced for mobile */}
            <nav className="bg-[#050b14]/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] px-8 py-5 shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex items-center justify-around gap-2 w-full max-w-md pointer-events-auto relative overflow-visible transition-all hover:border-brand-cyan/20">

                {/* Glow behind capsule - enhanced */}
                <div className="absolute inset-0 rounded-[2rem] bg-brand-cyan/5 blur-2xl -z-10"></div>

                {items.map(item => {
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => handleTabChange(item.id)}
                            className={`relative flex flex-col items-center justify-center group h-16 min-w-[60px] transition-all duration-300 ${isActive ? '-translate-y-2' : ''}`}
                        >
                            {/* Active Light Pillar */}
                            {isActive && (
                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-10 h-14 bg-gradient-to-t from-brand-cyan/20 to-transparent blur-lg pointer-events-none"></div>
                            )}

                            <div className={`relative z-10 transition-all duration-300 mb-2 ${isActive ? 'text-brand-cyan scale-125 drop-shadow-[0_0_10px_rgba(0,217,255,0.8)]' : 'text-slate-500 hover:text-slate-200'}`}>
                                {React.cloneElement(item.icon, {
                                    className: `w-7 h-7 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.5]'}`
                                })}
                            </div>

                            {/* Text Label - larger font */}
                            <span className={`text-[12px] sm:text-[14px] font-orbitron font-bold tracking-widest uppercase transition-all duration-300 ${isActive ? 'text-brand-cyan opacity-100 scale-105' : 'text-slate-600 opacity-60 group-hover:text-slate-400'}`}>
                                {item.label}
                            </span>

                            {/* Dot Indicator */}
                            <div className={`absolute -bottom-3 w-1.5 h-1.5 rounded-full transition-all duration-300 ${isActive ? 'bg-brand-cyan scale-100 shadow-[0_0_10px_#00d9ff]' : 'bg-transparent scale-0'}`}></div>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};

export default BottomNav;
