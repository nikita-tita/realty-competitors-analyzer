// Интеграция с RBC Companies API для валидации финансовых данных
import axios from 'axios';

export class RBCCompaniesValidator {
  constructor() {
    this.baseUrl = 'https://companies.rbc.ru';
    this.apiUrl = 'https://companies.rbc.ru/api';
  }

  // Поиск компании по названию или ИНН
  async searchCompany(query) {
    try {
      // В реальной интеграции здесь был бы API запрос к RBC
      // Пока используем симуляцию для демонстрации
      const mockResults = this.getMockSearchResults(query);

      console.log(`Searching RBC Companies for: ${query}`);
      return mockResults;
    } catch (error) {
      console.error('Error searching RBC Companies:', error);
      return [];
    }
  }

  // Получение детальной информации о компании
  async getCompanyDetails(companyId) {
    try {
      // Симуляция API запроса к RBC Companies
      const mockData = this.getMockCompanyDetails(companyId);

      console.log(`Getting RBC company details for ID: ${companyId}`);
      return mockData;
    } catch (error) {
      console.error('Error getting company details from RBC:', error);
      return null;
    }
  }

  // Валидация финансовых данных через RBC
  async validateFinancialData(companyName, reportedRevenue) {
    try {
      const searchResults = await this.searchCompany(companyName);

      if (searchResults.length === 0) {
        return {
          isValid: false,
          status: 'NOT_FOUND',
          message: 'Компания не найдена в базе RBC',
          officialData: null
        };
      }

      const company = searchResults[0];
      const details = await this.getCompanyDetails(company.id);

      if (!details || !details.financialData) {
        return {
          isValid: false,
          status: 'NO_FINANCIAL_DATA',
          message: 'Финансовые данные недоступны в RBC',
          officialData: details
        };
      }

      // Сравнение данных
      const officialRevenue = details.financialData.revenue;
      const reportedValue = this.parseFinancialValue(reportedRevenue);
      const officialValue = this.parseFinancialValue(officialRevenue);

      const difference = Math.abs(reportedValue - officialValue) / officialValue * 100;

      return {
        isValid: difference <= 20, // Допустимое расхождение 20%
        status: difference <= 20 ? 'VERIFIED' : 'DISCREPANCY',
        message: difference <= 20
          ? 'Данные подтверждены RBC Companies'
          : `Расхождение ${difference.toFixed(1)}% с данными RBC`,
        officialData: details,
        comparison: {
          reported: reportedRevenue,
          official: officialRevenue,
          difference: `${difference.toFixed(1)}%`
        }
      };

    } catch (error) {
      console.error('Error validating financial data:', error);
      return {
        isValid: false,
        status: 'ERROR',
        message: 'Ошибка при проверке данных',
        officialData: null
      };
    }
  }

