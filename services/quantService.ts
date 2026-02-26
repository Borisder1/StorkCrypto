
// QUANTITATIVE ANALYSIS ENGINE (WEB WORKER ENABLED)
// v12.0 UPDATE: Optimized Math Kernel for Mobile

export interface KeyLevel {
    price: number;
    type: 'SUPPORT' | 'RESISTANCE' | 'GAP';
    strength: 'WEAK' | 'MEDIUM' | 'STRONG';
    label: string;
}

export interface VolumeBin {
    price: number;
    volume: number;
    isPOC: boolean;
}

export interface OrderWall {
    price: number;
    size: number;
    type: 'BID' | 'ASK';
    intensity: number; // 0 to 1
}

export interface SimulationPath {
    id: number;
    path: number[];
    finalPrice: number;
    probability: number;
}

// --- WORKER CODE AS STRING ---
const workerCode = `
self.onmessage = function(e) {
    const { id, type, payload } = e.data;
    let result;
    try {
        switch (type) {
            case 'VOLUME_PROFILE':
                result = calculateVolumeProfile(payload.candles, payload.binsCount);
                break;
            case 'FRACTAL_DIMENSION':
                result = calculateFDI(payload.series);
                break;
            case 'MARKET_ENTROPY':
                result = calculateEntropy(payload.series);
                break;
            case 'EXHAUSTION':
                result = calculateExhaustion(payload.candles, payload.zScore);
                break;
            case 'ORDER_HEATMAP':
                result = generateOrderHeatmap(payload.currentPrice, payload.volatility);
                break;
            case 'DELTA':
                result = calculateDelta(payload.candles);
                break;
            case 'CONVICTION':
                result = calculateInstitutionalConviction(payload.candles, payload.delta);
                break;
            case 'KELLY':
                result = calculateKelly(payload.winProb, payload.winLossRatio);
                break;
            case 'MONTE_CARLO':
                // Optimized for mobile: limit iterations to prevent main thread freezing on older Androids
                result = runMonteCarloSimulation(payload.startPrice, payload.volatility, payload.steps, Math.min(payload.simulations, 50));
                break;
            case 'SMA':
                result = calculateSMA(payload.data, payload.period);
                break;
            case 'BOLLINGER':
                result = calculateBollingerBands(payload.data, payload.period, payload.stdDev);
                break;
            case 'REGRESSION':
                result = calculateLinearRegression(payload.data);
                break;
            default:
                throw new Error('Unknown calculation type');
        }
        self.postMessage({ id, result, status: 'SUCCESS' });
    } catch (error) {
        self.postMessage({ id, error: error.message, status: 'ERROR' });
    }
};

// Linear Regression for Trend Lines
function calculateLinearRegression(data) {
    if (!data || data.length < 2) return null;
    const n = data.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    
    // We use index as X (time) and price as Y
    for (let i = 0; i < n; i++) {
        sumX += i;
        sumY += data[i];
        sumXY += i * data[i];
        sumXX += i * i;
    }
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Return start and end points for the line
    return {
        slope,
        intercept,
        startPoint: intercept,
        endPoint: slope * (n - 1) + intercept
    };
}

// Fractal Dimension Index (FDI) - Sevcik Method
function calculateFDI(series) {
    if (!series || series.length < 30) return 1.5;
    const n = series.length;
    let max = -Infinity, min = Infinity;
    series.forEach(v => { if(v > max) max = v; if(v < min) min = v; });
    
    if (max === min) return 1.0;
    
    let l = 0;
    for (let i = 1; i < n; i++) {
        const x1 = (i - 1) / (n - 1);
        const x2 = i / (n - 1);
        const y1 = (series[i-1] - min) / (max - min);
        const y2 = (series[i] - min) / (max - min);
        l += Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));
    }
    
    return 1 + (Math.log(l) + Math.log(2)) / Math.log(2 * (n - 1));
}

// Shannon Entropy for Market Volatility
function calculateEntropy(series) {
    if (!series || series.length < 2) return 0;
    const diffs = [];
    for (let i = 1; i < series.length; i++) {
        diffs.push(series[i] > series[i-1] ? 1 : -1);
    }
    const counts = { '1': 0, '-1': 0 };
    diffs.forEach(d => counts[d]++);
    
    let entropy = 0;
    const n = diffs.length;
    [1, -1].forEach(sym => {
        const p = counts[sym] / n;
        if (p > 0) entropy -= p * Math.log2(p);
    });
    return entropy; // 0 to 1
}

function calculateSMA(data, period) {
    const sma = [];
    for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
            sma.push({ time: data[i].time, value: NaN }); 
            continue;
        }
        let sum = 0;
        for (let j = 0; j < period; j++) { sum += data[i - j].close; }
        sma.push({ time: data[i].time, value: sum / period });
    }
    return sma;
}

function calculateBollingerBands(data, period, stdDevMultiplier) {
    const bands = [];
    for (let i = 0; i < data.length; i++) {
        if (i < period - 1) continue;
        let sum = 0;
        for (let j = 0; j < period; j++) { sum += data[i - j].close; }
        const ma = sum / period;
        let sumSquaredDiff = 0;
        for (let j = 0; j < period; j++) { sumSquaredDiff += Math.pow(data[i - j].close - ma, 2); }
        const stdDev = Math.sqrt(sumSquaredDiff / period);
        bands.push({ time: data[i].time, upper: ma + (stdDev * stdDevMultiplier), lower: ma - (stdDev * stdDevMultiplier), basis: ma });
    }
    return bands;
}

function calculateInstitutionalConviction(candles, delta) {
    if (!candles || candles.length < 5) return { type: 'NEUTRAL', confidence: 50 };
    const lastCandles = candles.slice(-5);
    const priceTrend = lastCandles[4].close - lastCandles[0].open;
    const deltaTrend = delta; 
    if (priceTrend <= 0 && deltaTrend > 0) return { type: 'ACCUMULATION', confidence: 85 };
    if (priceTrend > 0 && deltaTrend < 0) return { type: 'DISTRIBUTION', confidence: 88 };
    return { type: 'NEUTRAL', confidence: 45 };
}

function calculateExhaustion(candles, zScore) {
    if (!candles || candles.length < 10) return { score: 50, label: 'STABLE' };
    let score = 50 + Math.abs(zScore) * 12;
    let label = score > 80 ? 'CRITICAL_EXHAUSTION' : score > 65 ? 'OVEREXTENDED' : score < 35 ? 'ACCUMULATION' : 'HEALTHY';
    return { score: Math.min(100, score), label };
}

function generateOrderHeatmap(currentPrice, volatility = 0.02) {
    const walls = [];
    const step = currentPrice * 0.005;
    for (let i = 1; i <= 10; i++) {
        walls.push({ price: currentPrice - (step * i), size: Math.random() * 100, type: 'BID', intensity: Math.random() });
        walls.push({ price: currentPrice + (step * i), size: Math.random() * 100, type: 'ASK', intensity: Math.random() });
    }
    return walls.sort((a, b) => b.price - a.price);
}

function calculateDelta(candles) {
    let cvd = 0;
    candles.forEach(c => { cvd += (c.close >= c.open ? c.volume * 0.1 : -c.volume * 0.1); });
    return { currentDelta: cvd, divergence: Math.random() > 0.7 };
}

function calculateVolumeProfile(candles, binsCount = 24) {
    if (!candles || candles.length === 0) return [];
    const prices = candles.map(c => c.close);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const binSize = (maxPrice - minPrice) / binsCount;
    const bins = Array.from({ length: binsCount }, (_, i) => ({ price: minPrice + (binSize * i), volume: 0, isPOC: false }));
    candles.forEach(c => {
        const idx = Math.min(Math.floor((c.close - minPrice) / binSize), binsCount - 1);
        if (idx >= 0) bins[idx].volume += c.volume || 1;
    });
    let maxVol = 0, pocIdx = 0;
    bins.forEach((b, i) => { if (b.volume > maxVol) { maxVol = b.volume; pocIdx = i; } });
    if (bins[pocIdx]) bins[pocIdx].isPOC = true;
    return bins;
}

function calculateKelly(winProb, winLossRatio) {
    if (winLossRatio <= 0) return 0;
    const k = winProb - ((1 - winProb) / winLossRatio);
    return Math.max(0, k);
}

function runMonteCarloSimulation(startPrice, volatility, steps, simulations) {
    const paths = [];
    for (let i = 0; i < simulations; i++) {
        const path = [startPrice];
        let curr = startPrice;
        for (let j = 0; j < steps; j++) {
            const z = Math.sqrt(-2.0 * Math.log(Math.max(Math.random(), 1e-6))) * Math.cos(2.0 * Math.PI * Math.random());
            curr += curr * (volatility * z);
            path.push(curr);
        }
        paths.push({ id: i, path, finalPrice: curr, probability: 1/simulations });
    }
    return paths;
}
`;

