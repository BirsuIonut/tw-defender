import { format, formatDistanceToNowStrict, isToday, isTomorrow } from 'date-fns';

export function formatArrival(epochMs: number): string {
  const d = new Date(epochMs);
  if (isToday(d)) return `today ${format(d, 'HH:mm:ss')}`;
  if (isTomorrow(d)) return `tomorrow ${format(d, 'HH:mm:ss')}`;
  return format(d, 'dd MMM HH:mm:ss');
}

export function formatDistance(epochMs: number): string {
  return formatDistanceToNowStrict(new Date(epochMs), { addSuffix: true });
}
