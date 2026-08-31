
import React, { useEffect } from 'react';
import { useStore } from '../store';
import { supabase } from '../services/supabaseClient';
import { toUserFriendlyAddress } from '@tonconnect/sdk';
import { getTonConnectUI } from '../services/tonConnectService';

const WalletListener: React.FC = () => {
    const { connectWallet, disconnectWallet, userStats, wallet } = useStore();

    useEffect(() => {
        try {
            const tonConnectUI = getTonConnectUI();
            if (!tonConnectUI) return;

            const unsubscribe = tonConnectUI.onStatusChange(async (connectedWallet) => {
                try {
                    if (connectedWallet) {
                        const rawAddress = connectedWallet.account.address;
                        const friendlyAddress = toUserFriendlyAddress(rawAddress, true);
                        const walletAppName = connectedWallet.device?.appName || 'TON Wallet';

                        console.log("[TON Connect] Connected:", friendlyAddress);

                        // 1. Update Zustand Store
                        await connectWallet(friendlyAddress, walletAppName, 'TON');

                        // 2. Sync with Supabase
                        if (userStats?.id) {
                            const { error } = await supabase
                                .from('profiles')
                                .update({ 
                                    wallet_address: friendlyAddress,
                                    last_active: new Date().toISOString()
                                })
                                .eq('id', userStats.id);
                            
                            if (error) {
                                console.error("[Supabase] Wallet sync failed:", error);
                            }
                        }
                    } else {
                        console.log("[TON Connect] Disconnected status received");
                        disconnectWallet();
                    }
                } catch (err) {
                    console.warn('[TON Connect] Status change handling error:', err);
                }
            });

            return () => {
                try {
                    if (unsubscribe) unsubscribe();
                } catch (e) {}
            };
        } catch (e) {
            console.warn('[WalletListener] Init error suppressed:', e);
        }
    }, [userStats?.id, connectWallet, disconnectWallet]);

    // Synchronize Store -> TON Connect UI SDK disconnect
    useEffect(() => {
        try {
            const tonConnectUI = getTonConnectUI();
            if (!tonConnectUI) return;

            if (!wallet.isConnected && tonConnectUI.connected) {
                console.log("[WalletListener] Store disconnected, clearing TON Connect UI SDK session...");
                tonConnectUI.disconnect().catch(err => console.error("[TON Connect] Disconnect error:", err));
            }
        } catch (e) {}
    }, [wallet.isConnected]);

    return null; // Invisible component
};

export default WalletListener;

