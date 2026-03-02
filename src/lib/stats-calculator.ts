/**
 * 統計計算ロジック
 *
 * 回収率計算・等級別集計・マージ・合計当選額計算を行う。
 * api-design.md セクション1-4 準拠。
 *
 * 全て純粋関数（副作用なし）。
 */

import type { DrawResult } from '@/types';

/**
 * 回収率を計算する
 *
 * 累計当選額を累計購入額で割り、百分率（%）で返す。
 * 小数第1位まで丸める（例: 33.333...% -> 33.3%）。
 * ゼロ除算を回避するため、totalSpent === 0 の場合は 0 を返す。
 *
 * @param totalWon - 累計当選額（ぃえん）
 * @param totalSpent - 累計購入額（ぃえん）
 * @returns 回収率（%）。小数第1位まで
 */
export function calculateRecoveryRate(
  totalWon: number,
  totalSpent: number
): number {
  if (totalSpent === 0) {
    return 0;
  }

  return Math.round((totalWon / totalSpent) * 1000) / 10;
}

/**
 * 1回の10連結果から等級別当選回数を集計する
 *
 * results 内の prizeLevel が null（ハズレ）の結果はスキップする。
 * 同一等級が複数ある場合はカウントを加算する。
 *
 * @param results - 抽選結果の配列（10枚分）
 * @returns 等級名をキー、当選回数を値とするオブジェクト
 */
export function aggregateDrawResults(
  results: DrawResult[]
): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const result of results) {
    if (result.prizeLevel === null) {
      continue;
    }

    counts[result.prizeLevel] = (counts[result.prizeLevel] ?? 0) + 1;
  }

  return counts;
}

/**
 * 既存の等級別当選回数に新しい結果をイミュータブルにマージする
 *
 * 同一キーは値を加算し、新規キーはそのまま追加する。
 * 元のオブジェクトは変更しない（イミュータブル）。
 *
 * @param existing - 既存の等級別当選回数
 * @param newCounts - 新しい等級別当選回数
 * @returns マージ後の等級別当選回数（新しいオブジェクト）
 */
export function mergeWinCounts(
  existing: Record<string, number>,
  newCounts: Record<string, number>
): Record<string, number> {
  const merged: Record<string, number> = { ...existing };

  for (const [level, count] of Object.entries(newCounts)) {
    merged[level] = (merged[level] ?? 0) + count;
  }

  return merged;
}

/**
 * 1回の10連結果から合計当選額を計算する
 *
 * results 内の全 amount を合計する。
 * ハズレ（amount: 0）も加算対象だが結果に影響しない。
 *
 * @param results - 抽選結果の配列（10枚分）
 * @returns 合計当選額（ぃえん）
 */
export function calculateTotalWinFromResults(
  results: DrawResult[]
): number {
  return results.reduce((sum, result) => sum + result.amount, 0);
}
