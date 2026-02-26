import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import * as OTPAuth from 'otpauth';
import { useStore } from '../store';
import { ShieldIcon, XIcon, CheckIcon, CopyIcon } from './icons';
import { triggerHaptic } from '../utils/haptics';

interface TwoFactorModalProps {
    onClose: () => void;
}

const TwoFactorModal: React.FC<TwoFactorModalProps> = ({ onClose }) => {
    const { settings, updateSettings } = useStore();
    const [secret, setSecret] = useState<string>('');
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [step, setStep] = useState<'INTRO' | 'SCAN' | 'VERIFY' | 'SUCCESS'>('INTRO');

    useEffect(() => {
        if (settings.twoFactorEnabled) {
            setStep('SUCCESS');
        } else {
            // Generate a random base32 secret
            const newSecret = new OTPAuth.Secret({ size: 20 }).base32;
            setSecret(newSecret);
        }
    }, [settings.twoFactorEnabled]);

    const handleVerify = () => {
        if (!secret) return;

        const totp = new OTPAuth.TOTP({
            issuer: 'StorkCrypto',
            label: settings.language === 'ua' ? 'Користувач' : 'User',
            algorithm: 'SHA1',
            digits: 6,
            period: 30,
            secret: OTPAuth.Secret.fromBase32(secret)
        });

        const delta = totp.validate({ token: code, window: 1 });

        if (delta !== null) {
            triggerHaptic('success');
            updateSettings({ twoFactorEnabled: true, twoFactorSecret: secret });
            setStep('SUCCESS');
        } else {
            triggerHaptic('error');
            setError('Invalid code. Try again.');
        }
    };

    const copySecret = () => {
        navigator.clipboard.writeText(secret);
        triggerHaptic('light');
        alert('Secret copied to clipboard');
    };

    const totpUri = secret ? new OTPAuth.TOTP({
        issuer: 'StorkCrypto',
        label: 'StorkUser',
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(secret)
    }).toString() : '';

    return (
        <div className="fixed inset-0 z-[100] grid place-items-center p-4">
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md animate-fade-in" onClick={onClose}></div>
            
            <div className="relative z-10 w-full max-w-sm bg-brand-bg border border-brand-border rounded-2xl overflow-hidden shadow-2xl animate-zoom-in">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-brand-purple/10 border border-brand-purple/30 flex items-center justify-center">
                                <ShieldIcon className="w-5 h-5 text-brand-purple" />
                            </div>
                            <h2 className="font-orbitron font-bold text-lg text-white">2FA Security</h2>
                        </div>
                        <button onClick={onClose} className="text-slate-500 hover:text-white"><XIcon className="w-5 h-5" /></button>
                    </div>

                    {step === 'INTRO' && (
                        <div className="text-center">
                            <p className="text-slate-400 text-sm mb-6">
                                Protect your account with Two-Factor Authentication. You will need an authenticator app like Google Authenticator or Authy.
                            </p>
                            <button 
                                onClick={() => setStep('SCAN')}
                                className="w-full py-3 bg-brand-purple hover:bg-brand-purple/80 text-white font-bold rounded-xl transition-all"
                            >
                                Setup 2FA
                            </button>
                        </div>
                    )}

                    {step === 'SCAN' && (
                        <div className="flex flex-col items-center">
                            <div className="bg-white p-4 rounded-xl mb-4">
                                <QRCodeCanvas value={totpUri} size={180} />
                            </div>
                            <p className="text-xs text-slate-500 mb-2">Scan this QR code with your authenticator app</p>
                            
                            <div className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-lg border border-white/10 mb-6 w-full justify-between">
                                <code className="text-brand-cyan text-xs font-mono">{secret}</code>
                                <button onClick={copySecret}><CopyIcon className="w-4 h-4 text-slate-400 hover:text-white" /></button>
                            </div>

                            <button 
                                onClick={() => setStep('VERIFY')}
                                className="w-full py-3 bg-brand-purple hover:bg-brand-purple/80 text-white font-bold rounded-xl transition-all"
                            >
                                Next
                            </button>
                        </div>
                    )}

                    {step === 'VERIFY' && (
                        <div>
                            <p className="text-slate-400 text-sm mb-4 text-center">Enter the 6-digit code from your app</p>
                            <input 
                                type="text" 
                                value={code}
                                onChange={(e) => { setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6)); setError(''); }}
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-center text-2xl tracking-[0.5em] font-mono text-white focus:border-brand-purple outline-none mb-2"
                                placeholder="000000"
                            />
                            {error && <p className="text-brand-danger text-xs text-center mb-4">{error}</p>}
                            
                            <button 
                                onClick={handleVerify}
                                disabled={code.length !== 6}
                                className={`w-full py-3 font-bold rounded-xl transition-all ${code.length === 6 ? 'bg-brand-purple hover:bg-brand-purple/80 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                            >
                                Verify
                            </button>
                        </div>
                    )}

                    {step === 'SUCCESS' && (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-green/30">
                                <CheckIcon className="w-8 h-8 text-brand-green" />
                            </div>
                            <h3 className="text-white font-bold text-lg mb-2">2FA Enabled</h3>
                            <p className="text-slate-400 text-sm mb-6">Your account is now secured.</p>
                            <button 
                                onClick={onClose}
                                className="w-full py-3 bg-brand-green hover:bg-brand-green/80 text-black font-bold rounded-xl transition-all"
                            >
                                Done
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TwoFactorModal;
