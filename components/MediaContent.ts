
import { AcademyTerm, Language } from '../../types';

export const ACADEMY_DATABASE: Record<Language, AcademyTerm[]> = {
    en: [
        { id: 'rsi', term: 'RSI (Relative Strength)', category: 'TECHNICAL', definition: 'Momentum indicator measuring speed and change of price movements.', example: 'RSI > 70 is overbought.', visualType: 'NONE' },
        { id: 'hns', term: 'Head & Shoulders', category: 'PATTERNS', definition: 'A reversal pattern with three peaks.', visualType: 'CHART_HEAD_SHOULDERS', example: 'Market top signal.' },
        { id: 'bullflag', term: 'Bull Flag', category: 'PATTERNS', definition: 'A continuation pattern after sharp price rise.', visualType: 'CHART_BULL_FLAG', example: 'Trend resumption.' },
        { id: 'bart', term: 'Bart Simpson', category: 'PATTERNS', definition: 'Sharp pump, consolidation, sharp dump. Typical market maker manipulation.', example: 'Short squeeze followed by liquidation.' },
        { id: 'fallingwedge', term: 'Falling Wedge', category: 'PATTERNS', definition: 'Bullish pattern where price consolidates lower with converging trendlines.', visualType: 'CHART_WEDGE_BULL', example: 'Breakout imminent.' },
        { id: 'risingwedge', term: 'Rising Wedge', category: 'PATTERNS', definition: 'Bearish pattern with higher highs and higher lows but converging trendlines.', visualType: 'CHART_WEDGE_BEAR', example: 'Trend exhaustion.' },
        { id: 'doji', term: 'Doji', category: 'PATTERNS', definition: 'Candlestick where open and close prices are virtually equal. Signals indecision.', visualType: 'CANDLE_DOJI', example: 'Potential reversal.' },
        { id: 'fomo', term: 'FOMO', category: 'PSYCHOLOGY', definition: 'Fear Of Missing Out. The emotional urge to buy when price is pumping.', example: 'Buying the top.' }
    ],
    ua: [
        { id: 'rsi', term: 'RSI (Індекс сили)', category: 'TECHNICAL', definition: 'Індикатор імпульсу, що вимірює швидкість зміни ціни.', example: 'RSI > 70 — перекупленість.', visualType: 'NONE' },
        { id: 'hns', term: 'Голова і Плечі', category: 'PATTERNS', definition: 'Патерн розвороту з трьома вершинами.', visualType: 'CHART_HEAD_SHOULDERS', example: 'Сигнал розвороту вниз.' },
        { id: 'bullflag', term: 'Бичачий Прапор', category: 'PATTERNS', definition: 'Патерн продовження після різкого росту.', visualType: 'CHART_BULL_FLAG', example: 'Продовження тренду.' },
        { id: 'bart', term: 'Барт Сімпсон', category: 'PATTERNS', definition: 'Різкий памп, боковик, різкий дамп. Маніпуляція маркет-мейкера.', example: 'Ліквідація шортів та лонгів.' },
        { id: 'fallingwedge', term: 'Падаючий Клин', category: 'PATTERNS', definition: 'Бичачий патерн, ціна звужується вниз.', visualType: 'CHART_WEDGE_BULL', example: 'Очікується прорив вгору.' },
        { id: 'risingwedge', term: 'Зростаючий Клин', category: 'PATTERNS', definition: 'Ведмежий патерн, ціна звужується вгору.', visualType: 'CHART_WEDGE_BEAR', example: 'Виснаження тренду.' },
        { id: 'doji', term: 'Доджі', category: 'PATTERNS', definition: 'Свічка, де відкриття і закриття майже однакові. Невизначеність.', visualType: 'CANDLE_DOJI', example: 'Можливий розворот.' },
        { id: 'fomo', term: 'FOMO', category: 'PSYCHOLOGY', definition: 'Страх втраченої вигоди. Емоційна покупка на хаях.', example: 'Купівля на верхах.' }
    ],
    pl: [
        { id: 'rsi', term: 'RSI (Wskaźnik Siły)', category: 'TECHNICAL', definition: 'Wskaźnik mierzący prędkość zmian cen.', example: 'RSI > 70 to wykupienie.', visualType: 'NONE' },
        { id: 'hns', term: 'Głowa i Ramiona', category: 'PATTERNS', definition: 'Formacja odwrócenia z trzema szczytami.', visualType: 'CHART_HEAD_SHOULDERS', example: 'Sygnał spadku.' },
        { id: 'bullflag', term: 'Flaga Byka', category: 'PATTERNS', definition: 'Formacja kontynuacji po wzroście.', visualType: 'CHART_BULL_FLAG', example: 'Wznowienie trendu.' },
        { id: 'bart', term: 'Bart Simpson', category: 'PATTERNS', definition: 'Szybki wzrost, konsolidacja, szybki spadek. Manipulacja.', example: 'Likwidacja pozycji.' },
        { id: 'fallingwedge', term: 'Klin Zniżkujący', category: 'PATTERNS', definition: 'Formacja byka, cena zacieśnia się w dół.', visualType: 'CHART_WEDGE_BULL', example: 'Wybicie w górę.' },
        { id: 'risingwedge', term: 'Klin Zwyżkujący', category: 'PATTERNS', definition: 'Formacja niedźwiedzia, cena zacieśnia się w górę.', visualType: 'CHART_WEDGE_BEAR', example: 'Koniec trendu.' },
        { id: 'doji', term: 'Doji', category: 'PATTERNS', definition: 'Świeca otwarcia równa zamknięciu. Niepewność.', visualType: 'CANDLE_DOJI', example: 'Możliwe odwrócenie.' },
        { id: 'fomo', term: 'FOMO', category: 'PSYCHOLOGY', definition: 'Strach przed pominięciem. Emocjonalne zakupy.', example: 'Kupowanie na szczycie.' }
    ]
};
