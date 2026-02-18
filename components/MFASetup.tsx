import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { authenticator } from '@otplib/preset-default';
import { supabase } from '../services/supabaseClient';
import { ShieldIcon } from './icons';

export function MFASetup({ userId }: { userId: string }) {
    const [secret, setSecret] = useState('');
    const [qrCode, setQrCode] = useState('');
    const [verifyCode, setVerifyCode] = useState('');
    const [enabled, setEnabled] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        checkStatus();
        generateSecret();
    }, []);

    const checkStatus = async () => {
        const { data } = await supabase
            .from('user_mfa_secrets')
            .select('enabled')
            .eq('user_id', userId)
            .single();
        if (data) {
            setEnabled(data.enabled);
        }
    };

    const generateSecret = async () => {
        const newSecret = authenticator.generateSecret();
        setSecret(newSecret);

        const appName = 'StorkCrypto';
        const otpauth = authenticator.keyuri(userId, appName, newSecret);
        setQrCode(otpauth);
    };

    const verifyAndEnable = async () => {
        setLoading(true);
        try {
            const isValid = authenticator.verify({ token: verifyCode, secret });

            if (isValid) {
                await supabase.from('user_mfa_secrets').upsert({
                    user_id: userId,
                    secret,
                    enabled: true,
                    backup_codes: generateBackupCodes()
                });
                setEnabled(true);
                alert('2FA увімкнено успішно!');
            } else {
                alert('Невірний код. Спробуйте ще раз.');
            }
        } catch (error) {
            console.error('Error enabling 2FA:', error);
            alert('Помилка при увімкненні 2FA');
        } finally {
            setLoading(false);
        }
    };

    const generateBackupCodes = () => {
        return Array.from({ length: 8 }, () =>
            Math.random().toString(36).substring(2, 10).toUpperCase()
        );
    };

    const disableMFA = async () => {
        if (confirm('Ви дійсно хочете вимкнути 2FA?')) {
            await supabase.from('user_mfa_secrets').update({ enabled: false }).eq('user_id', userId);
            setEnabled(false);
        }
    };

    if (enabled) {
        return (
            <div className="p-6 glass-panel rounded-2xl space-y-4">
                <div className="flex items-center gap-3 text-green-400">
                    <ShieldIcon className="w-8 h-8" />
                    <h3 className="text-lg font-orbitron font-bold">2FA АКТИВОВАНО</h3>
                </div>
                <p className="text-sm text-slate-400">
                    Збережіть резервні коди в безпечному місці. Вони допоможуть відновити доступ при втраті пристрою.
                </p>
                <button
                    onClick={disableMFA}
                    className="w-full py-3 bg-red-500/20 border border-red-500/50 text-red-400 rounded-xl font-bold hover:bg-red-500/30 transition-all"
                >
                    ВИМКНУТИ 2FA
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 glass-panel rounded-2xl space-y-4">
            <div className="flex items-center gap-3 text-brand-cyan">
                <ShieldIcon className="w-8 h-8" />
                <h3 className="text-lg font-orbitron font-bold">НАЛАШТУВАННЯ 2FA</h3>
            </div>

            {qrCode && (
                <div className="flex justify-center">
                    <QRCodeSVG value={qrCode} size={200} />
                </div>
            )}

            <p className="text-xs text-slate-400 text-center">
                Відскануйте QR-код в Google Authenticator або Authy
            </p>

            <div className="space-y-2">
                <input
                    type="text"
                    placeholder="Введіть 6-значний код"
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full p-3 bg-black/30 border border-white/10 rounded-xl text-center font-mono text-xl tracking-widest"
                    maxLength={6}
                />

                <button
                    onClick={verifyAndEnable}
                    disabled={loading || verifyCode.length !== 6}
                    className="w-full py-3 bg-brand-cyan/20 border border-brand-cyan text-brand-cyan rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-cyan/30 transition-all"
                >
                    {loading ? 'ПІДТВЕРДЖЕННЯ...' : 'ПІДТВЕРДИТИ ТА АКТИВУВАТИ'}
                </button>
            </div>
        </div>
    );
}
