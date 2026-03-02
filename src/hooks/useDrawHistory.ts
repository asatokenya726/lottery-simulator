/**
 * useDrawHistory フック
 *
 * 抽選履歴の管理を担当するカスタムフック。
 * 履歴追加（FIFO 100件）、直近結果取得、全履歴削除を提供する。
 * api-design.md セクション4-2 準拠。
 *
 * DrawHistory の保存・FIFO管理は data/draw-history.ts に委譲する。
 */

import { useState, useCallback } from 'react';
import type { DrawHistory, UseDrawHistoryReturn } from '@/types';
import { createStorage } from '@/data/storage';
import {
  loadDrawHistory,
  addDrawHistory,
  clearDrawHistory,
} from '@/data/draw-history';

/**
 * 抽選履歴管理フック
 *
 * Storage インスタンスを useState の遅延初期化で生成し、再レンダリング時の再生成を防ぐ。
 * 初回マウント時に loadDrawHistory で LocalStorage からデータを読み込む。
 */
export function useDrawHistory(): UseDrawHistoryReturn {
  // Storage は不変のため useState の遅延初期化で一度だけ生成する
  const [storage] = useState(() => createStorage());
  const [drawHistory, setDrawHistory] = useState<DrawHistory[]>(() =>
    loadDrawHistory(storage)
  );

  /**
   * 新しい抽選履歴を追加する
   *
   * FIFO 100件制限は addDrawHistory が自動適用する。
   * Storage への保存も addDrawHistory が行う。
   */
  const addDraw = useCallback(
    (draw: DrawHistory): void => {
      setDrawHistory((prev) => addDrawHistory(storage, prev, draw));
    },
    [storage]
  );

  /**
   * 抽選履歴を全て削除する
   *
   * Storage からも削除する。
   */
  const clearHistory = useCallback((): void => {
    clearDrawHistory(storage);
    setDrawHistory([]);
  }, [storage]);

  // 直近の抽選結果（配列末尾 = 最新）
  const latestDraw =
    drawHistory.length > 0 ? drawHistory[drawHistory.length - 1] : null;

  return {
    drawHistory,
    latestDraw,
    addDraw,
    clearHistory,
  };
}
