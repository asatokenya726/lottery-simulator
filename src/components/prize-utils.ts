/**
 * 等級表示の共通ユーティリティ
 *
 * DrawResultList / DrawAnimation で共有する等級→背景色/表示名の変換ロジック。
 */

import { DEFAULT_CONFIG } from '@/config/prize-config';

/**
 * 等級 → Tailwind背景色クラスのマッピング
 *
 * prizeLevelがnullの場合はハズレ扱い。
 * level名 '1st-adj' に対応するトークン名は 'prize-1st-adjacent' であることに注意。
 */
export const PRIZE_BG_CLASS: Record<string, string> = {
  '1st': 'bg-prize-1st',
  '1st-adj': 'bg-prize-1st-adjacent',
  '1st-group': 'bg-prize-1st-group',
  '2nd': 'bg-prize-2nd',
  '3rd': 'bg-prize-3rd',
  '4th': 'bg-prize-4th',
  '5th': 'bg-prize-5th',
  '6th': 'bg-prize-6th',
  '7th': 'bg-prize-7th',
};

/** ハズレ時の背景色クラス */
export const MISS_BG_CLASS = 'bg-prize-miss';

/**
 * 等級レベルから背景色クラスを取得する
 *
 * @param prizeLevel - 等級名（null = ハズレ）
 * @returns Tailwind背景色クラス
 */
export function getPrizeBgClass(prizeLevel: string | null): string {
  if (prizeLevel === null) {
    return MISS_BG_CLASS;
  }
  return PRIZE_BG_CLASS[prizeLevel] ?? MISS_BG_CLASS;
}

/**
 * 等級レベルから表示名を取得する
 *
 * DEFAULT_CONFIGのprizesからlevelで検索して displayName を返す。
 * ハズレ（null）の場合は固定文字列「ハズレ」。
 *
 * @param prizeLevel - 等級名（null = ハズレ）
 * @returns 表示名
 */
export function getDisplayName(prizeLevel: string | null): string {
  if (prizeLevel === null) {
    return 'ハズレ';
  }

  const entry = DEFAULT_CONFIG.prizes.find((p) => p.level === prizeLevel);
  return entry?.displayName ?? 'ハズレ';
}
