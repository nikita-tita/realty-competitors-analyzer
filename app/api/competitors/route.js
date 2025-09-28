import { NextResponse } from 'next/server'
import { competitors } from '../../../lib/competitors'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const search = searchParams.get('search')

  let filteredCompetitors = competitors

  if (category && category !== 'Все') {
    filteredCompetitors = filteredCompetitors.filter(c => c.category === category)
  }

  if (search) {
    filteredCompetitors = filteredCompetitors.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
    )
  }

  return NextResponse.json({
    competitors: filteredCompetitors,
    total: filteredCompetitors.length,
    timestamp: new Date().toISOString()
  })
}