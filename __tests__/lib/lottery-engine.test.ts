/**
 * lottery-engine.ts の単体テスト
 *
 * 抽選エンジンの2つの関数を検証する。
 * selectPrize: 固定乱数で全等級の境界値をテスト
 * drawLottery: Math.random() をspyOnして結果を検証
 *
 * カバレッジ目標: 80%以上
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { selectPrize, drawLottery } from '@/lib/lottery-engine';
import { NENMATSU_JUMBO_2024 } from '@/config/prize-config';
import type { PrizeEntry, PrizeConfig } from '@/types';

// ============================================================
// テスト用ヘルパー
// ============================================================

/**
 * テスト用の簡易確率テーブルを作成する
 *
 * weight合計: 100
 * - A: weight 10 (0〜9)
 * - B: weight 30 (10〜39)
 * - C: weight 60 (40〜99)
 */
function createSimplePrizes(): PrizeEntry[] {
  return [
    { level: 'A', displayName: 'A賞', amount: 1000, weight: 10 },
    { level: 'B', displayName: 'B賞', amount: 500, weight: 30 },
    { level: 'C', displayName: 'C賞', amount: 100, weight: 60 },
  ];
}

/**
 * テスト用の確率テーブル設定を作成する
 */
function createSimpleConfig(
  prizes?: PrizeEntry[]
): PrizeConfig {
  return {
    id: 'test-config',
    lotteryName: 'テスト宝くじ',
    ticketPrice: 300,
    version: '1.0',
    prizes: prizes ?? createSimplePrizes(),
  };
}

// ============================================================
// selectPrize
// ============================================================

describe('selectPrize', () => {
  const prizes = createSimplePrizes();
  // weight合計: 100
  // A: 0〜9, B: 10〜39, C: 40〜99

  describe('正常系', () => {
    it('乱数0.0で最初のエントリ（A賞）を返す', () => {
      // target = Math.floor(0.0 * 100) = 0 → A区間(0〜9)
      const result = selectPrize(prizes, 0.0);
      expect(result).not.toBeNull();
      expect(result!.level).toBe('A');
    });

    it('乱数0.09で最初のエントリ（A賞）の末尾を返す', () => {
      // target = Math.floor(0.09 * 100) = 9 → A区間(0〜9)
      const result = selectPrize(prizes, 0.09);
      expect(result).not.toBeNull();
      expect(result!.level).toBe('A');
    });

    it('乱数0.1でB賞区間の先頭を返す', () => {
      // target = Math.floor(0.1 * 100) = 10 → B区間(10〜39)
      const result = selectPrize(prizes, 0.1);
      expect(result).not.toBeNull();
      expect(result!.level).toBe('B');
    });

    it('乱数0.39でB賞区間の末尾を返す', () => {
      // target = Math.floor(0.39 * 100) = 39 → B区間(10〜39)
      const result = selectPrize(prizes, 0.39);
      expect(result).not.toBeNull();
      expect(result!.level).toBe('B');
    });

    it('乱数0.4でC賞区間の先頭を返す', () => {
      // target = Math.floor(0.4 * 100) = 40 → C区間(40〜99)
      const result = selectPrize(prizes, 0.4);
      expect(result).not.toBeNull();
      expect(result!.level).toBe('C');
    });

    it('乱数0.99で最後のエントリ（C賞）を返す', () => {
      // target = Math.floor(0.99 * 100) = 99 → C区間(40〜99)
      const result = selectPrize(prizes, 0.99);
      expect(result).not.toBeNull();
      expect(result!.level).toBe('C');
    });

    it('戻り値の型がPrizeEntry（全プロパティ含む）であることを検証する', () => {
      const result = selectPrize(prizes, 0.0);
      expect(result).toEqual({
        level: 'A',
        displayName: 'A賞',
        amount: 1000,
        weight: 10,
      });
    });
  });

  describe('エッジケース', () => {
    it('空配列の場合、nullを返す', () => {
      const result = selectPrize([], 0.5);
      expect(result).toBeNull();
    });

    it('エントリが1つだけの場合、そのエントリを返す', () => {
      const singlePrize: PrizeEntry[] = [
        { level: 'only', displayName: '唯一', amount: 100, weight: 1 },
      ];
      const result = selectPrize(singlePrize, 0.0);
      expect(result).not.toBeNull();
      expect(result!.level).toBe('only');
    });

    it('エントリが1つだけの場合、乱数0.99でもそのエントリを返す', () => {
      const singlePrize: PrizeEntry[] = [
        { level: 'only', displayName: '唯一', amount: 100, weight: 1 },
      ];
      const result = selectPrize(singlePrize, 0.99);
      expect(result).not.toBeNull();
      expect(result!.level).toBe('only');
    });
  });

  describe('年末ジャンボ確率テーブルでの境界値', () => {
    const jumboConfig = NENMATSU_JUMBO_2024;
    const totalWeight = 20_000_000;

    it('乱数0.0で1等（最初のエントリ）を返す', () => {
      // target = 0 → 1等区間(0〜0)
      const result = selectPrize(jumboConfig.prizes, 0.0);
      expect(result).not.toBeNull();
      expect(result!.level).toBe('1st');
    });

    it('1等と1等前後賞の境界値を正しく判定する', () => {
      // 1等: weight=1 → 区間 [0, 0]
      // 1等前後賞: weight=2 → 区間 [1, 2]
      // target = 1 → 1等前後賞

      // random = 1 / 20_000_000
      const random = 1 / totalWeight;
      const result = selectPrize(jumboConfig.prizes, random);
      expect(result).not.toBeNull();
      expect(result!.level).toBe('1st-adj');
    });

    it('ハズレ区間で正しくハズレを返す', () => {
      // ハズレ: weight=17,777,390 → 区間末尾
      // random = 0.99 → target = Math.floor(0.99 * 20_000_000) = 19_800_000
      // 累積: 1+2+199+8+400+2000+20000+200000+2000000 = 2,222,610
      // 19_800_000 > 2,222,610 → ハズレ区間
      const result = selectPrize(jumboConfig.prizes, 0.99);
      expect(result).not.toBeNull();
      expect(result!.level).toBe('miss');
    });

    it('7等とハズレの境界値を正しく判定する', () => {
      // 7等までの累積weight: 1+2+199+8+400+2000+20000+200000+2000000 = 2,222,610
      // target = 2,222,609 → 7等区間の末尾
      const random7thEnd = 2_222_609 / totalWeight;
      const result7th = selectPrize(jumboConfig.prizes, random7thEnd);
      expect(result7th).not.toBeNull();
      expect(result7th!.level).toBe('7th');

      // target = 2,222,610 → ハズレ区間の先頭
      const randomMissStart = 2_222_610 / totalWeight;
      const resultMiss = selectPrize(jumboConfig.prizes, randomMissStart);
      expect(resultMiss).not.toBeNull();
      expect(resultMiss!.level).toBe('miss');
    });

    it('6等と7等の境界値を正しく判定する', () => {
      // 6等までの累積weight: 1+2+199+8+400+2000+20000+200000 = 222,610
      // target = 222,609 → 6等区間の末尾
      const random6thEnd = 222_609 / totalWeight;
      const result6th = selectPrize(jumboConfig.prizes, random6thEnd);
      expect(result6th).not.toBeNull();
      expect(result6th!.level).toBe('6th');

      // target = 222,610 → 7等区間の先頭
      const random7thStart = 222_610 / totalWeight;
      const result7th = selectPrize(jumboConfig.prizes, random7thStart);
      expect(result7th).not.toBeNull();
      expect(result7th!.level).toBe('7th');
    });
  });
});

