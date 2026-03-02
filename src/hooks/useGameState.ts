/**
 * useGameState フック
 *
 * ゲーム状態の管理を担当するカスタムフック。
 * 10連ガチャ実行・資金補給・リセット・初回訪問フラグ管理を提供する。
 * api-design.md セクション3-1 準拠。
 *
 * DrawHistory の保存は useDrawHistory の責務であり、このフックでは行わない。
 */

import { useState, useCallback } from 'react';
import type { DrawResult, UseGameStateReturn } from '@/types';
import { createStorage } from '@/data/storage';
import {
  loadGameState,
  saveGameState,
  resetGameState,
  formatDateToYMD,
} from '@/data/game-state';
import { clearDrawHistory } from '@/data/draw-history';
import { drawLottery } from '@/lib/lottery-engine';
import {
  canPurchase,
  deductBalance,
  addWinnings,
  calculateDrawCost,
} from '@/lib/currency-manager';
import { shouldRefill, applyRefill } from '@/lib/refill-manager';
import {
  aggregateDrawResults,
  mergeWinCounts,
  calculateTotalWinFromResults,
} from '@/lib/stats-calculator';
import { GAME_CONSTANTS } from '@/config/game-constants';
import { DEFAULT_CONFIG } from '@/config/prize-config';

/**
 * ゲーム状態管理フック
 *
 * Storage インスタンスを useState の遅延初期化で生成し、再レンダリング時の再生成を防ぐ。
 * Storage は不変オブジェクトのため useState で保持しても問題ない。
 * 初回マウント時に loadGameState で LocalStorage からデータを読み込む。
 */
export function useGameState(): UseGameStateReturn {
  // Storage は不変のため useState の遅延初期化で一度だけ生成する
  const [storage] = useState(() => createStorage());
  const [gameState, setGameState] = useState(() => loadGameState(storage));

  /**
   * 10連ガチャを実行する
   *
   * 残高チェック → 差し引き → 抽選 → 当選金加算 → 統計更新 → 保存
   * 残高不足時は空配列を返す。
   */
  const executeDraw = useCallback((): DrawResult[] => {
    const cost = calculateDrawCost(
      DEFAULT_CONFIG.ticketPrice,
      GAME_CONSTANTS.DRAW_COUNT
    );

    // 残高チェック
    if (!canPurchase(gameState.balance, cost)) {
      return [];
    }

    // 残高差し引き
    let newBalance = deductBalance(gameState.balance, cost);

    // 抽選実行
    const results = drawLottery(DEFAULT_CONFIG, GAME_CONSTANTS.DRAW_COUNT);

    // 当選金加算
    const totalWin = calculateTotalWinFromResults(results);
    newBalance = addWinnings(newBalance, totalWin);

    // 等級別集計の更新
    const drawCounts = aggregateDrawResults(results);
    const newWinCountByLevel = mergeWinCounts(
      gameState.winCountByLevel,
      drawCounts
    );

    // GameState更新
    const now = new Date();
    const updatedState = {
      ...gameState,
      balance: newBalance,
      totalSpent: gameState.totalSpent + cost,
      totalWon: gameState.totalWon + totalWin,
      totalTickets: gameState.totalTickets + GAME_CONSTANTS.DRAW_COUNT,
      totalDraws: gameState.totalDraws + 1,
      winCountByLevel: newWinCountByLevel,
      updatedAt: now.toISOString(),
    };

    // 保存とステート更新
    saveGameState(storage, updatedState);
    setGameState(updatedState);

    return results;
  }, [gameState, storage]);

  /**
   * 残高が購入額以上かを判定する
   */
  const canDraw = canPurchase(
    gameState.balance,
    calculateDrawCost(DEFAULT_CONFIG.ticketPrice, GAME_CONSTANTS.DRAW_COUNT)
  );

  /**
   * 資金補給チェックと実行
   *
   * 日付が変わっていて残高が閾値未満の場合に補給を実施する。
   * 補給した場合はtrue、しなかった場合はfalseを返す。
   */
  const checkAndRefill = useCallback((): boolean => {
    const today = formatDateToYMD(new Date());

    // 補給要否判定
    if (
      !shouldRefill(
        gameState.balance,
        gameState.lastRefillDate,
        today,
        GAME_CONSTANTS.REFILL_THRESHOLD
      )
    ) {
      return false;
    }

    // 補給実行
    const newBalance = applyRefill(
      gameState.balance,
      GAME_CONSTANTS.REFILL_AMOUNT
    );

    const now = new Date();
    const updatedState = {
      ...gameState,
      balance: newBalance,
      lastRefillDate: today,
      updatedAt: now.toISOString(),
    };

    saveGameState(storage, updatedState);
    setGameState(updatedState);

    return true;
  }, [gameState, storage]);

  /**
   * 全データをリセットする
   *
   * GameState を初期値に戻し、DrawHistory も全削除する。
   */
  const resetAll = useCallback((): void => {
    const initialState = resetGameState(storage);
    clearDrawHistory(storage);
    setGameState(initialState);
  }, [storage]);

  /**
   * 初回訪問フラグを false にする
   */
  const dismissFirstVisit = useCallback((): void => {
    const now = new Date();
    const updatedState = {
      ...gameState,
      isFirstVisit: false,
      updatedAt: now.toISOString(),
    };

    saveGameState(storage, updatedState);
    setGameState(updatedState);
  }, [gameState, storage]);

  return {
    gameState,
    executeDraw,
    canDraw,
    checkAndRefill,
    resetAll,
    dismissFirstVisit,
    isStorageAvailable: storage.isAvailable,
  };
}
