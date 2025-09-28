// Детальная схема данных на основе Google Sheets формата
export const competitorSchema = {
  // Основная информация
  id: "number",
  companyName: "string",           // Название компании
  brandName: "string",             // Название бренда
  website: "url",                  // Сайт
  legalForm: "string",             // Форма собственности

  // Контактная информация
  headquarters: "string",          // Штаб-квартира
  regions: "array",                // Регионы присутствия
  phone: "string",                 // Телефон
  email: "string",                 // Email
  socialMedia: {
    telegram: "url",
    vk: "url",
    youtube: "url",
    instagram: "url",
    facebook: "url"
  },

  // Бизнес модель
  businessModel: "string",         // Модель бизнеса
  targetAudience: "string",        // Целевая аудитория
  propertyTypes: "array",          // Типы недвижимости
  services: "array",               // Услуги
  monetization: "string",          // Монетизация

  // Продукт и технологии
  productType: "string",           // Тип продукта
  technology: "array",             // Технологии
  platforms: "array",              // Платформы (web, mobile, API)
  integrations: "array",           // Интеграции

  // Финансовые показатели
  revenue: "string",               // Выручка
  funding: "string",               // Привлечено инвестиций
  investors: "array",              // Инвесторы
  valuation: "string",             // Оценка компании

  // Команда
  employees: "number",             // Количество сотрудников
  founders: "array",               // Основатели
  keyPeople: "array",              // Ключевые люди

  // Рыночные показатели
  marketShare: "string",           // Доля рынка
  traffic: "object",               // Трафик сайта
  rankings: "object",              // Рейтинги
  competitivePosition: "string",   // Конкурентная позиция

  // Маркетинг
  advertisingChannels: "array",    // Каналы рекламы
  partnerships: "array",           // Партнерства
  awards: "array",                 // Награды

  // Статус и активность
  status: "string",                // Статус компании
  foundedYear: "number",           // Год основания
  lastUpdate: "date",              // Последнее обновление
  news: "array",                   // Последние новости
  trends: "array",                 // Тренды развития

  // Аналитика
  strengths: "array",              // Сильные стороны
  weaknesses: "array",             // Слабые стороны
  opportunities: "array",          // Возможности
  threats: "array",                // Угрозы

  // Метаданные
  sources: "array",                // Источники данных
  lastScraped: "date",             // Последний парсинг
  dataQuality: "string",           // Качество данных
  verified: "boolean"              // Верифицированы ли данные
};

