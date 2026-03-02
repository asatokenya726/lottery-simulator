/**
 * 抽選エンジン
 *
 * 整数重み付きランダム抽選で宝くじの等級を決定する。
 * api-design.md セクション1-1 準拠。
 *
 * 全て純粋関数（副作用なし）。
 * drawLottery のみ内部で Math.random() を使用する。
 */

import type { PrizeEntry, PrizeConfig, DrawResult } from '@/types';

/**
 * 重み付きランダムで1つの等級を選択する
 *
 * 累積重みの区間判定方式で等級を決定する。
 * 整数weightのみ使用し、浮動小数点誤差を回避する。
 * テスト容易性のため乱数を引数で受け取る。
 *
 * @param prizes - 確率テーブル（PrizeEntry配列）
 * @param random - 0以上1未満の乱数値（Math.random() 互換）
 * @returns 当選した等級（空配列の場合はnull）
 */
export function selectPrize(
  prizes: PrizeEntry[],
  random: number
): PrizeEntry | null {
  if (prizes.length === 0) {
    return null;
  }

  // 重みの合計を計算（整数演算）
  const totalWeight = prizes.reduce(
    (sum, entry) => sum + entry.weight,
    0
  );

  // 乱数を整数の区間インデックスに変換
  // Math.floor(random * totalWeight) で 0 〜 totalWeight-1 の整数を得る
  const target = Math.floor(random * totalWeight);

  // 累積重みの区間判定で等級を選択
  let cumulative = 0;
  for (const entry of prizes) {
    cumulative += entry.weight;
    if (target < cumulative) {
      return entry;
    }
  }

  // 浮動小数点の丸め誤差で到達する可能性への安全策（最後のエントリを返す）
  return prizes[prizes.length - 1];
}

/**
 * 指定枚数分の宝くじ抽選を実行する
 *
 * count回 selectPrize を呼び出し、PrizeEntry を DrawResult に変換する。
 * 内部で Math.random() を使用する（唯一の副作用的な振る舞い）。
 *
 * 変換ルール:
 * - level === 'miss': { prizeLevel: null, amount: 0 }
 * - それ以外: { prizeLevel: entry.level, amount: entry.amount }
 * - selectPrize が null: { prizeLevel: null, amount: 0 }
 *
 * @param config - 確率テーブル設定
 * @param count - 抽選枚数
 * @returns 各枚の抽選結果
 */
export function drawLottery(
  config: PrizeConfig,
  count: number
): DrawResult[] {
  if (count <= 0) {
    return [];
  }

  const results: DrawResult[] = [];

  for (let i = 0; i < count; i++) {
    const entry = selectPrize(config.prizes, Math.random());
    results.push(toDrawResult(entry));
  }

  return results;
}

/**
 * PrizeEntry を DrawResult に変換する
 *
 * ハズレ（level === 'miss'）と null は同じ結果（prizeLevel: null, amount: 0）になる。
 *
 * @param entry - 抽選結果の等級（nullの場合はハズレ扱い）
 * @returns DrawResult
 */
function toDrawResult(entry: PrizeEntry | null): DrawResult {
  if (entry === null || entry.level === 'miss') {
    return { prizeLevel: null, amount: 0 };
  }

  return { prizeLevel: entry.level, amount: entry.amount };
}
