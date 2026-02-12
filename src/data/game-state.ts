/**
 * GameState CRUD
 *
 * ゲーム状態の読み込み・保存・リセット・初期値生成とバリデーションを行う。
 * api-design.md / requirements-v1.md セクション5 に準拠。
 */

import type { GameState, Storage } from '@/types';
import { GAME_CONSTANTS } from '@/config/game-constants';

/** LocalStorageの論理キー名 */
const STORAGE_KEY = 'gameState';

/**
 * YYYY-MM-DD形式の日付文字列を生成する
 *
 * toISOString()はUTCベースのため、ローカルタイムゾーンの日付を使用する。
 */
function formatDateToYMD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ============================================================
// バリデーション
// ============================================================

/**
 * 値がGameState型であるかを検証する型ガード関数
 *
 * 純粋な判定のみ行い、ログ出力はしない。
 * ログ出力は呼び出し元（loadGameState）が担当する。
 */
export function isGameState(value: unknown): value is GameState {
  // null/undefinedチェック
  if (value === null || value === undefined || typeof value !== 'object') {
    return false;
  }

  // 配列でないことを確認
  if (Array.isArray(value)) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  // balance: number >= 0 かつ有限
  if (
    typeof obj.balance !== 'number' ||
    obj.balance < 0 ||
    !isFinite(obj.balance)
  ) {
    return false;
  }

  // totalSpent: number >= 0 かつ有限
  if (
    typeof obj.totalSpent !== 'number' ||
    obj.totalSpent < 0 ||
    !isFinite(obj.totalSpent)
  ) {
    return false;
  }

  // totalWon: number >= 0 かつ有限
  if (
    typeof obj.totalWon !== 'number' ||
    obj.totalWon < 0 ||
    !isFinite(obj.totalWon)
  ) {
    return false;
  }

  // totalTickets: number >= 0 かつ整数
  if (
    typeof obj.totalTickets !== 'number' ||
    obj.totalTickets < 0 ||
    !Number.isInteger(obj.totalTickets)
  ) {
    return false;
  }

  // totalDraws: number >= 0 かつ整数
  if (
    typeof obj.totalDraws !== 'number' ||
    obj.totalDraws < 0 ||
    !Number.isInteger(obj.totalDraws)
  ) {
    return false;
  }

  // winCountByLevel: object, not null, not array, 全値が number >= 0
  if (
    typeof obj.winCountByLevel !== 'object' ||
    obj.winCountByLevel === null ||
    Array.isArray(obj.winCountByLevel)
  ) {
    return false;
  }

  const winCounts = obj.winCountByLevel as Record<string, unknown>;
  for (const key of Object.keys(winCounts)) {
    const val = winCounts[key];
    if (typeof val !== 'number' || val < 0) {
      return false;
    }
  }

  // lastRefillDate: YYYY-MM-DD形式のみ
  if (
    typeof obj.lastRefillDate !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(obj.lastRefillDate)
  ) {
    return false;
  }

  // isFirstVisit: boolean
  if (typeof obj.isFirstVisit !== 'boolean') {
    return false;
  }

  // createdAt: ISO 8601パース可能な文字列
  if (
    typeof obj.createdAt !== 'string' ||
    isNaN(Date.parse(obj.createdAt))
  ) {
    return false;
  }

  // updatedAt: ISO 8601パース可能な文字列
  if (
    typeof obj.updatedAt !== 'string' ||
    isNaN(Date.parse(obj.updatedAt))
  ) {
    return false;
  }

  return true;
}

// ============================================================
// CRUD関数
// ============================================================

/**
 * 初期GameStateを生成する
 *
 * @param now - 現在日時（テスト用DI。省略時はnew Date()）
 */
export function createInitialGameState(now?: Date): GameState {
  const currentDate = now ?? new Date();

  return {
    balance: GAME_CONSTANTS.INITIAL_BALANCE,
    totalSpent: 0,
    totalWon: 0,
    totalTickets: 0,
    totalDraws: 0,
    winCountByLevel: {},
    lastRefillDate: formatDateToYMD(currentDate),
    isFirstVisit: true,
    createdAt: currentDate.toISOString(),
    updatedAt: currentDate.toISOString(),
  };
}

/**
 * GameStateをLocalStorageから読み込む
 *
 * 存在しない場合やバリデーション失敗時は初期値にフォールバックする。
 * フォールバック時はconsole.errorでログ出力する。
 *
 * @param storage - Storageインスタンス（DI対応）
 */
export function loadGameState(storage: Storage): GameState {
  const data = storage.get<unknown>(STORAGE_KEY);

  // データが存在しない場合は初期値を返す
  if (data === null) {
    return createInitialGameState();
  }

  // バリデーション
  if (!isGameState(data)) {
    console.error(
      'GameStateのバリデーション失敗。初期値にフォールバックします。'
    );
    return createInitialGameState();
  }

  return data;
}

/**
 * GameStateをLocalStorageに保存する
 *
 * 保存失敗時はconsole.errorのみ出力し、例外はスローしない。
 *
 * @param storage - Storageインスタンス（DI対応）
 * @param state - 保存するGameState
 */
export function saveGameState(storage: Storage, state: GameState): void {
  try {
    storage.set(STORAGE_KEY, state);
  } catch (e: unknown) {
    console.error('GameStateの保存に失敗しました:', e);
  }
}

/**
 * GameStateを初期値にリセットする
 *
 * 初期値で上書き保存し、その初期値を返す。
 *
 * @param storage - Storageインスタンス（DI対応）
 */
export function resetGameState(storage: Storage): GameState {
  const initialState = createInitialGameState();
  saveGameState(storage, initialState);
  return initialState;
}
