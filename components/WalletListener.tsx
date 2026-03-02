
import React, { useEffect } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { useStore } from '../store';
import { supabase } from '../services/supabaseClient';
import { toUserFriendlyAddress } from '@tonconnect/sdk';

const WalletListener: React.FC = () => {
    const [tonConnectUI] = useTonConnectUI();
    const { connectWallet, disconnectWallet, userStats, grantXp, showToast } = useStore();

    useEffect(() => {
        const unsubscribe = tonConnectUI.onStatusChange(async (wallet) => {
            if (wallet) {
                const rawAddress = wallet.account.address;
                const friendlyAddress = toUserFriendlyAddress(rawAddress, true); // User-friendly, bounceable
                const walletAppName = wallet.device.appName;

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
                    } else {
                        // Optional: Show toast only on fresh connection logic if needed
                    }
                }

                // 3. Grant XP if first time (Handled inside connectWallet store logic usually, but here for safety)
                // grantXp(100, 'Web3 Linked'); 

            } else {
                console.log("[TON Connect] Disconnected");
                disconnectWallet();
            }
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [tonConnectUI, userStats.id]);

    return null; // Invisible component
};

export default WalletListener;
