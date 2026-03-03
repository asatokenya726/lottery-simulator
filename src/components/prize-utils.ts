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
 * 等級別アニメーションクラスのマッピング
 *
 * 1等: 最も派手な金色フラッシュ + 大きめスケール
 * 1等前後賞/1等組違い/2等: 控えめフラッシュ + 中スケール
 * 3等〜7等: スケールのみ（フラッシュなし）
 */
const PRIZE_ANIMATION_CLASS: Record<string, string> = {
  '1st': 'animate-flash-jackpot scale-110 motion-reduce:animate-none motion-reduce:scale-100',
  '1st-adj': 'animate-flash-high scale-107 motion-reduce:animate-none motion-reduce:scale-100',
  '1st-group': 'animate-flash-high scale-107 motion-reduce:animate-none motion-reduce:scale-100',
  '2nd': 'animate-flash-high scale-107 motion-reduce:animate-none motion-reduce:scale-100',
  '3rd': 'scale-105 motion-reduce:scale-100',
  '4th': 'scale-105 motion-reduce:scale-100',
  '5th': 'scale-105 motion-reduce:scale-100',
  '6th': 'scale-105 motion-reduce:scale-100',
  '7th': 'scale-105 motion-reduce:scale-100',
};

/**
 * 等級レベルからアニメーションクラスを取得する
 *
 * 当選等級に応じたCSSアニメーション + スケールクラスを返す。
 * ハズレ（null）や未知の等級の場合は空文字列を返す。
 *
 * @param prizeLevel - 等級名（null = ハズレ）
 * @returns アニメーション用クラス文字列（空文字列 = 演出なし）
 */
export function getPrizeAnimationClass(prizeLevel: string | null): string {
  if (prizeLevel === null) {
    return '';
  }
  return PRIZE_ANIMATION_CLASS[prizeLevel] ?? '';
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
