// Система мониторинга изменений и уведомлений
import nodemailer from 'nodemailer';

export class ChangeMonitor {
  constructor() {
    this.watchers = new Map();
    this.notifications = new NotificationManager();
    this.changeHistory = [];
  }

  // Добавить наблюдатель за изменениями
  addWatcher(competitorId, fields, callback) {
    if (!this.watchers.has(competitorId)) {
      this.watchers.set(competitorId, []);
    }

    this.watchers.get(competitorId).push({
      fields: fields,
      callback: callback,
      createdAt: new Date()
    });
  }

  // Проверить изменения
  async checkChanges(oldData, newData) {
    const changes = this.detectChanges(oldData, newData);

    for (const change of changes) {
      await this.processChange(change);
    }

    return changes;
  }

  // Выявление изменений
  detectChanges(oldData, newData) {
    const changes = [];

    newData.forEach(newItem => {
      const oldItem = oldData.find(item => item.id === newItem.id);

      if (!oldItem) {
        changes.push({
          type: 'NEW_COMPETITOR',
          competitorId: newItem.id,
          competitorName: newItem.name,
          data: newItem,
          timestamp: new Date(),
          severity: 'INFO'
        });
        return;
      }

      // Проверяем критические изменения
      const criticalFields = ['revenue', 'marketShare', 'employees', 'status'];
      const significantFields = ['pricing', 'services', 'features'];
      const infoFields = ['traffic', 'rankings', 'news'];

      Object.keys(newItem).forEach(field => {
        if (oldItem[field] !== newItem[field]) {
          let severity = 'INFO';
          let changeType = 'FIELD_UPDATED';

          if (criticalFields.includes(field)) {
            severity = 'CRITICAL';
            changeType = 'CRITICAL_UPDATE';
          } else if (significantFields.includes(field)) {
            severity = 'WARNING';
            changeType = 'SIGNIFICANT_UPDATE';
          }

          changes.push({
            type: changeType,
            competitorId: newItem.id,
            competitorName: newItem.name,
            field: field,
            oldValue: oldItem[field],
            newValue: newItem[field],
            timestamp: new Date(),
            severity: severity,
            impact: this.calculateImpact(field, oldItem[field], newItem[field])
          });
        }
      });
    });

    return changes;
  }

  // Расчет влияния изменения
  calculateImpact(field, oldValue, newValue) {
    switch (field) {
      case 'revenue':
        const oldRev = this.parseFinancialValue(oldValue);
        const newRev = this.parseFinancialValue(newValue);
        if (oldRev && newRev) {
          const change = ((newRev - oldRev) / oldRev * 100).toFixed(1);
          return `${change > 0 ? '+' : ''}${change}%`;
        }
        break;

      case 'marketShare':
        const oldShare = parseFloat(oldValue);
        const newShare = parseFloat(newValue);
        if (!isNaN(oldShare) && !isNaN(newShare)) {
          const change = (newShare - oldShare).toFixed(1);
          return `${change > 0 ? '+' : ''}${change} п.п.`;
        }
        break;

      case 'employees':
        const oldEmp = parseInt(oldValue);
        const newEmp = parseInt(newValue);
        if (!isNaN(oldEmp) && !isNaN(newEmp)) {
          const change = newEmp - oldEmp;
          return `${change > 0 ? '+' : ''}${change} сотр.`;
        }
        break;

      default:
        return 'Изменение зафиксировано';
    }

    return 'Неизвестно';
  }

  // Парсинг финансовых значений
  parseFinancialValue(value) {
    if (!value) return null;
    const match = value.toString().match(/[\d,\.]+/);
    if (!match) return null;
    return parseFloat(match[0].replace(',', '.'));
  }

  // Обработка изменения
  async processChange(change) {
    // Сохраняем в историю
    this.changeHistory.push(change);

    // Проверяем подписчиков
    const watchers = this.watchers.get(change.competitorId) || [];

    for (const watcher of watchers) {
      if (watcher.fields.includes('*') || watcher.fields.includes(change.field)) {
        try {
          await watcher.callback(change);
        } catch (error) {
          console.error('Error in watcher callback:', error);
        }
      }
    }

    // Отправляем уведомления
    await this.notifications.sendNotification(change);

    console.log(`Change processed: ${change.type} for ${change.competitorName}`);
  }

  // Получить историю изменений
  getChangeHistory(competitorId = null, limit = 100) {
    let history = this.changeHistory;

    if (competitorId) {
      history = history.filter(change => change.competitorId === competitorId);
    }

    return history
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  // Аналитика изменений
  getChangeAnalytics(period = 30) { // дней
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - period);

    const recentChanges = this.changeHistory.filter(
      change => new Date(change.timestamp) > cutoffDate
    );

    const analytics = {
      totalChanges: recentChanges.length,
      byType: {},
      bySeverity: {},
      byCompetitor: {},
      mostActiveCompetitors: [],
      trendingFields: []
    };

    recentChanges.forEach(change => {
      // По типам
      analytics.byType[change.type] = (analytics.byType[change.type] || 0) + 1;

      // По критичности
      analytics.bySeverity[change.severity] = (analytics.bySeverity[change.severity] || 0) + 1;

      // По компаниям
      analytics.byCompetitor[change.competitorName] = (analytics.byCompetitor[change.competitorName] || 0) + 1;
    });

    // Самые активные компании
    analytics.mostActiveCompetitors = Object.entries(analytics.byCompetitor)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    return analytics;
  }
}

