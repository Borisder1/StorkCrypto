
import React, { useEffect, useRef } from 'react';
import { useStore } from '../store';
import { triggerHaptic } from '../utils/haptics';
import { getTranslation } from '../utils/translations';
import { binanceWS } from '../services/websocketService';
import { strategyMemoryService } from '../services/strategyMemoryService';
import { detectMarketRegime } from '../services/quantService';

// THE HEARTBEAT ENGINE
// Simulates a living ecosystem by updating copy trading PnL and generating events.
const SimulationManager: React.FC = () => {
    const { copiedTraders, updateCopiedTraderPnL, showToast, settings, updateMarketRegime } = useStore();
    const t = (key: string) => getTranslation(settings?.language || 'en', key);
    const lastEvaluationTime = useRef<number>(0);
    const priceHistory = useRef<number[]>(
        Array.from({ length: 25 }, (_, i) => 67000 + Math.sin(i / 3.5) * 600 + Math.random() * 200)
    );

    useEffect(() => {
        if (!settings.isAuthenticated) return;

        // Immediate default evaluation on boot to prevent UNKNOWN regime status
        detectMarketRegime(priceHistory.current).then(regime => {
            updateMarketRegime(regime);
        }).catch(console.error);

        // Subscribe to real-time prices for AI Strategy Memory evaluation
        const unsubscribeWS = binanceWS.subscribe((data) => {
            const now = Date.now();
            
            // Collect BTC price for market regime detection
            if (data['BTC']) {
                priceHistory.current.push(data['BTC'].price);
                if (priceHistory.current.length > 50) {
                    priceHistory.current.shift(); // Keep last 50 prices
                }
            }

            // Evaluate pending signals every 60 seconds
            if (now - lastEvaluationTime.current > 60000) {
                const currentPrices: Record<string, number> = {};
                Object.keys(data).forEach(ticker => {
                    currentPrices[ticker] = data[ticker].price;
                });
                
                if (Object.keys(currentPrices).length > 0) {
                    strategyMemoryService.evaluatePendingSignals(currentPrices).catch(console.error);
                    lastEvaluationTime.current = now;
                }

                // Update Market Regime
                if (priceHistory.current.length >= 20) {
                    detectMarketRegime(priceHistory.current).then(regime => {
                        updateMarketRegime(regime);
                    }).catch(console.error);
                }
            }
        });

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
                const type = isWin ? t('sim.profit') : t('sim.loss');
                const msg = `${trader.name}: ${type} ${t('sim.detected')} ${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
                showToast(msg);
                if (isWin) triggerHaptic('success');
            }

        }, 8000);

        return () => {
            clearInterval(pnlInterval);
            unsubscribeWS();
        };
    }, [copiedTraders, settings.isAuthenticated]);

    return null; // Invisible component
};

export default SimulationManager;
