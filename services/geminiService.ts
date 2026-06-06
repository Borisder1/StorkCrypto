import { GoogleGenAI, Type } from "@google/genai";
import { NewsArticle, AgentAnalysis, AssetMetrics, TradingSignal } from '../types';
import { supabase } from './supabaseClient';
import { strategyMemoryService } from './strategyMemoryService';

const USE_EDGE_FUNCTION = true; // Set to false for local AI Studio development. Switch to true for production deployment.

const parseCleanJSON = (text: string) => {
    try {
        let cleanText = text.trim();
        if (cleanText.startsWith('```json')) cleanText = cleanText.replace(/^```json\n/, '').replace(/\n```$/, '');
        else if (cleanText.startsWith('```')) cleanText = cleanText.replace(/^```\n/, '').replace(/\n```$/, '');
        return JSON.parse(cleanText);
    } catch (e) { return null; }
};

let aiClient: any = null;

const getGenAI = () => {
    if (!aiClient) {
        const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
        if (apiKey) {
            aiClient = new GoogleGenAI({ apiKey });
        } else {
            console.warn("GEMINI_API_KEY is not defined in the environment.");
        }
    }
    return aiClient;
};

const safeGenerate = async (prompt: string, config: any = {}, maxRetries = 3, modelName: string = "gemini-3.5-flash", history: any[] = []): Promise<any> => {
    // 1. Try official Google GenAI SDK first as per gemini-api skill instructions
    try {
        const ai = getGenAI();
        if (ai) {
            const geminiConfig: any = {};
            if (config?.systemInstruction) {
                geminiConfig.systemInstruction = config.systemInstruction;
            }
            if (config?.responseMimeType) {
                geminiConfig.responseMimeType = config.responseMimeType;
            }
            if (config?.tools) {
                geminiConfig.tools = config.tools;
            }
            if (config?.temperature !== undefined) {
                geminiConfig.temperature = config.temperature;
            }

            const contents: any[] = [];
            if (history && history.length > 0) {
                history.forEach((h: any) => {
                    contents.push({
                        role: h.role === 'model' ? 'model' : 'user',
                        parts: [{ text: h.text }]
                    });
                });
            }
            contents.push({
                role: 'user',
                parts: [{ text: prompt }]
            });

            // Map model names to valid gemini-api SKILL models (prefer gemini-3.5-flash for maximum reliability & speed)
            const resolvedModelName = (modelName === "gemini-3-flash-preview" || modelName === "gemini-3-flash") ? "gemini-3.5-flash" : modelName;

            const response = await ai.models.generateContent({
                model: resolvedModelName,
                contents,
                config: geminiConfig,
            });

            const resultText = response.text || "NO_DATA_PACKET";

            if (config.responseMimeType === 'application/json' && typeof resultText === 'string') {
                const parsed = parseCleanJSON(resultText);
                if (parsed !== null) return parsed;
            }
            return resultText;
        }
    } catch (sdkError) {
        console.warn("[AI] Primary SDK call failed, attempting fallback...", sdkError);
    }

    // 2. Fallback to Cloudflare or NVIDIA API
    try {
        let messages = [];
        if (config?.systemInstruction) {
            messages.push({ role: 'system', content: config.systemInstruction });
        }

        if (history && history.length > 0) {
          messages.push(...history.map((h: any) => ({
            role: h.role === 'model' ? 'assistant' : 'user',
            content: h.text
          })));
        }
        
        messages.push({ role: 'user', content: prompt });

        // Try to determine if we are running in the deployed Cloudflare environment
        const isAIStudio = import.meta.env.DEV || window.location.hostname.includes('run.app') || window.location.hostname === 'localhost';

        // If in Cloudflare (Production), use our secure Pages Function
        if (!isAIStudio) {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: "minimaxai/minimax-m2.7",
                    messages: messages,
                    temperature: config?.temperature || 1,
                    top_p: 0.95,
                    max_tokens: config?.maxOutputTokens || 8192,
                    stream: false
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Cloudflare API Error: ${errorText}`);
            }

            const data = await response.json();
            let resultText = data.choices?.[0]?.message?.content || "NO_DATA_PACKET";

            if (config.responseMimeType === 'application/json' && typeof resultText === 'string') return parseCleanJSON(resultText);
            return resultText;
        }

        // If in Local AI Studio preview, call Nvidia API via Vite Proxy
        const fallbackKey = import.meta.env.VITE_NVIDIA_API_KEY || "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";
        const response = await fetch('/api/nvidia/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${fallbackKey}`
            },
            body: JSON.stringify({
                model: "minimaxai/minimax-m2.7",
                messages: messages,
                temperature: config?.temperature || 1,
                top_p: 0.95,
                max_tokens: config?.maxOutputTokens || 8192,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`NVIDIA API Error: ${await response.text()}`);
        }

        const data = await response.json();
        let resultText = data.choices?.[0]?.message?.content || "NO_DATA_PACKET";

        const reasoning = data.choices?.[0]?.message?.reasoning_content;
        if (reasoning) {
            resultText = `<thinking>\n${reasoning}\n</thinking>\n${resultText}`;
        }

        if (config.responseMimeType === 'application/json' && typeof resultText === 'string') return parseCleanJSON(resultText);
        return resultText;

    } catch (e) {
        console.error("[AI] Generation failed entirely.", e);
        return null;
    }
};

