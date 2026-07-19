
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookIcon, ChevronRightIcon, SearchIcon, FilterIcon } from './icons';
import { useStore } from '../store';
import { getTranslation } from '../utils/translations';
import { AcademyTerm, Language } from '../types';
import { LineChart, Line, ResponsiveContainer, YAxis, Area, AreaChart } from 'recharts';

interface AcademyModalProps {
    onClose: () => void;
}

// MULTI-LANGUAGE CONTENT DATABASE
const ACADEMY_CONTENT: Record<Language, AcademyTerm[]> = {
    en: [
        { id: 'rsi', term: 'RSI (Relative Strength Index)', category: 'TECHNICAL', definition: 'Momentum indicator (0-100). >70: Overbought (sell potential). <30: Oversold (buy potential).', example: 'RSI dropped to 25 - strong buy signal.' },
        { id: 'macd', term: 'MACD', category: 'TECHNICAL', definition: 'Trend-following indicator showing relationship between two MAs. Golden Cross suggests entry.', example: 'Blue line crossed Red line upwards.' },
        { id: 'smc', term: 'Smart Money Concepts (SMC)', category: 'TECHNICAL', definition: 'Trading methodology based on tracking institutional order flow and liquidity.', visualType: 'CHART_SMC', example: 'Trading with the banks, not against them.' },
        { id: 'ob', term: 'Order Block (OB)', category: 'TECHNICAL', definition: 'The last opposite candle before a strong impulsive move that breaks structure. Often acts as strong support/resistance.', visualType: 'CHART_OB', example: 'Price tapped the 1H bullish order block and reversed.' },
        { id: 'fvg', term: 'Fair Value Gap (FVG)', category: 'TECHNICAL', definition: 'An imbalance in price action leaving a gap between the wicks of the 1st and 3rd candle in a 3-candle sequence.', visualType: 'CHART_FVG', example: 'Price returned to fill the FVG before continuing.' },
        { id: 'hns', term: 'Head & Shoulders', category: 'PATTERNS', definition: 'Reversal pattern with 3 peaks. Signals trend change from Bullish to Bearish.', visualType: 'CHART_HEAD_SHOULDERS', example: 'Price broke neckline downwards.' },
        { id: 'bullflag', term: 'Bull Flag', category: 'PATTERNS', definition: 'Continuation pattern. Impulse up, consolidation down, breakout up.', visualType: 'CHART_BULL_FLAG', example: 'Price consolidating after 10% pump.' },
        { id: 'doubletop', term: 'Double Top', category: 'PATTERNS', definition: 'Bearish reversal. Price hits resistance twice and fails.', visualType: 'CHART_DOUBLE_TOP', example: 'Failed to break $70k twice.' },
        { id: 'doublebottom', term: 'Double Bottom', category: 'PATTERNS', definition: 'Bullish reversal "W" shape. Price hits support twice and bounces.', visualType: 'CHART_DOUBLE_BOTTOM', example: 'Bounced off $3000 twice.' },
        { id: 'cupandhandle', term: 'Cup and Handle', category: 'PATTERNS', definition: 'Bullish continuation pattern resembling a tea cup.', visualType: 'CHART_CUP_HANDLE', example: 'Long term bullish structure.' },
        { id: 'ascendingtriangle', term: 'Ascending Triangle', category: 'PATTERNS', definition: 'Bullish pattern. Flat top resistance, rising support.', visualType: 'CHART_ASC_TRIANGLE', example: 'Squeezing towards $100 breakout.' },
        { id: 'descendingtriangle', term: 'Descending Triangle', category: 'PATTERNS', definition: 'Bearish pattern. Flat bottom support, falling resistance.', visualType: 'CHART_DESC_TRIANGLE', example: 'Selling pressure increasing.' },
        { id: 'wedgebull', term: 'Falling Wedge', category: 'PATTERNS', definition: 'Bullish pattern. Price lowers in narrowing range.', visualType: 'CHART_WEDGE_BULL', example: 'Reversal likely upwards.' },
        { id: 'wedgebear', term: 'Rising Wedge', category: 'PATTERNS', definition: 'Bearish pattern. Price rises in narrowing range.', visualType: 'CHART_WEDGE_BEAR', example: 'Reversal likely downwards.' },
        { id: 'doji', term: 'Doji Candle', category: 'PATTERNS', definition: 'Candle where Open ≈ Close. Indecision.', visualType: 'CANDLE_DOJI', example: 'Doji at top indicates potential reversal.' },
        { id: 'hammer', term: 'Hammer', category: 'PATTERNS', definition: 'Bullish reversal pattern. Small body, long lower wick.', visualType: 'CANDLE_HAMMER', example: 'Hammer at support signals a bounce.' },
        { id: 'engulfing', term: 'Engulfing Pattern', category: 'PATTERNS', definition: 'Strong reversal signal where the second candle completely covers the first.', visualType: 'CANDLE_ENGULFING', example: 'Bullish engulfing after a downtrend.' },
        { id: 'morningstar', term: 'Morning Star', category: 'PATTERNS', definition: '3-candle bullish reversal pattern. Bearish, Doji, Bullish.', visualType: 'CANDLE_MORNING_STAR', example: 'Morning star formed at the bottom.' },
        { id: 'shootingstar', term: 'Shooting Star', category: 'PATTERNS', definition: 'Bearish reversal pattern. Small body, long upper wick.', visualType: 'CANDLE_SHOOTING_STAR', example: 'Shooting star at resistance.' },
        { id: 'fomo', term: 'FOMO', category: 'PSYCHOLOGY', definition: 'Fear Of Missing Out. Emotional buying at tops.', example: 'Don\'t buy green candles on FOMO.' },
        { id: 'fud', term: 'FUD', category: 'PSYCHOLOGY', definition: 'Fear, Uncertainty, Doubt. News manipulation.', example: 'China ban is just FUD.' },
        { id: 'revenge', term: 'Revenge Trading', category: 'PSYCHOLOGY', definition: 'Trying to immediately win back losses with emotional, unplanned trades.', example: 'Lost $100, opened 50x long to get it back.' },
        { id: 'seedphrase', term: 'Seed Phrase', category: 'SECURITY', definition: '12-24 words key to your wallet. Never share.', example: 'Keep offline on paper.' },
        { id: 'phishing', term: 'Phishing', category: 'SECURITY', definition: 'Fake sites stealing credentials.', example: 'Don\'t click suspicious links.' },
        { id: 'defi', term: 'DeFi (Decentralized Finance)', category: 'TECHNICAL', definition: 'Financial services on blockchain without intermediaries.', example: 'Uniswap, Aave.' },
        { id: 'nft', term: 'NFT (Non-Fungible Token)', category: 'TECHNICAL', definition: 'Unique digital asset verified on blockchain.', example: 'Bored Ape Yacht Club.' },
        { id: 'staking', term: 'Staking', category: 'TECHNICAL', definition: 'Locking up coins to support network and earn rewards.', example: 'Staking ETH for 5% APY.' },
        { id: 'coldwallet', term: 'Cold Wallet', category: 'SECURITY', definition: 'Offline hardware wallet for maximum security.', example: 'Ledger, Trezor.' },
        { id: 'gas', term: 'Gas Fees', category: 'TECHNICAL', definition: 'Fee paid to miners/validators to process transactions.', example: 'High gas on Ethereum.' },
        { id: 'marketcap', term: 'Market Cap', category: 'TECHNICAL', definition: 'Total value of all coins in circulation (Price x Supply).', example: 'Bitcoin market cap > $1 Trillion.' }
    ],
    ua: [
        { id: 'rsi', term: 'RSI (Індекс відносної сили)', category: 'TECHNICAL', definition: 'Індикатор імпульсу (0-100). >70: Перекупленість (продаж). <30: Перепроданність (покупка).', example: 'RSI впав до 25 - сильний сигнал на покупку.' },
        { id: 'macd', term: 'MACD', category: 'TECHNICAL', definition: 'Індикатор тренду. "Золотий хрест" (перетин ліній) вказує на ріст.', example: 'Синя лінія перетнула червону знизу вгору.' },
        { id: 'smc', term: 'Smart Money Concepts (SMC)', category: 'TECHNICAL', definition: 'Методологія торгівлі, заснована на відстеженні інституційного потоку ордерів та ліквідності.', visualType: 'CHART_SMC', example: 'Торгуй разом з банками, а не проти них.' },
        { id: 'ob', term: 'Ордер Блок (OB)', category: 'TECHNICAL', definition: 'Остання протилежна свічка перед сильним імпульсним рухом, що ламає структуру. Часто діє як сильна підтримка/опір.', visualType: 'CHART_OB', example: 'Ціна торкнулася бичачого ордер блоку на 1H і розвернулася.' },
        { id: 'fvg', term: 'Імбаланс (FVG)', category: 'TECHNICAL', definition: 'Розрив справедливої вартості. Неефективність ціноутворення, що залишає прогалину між тінями 1-ї та 3-ї свічки.', visualType: 'CHART_FVG', example: 'Ціна повернулася, щоб перекрити FVG перед продовженням росту.' },
        { id: 'hns', term: 'Голова і Плечі', category: 'PATTERNS', definition: 'Патерн розвороту з 3 вершинами. Сигнал зміни тренду з бичачого на ведмежий.', visualType: 'CHART_HEAD_SHOULDERS', example: 'Ціна пробила лінію шиї вниз.' },
        { id: 'bullflag', term: 'Бичачий Прапор', category: 'PATTERNS', definition: 'Патерн продовження. Імпульс вгору, консолідація вниз, прорив вгору.', visualType: 'CHART_BULL_FLAG', example: 'Ціна відпочиває після росту на 10%.' },
        { id: 'doubletop', term: 'Подвійна Вершина', category: 'PATTERNS', definition: 'Ведмежий розворот. Ціна двічі вдаряється в опір і падає.', visualType: 'CHART_DOUBLE_TOP', example: 'Не вдалося пробити $70k двічі.' },
        { id: 'doublebottom', term: 'Подвійне Дно', category: 'PATTERNS', definition: 'Бичачий розворот "W". Ціна двічі відскакує від підтримки.', visualType: 'CHART_DOUBLE_BOTTOM', example: 'Відскік від $3000 двічі.' },
        { id: 'cupandhandle', term: 'Чашка з Ручкою', category: 'PATTERNS', definition: 'Бичачий патерн продовження, що нагадує чашку.', visualType: 'CHART_CUP_HANDLE', example: 'Довгострокова структура росту.' },
        { id: 'ascendingtriangle', term: 'Висхідний Трикутник', category: 'PATTERNS', definition: 'Бичачий патерн. Рівний верх, підсвищення низів.', visualType: 'CHART_ASC_TRIANGLE', example: 'Тиск до пробою $100.' },
        { id: 'descendingtriangle', term: 'Низхідний Трикутник', category: 'PATTERNS', definition: 'Ведмежий патерн. Рівне дно, зниження вершин.', visualType: 'CHART_DESC_TRIANGLE', example: 'Продавці тиснуть ціну вниз.' },
        { id: 'wedgebull', term: 'Падаючий Клин', category: 'PATTERNS', definition: 'Бичачий сигнал. Ціна звужується, рухаючись вниз.', visualType: 'CHART_WEDGE_BULL', example: 'Ймовірний прорив вгору.' },
        { id: 'wedgebear', term: 'Зростаючий Клин', category: 'PATTERNS', definition: 'Ведмежий сигнал. Ціна звужується, рухаючись вгору.', visualType: 'CHART_WEDGE_BEAR', example: 'Ймовірний прорив вниз.' },
        { id: 'doji', term: 'Свічка Доджі', category: 'PATTERNS', definition: 'Свічка, де Відкриття ≈ Закриття. Знак невизначеності.', visualType: 'CANDLE_DOJI', example: 'Доджі на вершині - можливий розворот.' },
        { id: 'hammer', term: 'Молот (Hammer)', category: 'PATTERNS', definition: 'Бичачий розворотний патерн. Маленьке тіло, довга нижня тінь.', visualType: 'CANDLE_HAMMER', example: 'Молот на рівні підтримки сигналізує про відскік.' },
        { id: 'engulfing', term: 'Поглинання (Engulfing)', category: 'PATTERNS', definition: 'Сильний сигнал розвороту, коли друга свічка повністю перекриває першу.', visualType: 'CANDLE_ENGULFING', example: 'Бичаче поглинання після спадного тренду.' },
        { id: 'morningstar', term: 'Ранкова Зірка', category: 'PATTERNS', definition: 'Бичачий розворотний патерн з 3 свічок. Ведмежа, Доджі, Бичача.', visualType: 'CANDLE_MORNING_STAR', example: 'Ранкова зірка сформувалася на дні.' },
        { id: 'shootingstar', term: 'Падаюча Зірка', category: 'PATTERNS', definition: 'Ведмежий розворотний патерн. Маленьке тіло, довга верхня тінь.', visualType: 'CANDLE_SHOOTING_STAR', example: 'Падаюча зірка на рівні опору.' },
        { id: 'fomo', term: 'FOMO (ФОМО)', category: 'PSYCHOLOGY', definition: 'Страх втраченої вигоди. Емоційні покупки на хаях.', example: 'Не купуй зелені свічки через FOMO.' },
        { id: 'fud', term: 'FUD (ФАД)', category: 'PSYCHOLOGY', definition: 'Страх, Невизначеність, Сумнів. Маніпуляція новинами.', example: 'Новини про заборону - це просто FUD.' },
        { id: 'revenge', term: 'Торгівля з помсти', category: 'PSYCHOLOGY', definition: 'Спроба негайно відіграти збитки за допомогою емоційних, незапланованих угод.', example: 'Втратив $100, відкрив лонг з 50x щоб повернути.' },
        { id: 'seedphrase', term: 'Сід-фраза', category: 'SECURITY', definition: '12-24 слова для доступу до гаманця. Нікому не давай.', example: 'Зберігай на папері в сейфі.' },
        { id: 'phishing', term: 'Фішинг', category: 'SECURITY', definition: 'Підроблені сайти для крадіжки паролів.', example: 'Не переходь за підозрілими посиланнями.' },
        { id: 'defi', term: 'DeFi (Децентралізовані Фінанси)', category: 'TECHNICAL', definition: 'Фінансові послуги на блокчейні без посередників.', example: 'Uniswap, Aave.' },
        { id: 'nft', term: 'NFT (Невзаємозамінний Токен)', category: 'TECHNICAL', definition: 'Унікальний цифровий актив на блокчейні.', example: 'Bored Ape Yacht Club.' },
        { id: 'staking', term: 'Стейкінг', category: 'TECHNICAL', definition: 'Блокування монет для підтримки мережі та отримання винагороди.', example: 'Стейкінг ETH під 5% річних.' },
        { id: 'coldwallet', term: 'Холодний Гаманець', category: 'SECURITY', definition: 'Офлайн апаратний гаманець для максимальної безпеки.', example: 'Ledger, Trezor.' },
        { id: 'gas', term: 'Газ (Комісія)', category: 'TECHNICAL', definition: 'Плата майнерам/валідаторам за обробку транзакцій.', example: 'Високий газ в мережі Ethereum.' },
        { id: 'marketcap', term: 'Ринкова Капіталізація', category: 'TECHNICAL', definition: 'Загальна вартість усіх монет в обігу (Ціна x Пропозиція).', example: 'Капіталізація Bitcoin > $1 Трлн.' }
    ],
    pl: [
        { id: 'rsi', term: 'RSI (Wskaźnik Siły Względnej)', category: 'TECHNICAL', definition: 'Wskaźnik momentum (0-100). >70: Wykupienie (sprzedaż). <30: Wyprzedanie (kupno).', example: 'RSI spadło do 25 - sygnał kupna.' },
        { id: 'macd', term: 'MACD', category: 'TECHNICAL', definition: 'Wskaźnik trendu. "Złoty Krzyż" sugeruje wejście.', example: 'Niebieska linia przecięła czerwoną w górę.' },
        { id: 'smc', term: 'Smart Money Concepts (SMC)', category: 'TECHNICAL', definition: 'Metodologia handlu oparta na śledzeniu przepływu zleceń instytucjonalnych i płynności.', visualType: 'CHART_SMC', example: 'Handluj z bankami, nie przeciwko nim.' },
        { id: 'ob', term: 'Order Block (OB)', category: 'TECHNICAL', definition: 'Ostatnia przeciwna świeca przed silnym ruchem impulsywnym, który łamie strukturę. Często działa jako silne wsparcie/opór.', visualType: 'CHART_OB', example: 'Cena dotknęła byczego bloku zleceń na 1H i odwróciła się.' },
        { id: 'fvg', term: 'Fair Value Gap (FVG)', category: 'TECHNICAL', definition: 'Nierównowaga w akcji cenowej pozostawiająca lukę między knotami 1. i 3. świecy w sekwencji 3 świec.', visualType: 'CHART_FVG', example: 'Cena wróciła, aby wypełnić FVG przed kontynuacją.' },
        { id: 'hns', term: 'Głowa z Ramionami', category: 'PATTERNS', definition: 'Formacja odwrócenia z 3 szczytami. Zmiana trendu na spadkowy.', visualType: 'CHART_HEAD_SHOULDERS', example: 'Cena przebiła linię szyi w dół.' },
        { id: 'bullflag', term: 'Flaga Byka', category: 'PATTERNS', definition: 'Formacja kontynuacji. Impuls w górę, konsolidacja, wybicie.', visualType: 'CHART_BULL_FLAG', example: 'Konsolidacja po 10% wzroście.' },
        { id: 'doubletop', term: 'Podwójny Szczyt', category: 'PATTERNS', definition: 'Odwrócenie spadkowe. Cena dwukrotnie uderza w opór.', visualType: 'CHART_DOUBLE_TOP', example: 'Nieudane przebicie $70k.' },
        { id: 'doublebottom', term: 'Podwójne Dno', category: 'PATTERNS', definition: 'Odwrócenie wzrostowe "W". Odbicie od wsparcia.', visualType: 'CHART_DOUBLE_BOTTOM', example: 'Odbicie od $3000 dwa razy.' },
        { id: 'cupandhandle', term: 'Filiżanka z Uchem', category: 'PATTERNS', definition: 'Wzrostowa formacja kontynuacji.', visualType: 'CHART_CUP_HANDLE', example: 'Długoterminowa struktura wzrostowa.' },
        { id: 'ascendingtriangle', term: 'Trójkąt Zwyżkujący', category: 'PATTERNS', definition: 'Formacja byka. Płaski opór, rosnące wsparcie.', visualType: 'CHART_ASC_TRIANGLE', example: 'Presja na przebicie $100.' },
        { id: 'descendingtriangle', term: 'Trójkąt Zniżkujący', category: 'PATTERNS', definition: 'Formacja niedźwiedzia. Płaskie wsparcie, spadający opór.', visualType: 'CHART_DESC_TRIANGLE', example: 'Presja sprzedażowa rośnie.' },
        { id: 'wedgebull', term: 'Klin Zniżkujący', category: 'PATTERNS', definition: 'Sygnał byka. Cena spada w zwężającym się zakresie.', visualType: 'CHART_WEDGE_BULL', example: 'Prawdopodobne wybicie w górę.' },
        { id: 'wedgebear', term: 'Klin Zwyżkujący', category: 'PATTERNS', definition: 'Sygnał niedźwiedzia. Cena rośnie w zwężającym się zakresie.', visualType: 'CHART_WEDGE_BEAR', example: 'Prawdopodobne wybicie w dół.' },
        { id: 'doji', term: 'Świeca Doji', category: 'PATTERNS', definition: 'Świeca gdzie Otwarcie ≈ Zamknięcie. Niepewność.', visualType: 'CANDLE_DOJI', example: 'Doji na szczycie - możliwe odwrócenie.' },
        { id: 'hammer', term: 'Młot (Hammer)', category: 'PATTERNS', definition: 'Bycza formacja odwrócenia. Małe ciało, długi dolny knot.', visualType: 'CANDLE_HAMMER', example: 'Młot na wsparciu sygnalizuje odbicie.' },
        { id: 'engulfing', term: 'Objęcie (Engulfing)', category: 'PATTERNS', definition: 'Silny sygnał odwrócenia, gdzie druga świeca całkowicie zakrywa pierwszą.', visualType: 'CANDLE_ENGULFING', example: 'Bycze objęcie po trendzie spadkowym.' },
        { id: 'morningstar', term: 'Gwiazda Poranna', category: 'PATTERNS', definition: '3-świecowa bycza formacja odwrócenia. Niedźwiedzia, Doji, Bycza.', visualType: 'CANDLE_MORNING_STAR', example: 'Gwiazda poranna uformowała się na dnie.' },
        { id: 'shootingstar', term: 'Spadająca Gwiazda', category: 'PATTERNS', definition: 'Niedźwiedzia formacja odwrócenia. Małe ciało, długi górny knot.', visualType: 'CANDLE_SHOOTING_STAR', example: 'Spadająca gwiazda na oporze.' },
        { id: 'fomo', term: 'FOMO', category: 'PSYCHOLOGY', definition: 'Strach przed pominięciem. Emocjonalne zakupy na szczycie.', example: 'Nie kupuj zielonych świec przez FOMO.' },
        { id: 'fud', term: 'FUD', category: 'PSYCHOLOGY', definition: 'Strach, Niepewność, Wątpliwość. Manipulacja newsami.', example: 'Newsy o banach to często FUD.' },
        { id: 'seedphrase', term: 'Fraza Seed', category: 'SECURITY', definition: '12-24 słowa klucza do portfela. Nikomu nie podawaj.', example: 'Trzymaj offline na papierze.' },
        { id: 'phishing', term: 'Phishing', category: 'SECURITY', definition: 'Fałszywe strony kradnące dane.', example: 'Nie klikaj w podejrzane linki.' },
        { id: 'defi', term: 'DeFi', category: 'TECHNICAL', definition: 'Finanse zdecentralizowane na blockchainie.', example: 'Uniswap, Aave.' },
        { id: 'nft', term: 'NFT', category: 'TECHNICAL', definition: 'Unikalny token cyfrowy.', example: 'Bored Ape Yacht Club.' },
        { id: 'staking', term: 'Staking', category: 'TECHNICAL', definition: 'Blokowanie monet dla nagród.', example: 'Staking ETH na 5%.' },
        { id: 'coldwallet', term: 'Zimny Portfel', category: 'SECURITY', definition: 'Portfel offline dla bezpieczeństwa.', example: 'Ledger, Trezor.' },
        { id: 'gas', term: 'Opłaty Gas', category: 'TECHNICAL', definition: 'Opłata za transakcje w sieci.', example: 'Wysoki gas na Ethereum.' },
        { id: 'marketcap', term: 'Kapitalizacja Rynkowa', category: 'TECHNICAL', definition: 'Całkowita wartość monet w obiegu.', example: 'Bitcoin > $1 Bln.' }
    ]
};

