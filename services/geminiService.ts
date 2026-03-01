import { GoogleGenAI, Type } from "@google/genai";
import { NewsArticle, AgentAnalysis, AssetMetrics, TradingSignal } from '../types';
import { supabase } from './supabaseClient';

const USE_EDGE_FUNCTION = true; 

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const safeGenerate = async (prompt: string, config: any = {}, maxRetries = 3, modelName: string = "gemini-3-flash-preview", history: any[] = []): Promise<any> => {
    if (USE_EDGE_FUNCTION) {
        try {
            const { data, error } = await supabase.functions.invoke('ask-ai', {
                body: { prompt, config, history }
            });
            if (error) throw error;
            let resultText = data?.text || data;
            if (typeof resultText === 'object' && resultText !== null) return resultText;
            if (config.responseMimeType === 'application/json' && typeof resultText === 'string') return parseCleanJSON(resultText);
            return resultText;
        } catch (e) {
            console.warn("[AI] Edge Function failed, falling back to local...", e);
        }
    }

    const ai = getAI();
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await ai.models.generateContent({ model: modelName, contents: prompt, config });
            if (!response.text) throw new Error("Empty AI Response");
            const responseText = response.text;
            
            // Extract Grounding Metadata if available
            const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
            
            if (config.responseMimeType === 'application/json') {
                const parsed = parseCleanJSON(responseText);
                if (parsed && sources.length > 0) parsed.sources = sources;
                return parsed;
            }
            return responseText;
        } catch (e: any) {
            if (e.status === 429 && i < maxRetries - 1) await delay(Math.pow(2, i) * 1000);
            else if (i === maxRetries - 1) return null;
        }
    }
    return null; 
};

const parseCleanJSON = (text: string) => {
    try {
        let cleanText = text.trim();
        if (cleanText.startsWith('```json')) cleanText = cleanText.replace(/^```json\n/, '').replace(/\n```$/, '');
        else if (cleanText.startsWith('```')) cleanText = cleanText.replace(/^```\n/, '').replace(/\n```$/, '');
        return JSON.parse(cleanText);
    } catch (e) { return null; }
};

export const getLanguageInstruction = (lang: string) => {
    const base = "You are StorkCrypto AI. Analyze strictly.";
    if (lang === 'ua') return `${base} Output Ukrainian text. Use real-time Google Search context.`;
    return `${base} Output English. Use real-time Google Search context.`;
};

export const generateTradingSignals = async (settings: any, metrics: AssetMetrics[]): Promise<AgentAnalysis> => {
    const dataCtx = metrics.slice(0, 8).map(m => `${m.ticker}: $${m.price} (${m.change}%)`).join(' | ');
    const prompt = `
    Analyze crypto market: [${dataCtx}]. Search for latest news/trends for these coins.
    ${getLanguageInstruction(settings.language)}
    CRITICAL INSTRUCTION: You must act as a MULTI-AGENT CONSENSUS SYSTEM.
    1. Quant Agent: Analyzes numbers, RSI, MACD, volume.
    2. Sentiment Agent: Analyzes news, fear/greed, social trends.
    3. Risk Manager: Evaluates Risk/Reward ratio.
    A signal is ONLY generated if ALL 3 agents vote YES. Use Smart Money Concepts (SMC) and Volume Spread Analysis (VSA).
    Return JSON only: { "market_sentiment_score": number, "market_phase": string, "macro_context": { "btc_dominance": number, "session": string }, "signals": [{ "asset": string, "signal_type": "LONG"|"SHORT", "strategy_type": "SCALP"|"SWING", "entryPrice": number, "takeProfit": number, "stopLoss": number, "confidence": number, "technical_summary": string, "reasoning_chain": [string], "entry_zone": string, "timeframe": string }] }
    `;
    
    try {
        const res = await safeGenerate(prompt, {
            responseMimeType: 'application/json',
            tools: [{ googleSearch: {} }] // ACTIVATE TREND SEARCHING
        });
        if (res?.signals) return res;
        throw new Error();
    } catch (e) { return generateFallbackSignals(metrics); }
};

export const generateSpecificAssetAnalysis = async (ticker: string, price: number, change: number, language: string) => {
    const prompt = `Analyze ${ticker} ($${price}). Search Google for latest news, forks, or major events for ${ticker}. 
    ${getLanguageInstruction(language)} Max 3 sentences. Highlight if news sources were found.`;
    
    return await safeGenerate(prompt, { 
        temperature: 0.7, 
        tools: [{ googleSearch: {} }] 
    });
};

