import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '../services/supabaseClient';
import { ShieldIcon } from './icons';

// Simple TOTP implementation for browser
function base32Encode(buffer: Uint8Array): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = '';
    for (let i = 0; i < buffer.length; i++) {
        bits += buffer[i].toString(2).padStart(8, '0');
    }
    let result = '';
    for (let i = 0; i < bits.length; i += 5) {
        const chunk = bits.slice(i, i + 5).padEnd(5, '0');
        result += alphabet[parseInt(chunk, 2)];
    }
    return result;
}

function generateSecret(): string {
    const array = new Uint8Array(20);
    crypto.getRandomValues(array);
    return base32Encode(array);
}

function generateTOTP(secret: string, time: number = Date.now()): string {
    // Decode base32 secret
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = '';
    for (const char of secret) {
        const val = alphabet.indexOf(char.toUpperCase());
        if (val === -1) continue;
        bits += val.toString(2).padStart(5, '0');
    }

    const secretBytes = new Uint8Array(Math.floor(bits.length / 8));
    for (let i = 0; i < secretBytes.length; i++) {
        secretBytes[i] = parseInt(bits.slice(i * 8, (i + 1) * 8), 2);
    }

    // Get time counter (30 second window)
    let counter = Math.floor(time / 30000);
    const counterBytes = new Uint8Array(8);
    for (let i = 7; i >= 0; i--) {
        counterBytes[i] = counter & 0xff;
        counter = counter >>> 8;
    }

    // HMAC-SHA1 using Web Crypto API
    return new Promise((resolve) => {
        crypto.subtle.importKey(
            'raw',
            secretBytes,
            { name: 'HMAC', hash: 'SHA-1' },
            false,
            ['sign']
        ).then(key => {
            crypto.subtle.sign('HMAC', key, counterBytes).then(signature => {
                const hmac = new Uint8Array(signature);
                const offset = hmac[hmac.length - 1] & 0x0f;
                const code = ((hmac[offset] & 0x7f) << 24 |
                    (hmac[offset + 1] & 0xff) << 16 |
                    (hmac[offset + 2] & 0xff) << 8 |
                    (hmac[offset + 3] & 0xff)) % 1000000;
                resolve(code.toString().padStart(6, '0'));
            });
        });
    }) as unknown as string;
}

// Synchronous verification using a simple approach
async function verifyTOTP(secret: string, token: string): Promise<boolean> {
    const time = Date.now();
    // Check current and adjacent windows (±1 window for clock drift)
    for (let drift = -1; drift <= 1; drift++) {
        const expectedCode = await generateTOTPAsync(secret, time + drift * 30000);
        if (expectedCode === token) return true;
    }
    return false;
}

async function generateTOTPAsync(secret: string, time: number): Promise<string> {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = '';
    for (const char of secret) {
        const val = alphabet.indexOf(char.toUpperCase());
        if (val === -1) continue;
        bits += val.toString(2).padStart(5, '0');
    }

    const secretBytes = new Uint8Array(Math.floor(bits.length / 8));
    for (let i = 0; i < secretBytes.length; i++) {
        secretBytes[i] = parseInt(bits.slice(i * 8, (i + 1) * 8), 2);
    }

    let counter = Math.floor(time / 30000);
    const counterBytes = new Uint8Array(8);
    for (let i = 7; i >= 0; i--) {
        counterBytes[i] = counter & 0xff;
        counter = counter >>> 8;
    }

    const key = await crypto.subtle.importKey(
        'raw',
        secretBytes,
        { name: 'HMAC', hash: 'SHA-1' },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', key, counterBytes);
    const hmac = new Uint8Array(signature);
    const offset = hmac[hmac.length - 1] & 0x0f;
    const code = ((hmac[offset] & 0x7f) << 24 |
        (hmac[offset + 1] & 0xff) << 16 |
        (hmac[offset + 2] & 0xff) << 8 |
        (hmac[offset + 3] & 0xff)) % 1000000;
    return code.toString().padStart(6, '0');
}

export function MFASetup({ userId }: { userId: string }) {
    const [secret, setSecret] = useState('');
    const [qrCode, setQrCode] = useState('');
    const [verifyCode, setVerifyCode] = useState('');
    const [enabled, setEnabled] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        checkStatus();
        generateNewSecret();
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

    const generateNewSecret = () => {
        const newSecret = generateSecret();
        setSecret(newSecret);

        const appName = 'StorkCrypto';
        const otpauth = `otpauth://totp/${encodeURIComponent(appName)}:${encodeURIComponent(userId)}?secret=${newSecret}&issuer=${encodeURIComponent(appName)}`;
        setQrCode(otpauth);
    };

    const verifyAndEnable = async () => {
        setLoading(true);
        try {
            const isValid = await verifyTOTP(secret, verifyCode);

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
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
                <div className="w-full max-w-sm glass-panel rounded-[2rem] p-6 space-y-4">
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
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full py-3 bg-white/5 border border-white/10 text-slate-400 rounded-xl font-bold hover:bg-white/10 transition-all"
                    >
                        ЗАКРИТИ
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <div className="w-full max-w-sm glass-panel rounded-[2rem] p-6 space-y-4">
                <div className="flex items-center gap-3 text-brand-cyan">
                    <ShieldIcon className="w-8 h-8" />
                    <h3 className="text-lg font-orbitron font-bold">НАЛАШТУВАННЯ 2FA</h3>
                </div>

                {qrCode && (
                    <div className="flex justify-center bg-white p-4 rounded-xl">
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

                    <button
                        onClick={() => window.location.reload()}
                        className="w-full py-3 bg-white/5 border border-white/10 text-slate-400 rounded-xl font-bold hover:bg-white/10 transition-all"
                    >
                        СКАСУВАТИ
                    </button>
                </div>
            </div>
        </div>
    );
}
