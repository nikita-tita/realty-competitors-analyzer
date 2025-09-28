import { NextResponse } from 'next/server'
import { CompanyDataValidator } from '../../../lib/rbcCompaniesIntegration'
import { competitorsExtended } from '../../../lib/competitorSchema'

const validator = new CompanyDataValidator()

export async function POST(request) {
  try {
    const { action, competitorId, companyName } = await request.json()

    switch (action) {
      case 'validate_single':
        // Валидация одной компании
        const competitor = competitorsExtended.find(c => c.id === competitorId)
        if (!competitor) {
          return NextResponse.json(
            { error: 'Competitor not found' },
            { status: 404 }
          )
        }

        const validation = await validator.validateCompany(competitor)

        return NextResponse.json({
          success: true,
          validation: validation,
          timestamp: new Date().toISOString()
        })

      case 'validate_all':
        // Валидация всех компаний
        const allValidations = await validator.validateAllCompanies(competitorsExtended)

        return NextResponse.json({
          success: true,
          validations: allValidations,
          stats: validator.getValidationStats(),
          timestamp: new Date().toISOString()
        })

      case 'get_stats':
        // Получение статистики валидации
        const stats = validator.getValidationStats()

        return NextResponse.json({
          success: true,
          stats: stats,
          results: validator.getValidationResults(),
          timestamp: new Date().toISOString()
        })

      case 'search_rbc':
        // Поиск в RBC Companies
        if (!companyName) {
          return NextResponse.json(
            { error: 'Company name is required' },
            { status: 400 }
          )
        }

        const searchResults = await validator.rbcValidator.searchCompany(companyName)

        return NextResponse.json({
          success: true,
          results: searchResults,
          query: companyName,
          timestamp: new Date().toISOString()
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action. Available: validate_single, validate_all, get_stats, search_rbc' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Validation API error:', error)
    return NextResponse.json(
      {
        error: 'Validation failed',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const competitorId = searchParams.get('competitorId')
  const action = searchParams.get('action') || 'get_results'

  try {
    switch (action) {
      case 'get_results':
        // Получение результатов валидации
        const results = validator.getValidationResults(
          competitorId ? parseInt(competitorId) : null
        )

        return NextResponse.json({
          success: true,
          results: results,
          timestamp: new Date().toISOString()
        })

      case 'get_stats':
        // Получение статистики
        const stats = validator.getValidationStats()

        return NextResponse.json({
          success: true,
          stats: stats,
          timestamp: new Date().toISOString()
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action. Available: get_results, get_stats' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Validation GET error:', error)
    return NextResponse.json(
      { error: 'Failed to get validation data' },
      { status: 500 }
    )
  }
}