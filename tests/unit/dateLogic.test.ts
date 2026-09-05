import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { calculateNextRefillDate, calculateReminderDate, calculateDaysRemaining, getRefillStatus, getReminderStatus } from '../../src/utils/dateLogic';

// Mock current date for consistent testing
const MOCK_TODAY = '2026-09-04T12:00:00Z'; // Assuming today is 2026-09-04

describe('Date Logic', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(MOCK_TODAY));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('calculateNextRefillDate', () => {
    it('calculates 7 days correctly', () => {
      expect(calculateNextRefillDate('2026-09-04', 7)).toBe('2026-09-11');
    });

    it('calculates 30 days correctly', () => {
      expect(calculateNextRefillDate('2026-09-04', 30)).toBe('2026-10-04');
    });

    it('handles month boundaries correctly (February)', () => {
      expect(calculateNextRefillDate('2026-02-25', 5)).toBe('2026-03-02');
    });

    it('handles leap years correctly (2024)', () => {
      expect(calculateNextRefillDate('2024-02-25', 5)).toBe('2024-03-01');
    });
  });

  describe('calculateReminderDate', () => {
    it('calculates reminder date 3 days before', () => {
      expect(calculateReminderDate('2026-09-11', 3)).toBe('2026-09-08');
    });

    it('calculates reminder date 5 days before', () => {
      expect(calculateReminderDate('2026-10-04', 5)).toBe('2026-09-29');
    });
  });

  describe('calculateDaysRemaining', () => {
    it('returns positive for upcoming date', () => {
      expect(calculateDaysRemaining('2026-09-11', 'UTC')).toBe(7);
    });

    it('returns 0 for today', () => {
      expect(calculateDaysRemaining('2026-09-04', 'UTC')).toBe(0);
    });

    it('returns negative for overdue date', () => {
      expect(calculateDaysRemaining('2026-09-01', 'UTC')).toBe(-3);
    });
  });

  describe('getRefillStatus', () => {
    it('returns UPCOMING for > 1 days', () => {
      expect(getRefillStatus('2026-09-11', 'UTC')).toBe('UPCOMING');
    });

    it('returns DUE_TOMORROW for exactly 1 day', () => {
      expect(getRefillStatus('2026-09-05', 'UTC')).toBe('DUE_TOMORROW');
    });

    it('returns DUE_TODAY for exactly 0 days', () => {
      expect(getRefillStatus('2026-09-04', 'UTC')).toBe('DUE_TODAY');
    });

    it('returns OVERDUE for < 0 days', () => {
      expect(getRefillStatus('2026-09-03', 'UTC')).toBe('OVERDUE');
    });
  });

  describe('getReminderStatus', () => {
    it('returns CONTACTED if already contacted', () => {
      expect(getReminderStatus('2026-09-04', 'Contacted', 'UTC')).toBe('CONTACTED');
      expect(getReminderStatus('2026-09-04', 'Reminder Sent', 'UTC')).toBe('CONTACTED');
    });

    it('returns REMINDER_UPCOMING if reminder date is in the future', () => {
      expect(getReminderStatus('2026-09-08', undefined, 'UTC')).toBe('REMINDER_UPCOMING');
    });

    it('returns REMINDER_DUE if reminder date is today or past', () => {
      expect(getReminderStatus('2026-09-04', undefined, 'UTC')).toBe('REMINDER_DUE');
      expect(getReminderStatus('2026-09-01', undefined, 'UTC')).toBe('REMINDER_DUE');
    });
  });
});
