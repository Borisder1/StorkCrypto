// Безкоштовний сервіс новин без API ключів
import { NewsArticle } from '../types';

// CryptoPanic Free API (не потребує ключа для базового використання)
const CRYPTOPANIC_API = 'https://cryptopanic.com/api/v1/posts/';

// NewsAPI альтернатива - використовуємо RSS фіди через публічні проксі
const RSS_FEEDS = [
    'https://cointelegraph.com/rss',
    'https://decrypt.co/feed',
    'https://cryptonews.com/news/feed/'
];

// Fallback: статичні новини для демонстрації
const FALLBACK_NEWS: NewsArticle[] = [
    {
        headline: "Bitcoin досягає нових висот у 2026 році",
        summary: "Провідна криптовалюта продовжує зростання на тлі інституційного прийняття та регуляторної ясності.",
        sources: [{ title: "CryptoNews", uri: "https://cryptonews.com" }],
        sentimentMock: 'POS',
        isVerified: true,
        isFud: false
    },
    {
        headline: "Ethereum 2.0 показує рекордну активність",
        summary: "Мережа Ethereum демонструє значне зростання транзакцій після останнього оновлення протоколу.",
        sources: [{ title: "CoinTelegraph", uri: "https://cointelegraph.com" }],
        sentimentMock: 'POS',
        isVerified: true,
        isFud: false
    },
    {
        headline: "DeFi протоколи залучають мільярди інвестицій",
        summary: "Децентралізовані фінанси продовжують розвиватися, залучаючи інституційний капітал.",
        sources: [{ title: "Decrypt", uri: "https://decrypt.co" }],
        sentimentMock: 'NEU',
        isVerified: true,
        isFud: false
    },
    {
        headline: "Регулятори обговорюють нові правила для крипто",
        summary: "Світові регулятори працюють над створенням єдиних стандартів для криптовалютної індустрії.",
        sources: [{ title: "Bloomberg Crypto", uri: "https://bloomberg.com" }],
        sentimentMock: 'NEU',
        isVerified: true,
        isFud: false
    },
    {
        headline: "NFT ринок переживає трансформацію",
        summary: "Ринок NFT адаптується до нових реалій, фокусуючись на утиліті та реальній цінності.",
        sources: [{ title: "NFT News", uri: "https://nft.news" }],
        sentimentMock: 'NEU',
        isVerified: false,
        isFud: false
    }
];

/**
 * Отримати останні крипто новини
 * Використовує безкоштовні джерела без API ключів
 */
export async function getLatestCryptoNews(language: string = 'en'): Promise<NewsArticle[]> {
    try {
        // Спроба отримати новини з CryptoPanic (безкоштовний публічний доступ)
        const response = await fetch(`${CRYPTOPANIC_API}?currencies=BTC,ETH&public=true`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            if (data.results && Array.isArray(data.results)) {
                return data.results.slice(0, 10).map((item: any) => ({
                    headline: item.title || 'Без заголовка',
                    summary: item.title || 'Немає опису',
                    sources: [{ name: item.source?.title || 'CryptoPanic', uri: item.url || '#' }],
                    sentimentMock: item.votes?.positive > item.votes?.negative ? 'POS' :
                        item.votes?.negative > item.votes?.positive ? 'NEG' : 'NEU',
                    isVerified: true,
                    isFud: false
                }));
            }
        }
    } catch (error) {
        console.warn('[NewsService] Failed to fetch from CryptoPanic, using fallback', error);
    }

    // Fallback: повертаємо статичні новини
    return FALLBACK_NEWS;
}

/**
 * Пошук новин за ключовим словом
 */
export async function searchNews(query: string): Promise<NewsArticle[]> {
    const allNews = await getLatestCryptoNews();
    return allNews.filter(article =>
        article.headline.toLowerCase().includes(query.toLowerCase()) ||
        article.summary.toLowerCase().includes(query.toLowerCase())
    );
}

/**
 * Отримати новини за категорією
 */
export async function getNewsByCategory(category: string): Promise<NewsArticle[]> {
    const allNews = await getLatestCryptoNews();

    // Фільтрація за категорією (базова логіка)
    if (category === 'BTC') {
        return allNews.filter(article =>
            article.headline.toLowerCase().includes('bitcoin') ||
            article.headline.toLowerCase().includes('btc')
        );
    }

    if (category === 'ETH') {
        return allNews.filter(article =>
            article.headline.toLowerCase().includes('ethereum') ||
            article.headline.toLowerCase().includes('eth')
        );
    }

    if (category === 'DEFI') {
        return allNews.filter(article =>
            article.headline.toLowerCase().includes('defi') ||
            article.summary.toLowerCase().includes('decentralized')
        );
    }

    return allNews;
}
