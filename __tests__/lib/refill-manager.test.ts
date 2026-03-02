/**
 * refill-manager.ts の単体テスト
 *
 * 資金補給判定と補給額加算の2つの純粋関数を検証する。
 * 正常系・境界値・異常系を網羅。カバレッジ目標: 80%以上。
 */

import { describe, it, expect } from 'vitest';
import { shouldRefill, applyRefill } from '@/lib/refill-manager';
import { GAME_CONSTANTS } from '@/config/game-constants';

// ============================================================
// shouldRefill
// ============================================================

describe('shouldRefill', () => {
  const threshold = GAME_CONSTANTS.REFILL_THRESHOLD; // 3,000

  it('日付が変わり残高が閾値未満の場合、trueを返す', () => {
    expect(shouldRefill(2_999, '2026-01-01', '2026-01-02', threshold)).toBe(
      true
    );
  });

  it('同日の場合、残高が閾値未満でもfalseを返す', () => {
    expect(shouldRefill(2_999, '2026-01-01', '2026-01-01', threshold)).toBe(
      false
    );
  });

  it('日付が変わっているが残高が閾値以上の場合、falseを返す', () => {
    expect(shouldRefill(5_000, '2026-01-01', '2026-01-02', threshold)).toBe(
      false
    );
  });

  it('残高がちょうど閾値の場合、falseを返す（境界値: balance === threshold）', () => {
    expect(shouldRefill(3_000, '2026-01-01', '2026-01-02', threshold)).toBe(
      false
    );
  });

  it('残高が閾値-1の場合、trueを返す（境界値: balance === threshold - 1）', () => {
    expect(shouldRefill(2_999, '2026-01-01', '2026-01-02', threshold)).toBe(
      true
    );
  });

  it('lastRefillDateが空文字の場合、trueを返す（初回補給）', () => {
    expect(shouldRefill(100_000, '', '2026-01-01', threshold)).toBe(true);
  });

  it('lastRefillDateが空文字の場合、残高に関係なくtrueを返す', () => {
    expect(shouldRefill(0, '', '2026-01-01', threshold)).toBe(true);
  });

  it('残高が0で日付が変わっている場合、trueを返す', () => {
    expect(shouldRefill(0, '2026-01-01', '2026-01-02', threshold)).toBe(true);
  });

  it('月をまたぐ日付変更でも正しく判定する', () => {
    expect(shouldRefill(1_000, '2026-01-31', '2026-02-01', threshold)).toBe(
      true
    );
  });

  it('年をまたぐ日付変更でも正しく判定する', () => {
    expect(shouldRefill(1_000, '2025-12-31', '2026-01-01', threshold)).toBe(
      true
    );
  });
});

// ============================================================
// applyRefill
// ============================================================

describe('applyRefill', () => {
  it('正常系: 補給額を残高に加算する', () => {
    expect(applyRefill(2_000, 30_000)).toBe(32_000);
  });

  it('残高が0からの補給', () => {
    expect(applyRefill(0, 30_000)).toBe(30_000);
  });

  it('GAME_CONSTANTS.REFILL_AMOUNTを使った補給', () => {
    expect(applyRefill(1_500, GAME_CONSTANTS.REFILL_AMOUNT)).toBe(31_500);
  });

  it('refillAmountが0の場合、Errorをスローする', () => {
    expect(() => applyRefill(2_000, 0)).toThrow('Invalid refill amount');
  });

  it('refillAmountが負数の場合、Errorをスローする', () => {
    expect(() => applyRefill(2_000, -1_000)).toThrow('Invalid refill amount');
  });

  it('大きな残高に加算しても正しく計算する', () => {
    expect(applyRefill(700_000_000, 30_000)).toBe(700_030_000);
  });
});
