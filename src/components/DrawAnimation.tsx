'use client';

import { useState, useEffect, useCallback } from 'react';
import type { DrawResult } from '@/types';
import { DEFAULT_CONFIG } from '@/config/prize-config';

/** DrawAnimation の props 型定義 */
type DrawAnimationProps = {
  /** 10枚分の抽選結果 */
  results: DrawResult[];
  /** 全件表示完了時のコールバック */
  onComplete: () => void;
};

/** 順次表示の間隔（ミリ秒） */
const REVEAL_INTERVAL_MS = 300;

/**
 * 等級 -> Tailwind背景色クラスのマッピング
 *
 * DrawResultList と同一のマッピング。
 * 将来のリファクタリングで共通化を検討する。
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

/**
 * 10連ガチャ結果を順次表示するアニメーションコンポーネント
 *
 * 300ms間隔で1枚ずつ結果を表示し、当選時はスケールアップ演出を行う。
 * スキップボタンで全件即時表示が可能。
 */
export function DrawAnimation({ results, onComplete }: DrawAnimationProps) {
  /** 何枚目まで表示したか（0から開始） */
  const [visibleCount, setVisibleCount] = useState(0);
  /** スキップ済みフラグ */
  const [isSkipped, setIsSkipped] = useState(false);

  /** スキップ処理 */
  const handleSkip = useCallback(() => {
    setIsSkipped(true);
    setVisibleCount(results.length);
  }, [results.length]);

  /** 順次表示アニメーション */
  useEffect(() => {
    // 空配列または全件表示済みの場合は何もしない
    if (results.length === 0 || visibleCount >= results.length) {
      return;
    }

    const intervalId = setInterval(() => {
      setVisibleCount((prev) => {
        const next = prev + 1;
        if (next >= results.length) {
          clearInterval(intervalId);
        }
        return next;
      });
    }, REVEAL_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, [results.length, visibleCount]);

  /** 全件表示完了時に onComplete を呼ぶ */
  useEffect(() => {
    if (results.length > 0 && visibleCount >= results.length) {
      onComplete();
    }
  }, [visibleCount, results.length, onComplete]);

  // 空配列の場合は何も表示しない
  if (results.length === 0) {
    return null;
  }

  const isAllRevealed = visibleCount >= results.length;

  return (
    <div>
      <ul
        className="grid grid-cols-2 gap-2 list-none p-0 m-0"
        aria-label="抽選結果アニメーション"
      >
        {results.map((result, index) => {
          const isVisible = index < visibleCount;
          const bgClass = getPrizeBgClass(result.prizeLevel);
          const displayName = getDisplayName(result.prizeLevel);
          const isWin = result.prizeLevel !== null;

          return (
            <li
              key={`anim-result-${index}`}
              className={`flex items-center justify-between rounded-lg bg-bg-secondary p-3 ${
                isVisible
                  ? isWin
                    ? 'transition-all duration-300 ease-out opacity-100 scale-105'
                    : 'transition-all duration-200 ease-out opacity-100'
                  : 'opacity-0'
              }`}
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
      {!isAllRevealed && !isSkipped && (
        <button
          type="button"
          onClick={handleSkip}
          className="mt-3 w-full rounded-lg bg-bg-tertiary px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
        >
          スキップ
        </button>
      )}
    </div>
  );
}
