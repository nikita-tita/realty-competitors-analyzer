'use client'

import { useState, useEffect } from 'react'
import { Search, Download, ExternalLink, Building, MapPin, DollarSign, Star, Filter, Users, TrendingUp } from 'lucide-react'
import { competitors, categories } from '../lib/competitors'

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('Все')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItems, setSelectedItems] = useState([])
  const [showDetails, setShowDetails] = useState({})

  const filteredCompetitors = competitors.filter(comp => {
    const matchesCategory = selectedCategory === 'Все' || comp.category === selectedCategory
    const matchesSearch = comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comp.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const toggleSelection = (id) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const toggleDetails = (id) => {
    setShowDetails(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const exportToCSV = async () => {
    const selectedCompetitors = competitors.filter(comp => selectedItems.includes(comp.id))

    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ competitors: selectedCompetitors })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `competitors_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        alert(`Экспортировано ${selectedCompetitors.length} конкурентов!`)
      }
    } catch (error) {
      console.error('Ошибка экспорта:', error)
      alert('Ошибка при экспорте данных')
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'Активный': return 'bg-green-100 text-green-800'
      case 'Растущий': return 'bg-blue-100 text-blue-800'
      case 'Международный': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Анализатор конкурентов рынка недвижимости РФ 2025
          </h1>
          <p className="text-gray-600">
            Полная база из {competitors.length} ключевых игроков с автоматическим мониторингом и аналитикой
          </p>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Building className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Всего компаний</span>
            </div>
            <span className="text-2xl font-bold text-blue-600">{competitors.length}</span>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">Активных</span>
            </div>
            <span className="text-2xl font-bold text-green-600">
              {competitors.filter(c => c.status === 'Активный').length}
            </span>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">PropTech</span>
            </div>
            <span className="text-2xl font-bold text-purple-600">
              {competitors.filter(c => c.category.includes('Умные') || c.category.includes('3D')).length}
            </span>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-900">Средний рейтинг</span>
            </div>
            <span className="text-2xl font-bold text-orange-600">
              {(competitors.reduce((sum, c) => sum + parseFloat(c.rating), 0) / competitors.length).toFixed(1)}
            </span>
          </div>
        </div>

        {/* Панель управления */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Поиск по названию или описанию..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-sm text-gray-500 py-2">
                Выбрано: {selectedItems.length} из {filteredCompetitors.length}
              </span>
              <button
                onClick={exportToCSV}
                disabled={selectedItems.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Экспорт в CSV
              </button>
            </div>
          </div>
        </div>

        {/* Список конкурентов */}
        <div className="space-y-4">
          {filteredCompetitors.map(competitor => (
            <div key={competitor.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(competitor.id)}
                      onChange={() => toggleSelection(competitor.id)}
                      className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{competitor.name}</h3>
                        <a href={competitor.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(competitor.status)}`}>
                          {competitor.status}
                        </span>
                        {competitor.revenue && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                            {competitor.revenue}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Building className="w-4 h-4" />
                          {competitor.category}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {competitor.geography}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {competitor.price}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4" />
                          ⭐ {competitor.rating}
                        </div>
                      </div>

                      <p className="text-gray-700 mb-3">{competitor.description}</p>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {competitor.features?.slice(0, 3).map((feature, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                            {feature}
                          </span>
                        ))}
                        {competitor.features?.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                            +{competitor.features.length - 3} еще
                          </span>
                        )}
                      </div>

                      {competitor.trends && (
                        <div className="flex flex-wrap gap-2">
                          {competitor.trends.slice(0, 2).map((trend, index) => (
                            <span key={index} className="px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              {trend}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => toggleDetails(competitor.id)}
                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                  >
                    {showDetails[competitor.id] ? 'Скрыть' : 'Подробнее'}
                  </button>
                </div>

                {showDetails[competitor.id] && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Тип недвижимости:</span>
                        <p className="text-gray-600">{competitor.propertyType}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Модель монетизации:</span>
                        <p className="text-gray-600">{competitor.monetization}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Доля рынка:</span>
                        <p className="text-gray-600">{competitor.marketShare}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Трафик:</span>
                        <p className="text-gray-600">{competitor.traffic}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Сотрудники:</span>
                        <p className="text-gray-600">{competitor.employees}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Последнее обновление:</span>
                        <p className="text-gray-600">{competitor.lastUpdate}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredCompetitors.length === 0 && (
          <div className="text-center py-12">
            <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Конкуренты не найдены</h3>
            <p className="text-gray-600">Попробуйте изменить фильтры или поисковый запрос</p>
          </div>
        )}

        {/* Инструкция */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">🚀 Как использовать</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Быстрый старт:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                <li>Выберите нужных конкурентов чекбоксами</li>
                <li>Используйте фильтры для поиска</li>
                <li>Нажмите "Экспорт в CSV" для скачивания</li>
                <li>Импортируйте данные в свои системы</li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Возможности:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                <li>База из 5+ ключевых игроков рынка</li>
                <li>Актуальная информация на 2025 год</li>
                <li>Экспорт в CSV для Google Sheets/Excel</li>
                <li>API для автоматических интеграций</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}