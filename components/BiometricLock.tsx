
import React, { useState, useEffect } from 'react';
import { ShieldIcon, UserIcon } from './icons';
import { triggerHaptic } from '../utils/haptics';

interface BiometricLockProps {
    onUnlock: () => void;
}

const BiometricLock: React.FC<BiometricLockProps> = ({ onUnlock }) => {
    const [status, setStatus] = useState<'SCANNING' | 'SUCCESS' | 'FAILED'>('SCANNING');
    const [scanLinePos, setScanLinePos] = useState(0);

    useEffect(() => {
        // Scanning Animation Loop
        const interval = setInterval(() => {
            setScanLinePos(prev => (prev + 2) % 100);
        }, 20);

        // Simulation Logic
        const unlockTimer = setTimeout(() => {
            triggerHaptic('success');
            setStatus('SUCCESS');
            setTimeout(onUnlock, 1500); // Wait a bit to show success state
        }, 2500);

        return () => {
            clearInterval(interval);
            clearTimeout(unlockTimer);
        };
    }, [onUnlock]);

    return (
        <div className="fixed inset-0 z-[9999] bg-[#020617] flex flex-col items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-cyber-grid bg-[length:40px_40px] opacity-10"></div>
            
            {/* Radial Gradient Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-cyan/10 via-transparent to-transparent opacity-50"></div>

            <div className="relative z-10 flex flex-col items-center animate-zoom-in">
                {/* Scanner Visual */}
                <div className={`w-64 h-64 rounded-full border-4 flex items-center justify-center relative overflow-hidden transition-all duration-700 ${status === 'SUCCESS' ? 'border-green-500 bg-green-900/10 shadow-[0_0_50px_rgba(34,197,94,0.4)]' : 'border-brand-cyan bg-brand-cyan/5 shadow-[0_0_30px_rgba(0,240,255,0.2)]'}`}>
                    
                    {/* Face Silhouette */}
                    <UserIcon className={`w-32 h-32 transition-colors duration-500 ${status === 'SUCCESS' ? 'text-green-400' : 'text-brand-cyan/50'}`} />
                    
                    {/* Scanning Line */}
                    {status === 'SCANNING' && (
                        <div 
                            className="absolute left-0 right-0 h-1 bg-brand-cyan shadow-[0_0_20px_#00F0FF] opacity-80"
                            style={{ top: `${scanLinePos}%` }}
                        ></div>
                    )}

                    {/* Target Reticle */}
                    <div className="absolute inset-4 border border-dashed border-white/20 rounded-full animate-spin-slow duration-[10s]"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className={`w-48 h-48 border-2 border-transparent border-t-white/30 border-b-white/30 rounded-full ${status === 'SCANNING' ? 'animate-spin' : ''}`}></div>
                    </div>

                    {/* Success Pulse */}
                    {status === 'SUCCESS' && (
                        <div className="absolute inset-0 rounded-full border-4 border-green-500 animate-ping opacity-50"></div>
                    )}
                </div>

                <div className="mt-10 text-center space-y-3">
                    <h2 className={`font-orbitron text-2xl font-bold tracking-[0.2em] ${status === 'SUCCESS' ? 'text-green-500' : 'text-brand-cyan animate-pulse'}`}>
                        {status === 'SCANNING' ? 'RETINA SCANNING...' : 'ACCESS GRANTED'}
                    </h2>
                    <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">
                        {status === 'SCANNING' ? 'Aligning Neural Link...' : 'Welcome back, Operator'}
                    </p>
                </div>

                {/* Secure Badge */}
                <div className="absolute bottom-[-100px] flex items-center gap-2 text-slate-600 bg-black/40 px-4 py-2 rounded-full border border-white/5">
                    <ShieldIcon className="w-4 h-4" />
                    <span className="text-[10px] font-space-mono font-bold">STORK SECURITY PROTOCOL v5.0</span>
                </div>
            </div>
        </div>
    );
};

export default BiometricLock;
