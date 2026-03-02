import React, { ErrorInfo, ReactNode } from 'react';
import { ShieldIcon, ActivityIcon } from './icons';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Стандартний компонент React Error Boundary.
 */
class ErrorBoundary extends React.Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        // Оновлюємо стан, щоб наступний рендер показав запасний UI.
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Логуємо деталі помилки для діагностики
        console.error("Uncaught error:", error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload(); 
    };

    public render(): ReactNode {
        if (this.state.hasError) {
            return (
                <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center p-6 text-center bg-[#020617] text-white overflow-hidden">
                    {/* Background Grid */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(239,68,68,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(239,68,68,0.05)_1px,transparent_1px)] bg-[length:40px_40px] pointer-events-none"></div>
                    
                    <div className="relative z-10 w-full max-w-sm bg-black/80 backdrop-blur-xl border border-red-500/30 rounded-[2rem] p-8 shadow-[0_0_50px_rgba(0,217,255,0.2)] animate-pulse">
                        <div className="w-20 h-20 bg-red-950/20 rounded-full flex items-center justify-center mb-6 border-2 border-red-500 mx-auto shadow-[0_0_20px_#ef4444]">
                            <ActivityIcon className="w-10 h-10 text-red-500" />
                        </div>
                        
                        <h2 className="text-2xl font-black font-orbitron text-red-500 mb-2 tracking-widest">SYSTEM FAILURE</h2>
                        
                        <div className="bg-red-950/30 border border-red-500/20 rounded-xl p-4 mb-6 text-left">
                            <p className="text-[10px] text-red-400 font-mono uppercase mb-2 font-bold">Error Log:</p>
                            <p className="text-[10px] font-mono text-slate-300 break-all leading-relaxed">
                                {this.state.error?.message || 'Unknown Runtime Error'}
                            </p>
                        </div>

                        <button 
                            onClick={this.handleReset}
                            className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold font-orbitron text-xs uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                        >
                            <ShieldIcon className="w-4 h-4" /> REBOOT TERMINAL
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;