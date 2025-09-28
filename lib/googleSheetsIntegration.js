// Интеграция с Google Sheets API для синхронизации данных
import { GoogleAuth } from 'google-auth-library';

export class GoogleSheetsManager {
  constructor(credentials) {
    this.auth = new GoogleAuth({
      credentials: credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    this.sheets = null;
  }

  async initialize() {
    try {
      const authClient = await this.auth.getClient();
      this.sheets = {
        spreadsheets: {
          values: {
            get: async (params) => {
              // Mock implementation for development
              return {
                data: {
                  values: [
                    ['Company', 'Revenue', 'Employees', 'Status'],
                    ['ЦИАН', '12.5 млрд ₽', '1200', 'Active'],
                    ['ДомКлик', '8.2 млрд ₽', '800', 'Active']
                  ]
                }
              };
            },
            update: async (params) => {
              console.log('Updating Google Sheet:', params);
              return { data: { updatedCells: params.resource.values.length } };
            },
            batchUpdate: async (params) => {
              console.log('Batch updating Google Sheet:', params);
              return { data: { totalUpdatedCells: 100 } };
            }
          },
          get: async (params) => {
            return {
              data: {
                sheets: [
                  { properties: { title: 'Competitors', sheetId: 0 } },
                  { properties: { title: 'Analytics', sheetId: 1 } }
                ]
              }
            };
          }
        }
      };
      console.log('Google Sheets API initialized (mock mode)');
    } catch (error) {
      console.error('Error initializing Google Sheets API:', error);
      throw error;
    }
  }

  // Синхронизация данных конкурентов в Google Sheets
  async syncCompetitorsToSheet(spreadsheetId, competitors) {
    try {
      await this.initialize();

      // Подготовка заголовков в соответствии с вашей схемой
      const headers = [
        'ID', 'Название компании', 'Бренд', 'Сайт', 'Форма собственности',
        'Штаб-квартира', 'Регионы', 'Телефон', 'Email',
        'Бизнес-модель', 'Целевая аудитория', 'Типы недвижимости',
        'Услуги', 'Монетизация', 'Выручка', 'Сотрудники',
        'Доля рынка', 'Трафик (мес)', 'Рейтинг',
        'Статус', 'Год основания', 'Последнее обновление',
        'Сильные стороны', 'Слабые стороны', 'Возможности', 'Угрозы'
      ];

      // Конвертация данных в формат для Google Sheets
      const rows = competitors.map(comp => [
        comp.id,
        comp.companyName || comp.name,
        comp.brandName || comp.name,
        comp.website || comp.url,
        comp.legalForm || 'Не указано',
        comp.headquarters || comp.geography,
        Array.isArray(comp.regions) ? comp.regions.join(', ') : comp.geography,
        comp.phone || 'Не указано',
        comp.email || 'Не указано',
        comp.businessModel || comp.category,
        comp.targetAudience || 'Не указано',
        Array.isArray(comp.propertyTypes) ? comp.propertyTypes.join(', ') : comp.propertyType,
        Array.isArray(comp.services) ? comp.services.join(', ') : 'Не указано',
        comp.monetization || 'Не указано',
        comp.revenue || 'Не указано',
        comp.employees || 'Не указано',
        comp.marketShare || 'Не указано',
        comp.traffic?.monthly || comp.traffic || 'Не указано',
        comp.rankings?.appStore || comp.rating || 'Не указано',
        comp.status || 'Активный',
        comp.foundedYear || 'Не указано',
        comp.lastUpdate ? new Date(comp.lastUpdate).toLocaleDateString('ru-RU') : new Date().toLocaleDateString('ru-RU'),
        Array.isArray(comp.strengths) ? comp.strengths.join(', ') : 'Не указано',
        Array.isArray(comp.weaknesses) ? comp.weaknesses.join(', ') : 'Не указано',
        Array.isArray(comp.opportunities) ? comp.opportunities.join(', ') : 'Не указано',
        Array.isArray(comp.threats) ? comp.threats.join(', ') : 'Не указано'
      ]);

      const values = [headers, ...rows];

      // Обновление данных в Google Sheets
      const result = await this.sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: 'Competitors!A1',
        valueInputOption: 'RAW',
        resource: { values }
      });

      console.log(`Updated ${result.data.updatedCells} cells in Google Sheets`);
      return result;
    } catch (error) {
      console.error('Error syncing to Google Sheets:', error);
      throw error;
    }
  }

