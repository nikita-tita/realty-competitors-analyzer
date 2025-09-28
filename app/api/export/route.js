import { NextResponse } from 'next/server'

export async function POST(request) {
  const { competitors } = await request.json()

  const headers = [
    'ID', 'Название Сервиса', 'URL', 'Категория Сервиса',
    'География', 'Тип Н/Д', 'Описание', 'Монетизация',
    'Статус', 'Цена', 'Рейтинг', 'Доля рынка', 'Выручка'
  ]

  const csvContent = [
    headers.join(','),
    ...competitors.map(comp => [
      comp.id,
      `"${comp.name}"`,
      comp.url,
      `"${comp.category}"`,
      `"${comp.geography}"`,
      `"${comp.propertyType}"`,
      `"${comp.description}"`,
      `"${comp.monetization}"`,
      comp.status,
      `"${comp.price}"`,
      comp.rating,
      `"${comp.marketShare || 'н/д'}"`,
      `"${comp.revenue || 'н/д'}"`
    ].join(','))
  ].join('\n')

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename=competitors.csv'
    }
  })
}