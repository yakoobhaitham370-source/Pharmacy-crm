import { addDays, differenceInDays, isSameDay, isBefore, isAfter, startOfDay } from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

const DEFAULT_TIMEZONE = 'Asia/Baghdad';

export function getToday(timezone: string = DEFAULT_TIMEZONE): Date {
  return startOfDay(toZonedTime(new Date(), timezone));
}

export function parseDate(dateStr: string, timezone: string = DEFAULT_TIMEZONE): Date {
  // Assuming dateStr is 'YYYY-MM-DD'
  return startOfDay(toZonedTime(new Date(dateStr), timezone));
}

export function calculateNextRefillDate(purchaseDateStr: string, daysSupply: number): string {
  const purchase = parseDate(purchaseDateStr);
  const nextRefill = addDays(purchase, daysSupply);
  return formatInTimeZone(nextRefill, DEFAULT_TIMEZONE, 'yyyy-MM-dd');
}

export function calculateReminderDate(nextRefillDateStr: string, reminderDays: number = 3): string {
  const nextRefill = parseDate(nextRefillDateStr);
  const reminder = addDays(nextRefill, -reminderDays);
  return formatInTimeZone(reminder, DEFAULT_TIMEZONE, 'yyyy-MM-dd');
}

export function calculateDaysRemaining(nextRefillDateStr: string, timezone: string = DEFAULT_TIMEZONE): number {
  const today = getToday(timezone);
  const nextRefill = parseDate(nextRefillDateStr, timezone);
  return differenceInDays(nextRefill, today);
}

export type RefillStatus = 'OVERDUE' | 'DUE_TODAY' | 'DUE_TOMORROW' | 'UPCOMING';

export function getRefillStatus(nextRefillDateStr: string, timezone: string = DEFAULT_TIMEZONE): RefillStatus {
  const daysRemaining = calculateDaysRemaining(nextRefillDateStr, timezone);
  
  if (daysRemaining < 0) return 'OVERDUE';
  if (daysRemaining === 0) return 'DUE_TODAY';
  if (daysRemaining === 1) return 'DUE_TOMORROW';
  return 'UPCOMING';
}

export type ReminderStatus = 'REMINDER_DUE' | 'REMINDER_UPCOMING' | 'CONTACTED';

export function getReminderStatus(reminderDateStr: string, contactedStatus?: string, timezone: string = DEFAULT_TIMEZONE): ReminderStatus {
  if (contactedStatus === 'Contacted' || contactedStatus === 'Reminder Sent') {
    return 'CONTACTED';
  }
  
  const today = getToday(timezone);
  const reminderDate = parseDate(reminderDateStr, timezone);
  
  if (isBefore(today, reminderDate)) {
    return 'REMINDER_UPCOMING';
  }
  return 'REMINDER_DUE';
}
