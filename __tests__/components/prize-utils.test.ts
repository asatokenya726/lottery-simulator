import { describe, it, expect } from 'vitest';
import { getPrizeAnimationClass } from '@/components/prize-utils';

describe('getPrizeAnimationClass', () => {
  it('1等で最も派手なフラッシュ + 大スケールが返る', () => {
    expect(getPrizeAnimationClass('1st')).toBe(
      'animate-flash-jackpot scale-110'
    );
  });

  it('1等前後賞で控えめフラッシュ + 中スケールが返る', () => {
    expect(getPrizeAnimationClass('1st-adj')).toBe(
      'animate-flash-high scale-107'
    );
  });

  it('1等組違いで控えめフラッシュ + 中スケールが返る', () => {
    expect(getPrizeAnimationClass('1st-group')).toBe(
      'animate-flash-high scale-107'
    );
  });

  it('2等で控えめフラッシュ + 中スケールが返る', () => {
    expect(getPrizeAnimationClass('2nd')).toBe(
      'animate-flash-high scale-107'
    );
  });

  it.each(['3rd', '4th', '5th', '6th', '7th'])(
    '%s でスケールのみ（フラッシュなし）が返る',
    (level) => {
      expect(getPrizeAnimationClass(level)).toBe('scale-105');
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
