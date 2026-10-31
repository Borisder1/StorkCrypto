// Server-side Telegram initData HMAC-SHA256 Validator using Web Crypto API
// Enforces P0 Security: Rejects forged/missing initData with HTTP 401

export interface TelegramAuthResult {
  valid: boolean;
  userId?: string;
  username?: string;
  user?: any;
  error?: string;
}

export async function verifyTelegramInitData(
  initData: string | null | undefined,
  botToken: string | undefined,
  isDevMode: boolean = false
): Promise<TelegramAuthResult> {
  if (!initData || typeof initData !== 'string' || !initData.trim()) {
    return { valid: false, error: 'MISSING_INIT_DATA' };
  }

  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    const userParam = params.get('user');

    if (!userParam) {
      return { valid: false, error: 'MISSING_USER_PAYLOAD' };
    }

    let parsedUser: any = null;
    try {
      parsedUser = JSON.parse(userParam);
    } catch {
      return { valid: false, error: 'MALFORMED_USER_PAYLOAD' };
    }

    const userId = parsedUser?.id ? String(parsedUser.id) : undefined;
    if (!userId) {
      return { valid: false, error: 'MISSING_USER_ID' };
    }

    // In dev / test simulator mode when botToken is absent on localhost
    if (isDevMode && (!botToken || initData.includes('testuser') || initData.includes('dev_sim'))) {
      return {
        valid: true,
        userId,
        username: parsedUser?.username,
        user: parsedUser
      };
    }

    if (!hash) {
      return { valid: false, error: 'MISSING_HASH' };
    }

    if (!botToken) {
      // Production without botToken is misconfigured, but if it's explicitly test mode:
      if (isDevMode) {
        return { valid: true, userId, username: parsedUser?.username, user: parsedUser };
      }
      return { valid: false, error: 'BOT_TOKEN_NOT_CONFIGURED' };
    }

    // Standard Telegram HMAC-SHA256 verification
    params.delete('hash');
    const dataCheckString = [...params.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    const encoder = new TextEncoder();

    const hmacSha256 = async (keyBuffer: Uint8Array, dataBuffer: Uint8Array): Promise<Uint8Array> => {
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      const signature = await crypto.subtle.sign('HMAC', cryptoKey, dataBuffer);
      return new Uint8Array(signature);
    };

    const secretKey = await hmacSha256(
      encoder.encode('WebAppData'),
      encoder.encode(botToken)
    );

    const calculatedHashBuffer = await hmacSha256(
      secretKey,
      encoder.encode(dataCheckString)
    );

    const calculatedHash = Array.from(calculatedHashBuffer)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    if (calculatedHash !== hash.toLowerCase()) {
      return { valid: false, error: 'INVALID_SIGNATURE' };
    }

    return {
      valid: true,
      userId,
      username: parsedUser?.username,
      user: parsedUser
    };
  } catch (err: any) {
    return { valid: false, error: err?.message || 'VALIDATION_EXCEPTION' };
  }
}
