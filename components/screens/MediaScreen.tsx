import React, { useState } from 'react';
import { useStore } from '../../store';
import { BookIcon, SearchIcon, ChevronRightIcon, ShieldIcon } from '../icons';
import { triggerHaptic } from '../../utils/haptics';
import { AcademyTerm } from '../../types';
import { ChartPattern } from '../ChartPatterns';
import QuizModal from '../QuizModal';
import UpgradeBanner from '../UpgradeBanner';
import { TacticalBackground } from '../TacticalBackground';
import { ACADEMY_DATABASE } from '../MediaContent';

const MediaScreen: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
    const { settings } = useStore();
    const [filter, setFilter] = useState<'TECHNICAL' | 'PATTERNS' | 'PSYCHOLOGY'>('PATTERNS');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [activeQuizTerm, setActiveQuizTerm] = useState<AcademyTerm | null>(null);

    const currentContent = (ACADEMY_DATABASE && settings?.language) ? (ACADEMY_DATABASE[settings.language] || ACADEMY_DATABASE['en']) : [];

    const filteredItems = (currentContent || []).filter(item => {
        const matchesFilter = item.category === filter;
        const matchesSearch = item.term?.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="fixed inset-0 z-[110] bg-brand-bg flex flex-col overflow-hidden">
            <TacticalBackground />
            
            <div className="safe-area-pt bg-brand-card/90 backdrop-blur-2xl border-b border-white/10 px-6 py-5 flex items-center justify-between shrink-0 relative z-20">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => { triggerHaptic('light'); onClose?.(); }}
                        className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 active:scale-90 transition-all shadow-lg"
                    >
                        <ChevronRightIcon className="w-6 h-6 rotate-180" />
                    </button>
                    <div>
                        <h1 className="font-orbitron text-lg font-black text-white tracking-widest uppercase italic">Academy_V8</h1>
                        <p className="text-[8px] text-brand-purple font-mono uppercase">Neural_Learning: ACTIVE</p>
                    </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-brand-purple/10 border border-brand-purple/30 flex items-center justify-center text-brand-purple shadow-xl">
                    <BookIcon className="w-5 h-5" />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pt-6 pb-32 relative z-10">
                <UpgradeBanner />

                <div className="flex gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/5 mb-8 shadow-inner">
                    <button onClick={() => setFilter('PATTERNS')} className={`flex-1 py-3 rounded-xl text-[9px] font-black font-orbitron transition-all uppercase tracking-widest ${filter === 'PATTERNS' ? 'bg-brand-card text-brand-cyan shadow-xl' : 'text-slate-500'}`}>Patterns</button>
                    <button onClick={() => setFilter('TECHNICAL')} className={`flex-1 py-3 rounded-xl text-[9px] font-black font-orbitron transition-all uppercase tracking-widest ${filter === 'TECHNICAL' ? 'bg-brand-card text-brand-cyan shadow-xl' : 'text-slate-500'}`}>Technical</button>
                    <button onClick={() => setFilter('PSYCHOLOGY')} className={`flex-1 py-3 rounded-xl text-[9px] font-black font-orbitron transition-all uppercase tracking-widest ${filter === 'PSYCHOLOGY' ? 'bg-brand-card text-brand-cyan shadow-xl' : 'text-slate-500'}`}>Mindset</button>
                </div>

                <div className="relative mb-8">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <input 
                        type="text" 
                        placeholder="Search intel base..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-brand-card/30 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-brand-cyan transition-all font-space-mono text-xs shadow-inner"
                    />
                </div>

                <div className="space-y-4">
                    {filteredItems.map((item) => (
                        <div 
                            key={item.id} 
                            className={`bg-brand-card/60 border rounded-3xl overflow-hidden transition-all duration-300 ${expandedId === item.id ? 'border-brand-cyan shadow-[0_0_20px_rgba(0,217,255,0.1)]' : 'border-white/5 hover:border-brand-cyan/20'}`}
                            onClick={() => { triggerHaptic('selection'); setExpandedId(expandedId === item.id ? null : item.id); }}
                        >
                            <div className="p-5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${expandedId === item.id ? 'bg-brand-cyan/20 border-brand-cyan text-brand-cyan' : 'bg-white/5 border-white/10 text-slate-600'}`}>
                                        <ChevronRightIcon className={`w-5 h-5 transition-transform duration-300 ${expandedId === item.id ? 'rotate-90' : ''}`} />
                                    </div>
                                    <h4 className={`font-bold text-sm ${expandedId === item.id ? 'text-brand-cyan' : 'text-white'}`}>{item.term}</h4>
                                </div>
                                <span className="text-[9px] font-black text-brand-purple bg-brand-purple/10 px-2 py-1 rounded border border-brand-purple/20">+50 XP</span>
                            </div>

                            {expandedId === item.id && (
                                <div className="px-5 pb-6 animate-fade-in bg-black/20">
                                    <div className="h-[1px] w-full bg-white/5 mb-5"></div>
                                    {item.visualType && <div className="mb-6 rounded-2xl overflow-hidden border border-white/5"><ChartPattern type={item.visualType} /></div>}
                                    <p className="text-sm text-slate-300 font-space-mono leading-relaxed mb-6">{item.definition}</p>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setActiveQuizTerm(item); }}
                                        className="w-full py-4 bg-white text-black font-black font-orbitron rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 text-xs uppercase"
                                    >
                                        <ShieldIcon className="w-4 h-4" /> Start Drill
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {activeQuizTerm && <QuizModal term={activeQuizTerm} onClose={() => setActiveQuizTerm(null)} />}
        </div>
    );
};

export default MediaScreen;