/**
 * SNSシェア用ユーティリティ
 *
 * シェアテキスト生成・最高等級判定・シェアURL構築を行う。
 * 全て純粋関数（副作用なし）。
 */

import type { DrawResult } from '@/types';

/**
 * 抽選結果から最高等級（最高金額）の結果を返す
 *
 * 全ハズレ（全て amount === 0）の場合は null を返す。
 * 同額の当選が複数ある場合は先頭（配列で最初に見つかった方）を採用する。
 *
 * @param results - 抽選結果の配列
 * @returns 最高金額の DrawResult、全ハズレ時は null
 */
export function findBestPrize(results: DrawResult[]): DrawResult | null {
  if (results.length === 0) {
    return null;
  }

  let best: DrawResult | null = null;

  for (const result of results) {
    if (result.amount <= 0) {
      continue;
    }

    if (best === null || result.amount > best.amount) {
      best = result;
    }
  }

  return best;
}

/**
 * シェアテキストを生成する
 *
 * displayName が null の場合は全ハズレ用のテキストを生成する。
 * サイトURLはテキスト末尾に改行付きで追加する。
 *
 * @param displayName - 最高等級の表示名（null = 全ハズレ）
 * @param totalWin - 合計当選額（ぃえん）
 * @param siteUrl - サイトURL
 * @returns シェアテキスト
 */
export function buildShareText(
  displayName: string | null,
  totalWin: number,
  siteUrl: string
): string {
  const formattedWin = totalWin.toLocaleString();

  const message =
    displayName !== null
      ? `宝くじシミュレーターで${displayName}が当たった! 合計${formattedWin}ぃえん獲得!`
      : `宝くじシミュレーターで10連ガチャ! 結果は全ハズレ...`;

  return siteUrl ? `${message}\n${siteUrl}` : message;
}

/**
 * X(Twitter) Web Intent シェアURLを構築する
 *
 * テキストを encodeURIComponent でエンコードし、
 * Twitter Web Intent URL のクエリパラメータに設定する。
 *
 * @param text - シェアテキスト
 * @returns X(Twitter) Web Intent URL
 */
export function buildShareUrl(text: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}
