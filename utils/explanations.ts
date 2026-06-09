// Standard explanations database for all system modules and subsystems
// Supported languages: 'en' (English), 'ua' (Ukrainian), 'pl' (Polish)

export interface HelpExplanation {
    title: string;
    description: string;
    features: string[];
}

export const EXPLANATIONS: Record<string, Record<'en' | 'ua' | 'pl', HelpExplanation>> = {
    ai_agent: {
        en: {
            title: "Neural AI Squad",
            description: "A team of highly sophisticated autonomous AI models executing real-time data analysis.",
            features: [
                "SNIPER: High-frequency scalping specialist. Detects technical breakouts on minor ranges.",
                "WHALE: Large wallet tracker & fund analyzer. Follows smart money actions on-chain.",
                "GUARDIAN: Defensive hedging bot. Estimates macro risk levels and protects capital."
            ]
        },
        ua: {
            title: "Команда Шнейромереж",
            description: "Набір високотехнологічних автономних ШІ-агентів, що виконують аналіз даних у реальному часі.",
            features: [
                "СНАЙПЕР: Спеціаліст із високочастотного скальпінгу. Виявляє технічні прориви на коротких інтервалах.",
                "КИТ: Трекер великих капіталів. Відстежує транзакції інституціональних гаманців он-чейн.",
                "ОХОРОНЕЦЬ: Хеджуючий бот захисту. Оцінює глобальні макро-ризики та захищає баланс."
            ]
        },
        pl: {
            title: "Zespół Agencji AI",
            description: "Grupa zaawansowanych autonomicznych modeli AI prowadząca nieprzerwaną analizę rynku.",
            features: [
                "SNAJPER: Scalper o wysokiej czułości. Wykrywa techniczne punkty przełomowe na niskich interwałach.",
                "WIELEBĄD (WHALE): Śledzi ruchy grubych ryb i adresów instytucjonalnych bezpośrednio on-chain.",
                "STRAŻNIK: Bot defensywny. Kalkuluje globalne ryzyko systemowe i chroni kapitał użytkownika."
            ]
        }
    },
    portfolio_tracker: {
        en: {
            title: "Portfolio Hub",
            description: "Real-time net-worth analytics across multichain assets and balances.",
            features: [
                "Balance Feed: Direct tracking from local values & TonAPI blockchain nodes.",
                "Asset Allocation: Dynamic percentage weight distribution check.",
                "Profit & Loss (P&L): Continuous live performance calculations."
            ]
        },
        ua: {
            title: "Портфельний Хаб",
            description: "Аналітика вашого чистого капіталу в реальному часі серед багатьох блокчейнів та активів.",
            features: [
                "Баланси: Пряме завантаження локальних значень та он-чейн вузлів TonAPI.",
                "Розподіл: Динамічний контроль відсоткових часток кожного криптоактиву.",
                "P&L (Прибуток/Збиток): Безперервні розрахунки поточної ефективності портфеля."
            ]
        },
        pl: {
            title: "Centrum Portfela",
            description: "Analizy wartości netto w czasie rzeczywistym dla wielu aktywów i blockchainów.",
            features: [
                "Odczyt salda: Bezpośrednie pobieranie danych on-chain za pośrednictwem TonAPI.",
                "Alokacja aktywów: Dynamiczna kontrola wag procentowych w strukturze portfela.",
                "P&L (Zyski/Straty): Ciągłe obliczenia wydajności kapitału na żywo."
            ]
        }
    },
    arbitrage_radar: {
        en: {
            title: "Arbitrage Radar",
            description: "Advanced price mismatch terminal scanning dozens of pools.",
            features: [
                "Liquidity Delta: Detects asset exchange rate differences on different pools.",
                "Gas Estimator: Safe routing calculations to ensure profitability.",
                "Execution Speed: Near-instant validation across decentralized AMMs."
            ]
        },
        ua: {
            title: "Арбітражний Радар",
            description: "Просунутий термінал пошуку цінових відхилень між децентралізованими пулами.",
            features: [
                "Дельта ліквідності: Виявляє різницю курсів обміну одного активу на різних біржах.",
                "Калькулятор газу: Оцінка мережевих зборів задля забезпечення гарантованого прибутку.",
                "Швидкість обробки: Миттєва валідація умов у мережах DEX."
            ]
        },
        pl: {
            title: "Radar Arbitrażowy",
            description: "Zaawansowany skaner rozbieżności cenowych na dziesiątkach pul płynności.",
            features: [
                "Delta płynności: Wykrywa różnice kursowe tego samego aktywa na różnych giełdach.",
                "Kalkulator opłat (Gas): Oblicza koszty transakcyjne, gwarantując rentowność pozycji.",
                "Szybkość reakcji: Błyskawiczna weryfikacja okazji arbitrażowych w sieciach DEX."
            ]
        }
    },
    market_scanner: {
        en: {
            title: "Alpha Scanner",
            description: "High-speed engine tracking price movements, volumes, and visual temperatures.",
            features: [
                "Heatmap Mode: Grid visualization of market asset states.",
                "Alpha Filter: Instant highlighting of extreme RSI conditions and high-beta runs.",
                "Node Globe: Futuristic global view of decentralized system nodes."
            ]
        },
        ua: {
            title: "Сканер Альфа-Активів",
            description: "Високошвидкісний рушій відстеження коливань цін, обсягів торгів та ринкової карти.",
            features: [
                "Теплова карта: Наочна блочна сітка поточного стану всього крипторинку.",
                "Альфа-фільтр: Миттєве виділення аномальних значень RSI та сильної волатильності.",
                "Глобус Нод: Футуристична проекція активності децентралізованих серверів."
            ]
        },
        pl: {
            title: "Skaner Sygnałów Alfa",
            description: "Szybki system monitorowania wolumenów, trendów cenowych oraz temperatury rynku.",
            features: [
                "Mapa cieplna: Wizualizacja siatki aktualnych stanów aktywów cyfrowych.",
                "Filtr Alfa: Natychmiastowe wykrywanie skrajnych wartości RSI oraz nagłych skoków zmienności.",
                "Wizualny Globus: Cyfrowa symulacja geolokalizacji węzłów blockchain."
            ]
        }
    },
    media_center: {
        en: {
            title: "Media Pulse",
            description: "Sentiment collection aggregated from top crypto social channels and video feeds.",
            features: [
                "Sentiment Bar: Real-time positive, negative, and neutral bias analysis from social posts.",
                "Video Synthetics: Fast summarization of critical video insights.",
                "Feed Aggregator: Curated stream of trusted developers and key Web3 analysts."
            ]
        },
        ua: {
            title: "Медіа-Пульс",
            description: "Збір настроїв інвесторів, агрегований із провідних крипто-соціальних каналів та відео-трансляцій.",
            features: [
                "Шкала настрою: Аналіз позитивних, негативних та нейтральних думок у реальному часі.",
                "Нейро-відео: Коротке вилучення важливих тез із довгих оглядів аналітиків.",
                "Стрічка розробників: Відбірний потік новин від перевірених фахівців Web3."
            ]
        },
        pl: {
            title: "Puls Mediów",
            description: "Synteza nastrojów inwestorów oparta o agregację postów społecznościowych i wideo.",
            features: [
                "Wskaźnik nastroju: Analiza na żywo pozytywnych i negatywnych sygnałów z social media.",
                "Kompaktowe wideo: Ekstrakcja najważniejszych wniosków z długich analiz rynkowych.",
                "Agregator treści: Starannie wyselekcjonowany strumień wpisów od liderów opinii Web3."
            ]
        }
    },
    profile_center: {
        en: {
            title: "Operational Terminal",
            description: "Secure configuration console for custom system parameters.",
            features: [
                "Encryption Keys: Complete control of your custom API integrations.",
                "Language & Haptics: Tailored system interaction profiles.",
                "Security Check: Status indicators for multi-factor authorization."
            ]
        },
        ua: {
            title: "Операційний Термінал",
            description: "Безпечна консоль налаштувань для встановлення параметрів системи.",
            features: [
                "Ключі шифрування: Повний контроль над конфіденційними API та підключеннями.",
                "Мова та тактильність: Індивідуальні профілі взаємодії з інтерфейсом.",
                "Аудит безпеки: Перевірка захищеності облікового запису та 2FA."
            ]
        },
        pl: {
            title: "Terminal Operacyjny",
            description: "Bezpieczna konsola konfiguracyjna parametrów systemowych i profilu.",
            features: [
                "Klucze Szyfrujące: Pełna kontrola nad Twoimi integracjami API.",
                "Język i Dotyk (Haptic): Indywidualnie dopasowane profile reakcji interfejsu.",
                "Panel Bezpieczeństwa: Statusy zabezpieczeń kryptograficznych i autoryzacji 2FA."
            ]
        }
    },
    system_terminal: {
        en: {
            title: "System Terminal",
            description: "Interactive visual CLI representing simulated block networks and node logs.",
            features: [
                "Sandbox Environment: Execute commands or read real-time diagnostic output.",
                "Haptic Feedback: Direct mechanical reaction on tap/interaction.",
                "Logs View: Real-time server-side and browser interaction audits."
            ]
        },
        ua: {
            title: "Системний Термінал",
            description: "Інтерактивний CLI з відображенням внутрішньої роботи блокчейн-серверів та логів.",
            features: [
                "Пісочниця команд: Можливість виконувати системні запити та зчитувати системні коди.",
                "Тактильний відгук: Приємна фізична вібрація під час введення або виконання дій.",
                "Журнал налагодження: Моніторинг активності мережевих запитів та відповідей."
            ]
        },
        pl: {
            title: "Terminal Systemowy",
            description: "Interaktywny panel tekstowy CLI reprezentujący operacje na węzłach sieci block.",
            features: [
                "Wirtualna konsola: Wykonuj symulowane zapytania i czytaj statusy diagnostyczne.",
                "Sprzężenie zwrotne: Fizyczna haptic-reakcja ekranu przy wprowadzaniu komend.",
                "Podgląd dziennika: Stały monitoring zapytań serwerowych i wewnętrznej synchronizacji."
            ]
        }
    },
    intel_grid: {
        en: {
            title: "Intel Grid",
            description: "High-frequency AI intelligence stream delivering synthesized market events.",
            features: [
                "News Crawler: Fetches hot updates from trusted global agencies instantly.",
                "AI Cross-Matrix: Gemini-powered multi-vector impact estimations.",
                "Sentiment Weights: Color-coded bullish and bearish highlights per headline."
            ]
        },
        ua: {
            title: "Інтелмережа",
            description: "Високочастотний потік новин та ШІ-аналізу гарячих ринкових подій.",
            features: [
                "Медіа-робот: Моментально вилучає заголовки з перевірених світових джерел.",
                "Нейро-хвилі: Прогнозування векторів впливу новин за допомогою моделей Gemini.",
                "Колірне кодування: Візуальні індикатори лонг та шорт настроїв для кожної події."
            ]
        },
        pl: {
            title: "Sieć Wywiadowcza",
            description: "Szybki strumień informacyjny AI dostarczający syntezę wydarzeń makroekonomicznych.",
            features: [
                "Web Crawler: Pobiera najważniejsze nagłówki bezpośrednio ze światowych agencji.",
                "Wycena wpływu: Wielowektorowe szacunki skutków rynkowych oparte o AI.",
                "Flagi nastroju: Kolorystyczne oznaczenie byczych lub niedźwiedzich wydźwięków dla każdego newsa."
            ]
        }
    },
    dex_aggregator: {
        en: {
            title: "Aggregated DEX Swap",
            description: "Multi-router exchange protocol designed to find the absolute best swap rates.",
            features: [
                "Smart Routing: Dynamic routing through multiple liquidity pools to minimize slippage.",
                "Slippage Buffer: Custom tolerance barriers to prevent front-running.",
                "Gas Efficiency: Highly optimized contract pathing to conserve network fees."
            ]
        },
        ua: {
            title: "Агрегатор DEX Обміну",
            description: "Обмінний протокол із підбором найкращого торгового шляху серед десятків пулів.",
            features: [
                "Розумні маршрути: Динамічний перерозподіл обсягів для мінімізації проковзування.",
                "Сліппедж-буфер: Можливість встановлювати допустиме відхилення ціни.",
                "Заощадження газу: Оптимізація виклику смарт-контрактів для низької комісії."
            ]
        },
        pl: {
            title: "Agregator Swap DEX",
            description: "Wielokanałowy protokół wymiany zaprojektowany w celu znajdowania optymalnych kursów swap.",
            features: [
                "Sprytny routing: Przesyłanie wolumenu przez zróżnicowane pule dla redukcji poślizgu cenowego.",
                "Bufor odchylenia: Elastyczne zapobieganie manipulacjom cenowym podmiotów zewnętrznych.",
                "Oszczędność gazu: Zoptymalizowane korytarze kontraktów chroniące przed wysokimi prowizjami sieci."
            ]
        }
    },
    airdrop_terminal: {
        en: {
            title: "Airdrop Station",
            description: "Interactive claims tracking panel for secure token distribution cycles.",
            features: [
                "Quests Completed: Progress counter for unlock qualification.",
                "Referral Multiplier: Extra bonus weights for team building.",
                "Claim Logic: Instant simulated drop collection on contract activation."
            ]
        },
        ua: {
            title: "Роздача Токенів",
            description: "Інтерактивний пульт керування клеймом безкоштовних токенів спільноти.",
            features: [
                "Виконані завдання: Показник проходження квестів для розблокування винагороди.",
                "Реферальний бустер: Множники балів за залучення нових учасників.",
                "Симуляція контракту: Процес отримання віртуальних токенів на гаманець."
            ]
        },
        pl: {
            title: "Centrum Airdrop",
            description: "Panel monitorowania i odbierania tokenów ze startowych zrzutów społecznościowych.",
            features: [
                "Ukończone misje: Status gotowości portfela do odbioru nagrody (kryterium questów).",
                "Mnożnik poleceń: Dodatkowe profity za rozwijanie sieci partnerskich.",
                "Symulacja zapisu: Testowe zatwierdzanie kontraktu dystrybucji na Twoim saldzie."
            ]
        }
    },
    quests_center: {
        en: {
            title: "Quests System",
            description: "Interactive task boards designed to educate users and unlock higher tier features.",
            features: [
                "Daily Tasks: Fresh cognitive goals updated every 24 hours.",
                "Knowledge Boost: Safe sandbox tutorials on DeFi routing and Web3 fundamentals.",
                "Rewards Unlock: Direct score boosts and tier upgrades upon verification."
            ]
        },
        ua: {
            title: "Рейтингові Квести",
            description: "Інтерактивні місії для навчання базових інструментів Web3 та підвищення рангу.",
            features: [
                "Щоденні цілі: Скатні завдання, що оновлюються кожні 24 години.",
                "Підвищення кваліфікації: Безпечні інструкції з взаємодії в DeFi екосистемі.",
                "Сенсаційні бонуси: Нарахування рейтингових очок та просування у глобальній таблиці лідерів."
            ]
        },
        pl: {
            title: "System Zadań (Quests)",
            description: "Interaktywne tablice z misjami edukującymi użytkownika i odblokowującymi funkcje premium.",
            features: [
                "Codzienne wyzwania: Zadania odnawiane regularnie co 24 godziny.",
                "Pigułka wiedzy: Safe sandbox objaśniający zasady transferów kryptograficznych.",
                "Punkty doświadczenia: Bezpośrednie podnoszenie rangi profilu i pozycji w lidze."
            ]
        }
    },
    academy_hub: {
        en: {
            title: "Sovereign Academy",
            description: "Educational curriculum featuring lessons, interactive quizzes, and blockchain insights.",
            features: [
                "Smart Syllabus: Structured learning blocks from Web3 basics to advanced math models.",
                "Interactive Quizzes: Self-testing with instant positive feedback elements.",
                "Graduation NFT: Simulated smart badge of honor granted on full course completion."
            ]
        },
        ua: {
            title: "Суверенна Академія",
            description: "Навчальний комплекс уроків, інтерактивних вікторин та перевірочних запитань.",
            features: [
                "Теоретичний курс: Програма від найпростіших термінів до заплутаних математичних формул.",
                "Моментальне тестування: Перевірка знань за допомогою тестів із заохочувальними очками.",
                "Випускний сертифікат: Симульований смарт-знак пошани після повного проходження навчання."
            ]
        },
        pl: {
            title: "Suwerenna Akademia",
            description: "Platforma szkoleniowa zawierająca lekcje, interaktywne kwizy oraz analizy on-chain.",
            features: [
                "Program edukacyjny: Usystematyzowany podział od absolutnych podstaw do modeli zaawansowanych.",
                "Kelebne kwizy: Sprawdzanie wiedzy z nagrodami w postaci punktów i osiągnięć.",
                "NFT ukończenia: Symulowana odznaka ekspercka przyznawana po zaliczeniu egzaminu."
            ]
        }
    },
    portfolio_audit: {
        en: {
            title: "AI Safety Auditor",
            description: "Deep scanning protocol analyzing asset health, risk exposures, and contract vulnerabilities.",
            features: [
                "Concentrated Risk: Checks if your balance depends too heavily on single assets.",
                "Volatility Score: Estimates historic downside probability relative to standard deviations.",
                "Smart Suggestions: Clean suggestions for re-diversifying and locking in defense."
            ]
        },
        ua: {
            title: "ШІ-Аудитор Безпеки",
            description: "Ретельний сканер пропорцій портфеля на предмет слабких місць, концентрації та ризиків.",
            features: [
                "Загрози концентрації: Попереджає про надмірне накопичення одного активу.",
                "Шкала волатильності: Розраховує ймовірні коливання на основі історичної дисперсії.",
                "Нейро-поради: Інтелектуальні кроки щодо балансування та фіксації прибуткових позицій."
            ]
        },
        pl: {
            title: "Audytor Bezpieczeństwa AI",
            description: "Zaawansowany protokół skanowania kondycji zdywersyfikowanych środków.",
            features: [
                "Ocena koncentracji: Monitoruje, czy salda nie są nadmiernie zależne od jednego instrumentu.",
                "Indeks zmienności: Wylicza statystyczne prawdopodobieństwo obsunięcia kapitału.",
                "Wskazówki obronne: Sugestie redywersyfikacji i przenoszenia zysków do stablecoinów."
            ]
        }
    },
    asset_chart: {
        en: {
            title: "Interactive Chart",
            description: "Dynamic canvas tracking price action with responsive overlays.",
            features: [
                "Interactive HUD: Select between standard candles, line view, or technical charts.",
                "Live Updates: Smooth price feed updates powered by Binance WebSockets.",
                "Custom Layouts: Seamless pinch-to-zoom and coordinate tracking."
            ]
        },
        ua: {
            title: "Інтерактивний Графік",
            description: "Динамічний радар відображення цінових трендів та свічкових патернів.",
            features: [
                "Вибір відображення: Візуалізація у вигляді японських свічок чи лінійної діаграми.",
                "Живі котирування: Безперебійний потік цін на базі з'єднання Binance WebSockets.",
                "Повна координація: Чітке визначення точних координат курсора на часовій осі."
            ]
        },
        pl: {
            title: "Wykres Interaktywny",
            description: "Dynamiczny panel śledzenia ruchu cenowego z nakładkami technicznymi.",
            features: [
                "Tryby widoku: Szybkie przełączanie pomiędzy świecami japońskimi a linią trendu.",
                "Aktualizacje na żywo: Płynne notowania rynkowe zasilane przez Binance WebSockets.",
                "Koordynacja dotykowa: Precyzyjne badanie poziomów wsparcia i oporu pod kursorem."
            ]
        }
    },
    asset_orderbook: {
        en: {
            title: "Simulated Order Book",
            description: "High-fidelity visualization of bid and ask order flow and wall depth.",
            features: [
                "Ask Wall (Red): Sell side inventory awaiting execution at specific limit rates.",
                "Bid Wall (Green): Buy side demand supporting current levels.",
                "Spread Indicator: Instant calculation of gap between highest buy and lowest sell."
            ]
        },
        ua: {
            title: "Книга Заявок (Склянка)",
            description: "Високоточна проекція пропозицій купівлі та продажу на ринку.",
            features: [
                "Стіна ордерів Аск (Червона): Лімітні заявки на продаж активу за вказаними цінами.",
                "Стіна ордерів Бід (Зелена): Очікувана купівельна спроможність на кожному з рівнів підтримки.",
                "Спред ринку: Помиттєве вирахування різниці маржі між попитом та пропозицією."
            ]
        },
        pl: {
            title: "Książka Zleceń (Arkusz)",
            description: "Wizualizacja głębokości zleceń kupna i sprzedaży w arkuszu płynności.",
            features: [
                "Zlecenia Ask (Czerwone): Strona podażowa oczekująca na realizację po danych cenach.",
                "Zlecenia Bid (Zielone): Zgromadzone wolumeny wspierające spadek ceny.",
                "Spread: Błyskawiczne obliczenie marży pomiędzy najlepszą ofertą kupna a sprzedaży."
            ]
        }
    },
    asset_watchdog: {
        en: {
            title: "Watchdog Patrol",
            description: "Algorithmic monitoring system tracking severe spikes, drops, and target breaches.",
            features: [
                "Price Targets: Triggers a persistent alert when asset reaches your trigger level.",
                "Volatility Scans: Rapid detection of sudden pump and dump behaviors.",
                "Haptic Shock: Immediate device vibration when an alert triggers."
            ]
        },
        ua: {
            title: "Сторожовий Пес (Служба сповіщень)",
            description: "Алгоритмічна сирена для виявлення різких стрибків курсів та досягнення визначених лімітів.",
            features: [
                "Цільова планка: Автоматично спрацьовує при перетині встановленого вами рівня ціни.",
                "Сканер імпульсів: Контролює аномальну швидкість купівлі або продажів активу.",
                "Фізичний шок: Надсилає потужну вібрацію на пристрій у момент виклику алярму."
            ]
        },
        pl: {
            title: "Sygnalizator (Watchdog)",
            description: "Zautomatyzowane alerty techniczne reagujące na gwałtowne skoki cen.",
            features: [
                "Poziomy docelowe: Natychmiastowe powiadomienie po osiągnięciu zdefiniowanego limitu cenowego.",
                "Skaner anomalii: Detekcja nienaturalnie nagłych ruchów kapitałowych (pump/dump).",
                "Wibracja haptic: Fizyczny alarm urządzenia gwarantujący przyciągnięcie uwagi."
            ]
        }
    },
    asset_backtest: {
        en: {
            title: "Sandbox Backtester",
            description: "Historic simulator calculating yields of trading strategies over the past years.",
            features: [
                "Backtest Range: Test strategies across major bull and bear cycles.",
                "Performance Metrics: Detailed Sharpe Ratio, max drawdown, and net profits output.",
                "Visual Curves: High-contrast comparison between Buy & Hold and your custom strategy."
            ]
        },
        ua: {
            title: "Ретро-Тестер Стратегій",
            description: "Історичний симулятор для розрахунку прибутковості будь-якого торгового задуму на минулих періодах.",
            features: [
                "База тестів: Можливість переглядати поведінку стратегії на справжніх ведмежих та бичачих циклах.",
                "Розрахунок Sharpe: Перевірка корисності заробітку з урахуванням міри ризику.",
                "Візуальні криві: Порівняння результату ідеї з пасивною довгостроковою закупкою (Buy & Hold)."
            ]
        },
        pl: {
            title: "Tester Strategii",
            description: "Historyczny symulator wyliczający wydajność zysku Twoich założeń na danych z ubiegłych lat.",
            features: [
                "Okres testowy: Sprawdzenie założeń w realnych bessach i hossach historycznych.",
                "Kluczowe wskaźniki: Szczegółowy współczynnik Sharpe'a, maksymalne obsunięcie (Drawdown) i zysk netto.",
                "Wykres porównawczy: Czytelne zestawienie Twojej taktyki z klasycznym trzymaniem aktywa (Buy & Hold)."
            ]
        }
    },
    asset_ai_simulation: {
        en: {
            title: "Neural Asset Forecaster",
            description: "Advanced Monte Carlo model generating possible price projection paths.",
            features: [
                "Monte Carlo Paths: Simulates hundreds of random walks using historic drift and variance.",
                "Probability Cone: Visual ranges indicating the most likely future drift zone.",
                "Google Search Grounding: Integrates verified live search data to calibrate predictions."
            ]
        },
        ua: {
            title: "Нейропрогнозування Цін",
            description: "Просунута ймовірнісна модель Монте-Карло, що генерує гіпотетичні траєкторії ціни.",
            features: [
                "Маршрути Монте-Карло: Розрахунок сотень випадкових блукань на основі колишньої мінливості.",
                "Конус ймовірності: Сектор найімовірнішого тримання курсу в найближчі дні.",
                "Синхронізація Пошуку: Інтегрує свіжу новинну основу з Google Search для калібрування результатів."
            ]
        },
        pl: {
            title: "Prognoza Neuronowa Monte Carlo",
            description: "Algorytm stochastyczny symulujący przyszłe trajektorie cenowe instrumentu.",
            features: [
                "Ścieżki Monte Carlo: Symuluje setki losowych odchyleń na bazie historycznej wariancji.",
                "Stożek rozkładu: Wizualizacja zakresów prawdopodobnego zachowania kursu w nadchodzącym czasie.",
                "Weryfikacja Google Search: Wykorzystuje najświeższe fakty newsowe do kalibracji parametrów modelu."
            ]
        }
    },
    ai_market_summary: {
        en: {
            title: "AI Market Insight",
            description: "Intelligent summarization of immediate market opportunities and trends.",
            features: [
                "Dynamic Context: Continually absorbs binance prices and feed indices.",
                "Strategic Advice: Formulates clean macro insights for portfolio safety.",
                "Search Grounding: Validates current opinions through active search vectors."
            ]
        },
        ua: {
            title: "ШІ-Огляд Крипторинку",
            description: "Швидка автоматична вижимка найгарячіших можливостей та ризиків на ринку.",
            features: [
                "Динамічний контекст: Враховує актуальні курси Binance та загальну атмосферу серед інвесторів.",
                "Стратегічні підказки: Виробляє чіткі рекомендації для збереження вашого депозиту.",
                "Синхрон пошуку: Фактологічно верифікує прогнози через пошукові вектори Google."
            ]
        },
        pl: {
            title: "Przegląd Globalny AI",
            description: "Inteligentna synteza bieżących szans i zagrożeń na szerokim rynku crypto.",
            features: [
                "Kontekst na żywo: Automatycznie integruje notowania Binance oraz ogólny sentyment.",
                "Porady strategiczne: Formuje jasne kroki chroniące kapitał i podkreślające okazje handlowe.",
                "Uziemienie faktu: Dane są stale konfrontowane z publikacjami indeksowanymi w silniku Google."
            ]
        }
    }
};
