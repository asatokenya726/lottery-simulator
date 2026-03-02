import type { DrawResult } from '@/types';
import { DEFAULT_CONFIG } from '@/config/prize-config';

/** DrawResultList の props 型定義 */
type DrawResultListProps = {
  /** 10枚分の抽選結果 */
  results: DrawResult[];
};

/**
 * 等級 → Tailwind背景色クラスのマッピング
 *
 * prizeLevelがnullの場合はハズレ扱い。
 * level名 '1st-adj' に対応するトークン名は 'prize-1st-adjacent' であることに注意。
 */
const PRIZE_BG_CLASS: Record<string, string> = {
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
const MISS_BG_CLASS = 'bg-prize-miss';

/**
 * 等級レベルから背景色クラスを取得する
 *
 * @param prizeLevel - 等級名（null = ハズレ）
 * @returns Tailwind背景色クラス
 */
function getPrizeBgClass(prizeLevel: string | null): string {
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
function getDisplayName(prizeLevel: string | null): string {
  if (prizeLevel === null) {
    return 'ハズレ';
  }

  const entry = DEFAULT_CONFIG.prizes.find((p) => p.level === prizeLevel);
  return entry?.displayName ?? 'ハズレ';
}

/** 10枚分の抽選結果を一覧表示するコンポーネント */
export function DrawResultList({ results }: DrawResultListProps) {
  if (results.length === 0) {
    return null;
  }

  return (
    <ul className="grid grid-cols-2 gap-2 list-none p-0 m-0" aria-label="抽選結果">
      {results.map((result, index) => {
        const bgClass = getPrizeBgClass(result.prizeLevel);
        const displayName = getDisplayName(result.prizeLevel);
        const isWin = result.prizeLevel !== null;

        // 10連の結果は固定順序で並び替えがないため index をキーとして使用
        return (
          <li
            key={`result-${index}`}
            className="flex items-center justify-between rounded-lg bg-bg-secondary p-3"
          >
            <span
              className={`rounded-sm px-2 py-0.5 text-xs font-semibold text-white ${bgClass}`}
            >
              {displayName}
            </span>
            {isWin && (
              <span className="text-sm font-medium text-text-primary">
                {result.amount.toLocaleString('ja-JP')}ぃえん
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
