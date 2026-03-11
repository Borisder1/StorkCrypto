export const BACKEND_URL = (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:8080';

export interface KimiAuditResponse {
    success: boolean;
    symbol: string;
    analysis?: string;
    error?: string;
}

/**
 * Викликає безпечний серверний API-ендпоінт для отримання аудиту від Kimi 2.5
 * @param symbol Тікер монети (наприклад: BTC, SOL)
 * @returns Текст з нейро-аудитом
 */
export const fetchKimiAudit = async (symbol: string): Promise<string> => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/audit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ symbol })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }
        
        const data: KimiAuditResponse = await response.json();
        
        if (data.success && data.analysis) {
            // Повертаємо чистий сгенерований технічний аудит
            return data.analysis;
        } else {
            throw new Error(data.error || 'Failed to fetch audit from Kimi 2.5');
        }
    } catch (e) {
        console.error("[Kimi Service] Error:", e);
        return `❌ Системна помилка: Зв'язок з Kimi 2.5 втрачено.\nПеревірте чи працює сервер bot.js на порту 8080.`;
    }
};
