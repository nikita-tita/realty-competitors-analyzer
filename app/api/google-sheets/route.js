import { NextResponse } from 'next/server'
import GoogleSheetsManager, { DataTransformer } from '../../../lib/googleSheetsIntegration'
import { competitorsExtended } from '../../../lib/competitorSchema'

export async function POST(request) {
  try {
    const { action, spreadsheetId, data, ...options } = await request.json();

    // В реальном проекте credentials будут из переменных окружения
    const credentials = {
      type: process.env.GOOGLE_SERVICE_ACCOUNT_TYPE,
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      client_id: process.env.GOOGLE_CLIENT_ID,
      auth_uri: process.env.GOOGLE_AUTH_URI,
      token_uri: process.env.GOOGLE_TOKEN_URI,
    };

    const sheetsManager = new GoogleSheetsManager(credentials);

    switch (action) {
      case 'sync':
        // Синхронизация данных конкурентов в Google Sheets
        const competitorsToSync = data || competitorsExtended;
        const result = await sheetsManager.syncCompetitorsToSheet(spreadsheetId, competitorsToSync);

        return NextResponse.json({
          message: 'Data synchronized successfully',
          spreadsheetId: spreadsheetId,
          updatedCells: result.data.updatedCells,
          timestamp: new Date().toISOString()
        });

      case 'read':
        // Чтение данных из Google Sheets
        const range = options.range || 'Competitors!A1:Z1000';
        const sheetData = await sheetsManager.readFromSheet(spreadsheetId, range);

        return NextResponse.json({
          message: 'Data read successfully',
          data: sheetData,
          count: sheetData.length
        });

      case 'format':
        // Форматирование таблицы
        const sheetId = options.sheetId || 0;
        await sheetsManager.formatSheet(spreadsheetId, sheetId);

        return NextResponse.json({
          message: 'Sheet formatted successfully',
          spreadsheetId: spreadsheetId,
          sheetId: sheetId
        });

      case 'create_report':
        // Создание отчета по изменениям
        const changes = options.changes || [];
        await sheetsManager.createChangeReport(spreadsheetId, changes);

        return NextResponse.json({
          message: 'Change report created successfully',
          changesCount: changes.length
        });

      case 'compare':
        // Сравнение данных
        const oldData = options.oldData || [];
        const newData = options.newData || competitorsExtended;
        const comparison = DataTransformer.compareData(oldData, newData);

        return NextResponse.json({
          message: 'Data comparison completed',
          changes: comparison,
          totalChanges: comparison.length
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Available actions: sync, read, format, create_report, compare' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Google Sheets API error:', error);

    // Возвращаем детальную ошибку в режиме разработки
    const errorResponse = {
      error: 'Failed to process Google Sheets request',
      message: error.message
    };

    if (process.env.NODE_ENV === 'development') {
      errorResponse.details = error.stack;
    }

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const spreadsheetId = searchParams.get('spreadsheetId');
  const range = searchParams.get('range') || 'Competitors!A1:Z1000';

  if (!spreadsheetId) {
    return NextResponse.json(
      { error: 'spreadsheetId parameter is required' },
      { status: 400 }
    );
  }

  try {
    const credentials = {
      // Заглушка для демонстрации
      client_email: 'demo@serviceaccount.com'
    };

    const sheetsManager = new GoogleSheetsManager(credentials);
    const data = await sheetsManager.readFromSheet(spreadsheetId, range);

    return NextResponse.json({
      message: 'Data retrieved successfully',
      spreadsheetId: spreadsheetId,
      range: range,
      data: data,
      count: data.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Google Sheets GET error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve data from Google Sheets' },
      { status: 500 }
    );
  }
}