// ============================================================
// drawLottery
// ============================================================

describe('drawLottery', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('正常系', () => {
    it('count=10で10件のDrawResult配列を返す', () => {
      const config = createSimpleConfig();
      const results = drawLottery(config, 10);
      expect(results).toHaveLength(10);
    });

    it('count=1で1件のDrawResult配列を返す', () => {
      const config = createSimpleConfig();
      const results = drawLottery(config, 1);
      expect(results).toHaveLength(1);
    });

    it('各結果がDrawResult型（prizeLevel, amount）を持つ', () => {
      const config = createSimpleConfig();
      const results = drawLottery(config, 1);
      expect(results[0]).toHaveProperty('prizeLevel');
      expect(results[0]).toHaveProperty('amount');
    });

    it('当選時はprizeLevelにレベル名、amountに金額が入る', () => {
      // A賞が当たるよう乱数を固定（0.0 → A賞）
      vi.spyOn(Math, 'random').mockReturnValue(0.0);

      const config = createSimpleConfig();
      const results = drawLottery(config, 1);

      expect(results[0]).toEqual({
        prizeLevel: 'A',
        amount: 1000,
      });
    });
  });

  describe('ハズレ変換', () => {
    it('miss等級のエントリはprizeLevel: null, amount: 0に変換される', () => {
      const prizesWithMiss: PrizeEntry[] = [
        { level: 'win', displayName: '当たり', amount: 1000, weight: 1 },
        { level: 'miss', displayName: 'ハズレ', amount: 0, weight: 99 },
      ];
      // ハズレ区間に入る乱数を固定
      vi.spyOn(Math, 'random').mockReturnValue(0.5);

      const config = createSimpleConfig(prizesWithMiss);
      const results = drawLottery(config, 1);

      expect(results[0]).toEqual({
        prizeLevel: null,
        amount: 0,
      });
    });

    it('年末ジャンボのハズレがprizeLevel: null, amount: 0に変換される', () => {
      // 0.99 → ハズレ区間
      vi.spyOn(Math, 'random').mockReturnValue(0.99);

      const results = drawLottery(NENMATSU_JUMBO_2024, 1);

      expect(results[0]).toEqual({
        prizeLevel: null,
        amount: 0,
      });
    });

    it('年末ジャンボの1等がprizeLevel: "1st", amount: 700_000_000に変換される', () => {
      // 0.0 → 1等区間
      vi.spyOn(Math, 'random').mockReturnValue(0.0);

      const results = drawLottery(NENMATSU_JUMBO_2024, 1);

      expect(results[0]).toEqual({
        prizeLevel: '1st',
        amount: 700_000_000,
      });
    });
  });

  describe('エッジケース', () => {
    it('count=0で空配列を返す', () => {
      const config = createSimpleConfig();
      const results = drawLottery(config, 0);
      expect(results).toEqual([]);
    });

    it('count=-1で空配列を返す', () => {
      const config = createSimpleConfig();
      const results = drawLottery(config, -1);
      expect(results).toEqual([]);
    });

    it('prizesが空配列の場合、全てハズレ扱いのDrawResultを返す', () => {
      const emptyConfig = createSimpleConfig([]);
      const results = drawLottery(emptyConfig, 3);

      expect(results).toHaveLength(3);
      for (const result of results) {
        expect(result).toEqual({ prizeLevel: null, amount: 0 });
      }
    });
  });

  describe('複数回抽選', () => {
    it('10連で各回それぞれ異なる乱数が使われる', () => {
      const randomSpy = vi.spyOn(Math, 'random');
      // A賞(0.0), B賞(0.2), C賞(0.5)... を交互に返す
      const values = [0.0, 0.2, 0.5, 0.0, 0.2, 0.5, 0.0, 0.2, 0.5, 0.0];
      values.forEach((v) => {
        randomSpy.mockReturnValueOnce(v);
      });

      const config = createSimpleConfig();
      const results = drawLottery(config, 10);

      expect(results).toHaveLength(10);
      // Math.random が10回呼ばれたことを検証
      expect(randomSpy).toHaveBeenCalledTimes(10);

      // 各結果が正しい等級であることを検証
      expect(results[0].prizeLevel).toBe('A');
      expect(results[1].prizeLevel).toBe('B');
      expect(results[2].prizeLevel).toBe('C');
      expect(results[3].prizeLevel).toBe('A');
    });
  });
});

