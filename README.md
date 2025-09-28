# RealtyCompetitors - Анализ рынка недвижимости РФ

🏢 Профессиональный сервис для мониторинга и анализа конкурентов на российском рынке недвижимости.

## 🌐 Ссылки

- **🚀 Работающее приложение**: [realty-competitors-analyzer.vercel.app](https://realty-competitors-analyzer-fjmmx0521-nikita-tita-projects.vercel.app)
- **📦 GitHub репозиторий**: [github.com/nikita-tita/realty-competitors-analyzer](https://github.com/nikita-tita/realty-competitors-analyzer)
- **🐳 Docker Hub**: Готов к публикации на Docker Hub

## 🚀 Быстрый деплой на Vercel

### Вариант 1: Один клик деплой
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/realty-competitors-analyzer)

### Вариант 2: Через командную строку
```bash
# Установка Vercel CLI
npm i -g vercel

# Деплой
vercel

# Следуйте инструкциям
```

### Вариант 3: Через GitHub
1. Загрузите код в GitHub репозиторий
2. Зайдите на [vercel.com](https://vercel.com)
3. Подключите GitHub репозиторий
4. Vercel автоматически развернет приложение

## 🛠 Локальная разработка

### Обычный способ
```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Сборка для продакшена
npm run build

# Запуск продакшен версии
npm start
```

### С помощью Docker
```bash
# Сборка образа
docker build -t realty-competitors .

# Запуск контейнера
docker run -p 3000:3000 realty-competitors

# Или используйте docker-compose
docker-compose up --build
```

## 📱 Функциональность

### 🏢 Анализ конкурентов
- ✅ **Детальная база данных**: Расширенная схема как в Google Sheets
- ✅ **Интерактивная аналитика**: Графики и дашборды с Recharts
- ✅ **Фильтрация и поиск**: Умные фильтры по категориям и статусам

### 📊 Мониторинг и уведомления
- ✅ **Автоматический парсинг**: Сбор данных с сайтов конкурентов
- ✅ **Система мониторинга**: Отслеживание изменений в реальном времени
- ✅ **Уведомления**: Email, Telegram, webhook интеграции
- ✅ **История изменений**: Полный аудит всех изменений

### 📈 Экспорт и интеграции
- ✅ **Множественные форматы**: CSV, Excel, JSON, PDF
- ✅ **Google Sheets API**: Прямая синхронизация с Google Таблицами
- ✅ **Автоматические отчеты**: Аналитика и визуализация

### 🔧 Техническое
- ✅ **REST API**: Полное API для автоматизации
- ✅ **Docker контейнеризация**: Готов к деплою
- ✅ **Responsive дизайн**: Работает на всех устройствах
- ✅ **SEO оптимизация**: Готов для поисковых систем

## 🔗 API Endpoints

### Основные эндпоинты
- `GET /api/competitors` - Получить список конкурентов
- `POST /api/export` - Экспорт данных в различных форматах (CSV, Excel, JSON, PDF)
- `GET /api/export?format=xlsx&analytics=true` - Экспорт с аналитикой

### Мониторинг
- `GET /api/monitoring?action=history` - История изменений
- `GET /api/monitoring?action=analytics` - Аналитика изменений
- `GET /api/monitoring?action=update&competitorId=1` - Обновить данные конкурента
- `POST /api/monitoring` - Подписка на уведомления

### Google Sheets интеграция
- `POST /api/google-sheets` - Синхронизация с Google Таблицами
- `GET /api/google-sheets?spreadsheetId=xxx` - Чтение из Google Sheets

## 🎯 Использование

1. **Анализ конкурентов** - выбирайте компании и экспортируйте данные
2. **Аналитика** - изучайте тренды и метрики рынка
3. **Интеграции** - используйте API для автоматизации

## 📊 Данные включают

- Основная информация о компаниях
- Финансовые показатели и выручка
- Доли рынка и географию работы
- Тренды развития и новости
- Рейтинги и отзывы пользователей

## 🔧 Технологии

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Charts**: Recharts для визуализации
- **Icons**: Lucide React
- **Hosting**: Vercel
- **Analytics**: Vercel Analytics

## 📈 Что дальше?

После деплоя вы сможете:
- Настроить автоматический мониторинг изменений
- Интегрировать с Google Sheets/Excel
- Добавить email/Telegram уведомления
- Расширить базу конкурентов

## 💡 Поддержка

Если нужна помощь с настройкой или кастомизацией - пишите!

---

**Сделано с ❤️ для российского рынка недвижимости**