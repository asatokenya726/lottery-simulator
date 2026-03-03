/**
 * currency-manager.ts の単体テスト
 *
 * 通貨管理の4つの純粋関数を検証する。
 * 正常系・境界値・異常系を網羅。カバレッジ目標: 80%以上。
 */

import { describe, it, expect } from 'vitest';
import {
  canPurchase,
  deductBalance,
  addWinnings,
  calculateDrawCost,
} from '@/lib/currency-manager';

// ============================================================
// canPurchase
// ============================================================

describe('canPurchase', () => {
  it('残高が購入額より大きい場合、trueを返す', () => {
    expect(canPurchase(10_000, 3_000)).toBe(true);
  });

  it('残高が購入額とちょうど同じ場合、trueを返す（境界値）', () => {
    expect(canPurchase(3_000, 3_000)).toBe(true);
  });

  it('残高が購入額より少ない場合、falseを返す', () => {
    expect(canPurchase(2_999, 3_000)).toBe(false);
  });

  it('残高が0の場合、falseを返す', () => {
    expect(canPurchase(0, 3_000)).toBe(false);
  });

  it('購入額が0の場合、trueを返す', () => {
    expect(canPurchase(0, 0)).toBe(true);
  });

  it('大きな金額（初期資金100,000ぃえん）で正しく判定する', () => {
    expect(canPurchase(100_000, 3_000)).toBe(true);
  });
});

// ============================================================
// deductBalance
// ============================================================

describe('deductBalance', () => {
  it('正常系: 残高から購入額を差し引いた値を返す', () => {
    expect(deductBalance(10_000, 3_000)).toBe(7_000);
  });

  it('残高がちょうど購入額と同じ場合、0を返す（境界値）', () => {
    expect(deductBalance(3_000, 3_000)).toBe(0);
  });

  it('残高不足の場合、Errorをスローする', () => {
    expect(() => deductBalance(2_999, 3_000)).toThrow('Insufficient balance');
  });

  it('残高0で購入額がある場合、Errorをスローする', () => {
    expect(() => deductBalance(0, 3_000)).toThrow('Insufficient balance');
  });

  it('購入額が0の場合、残高がそのまま返る', () => {
    expect(deductBalance(10_000, 0)).toBe(10_000);
  });

  it('大きな金額でも正しく計算する', () => {
    expect(deductBalance(100_000, 3_000)).toBe(97_000);
  });
});

// ============================================================
// addWinnings
// ============================================================

describe('addWinnings', () => {
  it('正常系: 当選金を残高に加算する', () => {
    expect(addWinnings(7_000, 3_000)).toBe(10_000);
  });

  it('当選金が0の場合、残高がそのまま返る', () => {
    expect(addWinnings(10_000, 0)).toBe(10_000);
  });

  it('残高が0の場合、当選金がそのまま残高になる', () => {
    expect(addWinnings(0, 50_000)).toBe(50_000);
  });

  it('大きな金額（1等 7億ぃえん）でもオーバーフローしない', () => {
    // JavaScriptのNumber.MAX_SAFE_INTEGERは9,007,199,254,740,991なので7億は安全
    expect(addWinnings(100_000, 700_000_000)).toBe(700_100_000);
  });

  it('複数回の加算でも正しく計算できる（連続呼び出しシミュレーション）', () => {
    let balance = 97_000;
    balance = addWinnings(balance, 300); // 7等
    balance = addWinnings(balance, 3_000); // 6等
    expect(balance).toBe(100_300);
  });
});

// ============================================================
// calculateDrawCost
// ============================================================

describe('calculateDrawCost', () => {
  it('正常系: 10連ガチャの購入額を計算する（300 * 10 = 3,000）', () => {
    expect(calculateDrawCost(300, 10)).toBe(3_000);
  });

  it('1枚の場合、チケット価格がそのまま返る', () => {
    expect(calculateDrawCost(300, 1)).toBe(300);
  });

  it('枚数が0の場合、0を返す', () => {
    expect(calculateDrawCost(300, 0)).toBe(0);
  });

  it('チケット価格が0の場合、0を返す', () => {
    expect(calculateDrawCost(0, 10)).toBe(0);
  });

  it('大きな枚数でも正しく計算する', () => {
    expect(calculateDrawCost(300, 100)).toBe(30_000);
  });
});

// ============================================================
// エッジケース追加（負数・極端な値）
// ============================================================

describe('canPurchase — 追加エッジケース', () => {
  it('残高が負数の場合、falseを返す', () => {
    expect(canPurchase(-1, 3_000)).toBe(false);
  });

  it('購入額が負数の場合、trueを返す（balance >= cost が成立）', () => {
    expect(canPurchase(0, -1)).toBe(true);
  });
});

describe('deductBalance — 追加エッジケース', () => {
  it('購入額が負数の場合、残高が増える（バリデーションは呼び出し元の責務）', () => {
    expect(deductBalance(10_000, -500)).toBe(10_500);
  });

  it('Number.MAX_SAFE_INTEGERに近い値でも正しく計算する', () => {
    const largeBalance = Number.MAX_SAFE_INTEGER - 1_000;
    expect(deductBalance(largeBalance, 1_000)).toBe(
      Number.MAX_SAFE_INTEGER - 2_000
    );
  });
});

describe('addWinnings — 追加エッジケース', () => {
  it('当選金が負数の場合、残高が減る（バリデーションは呼び出し元の責務）', () => {
    expect(addWinnings(10_000, -500)).toBe(9_500);
  });

  it('Number.MAX_SAFE_INTEGERに近い値での加算', () => {
    const nearMax = Number.MAX_SAFE_INTEGER - 100;
    expect(addWinnings(nearMax, 50)).toBe(Number.MAX_SAFE_INTEGER - 50);
  });
});

describe('calculateDrawCost — 追加エッジケース', () => {
  it('枚数が負数の場合、負の購入額を返す', () => {
    expect(calculateDrawCost(300, -1)).toBe(-300);
  });

  it('チケット価格が負数の場合、負の購入額を返す', () => {
    expect(calculateDrawCost(-300, 10)).toBe(-3_000);
  });
});
