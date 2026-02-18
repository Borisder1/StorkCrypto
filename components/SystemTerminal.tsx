
import React, { useState, useEffect, useRef } from 'react';
import { triggerHaptic } from '../utils/haptics';
import { useStore } from '../store';
import { getTranslation } from '../utils/translations';

export const SystemTerminal: React.FC = () => {
    const { navigateTo, setIsAIChatOpen, activeTab, settings } = useStore();
    const t = (key: string) => getTranslation(settings.language, key);

    // Initial State is localized
    const [logs, setLogs] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [integrity, setIntegrity] = useState(99.4);
    const [isGlitching, setIsGlitching] = useState(false);

    // Initialize/Reset logs on mount or language change
    useEffect(() => {
        setLogs([t('term.boot'), t('term.help_prompt')]);
    }, [settings.language]);

    // Dynamic log based on current screen
    useEffect(() => {
        const timestamp = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' });
        setLogs(prev => [...prev, `[${timestamp}] ${t('term.access')}: ${activeTab.toUpperCase()}... OK`]);
    }, [activeTab, settings.language]);

    useEffect(() => {
        let isMounted = true;
        let timeoutId: number;

        // List of translation keys for logs
        const logKeys = [
            'term.log_sync', 'term.log_decrypt', 'term.log_whale', 'term.log_rebal',
            'term.log_alpha', 'term.log_ping', 'term.log_liq', 'term.log_sent',
            'term.log_mem', 'term.log_opt', 'term.log_sec'
        ];

        const addLog = () => {
            if (!isMounted) return;
            const randomKey = logKeys[Math.floor(Math.random() * logKeys.length)];
            // Use the translation function here to ensure the log is in the current language
            const randomMsg = t(randomKey) + (randomKey.includes('ping') ? ': 42ms' : '');

            const timestamp = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

            setLogs(prev => {
                const updated = [...prev, `[${timestamp}] ${randomMsg}`];
                return updated.length > 20 ? updated.slice(1) : updated;
            });

            setIntegrity(prev => Math.min(100, Math.max(98, prev + (Math.random() - 0.5) * 0.1)));
            timeoutId = window.setTimeout(addLog, Math.random() * 6000 + 3000);
        };

        timeoutId = window.setTimeout(addLog, 2000);
        return () => { isMounted = false; window.clearTimeout(timeoutId); };
    }, [settings.language]);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [logs]);

    const executeCommand = (cmd: string) => {
        const timestamp = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' });
        let response = `${t('term.not_found')}: ${cmd}`;

        setIsGlitching(true);
        setTimeout(() => setIsGlitching(false), 150);
        triggerHaptic('medium');

        if (cmd === 'help') {
            response = t('term.cmd_help');
        } else if (cmd === 'scan') {
            response = t('term.cmd_scan');
            setTimeout(() => navigateTo('scanner'), 1000);
        } else if (cmd === 'ai') {
            response = t('term.cmd_ai');
            setTimeout(() => setIsAIChatOpen(true), 1000);
        } else if (cmd === 'status') {
            response = `${t('term.cmd_status')}: ${integrity.toFixed(2)}% | LATENCY: 38ms`;
        } else if (cmd === 'clear') {
            setLogs([t('term.cmd_clear'), t('term.ready')]);
            return;
        }

        setLogs(prev => [...prev, `> ${cmd.toUpperCase()}`, `[${timestamp}] ${response}`]);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            executeCommand(inputValue.toLowerCase().trim());
            setInputValue("");
        }
    };

    return (
        <div className={`w-full mb-8 relative transition-all duration-300 ${isGlitching ? 'skew-x-1 opacity-80' : ''}`}>
            <div className="flex justify-between items-center bg-[#0f172a]/95 backdrop-blur-xl border border-white/10 rounded-t-3xl px-6 py-3 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-cyan/40 to-transparent"></div>
                <div className="flex items-center gap-3">
                    <div className="flex gap-1 items-end h-3">
                        {[1, 2, 3, 4].map(i => <div key={i} className="w-0.5 bg-brand-cyan animate-pulse" style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }}></div>)}
                    </div>
                    <span className="text-[10px] font-black text-white tracking-[0.2em] font-orbitron uppercase">{t('term.title')}</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[9px] font-mono text-brand-cyan/60">{integrity.toFixed(1)}% INTG</span>
                    <div className="w-2 h-2 rounded-full bg-brand-cyan animate-ping shadow-[0_0_10px_#00d9ff]"></div>
                </div>
            </div>

            <div
                ref={containerRef}
                onClick={() => inputRef.current?.focus()}
                className="bg-black/90 backdrop-blur-2xl border-x border-b border-white/10 rounded-b-3xl p-5 h-40 overflow-y-auto custom-scrollbar relative font-mono text-[11px] shadow-2xl flex flex-col group/body"
            >
                <div className="flex-1 space-y-1">
                    {(Array.isArray(logs) ? logs : []).map((log, i) => (
                        <div key={i} className={`flex gap-2 ${log.startsWith('>') ? 'text-white font-bold' : 'text-brand-cyan/70 opacity-80'}`}>
                            {!log.startsWith('>') && <span className="text-brand-cyan/30 shrink-0">::</span>}
                            <span className="break-all">{log}</span>
                        </div>
                    ))}
                </div>

                <div className="flex items-center gap-2 mt-4 shrink-0 bg-brand-cyan/5 p-2 rounded-lg border border-brand-cyan/10">
                    <span className="text-brand-cyan font-black animate-pulse">{'>'}</span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="terminal-input text-brand-cyan placeholder-brand-cyan/20 font-bold bg-transparent border-none outline-none w-full"
                        placeholder="Type 'help'..."
                        spellCheck={false}
                        autoCapitalize="off"
                    />
                </div>
            </div>

            <div className="absolute inset-0 pointer-events-none rounded-3xl overflow-hidden opacity-5">
                <div className="w-full h-full animate-scanline bg-gradient-to-b from-transparent via-white to-transparent"></div>
            </div>
        </div>
    );
};
