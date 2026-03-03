'use client';

import { useCallback } from 'react';
import type { DrawResult } from '@/types';
import { findBestPrize, buildShareText, buildShareUrl } from '@/lib/share-utils';
import { getDisplayName } from '@/components/prize-utils';
import { calculateTotalWinFromResults } from '@/lib/stats-calculator';

/** ShareButton の props 型定義 */
type ShareButtonProps = {
  /** 抽選結果の配列 */
  results: DrawResult[];
};

/**
 * X(Twitter) シェアボタンコンポーネント
 *
 * 抽選結果から最高等級とシェアテキストを生成し、
 * X(Twitter) Web Intent URL で新しいウィンドウを開く。
 * results が空の場合は何も表示しない。
 */
export function ShareButton({ results }: ShareButtonProps) {
  const handleShare = useCallback(() => {
    const bestPrize = findBestPrize(results);
    const displayName = bestPrize?.prizeLevel != null
      ? getDisplayName(bestPrize.prizeLevel)
      : null;
    const totalWin = calculateTotalWinFromResults(results);
    const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const text = buildShareText(displayName, totalWin, siteUrl);
    const url = buildShareUrl(text);

    window.open(url, '_blank', 'noopener');
  }, [results]);

  if (results.length === 0) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label="X(Twitter)で結果をシェア"
      className="mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-bg-tertiary px-4 py-3 text-sm font-semibold text-text-primary transition-colors hover:bg-bg-tertiary/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-primary cursor-pointer"
    >
      <XIcon />
      <span>結果をシェア</span>
    </button>
  );
}

/**
 * X(Twitter) ロゴアイコン
 *
 * 公式のXロゴSVGパスを使用。サイズは 16x16。
 */
function XIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