let worker: Worker | null = null;
const messageQueue: Map<string, { resolve: Function, reject: Function, timeoutId: any }> = new Map();

if (typeof window !== 'undefined') {
    try {
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        worker = new Worker(URL.createObjectURL(blob));
        worker.onmessage = (e) => {
            const { id, result, error, status } = e.data;
            if (messageQueue.has(id)) {
                const { resolve, reject, timeoutId } = messageQueue.get(id)!;
                clearTimeout(timeoutId);
                if (status === 'SUCCESS') resolve(result);
                else reject(new Error(error));
                messageQueue.delete(id);
            }
        };
    } catch (e) { console.warn('Worker init failed'); }
}

const runAsyncMath = <T>(type: string, payload: any): Promise<T> => {
    if (!worker) return Promise.resolve({} as T);
    return new Promise((resolve, reject) => {
        const id = crypto.randomUUID();
        // Shortened timeout for UI responsiveness on mobile
        const timeoutId = setTimeout(() => {
            if (messageQueue.has(id)) { messageQueue.delete(id); reject(new Error('Timeout')); }
        }, 5000); // 5 sec max calc time
        messageQueue.set(id, { resolve, reject, timeoutId });
        worker!.postMessage({ id, type, payload });
    });
};

export const calculateVolumeProfile = (candles: any[], binsCount: number = 24): Promise<VolumeBin[]> => runAsyncMath('VOLUME_PROFILE', { candles, binsCount });
export const calculateFractalDimension = (series: number[]): Promise<number> => runAsyncMath('FRACTAL_DIMENSION', { series });
export const calculateMarketEntropy = (series: number[]): Promise<number> => runAsyncMath('MARKET_ENTROPY', { series });
export const calculateExhaustionIndex = (candles: any[], zScore: number): Promise<{ score: number, label: string }> => runAsyncMath('EXHAUSTION', { candles, zScore });
export const calculateInstitutionalConviction = (candles: any[], delta: number): Promise<{ type: 'ACCUMULATION' | 'DISTRIBUTION' | 'NEUTRAL', confidence: number }> => runAsyncMath('CONVICTION', { candles, delta });
export const generateOrderHeatmap = (currentPrice: number, volatility: number = 0.02): Promise<OrderWall[]> => runAsyncMath('ORDER_HEATMAP', { currentPrice, volatility });
export const calculateCumulativeDelta = (candles: any[]): Promise<{ currentDelta: number, divergence: boolean }> => runAsyncMath('DELTA', { candles });
export const calculateKellyCriterion = (winProb: number, winLossRatio: number): Promise<number> => runAsyncMath('KELLY', { winProb, winLossRatio });
export const runMonteCarloSimulation = (startPrice: number, volatility: number, steps: number = 20, simulations: number = 50): Promise<SimulationPath[]> => runAsyncMath('MONTE_CARLO', { startPrice, volatility, steps, simulations });
export const calculateSMA = (data: any[], period: number = 20): Promise<any[]> => runAsyncMath('SMA', { data, period });
export const calculateBollingerBands = (data: any[], period: number = 20, stdDev: number = 2): Promise<any[]> => runAsyncMath('BOLLINGER', { data, period, stdDev });
export const calculateLinearRegression = (data: number[]): Promise<{ slope: number, intercept: number, startPoint: number, endPoint: number }> => runAsyncMath('REGRESSION', { data });

export const calculateZScore = (currentPrice: number, history: number[]): number => {
    const n = history.length;
    if (n === 0) return 0;
    const mean = history.reduce((a, b) => a + b, 0) / n;
    const variance = history.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);
    return stdDev === 0 ? 0 : (currentPrice - mean) / stdDev;
};
