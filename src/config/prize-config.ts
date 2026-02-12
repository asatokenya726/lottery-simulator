/**
 * 宝くじ確率テーブル定義
 *
 * 2024年末ジャンボ宝くじの公式確率テーブルに基づく。
 * requirements-v1.md セクション2 準拠。
 *
 * 1ユニット = 20,000,000枚、1枚 = 300ぃえん
 * 重みは本数/ユニットの整数で保持（浮動小数点精度の問題を回避）
 */

import type { PrizeConfig } from '@/types';

/**
 * 2024年末ジャンボ宝くじの確率テーブル
 *
 * weight合計: 20,000,000（1ユニットの総枚数）
 * 理論還元率: 約50.0%（テーブル定義に基づく計算値）
 *
 * 注意:
 * - 前後賞は本来「番号の前後」だが、独立した確率として扱う
 * - 組違い賞も同様に独立した確率として扱う
 */
export const NENMATSU_JUMBO_2024 = {
  id: 'nenmatsu-jumbo-2024',
  lotteryName: '年末ジャンボ',
  ticketPrice: 300,
  version: '1.0',
  prizes: [
    {
      level: '1st',
      displayName: '1等 7億ぃえん',
      amount: 700_000_000,
      weight: 1,
    },
    {
      level: '1st-adj',
      displayName: '1等前後賞 1.5億ぃえん',
      amount: 150_000_000,
      weight: 2,
    },
    {
      level: '1st-group',
      displayName: '1等組違い賞 10万ぃえん',
      amount: 100_000,
      weight: 199,
    },
    {
      level: '2nd',
      displayName: '2等 1000万ぃえん',
      amount: 10_000_000,
      weight: 8,
    },
    {
      level: '3rd',
      displayName: '3等 100万ぃえん',
      amount: 1_000_000,
      weight: 400,
    },
    {
      level: '4th',
      displayName: '4等 5万ぃえん',
      amount: 50_000,
      weight: 2_000,
    },
    {
      level: '5th',
      displayName: '5等 1万ぃえん',
      amount: 10_000,
      weight: 20_000,
    },
    {
      level: '6th',
      displayName: '6等 3000ぃえん',
      amount: 3_000,
      weight: 200_000,
    },
    {
      level: '7th',
      displayName: '7等 300ぃえん',
      amount: 300,
      weight: 2_000_000,
    },
    {
      level: 'miss',
      displayName: 'ハズレ',
      amount: 0,
      weight: 17_777_390,
    },
  ],
} as const satisfies PrizeConfig;

/**
 * デフォルトの確率テーブル設定
 * MVPでは年末ジャンボ1種類のみ。将来の宝くじ種類追加に備えた抽象化ポイント。
 */
export const DEFAULT_CONFIG: PrizeConfig = NENMATSU_JUMBO_2024;