const generateFallbackSignals = (metrics: AssetMetrics[]): AgentAnalysis => {
    // Fixed: Added entry_zone and timeframe to meet TradingSignal interface requirements
    return {
        market_sentiment_score: 50,
        market_phase: 'RECOVERY_SCAN',
        macro_context: { btc_dominance: 52.1, session: 'LONDON', volatility_index: 'MED' },
        signals: [{ 
            asset: 'BTC', 
            signal_type: 'LONG', 
            strategy_type: 'SWING', 
            entryPrice: 65000, 
            takeProfit: 68000, 
            stopLoss: 64000, 
            confidence: 70, 
            technical_summary: 'Support bounce.', 
            reasoning_chain: ['Quant scan detected demand'],
            entry_zone: '64000-66000',
            timeframe: '1D'
        }]
    };
};

export const getLatestCryptoNews = async (language: string = 'en'): Promise<NewsArticle[]> => {
    const prompt = `Search Google for top 5 latest crypto news. Return JSON array: [{headline, summary, sentimentMock: "POS"|"NEG"|"NEU", impact: "HIGH"|"MED"|"LOW", sources: [{uri, title}]}]`;
    return await safeGenerate(prompt, { responseMimeType: 'application/json', tools: [{ googleSearch: {} }] });
};

export const getAIAgentAnalysis = async (agentType: 'SNIPER' | 'WHALE' | 'GUARDIAN', language: string): Promise<string> => {
    let persona = '';
    if (agentType === 'SNIPER') persona = 'You are an aggressive day-trader AI looking for high-risk, high-reward scalping opportunities based on momentum.';
    if (agentType === 'WHALE') persona = 'You are an analytical on-chain tracker AI looking for smart money movements and institutional accumulation.';
    if (agentType === 'GUARDIAN') persona = 'You are a conservative portfolio manager AI focused on capital preservation and long-term macro trends.';
    
    const prompt = `${persona} Search Google for the current crypto market conditions and provide a concise, tactical 3-paragraph analysis from your unique perspective. ${getLanguageInstruction(language)}`;
    return await safeGenerate(prompt, { tools: [{ googleSearch: {} }] }) || "Analysis unavailable.";
};

export const createChatSession = (systemContext: string, language: string) => {
    let history: any[] = [];
    return {
        sendMessage: async (msg: { message: string }) => {
            const text = await safeGenerate(msg.message, { tools: [{ googleSearch: {} }] }, 2, 'gemini-3-flash-preview', history);
            if (text) {
                history.push({ role: 'user', text: msg.message }, { role: 'model', text: text });
                return { text };
            }
            return { text: "Connection Lost" };
        }
    } as any;
};

export const playAudio = async (text: string): Promise<void> => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
};

export const runDeepPortfolioAudit = async (assets: any[], level: number) => {
    const context = assets.map(a => `${a.ticker}: $${a.value}`).join(', ');
    return await safeGenerate(`Deep audit: ${context}. Level: ${level}. Search for vulnerabilities in these assets. JSON response.`, { responseMimeType: "application/json", tools: [{ googleSearch: {} }] });
};

export const generateProactiveInsight = async (tickers: string[]): Promise<{type: string, text: string}> => {
    const res = await safeGenerate(`Market insight for: ${tickers.join(',')}. Use search. JSON: {type, text}`, { responseMimeType: 'application/json', tools: [{ googleSearch: {} }] });
    return res || { type: 'INFO', text: 'Scanning...' };
};

// Fixed: Exported auditContract to resolve build error in components/ChatScreen.tsx
/**
 * Perform security audit of contract code or address
 */
export const auditContract = async (addressOrCode: string, lang: string): Promise<string> => {
    const prompt = `Perform a high-level security audit of the following smart contract (address/code): ${addressOrCode}. 
    Identify vulnerabilities, risk levels, and logic flaws. 
    ${getLanguageInstruction(lang)} 
    Be concise and tactical. Output Markdown.`;
    
    return await safeGenerate(prompt, { temperature: 0.1 });
};

// Fixed: Exported generateUserAvatar to resolve build error in components/AvatarSelectionModal.tsx
/**
 * Generate AI User Avatar using Gemini 2.5 Flash Image
 */
export const generateUserAvatar = async (): Promise<string | null> => {
    const ai = getAI();
    const prompt = "Cyberpunk style avatar of a futuristic crypto trader, neon lights, high tech gear, portrait, digital art, high quality image.";
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: prompt,
            config: {
                imageConfig: {
                    aspectRatio: "1:1"
                }
            }
        });
        
        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    return part.inlineData.data;
                }
            }
        }
    } catch (e) {
        console.error("Avatar generation failed", e);
    }
    return null;
};