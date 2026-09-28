import { AcademyTerm, Language } from '../types';

export const ACADEMY_DATABASE: Record<Language, AcademyTerm[]> = {
    ua: [
        // ==========================================
        // 1. ОСНОВИ КРИПТОВАЛЮТ ТА БЕЗПЕКА (BASICS & SECURITY)
        // ==========================================
        {
            id: 'wallets_storage',
            term: 'Гаманці: Холодні, Гарячі та Сід-фрази',
            category: 'SECURITY',
            definition: '«Not your keys, not your coins». Зберігання на біржі означає, що ключами володіє біржа. Холодні апаратні гаманці зберігають ключі офлайн, повністю ізольованими від шкідливого ПЗ.',
            example: 'Тримаю 85% капіталу на апаратному гаманці, а робочий депозит — на біржі.',
            visualType: 'NONE',
            videoData: {
                youtubeId: 'd8IBpfs9bf4',
                title: 'What are Crypto Wallets｜Explained for beginners',
                duration: '5:12',
                sourceName: 'Binance Academy (Official Video)',
                provider: 'binance',
                spokenLanguage: 'en',
                subtitleLanguages: ['uk', 'en'],
                officialArticleUrl: 'https://academy.binance.com/uk/articles/crypto-wallet-types-explained',
                fallbackUrl: 'https://academy.binance.com/uk/articles/crypto-wallet-types-explained',
                sourceVerifiedAt: '2026-09-28',
                embedStatus: 'verified',
                disclaimer: 'Офіційний освітній матеріал Binance Academy. Не є фінансовою порадою.',
                takeaways: [
                    'Ніколи не зберігайте сід-фразу на комп\'ютері, у хмарі, нотатках чи у вигляді скріншота в телефоні.',
                    'Запишіть 12-24 слова виключно на папері або металевій пластині і сховайте в надійному місці.',
                    'Співробітники підтримки StorkCrypto або біржі ніколи і за жодних обставин не попросять вашу сід-фразу.'
                ],
                officialSources: [
                    { name: 'Binance Academy', url: 'https://academy.binance.com/uk/articles/crypto-wallet-types-explained', badge: '🟡 Binance Гайд' },
                    { name: 'Bybit Learn', url: 'https://learn.bybit.com/crypto/what-is-a-crypto-wallet/', badge: '🟠 Bybit Wallets' },
                    { name: 'OKX Learn', url: 'https://www.okx.com/en-us/learn/tag/wallets', badge: '⚫ OKX Web3 Wallets' }
                ]
            }
        },
        {
            id: 'blockchain_basics',
            term: 'Що таке Блокчейн і як він працює',
            category: 'BASICS',
            definition: 'Децентралізований розподілений цифровий реєстр, де записи об\'єднуються у криптографічно захищені ланцюжки блоків. Жоден банк або держава не можуть підробити чи скасувати транзакцію.',
            example: 'Кожен вузол мережі перевіряє справжність переказу за математичним консенсусом.',
            visualType: 'CHART_SMC',
            videoData: {
                youtubeId: '3rL0OIXbMio',
                title: 'How Does Blockchain Work｜Explained for Beginners',
                duration: '5:42',
                sourceName: 'Binance Academy (Official Video)',
                provider: 'binance',
                spokenLanguage: 'en',
                subtitleLanguages: ['uk', 'en'],
                officialArticleUrl: 'https://academy.binance.com/uk/articles/what-is-blockchain-and-how-does-it-work',
                fallbackUrl: 'https://academy.binance.com/uk/articles/what-is-blockchain-and-how-does-it-work',
                sourceVerifiedAt: '2026-09-28',
                embedStatus: 'verified',
                disclaimer: 'Офіційний освітній матеріал Binance Academy. Не є фінансовою порадою.',
                takeaways: [
                    'Блокчейн усуває посередників (банки, платіжні системи), зводячи комісії до мінімуму.',
                    'Усі транзакції публічні та незворотні — їх неможливо стерти чи змінити заднім числом.',
                    'Безпека гарантується криптографією та тисячами незалежних вузлів (нод).'
                ],
                officialSources: [
                    { name: 'Binance Academy', url: 'https://academy.binance.com/uk/articles/what-is-blockchain-and-how-does-it-work', badge: '🟡 Офіційна стаття' },
                    { name: 'Bybit Learn', url: 'https://learn.bybit.com/blockchain/what-is-blockchain-technology/', badge: '🟠 Bybit Learn' },
                    { name: 'OKX Learn', url: 'https://www.okx.com/en-us/learn/tag/security', badge: '⚫ OKX Security' }
                ]
            }
        },
        {
            id: 'bitcoin_intro',
            term: 'Bitcoin (BTC) — Цифрове Золото та Халвінг',
            category: 'BASICS',
            definition: 'Перша та головна криптовалюта у світі, створена Сатоші Накамото. Має суворо обмежену емісію в 21 мільйон монет та автоматичний халвінг кожні 4 роки, що захищає від інфляції.',
            example: 'Халвінг зменшує нагороду майнерам удвічі, створюючи дефіцит пропозиції.',
            visualType: 'NONE',
            videoData: {
                youtubeId: 'Wnf2vKG90w8',
                title: 'What is Bitcoin｜Explained For Beginners',
                duration: '6:15',
                sourceName: 'Binance Academy (Official Video)',
                provider: 'binance',
                spokenLanguage: 'en',
                subtitleLanguages: ['uk', 'en'],
                officialArticleUrl: 'https://academy.binance.com/uk/articles/what-is-bitcoin',
                fallbackUrl: 'https://academy.binance.com/uk/articles/what-is-bitcoin',
                sourceVerifiedAt: '2026-09-28',
                embedStatus: 'verified',
                disclaimer: 'Офіційний освітній матеріал Binance Academy. Не є фінансовою порадою.',
                takeaways: [
                    'Bitcoin не підпорядковується жодному центробанку — це математично захищений інструмент збереження вартості.',
                    'Неможливо надрукувати більше ніж 21,000,000 BTC, що робить його твердішим за золото.',
                    'Зберігайте Bitcoin на особистому холодному гаманці для максимальної безпеки.'
                ],
                officialSources: [
                    { name: 'Binance Academy', url: 'https://academy.binance.com/uk/articles/what-is-bitcoin', badge: '🟡 Офіційна стаття' },
                    { name: 'Bybit Learn', url: 'https://learn.bybit.com/crypto/what-is-bitcoin-btc/', badge: '🟠 Bybit Bitcoin' },
                    { name: 'OKX Learn', url: 'https://www.okx.com/en-us/learn/tag/bitcoin', badge: '⚫ OKX Bitcoin' }
                ]
            }
        },
        {
            id: 'cryptocurrency_basics',
            term: 'Що таке Криптовалюта та цифрові активи',
            category: 'BASICS',
            definition: 'Цифрова або віртуальна валюта, захищена криптографією, що унеможливлює підробку чи подвійне витрачання коштів.',
            example: 'Транзакції передаються в одноранговій мережі P2P без банківських шлюзів.',
            visualType: 'NONE',
            videoData: {
                youtubeId: 'a5XfQWUUZM8',
                title: 'What is Cryptocurrency｜Explained For Beginners',
                duration: '4:45',
                sourceName: 'Binance Academy (Official Video)',
                provider: 'binance',
                spokenLanguage: 'en',
                subtitleLanguages: ['uk', 'en'],
                officialArticleUrl: 'https://academy.binance.com/uk/articles/what-is-cryptocurrency',
                fallbackUrl: 'https://academy.binance.com/uk/articles/what-is-cryptocurrency',
                sourceVerifiedAt: '2026-09-28',
                embedStatus: 'verified',
                disclaimer: 'Офіційний освітній матеріал Binance Academy. Не є фінансовою порадою.',
                takeaways: [
                    'Криптовалюта функціонує на базі розподіленого консенсусу (PoW / PoS).',
                    'Власник самостійно контролює доступ до своїх активів через закриті ключі.',
                    'Ціна формується виключно ринковим балансом попиту та пропозиції.'
                ],
                officialSources: [
                    { name: 'Binance Academy', url: 'https://academy.binance.com/uk/articles/what-is-cryptocurrency', badge: '🟡 Офіційна стаття' },
                    { name: 'Bybit Learn', url: 'https://learn.bybit.com/blockchain/what-is-cryptocurrency/', badge: '🟠 Bybit Learn' }
                ]
            }
        },
        {
            id: 'mining_intro',
            term: 'Майнінг та Консенсус Proof-of-Work',
            category: 'BASICS',
            definition: 'Процес перевірки та запису транзакцій у блокчейн за допомогою обчислювальної потужності обладнання, за що майнери отримують винагороду новими монетами.',
            example: 'Майнери забезпечують безпеку мережі Bitcoin через підбір криптографічного гешу.',
            visualType: 'NONE',
            videoData: {
                youtubeId: '2VtH-XAOjXw',
                title: 'What is Cryptocurrency Mining｜Explained For Beginners',
                duration: '5:30',
                sourceName: 'Binance Academy (Official Video)',
                provider: 'binance',
                spokenLanguage: 'en',
                subtitleLanguages: ['uk', 'en'],
                officialArticleUrl: 'https://academy.binance.com/uk/articles/what-is-crypto-mining-and-how-does-it-work',
                fallbackUrl: 'https://academy.binance.com/uk/articles/what-is-crypto-mining-and-how-does-it-work',
                sourceVerifiedAt: '2026-09-28',
                embedStatus: 'verified',
                disclaimer: 'Офіційний освітній матеріал Binance Academy. Не є фінансовою порадою.',
                takeaways: [
                    'Майнінг гарантує захист мережі від подвійного витрачання та зловмисників.',
                    'Складність майнінгу адаптується кожні 2016 блоків у Bitcoin.',
                    'Халвінг зменшує нагороду за знайдений блок кожні 4 роки.'
                ],
                officialSources: [
                    { name: 'Binance Academy', url: 'https://academy.binance.com/uk/articles/what-is-crypto-mining-and-how-does-it-work', badge: '🟡 Binance Майнінг' },
                    { name: 'OKX Learn', url: 'https://www.okx.com/en-us/learn/tag/security', badge: '⚫ OKX Security' }
                ]
            }
        },
        {
            id: 'ethereum_contracts',
            term: 'Ethereum (ETH) та Смарт-контракти',
            category: 'BASICS',
            definition: 'Глобальний децентралізований комп\'ютер (EVM), на якому працюють самовиконувані програми — смарт-контракти. Фундаментальна база для DeFi, DEX та стейблкоїнів.',
            example: 'Смарт-контракт автоматично переказує кошти покупцю одразу після виконання умови.',
            visualType: 'NONE'
        },
        {
            id: 'stablecoins_intro',
            term: 'Стейблкоїни (USDT, USDC): Механіка прив\'язки',
            category: 'BASICS',
            definition: 'Криптовалюти зі стабільною ціною 1:1 до долара США. Дозволяють фіксувати торговий прибуток та миттєво переказувати капітал між біржами без банківських затримок.',
            example: 'Зафіксував 70% профіту в USDT під час піку волатильності ринку.',
            visualType: 'NONE'
        },
        {
            id: 'account_security_2fa',
            term: 'Реєстрація акаунту, Верифікація (KYC) та 2FA',
            category: 'BASICS',
            definition: 'Базовий протокол безпеки трейдера: перевірка особи (KYC) та обов\'язкове підключення двофакторної автентифікації через додаток (Google Authenticator / YubiKey).',
            example: 'Захист 2FA унеможливлює злам акаунту навіть у разі витоку основного пароля.',
            visualType: 'NONE'
        },
        {
            id: 'p2p_trading_guide',
            term: 'P2P Торгівля: Купівля з картки без посередників',
            category: 'BASICS',
            definition: 'Peer-to-Peer торгівля дозволяє купувати та продавати USDT чи BTC напряму іншим користувачам за банківську картку. Біржа виступає безпечним гарантом (Escrow).',
            example: 'Поки продавець не отримав кошти на свою картку, крипта заморожена в арбітражі біржі.',
            visualType: 'NONE'
        },
        {
            id: 'p2p_scam_prevention',
            term: 'P2P Безпека: Шахрайські схеми та захист',
            category: 'BASICS',
            definition: 'Правила протидії класичним P2P-аферам: фейкові банківські SMS, підроблені чеки про оплату, шахрайські трикутники та відкликання платежів через чарджбек.',
            example: 'Покупець скинув підроблений скріншот, але баланс банку не змінився — ордер оскаржено.',
            visualType: 'NONE'
        },

        // ==========================================
        // 2. МЕХАНІКА ТОРГІВЛІ ТА ОРДЕРИ (TRADING)
        // ==========================================
        {
            id: 'spot_vs_futures',
            term: 'Спот проти Ф\'ючерсів: Основи трейдингу',
            category: 'TRADING',
            definition: 'На Спотовому ринку ви купуєте реальну монету і володієте нею без ризику примусової ліквідації. На Ф\'ючерсах ви торгуєте ціновими контрактами з кредитним плечем (Leverage).',
            example: 'Плече 10х множить прибуток у 10 разів, але рух ціни на 10% проти вас повністю ліквідує позицію.',
            visualType: 'NONE',
            videoData: {
                youtubeId: 'URZuENfa8tI',
                title: 'Online Course For Beginners: Trading Fundamentals',
                duration: '7:40',
                sourceName: 'Binance Academy (Official Course)',
                provider: 'binance',
                spokenLanguage: 'en',
                subtitleLanguages: ['uk', 'en'],
                officialArticleUrl: 'https://academy.binance.com/uk/articles/a-complete-guide-to-cryptocurrency-trading-for-beginners',
                fallbackUrl: 'https://academy.binance.com/uk/articles/a-complete-guide-to-cryptocurrency-trading-for-beginners',
                sourceVerifiedAt: '2026-09-28',
                embedStatus: 'verified',
                disclaimer: 'Офіційний освітній курс Binance Academy. Не є фінансовою порадою.',
                takeaways: [
                    'Початківцям рекомендується починати виключно зі спотового ринку (Spot).',
                    'Ф\'ючерси вимагають суворого виставлення Stop-Loss ордера в момент відкриття кожної угоди.',
                    'Уникайте великих плечей (20x, 50x, 100x) — біржова волатильність гарантовано ліквідує депозит.'
                ],
                officialSources: [
                    { name: 'Binance Academy', url: 'https://academy.binance.com/uk/articles/a-complete-guide-to-cryptocurrency-trading-for-beginners', badge: '🟡 Курс Трейдингу' },
                    { name: 'Bybit Learn', url: 'https://learn.bybit.com/trading/crypto-trading-strategies/', badge: '🟠 Bybit Trading' },
                    { name: 'OKX Learn', url: 'https://www.okx.com/en-us/learn/tag/trading-basics', badge: '⚫ OKX Trading Basics' }
                ]
            }
        },
        {
            id: 'orders_guide',
            term: 'Стратегії торгівлі та типи ордерів',
            category: 'TRADING',
            definition: 'Market-ордер виконується миттєво за поточною ціною зі стакана. Limit-ордер чекає на обрану вами ціну зі зниженою комісією. Stop-Loss обмежує збитки, якщо ринок пішов проти вас.',
            example: 'Виставив Limit-ордер на купівлю біткоїна за $62,000 зі стопом на $60,800.',
            visualType: 'NONE',
            videoData: {
                youtubeId: 'YqoJ_fOHoH8',
                title: 'Online Course For Beginners: Trading Strategies',
                duration: '8:15',
                sourceName: 'Binance Academy (Official Course)',
                provider: 'binance',
                spokenLanguage: 'en',
                subtitleLanguages: ['uk', 'en'],
                officialArticleUrl: 'https://academy.binance.com/uk/articles/trading-strategies-for-beginners',
                fallbackUrl: 'https://academy.binance.com/uk/articles/trading-strategies-for-beginners',
                sourceVerifiedAt: '2026-09-28',
                embedStatus: 'verified',
                disclaimer: 'Офіційний освітній курс Binance Academy. Не є фінансовою порадою.',
                takeaways: [
                    'Використовуйте Limit-ордери, щоб контролювати точну ціну входу і не переплачувати комісію taker.',
                    'Завжди розраховуйте свій Stop-Loss до входу в угоду, а не після того, як позиція пішла в мінус.',
                    'Take-Profit ордери дозволяють фіксувати прибуток частинами (50% на першій цілі, 50% на другій).'
                ],
                officialSources: [
                    { name: 'Binance Academy', url: 'https://academy.binance.com/uk/articles/trading-strategies-for-beginners', badge: '🟡 Торгові Стратегії' },
                    { name: 'Bybit Learn', url: 'https://learn.bybit.com/trading/crypto-trading-strategies/', badge: '🟠 Bybit Strategies' },
                    { name: 'OKX Learn', url: 'https://www.okx.com/en-us/learn/tag/technical-analysis', badge: '⚫ OKX Технічний Аналіз' }
                ]
            }
        },
        {
            id: 'risk_reward_calc',
            term: 'Розрахунок Risk-to-Reward (R:R 1:3) та Розмір Позиції',
            category: 'TRADING',
            definition: 'Математичний фундамент прибуткового трейдера: відкривати угоди лише тоді, коли потенційний прибуток перевищує ризик у 2-3 рази. Навіть при 40% успішних угод ви залишатиметесь у плюсі.',
            example: 'Ризик $30 заради прибутку $90 дає ідеальне співвідношення R:R 1:3.',
            visualType: 'NONE'
        },
        {
            id: 'orderbook_depth',
            term: 'Стакан ордерів (Order Book) та Спуфінг',
            category: 'TRADING',
            definition: 'Реальний список лімітних заявок на купівлю (Bid) та продаж (Ask). Великі гравці інколи виставляють фіктивні стіни ордерів (спуфінг), щоб залякати натовп, і прибирають їх перед самим виконанням.',
            example: 'Фальшиву стінку на 500 BTC прибрали перед самим підходом ціни.',
            visualType: 'NONE'
        },

        // ==========================================
        // 3. СВІЧКИ, ПІН-БАРИ ТА ПАТЕРНИ (PATTERNS)
        // ==========================================
        {
            id: 'pinbar_hammer',
            term: 'Бичачий Молот та Пін-бар (Pin Bar Rejection)',
            category: 'PATTERNS',
            definition: 'Класична свічка розвороту з крихітним тілом угорі та довгим нижнім ґнотом (удвічі довшим за тіло). Демонструє миттєве агресивне відхилення продавців сильним покупцем.',
            example: 'Пін-бар на денному рівні підтримки дав бездоганний сигнал для відкриття лонгу.',
            visualType: 'CANDLE_HAMMER'
        },
        {
            id: 'doji',
            term: 'Свічка Доджі (Doji)',
            category: 'PATTERNS',
            definition: 'Свічка, де ціна відкриття та закриття майже ідентичні. Означає стан абсолютної рівноваги між биками та ведмедями і часто передує розвороту виснаженого тренду.',
            example: 'Доджі на піку тривалого росту попередив про початок глибокої корекції.',
            visualType: 'CANDLE_DOJI'
        },
        {
            id: 'engulfing',
            term: 'Бичаче Поглинання (Engulfing)',
            category: 'PATTERNS',
            definition: 'Потужна двосвічкова комбінація: велика зелена імпульсна свічка своїм тілом повністю перекриває тіло попередньої червоної свічки, підтверджуючи зміну контролю ринку.',
            example: 'Поглинання на 4-годинному таймфреймі зламало локальну низхідну структуру.',
            visualType: 'CANDLE_ENGULFING'
        },
        {
            id: 'bullflag',
            term: 'Бичачий Прапор (Bull Flag)',
            category: 'PATTERNS',
            definition: 'Патерн продовження тренду: потужний імпульс угору (флагшток) та плавне низхідне звуження (прапор) перед новим вибуховим виходом ціни вгору на висоту флагштока.',
            example: 'Консолідація після +15% росту завершилася імпульсом угору.',
            visualType: 'CHART_BULL_FLAG'
        },
        {
            id: 'hns',
            term: 'Голова і Плечі (Head & Shoulders)',
            category: 'PATTERNS',
            definition: 'Розворотний патерн із трьома вершинами, де середня (голова) вища за бічні (плечі). Пробиття лінії шиї вниз підтверджує перехід до ведмежого тренду.',
            example: 'Ціна не змогла оновити максимум і пробила шию на рівні $65,000.',
            visualType: 'CHART_HEAD_SHOULDERS'
        },
        {
            id: 'smc',
            term: 'Smart Money Concepts (SMC) & Збір Ліквідності',
            category: 'PATTERNS',
            definition: 'Торгова концепція розуміння дій банків та маркетмейкерів: вони спеціально пробивають рівні роздрібних стоп-лоссів (Liquidity Sweep) для набору своєї гігантської позиції.',
            example: 'Маркетмейкер зняв стопи натовпу за рівнем $60k і погнав ціну на новий хай.',
            visualType: 'CHART_SMC'
        },
        {
            id: 'orderblock',
            term: 'Ордер Блок (Order Block / OB)',
            category: 'PATTERNS',
            definition: 'Остання свічка перед сильним імпульсом зі зламом структури (BOS), де у маркетмейкера залишилися незаповнені лімітні ордери. Виступає міцною магнітною зоною підтримки.',
            example: 'Ціна повернулася на тест бичачого OB на $62,400 і дала реакцію +8%.',
            visualType: 'CHART_OB'
        },
        {
            id: 'fvg',
            term: 'Імбаланс Ціни (Fair Value Gap / FVG)',
            category: 'PATTERNS',
            definition: 'Трисвічкова неефективність, де ґніт 1-ї та 3-ї свічок не перетинаються, утворюючи порожнечу в стакані. Ціна прагне заповнити її як мінімум на 50% (Consequent Encroachment).',
            example: 'Виставили лімітний ордер на вхід від середини 4H зони FVG.',
            visualType: 'CHART_FVG'
        },

        // ==========================================
        // 4. ПСИХОЛОГІЯ ТА РИЗИК-МЕНЕДЖМЕНТ (PSYCHOLOGY)
        // ==========================================
        {
            id: 'fomo_psychology',
            term: 'Як подолати FOMO та Панічний Злив (FUD)',
            category: 'PSYCHOLOGY',
            definition: 'FOMO — синдром страху втраченої вигоди, коли новачок купує монету після +300% росту. FUD — панічний продаж на штучно створених новинах перед тим, як великі гравці викуплять дно.',
            example: 'Професійний трейдер ніколи не біжить за поїздом, який уже вирушив.',
            visualType: 'NONE'
        },
        {
            id: 'onepercentrule',
            term: 'Правило 1% Ризику на Угоду',
            category: 'PSYCHOLOGY',
            definition: 'Математичне правило довгожителів ринку: максимальний можливий збиток у разі спрацювання стоп-лоссу не повинен перевищувати 1-2% від вашого загального капіталу на рахунку.',
            example: 'При капіталі $5,000 ризик на одну ідею становить максимум $50.',
            visualType: 'NONE'
        },
        {
            id: 'revengetrading',
            term: 'Торгівля з Помсти (Тильт)',
            category: 'PSYCHOLOGY',
            definition: 'Спроба негайно відіграти втрачений збиток, відкриваючи несистемні угоди з гігантським плечем. Найшвидший шлях до повної ліквідації рахунку.',
            example: 'Отримав стоп на $50 і залетів у 50х плече всією котлетою.',
            visualType: 'NONE'
        }
    ],

    en: [
        {
            id: 'wallets_storage',
            term: 'Wallet Security: Cold vs Hot Storage & Seed Phrases',
            category: 'SECURITY',
            definition: 'Hardware cold storage isolates your private keys in a secure enclave offline, preventing remote draining attacks and malware access.',
            example: 'Retain 90% of long-term crypto assets in cold storage.',
            visualType: 'NONE',
            videoData: {
                youtubeId: 'd8IBpfs9bf4',
                title: 'What are Crypto Wallets — Explained for Beginners',
                duration: '5:12',
                sourceName: 'Binance Academy (Official Course)',
                provider: 'binance',
                spokenLanguage: 'en',
                subtitleLanguages: ['uk', 'en'],
                officialArticleUrl: 'https://academy.binance.com/uk/articles/crypto-wallet-types-explained',
                fallbackUrl: 'https://academy.binance.com/uk/articles/crypto-wallet-types-explained',
                sourceVerifiedAt: '2026-09-28',
                embedStatus: 'verified',
                disclaimer: 'Official educational guide by Binance Academy. Not financial advice.',
                takeaways: [
                    'Never photograph or digitally store your 12-24 word seed phrase.',
                    'Keep your recovery phrase on stainless steel in a fireproof location.',
                    'Support staff will never ask for your recovery phrase or private keys.'
                ],
                officialSources: [
                    { name: 'Binance Academy', url: 'https://academy.binance.com/uk/articles/crypto-wallet-types-explained', badge: '🟡 Binance Guide' },
                    { name: 'Bybit Learn', url: 'https://learn.bybit.com/crypto/what-is-a-crypto-wallet/', badge: '🟠 Bybit Wallets' },
                    { name: 'OKX Learn', url: 'https://www.okx.com/en-us/learn/tag/wallets', badge: '⚫ OKX Wallets' }
                ]
            }
        },
        {
            id: 'blockchain_basics',
            term: 'What is Blockchain and How it Works',
            category: 'BASICS',
            definition: 'A decentralized, immutable distributed ledger where records are batched into cryptographically secured blocks. Removes the need for centralized banks.',
            example: 'Consensus nodes verify transactions with mathematics, not human trust.',
            visualType: 'CHART_SMC',
            videoData: {
                youtubeId: '3rL0OIXbMio',
                title: 'How Does Blockchain Work｜Explained for Beginners',
                duration: '5:42',
                sourceName: 'Binance Academy (Official Course)',
                provider: 'binance',
                spokenLanguage: 'en',
                subtitleLanguages: ['uk', 'en'],
                officialArticleUrl: 'https://academy.binance.com/uk/articles/what-is-blockchain-and-how-does-it-work',
                fallbackUrl: 'https://academy.binance.com/uk/articles/what-is-blockchain-and-how-does-it-work',
                sourceVerifiedAt: '2026-09-28',
                embedStatus: 'verified',
                disclaimer: 'Official educational course by Binance Academy. Not financial advice.',
                takeaways: [
                    'Blockchain eliminates intermediaries, lowering settlement fees and counterparty risks.',
                    'Transactions are immutable: once confirmed on-chain, records cannot be altered.',
                    'Security is maintained by global decentralized validator consensus.'
                ],
                officialSources: [
                    { name: 'Binance Academy', url: 'https://academy.binance.com/uk/articles/what-is-blockchain-and-how-does-it-work', badge: '🟡 Binance Article' },
                    { name: 'Bybit Learn', url: 'https://learn.bybit.com/blockchain/what-is-blockchain-technology/', badge: '🟠 Bybit Learn' }
                ]
            }
        },
        {
            id: 'bitcoin_intro',
            term: 'Bitcoin (BTC) — Digital Gold & Halving',
            category: 'BASICS',
            definition: 'The genesis decentralized cryptocurrency invented by Satoshi Nakamoto with a strict 21 million hard cap and quadrennial supply halving.',
            example: 'Halving cuts mining inflation in half, reinforcing programmatic scarcity.',
            visualType: 'NONE',
            videoData: {
                youtubeId: 'Wnf2vKG90w8',
                title: 'What is Bitcoin｜Explained For Beginners',
                duration: '6:15',
                sourceName: 'Binance Academy (Official Course)',
                provider: 'binance',
                spokenLanguage: 'en',
                subtitleLanguages: ['uk', 'en'],
                officialArticleUrl: 'https://academy.binance.com/uk/articles/what-is-bitcoin',
                fallbackUrl: 'https://academy.binance.com/uk/articles/what-is-bitcoin',
                sourceVerifiedAt: '2026-09-28',
                embedStatus: 'verified',
                disclaimer: 'Official educational course by Binance Academy. Not financial advice.',
                takeaways: [
                    'No central authority can dilute Bitcoin\'s 21,000,000 supply limit.',
                    'Self-custody empowers holders with sovereign wealth protection.',
                    'Global 24/7 liquidity makes it an institutional hedge against fiat inflation.'
                ],
                officialSources: [
                    { name: 'Binance Academy', url: 'https://academy.binance.com/uk/articles/what-is-bitcoin', badge: '🟡 Binance Article' },
                    { name: 'Bybit Learn', url: 'https://learn.bybit.com/crypto/what-is-bitcoin-btc/', badge: '🟠 Bybit Learn' },
                    { name: 'OKX Learn', url: 'https://www.okx.com/en-us/learn/tag/bitcoin', badge: '⚫ OKX Bitcoin' }
                ]
            }
        },
        {
            id: 'spot_vs_futures',
            term: 'Spot vs Futures: Margin & Leverage Risks',
            category: 'TRADING',
            definition: 'Spot trading involves direct asset ownership without forced liquidation risk. Futures trade price contracts with multiplier leverage, introducing liquidation thresholds.',
            example: '10x leverage multiplies gains but 10% adverse price move causes 100% loss.',
            visualType: 'NONE',
            videoData: {
                youtubeId: 'URZuENfa8tI',
                title: 'Online Course For Beginners: Trading Fundamentals',
                duration: '7:40',
                sourceName: 'Binance Academy (Official Course)',
                provider: 'binance',
                spokenLanguage: 'en',
                subtitleLanguages: ['uk', 'en'],
                officialArticleUrl: 'https://academy.binance.com/uk/articles/a-complete-guide-to-cryptocurrency-trading-for-beginners',
                fallbackUrl: 'https://academy.binance.com/uk/articles/a-complete-guide-to-cryptocurrency-trading-for-beginners',
                sourceVerifiedAt: '2026-09-28',
                embedStatus: 'verified',
                disclaimer: 'Official educational course by Binance Academy. Not financial advice.',
                takeaways: [
                    'Beginners should build disciplined track records on Spot before attempting derivatives.',
                    'Always define and place a hard Stop-Loss order at position inception.',
                    'High leverage (20x-100x) turns statistical trading into reckless gambling.'
                ],
                officialSources: [
                    { name: 'Binance Academy', url: 'https://academy.binance.com/uk/articles/a-complete-guide-to-cryptocurrency-trading-for-beginners', badge: '🟡 Trading Guide' },
                    { name: 'Bybit Learn', url: 'https://learn.bybit.com/trading/crypto-trading-strategies/', badge: '🟠 Bybit Learn' }
                ]
            }
        },
        {
            id: 'orders_guide',
            term: 'Order Types: Market, Limit, Stop-Loss & Take-Profit',
            category: 'TRADING',
            definition: 'Market orders execute instantly at book price. Limit orders wait for your designated price. Stop-Loss preserves capital by terminating losing trades automatically.',
            example: 'Placed a limit buy order at support with a 1.5% stop loss.',
            visualType: 'NONE',
            videoData: {
                youtubeId: 'YqoJ_fOHoH8',
                title: 'Online Course For Beginners: Trading Strategies',
                duration: '8:15',
                sourceName: 'Binance Academy (Official Course)',
                provider: 'binance',
                spokenLanguage: 'en',
                subtitleLanguages: ['uk', 'en'],
                officialArticleUrl: 'https://academy.binance.com/uk/articles/trading-strategies-for-beginners',
                fallbackUrl: 'https://academy.binance.com/uk/articles/trading-strategies-for-beginners',
                sourceVerifiedAt: '2026-09-28',
                embedStatus: 'verified',
                disclaimer: 'Official educational course by Binance Academy. Not financial advice.',
                takeaways: [
                    'Use Limit orders to avoid slippage and pay lower maker fees.',
                    'Calculate your risk parameter before opening any position.',
                    'Scale out profits systematically using staged Take-Profit targets.'
                ],
                officialSources: [
                    { name: 'Binance Academy', url: 'https://academy.binance.com/uk/articles/trading-strategies-for-beginners', badge: '🟡 Trading Strategies' },
                    { name: 'OKX Learn', url: 'https://www.okx.com/en-us/learn/tag/technical-analysis', badge: '⚫ OKX Learn' }
                ]
            }
        },
        {
            id: 'pinbar_hammer',
            term: 'Bullish Hammer & Pin Bar Price Rejection',
            category: 'PATTERNS',
            definition: 'A powerful single-candle reversal with a small upper body and a long lower tail (2x+ body length), showing aggressive seller rejection at key support.',
            example: 'Pin-bar bounce off major support created a high-probability long entry.',
            visualType: 'CANDLE_HAMMER'
        },
        {
            id: 'hns',
            term: 'Head & Shoulders',
            category: 'PATTERNS',
            definition: 'A classic reversal pattern with three peaks (left, head, right). Break of the neckline confirms shift from Bullish to Bearish.',
            visualType: 'CHART_HEAD_SHOULDERS',
            example: 'Price failed at $72k, broke neckline at $65k.'
        },
        {
            id: 'bullflag',
            term: 'Bull Flag',
            category: 'PATTERNS',
            definition: 'A bullish continuation pattern. A steep impulsive rise (pole) followed by a tight downward-sloping channel (flag).',
            visualType: 'CHART_BULL_FLAG',
            example: 'Consolidation after +15% impulse, breakout upward.'
        },
        {
            id: 'smc',
            term: 'Smart Money Concepts (SMC)',
            category: 'PATTERNS',
            definition: 'Trading framework focused on institutional order flow, tracking where market makers generate liquidity before real moves.',
            visualType: 'CHART_SMC',
            example: 'Liquidity sweep of retail stop losses before true pump.'
        },
        {
            id: 'orderblock',
            term: 'Order Block (OB)',
            category: 'PATTERNS',
            definition: 'The last opposite-colored candle before an explosive market move that breaks structure, where institutional limit orders remain unfilled.',
            visualType: 'CHART_OB',
            example: 'Price retested 4H Bullish OB at $62,400 for entry.'
        },
        {
            id: 'fvg',
            term: 'Fair Value Gap (FVG)',
            category: 'PATTERNS',
            definition: 'A 3-candle price imbalance where candle 1 wick and candle 3 wick do not overlap, creating a vacuum that price often revisits.',
            visualType: 'CHART_FVG',
            example: 'Limit order placed at 50% FVG (Consequent Encroachment).'
        },
        {
            id: 'fomo_psychology',
            term: 'Trading Psychology: Overcoming FOMO and Greed',
            category: 'PSYCHOLOGY',
            definition: 'FOMO causes retail traders to buy at local tops out of emotional fear of missing out. Professional traders remain dispassionate and patient.',
            example: 'Never chase extended green candles after multiple parabolic days.',
            visualType: 'NONE'
        },
        {
            id: 'onepercentrule',
            term: 'The 1% Rule (Position Sizing)',
            category: 'PSYCHOLOGY',
            definition: 'Never risk more than 1% to 2% of your total capital on a single trade idea. Position size = (Account * 1%) / Stop Loss distance.',
            example: '$10,000 account risks max $100 per invalidation.',
            visualType: 'NONE'
        }
    ],

    pl: [
        {
            id: 'wallets_storage',
            term: 'Portfele Krypto: Zimne vs Gorące i Bezpieczeństwo',
            category: 'SECURITY',
            definition: 'Fizyczne portfele sprzętowe trzymają klucze prywatne całkowicie odizolowane od internetu i wirusów.',
            example: '90% aktywów długoterminowych przechowywane na Ledgerze.',
            visualType: 'NONE',
            videoData: {
                youtubeId: 'd8IBpfs9bf4',
                title: 'What are Crypto Wallets — Explained for Beginners',
                duration: '5:12',
                sourceName: 'Binance Academy (Kurs oficjalny)',
                provider: 'binance',
                spokenLanguage: 'en',
                subtitleLanguages: ['uk', 'en'],
                officialArticleUrl: 'https://academy.binance.com/uk/articles/crypto-wallet-types-explained',
                fallbackUrl: 'https://academy.binance.com/uk/articles/crypto-wallet-types-explained',
                sourceVerifiedAt: '2026-09-28',
                embedStatus: 'verified',
                disclaimer: 'Oficjalny poradnik Binance Academy. Nie stanowi porady finansowej.',
                takeaways: [
                    'Nigdy nie rób zdjęć i nie zapisuj 12-24 słów w chmurze lub telefonie.',
                    'Zapisz frazę seed na papierze lub tytanie i schowaj w bezpiecznym miejscu.',
                    'Pomoc techniczna nigdy nie prosi o podanie frazy seed.'
                ],
                officialSources: [
                    { name: 'Binance Academy', url: 'https://academy.binance.com/uk/articles/crypto-wallet-types-explained', badge: '🟡 Binance Guide' },
                    { name: 'Bybit Learn', url: 'https://learn.bybit.com/crypto/what-is-a-crypto-wallet/', badge: '🟠 Bybit Wallets' },
                    { name: 'OKX Learn', url: 'https://www.okx.com/en-us/learn/tag/wallets', badge: '⚫ OKX Wallets' }
                ]
            }
        },
        {
            id: 'blockchain_basics',
            term: 'Czym jest Blockchain i jak działa',
            category: 'BASICS',
            definition: 'Zdecentralizowana, niezmienna baza danych, w której transakcje łączone są w kryptograficznie zabezpieczone bloki bez pośrednictwa banków.',
            example: 'Węzły sieci weryfikują transakcje matematycznym algorytmem konsensusu.',
            visualType: 'CHART_SMC',
            videoData: {
                youtubeId: '3rL0OIXbMio',
                title: 'How Does Blockchain Work｜Explained for Beginners',
                duration: '5:42',
                sourceName: 'Binance Academy (Kurs oficjalny)',
                provider: 'binance',
                spokenLanguage: 'en',
                subtitleLanguages: ['uk', 'en'],
                officialArticleUrl: 'https://academy.binance.com/uk/articles/what-is-blockchain-and-how-does-it-work',
                fallbackUrl: 'https://academy.binance.com/uk/articles/what-is-blockchain-and-how-does-it-work',
                sourceVerifiedAt: '2026-09-28',
                embedStatus: 'verified',
                disclaimer: 'Oficjalny poradnik Binance Academy. Nie stanowi porady finansowej.',
                takeaways: [
                    'Blockchain eliminuje pośredników, obniżając prowizje i przyspieszając rozliczenia.',
                    'Transakcje są publiczne i nieodwracalne — nikt nie może ich cofnąć.',
                    'Bezpieczeństwo zapewnia rozproszona sieć tysięcy niezależnych węzłów.'
                ],
                officialSources: [
                    { name: 'Binance Academy', url: 'https://academy.binance.com/uk/articles/what-is-blockchain-and-how-does-it-work', badge: '🟡 Binance Article' },
                    { name: 'Bybit Learn', url: 'https://learn.bybit.com/blockchain/what-is-blockchain-technology/', badge: '🟠 Bybit Learn' }
                ]
            }
        },
        {
            id: 'bitcoin_intro',
            term: 'Bitcoin (BTC) — Cyfrowe Złoto i Halving',
            category: 'BASICS',
            definition: 'Pierwsza kryptowaluta o twardym limicie 21 milionów monet i halvingu co 4 lata chroniącym przed inflacją.',
            example: 'Halving ogranicza nową podaż BTC o połowę co 210,000 bloków.',
            visualType: 'NONE',
            videoData: {
                youtubeId: 'Wnf2vKG90w8',
                title: 'What is Bitcoin｜Explained For Beginners',
                duration: '6:15',
                sourceName: 'Binance Academy (Kurs oficjalny)',
                provider: 'binance',
                spokenLanguage: 'en',
                subtitleLanguages: ['uk', 'en'],
                officialArticleUrl: 'https://academy.binance.com/uk/articles/what-is-bitcoin',
                fallbackUrl: 'https://academy.binance.com/uk/articles/what-is-bitcoin',
                sourceVerifiedAt: '2026-09-28',
                embedStatus: 'verified',
                disclaimer: 'Oficjalny poradnik Binance Academy. Nie stanowi porady finansowej.',
                takeaways: [
                    'Żaden bank centralny nie może dodrukować monet Bitcoin.',
                    'Ścisły limit 21,000,000 monet gwarantuje rzadkość.',
                    'Przechowuj Bitcoin na własnym zimnym portfelu sprzętowym.'
                ],
                officialSources: [
                    { name: 'Binance Academy', url: 'https://academy.binance.com/uk/articles/what-is-bitcoin', badge: '🟡 Binance Article' },
                    { name: 'Bybit Learn', url: 'https://learn.bybit.com/crypto/what-is-bitcoin-btc/', badge: '🟠 Bybit Learn' }
                ]
            }
        },
        {
            id: 'spot_vs_futures',
            term: 'Spot vs Futures: Dźwignia i Ryzyko Likwidacji',
            category: 'TRADING',
            definition: 'Na rynku Spot posiadasz rzeczywiste monety bez ryzyka likwidacji. Na rynku Futures handlujesz kontraktami z dźwignią finansową.',
            example: 'Dźwignia 10x zwiększa potencjalny zysk, lecz ruch o 10% przeciw pozycji oznacza likwidację.',
            visualType: 'NONE',
            videoData: {
                youtubeId: 'URZuENfa8tI',
                title: 'Online Course For Beginners: Trading Fundamentals',
                duration: '7:40',
                sourceName: 'Binance Academy (Kurs oficjalny)',
                provider: 'binance',
                spokenLanguage: 'en',
                subtitleLanguages: ['uk', 'en'],
                officialArticleUrl: 'https://academy.binance.com/uk/articles/a-complete-guide-to-cryptocurrency-trading-for-beginners',
                fallbackUrl: 'https://academy.binance.com/uk/articles/a-complete-guide-to-cryptocurrency-trading-for-beginners',
                sourceVerifiedAt: '2026-09-28',
                embedStatus: 'verified',
                disclaimer: 'Oficjalny kurs Binance Academy. Nie stanowi porady finansowej.',
                takeaways: [
                    'Początkujący powinni zaczynać wyłącznie od rynku Spot.',
                    'Na kontraktach Futures bezwzględnie ustawiaj zlecenie Stop-Loss.',
                    'Wysoka dźwignia (20x-100x) prowadzi do szybkiego wyzerowania kapitału.'
                ],
                officialSources: [
                    { name: 'Binance Academy', url: 'https://academy.binance.com/uk/articles/a-complete-guide-to-cryptocurrency-trading-for-beginners', badge: '🟡 Kurs Binance' },
                    { name: 'Bybit Learn', url: 'https://learn.bybit.com/trading/crypto-trading-strategies/', badge: '🟠 Bybit Learn' }
                ]
            }
        },
        {
            id: 'pinbar_hammer',
            term: 'Młot Byczy i Formacja Pin Bar (Odrzucenie Ceny)',
            category: 'PATTERNS',
            definition: 'Świeca odwrócenia z małym ciałem i długim dolnym knotem, oznaczająca agresywne przejęcie kontroli przez kupujących.',
            example: 'Pin bar na poziomie wsparcia dał czysty sygnał wejścia w pozycję długą.',
            visualType: 'CANDLE_HAMMER'
        },
        {
            id: 'hns',
            term: 'Głowa i Ramiona',
            category: 'PATTERNS',
            definition: 'Klasyczna formacja odwrócenia z trzema szczytami. Wybicie linii szyi w dół potwierdza zmianę trendu na spadkowy.',
            visualType: 'CHART_HEAD_SHOULDERS',
            example: 'Cena nie zdołała wybić szczytu i przebiła linię szyi.'
        },
        {
            id: 'smc',
            term: 'Smart Money Concepts (SMC)',
            category: 'PATTERNS',
            definition: 'Metodologia śledzenia zleceń instytucjonalnych i manipulacji płynnością przed właściwym ruchem rynku.',
            visualType: 'CHART_SMC',
            example: 'Wybicie stop lossów inwestorów detalicznych przed pompą.'
        },
        {
            id: 'fomo_psychology',
            term: 'Psychologia Rynku: Jak Opanować FOMO i Chciwość',
            category: 'PSYCHOLOGY',
            definition: 'FOMO to impuls kupowania na szczycie ze strachu przed przegapieniem zysków. Profesjonaliści handlują plan, nie emocje.',
            example: 'Nie goń zielonych świec, gdy rynek wzrósł już o 100%.',
            visualType: 'NONE'
        },
        {
            id: 'onepercentrule',
            term: 'Zasada 1% Ryzyka na Transakcję',
            category: 'PSYCHOLOGY',
            definition: 'Maksymalna strata przy uderzeniu w Stop Loss nie powinna przekraczać 1-2% całego kapitału inwestycyjnego.',
            example: 'Kapitał $10,000 — maksymalna strata na zagranie to $100.',
            visualType: 'NONE'
        }
    ]
};
