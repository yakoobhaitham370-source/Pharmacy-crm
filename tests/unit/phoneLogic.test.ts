import { describe, it, expect } from 'vitest';
import { normalizePhoneNumber } from '../../src/utils/phoneLogic';

describe('Phone Normalization', () => {
  it('handles standard local Iraqi number starting with 0', () => {
    expect(normalizePhoneNumber('07701234567')).toBe('9647701234567');
  });

  it('handles numbers already containing country code with +', () => {
    expect(normalizePhoneNumber('+9647701234567')).toBe('9647701234567');
  });

  it('handles numbers already containing country code without +', () => {
    expect(normalizePhoneNumber('9647701234567')).toBe('9647701234567');
  });

  it('handles local numbers without 0 but with spaces', () => {
    expect(normalizePhoneNumber('770 123 4567')).toBe('9647701234567');
  });

  it('strips non-numeric characters', () => {
    expect(normalizePhoneNumber('(0770) 123-4567!')).toBe('9647701234567');
  });

  it('returns empty string if empty', () => {
    expect(normalizePhoneNumber('')).toBe('');
  });
});
