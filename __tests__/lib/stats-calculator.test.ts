/**
 * stats-calculator.ts の単体テスト
 *
 * 統計計算の4つの純粋関数を検証する。
 * 正常系・境界値・エッジケースを網羅。カバレッジ目標: 80%以上。
 */

import { describe, it, expect } from 'vitest';
import {
  calculateRecoveryRate,
  aggregateDrawResults,
  mergeWinCounts,
  calculateTotalWinFromResults,
} from '@/lib/stats-calculator';
import { createDrawResult } from '../helpers/test-factories';

// ============================================================
// calculateRecoveryRate
// ============================================================

describe('calculateRecoveryRate', () => {
  it('正常系: 30,000当選 / 100,000購入 = 30.0%', () => {
    expect(calculateRecoveryRate(30_000, 100_000)).toBe(30.0);
  });

  it('ゼロ除算回避: totalSpent === 0 の場合、0を返す', () => {
    expect(calculateRecoveryRate(50_000, 0)).toBe(0);
  });

  it('totalWon と totalSpent の両方が0の場合、0を返す', () => {
    expect(calculateRecoveryRate(0, 0)).toBe(0);
  });

  it('totalWon が0の場合、0.0%を返す', () => {
    expect(calculateRecoveryRate(0, 100_000)).toBe(0);
  });

  it('小数第1位で丸める: 33,333 / 100,000 = 33.3%', () => {
    expect(calculateRecoveryRate(33_333, 100_000)).toBe(33.3);
  });

  it('小数第1位で丸める: 66,667 / 100,000 = 66.7%', () => {
    expect(calculateRecoveryRate(66_667, 100_000)).toBe(66.7);
  });

  it('回収率100%: 購入額と同額を当選', () => {
    expect(calculateRecoveryRate(100_000, 100_000)).toBe(100.0);
  });

  it('回収率100%超え: 当選額が購入額を超える場合', () => {
    expect(calculateRecoveryRate(700_000_000, 3_000)).toBe(23333333.3);
  });

  it('大きな数値でも正しく計算する', () => {
    // 累計100万ぃえん購入、累計15万ぃえん当選 → 15.0%
    expect(calculateRecoveryRate(150_000, 1_000_000)).toBe(15.0);
  });
});

// ============================================================
// aggregateDrawResults
// ============================================================

describe('aggregateDrawResults', () => {
  it('正常系: 10連結果から等級別当選回数を集計する', () => {
    const results = [
      createDrawResult({ prizeLevel: '6等', amount: 3_000 }),
      createDrawResult(), // ハズレ
      createDrawResult(), // ハズレ
      createDrawResult({ prizeLevel: '7等', amount: 300 }),
      createDrawResult(), // ハズレ
      createDrawResult({ prizeLevel: '6等', amount: 3_000 }),
      createDrawResult(), // ハズレ
      createDrawResult(), // ハズレ
      createDrawResult(), // ハズレ
      createDrawResult({ prizeLevel: '7等', amount: 300 }),
    ];

    const counts = aggregateDrawResults(results);
    expect(counts).toEqual({ '6等': 2, '7等': 2 });
  });

  it('空配列の場合、空オブジェクトを返す', () => {
    expect(aggregateDrawResults([])).toEqual({});
  });

  it('全てハズレの場合、空オブジェクトを返す', () => {
    const results = Array.from({ length: 10 }, () => createDrawResult());
    expect(aggregateDrawResults(results)).toEqual({});
  });

  it('全て同一等級の場合、その等級のカウントが結果数と一致する', () => {
    const results = Array.from({ length: 10 }, () =>
      createDrawResult({ prizeLevel: '7等', amount: 300 })
    );
    expect(aggregateDrawResults(results)).toEqual({ '7等': 10 });
  });

  it('1枚のみ当選の場合、その等級のカウントが1', () => {
    const results = [
      createDrawResult({ prizeLevel: '1等', amount: 700_000_000 }),
    ];
    expect(aggregateDrawResults(results)).toEqual({ '1等': 1 });
  });

  it('複数の異なる等級が混在する場合、正しく集計する', () => {
    const results = [
      createDrawResult({ prizeLevel: '1等', amount: 700_000_000 }),
      createDrawResult({ prizeLevel: '2等', amount: 100_000_000 }),
      createDrawResult({ prizeLevel: '3等', amount: 10_000_000 }),
      createDrawResult({ prizeLevel: '4等', amount: 1_000_000 }),
      createDrawResult({ prizeLevel: '5等', amount: 100_000 }),
      createDrawResult({ prizeLevel: '6等', amount: 3_000 }),
      createDrawResult({ prizeLevel: '7等', amount: 300 }),
      createDrawResult(), // ハズレ
      createDrawResult(), // ハズレ
      createDrawResult(), // ハズレ
    ];

    const counts = aggregateDrawResults(results);
    expect(counts).toEqual({
      '1等': 1,
      '2等': 1,
      '3等': 1,
      '4等': 1,
      '5等': 1,
      '6等': 1,
      '7等': 1,
    });
  });
});

