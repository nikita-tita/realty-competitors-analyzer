import { NextResponse } from 'next/server'
import ExportManager from '../../../lib/exportManager'
import { competitorsExtended } from '../../../lib/competitorSchema'

const exportManager = new ExportManager();

export async function POST(request) {
  try {
    const { competitors, format = 'csv', options = {} } = await request.json()

    // Используем расширенные данные если competitors не переданы
    const dataToExport = competitors || competitorsExtended;

    // Экспорт данных в указанном формате
    const result = await exportManager.exportData(dataToExport, format, options);

    // Возвращаем файл
    return new NextResponse(result.data, {
      headers: {
        'Content-Type': result.mimeType,
        'Content-Disposition': `attachment; filename=${result.filename}`,
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format') || 'csv'
  const includeAnalytics = searchParams.get('analytics') === 'true'
  const includeCharts = searchParams.get('charts') === 'true'

  try {
    const options = {
      includeAnalytics,
      includeCharts,
      title: 'Анализ конкурентов рынка недвижимости РФ'
    };

    const result = await exportManager.exportData(competitorsExtended, format, options);

    return new NextResponse(result.data, {
      headers: {
        'Content-Type': result.mimeType,
        'Content-Disposition': `attachment; filename=${result.filename}`,
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Export GET error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}