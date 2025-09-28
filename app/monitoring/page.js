'use client'

import { useState, useEffect } from 'react'
import {
  Bell,
  Download,
  RotateCcw as Refresh,
  TrendingUp,
  AlertTriangle,
  Info,
  Calendar,
  Filter,
  Settings,
  ExternalLink,
  Database,
  FileSpreadsheet,
  Mail,
  MessageSquare
} from 'lucide-react'

export default function MonitoringPage() {
  const [changes, setChanges] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [selectedFilter, setSelectedFilter] = useState('all')

  // Загрузка истории изменений
  const loadChangeHistory = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/monitoring?action=history')
      const data = await response.json()
      setChanges(data.history || [])
    } catch (error) {
      console.error('Error loading changes:', error)
    } finally {
      setLoading(false)
    }
  }

  // Загрузка аналитики
  const loadAnalytics = async () => {
    try {
      const response = await fetch('/api/monitoring?action=analytics')
      const data = await response.json()
      setAnalytics(data.analytics)
    } catch (error) {
      console.error('Error loading analytics:', error)
    }
  }

  // Ручное обновление данных
  const manualUpdate = async (competitorId) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/monitoring?action=update&competitorId=${competitorId}`)
      const data = await response.json()

      // Обновляем локальное состояние
      await loadChangeHistory()

      // Показываем уведомление
      addNotification('success', `Данные для конкурента ${competitorId} обновлены`)
    } catch (error) {
      console.error('Error updating competitor:', error)
      addNotification('error', 'Ошибка при обновлении данных')
    } finally {
      setLoading(false)
    }
  }

  // Добавить уведомление
  const addNotification = (type, message) => {
    const id = Date.now()
    setNotifications(prev => [...prev, { id, type, message }])
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 5000)
  }

  // Экспорт отчета
  const exportReport = async (format) => {
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: format,
          options: {
            includeAnalytics: true,
            includeCharts: format === 'xlsx',
            title: 'Отчет по мониторингу изменений'
          }
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `monitoring_report.${format}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)

        addNotification('success', `Отчет экспортирован в формате ${format.toUpperCase()}`)
      }
    } catch (error) {
      console.error('Export error:', error)
      addNotification('error', 'Ошибка при экспорте отчета')
    }
  }

  // Подписка на уведомления
  const subscribeToNotifications = async (channel, address) => {
    try {
      const response = await fetch('/api/monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'subscribe',
          channel: channel,
          address: address,
          filters: {
            severity: ['CRITICAL', 'WARNING']
          }
        })
      })

      if (response.ok) {
        addNotification('success', `Подписка на ${channel} уведомления активирована`)
      }
    } catch (error) {
      console.error('Subscription error:', error)
      addNotification('error', 'Ошибка при подписке на уведомления')
    }
  }

  useEffect(() => {
    loadChangeHistory()
    loadAnalytics()
  }, [])

  const filteredChanges = changes.filter(change => {
    if (selectedFilter === 'all') return true
    if (selectedFilter === 'critical') return change.severity === 'CRITICAL'
    if (selectedFilter === 'warning') return change.severity === 'WARNING'
    if (selectedFilter === 'info') return change.severity === 'INFO'
    return true
  })

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'CRITICAL': return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'WARNING': return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'INFO': return <Info className="w-4 h-4 text-blue-500" />
      default: return <Info className="w-4 h-4 text-gray-500" />
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200'
      case 'WARNING': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'INFO': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Уведомления */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg shadow-lg ${
                notification.type === 'success'
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}
            >
              {notification.message}
            </div>
          ))}
        </div>
      )}

      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Мониторинг изменений конкурентов
          </h1>
          <p className="text-gray-600">
            Система автоматического отслеживания изменений и уведомлений
          </p>
        </div>

        {/* Аналитика */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {analytics.totalChanges}
                  </h3>
                  <p className="text-sm text-gray-600">Всего изменений (30 дней)</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {analytics.bySeverity?.CRITICAL || 0}
                  </h3>
                  <p className="text-sm text-gray-600">Критичные изменения</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <Bell className="w-8 h-8 text-yellow-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {analytics.bySeverity?.WARNING || 0}
                  </h3>
                  <p className="text-sm text-gray-600">Предупреждения</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <Database className="w-8 h-8 text-green-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {analytics.mostActiveCompetitors?.length || 0}
                  </h3>
                  <p className="text-sm text-gray-600">Активных компаний</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Панель управления */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-wrap gap-4">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Все изменения</option>
                <option value="critical">Критичные</option>
                <option value="warning">Предупреждения</option>
                <option value="info">Информационные</option>
              </select>

              <button
                onClick={loadChangeHistory}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Refresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Обновить
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => exportReport('csv')}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Download className="w-4 h-4" />
                CSV
              </button>

              <button
                onClick={() => exportReport('xlsx')}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Excel
              </button>

              <button
                onClick={() => exportReport('json')}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Database className="w-4 h-4" />
                JSON
              </button>
            </div>
          </div>
        </div>

        {/* Настройки уведомлений */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Настройки уведомлений</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email уведомления
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => subscribeToNotifications('email', 'user@example.com')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Mail className="w-4 h-4" />
                  Подписаться
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telegram уведомления
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="@username или chat_id"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => subscribeToNotifications('telegram', '@username')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <MessageSquare className="w-4 h-4" />
                  Подписаться
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* История изменений */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              История изменений ({filteredChanges.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredChanges.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Изменения не найдены
                </h3>
                <p className="text-gray-600">
                  {selectedFilter === 'all'
                    ? 'Пока нет зафиксированных изменений'
                    : `Нет изменений с фильтром "${selectedFilter}"`
                  }
                </p>
              </div>
            ) : (
              filteredChanges.map((change, index) => (
                <div key={index} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {getSeverityIcon(change.severity)}

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {change.competitorName}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(change.severity)}`}>
                            {change.severity}
                          </span>
                          <span className="text-sm text-gray-500">
                            {change.type}
                          </span>
                        </div>

                        {change.field && (
                          <div className="text-sm text-gray-600 mb-2">
                            <strong>Поле:</strong> {change.field}
                          </div>
                        )}

                        {change.oldValue && change.newValue && (
                          <div className="text-sm text-gray-600 mb-2">
                            <div><strong>Было:</strong> {change.oldValue}</div>
                            <div><strong>Стало:</strong> {change.newValue}</div>
                          </div>
                        )}

                        {change.impact && (
                          <div className="text-sm text-blue-600 mb-2">
                            <strong>Влияние:</strong> {change.impact}
                          </div>
                        )}

                        <div className="text-xs text-gray-500">
                          {new Date(change.timestamp).toLocaleString('ru-RU')}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => manualUpdate(change.competitorId)}
                      className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Refresh className="w-4 h-4" />
                      Обновить
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Инструкция */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">📊 Возможности системы мониторинга</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Автоматический мониторинг:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                <li>Отслеживание изменений цен и услуг</li>
                <li>Мониторинг финансовых показателей</li>
                <li>Анализ трафика и рейтингов</li>
                <li>Уведомления о новостях и обновлениях</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Уведомления:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                <li>Email и Telegram уведомления</li>
                <li>Фильтрация по критичности</li>
                <li>Настраиваемые webhook'и</li>
                <li>Экспорт отчетов в различных форматах</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}