// Visual Components for Patterns using Custom SVG Candlesticks
const ChartPattern: React.FC<{ type: AcademyTerm['visualType'] }> = ({ type }) => {
    if (!type || type === 'NONE') return null;

    const getData = (type: string) => {
        // Data format: {o: open, h: high, l: low, c: close}
        switch(type) {
            case 'CHART_HEAD_SHOULDERS': return [
                {o: 20, c: 40, h: 45, l: 15}, {o: 40, c: 30, h: 42, l: 25}, // Left shoulder
                {o: 30, c: 60, h: 65, l: 28}, {o: 60, c: 30, h: 62, l: 25}, // Head
                {o: 30, c: 45, h: 48, l: 28}, {o: 45, c: 20, h: 47, l: 15}, // Right shoulder
            ];
            case 'CHART_DOUBLE_TOP': return [
                {o: 20, c: 80, h: 85, l: 15}, {o: 80, c: 40, h: 82, l: 35}, // First top
                {o: 40, c: 80, h: 85, l: 35}, {o: 80, c: 20, h: 82, l: 15}, // Second top
            ];
            case 'CHART_DOUBLE_BOTTOM': return [
                {o: 80, c: 20, h: 85, l: 15}, {o: 20, c: 60, h: 65, l: 15}, // First bottom
                {o: 60, c: 20, h: 65, l: 15}, {o: 20, c: 80, h: 85, l: 15}, // Second bottom
            ];
            case 'CHART_BULL_FLAG': return [
                {o: 20, c: 80, h: 85, l: 15}, // Pole
                {o: 80, c: 70, h: 82, l: 65}, {o: 70, c: 75, h: 78, l: 68}, {o: 75, c: 65, h: 78, l: 60}, {o: 65, c: 70, h: 72, l: 62}, // Flag
                {o: 70, c: 95, h: 100, l: 65} // Breakout
            ];
            case 'CHART_CUP_HANDLE': return [
                {o: 80, c: 40, h: 85, l: 35}, {o: 40, c: 20, h: 45, l: 15}, {o: 20, c: 20, h: 25, l: 15}, {o: 20, c: 40, h: 45, l: 15}, {o: 40, c: 80, h: 85, l: 35}, // Cup
                {o: 80, c: 70, h: 82, l: 65}, {o: 70, c: 75, h: 78, l: 68}, // Handle
                {o: 75, c: 95, h: 100, l: 70} // Breakout
            ];
            case 'CHART_ASC_TRIANGLE': return [
                {o: 20, c: 80, h: 85, l: 15}, {o: 80, c: 40, h: 82, l: 35}, 
                {o: 40, c: 80, h: 85, l: 35}, {o: 80, c: 60, h: 82, l: 55}, 
                {o: 60, c: 80, h: 85, l: 55}, {o: 80, c: 100, h: 105, l: 75}
            ];
            case 'CHART_DESC_TRIANGLE': return [
                {o: 80, c: 20, h: 85, l: 15}, {o: 20, c: 60, h: 65, l: 15}, 
                {o: 60, c: 20, h: 65, l: 15}, {o: 20, c: 40, h: 45, l: 15}, 
                {o: 40, c: 20, h: 45, l: 15}, {o: 20, c: 0, h: 25, l: 0}
            ];
            case 'CHART_WEDGE_BULL': return [
                {o: 80, c: 40, h: 85, l: 35}, {o: 40, c: 70, h: 75, l: 35}, 
                {o: 70, c: 35, h: 75, l: 30}, {o: 35, c: 60, h: 65, l: 30}, 
                {o: 60, c: 30, h: 65, l: 25}, {o: 30, c: 90, h: 95, l: 25}
            ];
            case 'CHART_WEDGE_BEAR': return [
                {o: 20, c: 60, h: 65, l: 15}, {o: 60, c: 30, h: 65, l: 25}, 
                {o: 30, c: 65, h: 70, l: 25}, {o: 65, c: 40, h: 70, l: 35}, 
                {o: 40, c: 70, h: 75, l: 35}, {o: 70, c: 10, h: 75, l: 5}
            ];
            case 'CHART_OB': return [
                {o: 80, c: 20, h: 85, l: 15}, {o: 20, c: 10, h: 25, l: 5}, // Down trend
                {o: 10, c: 50, h: 55, l: 5}, {o: 50, c: 90, h: 95, l: 45}, // Strong impulse up
                {o: 90, c: 60, h: 95, l: 55}, {o: 60, c: 15, h: 65, l: 10}, // Retest of OB
                {o: 15, c: 80, h: 85, l: 10} // Bounce
            ];
            case 'CHART_FVG': return [
                {o: 20, c: 40, h: 45, l: 15}, // Candle 1 (High at 45)
                {o: 40, c: 80, h: 85, l: 35}, // Candle 2 (Large body)
                {o: 80, c: 90, h: 95, l: 75}, // Candle 3 (Low at 75) -> Gap between 45 and 75
                {o: 90, c: 60, h: 95, l: 55}  // Retracement filling gap
            ];
            case 'CHART_SMC': return [
                {o: 50, c: 60, h: 65, l: 45}, {o: 60, c: 50, h: 65, l: 45}, // Liquidity build up
                {o: 50, c: 20, h: 55, l: 15}, // Liquidity sweep (Stop hunt)
                {o: 20, c: 80, h: 85, l: 15}, {o: 80, c: 90, h: 95, l: 75} // Real move
            ];
            default: return [];
        }
    };

    const data = getData(type);
    const isBullish = ['CHART_DOUBLE_BOTTOM', 'CHART_BULL_FLAG', 'CHART_CUP_HANDLE', 'CHART_ASC_TRIANGLE', 'CHART_WEDGE_BULL'].includes(type);

    if (type === 'CANDLE_DOJI') {
        return (
            <div className="h-32 w-full bg-black/40 rounded-lg border border-white/5 mb-3 flex items-center justify-center relative overflow-hidden">
                <svg viewBox="0 0 100 100" className="w-full h-full p-4">
                    <line x1="50" y1="10" x2="50" y2="90" stroke="white" strokeWidth="2" />
                    <rect x="45" y="48" width="10" height="4" fill="white" />
                    <text x="65" y="52" fill="#aaa" fontSize="10" stroke="none">OPEN ≈ CLOSE</text>
                </svg>
            </div>
        );
    }

    return (
        <div className="h-40 w-full bg-black/40 rounded-lg border border-white/5 mb-3 relative overflow-hidden">
             {/* Grid Background */}
             <div className="absolute inset-0" style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
             
             <div className="absolute inset-0 p-4 flex items-end justify-between">
                 <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                     {data.map((d, i) => {
                         const isUp = d.c >= d.o;
                         const color = isUp ? '#22c55e' : '#ef4444';
                         const x = (i / (data.length - 1)) * 90 + 5; // Spread evenly
                         // Invert Y axis because SVG 0,0 is top-left
                         const yHigh = 100 - d.h;
                         const yLow = 100 - d.l;
                         const yOpen = 100 - d.o;
                         const yClose = 100 - d.c;
                         const bodyTop = Math.min(yOpen, yClose);
                         const bodyHeight = Math.max(Math.abs(yOpen - yClose), 1); // min 1px height

                         return (
                             <g key={i} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                                 {/* Wick */}
                                 <line x1={x} y1={yHigh} x2={x} y2={yLow} stroke={color} strokeWidth="1" />
                                 {/* Body */}
                                 <rect x={x - 2} y={bodyTop} width="4" height={bodyHeight} fill={color} />
                             </g>
                         );
                     })}
                     
                     {/* Add specific highlights for OB, FVG, SMC */}
                     {type === 'CHART_OB' && (
                         <g className="animate-fade-in" style={{ animationDelay: '1000ms' }}>
                             {/* Highlight the OB candle (index 1) */}
                             <rect x={(1 / 6) * 90 + 5 - 4} y={100 - 25} width="8" height={15} fill="rgba(0, 240, 255, 0.3)" />
                             <line x1={0} y1={100 - 25} x2={100} y2={100 - 25} stroke="rgba(0, 240, 255, 0.5)" strokeDasharray="2" />
                             <line x1={0} y1={100 - 10} x2={100} y2={100 - 10} stroke="rgba(0, 240, 255, 0.5)" strokeDasharray="2" />
                             <text x="80" y={100 - 15} fill="#00F0FF" fontSize="4" fontWeight="bold">OB</text>
                         </g>
                     )}
                     {type === 'CHART_FVG' && (
                         <g className="animate-fade-in" style={{ animationDelay: '1000ms' }}>
                             {/* Highlight the FVG gap between candle 0 high and candle 2 low */}
                             <rect x={(1 / 3) * 90 + 5 - 4} y={100 - 75} width="8" height={30} fill="rgba(168, 85, 247, 0.3)" />
                             <line x1={0} y1={100 - 75} x2={100} y2={100 - 75} stroke="rgba(168, 85, 247, 0.5)" strokeDasharray="2" />
                             <line x1={0} y1={100 - 45} x2={100} y2={100 - 45} stroke="rgba(168, 85, 247, 0.5)" strokeDasharray="2" />
                             <text x="80" y={100 - 60} fill="#a855f7" fontSize="4" fontWeight="bold">FVG</text>
                         </g>
                     )}
                     {type === 'CHART_SMC' && (
                         <g className="animate-fade-in" style={{ animationDelay: '1000ms' }}>
                             {/* Highlight the liquidity sweep at candle 2 */}
                             <line x1={0} y1={100 - 45} x2={100} y2={100 - 45} stroke="rgba(239, 68, 68, 0.5)" strokeDasharray="2" />
                             <text x="5" y={100 - 47} fill="#ef4444" fontSize="4">OLD LOW</text>
                             <circle cx={(2 / 4) * 90 + 5} cy={100 - 15} r="2" fill="none" stroke="#ef4444" strokeWidth="0.5" className="animate-ping" />
                             <text x={(2 / 4) * 90 + 5 + 3} y={100 - 15} fill="#ef4444" fontSize="4" fontWeight="bold">SWEEP</text>
                         </g>
                     )}
                 </svg>
             </div>

            <div className="absolute top-2 right-2 px-2 py-1 rounded bg-black/60 border border-white/10 text-[8px] font-mono text-white">
                {isBullish ? 'BULLISH' : 'BEARISH'}
            </div>
        </div>
    );
};