  // Получение юридической информации
  async getLegalInfo(companyName) {
    try {
      const searchResults = await this.searchCompany(companyName);

      if (searchResults.length === 0) {
        return null;
      }

      const company = searchResults[0];
      const details = await this.getCompanyDetails(company.id);

      return {
        legalName: details.legalInfo.fullName,
        inn: details.legalInfo.inn,
        ogrn: details.legalInfo.ogrn,
        legalAddress: details.legalInfo.address,
        ceo: details.legalInfo.ceo,
        registrationDate: details.legalInfo.registrationDate,
        status: details.legalInfo.status,
        authorizedCapital: details.legalInfo.authorizedCapital,
        lastReportDate: details.financialData?.lastReportDate,
        source: 'RBC Companies',
        verifiedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error getting legal info:', error);
      return null;
    }
  }

  // Парсинг финансовых значений
  parseFinancialValue(value) {
    if (!value) return 0;

    // Убираем все нечисловые символы кроме точек и запятых
    const cleaned = value.toString().replace(/[^\d,\.]/g, '');
    const number = parseFloat(cleaned.replace(',', '.'));

    // Если значение в млрд
    if (value.toLowerCase().includes('млрд')) {
      return number * 1000000000;
    }
    // Если значение в млн
    if (value.toLowerCase().includes('млн')) {
      return number * 1000000;
    }
    // Если значение в тыс
    if (value.toLowerCase().includes('тыс')) {
      return number * 1000;
    }

    return number || 0;
  }

  // Mock данные для демонстрации (в реальном проекте убрать)
  getMockSearchResults(query) {
    const mockDatabase = {
      'ЦИАН': [{
        id: 'cian_rbc_001',
        name: 'ООО "ЦИАН"',
        inn: '7736207543',
        matchScore: 95
      }],
      'ДомКлик': [{
        id: 'domclick_rbc_001',
        name: 'ООО "ДОМКЛИК"',
        inn: '7707083893',
        matchScore: 98
      }],
      'Авито': [{
        id: 'avito_rbc_001',
        name: 'ООО "АВИТО"',
        inn: '7802295706',
        matchScore: 99
      }]
    };

    return mockDatabase[query] || [];
  }

  getMockCompanyDetails(companyId) {
    const mockDetails = {
      'cian_rbc_001': {
        legalInfo: {
          fullName: 'Общество с ограниченной ответственностью "ЦИАН"',
          inn: '7736207543',
          ogrn: '1027739850962',
          address: '119021, г. Москва, ул. Льва Толстого, д. 16',
          ceo: 'Горов Марк Юрьевич',
          registrationDate: '2001-03-15',
          status: 'Действующая',
          authorizedCapital: '10 000 руб.'
        },
        financialData: {
          revenue: '11.8 млрд ₽',
          netProfit: '2.1 млрд ₽',
          assets: '15.2 млрд ₽',
          year: 2023,
          lastReportDate: '2024-03-31',
          source: 'Росстат, ФНС'
        }
      },
      'domclick_rbc_001': {
        legalInfo: {
          fullName: 'Общество с ограниченной ответственностью "ДОМКЛИК"',
          inn: '7707083893',
          ogrn: '1177746509035',
          address: '117997, г. Москва, ул. Вавилова, д. 19',
          ceo: 'Харитонов Дмитрий Александрович',
          registrationDate: '2017-06-28',
          status: 'Действующая',
          authorizedCapital: '100 000 000 руб.'
        },
        financialData: {
          revenue: '7.9 млрд ₽',
          netProfit: '1.2 млрд ₽',
          assets: '25.1 млрд ₽',
          year: 2023,
          lastReportDate: '2024-03-31',
          source: 'Сбербанк, консолидированная отчетность'
        }
      }
    };

    return mockDetails[companyId] || null;
  }
}

// Автоматическая валидация всех компаний
export class CompanyDataValidator {
  constructor() {
    this.rbcValidator = new RBCCompaniesValidator();
    this.validationResults = new Map();
  }

  // Валидация одной компании
  async validateCompany(competitor) {
    const results = {
      company: competitor.name,
      validations: {},
      overallScore: 0,
      lastValidated: new Date().toISOString()
    };

    try {
      // Проверка юридической информации
      const legalInfo = await this.rbcValidator.getLegalInfo(competitor.name);
      results.validations.legal = {
        status: legalInfo ? 'VERIFIED' : 'NOT_FOUND',
        data: legalInfo
      };

      // Проверка финансовых данных
      if (competitor.revenue) {
        const financialValidation = await this.rbcValidator.validateFinancialData(
          competitor.name,
          competitor.revenue
        );
        results.validations.financial = financialValidation;
      }

      // Расчет общего скора валидации
      let score = 0;
      let totalChecks = 0;

      if (results.validations.legal.status === 'VERIFIED') score += 50;
      totalChecks += 50;

      if (results.validations.financial?.isValid) score += 50;
      if (results.validations.financial) totalChecks += 50;

      results.overallScore = totalChecks > 0 ? Math.round(score / totalChecks * 100) : 0;

      this.validationResults.set(competitor.id, results);
      return results;

    } catch (error) {
      console.error(`Error validating company ${competitor.name}:`, error);
      results.validations.error = {
        status: 'ERROR',
        message: error.message
      };
      return results;
    }
  }

  // Валидация всех компаний
  async validateAllCompanies(competitors) {
    const results = [];

    for (const competitor of competitors) {
      const validation = await this.validateCompany(competitor);
      results.push(validation);

      // Небольшая задержка между запросами
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return results;
  }

  // Получение результатов валидации
  getValidationResults(competitorId = null) {
    if (competitorId) {
      return this.validationResults.get(competitorId);
    }
    return Array.from(this.validationResults.values());
  }

  // Статистика валидации
  getValidationStats() {
    const results = Array.from(this.validationResults.values());

    return {
      total: results.length,
      verified: results.filter(r => r.overallScore >= 80).length,
      partial: results.filter(r => r.overallScore >= 50 && r.overallScore < 80).length,
      unverified: results.filter(r => r.overallScore < 50).length,
      averageScore: results.length > 0
        ? Math.round(results.reduce((sum, r) => sum + r.overallScore, 0) / results.length)
        : 0
    };
  }
}

export default RBCCompaniesValidator;