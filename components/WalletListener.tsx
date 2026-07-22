
import React, { useEffect } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { useStore } from '../store';
import { supabase } from '../services/supabaseClient';
import { toUserFriendlyAddress } from '@tonconnect/sdk';

const WalletListener: React.FC = () => {
    const [tonConnectUI] = useTonConnectUI();
    const { connectWallet, disconnectWallet, userStats, wallet } = useStore();

    useEffect(() => {
        const unsubscribe = tonConnectUI.onStatusChange(async (connectedWallet) => {
            if (connectedWallet) {
                const rawAddress = connectedWallet.account.address;
                const friendlyAddress = toUserFriendlyAddress(rawAddress, true); // User-friendly, bounceable
                const walletAppName = connectedWallet.device.appName || 'TON Wallet';

                console.log("[TON Connect] Connected:", friendlyAddress);

                // 1. Update Zustand Store
                await connectWallet(friendlyAddress, walletAppName, 'TON');

                // 2. Sync with Supabase
                if (userStats.id) {
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
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [tonConnectUI, userStats.id]);

    // Synchronize Store -> TON Connect UI SDK disconnect
    useEffect(() => {
        if (!wallet.isConnected && tonConnectUI.connected) {
            console.log("[WalletListener] Store disconnected, clearing TON Connect UI SDK session...");
            tonConnectUI.disconnect().catch(err => console.error("[TON Connect] Disconnect error:", err));
        }
    }, [wallet.isConnected, tonConnectUI]);

    return null; // Invisible component
};

export default WalletListener;
