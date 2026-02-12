/**
 * テスト用ファクトリ関数
 *
 * テストデータの作成を容易にするためのヘルパー。
 * 部分的なオーバーライドでデフォルト値と差分のみ指定可能。
 */

import type { GameState } from '@/types';
import { GAME_CONSTANTS } from '@/config/game-constants';

/** GameStateの部分的なオーバーライド用型 */
type GameStateOverrides = Partial<GameState>;

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
