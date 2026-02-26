import React, { useEffect, useRef } from 'react';
import { useStore } from '../store';
import { triggerHaptic } from '../utils/haptics';

const SentinelSystem: React.FC = () => {
    const { userStats, marketPrices, showToast, grantXp, addWhaleTransaction } = useStore();
    const { sentinel } = userStats;
    const lastScanTime = useRef<number>(Date.now());

    // 🕵️ SENTINEL LOOP
    useEffect(() => {
        if (!sentinel.active) return;

        const checkInterval = setInterval(() => {
            const now = Date.now();

            // 🛑 QUIET HOURS CHECK
            if (sentinel.quietHoursStart && sentinel.quietHoursEnd) {
                const currentHour = new Date().getHours();
                const start = parseInt(sentinel.quietHoursStart.split(':')[0]);
                const end = parseInt(sentinel.quietHoursEnd.split(':')[0]);

                // Simple check: if start > end (e.g. 23:00 to 07:00), it implies overnight
                const isOvernight = start > end;
                const isQuiet = isOvernight
                    ? (currentHour >= start || currentHour < end)
                    : (currentHour >= start && currentHour < end);

                if (isQuiet) return; // Shhh... 🤫
            }

            // 🐋 WHALE TRACKING SIMULATION
            // We use real price volatility to simulate "Whale" moves
            if (sentinel.trackWhales && Object.keys(marketPrices).length > 0) {
                // Chance to detect a whale event based on market activity
                if (Math.random() > 0.90) { // 10% chance every 10s
                    const tickers = Object.keys(marketPrices);
                    const randomId = tickers[Math.floor(Math.random() * tickers.length)];
                    const asset = marketPrices[randomId];

                    if (asset) {
                        const isBuy = Math.random() > 0.5;
                        const amount = Math.floor(Math.random() * 50000) + 10000; // 10k - 60k
                        const valueUsd = amount * asset.usd;

                        // Only alert if value > threshold
                        if (valueUsd > sentinel.whaleThreshold) {
                            triggerHaptic('heavy');
                            showToast(`🐋 WHALE ALERT: ${isBuy ? 'Accumulation' : 'Dump'} on ${randomId.toUpperCase()}`);

                            addWhaleTransaction({
                                id: Math.random().toString(36).substr(2, 9),
                                asset: randomId.toUpperCase(),
                                amount,
                                valueUsd,
                                from: '0x' + Math.random().toString(16).substr(2, 6),
                                to: '0x' + Math.random().toString(16).substr(2, 6),
                                type: isBuy ? 'WHALE_ACCUMULATION' : 'EXCHANGE_INFLOW',
                                timestamp: new Date().toISOString(),
                                aiComment: `Sentinel Node detected unusual volume on ${randomId.toUpperCase()}.`
                            });
                        }
                    }
                }
            }

            // 🌾 AUTO-FARMING (XP)
            // Sentinel generates detailed market logs (XP) while active
            if (now - lastScanTime.current > 30000) { // Every 30s
                grantXp(5, 'Sentinel_Scan');
                lastScanTime.current = now;
            }

        }, 10000); // Main Loop Rate: 10s

        return () => clearInterval(checkInterval);
    }, [sentinel, marketPrices, showToast, grantXp, addWhaleTransaction]);

    return null; // Headless
};

export default SentinelSystem;
