
import { AcademyTerm, Language } from '../types';

export const ACADEMY_DATABASE: Record<Language, AcademyTerm[]> = {
    en: [
        // PATTERNS
        { id: 'hns', term: 'Head & Shoulders', category: 'PATTERNS', definition: 'A reversal pattern with three peaks. Signals trend change from Bullish to Bearish.', visualType: 'CHART_HEAD_SHOULDERS', example: 'Market top signal.' },
        { id: 'bullflag', term: 'Bull Flag', category: 'PATTERNS', definition: 'A continuation pattern after sharp price rise.', visualType: 'CHART_BULL_FLAG', example: 'Trend resumption.' },
        { id: 'fallingwedge', term: 'Falling Wedge', category: 'PATTERNS', definition: 'Bullish pattern where price consolidates lower with converging trendlines.', visualType: 'CHART_WEDGE_BULL', example: 'Breakout imminent.' },
        { id: 'risingwedge', term: 'Rising Wedge', category: 'PATTERNS', definition: 'Bearish pattern with higher highs and higher lows but converging trendlines.', visualType: 'CHART_WEDGE_BEAR', example: 'Trend exhaustion.' },
        { id: 'doji', term: 'Doji', category: 'PATTERNS', definition: 'Candlestick where open and close prices are virtually equal. Signals indecision.', visualType: 'CANDLE_DOJI', example: 'Potential reversal.' },
        { id: 'cupandhandle', term: 'Cup & Handle', category: 'PATTERNS', definition: 'Bullish continuation pattern resembling a tea cup.', visualType: 'CHART_CUP_HANDLE', example: 'Long term accumulation.' },
        { id: 'doubletop', term: 'Double Top', category: 'PATTERNS', definition: 'Bearish reversal. Price hits resistance twice and fails.', visualType: 'CHART_DOUBLE_TOP', example: 'Failed to break $70k twice.' },
        { id: 'doublebottom', term: 'Double Bottom', category: 'PATTERNS', definition: 'Bullish reversal "W" shape. Price hits support twice and bounces.', visualType: 'CHART_DOUBLE_BOTTOM', example: 'Bounced off $3000 twice.' },
        { id: 'ascendingtriangle', term: 'Ascending Triangle', category: 'PATTERNS', definition: 'Bullish pattern. Flat top resistance, rising support.', visualType: 'CHART_ASC_TRIANGLE', example: 'Squeezing towards $100 breakout.' },
        { id: 'descendingtriangle', term: 'Descending Triangle', category: 'PATTERNS', definition: 'Bearish pattern. Flat bottom support, falling resistance.', visualType: 'CHART_DESC_TRIANGLE', example: 'Selling pressure increasing.' },
        
        // TECHNICAL
        { id: 'rsi', term: 'RSI (Relative Strength)', category: 'TECHNICAL', definition: 'Momentum indicator measuring speed and change of price movements.', example: 'RSI > 70 is overbought.', visualType: 'NONE' },
        { id: 'macd', term: 'MACD', category: 'TECHNICAL', definition: 'Trend-following momentum indicator showing relationship between two moving averages.', example: 'Golden cross = Buy.', visualType: 'NONE' },
        { id: 'bollinger', term: 'Bollinger Bands', category: 'TECHNICAL', definition: 'Volatility bands placed above and below a moving average.', example: 'Squeeze precedes breakout.', visualType: 'NONE' },
        { id: 'fibonacci', term: 'Fibonacci Retracement', category: 'TECHNICAL', definition: 'Horizontal lines to indicate areas of support or resistance at the key Fibonacci levels.', example: 'Retracing to 0.618 (Golden Pocket).', visualType: 'NONE' },
        { id: 'ema', term: 'EMA (Exponential Moving Average)', category: 'TECHNICAL', definition: 'A type of moving average that places a greater weight and significance on the most recent data points.', example: 'Price crossing above EMA 200 is bullish.', visualType: 'NONE' },
        { id: 'volume', term: 'Volume Profile', category: 'TECHNICAL', definition: 'Advanced charting study that displays trading activity over a specified time period at specified price levels.', example: 'High volume node acts as support.', visualType: 'NONE' },
        
        // PSYCHOLOGY
        { id: 'fomo', term: 'FOMO', category: 'PSYCHOLOGY', definition: 'Fear Of Missing Out. The emotional urge to buy when price is pumping.', example: 'Buying the top.' },
        { id: 'fud', term: 'FUD', category: 'PSYCHOLOGY', definition: 'Fear, Uncertainty, Doubt. Strategy to influence perception by spreading negative info.', example: 'China bans crypto again.' },
        { id: 'diamondhands', term: 'Diamond Hands', category: 'PSYCHOLOGY', definition: 'Holding an asset despite volatility.', example: 'HODL till moon.' },
        { id: 'paperhands', term: 'Paper Hands', category: 'PSYCHOLOGY', definition: 'Selling an asset too early, usually due to panic.', example: 'Sold the bottom.' },
        
        // SECURITY
        { id: 'seed', term: 'Seed Phrase', category: 'SECURITY', definition: 'A list of words that store all the information needed to recover a wallet.', example: 'Never share this with anyone.', visualType: 'NONE' },
        { id: '2fa', term: '2FA', category: 'SECURITY', definition: 'Two-Factor Authentication. Essential layer of security.', example: 'Use Google Authenticator, not SMS.', visualType: 'NONE' },
        { id: 'coldstorage', term: 'Cold Storage', category: 'SECURITY', definition: 'Keeping a reserve of cryptocurrency offline.', example: 'Ledger or Trezor wallets.', visualType: 'NONE' },
        { id: 'phishing', term: 'Phishing', category: 'SECURITY', definition: 'Fake websites/emails designed to steal your credentials.', example: 'Check URL carefully.', visualType: 'NONE' },
        { id: 'smartcontract', term: 'Smart Contract Risk', category: 'SECURITY', definition: 'Vulnerabilities in the code of decentralized applications.', example: 'Protocol got hacked due to a bug.', visualType: 'NONE' },
    ],
    ua: [
        // ПАТЕРНИ
        { id: 'hns', term: 'Голова і Плечі', category: 'PATTERNS', definition: 'Патерн розвороту з трьома вершинами. Сигнал зміни тренду на ведмежий.', visualType: 'CHART_HEAD_SHOULDERS', example: 'Сигнал розвороту вниз.' },
        { id: 'bullflag', term: 'Бичачий Прапор', category: 'PATTERNS', definition: 'Патерн продовження після різкого росту.', visualType: 'CHART_BULL_FLAG', example: 'Продовження тренду.' },
        { id: 'fallingwedge', term: 'Падаючий Клин', category: 'PATTERNS', definition: 'Бичачий патерн, ціна звужується вниз.', visualType: 'CHART_WEDGE_BULL', example: 'Очікується прорив вгору.' },
        { id: 'risingwedge', term: 'Зростаючий Клин', category: 'PATTERNS', definition: 'Ведмежий патерн, ціна звужується вгору.', visualType: 'CHART_WEDGE_BEAR', example: 'Виснаження тренду.' },
        { id: 'doji', term: 'Доджі', category: 'PATTERNS', definition: 'Свічка, де відкриття і закриття майже однакові. Невизначеність.', visualType: 'CANDLE_DOJI', example: 'Можливий розворот.' },
        { id: 'cupandhandle', term: 'Чашка з Ручкою', category: 'PATTERNS', definition: 'Бичачий патерн продовження, що нагадує чашку.', visualType: 'CHART_CUP_HANDLE', example: 'Довгострокова акумуляція.' },
        { id: 'doubletop', term: 'Подвійна Вершина', category: 'PATTERNS', definition: 'Ведмежий розворот. Ціна двічі вдаряється в опір і падає.', visualType: 'CHART_DOUBLE_TOP', example: 'Не вдалося пробити $70k двічі.' },
        { id: 'doublebottom', term: 'Подвійне Дно', category: 'PATTERNS', definition: 'Бичачий розворот "W". Ціна двічі відскакує від підтримки.', visualType: 'CHART_DOUBLE_BOTTOM', example: 'Відскік від $3000 двічі.' },
        { id: 'ascendingtriangle', term: 'Висхідний Трикутник', category: 'PATTERNS', definition: 'Бичачий патерн. Рівний верх, підсвищення низів.', visualType: 'CHART_ASC_TRIANGLE', example: 'Тиск до пробою $100.' },
        { id: 'descendingtriangle', term: 'Низхідний Трикутник', category: 'PATTERNS', definition: 'Ведмежий патерн. Рівне дно, зниження вершин.', visualType: 'CHART_DESC_TRIANGLE', example: 'Продавці тиснуть ціну вниз.' },

        // ТЕХНІЧНИЙ
        { id: 'rsi', term: 'RSI (Індекс сили)', category: 'TECHNICAL', definition: 'Індикатор імпульсу, що вимірює швидкість зміни ціни.', example: 'RSI > 70 — перекупленість.', visualType: 'NONE' },
        { id: 'macd', term: 'MACD', category: 'TECHNICAL', definition: 'Трендовий індикатор, що показує співвідношення двох ковзних середніх.', example: 'Золотий хрест = Купівля.', visualType: 'NONE' },
        { id: 'bollinger', term: 'Смуги Боллінджера', category: 'TECHNICAL', definition: 'Смуги волатильності навколо ковзної середньої.', example: 'Стиснення передує вибуху ціни.', visualType: 'NONE' },
        { id: 'fibonacci', term: 'Рівні Фібоначчі', category: 'TECHNICAL', definition: 'Горизонтальні лінії для визначення підтримки/опору на ключових рівнях.', example: 'Відкат до 0.618 (Золотий перетин).', visualType: 'NONE' },
        { id: 'ema', term: 'EMA (Експоненційна ковзна середня)', category: 'TECHNICAL', definition: 'Ковзна середня, яка надає більшої ваги останнім даним.', example: 'Ціна вище EMA 200 — бичачий тренд.', visualType: 'NONE' },
        { id: 'volume', term: 'Профіль Об\'єму', category: 'TECHNICAL', definition: 'Показує торгову активність на певних цінових рівнях.', example: 'Вузол високого об\'єму діє як підтримка.', visualType: 'NONE' },

        // ПСИХОЛОГІЯ
        { id: 'fomo', term: 'FOMO (Фомо)', category: 'PSYCHOLOGY', definition: 'Страх втраченої вигоди. Емоційна покупка на хаях.', example: 'Купівля на вершині через жадібність.' },
        { id: 'fud', term: 'FUD (Фад)', category: 'PSYCHOLOGY', definition: 'Страх, Невизначеність, Сумнів. Стратегія дезінформації.', example: 'Новини про заборону крипти.' },
        { id: 'diamondhands', term: 'Діамантові Руки', category: 'PSYCHOLOGY', definition: 'Утримання активу попри високу волатильність.', example: 'Холдити до Місяця.', visualType: 'NONE' },
        { id: 'paperhands', term: 'Паперові Руки', category: 'PSYCHOLOGY', definition: 'Продаж активу занадто рано через паніку.', example: 'Продав на самому дні.', visualType: 'NONE' },

        // БЕЗПЕКА
        { id: 'seed', term: 'Сід-фраза', category: 'SECURITY', definition: 'Набір слів (12-24) для відновлення доступу до гаманця.', example: 'Ніколи нікому не передавайте!', visualType: 'NONE' },
        { id: '2fa', term: '2FA', category: 'SECURITY', definition: 'Двофакторна аутентифікація. Обов\'язковий рівень захисту.', example: 'Використовуйте Google Auth, не SMS.', visualType: 'NONE' },
        { id: 'coldstorage', term: 'Холодне Зберігання', category: 'SECURITY', definition: 'Зберігання криптовалюти офлайн на апаратних гаманцях.', example: 'Ledger або Trezor.', visualType: 'NONE' },
        { id: 'phishing', term: 'Фішинг', category: 'SECURITY', definition: 'Підроблені сайти для крадіжки паролів.', example: 'Перевіряйте URL адресу.', visualType: 'NONE' },
        { id: 'smartcontract', term: 'Ризик Смарт-контракту', category: 'SECURITY', definition: 'Вразливості в коді децентралізованих додатків.', example: 'Протокол зламали через баг.', visualType: 'NONE' },
    ],
    pl: [
        // PATTERNS
        { id: 'hns', term: 'Głowa i Ramiona', category: 'PATTERNS', definition: 'Formacja odwrócenia z trzema szczytami.', visualType: 'CHART_HEAD_SHOULDERS', example: 'Sygnał spadku.' },
        { id: 'bullflag', term: 'Flaga Byka', category: 'PATTERNS', definition: 'Formacja kontynuacji po wzroście.', visualType: 'CHART_BULL_FLAG', example: 'Wznowienie trendu.' },
        { id: 'fallingwedge', term: 'Klin Zniżkujący', category: 'PATTERNS', definition: 'Formacja byka, cena zacieśnia się w dół.', visualType: 'CHART_WEDGE_BULL', example: 'Wybicie w górę.' },
        { id: 'risingwedge', term: 'Klin Zwyżkujący', category: 'PATTERNS', definition: 'Formacja niedźwiedzia, cena zacieśnia się w górę.', visualType: 'CHART_WEDGE_BEAR', example: 'Koniec trendu.' },
        { id: 'doji', term: 'Doji', category: 'PATTERNS', definition: 'Świeca otwarcia równa zamknięciu. Niepewność.', visualType: 'CANDLE_DOJI', example: 'Możliwe odwrócenie.' },
        { id: 'cupandhandle', term: 'Filiżanka z Uchem', category: 'PATTERNS', definition: 'Formacja kontynuacji hossy przypominająca filiżankę.', visualType: 'CHART_CUP_HANDLE', example: 'Długoterminowa akumulacja.' },
        { id: 'doubletop', term: 'Podwójny Szczyt', category: 'PATTERNS', definition: 'Odwrócenie spadkowe. Cena dwukrotnie uderza w opór.', visualType: 'CHART_DOUBLE_TOP', example: 'Nieudane przebicie $70k.' },
        { id: 'doublebottom', term: 'Podwójne Dno', category: 'PATTERNS', definition: 'Odwrócenie wzrostowe "W". Odbicie od wsparcia.', visualType: 'CHART_DOUBLE_BOTTOM', example: 'Odbicie od $3000 dwa razy.' },
        { id: 'ascendingtriangle', term: 'Trójkąt Zwyżkujący', category: 'PATTERNS', definition: 'Formacja byka. Płaski opór, rosnące wsparcie.', visualType: 'CHART_ASC_TRIANGLE', example: 'Presja na przebicie $100.' },
        { id: 'descendingtriangle', term: 'Trójkąt Zniżkujący', category: 'PATTERNS', definition: 'Formacja niedźwiedzia. Płaskie wsparcie, spadający opór.', visualType: 'CHART_DESC_TRIANGLE', example: 'Presja sprzedażowa rośnie.' },
        
        // TECHNICAL
        { id: 'rsi', term: 'RSI (Siła Względna)', category: 'TECHNICAL', definition: 'Wskaźnik mierzący prędkość zmian cen.', example: 'RSI > 70 to wykupienie.', visualType: 'NONE' },
        { id: 'macd', term: 'MACD', category: 'TECHNICAL', definition: 'Wskaźnik trendu pokazujący relację średnich kroczących.', example: 'Złoty Krzyż = Kupuj.', visualType: 'NONE' },
        { id: 'bollinger', term: 'Wstęgi Bollingera', category: 'TECHNICAL', definition: 'Wstęgi zmienności wokół średniej kroczącej.', example: 'Ściśnięcie zapowiada wybicie.', visualType: 'NONE' },
        { id: 'fibonacci', term: 'Poziomy Fibonacciego', category: 'TECHNICAL', definition: 'Poziome linie wsparcia/oporu.', example: 'Odbicie od 0.618.', visualType: 'NONE' },
        
        // PSYCHOLOGY
        { id: 'fomo', term: 'FOMO', category: 'PSYCHOLOGY', definition: 'Strach przed pominięciem. Emocjonalne zakupy.', example: 'Kupowanie na szczycie.' },
        { id: 'fud', term: 'FUD', category: 'PSYCHOLOGY', definition: 'Strach, Niepewność, Wątpliwość. Dezinformacja.', example: 'Fake newsy o banach.' },
        { id: 'diamondhands', term: 'Diamentowe Ręce', category: 'PSYCHOLOGY', definition: 'Trzymanie aktywów mimo spadków.', example: 'HODL.', visualType: 'NONE' },
        
        // SECURITY
        { id: 'seed', term: 'Fraza Seed', category: 'SECURITY', definition: 'Lista słów (12-24) do odzyskania portfela.', example: 'Trzymaj offline na papierze.', visualType: 'NONE' },
        { id: '2fa', term: '2FA', category: 'SECURITY', definition: 'Uwierzytelnianie dwuskładnikowe.', example: 'Używaj Google Auth.', visualType: 'NONE' },
        { id: 'phishing', term: 'Phishing', category: 'SECURITY', definition: 'Fałszywe strony wykradające dane.', example: 'Sprawdzaj adresy URL.', visualType: 'NONE' },
    ]
};