// Менеджер уведомлений
export class NotificationManager {
  constructor() {
    this.channels = {
      email: new EmailNotifier(),
      telegram: new TelegramNotifier(),
      webhook: new WebhookNotifier()
    };
    this.subscribers = [];
  }

  // Добавить подписчика
  addSubscriber(channel, address, filters = {}) {
    this.subscribers.push({
      channel: channel,
      address: address,
      filters: filters,
      createdAt: new Date()
    });
  }

  // Отправить уведомление
  async sendNotification(change) {
    const relevantSubscribers = this.subscribers.filter(sub =>
      this.matchesFilters(change, sub.filters)
    );

    for (const subscriber of relevantSubscribers) {
      try {
        const notifier = this.channels[subscriber.channel];
        if (notifier) {
          await notifier.send(subscriber.address, change);
        }
      } catch (error) {
        console.error(`Error sending notification via ${subscriber.channel}:`, error);
      }
    }
  }

  // Проверка соответствия фильтрам
  matchesFilters(change, filters) {
    if (filters.competitorIds && !filters.competitorIds.includes(change.competitorId)) {
      return false;
    }

    if (filters.severity && filters.severity !== change.severity) {
      return false;
    }

    if (filters.types && !filters.types.includes(change.type)) {
      return false;
    }

    if (filters.fields && change.field && !filters.fields.includes(change.field)) {
      return false;
    }

    return true;
  }
}

// Email уведомления
class EmailNotifier {
  constructor() {
    this.transporter = null;
    this.setupTransporter();
  }

  setupTransporter() {
    // В реальном проекте настройки будут из переменных окружения
    this.transporter = {
      sendMail: async (mailOptions) => {
        console.log('Email notification (mock):', mailOptions.subject);
        return { messageId: 'mock-message-id' };
      }
    };
  }

  async send(email, change) {
    const subject = this.formatSubject(change);
    const html = this.formatEmailBody(change);

    const mailOptions = {
      from: process.env.SMTP_USER || 'noreply@realty-competitors.com',
      to: email,
      subject: subject,
      html: html
    };

    await this.transporter.sendMail(mailOptions);
  }

  formatSubject(change) {
    const severityEmoji = {
      'CRITICAL': '🚨',
      'WARNING': '⚠️',
      'INFO': 'ℹ️'
    };

    return `${severityEmoji[change.severity]} ${change.competitorName}: ${change.type}`;
  }

  formatEmailBody(change) {
    return `
      <h2>Изменение у конкурента: ${change.competitorName}</h2>
      <p><strong>Тип изменения:</strong> ${change.type}</p>
      <p><strong>Критичность:</strong> ${change.severity}</p>
      ${change.field ? `<p><strong>Поле:</strong> ${change.field}</p>` : ''}
      ${change.oldValue ? `<p><strong>Старое значение:</strong> ${change.oldValue}</p>` : ''}
      ${change.newValue ? `<p><strong>Новое значение:</strong> ${change.newValue}</p>` : ''}
      ${change.impact ? `<p><strong>Влияние:</strong> ${change.impact}</p>` : ''}
      <p><strong>Время:</strong> ${change.timestamp.toLocaleString('ru-RU')}</p>
      <hr>
      <p><small>Уведомление от системы мониторинга конкурентов RealtyCompetitors</small></p>
    `;
  }
}

// Telegram уведомления
class TelegramNotifier {
  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN;
  }

  async send(chatId, change) {
    const message = this.formatTelegramMessage(change);

    // Mock implementation
    console.log(`Telegram notification to ${chatId}:`, message);

    // В реальном проекте:
    // await axios.post(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
    //   chat_id: chatId,
    //   text: message,
    //   parse_mode: 'HTML'
    // });
  }

  formatTelegramMessage(change) {
    const severityEmoji = {
      'CRITICAL': '🚨',
      'WARNING': '⚠️',
      'INFO': 'ℹ️'
    };

    let message = `${severityEmoji[change.severity]} <b>${change.competitorName}</b>\n\n`;
    message += `<b>Изменение:</b> ${change.type}\n`;

    if (change.field) {
      message += `<b>Поле:</b> ${change.field}\n`;
    }

    if (change.oldValue && change.newValue) {
      message += `<b>Было:</b> ${change.oldValue}\n`;
      message += `<b>Стало:</b> ${change.newValue}\n`;
    }

    if (change.impact) {
      message += `<b>Влияние:</b> ${change.impact}\n`;
    }

    message += `\n<i>${change.timestamp.toLocaleString('ru-RU')}</i>`;

    return message;
  }
}

// Webhook уведомления
class WebhookNotifier {
  async send(webhookUrl, change) {
    const payload = {
      timestamp: change.timestamp.toISOString(),
      type: change.type,
      severity: change.severity,
      competitor: {
        id: change.competitorId,
        name: change.competitorName
      },
      change: {
        field: change.field,
        oldValue: change.oldValue,
        newValue: change.newValue,
        impact: change.impact
      }
    };

    // Mock implementation
    console.log(`Webhook notification to ${webhookUrl}:`, JSON.stringify(payload, null, 2));

    // В реальном проекте:
    // await axios.post(webhookUrl, payload);
  }
}

export default ChangeMonitor;