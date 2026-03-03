import { describe, it, expect } from 'vitest';
import { getPrizeAnimationClass } from '@/components/prize-utils';

describe('getPrizeAnimationClass', () => {
  it('1等で最も派手なフラッシュ + 大スケールが返る', () => {
    const result = getPrizeAnimationClass('1st');
    expect(result).toContain('animate-flash-jackpot');
    expect(result).toContain('scale-110');
    expect(result).toContain('motion-reduce:animate-none');
    expect(result).toContain('motion-reduce:scale-100');
  });

  it('1等前後賞で控えめフラッシュ + 中スケールが返る', () => {
    const result = getPrizeAnimationClass('1st-adj');
    expect(result).toContain('animate-flash-high');
    expect(result).toContain('scale-107');
    expect(result).toContain('motion-reduce:animate-none');
    expect(result).toContain('motion-reduce:scale-100');
  });

  it('1等組違いで控えめフラッシュ + 中スケールが返る', () => {
    const result = getPrizeAnimationClass('1st-group');
    expect(result).toContain('animate-flash-high');
    expect(result).toContain('scale-107');
    expect(result).toContain('motion-reduce:scale-100');
  });

  it('2等で控えめフラッシュ + 中スケールが返る', () => {
    const result = getPrizeAnimationClass('2nd');
    expect(result).toContain('animate-flash-high');
    expect(result).toContain('scale-107');
    expect(result).toContain('motion-reduce:scale-100');
  });

  it.each(['3rd', '4th', '5th', '6th', '7th'])(
    '%s でスケールのみ（フラッシュなし）が返る',
    (level) => {
      const result = getPrizeAnimationClass(level);
      expect(result).toContain('scale-105');
      expect(result).toContain('motion-reduce:scale-100');
      expect(result).not.toContain('animate-flash');
    }
  );

  it('ハズレ（null）で空文字列が返る', () => {
    expect(getPrizeAnimationClass(null)).toBe('');
  });

  it('未知の等級文字列で空文字列が返る', () => {
    expect(getPrizeAnimationClass('unknown')).toBe('');
    expect(getPrizeAnimationClass('8th')).toBe('');
  });
});
