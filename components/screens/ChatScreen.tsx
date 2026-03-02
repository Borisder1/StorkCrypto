import React, { useState, useRef, useEffect } from 'react';
import { type ChatMessage } from '../../types';
import { BotIcon, SendIcon, ShieldIcon, PieChartIcon, ActivityIcon } from '../icons';
import { createChatSession, auditContract, getLatestCryptoNews } from '../../services/geminiService';
import { type Chat } from '@google/genai';
import { useStore } from '../../store';
import { triggerHaptic } from '../../utils/haptics';

const ChatScreen: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
    const { settings, chatHistory, addChatMessage, setIsAIChatOpen, assets, userStats, wallet } = useStore();
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isAuditMode, setIsAuditMode] = useState(false);
    const chatSession = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // --- ENHANCED AI CONTEXT INITIALIZATION ---
    useEffect(() => {
        const initSession = async () => {
            // Calculate Total Value
            const totalValue = assets.reduce((sum, a) => sum + (a.value || 0), 0);
            
            // Build Asset String
            const assetContext = assets.map(a => `${a.ticker}: ${a.amount.toFixed(4)} ($${a.value.toFixed(2)})`).join(', ');
            
            // Wallet Status
            const walletInfo = wallet.isConnected ? `Connected: ${wallet.walletType} (${wallet.address})` : 'Wallet: Disconnected';

            // User Profile
            const userContext = `
            USER_PROFILE:
            - Rank: Level ${userStats.level} (${userStats.subscriptionTier})
            - Total Equity: $${totalValue.toFixed(0)}
            - Risk Tolerance: ${settings.riskLevel}
            - Connected: ${wallet.isConnected}
            - Portfolio: [${assetContext}]
            `;

            const systemPrompt = `
            ROLE: StorkCrypto AI (Elite Cyberpunk Analyst). 
            MODE: ${isAuditMode ? 'SECURITY_AUDIT (Smart Contract Analyzer)' : 'STRATEGIC_ADVISOR'}. 
            LANGUAGE: ${settings.language === 'ua' ? 'Ukrainian' : settings.language === 'pl' ? 'Polish' : 'English'}.
            
            CONTEXT: ${userContext}

            INSTRUCTIONS:
            1. Analyze specific user portfolio assets when asked.
            2. Be concise, tactical, military-grade precision. No filler.
            3. If user asks "What should I buy?", analyze their current gaps (e.g., "You have too much SOL, consider stablecoins").
            4. Use emojis sparingly but effectively (🦅, 🛡️, 🚀).
            `;

            chatSession.current = createChatSession(systemPrompt, settings.language);
        };
        initSession();
    }, [assets, userStats, isAuditMode, settings.language, wallet.isConnected]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, isLoading]);

    const handleSend = async (messageText?: string) => {
        const text = messageText || input;
        if (!text.trim() || isLoading) return;
        
        triggerHaptic('medium');
        addChatMessage({ role: 'user', text });
        setInput('');
        setIsLoading(true);
        
        try {
            let responseText = "";
            if (isAuditMode && (text.startsWith('0x') || text.length > 25)) {
                responseText = await auditContract(text, settings.language);
            } else if (chatSession.current) {
                const result = await chatSession.current.sendMessage({ message: text });
                responseText = result.text || "NO_DATA_PACKET";
            }
            addChatMessage({ role: 'model', text: responseText, isAudit: isAuditMode });
            triggerHaptic('light');
        } catch (error) {
            addChatMessage({ role: 'model', text: "ERR: NEURAL_UPLINK_FAILED" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#020617] relative animate-fade-in font-mono">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-brand-cyan/20 bg-[#050b14]">
                 <div className="flex items-center gap-3">
                     <div className={`w-8 h-8 rounded border flex items-center justify-center ${isAuditMode ? 'bg-brand-purple/20 border-brand-purple text-brand-purple' : 'bg-brand-cyan/20 border-brand-cyan text-brand-cyan'}`}>
                        <BotIcon className="w-5 h-5" />
                     </div>
                     <div>
                        <h1 className="text-xs font-bold text-white tracking-widest uppercase">Stork_AI_Core</h1>
                        <p className="text-[8px] text-slate-500">UPLINK_ESTABLISHED</p>
                     </div>
                 </div>
                 <div className="flex gap-2">
                    <button 
                        onClick={() => { setIsAuditMode(!isAuditMode); triggerHaptic('selection'); }}
                        className={`px-3 py-1 rounded border text-[9px] font-bold uppercase transition-all ${isAuditMode ? 'bg-brand-purple text-white border-brand-purple' : 'bg-transparent border-white/20 text-slate-500'}`}
                    >
                        {isAuditMode ? 'AUDIT_MODE' : 'CHAT_MODE'}
                    </button>
                    <button onClick={() => { setIsAIChatOpen(false); onClose?.(); }} className="w-8 h-8 rounded bg-red-900/20 border border-red-500/50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">✕</button>
                 </div>
            </div>

            {/* Chat Area */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[radial-gradient(circle_at_center,rgba(0,217,255,0.03)_0%,transparent_100%)]">
                {chatHistory.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center opacity-60">
                        <BotIcon className="w-12 h-12 text-slate-700 mb-4" />
                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Awaiting Command Input...</p>
                        <div className="flex flex-wrap justify-center gap-2 mt-4 max-w-[250px]">
                            {['Portfolio Analysis', 'Market Scan', 'Risk Audit'].map(cmd => (
                                <button key={cmd} onClick={() => handleSend(cmd)} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded text-[9px] text-slate-400 hover:border-brand-cyan hover:text-brand-cyan transition-all">{cmd}</button>
                            ))}
                        </div>
                        {assets.length > 0 && (
                            <p className="mt-4 text-[9px] text-brand-green font-mono opacity-80">
                                • {assets.length} Assets Loaded into Context
                            </p>
                        )}
                    </div>
                )}
                
                {chatHistory.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-lg border text-xs leading-relaxed font-mono shadow-lg ${msg.role === 'user' ? 'bg-brand-cyan/10 border-brand-cyan/50 text-brand-cyan rounded-tr-none' : 'bg-black/60 border-white/10 text-slate-300 rounded-tl-none'}`}>
                            {msg.isAudit && <div className="text-[8px] font-black text-brand-purple uppercase mb-1 border-b border-brand-purple/30 pb-1">SECURITY_PROTOCOL</div>}
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                        <span className="text-[7px] text-slate-600 mt-1 uppercase font-bold">{msg.role === 'user' ? 'OP_CMD' : 'AI_RESP'}</span>
                    </div>
                ))}
                
                {isLoading && (
                    <div className="flex items-start">
                        <div className="bg-black/60 border border-white/10 rounded-lg p-3 rounded-tl-none flex gap-1">
                            <div className="w-1.5 h-1.5 bg-brand-cyan animate-pulse"></div>
                            <div className="w-1.5 h-1.5 bg-brand-cyan animate-pulse delay-75"></div>
                            <div className="w-1.5 h-1.5 bg-brand-cyan animate-pulse delay-150"></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-[#050b14] border-t border-brand-cyan/20">
                <div className="flex items-center gap-2 bg-black border border-white/10 rounded-lg px-3 py-2 focus-within:border-brand-cyan/50 transition-colors">
                    <span className="text-brand-cyan font-bold text-xs">{'>'}</span>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="EXECUTE_COMMAND..."
                        className="flex-grow bg-transparent text-white placeholder-slate-700 focus:outline-none text-xs font-mono"
                        disabled={isLoading}
                    />
                    <button
                        onClick={() => handleSend()}
                        disabled={isLoading || !input.trim()}
                        className="text-slate-500 hover:text-brand-cyan disabled:opacity-30 transition-colors"
                    >
                        <SendIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatScreen;