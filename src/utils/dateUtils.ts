import { DateRange } from '../types';

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function getCurrentMonthlyRange(): DateRange {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1, 9);
  const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  return {
    start: formatDate(startDate),
    end: formatDate(endDate)
  };
} 