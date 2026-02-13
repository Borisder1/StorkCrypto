
import React, { useEffect } from 'react';
import { useStore } from '../store';
import { triggerHaptic } from '../utils/haptics';

// THE HEARTBEAT ENGINE
// Simulates a living ecosystem by updating copy trading PnL and generating events.
const SimulationManager: React.FC = () => {
    const { copiedTraders, updateCopiedTraderPnL, showToast, settings } = useStore();

    useEffect(() => {
        if (!settings.isAuthenticated) return;

        // Interval for Trader PnL Updates (Every 8 seconds)
        const pnlInterval = setInterval(() => {
            if (copiedTraders.length === 0) return;

            // Pick a random trader
            const randomTraderIndex = Math.floor(Math.random() * copiedTraders.length);
            const trader = copiedTraders[randomTraderIndex];

            // Determine if this is a winning or losing update based on winRate
            const isWin = Math.random() * 100 < trader.winRate;
            
            // Generate PnL change (-1.5% to +3.5%)
            let change = 0;
            if (isWin) {
                change = Math.random() * 2.5 + 0.1; // +0.1% to +2.6%
            } else {
                change = -(Math.random() * 1.5 + 0.1); // -0.1% to -1.6%
            }

            // Apply Update
            // @ts-ignore
            updateCopiedTraderPnL(trader.id, change, isWin);

            // Occasional Toast for big moves (5% chance)
            if (Math.random() > 0.95) {
                const type = isWin ? 'PROFIT' : 'LOSS';
                const msg = `${trader.name}: ${type} DETECTED ${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
                showToast(msg);
                if (isWin) triggerHaptic('success');
            }

        }, 8000);

        return () => clearInterval(pnlInterval);
    }, [copiedTraders, settings.isAuthenticated]);

    return null; // Invisible component
};

export default SimulationManager;