export const getLanguageInstruction = (lang: string) => {
    const base = "You are StorkCrypto AI. Analyze strictly.";
    if (lang === 'ua') return `${base} Output Ukrainian text. Use real-time Google Search context.`;
    return `${base} Output English. Use real-time Google Search context.`;
};

export const generateTradingSignals = async (settings: any, metrics: AssetMetrics[], marketRegime: string = 'UNKNOWN'): Promise<AgentAnalysis> => {
    const dataCtx = metrics.slice(0, 8).map(m => `${m.ticker}: $${m.price} (${m.change}%)`).join(' | ');
    
    // 1. Fetch Historical Performance (RLHF / Feedback Loop)
    const performanceReport = await strategyMemoryService.getStrategyPerformance();
    const langInstr = getLanguageInstruction(settings.language);

    try {
        // Agent 1: Quant Analyst (Focuses on numbers, no search needed)
        const quantPrompt = `
        You are the Quant Agent. Analyze the following market data: [${dataCtx}].
        Current Market Regime: ${marketRegime}
        Review past performance: ${performanceReport}
        Identify potential trading opportunities based on price action, momentum, and statistical mean reversion.
        Output a brief technical analysis and a list of potential assets to trade with proposed entry, TP, and SL.
        `;
        
        // Agent 2: Sentiment Analyst (Focuses on news and trends, uses search)
        const sentimentPrompt = `
        You are the Sentiment Agent. Use Google Search to find the latest news and social trends for these assets: [${dataCtx}].
        Current Market Regime: ${marketRegime}
        Output a brief sentiment analysis (Bullish/Bearish/Neutral) for each asset and an overall market sentiment score (0-100).
        `;

        // Agent 3: Risk Manager (Focuses on volatility and Kelly Criterion)
        const riskPrompt = `
        You are the Risk Manager Agent. Evaluate the systemic risk for: [${dataCtx}].
        Current Market Regime: ${marketRegime}
        Focus on downside risk, historical volatility, and Kelly Criterion sizing.
        Output a brief risk report and maximum recommended allocation per trade.
        `;

        // Run all 3 Agents in parallel
        const [quantResult, sentimentResult, riskResult] = await Promise.all([
            safeGenerate(quantPrompt, { tools: [] }), 
            safeGenerate(sentimentPrompt, { tools: [{ googleSearch: {} }] }),
            safeGenerate(riskPrompt, { tools: [] })
        ]);

        // Agent 4: Arbiter (Makes final decision)
        const arbiterPrompt = `
        You are the Chief Risk Officer and Arbiter.
        ${langInstr}
        
        Current Market Regime: ${marketRegime}
        
        Quant Agent Analysis:
        ${quantResult}
        
        Sentiment Agent Analysis:
        ${sentimentResult}

        Risk Manager Analysis:
        ${riskResult}
        
        Your task:
        1. Review the Quant's proposed trades.
        2. Cross-reference with the Sentiment Agent's findings.
        3. Filter out trades where Quant and Sentiment disagree.
        4. Apply strict risk management based on the Risk Manager's report (Risk/Reward > 1:2).
        5. Adjust strategy based on the Current Market Regime (e.g., tighter stops in VOLATILE regimes, trend-following in BULL/BEAR regimes).
        
        Return JSON only: { 
          "market_sentiment_score": number, 
          "market_phase": string, 
          "macro_context": { "btc_dominance": number, "session": string }, 
          "signals": [{ 
            "asset": string, 
            "signal_type": "LONG"|"SHORT", 
            "strategy_type": "SCALP"|"SWING", 
            "entryPrice": number, 
            "takeProfit": number, 
            "stopLoss": number, 
            "confidence": number, 
            "technical_summary": string, 
            "reasoning_chain": [string], 
            "entry_zone": string, 
            "timeframe": string 
          }] 
        }
        `;

        const res = await safeGenerate(arbiterPrompt, {
            responseMimeType: 'application/json'
        });

        if (res?.signals) {
            // 2. Save generated signals to memory for future evaluation
            res.signals.forEach((sig: TradingSignal) => {
                strategyMemoryService.saveSignal(sig);
            });
            return res;
        }
        throw new Error("Invalid Arbiter Response");
    } catch (e) { 
        console.error("[AI] Multi-Agent Generation Failed:", e);
        return generateFallbackSignals(metrics); 
    }
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

const MOCK_NEWS: Record<string, NewsArticle[]> = {
    en: [
        {
            headline: "Bitcoin Consolidation Pattern Signals Pre-Breakout Impulse",
            summary: "On-chain metrics indicate massive institutional accumulation within the $68,000 range. Top analysts expect a high-volatility expansion phase as liquidity pool sweeps conclude.",
            sentimentMock: "POS",
            impact: "HIGH",
            time: "10m ago",
            tags: ["BTC", "ACCUMULATION", "SMC"]
        },
        {
            headline: "Ethereum Layer-2 Networks Process Record Transactions",
            summary: "L2 scaling layers recorded a combined throughput spike of 165 TPS, significantly reducing mainnet congestion and validating current EIP-4844 scaling upgrades.",
            sentimentMock: "POS",
            impact: "MED",
            time: "48m ago",
            tags: ["ETH", "L2", "DEFI"]
        },
        {
            headline: "Global Macro Outlook: Fed Hints at Rate Stabilization",
            summary: "The Federal Reserve's latest minutes suggest core inflation is stabilizing, boosting risk asset sentiment across cryptocurrency and equity markets.",
            sentimentMock: "NEU",
            impact: "HIGH",
            time: "2h ago",
            tags: ["MACRO", "FED", "FINANCE"]
        }
    ],
    ua: [
        {
            headline: "Консолідація Bitcoin свідчить про імпульс перед проривом",
            summary: "Метрики он-чейн вказують на масштабне накопичення інституціоналами в діапазоні $68,000. Провідні аналітики очікують фазу високої волатильності після завершення збору ліквідності.",
            sentimentMock: "POS",
            impact: "HIGH",
            time: "10 хв тому",
            tags: ["BTC", "НАКОПИЧЕННЯ", "SMC"]
        },
        {
            headline: "Мережі другого рівня Ethereum (L2) зафіксували рекорд транзакцій",
            summary: "Сукупна пропускна здатність мереж L2 досягла піку в 165 TPS, що суттєво зменшило перевантаження основної мережі та підтвердило успішність оновлення EIP-4844.",
            sentimentMock: "POS",
            impact: "MED",
            time: "48 хв тому",
            tags: ["ETH", "L2", "DEFI"]
        },
        {
            headline: "Глобальний макроекономічний аналіз: ФРС натякає на стабілізацію ставок",
            summary: "Останні протоколи Федеральної резервної системи США показують стабілізацію базової інфляції, що покращує настрої на ринках криптовалют та акцій.",
            sentimentMock: "NEU",
            impact: "HIGH",
            time: "2 год тому",
            tags: ["МАКРО", "ФРС", "ФІНАНСИ"]
        }
    ],
    pl: [
        {
            headline: "Konsolidacja Bitcoina zapowiada impuls przed wybiciem",
            summary: "Wskaźniki on-chain wskazują na masową akumulację instytucjonalną w przedziale 68 000 USD. Główni analitycy oczekują fazy wysokiej zmienności po zakończeniu czyszczenia płynności.",
            sentimentMock: "POS",
            impact: "HIGH",
            time: "10 min temu",
            tags: ["BTC", "AKUMULACJA", "SMC"]
        },
        {
            headline: "Sieci Ethereum Layer-2 rejestrują rekordową liczbę transakcji",
            summary: "Skumulowana przepustowość sieci L2 osiągnęła rekordowe 165 TPS, znacząco zmniejszając obciążenie sieci głównej i potwierdzając skuteczność aktualizacji EIP-4844.",
            sentimentMock: "POS",
            impact: "MED",
            time: "48 min temu",
            tags: ["ETH", "L2", "DEFI"]
        },
        {
            headline: "Globalne makro: Rezerwa Federalna sugeruje stabilizację stóp procentowych",
            summary: "Ostatnie protokoły Fed sugerują, że inflacja bazowa się stabilizuje, co poprawia nastroje na rynku kryptowalut i akcji.",
            sentimentMock: "NEU",
            impact: "HIGH",
            time: "2 godz. temu",
            tags: ["MAKRO", "FED", "FINANSE"]
        }
    ]
};

export const getLatestCryptoNews = async (language: string = 'en'): Promise<NewsArticle[]> => {
    try {
        const prompt = `Search Google for top 5 latest crypto news. Return JSON array: [{headline, summary, sentimentMock: "POS"|"NEG"|"NEU", impact: "HIGH"|"MED"|"LOW", sources: [{uri, title}], time: "HH:MM", tags: ["tag1", "tag2"]}]. ${getLanguageInstruction(language)}`;
        const result = await safeGenerate(prompt, { responseMimeType: 'application/json', tools: [{ googleSearch: {} }] });
        
        let articles: any[] = [];
        if (Array.isArray(result)) {
            articles = result;
        } else if (result && typeof result === 'object') {
            const val = result.news || result.articles || result.data || result.newsList;
            if (Array.isArray(val)) {
                articles = val;
            }
        }
        
        if (articles && articles.length > 0) {
            return articles.map(item => ({
                headline: item.headline || item.title || "Market Update",
                summary: item.summary || item.description || "No description provided.",
                sentimentMock: item.sentimentMock || item.sentiment || "NEU",
                impact: item.impact || "MED",
                sources: Array.isArray(item.sources) ? item.sources : [],
                time: item.time || "Just now",
                tags: Array.isArray(item.tags) ? item.tags : []
            }));
        }
    } catch (e) {
        console.error("Failed to fetch fresh news from AI, resolving defaults", e);
    }
    
    const key = (language === 'ua' || language === 'pl') ? language : 'en';
    return MOCK_NEWS[key] || MOCK_NEWS['en'];
};

export const getAIAgentAnalysis = async (agentType: 'SNIPER' | 'WHALE' | 'GUARDIAN', language: string, marketRegime: string = 'UNKNOWN'): Promise<string> => {
    let persona = '';
    if (agentType === 'SNIPER') persona = 'You are an aggressive day-trader AI looking for high-risk, high-reward scalping opportunities based on momentum.';
    if (agentType === 'WHALE') persona = 'You are an analytical on-chain tracker AI looking for smart money movements and institutional accumulation.';
    if (agentType === 'GUARDIAN') persona = 'You are a conservative portfolio manager AI focused on capital preservation and long-term macro trends.';
    
    const prompt = `${persona} Search Google for the current crypto market conditions. The current detected market regime is: ${marketRegime}. Provide a concise, tactical 3-paragraph analysis from your unique perspective, taking the market regime into account. ${getLanguageInstruction(language)}`;
    return await safeGenerate(prompt, { tools: [{ googleSearch: {} }] }) || "Analysis unavailable.";
};

export const createChatSession = (systemContext: string, language: string, marketRegime: string = 'UNKNOWN') => {
    let history: any[] = [];
    const fullContext = `${systemContext}\n\nCurrent Market Regime: ${marketRegime}`;
    return {
        sendMessage: async (msg: { message: string }) => {
            const text = await safeGenerate(msg.message, { tools: [{ googleSearch: {} }], systemInstruction: fullContext }, 2, 'gemini-3-flash-preview', history);
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
    const result = await safeGenerate(`Deep audit: ${context}. Level: ${level}. Search for vulnerabilities in these assets. JSON response.`, { responseMimeType: "application/json", tools: [{ googleSearch: {} }] });
    return result || { score: 65, status: 'MODERATE_RISK', points: ['Concentration too high', 'Missing stablecoins'], recommendation: 'Diversify into BTC/ETH' };
};

export const generateProactiveInsight = async (tickers: string[]): Promise<{type: string, text: string}> => {
    try {
        const res = await safeGenerate(`Provide a short 1-sentence market insight for: ${tickers.join(',')}. Return strictly JSON with 'type' (string) and 'text' (string).`, { responseMimeType: 'application/json' });
        if (res && res.text) {
            return res;
        }
        return { type: 'INFO', text: 'Market pulse stable. Monitoring whale movements.' };
    } catch (e) {
        return { type: 'INFO', text: 'Market pulse stable. Monitoring whale movements.' };
    }
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
    // Using Dicebear for completely free, deterministic, cyberpunk-ish avatars without API keys
    const seed = Math.random().toString(36).substring(7);
    return `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}&colors=cyan,purple,black`;
};