const QUIZZES: Record<Language, Record<string, { question: string; options: string[]; answer: string }>> = {
    en: {
        rsi: { question: "Is RSI > 70 considered Overbought or Oversold?", options: ["Overbought", "Oversold"], answer: "Overbought" },
        macd: { question: "What does a Golden Cross suggest?", options: ["Bullish Entry", "Bearish Exit"], answer: "Bullish Entry" },
        ob: { question: "What does Order Block (OB) act as?", options: ["Strong Support/Resistance", "Irrelevant Price Point"], answer: "Strong Support/Resistance" },
        fvg: { question: "What does FVG represent in price action?", options: ["Price Imbalance / Gap", "Perfect Volume Balance"], answer: "Price Imbalance / Gap" },
        hns: { question: "Head & Shoulders is what type of pattern?", options: ["Reversal", "Continuation"], answer: "Reversal" },
        bullflag: { question: "Bull Flag signals potential movement in which direction?", options: ["Upward Continuation", "Downward Reversal"], answer: "Upward Continuation" },
        fomo: { question: "What does FOMO stand for?", options: ["Fear Of Missing Out", "Future Options Market Order"], answer: "Fear Of Missing Out" },
        fud: { question: "What does FUD usually cause in traders?", options: ["Panic Selling", "Rational Hodling"], answer: "Panic Selling" },
        seedphrase: { question: "Who should you share your seed phrase with?", options: ["Nobody", "StorkCrypto Support"], answer: "Nobody" },
        coldwallet: { question: "Where does a Cold Wallet store private keys?", options: ["Offline on Hardware", "Online in Cloud"], answer: "Offline on Hardware" }
    },
    ua: {
        rsi: { question: "Показник RSI > 70 означає Перекупленість чи Перепроданість?", options: ["Перекупленість", "Перепроданість"], answer: "Перекупленість" },
        macd: { question: "На що вказує 'Золотий хрест'?", options: ["Вхід у лонг", "Вихід з позиції"], answer: "Вхід у лонг" },
        ob: { question: "Чим виступає Ордер Блок (OB)?", options: ["Підтримкою/Опором", "Жодним чином не впливає"], answer: "Підтримкою/Опором" },
        fvg: { question: "Що таке Імбаланс (FVG)?", options: ["Неефективність ціни / Розрив", "Рівномірний розподіл купівель"], answer: "Неефективність ціни / Розрив" },
        hns: { question: "Який тип патерну 'Голова і Плечі'?", options: ["Патерн розвороту", "Патерн продовження тренду"], answer: "Патерн розвороту" },
        bullflag: { question: "Бичачий Прапор сигналізує про:", options: ["Продовження росту", "Розворот тренду вниз"], answer: "Продовження росту" },
        fomo: { question: "Що означає FOMO?", options: ["Страх втраченої вигоди", "Швидке виконання ордерів"], answer: "Страх втраченої вигоди" },
        fud: { question: "Що зазвичай провокує FUD?", options: ["Панічні продажі", "Раціональне утримання"], answer: "Панічні продажі" },
        seedphrase: { question: "З ким можна ділитися сід-фразою?", options: ["Ні з ким", "Підтримка StorkCrypto"], answer: "Ні з ким" },
        coldwallet: { question: "Де зберігає приватні ключі Холодний Гаманець?", options: ["Офлайн на пристрої", "Онлайн в хмарі"], answer: "Офлайн на пристрої" }
    },
    pl: {
        rsi: { question: "Czy RSI > 70 oznacza Wykupienie czy Wyprzedanie?", options: ["Wykupienie", "Wyprzedanie"], answer: "Wykupienie" },
        macd: { question: "Co sugeruje Złoty Krzyż?", options: ["Wejście (Bullish)", "Wyjście (Bearish)"], answer: "Wejście (Bullish)" },
        ob: { question: "Czym jest Order Block (OB)?", options: ["Silnym wsparciem/oporem", "Nieistotnym punktem"], answer: "Silnym wsparciem/oporem" },
        fvg: { question: "Co FVG reprezentuje w akcji cenowej?", options: ["Nierównowagę cenową / Lukę", "Idealny bilans wolumenu"], answer: "Nierównowagę cenową / Lukę" },
        hns: { question: "Jakim typem formacji jest Głowa z Ramionami?", options: ["Odwrócenia", "Kontynuacji"], answer: "Odwrócenia" },
        bullflag: { question: "W jakim kierunku sugeruje ruch Flaga Byka?", options: ["Kontynuacja wzrostów", "Odwrócenie spadków"], answer: "Kontynuacja wzrostów" },
        fomo: { question: "Co oznacza skrót FOMO?", options: ["Strach przed pominięciem", "Zlecenie opcji rynkowych"], answer: "Strach przed pominięciem" },
        fud: { question: "Co zazwyczaj wywołuje FUD u inwestorów?", options: ["Paniczną sprzedaż", "Racjonalny HODLing"], answer: "Paniczną sprzedaż" },
        seedphrase: { question: "Komu powinieneś udostępnić frazę seed?", options: ["Nikomu", "Wsparciu StorkCrypto"], answer: "Nikomu" },
        coldwallet: { question: "Gdzie zimny portfel przechowuje klucze prywatne?", options: ["Offline na urządzeniu", "Online w chmurze"], answer: "Offline na urządzeniu" }
    }
};

