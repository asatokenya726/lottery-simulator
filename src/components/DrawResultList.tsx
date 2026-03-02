import type { DrawResult } from '@/types';
import { getPrizeBgClass, getDisplayName } from './prize-utils';

/** DrawResultList の props 型定義 */
type DrawResultListProps = {
  /** 10枚分の抽選結果 */
  results: DrawResult[];
};

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
