import { NextResponse } from 'next/server'
import ChangeMonitor from '../../../lib/monitoringSystem'
import CompetitorDataScraper from '../../../lib/dataScraper'
import { competitorsExtended } from '../../../lib/competitorSchema'

const monitor = new ChangeMonitor();
const scraper = new CompetitorDataScraper();

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const competitorId = searchParams.get('competitorId')

  try {
    switch (action) {
      case 'history':
        const history = monitor.getChangeHistory(
          competitorId ? parseInt(competitorId) : null,
          parseInt(searchParams.get('limit')) || 100
        );
        return NextResponse.json({ history });

      case 'analytics':
        const analytics = monitor.getChangeAnalytics(
          parseInt(searchParams.get('period')) || 30
        );
        return NextResponse.json({ analytics });

      case 'update':
        if (!competitorId) {
          return NextResponse.json(
            { error: 'Competitor ID is required' },
            { status: 400 }
          );
        }

        const competitor = competitorsExtended.find(c => c.id === parseInt(competitorId));
        if (!competitor) {
          return NextResponse.json(
            { error: 'Competitor not found' },
            { status: 404 }
          );
        }

        const updates = await scraper.updateCompetitorData(competitor);
        return NextResponse.json({
          competitorId: parseInt(competitorId),
          updates: updates,
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: history, analytics, or update' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Monitoring API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { action, ...data } = await request.json();

    switch (action) {
      case 'subscribe':
        // Добавление подписчика на уведомления
        const { channel, address, filters } = data;
        monitor.notifications.addSubscriber(channel, address, filters);

        return NextResponse.json({
          message: 'Subscription added successfully',
          subscriber: { channel, address, filters }
        });

      case 'add_watcher':
        // Добавление наблюдателя за изменениями
        const { competitorId, fields, callbackUrl } = data;
        monitor.addWatcher(competitorId, fields, async (change) => {
          // Здесь можно отправить webhook
          console.log('Change detected:', change);
        });

        return NextResponse.json({
          message: 'Watcher added successfully',
          watcher: { competitorId, fields }
        });

      case 'manual_check':
        // Ручная проверка изменений
        const changes = await monitor.checkChanges(
          data.oldData || competitorsExtended,
          data.newData || competitorsExtended
        );

        return NextResponse.json({
          message: 'Manual check completed',
          changes: changes,
          totalChanges: changes.length
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Monitoring POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}