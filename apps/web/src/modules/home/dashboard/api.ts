import { addDays, format } from 'date-fns';
import { useList } from '@/core/api/hooks';
import { calendarEvents, deadlines, insights, obras, reviewItems } from '@/core/entities';

const iso = (days: number) => format(addDays(new Date(), days), 'yyyy-MM-dd');

export function useDashboardData() {
  return {
    obras: useList(obras, { pageSize: 50 }),
    review: useList(reviewItems, {
      filter: { needsYou: 'true', status: 'pending' },
      sort: 'priority',
    }),
    insights: useList(insights, { filter: { status: 'new' }, sort: '-generatedAt', pageSize: 4 }),
    events: useList(calendarEvents, { sort: 'date', pageSize: 100 }),
    deadlines: useList(deadlines, { sort: 'dueDate', pageSize: 200 }),
    window: { from: iso(0), to: iso(7), horizon: iso(30) },
  };
}
