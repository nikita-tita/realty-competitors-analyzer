// Система экспорта данных в различные форматы
import ExcelJS from 'exceljs';

export class ExportManager {
  constructor() {
    this.supportedFormats = ['csv', 'xlsx', 'json', 'pdf', 'google-sheets'];
  }

  // Основной метод экспорта
  async exportData(competitors, format, options = {}) {
    switch (format.toLowerCase()) {
      case 'csv':
        return this.exportToCSV(competitors, options);
      case 'xlsx':
        return this.exportToExcel(competitors, options);
      case 'json':
        return this.exportToJSON(competitors, options);
      case 'pdf':
        return this.exportToPDF(competitors, options);
      case 'google-sheets':
        return this.exportToGoogleSheets(competitors, options);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  // Экспорт в CSV
  exportToCSV(competitors, options = {}) {
    const fields = options.fields || this.getDefaultFields();
    const delimiter = options.delimiter || ',';
    const includeHeaders = options.includeHeaders !== false;

    // Заголовки
    let csv = '';
    if (includeHeaders) {
      csv += fields.map(field => `"${field.label}"`).join(delimiter) + '\n';
    }

    // Данные
    competitors.forEach(competitor => {
      const row = fields.map(field => {
        let value = this.getFieldValue(competitor, field.key);

        // Форматирование значений
        if (Array.isArray(value)) {
          value = value.join('; ');
        } else if (typeof value === 'object' && value !== null) {
          value = JSON.stringify(value);
        } else if (value === null || value === undefined) {
          value = '';
        }

        // Экранирование кавычек в CSV
        value = String(value).replace(/"/g, '""');
        return `"${value}"`;
      });

      csv += row.join(delimiter) + '\n';
    });

    return {
      data: csv,
      mimeType: 'text/csv',
      filename: `competitors_${new Date().toISOString().split('T')[0]}.csv`
    };
  }

  // Экспорт в Excel
  async exportToExcel(competitors, options = {}) {
    const workbook = new ExcelJS.Workbook();

    // Лист с основными данными
    const mainSheet = workbook.addWorksheet('Competitors');
    const fields = options.fields || this.getDefaultFields();

    // Заголовки
    const headers = fields.map(field => field.label);
    mainSheet.addRow(headers);

    // Стилизация заголовков
    const headerRow = mainSheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '366092' }
    };

    // Данные
    competitors.forEach(competitor => {
      const row = fields.map(field => {
        let value = this.getFieldValue(competitor, field.key);

        if (Array.isArray(value)) {
          return value.join('; ');
        } else if (typeof value === 'object' && value !== null) {
          return JSON.stringify(value);
        }

        return value || '';
      });

      mainSheet.addRow(row);
    });

    // Автоширина колонок
    mainSheet.columns.forEach(column => {
      column.width = 15;
    });

    // Дополнительные листы
    if (options.includeAnalytics) {
      this.addAnalyticsSheet(workbook, competitors);
    }

    if (options.includeCharts) {
      this.addChartsSheet(workbook, competitors);
    }

    // Конвертация в буфер
    const buffer = await workbook.xlsx.writeBuffer();

    return {
      data: buffer,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      filename: `competitors_${new Date().toISOString().split('T')[0]}.xlsx`
    };
  }

  // Экспорт в JSON
  exportToJSON(competitors, options = {}) {
    let data;

    if (options.format === 'simple') {
      // Упрощенный формат
      data = competitors.map(comp => ({
        id: comp.id,
        name: comp.companyName || comp.name,
        website: comp.website,
        revenue: comp.revenue,
        employees: comp.employees,
        status: comp.status
      }));
    } else if (options.format === 'analytics') {
      // Формат для аналитики
      data = {
        metadata: {
          exportDate: new Date().toISOString(),
          totalCompetitors: competitors.length,
          version: '1.0'
        },
        competitors: competitors,
        analytics: this.generateAnalytics(competitors)
      };
    } else {
      // Полный формат
      data = competitors;
    }

    const jsonString = JSON.stringify(data, null, options.pretty ? 2 : 0);

    return {
      data: jsonString,
      mimeType: 'application/json',
      filename: `competitors_${new Date().toISOString().split('T')[0]}.json`
    };
  }

  // Экспорт в PDF
  async exportToPDF(competitors, options = {}) {
    // Mock implementation - в реальном проекте использовали бы puppeteer или jsPDF
    const pdfContent = this.generatePDFContent(competitors, options);

    return {
      data: Buffer.from(pdfContent), // В реальности здесь был бы PDF буфер
      mimeType: 'application/pdf',
      filename: `competitors_report_${new Date().toISOString().split('T')[0]}.pdf`
    };
  }

  // Генерация контента для PDF
  generatePDFContent(competitors, options) {
    const reportTitle = options.title || 'Анализ конкурентов рынка недвижимости РФ';
    const date = new Date().toLocaleDateString('ru-RU');

    let content = `
      ОТЧЕТ: ${reportTitle}
      Дата: ${date}
      Количество компаний: ${competitors.length}

      =====================================

    `;

    competitors.forEach((comp, index) => {
      content += `
        ${index + 1}. ${comp.companyName || comp.name}

        Сайт: ${comp.website || 'Не указан'}
        Выручка: ${comp.revenue || 'Не указана'}
        Сотрудники: ${comp.employees || 'Не указано'}
        Доля рынка: ${comp.marketShare || 'Не указана'}
        Статус: ${comp.status || 'Неизвестен'}

        Описание: ${comp.description || 'Описание отсутствует'}

        Сильные стороны: ${Array.isArray(comp.strengths) ? comp.strengths.join(', ') : 'Не указаны'}

        -------------------------------------

      `;
    });

    return content;
  }

  // Экспорт в Google Sheets
  async exportToGoogleSheets(competitors, options = {}) {
    // Здесь была бы интеграция с Google Sheets API
    const spreadsheetData = {
      spreadsheetId: options.spreadsheetId || 'new',
      ranges: [
        {
          range: 'Competitors!A1',
          values: this.prepareGoogleSheetsData(competitors)
        }
      ]
    };

    return {
      data: spreadsheetData,
      mimeType: 'application/json',
      filename: 'google_sheets_export.json'
    };
  }

  // Подготовка данных для Google Sheets
  prepareGoogleSheetsData(competitors) {
    const fields = this.getDefaultFields();
    const headers = fields.map(field => field.label);

    const rows = competitors.map(competitor =>
      fields.map(field => {
        let value = this.getFieldValue(competitor, field.key);

        if (Array.isArray(value)) {
          return value.join('; ');
        } else if (typeof value === 'object' && value !== null) {
          return JSON.stringify(value);
        }

        return value || '';
      })
    );

    return [headers, ...rows];
  }

  // Добавление листа с аналитикой в Excel
  addAnalyticsSheet(workbook, competitors) {
    const analyticsSheet = workbook.addWorksheet('Analytics');

    // Статистика по статусам
    const statusStats = this.getStatusStatistics(competitors);
    analyticsSheet.addRow(['Статистика по статусам']);
    analyticsSheet.addRow(['Статус', 'Количество', 'Процент']);

    Object.entries(statusStats).forEach(([status, count]) => {
      const percentage = ((count / competitors.length) * 100).toFixed(1);
      analyticsSheet.addRow([status, count, `${percentage}%`]);
    });

    analyticsSheet.addRow([]); // Пустая строка

    // Статистика по регионам
    const regionStats = this.getRegionStatistics(competitors);
    analyticsSheet.addRow(['Статистика по регионам']);
    analyticsSheet.addRow(['Регион', 'Количество компаний']);

    Object.entries(regionStats).forEach(([region, count]) => {
      analyticsSheet.addRow([region, count]);
    });
  }

  // Добавление листа с графиками
  addChartsSheet(workbook, competitors) {
    const chartsSheet = workbook.addWorksheet('Charts');

    // Данные для графиков
    chartsSheet.addRow(['Данные для визуализации']);
    chartsSheet.addRow(['Компания', 'Выручка (млн ₽)', 'Сотрудники', 'Доля рынка (%)']);

    competitors.forEach(comp => {
      const revenue = this.parseNumericValue(comp.revenue);
      const employees = this.parseNumericValue(comp.employees);
      const marketShare = this.parseNumericValue(comp.marketShare);

      chartsSheet.addRow([
        comp.companyName || comp.name,
        revenue,
        employees,
        marketShare
      ]);
    });
  }

  // Вспомогательные методы

  getDefaultFields() {
    return [
      { key: 'id', label: 'ID' },
      { key: 'companyName', label: 'Название компании', fallback: 'name' },
      { key: 'brandName', label: 'Бренд' },
      { key: 'website', label: 'Сайт', fallback: 'url' },
      { key: 'legalForm', label: 'Форма собственности' },
      { key: 'headquarters', label: 'Штаб-квартира', fallback: 'geography' },
      { key: 'businessModel', label: 'Бизнес-модель', fallback: 'category' },
      { key: 'revenue', label: 'Выручка' },
      { key: 'employees', label: 'Сотрудники' },
      { key: 'marketShare', label: 'Доля рынка' },
      { key: 'status', label: 'Статус' },
      { key: 'foundedYear', label: 'Год основания' },
      { key: 'description', label: 'Описание' }
    ];
  }

  getFieldValue(object, key, fallback = null) {
    let value = object[key];

    if ((value === null || value === undefined) && fallback) {
      value = object[fallback];
    }

    return value;
  }

  parseNumericValue(value) {
    if (!value) return 0;
    const match = String(value).match(/[\d,\.]+/);
    return match ? parseFloat(match[0].replace(',', '.')) : 0;
  }

  getStatusStatistics(competitors) {
    const stats = {};
    competitors.forEach(comp => {
      const status = comp.status || 'Неизвестен';
      stats[status] = (stats[status] || 0) + 1;
    });
    return stats;
  }

  getRegionStatistics(competitors) {
    const stats = {};
    competitors.forEach(comp => {
      const regions = comp.regions || [comp.headquarters || comp.geography || 'Не указан'];
      const regionList = Array.isArray(regions) ? regions : [regions];

      regionList.forEach(region => {
        if (region) {
          stats[region] = (stats[region] || 0) + 1;
        }
      });
    });
    return stats;
  }

  generateAnalytics(competitors) {
    return {
      totalCompanies: competitors.length,
      statusDistribution: this.getStatusStatistics(competitors),
      regionDistribution: this.getRegionStatistics(competitors),
      averageEmployees: this.calculateAverageEmployees(competitors),
      marketCoverage: this.calculateMarketCoverage(competitors)
    };
  }

  calculateAverageEmployees(competitors) {
    const employeeCounts = competitors
      .map(comp => this.parseNumericValue(comp.employees))
      .filter(count => count > 0);

    return employeeCounts.length > 0
      ? Math.round(employeeCounts.reduce((sum, count) => sum + count, 0) / employeeCounts.length)
      : 0;
  }

  calculateMarketCoverage(competitors) {
    const marketShares = competitors
      .map(comp => this.parseNumericValue(comp.marketShare))
      .filter(share => share > 0);

    return marketShares.reduce((sum, share) => sum + share, 0);
  }
}

// Утилиты для форматирования
export class FormatUtils {
  static formatCurrency(value, currency = '₽') {
    if (!value) return 'Не указано';
    const num = this.parseNumeric(value);
    return num ? `${num.toLocaleString('ru-RU')} ${currency}` : value;
  }

  static formatNumber(value) {
    const num = this.parseNumeric(value);
    return num ? num.toLocaleString('ru-RU') : value;
  }

  static formatDate(date) {
    if (!date) return 'Не указано';
    return new Date(date).toLocaleDateString('ru-RU');
  }

  static parseNumeric(value) {
    if (typeof value === 'number') return value;
    if (!value) return null;

    const match = String(value).match(/[\d,\.]+/);
    return match ? parseFloat(match[0].replace(',', '.')) : null;
  }

  static formatArray(array) {
    if (!Array.isArray(array)) return array;
    return array.join('; ');
  }
}

export default ExportManager;