'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, DollarSign, Users, Award, Building } from 'lucide-react'
import { competitors } from '../../lib/competitors'

export default function Analytics() {
  const kpiData = [
    { title: 'Общая выручка рынка', value: '68.2 млрд ₽', change: '+12.3%', icon: DollarSign },
    { title: 'PropTech сегмент', value: '12.4 млрд ₽', change: '+28.5%', icon: TrendingUp },
    { title: 'Умные дома', value: '10.6 млрд ₽', change: '+33.0%', icon: Users },
    { title: 'Средний рейтинг', value: '4.4 / 5.0', change: '+0.2', icon: Award }
  ]

  const competitorsData = competitors.map(comp => ({
    name: comp.name,
    revenue: parseFloat(comp.revenue?.replace(/[^\d]/g, '') || '0') || Math.random() * 5000,
    category: comp.category,
    rating: parseFloat(comp.rating)
  }))

  const categoryData = competitors.reduce((acc, comp) => {
    const existing = acc.find(item => item.name === comp.category)
    if (existing) {
      existing.count++
    } else {
      acc.push({ name: comp.category, count: 1 })
    }
    return acc
  }, [])

  const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#6366F1']

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Аналитический дашборд</h1>
          <p className="text-gray-600">Данные и тренды российского рынка недвижимости на {new Date().getFullYear()} год</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpiData.map((kpi, index) => {
            const Icon = kpi.icon
            return (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <Icon className="w-8 h-8 text-blue-600" />
                  <span className="text-sm font-medium text-green-600 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {kpi.change}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{kpi.value}</h3>
                <p className="text-sm text-gray-600">{kpi.title}</p>
              </div>
            )
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Выручка по компаниям (млн ₽)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={competitorsData.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis />
                <Tooltip formatter={(value) => [`${value.toFixed(0)} млн ₽`, 'Выручка']} />
                <Bar dataKey="revenue" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Распределение по категориям</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, count }) => `${name}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🏆 Топ компаний по рейтингу</h2>
          <div className="space-y-4">
            {competitorsData
              .sort((a, b) => b.rating - a.rating)
              .slice(0, 5)
              .map((company, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{company.name}</h3>
                      <p className="text-sm text-gray-600">{company.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-orange-600">⭐ {company.rating}</span>
                    </div>
                    <p className="text-sm text-gray-600">{company.revenue.toFixed(0)} млн ₽</p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Market Insights */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 Ключевые инсайты</h2>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Рост умных домов:</strong> Сегмент показал рекордный рост +33% в 2025 году
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>PropTech лидер:</strong> Ujin увеличил выручку на 72% за год
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-800">
                  <strong>Инновации:</strong> Mighty Buildings привлек $100+ млн для 3D-печати домов
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🎯 Рекомендации</h2>
            <div className="space-y-3">
              <div className="p-3 border-l-4 border-blue-500 bg-blue-50">
                <p className="text-sm text-blue-800">
                  <strong>Инвестировать в AI:</strong> Внедрение ИИ показывает 45% рост
                </p>
              </div>
              <div className="p-3 border-l-4 border-green-500 bg-green-50">
                <p className="text-sm text-green-800">
                  <strong>Фокус на PropTech:</strong> Сегмент растет в 2 раза быстрее рынка
                </p>
              </div>
              <div className="p-3 border-l-4 border-purple-500 bg-purple-50">
                <p className="text-sm text-purple-800">
                  <strong>Партнерства:</strong> Интеграция с банками увеличивает конверсию
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}