// ============================================================
// mergeWinCounts
// ============================================================

describe('mergeWinCounts', () => {
  it('正常系: 同一キーは加算、新規キーは追加', () => {
    const existing = { '6等': 5, '7等': 10 };
    const newCounts = { '6等': 2, '5等': 1 };

    const merged = mergeWinCounts(existing, newCounts);
    expect(merged).toEqual({ '6等': 7, '7等': 10, '5等': 1 });
  });

  it('existing が空オブジェクトの場合、newCounts がそのまま返る', () => {
    const newCounts = { '6等': 2, '7等': 3 };

    const merged = mergeWinCounts({}, newCounts);
    expect(merged).toEqual({ '6等': 2, '7等': 3 });
  });

  it('newCounts が空オブジェクトの場合、existing がそのまま返る', () => {
    const existing = { '6等': 5, '7等': 10 };

    const merged = mergeWinCounts(existing, {});
    expect(merged).toEqual({ '6等': 5, '7等': 10 });
  });

  it('両方空オブジェクトの場合、空オブジェクトを返す', () => {
    expect(mergeWinCounts({}, {})).toEqual({});
  });

  it('イミュータブル: 元の existing オブジェクトを変更しない', () => {
    const existing = { '6等': 5, '7等': 10 };
    const originalExisting = { ...existing };
    const newCounts = { '6等': 2, '5等': 1 };

    mergeWinCounts(existing, newCounts);

    expect(existing).toEqual(originalExisting);
  });

  it('イミュータブル: 元の newCounts オブジェクトを変更しない', () => {
    const existing = { '6等': 5 };
    const newCounts = { '6等': 2, '5等': 1 };
    const originalNewCounts = { ...newCounts };

    mergeWinCounts(existing, newCounts);

    expect(newCounts).toEqual(originalNewCounts);
  });

  it('戻り値は新しいオブジェクト参照である', () => {
    const existing = { '6等': 5 };
    const newCounts = { '7等': 3 };

    const merged = mergeWinCounts(existing, newCounts);

    expect(merged).not.toBe(existing);
    expect(merged).not.toBe(newCounts);
  });
});

// ============================================================
// calculateTotalWinFromResults
// ============================================================

describe('calculateTotalWinFromResults', () => {
  it('正常系: 10連結果の合計当選額を計算する', () => {
    const results = [
      createDrawResult({ prizeLevel: '6等', amount: 3_000 }),
      createDrawResult(), // ハズレ（amount: 0）
      createDrawResult(), // ハズレ
      createDrawResult({ prizeLevel: '7等', amount: 300 }),
      createDrawResult(), // ハズレ
      createDrawResult(), // ハズレ
      createDrawResult(), // ハズレ
      createDrawResult(), // ハズレ
      createDrawResult(), // ハズレ
      createDrawResult({ prizeLevel: '7等', amount: 300 }),
    ];

    expect(calculateTotalWinFromResults(results)).toBe(3_600);
  });

  it('空配列の場合、0を返す', () => {
    expect(calculateTotalWinFromResults([])).toBe(0);
  });

  it('全てハズレの場合、0を返す', () => {
    const results = Array.from({ length: 10 }, () => createDrawResult());
    expect(calculateTotalWinFromResults(results)).toBe(0);
  });

  it('1等当選を含む場合、大きな金額を正しく合計する', () => {
    const results = [
      createDrawResult({ prizeLevel: '1等', amount: 700_000_000 }),
      createDrawResult({ prizeLevel: '7等', amount: 300 }),
      createDrawResult(), // ハズレ
      createDrawResult(), // ハズレ
      createDrawResult(), // ハズレ
      createDrawResult(), // ハズレ
      createDrawResult(), // ハズレ
      createDrawResult(), // ハズレ
      createDrawResult(), // ハズレ
      createDrawResult(), // ハズレ
    ];

    expect(calculateTotalWinFromResults(results)).toBe(700_000_300);
  });

  it('全枚当選の場合、全ての金額を合計する', () => {
    const results = Array.from({ length: 10 }, () =>
      createDrawResult({ prizeLevel: '7等', amount: 300 })
    );

    expect(calculateTotalWinFromResults(results)).toBe(3_000);
  });
});
