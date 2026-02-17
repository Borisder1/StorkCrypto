
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
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex justify-center w-full pointer-events-none">
            {/* Glass Capsule */}
            <nav className="bg-[#0a0f1e]/60 backdrop-blur-2xl border border-white/10 rounded-full px-6 py-3 shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex items-center gap-6 pointer-events-auto relative overflow-visible transition-all hover:border-white/20">
                
                {/* Glow behind capsule */}
                <div className="absolute inset-0 rounded-full bg-brand-cyan/5 blur-xl -z-10"></div>

                {items.map(item => {
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => handleTabChange(item.id)}
                            className="relative flex flex-col items-center justify-center group w-12"
                        >
                            {/* Active Light Pillar */}
                            {isActive && (
                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-8 h-12 bg-gradient-to-t from-brand-cyan/20 to-transparent blur-md"></div>
                            )}

                            <div className={`relative z-10 transition-all duration-300 ${isActive ? 'text-brand-cyan -translate-y-1 scale-110 drop-shadow-[0_0_8px_rgba(0,217,255,0.8)]' : 'text-slate-500 hover:text-slate-200 hover:scale-105'}`}>
                                {React.cloneElement(item.icon, { 
                                    className: `w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.5]'}` 
                                })}
                            </div>
                            
                            {/* Label */}
                            <span className={`text-[8px] font-orbitron mt-1 transition-all duration-300 whitespace-nowrap ${isActive ? 'text-brand-cyan opacity-100 translate-y-0' : 'text-slate-500 opacity-60 scale-90'}`}>
                                {item.label}
                            </span>
                            
                            {/* Dot Indicator */}
                            <div className={`absolute -bottom-2 w-1 h-1 rounded-full transition-all duration-300 ${isActive ? 'bg-brand-cyan scale-100 shadow-[0_0_5px_#00d9ff]' : 'bg-transparent scale-0'}`}></div>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};

export default BottomNav;
