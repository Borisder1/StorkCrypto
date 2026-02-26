
// Service to fetch real data from TON Blockchain via TONAPI.io
// Uses public endpoints (Rate Limited). Add 'Authorization: Bearer <KEY>' if needed.

const BASE_URL = 'https://tonapi.io/v2';

export interface JettonBalance {
    balance: string;
    wallet_address: {
        address: string;
        is_scam: boolean;
    };
    jetton: {
        address: string;
        name: string;
        symbol: string;
        decimals: number;
        image: string;
        verification: string;
    };
    price?: {
        prices: {
            USD: number;
        };
        diff_24h: {
            USD: string;
        };
    };
}

export const tonApiService = {
    async getNativeBalance(address: string): Promise<number> {
        try {
            const res = await fetch(`${BASE_URL}/accounts/${address}`);
            if (!res.ok) throw new Error('Failed to fetch balance');
            const data = await res.json();
            return parseInt(data.balance) / 1e9; // TON has 9 decimals
        } catch (e) {
            console.error('[TonAPI] Native Balance Error:', e);
            return 0;
        }
    },

    async getJettons(address: string): Promise<JettonBalance[]> {
        try {
            // Include supported_currencies to get prices directly if supported
            const res = await fetch(`${BASE_URL}/accounts/${address}/jettons?currencies=usd`);
            if (!res.ok) throw new Error('Failed to fetch jettons');
            const data = await res.json();
            return data.balances || [];
        } catch (e) {
            console.error('[TonAPI] Jettons Error:', e);
            return [];
        }
    },

    async getRealPortfolio(address: string) {
        const [tonBal, jettons] = await Promise.all([
            this.getNativeBalance(address),
            this.getJettons(address)
        ]);

        const assets = [];

        // 1. Add TON
        // Fetch TON Price manually if needed, or rely on internal app price service
        // For this service, we just return quantities and let the app price them, 
        // OR we use the price returned by TONAPI if available.
        assets.push({
            ticker: 'TON',
            name: 'Toncoin',
            amount: tonBal,
            decimals: 9,
            icon: 'https://ton.org/download/ton_symbol.png'
        });

        // 2. Add Jettons
        jettons.forEach(j => {
            const amount = parseInt(j.balance) / Math.pow(10, j.jetton.decimals);
            if (amount > 0) { // Only non-zero
                assets.push({
                    ticker: j.jetton.symbol,
                    name: j.jetton.name,
                    amount: amount,
                    decimals: j.jetton.decimals,
                    icon: j.jetton.image,
                    // If TONAPI provides price
                    usdPrice: j.price?.prices?.USD,
                    usdChange: j.price?.diff_24h?.USD
                });
            }
        });

        return assets;
    }
};