// Расширенные данные конкурентов
export const competitorsExtended = [
  {
    id: 1,
    companyName: "ООО \"ЦИАН\"",
    brandName: "ЦИАН",
    website: "https://cian.ru",
    legalForm: "ООО",

    headquarters: "Москва, Россия",
    regions: ["Москва", "СПб", "Екатеринбург", "Новосибирск", "Казань", "Нижний Новгород"],
    phone: "+7 (495) 150-22-49",
    email: "support@cian.ru",
    socialMedia: {
      telegram: "https://t.me/cian_official",
      vk: "https://vk.com/cian",
      youtube: "https://youtube.com/c/cianru",
      instagram: "https://instagram.com/cian.ru",
      facebook: "https://facebook.com/cian.ru"
    },

    businessModel: "Агрегатор объявлений с платными услугами",
    targetAudience: "Покупатели, продавцы, арендаторы, риелторы",
    propertyTypes: ["Квартиры", "Дома", "Коммерческая", "Земельные участки"],
    services: ["Поиск", "Размещение", "Аналитика", "CRM", "Звонки", "Реклама"],
    monetization: "Платные пакеты размещения, услуги продвижения",

    productType: "Веб-платформа + мобильное приложение",
    technology: ["React", "Node.js", "PostgreSQL", "Redis", "Elasticsearch"],
    platforms: ["Web", "iOS", "Android", "API"],
    integrations: ["Banks", "Developers", "Agencies", "MLS"],

    revenue: "12.5 млрд ₽ (2024)",
    funding: "Частные инвестиции",
    investors: ["Mail.ru Group", "Сбербанк"],
    valuation: "~50 млрд ₽",

    employees: 1200,
    founders: ["Марк Горов"],
    keyPeople: ["Марк Горов - CEO", "Алексей Торсунов - CTO"],

    marketShare: "35%",
    traffic: {
      monthly: "15M+",
      uniqueVisitors: "8M+",
      pageViews: "120M+",
      mobileShare: "65%"
    },
    rankings: {
      alexa: 150,
      similarweb: 145,
      appStore: 4.2,
      googlePlay: 4.1
    },
    competitivePosition: "Лидер рынка",

    advertisingChannels: ["Google Ads", "Yandex.Direct", "TV", "Радио", "Outdoor"],
    partnerships: ["Банки", "Застройщики", "Агентства"],
    awards: ["RuNet Prize 2023", "Премия Рунета"],

    status: "Активный",
    foundedYear: 2001,
    lastUpdate: new Date("2025-09-28"),
    news: [
      "Запуск ИИ-помощника для поиска квартир",
      "Интеграция с банковскими сервисами",
      "Расширение в регионы"
    ],
    trends: ["Рост на 8% в 2025", "Новые инструменты ИИ", "Интеграция с банками"],

    strengths: ["Большая база объявлений", "Узнаваемый бренд", "Развитая техплатформа"],
    weaknesses: ["Высокая стоимость размещения", "Жалобы на модерацию"],
    opportunities: ["ИИ и автоматизация", "Интеграция с госуслугами"],
    threats: ["Усиление конкуренции", "Регулирование рынка"],

    sources: ["Официальный сайт", "Публичная отчетность", "СМИ"],
    lastScraped: new Date("2025-09-28"),
    dataQuality: "High",
    verified: true
  },

  {
    id: 2,
    companyName: "ООО \"ДомКлик\"",
    brandName: "ДомКлик",
    website: "https://domclick.ru",
    legalForm: "ООО (дочка Сбербанка)",

    headquarters: "Москва, Россия",
    regions: ["Все регионы РФ"],
    phone: "+7 (495) 505-67-65",
    email: "support@domclick.ru",
    socialMedia: {
      telegram: "https://t.me/domclick",
      vk: "https://vk.com/domclick",
      youtube: "https://youtube.com/c/domclick",
      instagram: "https://instagram.com/domclick.ru"
    },

    businessModel: "Банковская экосистема недвижимости",
    targetAudience: "Заемщики, покупатели недвижимости",
    propertyTypes: ["Первичная недвижимость", "Вторичная", "Коммерческая"],
    services: ["Ипотека", "Поиск", "Оценка", "Страхование", "Сопровождение сделок"],
    monetization: "Комиссии с ипотеки и банковских продуктов",

    productType: "Банковская платформа + экосистема",
    technology: ["Java", "Spring", "Oracle", "Microservices"],
    platforms: ["Web", "iOS", "Android", "Sber ecosystem"],
    integrations: ["Сбербанк", "Росреестр", "Застройщики", "Страховые"],

    revenue: "8.2 млрд ₽ (2024)",
    funding: "Сбербанк (100%)",
    investors: ["Сбербанк"],
    valuation: "Часть Сбербанка",

    employees: 800,
    founders: ["Проект Сбербанка"],
    keyPeople: ["Дмитрий Харитонов - Директор"],

    marketShare: "25%",
    traffic: {
      monthly: "12M+",
      uniqueVisitors: "6M+",
      pageViews: "80M+",
      mobileShare: "70%"
    },
    rankings: {
      alexa: 280,
      similarweb: 250,
      appStore: 4.5,
      googlePlay: 4.3
    },
    competitivePosition: "Топ-3, банковский лидер",

    advertisingChannels: ["Сбербанк каналы", "Digital", "TV"],
    partnerships: ["Сбербанк", "Застройщики", "Гостех"],
    awards: ["Премия \"Банк года\"", "Digital Awards"],

    status: "Активный",
    foundedYear: 2017,
    lastUpdate: new Date("2025-09-28"),
    news: [
      "Интеграция с ГосТехом",
      "AI-оценка недвижимости",
      "Расширение ипотечных программ"
    ],
    trends: ["Интеграция с ГосТехом", "Новые регионы", "AI-оценка недвижимости"],

    strengths: ["Банковская экосистема", "Доверие Сбербанка", "Удобная ипотека"],
    weaknesses: ["Ограниченность банковской моделью", "Меньше частных объявлений"],
    opportunities: ["Госуслуги", "Электронные сделки", "Новые банковские продукты"],
    threats: ["Конкуренция других банков", "Изменение регулирования"],

    sources: ["Официальный сайт", "Отчеты Сбербанка", "Пресс-релизы"],
    lastScraped: new Date("2025-09-28"),
    dataQuality: "High",
    verified: true
  }

  // Добавим остальных позже...
];

export default competitorsExtended;