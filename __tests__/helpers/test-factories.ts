/**
 * テスト用ファクトリ関数
 *
 * テストデータの作成を容易にするためのヘルパー。
 * 部分的なオーバーライドでデフォルト値と差分のみ指定可能。
 */

import type { GameState, DrawResult, DrawHistory } from '@/types';
import { GAME_CONSTANTS } from '@/config/game-constants';

/** GameStateの部分的なオーバーライド用型 */
type GameStateOverrides = Partial<GameState>;

/** DrawResultの部分的なオーバーライド用型 */
type DrawResultOverrides = Partial<DrawResult>;

/** DrawHistoryの部分的なオーバーライド用型 */
type DrawHistoryOverrides = Partial<DrawHistory>;

/**
 * テスト用GameStateを生成する
 *
 * デフォルト値は初期GameStateと同等。
 * 引数で任意のフィールドをオーバーライド可能。
 */
export function createGameState(
  overrides: GameStateOverrides = {}
): GameState {
  const now = new Date('2026-01-01T00:00:00.000Z');

  return {
    balance: GAME_CONSTANTS.INITIAL_BALANCE,
    totalSpent: 0,
    totalWon: 0,
    totalTickets: 0,
    totalDraws: 0,
    winCountByLevel: {},
    lastRefillDate: '2026-01-01',
    isFirstVisit: true,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    ...overrides,
  };
}

/**
 * テスト用DrawResultを生成する
 *
 * デフォルト値はハズレ（prizeLevel: null, amount: 0）。
 * 引数で任意のフィールドをオーバーライド可能。
 */
export function createDrawResult(
  overrides: DrawResultOverrides = {}
): DrawResult {
  return {
    prizeLevel: null,
    amount: 0,
    ...overrides,
  };
}

/**
 * テスト用DrawHistoryを生成する
 *
 * デフォルト値は10枚ハズレの抽選履歴。
 * 引数で任意のフィールドをオーバーライド可能。
 */
export function createDrawHistory(
  overrides: DrawHistoryOverrides = {}
): DrawHistory {
  const now = new Date('2026-01-01T00:00:00.000Z');

  return {
    id: 'test-draw-001',
    timestamp: now.toISOString(),
    cost: 3_000,
    totalWin: 0,
    results: Array.from({ length: 10 }, () => createDrawResult()),
    ...overrides,
  };
}
