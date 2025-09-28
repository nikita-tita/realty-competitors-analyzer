import './globals.css'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'RealtyCompetitors - Анализ рынка недвижимости РФ',
  description: 'Профессиональный сервис для мониторинга и анализа конкурентов на российском рынке недвижимости',
  keywords: 'недвижимость, конкуренты, анализ, PropTech, Россия',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <h1 className="text-xl font-bold text-gray-900">🏢 RealtyCompetitors</h1>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <a href="/" className="text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium">
                    Конкуренты
                  </a>
                  <a href="/analytics" className="text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 text-sm font-medium">
                    Аналитика
                  </a>
                  <a href="/monitoring" className="text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 text-sm font-medium">
                    Мониторинг
                  </a>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-500">v1.0.0</span>
              </div>
            </div>
          </div>
        </nav>
        {children}
        <Analytics />
      </body>
    </html>
  )
}