// ============================================================
// 大量試行テスト（ローカル専用）
// ============================================================

describe.skip('大量試行テスト（統計的検証）', () => {
  it('100万回抽選で各等級の出現率が理論値+-20%以内', () => {
    const trials = 1_000_000;
    const prizes = createSimplePrizes();
    const totalWeight = prizes.reduce((sum, p) => sum + p.weight, 0);

    // 等級別出現回数を集計
    const counts: Record<string, number> = {};
    for (const p of prizes) {
      counts[p.level] = 0;
    }

    for (let i = 0; i < trials; i++) {
      const result = selectPrize(prizes, Math.random());
      if (result) {
        counts[result.level]++;
      }
    }

    // 各等級の出現率が理論値+-20%以内であることを検証
    for (const prize of prizes) {
      const expectedRate = prize.weight / totalWeight;
      const actualRate = counts[prize.level] / trials;
      const tolerance = expectedRate * 0.2;

      expect(actualRate).toBeGreaterThanOrEqual(expectedRate - tolerance);
      expect(actualRate).toBeLessThanOrEqual(expectedRate + tolerance);
    }
  });

  it('年末ジャンボ100万回で7等の出現率が理論値+-20%以内', () => {
    const trials = 1_000_000;
    const prizes = NENMATSU_JUMBO_2024.prizes;
    const totalWeight = 20_000_000;

    // 7等のみカウント（出現率10%なので統計的に検証しやすい）
    let count7th = 0;
    for (let i = 0; i < trials; i++) {
      const result = selectPrize(prizes, Math.random());
      if (result && result.level === '7th') {
        count7th++;
      }
    }

    // 7等: weight=2,000,000 / 20,000,000 = 10%
    const expectedRate = 2_000_000 / totalWeight;
    const actualRate = count7th / trials;
    const tolerance = expectedRate * 0.2;

    expect(actualRate).toBeGreaterThanOrEqual(expectedRate - tolerance);
    expect(actualRate).toBeLessThanOrEqual(expectedRate + tolerance);
  });
});
