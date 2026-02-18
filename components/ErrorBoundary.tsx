import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldIcon, ActivityIcon } from './icons';

interface Props {
    children?: ReactNode;
    t?: (key: string) => string;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Стандартний компонент React Error Boundary.
 */
class ErrorBoundary extends Component<Props, State> {
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

    private handleBackToHome = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = '/';
    };

    public render(): ReactNode {
        if (this.state.hasError) {
            return (
                <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center p-6 text-center bg-[#020617] text-white overflow-hidden">
                    {/* Background Grid */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(239,68,68,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(239,68,68,0.05)_1px,transparent_1px)] bg-[length:40px_40px] pointer-events-none"></div>

                    <div className="relative z-10 w-full max-w-sm bg-black/70 backdrop-blur-[12px] border border-red-500/10 rounded-[2rem] p-8 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                        <div className="w-20 h-20 bg-red-950/20 rounded-full flex items-center justify-center mb-6 border border-red-500/30 mx-auto shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                            <ActivityIcon className="w-10 h-10 text-red-500" />
                        </div>

                        <h2 className="text-2xl font-black font-orbitron text-red-500 mb-2 tracking-widest">{this.props.t?.('system.failure') || 'СИСТЕМНА ПОМИЛКА'}</h2>

                        <div className="bg-red-950/20 border border-red-500/10 rounded-xl p-4 mb-6 text-left">
                            <p className="text-[10px] text-red-400 font-mono uppercase mb-2 font-bold">Error Log:</p>
                            <p className="text-[10px] font-mono text-slate-400 break-all leading-relaxed opacity-70">
                                {this.state.error?.message || 'Unknown Runtime Error'}
                            </p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={this.handleReset}
                                className="w-full py-3 bg-red-600/10 border border-red-600/50 hover:bg-red-600 hover:text-white text-red-500 rounded-xl font-bold font-orbitron text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group"
                            >
                                <ActivityIcon className="w-4 h-4 group-hover:animate-spin" /> {this.props.t?.('system.reboot') || 'ПЕРЕЗАВАНТАЖИТИ ТЕРМІНАЛ'}
                            </button>
                            <button
                                onClick={this.handleBackToHome}
                                className="w-full py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 rounded-xl font-bold font-orbitron text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
                            >
                                <ShieldIcon className="w-4 h-4" /> {this.props.t?.('system.home') || 'ПОВЕРНУТИСЬ ДОДОМУ'}
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;