  // Чтение данных из Google Sheets
  async readFromSheet(spreadsheetId, range = 'Competitors!A1:Z1000') {
    try {
      await this.initialize();

      const result = await this.sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: range
      });

      const rows = result.data.values;
      if (!rows || rows.length === 0) {
        return [];
      }

      const headers = rows[0];
      const data = rows.slice(1).map(row => {
        const item = {};
        headers.forEach((header, index) => {
          item[header] = row[index] || '';
        });
        return item;
      });

      return data;
    } catch (error) {
      console.error('Error reading from Google Sheets:', error);
      throw error;
    }
  }

  // Создание отчета по изменениям
  async createChangeReport(spreadsheetId, changes) {
    try {
      const reportData = [
        ['Дата', 'Компания', 'Поле', 'Старое значение', 'Новое значение', 'Источник'],
        ...changes.map(change => [
          new Date(change.timestamp).toLocaleDateString('ru-RU'),
          change.companyName,
          change.field,
          change.oldValue,
          change.newValue,
          change.source
        ])
      ];

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: 'Changes!A1',
        valueInputOption: 'RAW',
        resource: { values: reportData }
      });

      console.log('Change report created successfully');
    } catch (error) {
      console.error('Error creating change report:', error);
      throw error;
    }
  }

  // Автоматическое форматирование таблицы
  async formatSheet(spreadsheetId, sheetId = 0) {
    try {
      const requests = [
        // Заморозка первой строки
        {
          updateSheetProperties: {
            properties: {
              sheetId: sheetId,
              gridProperties: {
                frozenRowCount: 1
              }
            },
            fields: 'gridProperties.frozenRowCount'
          }
        },
        // Форматирование заголовков
        {
          repeatCell: {
            range: {
              sheetId: sheetId,
              startRowIndex: 0,
              endRowIndex: 1
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.2, green: 0.6, blue: 1.0 },
                textFormat: {
                  foregroundColor: { red: 1.0, green: 1.0, blue: 1.0 },
                  bold: true
                }
              }
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat)'
          }
        },
        // Автоматическая ширина колонок
        {
          autoResizeDimensions: {
            dimensions: {
              sheetId: sheetId,
              dimension: 'COLUMNS',
              startIndex: 0,
              endIndex: 26
            }
          }
        }
      ];

      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: spreadsheetId,
        resource: { requests }
      });

      console.log('Sheet formatted successfully');
    } catch (error) {
      console.error('Error formatting sheet:', error);
      throw error;
    }
  }
}

// Утилиты для работы с данными
export class DataTransformer {
  // Конвертация данных в формат Google Sheets
  static toSheetsFormat(competitors) {
    return competitors.map(comp => ({
      id: comp.id,
      companyName: comp.companyName || comp.name,
      website: comp.website || comp.url,
      revenue: comp.revenue,
      employees: comp.employees,
      marketShare: comp.marketShare,
      status: comp.status,
      lastUpdate: comp.lastUpdate
    }));
  }

  // Конвертация из формата Google Sheets
  static fromSheetsFormat(sheetsData) {
    return sheetsData.map(row => ({
      id: parseInt(row['ID']) || 0,
      name: row['Название компании'] || '',
      website: row['Сайт'] || '',
      revenue: row['Выручка'] || '',
      employees: row['Сотрудники'] || '',
      marketShare: row['Доля рынка'] || '',
      status: row['Статус'] || 'Unknown'
    }));
  }

  // Сравнение данных для выявления изменений
  static compareData(oldData, newData) {
    const changes = [];

    newData.forEach(newItem => {
      const oldItem = oldData.find(item => item.id === newItem.id);
      if (!oldItem) {
        changes.push({
          type: 'added',
          companyId: newItem.id,
          companyName: newItem.name,
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Проверка изменений в полях
      Object.keys(newItem).forEach(key => {
        if (oldItem[key] !== newItem[key]) {
          changes.push({
            type: 'updated',
            companyId: newItem.id,
            companyName: newItem.name,
            field: key,
            oldValue: oldItem[key],
            newValue: newItem[key],
            timestamp: new Date().toISOString()
          });
        }
      });
    });

    return changes;
  }
}

export default GoogleSheetsManager;