const AcademyModal: React.FC<AcademyModalProps> = ({ onClose }) => {
    const { settings, addXp, showToast } = useStore();
    const t = (key: string) => getTranslation(settings.language, key);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [filter, setFilter] = useState<'ALL' | AcademyTerm['category']>('ALL');
    const [search, setSearch] = useState('');
    
    // Quiz state variables
    const [quizActiveId, setQuizActiveId] = useState<string | null>(null);
    const [quizSelectedOption, setQuizSelectedOption] = useState<string | null>(null);
    const [quizCorrect, setQuizCorrect] = useState<boolean | null>(null);
    const [quizCompletedIds, setQuizCompletedIds] = useState<Record<string, boolean>>({});

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    // Load terms based on selected language, fallback to EN if missing
    const currentTerms = ACADEMY_CONTENT[settings.language] || ACADEMY_CONTENT['en'];

    const filteredTerms = currentTerms.filter(item => {
        const matchesSearch = item.term.toLowerCase().includes(search.toLowerCase()) || 
                              item.definition.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'ALL' || item.category === filter;
        return matchesSearch && matchesFilter;
    });

    const categories: AcademyTerm['category'][] = ['TECHNICAL', 'PATTERNS', 'PSYCHOLOGY', 'SECURITY'];

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto overscroll-contain"
        >
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md animate-fade-in" onClick={onClose}></div>
            
            <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative z-10 w-full max-w-lg bg-brand-bg border border-brand-border rounded-[2rem] overflow-hidden shadow-[0_0_60px_rgba(0,240,255,0.15)] flex flex-col max-h-[90vh] sm:max-h-[85vh] my-auto"
            >
                
                {/* Header */}
                <div className="p-5 border-b border-brand-border bg-brand-card z-10 shrink-0">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-brand-purple/10 border border-brand-purple/30 flex items-center justify-center">
                                <BookIcon className="w-5 h-5 text-brand-purple" />
                            </div>
                            <div>
                                <h2 className="font-orbitron font-bold text-base sm:text-lg text-white">{t('academy.title')}</h2>
                                <p className="text-[10px] text-slate-400 font-space-mono">{t('academy.subtitle')}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors">✕</button>
                    </div>

                    <div className="relative mb-3">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input 
                            type="text" 
                            placeholder={t('add.search')} 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:border-brand-purple outline-none"
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        <button 
                            onClick={() => setFilter('ALL')}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border whitespace-nowrap transition-all ${filter === 'ALL' ? 'bg-brand-purple text-white border-brand-purple' : 'bg-black/30 border-white/10 text-slate-500'}`}
                        >
                            ALL
                        </button>
                        {categories.map(cat => (
                            <button 
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border whitespace-nowrap transition-all ${filter === cat ? 'bg-brand-purple text-white border-brand-purple' : 'bg-black/30 border-white/10 text-slate-500'}`}
                            >
                                {t(`academy.${cat.toLowerCase()}`)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-5 bg-cyber-grid bg-[length:40px_40px] overscroll-contain">
                    <div className="grid gap-3">
                        {filteredTerms.length > 0 ? filteredTerms.map((item, idx) => (
                            <div 
                                key={item.id}
                                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                                className={`bg-brand-card/80 backdrop-blur-sm border rounded-xl overflow-hidden transition-all duration-300 cursor-pointer shadow-inner ${
                                    expandedId === item.id 
                                    ? 'border-brand-cyan shadow-[0_0_15px_rgba(0,240,255,0.15)]' 
                                    : 'border-white/5 hover:border-brand-cyan/30'
                                }`}
                                style={{ animationDelay: `${idx * 50}ms` }}
                            >
                                <div className="p-4 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${
                                            item.category === 'TECHNICAL' ? 'bg-brand-cyan' : 
                                            item.category === 'PATTERNS' ? 'bg-brand-danger' : 
                                            'bg-brand-success'
                                        }`}></div>
                                        <div>
                                            <span className="font-bold text-white text-sm block">{item.term}</span>
                                            <span className="text-[9px] text-slate-500 font-mono uppercase">{t(`academy.${item.category.toLowerCase()}`)}</span>
                                        </div>
                                    </div>
                                    <ChevronRightIcon className={`w-4 h-4 text-slate-500 transition-transform ${expandedId === item.id ? 'rotate-90 text-brand-cyan' : ''}`} />
                                </div>
                                
                                {expandedId === item.id && (
                                    <div className="px-4 pb-4 animate-fade-in bg-black/20">
                                        <div className="h-[1px] w-full bg-white/5 mb-3"></div>
                                        
                                        <p className="text-sm text-slate-300 leading-relaxed font-space-mono mb-4">
                                            {item.definition}
                                        </p>

                                        {item.visualType && <ChartPattern type={item.visualType} />}

                                        <div className="bg-brand-cyan/5 rounded-lg p-3 border-l-2 border-brand-cyan mb-3">
                                            <p className="text-[10px] text-brand-cyan uppercase font-bold mb-1">Ex:</p>
                                            <p className="text-xs text-slate-300 italic">"{item.example}"</p>
                                        </div>
                                        {quizCompletedIds[item.id] ? (
                                            <div className="w-full p-3 rounded-lg border border-brand-success/30 bg-brand-success/10 text-brand-success text-center text-xs font-black uppercase flex items-center justify-center gap-2 animate-pulse">
                                                <span>✓</span> {settings.language === 'ua' ? 'ПРОЙДЕНО (+50 XP ОТРИМАНО)' : settings.language === 'pl' ? 'UKOŃCZONE (+50 XP OTRZYMANE)' : 'COMPLETED (+50 XP COLLECTED)'}
                                            </div>
                                        ) : quizActiveId === item.id ? (
                                            <div 
                                                className="w-full p-4 rounded-xl border border-white/10 bg-black/40 space-y-3"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <p className="text-xs font-bold text-slate-300">
                                                    {QUIZZES[settings.language]?.[item.id]?.question || 
                                                     QUIZZES['en']?.[item.id]?.question || 
                                                     (settings.language === 'ua' ? "Чи ви зрозуміли визначення цього терміну?" : settings.language === 'pl' ? "Czy rozumiesz to pojęcie?" : "Do you understand the core definition of this term?")}
                                                </p>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {(QUIZZES[settings.language]?.[item.id]?.options || 
                                                      QUIZZES['en']?.[item.id]?.options || 
                                                      (settings.language === 'ua' ? ["Так, зрозумів", "Ні, ще читаю"] : settings.language === 'pl' ? ["Tak, rozumiem", "Nie do końca"] : ["Yes, completely", "Not yet"])).map((opt) => (
                                                        <button
                                                            key={opt}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const correctAns = QUIZZES[settings.language]?.[item.id]?.answer || 
                                                                                   QUIZZES['en']?.[item.id]?.answer ||
                                                                                   opt; // generic default always passes
                                                                                   
                                                                if (opt === correctAns || opt.startsWith("Yes") || opt.startsWith("Так") || opt.startsWith("Tak")) {
                                                                    addXp(50);
                                                                    setQuizCompletedIds(prev => ({ ...prev, [item.id]: true }));
                                                                    setQuizActiveId(null);
                                                                    showToast(settings.language === 'ua' ? 'Вірно! +50 XP додано.' : settings.language === 'pl' ? 'Prawidłowo! +50 XP dodane.' : 'Correct! +50 XP added.');
                                                                } else {
                                                                    setQuizCorrect(false);
                                                                    showToast(settings.language === 'ua' ? 'Невірно! Спробуйте ще раз.' : settings.language === 'pl' ? 'Niewłaściwa odpowiedź. Spróbuj ponownie.' : 'Incorrect! Try again.');
                                                                    setTimeout(() => setQuizCorrect(null), 1500);
                                                                }
                                                            }}
                                                            className="py-2.5 px-3 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white hover:bg-brand-purple/10 hover:border-brand-purple/40 font-bold transition-all text-center leading-tight active:scale-95"
                                                        >
                                                            {opt}
                                                        </button>
                                                    ))}
                                                </div>
                                                {quizCorrect === false && (
                                                    <p className="text-[9px] text-brand-danger text-center animate-bounce uppercase font-bold">
                                                        {settings.language === 'ua' ? 'Спробуйте іншу відповідь!' : settings.language === 'pl' ? 'Spróbuj ponownie!' : 'Try a different option!'}
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setQuizActiveId(item.id);
                                                    setQuizSelectedOption(null);
                                                    setQuizCorrect(null);
                                                }}
                                                className="w-full py-3 bg-brand-purple hover:bg-brand-purple/80 text-white font-black uppercase text-xs rounded-xl shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2"
                                            >
                                                ⚡ {settings.language === 'ua' ? 'ЗАПУСТИТИ КВІЗ (+50 XP)' : settings.language === 'pl' ? 'URUCHOM QUIZ (+50 XP)' : 'START QUIZ (+50 XP)'}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )) : (
                            <div className="text-center py-10 text-slate-500 text-xs">
                                No terms found.
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default AcademyModal;
