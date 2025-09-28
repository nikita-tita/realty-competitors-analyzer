'use client'

import { useState, useEffect } from 'react'
import { Search, Download, ExternalLink, Building, MapPin, DollarSign, Star, Filter, Users, TrendingUp, CheckCircle, AlertCircle, Phone, Mail, Calendar, Globe, Briefcase } from 'lucide-react'
import { competitorsExtended } from '../lib/competitorSchema'
import { CompanyDataValidator } from '../lib/rbcCompaniesIntegration'

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('Все')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItems, setSelectedItems] = useState([])
  const [showDetails, setShowDetails] = useState({})
  const [validationResults, setValidationResults] = useState({})
  const [loading, setLoading] = useState(false)

  const validator = new CompanyDataValidator()

  const filteredCompetitors = competitorsExtended.filter(comp => {
    const matchesCategory = selectedCategory === 'Все' || comp.category === selectedCategory
    const matchesSearch = (comp.companyName || comp.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  // Валидация данных компании через RBC
  const validateCompany = async (competitor) => {
    setLoading(true)
    try {
      const result = await validator.validateCompany(competitor)
      setValidationResults(prev => ({
        ...prev,
        [competitor.id]: result
      }))
    } catch (error) {
      console.error('Ошибка валидации:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = async () => {
    const selectedCompetitors = competitorsExtended.filter(comp => selectedItems.includes(comp.id))

    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          competitors: selectedCompetitors,
          format: 'csv',
          options: {
            includeValidation: true,
            validationResults: validationResults
          }
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `competitors_verified_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        alert(`Экспортировано ${selectedCompetitors.length} конкурентов с проверкой данных!`)
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
            Полная база из {competitorsExtended.length} ключевых игроков с автоматическим мониторингом и аналитикой
          </p>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Building className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Всего компаний</span>
            </div>
            <span className="text-2xl font-bold text-blue-600">{competitorsExtended.length}</span>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">Активных</span>
            </div>
            <span className="text-2xl font-bold text-green-600">
              {competitorsExtended.filter(c => c.status === 'Активный').length}
            </span>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">PropTech</span>
            </div>
            <span className="text-2xl font-bold text-purple-600">
              {competitorsExtended.filter(c => c.category?.includes('Умные') || c.category?.includes('3D')).length}
            </span>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-900">Проверенных</span>
            </div>
            <span className="text-2xl font-bold text-orange-600">
              {Object.values(validationResults).filter(v => v.overallScore >= 80).length}
            </span>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-red-900">Требуют проверки</span>
            </div>
            <span className="text-2xl font-bold text-red-600">
              {competitorsExtended.length - Object.keys(validationResults).length}
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
          {filteredCompetitors.map(competitor => {
            const validation = validationResults[competitor.id]
            return (
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
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {competitor.companyName || competitor.name}
                          </h3>
                          {competitor.brandName && competitor.brandName !== competitor.companyName && (
                            <span className="text-sm text-gray-500">({competitor.brandName})</span>
                          )}
                          <a href={competitor.website || competitor.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(competitor.status)}`}>
                            {competitor.status}
                          </span>
                          {validation && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                              validation.overallScore >= 80
                                ? 'bg-green-100 text-green-800'
                                : validation.overallScore >= 50
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {validation.overallScore >= 80 ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : (
                                <AlertCircle className="w-3 h-3" />
                              )}
                              {validation.overallScore}% проверено
                            </span>
                          )}
                        </div>

                        {/* Основная информация */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="space-y-2">
                            <h4 className="font-medium text-gray-900 text-sm">📍 Локация и форма</h4>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div className="flex items-center gap-2">
                                <Building className="w-4 h-4" />
                                {competitor.headquarters || competitor.geography || 'Не указано'}
                              </div>
                              <div className="flex items-center gap-2">
                                <Briefcase className="w-4 h-4" />
                                {competitor.legalForm || 'Не указано'}
                              </div>
                              {competitor.foundedYear && (
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  Основан в {competitor.foundedYear}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h4 className="font-medium text-gray-900 text-sm">💰 Финансы</h4>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div>
                                <span className="font-medium">Выручка:</span> {competitor.revenue || 'Не указана'}
                                {validation?.validations?.financial && (
                                  <span className={`ml-2 px-1 text-xs rounded ${
                                    validation.validations.financial.isValid
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-red-100 text-red-700'
                                  }`}>
                                    {validation.validations.financial.isValid ? '✓ RBC' : '⚠ Проверить'}
                                  </span>
                                )}
                              </div>
                              <div><span className="font-medium">Сотрудники:</span> {competitor.employees || 'Не указано'}</div>
                              <div><span className="font-medium">Доля рынка:</span> {competitor.marketShare || 'Не указана'}</div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h4 className="font-medium text-gray-900 text-sm">📞 Контакты</h4>
                            <div className="text-sm text-gray-600 space-y-1">
                              {competitor.phone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4" />
                                  {competitor.phone}
                                </div>
                              )}
                              {competitor.email && (
                                <div className="flex items-center gap-2">
                                  <Mail className="w-4 h-4" />
                                  {competitor.email}
                                </div>
                              )}
                              {competitor.website && (
                                <div className="flex items-center gap-2">
                                  <Globe className="w-4 h-4" />
                                  <a href={competitor.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                    {competitor.website.replace('https://', '')}
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Бизнес модель и продукт */}
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 text-sm mb-2">🏢 Бизнес и продукт</h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div><span className="font-medium">Модель:</span> {competitor.businessModel || competitor.category}</div>
                            <div><span className="font-medium">Продукт:</span> {competitor.productType || 'Не указано'}</div>
                            <div><span className="font-medium">Монетизация:</span> {competitor.monetization || 'Не указано'}</div>
                            {competitor.targetAudience && (
                              <div><span className="font-medium">Аудитория:</span> {competitor.targetAudience}</div>
                            )}
                          </div>
                        </div>

                        <p className="text-gray-700 mb-3">{competitor.description}</p>

                        {/* Технологии и платформы */}
                        {competitor.technology && competitor.technology.length > 0 && (
                          <div className="mb-3">
                            <h4 className="font-medium text-gray-900 text-sm mb-2">⚙️ Технологии</h4>
                            <div className="flex flex-wrap gap-2">
                              {competitor.technology.slice(0, 5).map((tech, index) => (
                                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                  {tech}
                                </span>
                              ))}
                              {competitor.technology.length > 5 && (
                                <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded-full text-xs">
                                  +{competitor.technology.length - 5} еще
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Услуги и особенности */}
                        {competitor.services && competitor.services.length > 0 && (
                          <div className="mb-3">
                            <h4 className="font-medium text-gray-900 text-sm mb-2">🎯 Услуги</h4>
                            <div className="flex flex-wrap gap-2">
                              {competitor.services.slice(0, 4).map((service, index) => (
                                <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                                  {service}
                                </span>
                              ))}
                              {competitor.services.length > 4 && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs">
                                  +{competitor.services.length - 4} еще
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Тренды и новости */}
                        {competitor.trends && competitor.trends.length > 0 && (
                          <div className="mb-3">
                            <h4 className="font-medium text-gray-900 text-sm mb-2">📈 Тренды</h4>
                            <div className="flex flex-wrap gap-2">
                              {competitor.trends.slice(0, 3).map((trend, index) => (
                                <span key={index} className="px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" />
                                  {trend}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => validateCompany(competitor)}
                      disabled={loading}
                      className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                          Проверка...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Проверить через RBC
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => toggleDetails(competitor.id)}
                      className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                    >
                      {showDetails[competitor.id] ? 'Скрыть детали' : 'Все детали'}
                    </button>
                  </div>
                </div>

                {showDetails[competitor.id] && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                      {/* Финансовая информация */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          Финансы и инвестиции
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div><span className="font-medium">Выручка:</span> {competitor.revenue || 'Не указана'}</div>
                          <div><span className="font-medium">Привлечено:</span> {competitor.funding || 'Не указано'}</div>
                          <div><span className="font-medium">Оценка:</span> {competitor.valuation || 'Не указана'}</div>
                          {competitor.investors && competitor.investors.length > 0 && (
                            <div>
                              <span className="font-medium">Инвесторы:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {competitor.investors.map((investor, index) => (
                                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                    {investor}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Команда и руководство */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Команда
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div><span className="font-medium">Сотрудники:</span> {competitor.employees || 'Не указано'}</div>
                          {competitor.founders && competitor.founders.length > 0 && (
                            <div>
                              <span className="font-medium">Основатели:</span>
                              <div className="text-gray-600 mt-1">
                                {competitor.founders.join(', ')}
                              </div>
                            </div>
                          )}
                          {competitor.keyPeople && competitor.keyPeople.length > 0 && (
                            <div>
                              <span className="font-medium">Ключевые люди:</span>
                              <div className="text-gray-600 mt-1">
                                {competitor.keyPeople.join(', ')}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Рыночная позиция */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Рыночная позиция
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div><span className="font-medium">Доля рынка:</span> {competitor.marketShare || 'Не указана'}</div>
                          <div><span className="font-medium">Позиция:</span> {competitor.competitivePosition || 'Не указана'}</div>
                          {competitor.traffic && typeof competitor.traffic === 'object' && (
                            <div>
                              <span className="font-medium">Трафик:</span>
                              <div className="text-gray-600 mt-1 space-y-1">
                                {competitor.traffic.monthly && <div>Месячный: {competitor.traffic.monthly}</div>}
                                {competitor.traffic.uniqueVisitors && <div>Уникальные: {competitor.traffic.uniqueVisitors}</div>}
                                {competitor.traffic.mobileShare && <div>Мобильные: {competitor.traffic.mobileShare}</div>}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* SWOT анализ */}
                      {(competitor.strengths || competitor.weaknesses || competitor.opportunities || competitor.threats) && (
                        <div className="space-y-3 md:col-span-2 lg:col-span-3">
                          <h4 className="font-semibold text-gray-900">📊 SWOT анализ</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {competitor.strengths && competitor.strengths.length > 0 && (
                              <div>
                                <h5 className="font-medium text-green-700 mb-2">Сильные стороны</h5>
                                <ul className="text-sm text-gray-600 space-y-1">
                                  {competitor.strengths.map((strength, index) => (
                                    <li key={index} className="flex items-start gap-1">
                                      <span className="text-green-500 mt-1">•</span>
                                      {strength}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {competitor.weaknesses && competitor.weaknesses.length > 0 && (
                              <div>
                                <h5 className="font-medium text-red-700 mb-2">Слабые стороны</h5>
                                <ul className="text-sm text-gray-600 space-y-1">
                                  {competitor.weaknesses.map((weakness, index) => (
                                    <li key={index} className="flex items-start gap-1">
                                      <span className="text-red-500 mt-1">•</span>
                                      {weakness}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {competitor.opportunities && competitor.opportunities.length > 0 && (
                              <div>
                                <h5 className="font-medium text-blue-700 mb-2">Возможности</h5>
                                <ul className="text-sm text-gray-600 space-y-1">
                                  {competitor.opportunities.map((opportunity, index) => (
                                    <li key={index} className="flex items-start gap-1">
                                      <span className="text-blue-500 mt-1">•</span>
                                      {opportunity}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {competitor.threats && competitor.threats.length > 0 && (
                              <div>
                                <h5 className="font-medium text-orange-700 mb-2">Угрозы</h5>
                                <ul className="text-sm text-gray-600 space-y-1">
                                  {competitor.threats.map((threat, index) => (
                                    <li key={index} className="flex items-start gap-1">
                                      <span className="text-orange-500 mt-1">•</span>
                                      {threat}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Результаты валидации */}
                      {validation && (
                        <div className="space-y-3 md:col-span-2 lg:col-span-3 bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Результаты проверки через RBC Companies
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">

                            {validation.validations.legal && (
                              <div>
                                <h5 className="font-medium text-gray-700 mb-2">Юридическая информация</h5>
                                {validation.validations.legal.data ? (
                                  <div className="space-y-1 text-gray-600">
                                    <div><span className="font-medium">Полное название:</span> {validation.validations.legal.data.legalName}</div>
                                    <div><span className="font-medium">ИНН:</span> {validation.validations.legal.data.inn}</div>
                                    <div><span className="font-medium">ОГРН:</span> {validation.validations.legal.data.ogrn}</div>
                                    <div><span className="font-medium">Руководитель:</span> {validation.validations.legal.data.ceo}</div>
                                    <div><span className="font-medium">Статус:</span> {validation.validations.legal.data.status}</div>
                                  </div>
                                ) : (
                                  <p className="text-red-600">Данные не найдены в RBC</p>
                                )}
                              </div>
                            )}

                            {validation.validations.financial && (
                              <div>
                                <h5 className="font-medium text-gray-700 mb-2">Финансовая проверка</h5>
                                <div className="space-y-1 text-gray-600">
                                  <div className={`px-2 py-1 rounded text-xs ${
                                    validation.validations.financial.isValid
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {validation.validations.financial.message}
                                  </div>
                                  {validation.validations.financial.comparison && (
                                    <div className="space-y-1 mt-2">
                                      <div><span className="font-medium">Заявлено:</span> {validation.validations.financial.comparison.reported}</div>
                                      <div><span className="font-medium">По данным RBC:</span> {validation.validations.financial.comparison.official}</div>
                                      <div><span className="font-medium">Расхождение:</span> {validation.validations.financial.comparison.difference}</div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mt-3">
                            <span className="text-sm font-medium">Общий скор проверки:</span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              validation.overallScore >= 80
                                ? 'bg-green-100 text-green-800'
                                : validation.overallScore >= 50
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {validation.overallScore}%
                            </span>
                          </div>
                        </div>
                      )}

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
          <h3 className="text-lg font-semibold text-gray-900 mb-3">🚀 Возможности системы</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">📊 Детальный анализ:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                <li>25+ полей данных как в Google Sheets</li>
                <li>Финансы, технологии, SWOT анализ</li>
                <li>Контакты и юридическая информация</li>
                <li>Инвесторы и ключевые люди</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">✅ Проверка данных:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                <li>Валидация через RBC Companies</li>
                <li>Проверка финансовых показателей</li>
                <li>Сверка юридической информации</li>
                <li>Система скоринга достоверности</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">🔄 Автоматизация:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                <li>Мониторинг изменений</li>
                <li>Уведомления в реальном времени</li>
                <li>Экспорт в Excel с графиками</li>
                <li>API для интеграций</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-white rounded-lg border border-blue-200">
            <h4 className="font-medium text-gray-900 mb-2">🎯 Как использовать:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li><strong>Нажмите "Проверить через RBC"</strong> для валидации финансовых данных</li>
              <li><strong>Используйте "Все детали"</strong> для просмотра полной информации</li>
              <li><strong>Перейдите в "Мониторинг"</strong> для отслеживания изменений</li>
              <li><strong>Экспортируйте</strong> проверенные данные в нужном формате</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}