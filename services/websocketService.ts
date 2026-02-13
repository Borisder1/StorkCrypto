
import { AssetMetrics } from '../types';

// Base URL for Binance WebSocket
const BASE_WS_URL = 'wss://stream.binance.com:443/ws';

type PriceUpdateHandler = (data: Record<string, { price: number; change: number }>) => void;
type TradeHandler = (trade: any) => void;

class WebSocketService {
    private ws: WebSocket | null = null;
    private priceSubscribers: Set<PriceUpdateHandler> = new Set();
    private tradeSubscribers: Set<TradeHandler> = new Set();
    
    private isConnected: boolean = false;
    private retryCount: number = 0;
    private activeStreams: Set<string> = new Set();
    
    // Throttling for Tickers
    private lastUpdate: number = 0;
    private pendingData: Record<string, { price: number; change: number }> = {};
    private throttleInterval: number = 1000; 

    constructor() {
        if (typeof window !== 'undefined') {
            this.connect();
        }
    }

    private connect() {
        if (typeof WebSocket === 'undefined') return;

        try {
            this.ws = new WebSocket(BASE_WS_URL);

            this.ws.onopen = () => {
                console.log('[Stork WS] Connected');
                this.isConnected = true;
                this.retryCount = 0;
                
                // Restore default ticker stream
                this.subscribeToStream('!ticker@arr');
                
                // Restore other streams if reconnected
                this.activeStreams.forEach(stream => {
                    if (stream !== '!ticker@arr') this.sendMessage('SUBSCRIBE', [stream]);
                });
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    
                    // Handle AggTrade (Whale Tracking)
                    if (data.e === 'aggTrade') {
                        this.notifyTradeSubscribers(data);
                        return;
                    }

                    // Handle Ticker Array
                    if (Array.isArray(data)) {
                        this.handleTickerData(data);
                    }
                } catch (e) {}
            };

            this.ws.onclose = () => this.handleClose();
            this.ws.onerror = () => { if (this.ws?.readyState === WebSocket.OPEN) this.ws.close(); };

        } catch (e) {
            this.handleClose();
        }
    }

    private sendMessage(method: 'SUBSCRIBE' | 'UNSUBSCRIBE', params: string[]) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ method, params, id: Date.now() }));
        }
    }

    public subscribeToStream(streamName: string) {
        if (!this.activeStreams.has(streamName)) {
            this.activeStreams.add(streamName);
            this.sendMessage('SUBSCRIBE', [streamName]);
        }
    }

    public unsubscribeFromStream(streamName: string) {
        if (this.activeStreams.has(streamName)) {
            this.activeStreams.delete(streamName);
            this.sendMessage('UNSUBSCRIBE', [streamName]);
        }
    }

    private handleTickerData(data: any[]) {
        const now = Date.now();
        data.forEach((item: any) => {
            const symbol = item.s;
            if (symbol.endsWith('USDT')) {
                const ticker = symbol.replace('USDT', '');
                this.pendingData[ticker] = {
                    price: parseFloat(item.c),
                    change: parseFloat(item.P)
                };
            }
        });

        if (now - this.lastUpdate > this.throttleInterval) {
            this.notifyPriceSubscribers(this.pendingData);
            this.pendingData = {}; 
            this.lastUpdate = now;
        }
    }

    private handleClose() {
        this.isConnected = false;
        setTimeout(() => this.connect(), 5000);
    }

    private notifyPriceSubscribers(data: Record<string, { price: number; change: number }>) {
        if (Object.keys(data).length === 0) return;
        this.priceSubscribers.forEach(h => h(data));
    }

    private notifyTradeSubscribers(trade: any) {
        this.tradeSubscribers.forEach(h => h(trade));
    }

    public subscribe(handler: PriceUpdateHandler) {
        this.priceSubscribers.add(handler);
        return () => this.priceSubscribers.delete(handler);
    }

    public subscribeTrades(handler: TradeHandler) {
        this.tradeSubscribers.add(handler);
        // Automatically subscribe to major pairs for whale tracking
        ['btcusdt@aggTrade', 'ethusdt@aggTrade', 'solusdt@aggTrade'].forEach(s => this.subscribeToStream(s));
        
        return () => {
            this.tradeSubscribers.delete(handler);
            // Optional: Unsubscribe from streams if no listeners left, but keeping active for now is safer
        };
    }
}

export const binanceWS = new WebSocketService();
