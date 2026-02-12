/**
 * DrawHistory CRUD
 *
 * 抽選履歴の読み込み・追加（FIFO 100件制限）・全削除とバリデーションを行う。
 * api-design.md / requirements-v1.md セクション5 に準拠。
 */

import type { DrawHistory, DrawResult, Storage } from '@/types';
import { GAME_CONSTANTS } from '@/config/game-constants';

/** LocalStorageの論理キー名 */
const STORAGE_KEY = 'drawHistory';

// ============================================================
// バリデーション
// ============================================================

/**
 * 値がDrawResult型であるかを検証する型ガード関数
 *
 * 純粋な判定のみ行い、ログ出力はしない。
 */
export function isDrawResult(value: unknown): value is DrawResult {
  if (value === null || value === undefined || typeof value !== 'object') {
    return false;
  }

  if (Array.isArray(value)) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  // prizeLevel: string（空文字不可） または null
  if (obj.prizeLevel !== null) {
    if (typeof obj.prizeLevel !== 'string' || obj.prizeLevel.length === 0) {
      return false;
    }
  }

  // amount: number >= 0 かつ有限
  if (
    typeof obj.amount !== 'number' ||
    obj.amount < 0 ||
    !isFinite(obj.amount)
  ) {
    return false;
  }

  return true;
}

/**
 * 値がDrawHistory型であるかを検証する型ガード関数
 *
 * 純粋な判定のみ行い、ログ出力はしない。
 * ログ出力は呼び出し元（loadDrawHistory）が担当する。
 */
export function isDrawHistory(value: unknown): value is DrawHistory {
  if (value === null || value === undefined || typeof value !== 'object') {
    return false;
  }

  if (Array.isArray(value)) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  // id: string（空文字不可）
  if (typeof obj.id !== 'string' || obj.id.length === 0) {
    return false;
  }

  // timestamp: ISO 8601パース可能な文字列
  if (
    typeof obj.timestamp !== 'string' ||
    isNaN(Date.parse(obj.timestamp))
  ) {
    return false;
  }

  // cost: number >= 0 かつ有限
  if (
    typeof obj.cost !== 'number' ||
    obj.cost < 0 ||
    !isFinite(obj.cost)
  ) {
    return false;
  }

  // totalWin: number >= 0 かつ有限
  if (
    typeof obj.totalWin !== 'number' ||
    obj.totalWin < 0 ||
    !isFinite(obj.totalWin)
  ) {
    return false;
  }

  // results: 非空の配列で、全要素がDrawResult
  if (!Array.isArray(obj.results) || obj.results.length === 0) {
    return false;
  }

  for (const result of obj.results) {
    if (!isDrawResult(result)) {
      return false;
    }
  }

  return true;
}

// ============================================================
// CRUD関数
// ============================================================

/**
 * DrawHistoryをLocalStorageから読み込む
 *
 * 存在しない場合は空配列を返す。
 * バリデーション失敗した要素はスキップし、console.errorでログ出力する。
 *
 * @param storage - Storageインスタンス（DI対応）
 */
export function loadDrawHistory(storage: Storage): DrawHistory[] {
  const data = storage.get<unknown>(STORAGE_KEY);

  // データが存在しない場合は空配列を返す
  if (data === null) {
    return [];
  }

  // 配列チェック
  if (!Array.isArray(data)) {
    console.error(
      'DrawHistoryのデータが配列ではありません。空配列にフォールバックします。'
    );
    return [];
  }

  // 各要素をバリデーション、不正要素をスキップ
  const validEntries: DrawHistory[] = [];
  let hasInvalidEntry = false;

  for (const entry of data) {
    if (isDrawHistory(entry)) {
      validEntries.push(entry);
    } else {
      hasInvalidEntry = true;
    }
  }

  if (hasInvalidEntry) {
    console.error(
      'DrawHistoryに不正なエントリが含まれていました。不正エントリをスキップしました。'
    );
  }

  return validEntries;
}

/**
 * 新しいDrawHistoryを追加する
 *
 * FIFO 100件制限を適用し、LocalStorageに自動保存する。
 * immutableに新配列を返す（元の配列は変更しない）。
 *
 * @param storage - Storageインスタンス（DI対応）
 * @param history - 現在の履歴配列
 * @param newDraw - 追加する新しい抽選履歴
 * @returns 更新後の履歴配列
 */
export function addDrawHistory(
  storage: Storage,
  history: DrawHistory[],
  newDraw: DrawHistory
): DrawHistory[] {
  const updated = [...history, newDraw];

  // FIFO: MAX_HISTORYを超えた場合、先頭から切り落とす
  const trimmed =
    updated.length > GAME_CONSTANTS.MAX_HISTORY
      ? updated.slice(updated.length - GAME_CONSTANTS.MAX_HISTORY)
      : updated;

  try {
    storage.set(STORAGE_KEY, trimmed);
  } catch (e: unknown) {
    console.error('DrawHistoryの保存に失敗しました:', e);
  }

  return trimmed;
}

/**
 * 全DrawHistoryを削除する
 *
 * @param storage - Storageインスタンス（DI対応）
 */
export function clearDrawHistory(storage: Storage): void {
  storage.remove(STORAGE_KEY);
}
