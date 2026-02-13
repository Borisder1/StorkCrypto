
import React, { useState, useEffect } from 'react';
import { ShieldIcon } from './icons';

const OfflineIndicator: React.FC = () => {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [showRestored, setShowRestored] = useState(false);

    useEffect(() => {
        const handleOffline = () => setIsOffline(true);
        const handleOnline = () => {
            setIsOffline(false);
            setShowRestored(true);
            setTimeout(() => setShowRestored(false), 3000);
        };

        window.addEventListener('offline', handleOffline);
        window.addEventListener('online', handleOnline);

        return () => {
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('online', handleOnline);
        };
    }, []);

    if (isOffline) {
        return (
            <div className="fixed bottom-20 left-4 right-4 z-[100] animate-fade-in-up">
                <div className="bg-red-900/90 backdrop-blur-md border border-red-500 rounded-xl p-3 flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center animate-pulse">
                            <ShieldIcon className="w-4 h-4 text-red-500" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-xs">OFFLINE MODE</p>
                            <p className="text-[10px] text-red-200">Using cached data. Some features limited.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (showRestored) {
        return (
            <div className="fixed bottom-20 left-4 right-4 z-[100] animate-fade-in-up">
                <div className="bg-green-900/90 backdrop-blur-md border border-green-500 rounded-xl p-3 flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                            <ShieldIcon className="w-4 h-4 text-green-500" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-xs">ONLINE</p>
                            <p className="text-[10px] text-green-200">Connection restored. Syncing...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default OfflineIndicator;
