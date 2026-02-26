
import React from 'react';
import { ShieldIcon } from './icons';

const MaintenanceScreen: React.FC = () => {
    return (
        <div className="fixed inset-0 z-[9999] bg-[#020617] flex flex-col items-center justify-center p-6 text-center">
            <div className="absolute inset-0 bg-cyber-grid opacity-20 pointer-events-none"></div>
            
            <div className="relative z-10 animate-pulse">
                <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center border-2 border-yellow-500 mx-auto mb-6 shadow-[0_0_40px_rgba(234,179,8,0.3)]">
                    <ShieldIcon className="w-10 h-10 text-yellow-500" />
                </div>
                
                <h1 className="font-orbitron font-black text-3xl text-white mb-2 tracking-wider">SYSTEM UPDATE</h1>
                <p className="text-slate-400 font-mono text-sm max-w-xs mx-auto leading-relaxed">
                    The terminal is currently undergoing scheduled maintenance to upgrade neural pathways.
                </p>
                
                <div className="mt-8 flex justify-center">
                    <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500 animate-[scanline_2s_linear_infinite]"></div>
                    </div>
                </div>
                
                <p className="text-[10px] text-slate-600 mt-4 font-mono">ESTIMATED UPTIME: 30 MIN</p>
            </div>
        </div>
    );
};

export default MaintenanceScreen;
