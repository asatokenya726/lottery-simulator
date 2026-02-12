/**
 * game-state.ts の単体テスト
 *
 * GameState CRUD + バリデーションの動作を検証する。
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createInitialGameState,
  loadGameState,
  saveGameState,
  resetGameState,
  isGameState,
} from '@/data/game-state';
import { GAME_CONSTANTS } from '@/config/game-constants';
import { createMockStorage } from '../helpers/mock-storage';
import { createGameState } from '../helpers/test-factories';

beforeEach(() => {
  vi.restoreAllMocks();
});

// ============================================================
// createInitialGameState
// ============================================================

describe('createInitialGameState', () => {
  it('全フィールドが正しい初期値を持つ', () => {
    const now = new Date('2026-03-15T10:30:00.000Z');
    const state = createInitialGameState(now);

    expect(state.balance).toBe(GAME_CONSTANTS.INITIAL_BALANCE);
    expect(state.totalSpent).toBe(0);
    expect(state.totalWon).toBe(0);
    expect(state.totalTickets).toBe(0);
    expect(state.totalDraws).toBe(0);
    expect(state.winCountByLevel).toEqual({});
    expect(state.lastRefillDate).toBe('2026-03-15');
    expect(state.isFirstVisit).toBe(true);
    expect(state.createdAt).toBe('2026-03-15T10:30:00.000Z');
    expect(state.updatedAt).toBe('2026-03-15T10:30:00.000Z');
  });

  it('now注入なしの場合、現在日時を使用する', () => {
    const before = new Date();
    const state = createInitialGameState();
    const after = new Date();

    // createdAtが実行前後の時刻範囲に入ることを確認
    const createdAt = new Date(state.createdAt).getTime();
    expect(createdAt).toBeGreaterThanOrEqual(before.getTime());
    expect(createdAt).toBeLessThanOrEqual(after.getTime());
  });

  it('nowがローカルタイムゾーン日付を使う（lastRefillDate）', () => {
    // UTC 23:00 = JST 翌日08:00 のようなケースをシミュレート
    const now = new Date('2026-06-30T23:00:00.000Z');
    const state = createInitialGameState(now);

    // lastRefillDateはローカルタイムゾーン基準
    // テスト環境のTZに依存するため、YYYY-MM-DD形式であることのみ確認
    expect(state.lastRefillDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

// ============================================================
// isGameState
// ============================================================

describe('isGameState', () => {
  it('正常なGameStateに対してtrueを返す', () => {
    const state = createGameState();
    expect(isGameState(state)).toBe(true);
  });

  it('空のwinCountByLevel({})でtrueを返す', () => {
    const state = createGameState({ winCountByLevel: {} });
    expect(isGameState(state)).toBe(true);
  });

  it('値のあるwinCountByLevelでtrueを返す', () => {
    const state = createGameState({
      winCountByLevel: { '1等': 0, '6等': 5, 'ハズレ': 100 },
    });
    expect(isGameState(state)).toBe(true);
  });

  // --- null / undefined / プリミティブ ---

  it('nullに対してfalseを返す', () => {
    expect(isGameState(null)).toBe(false);
  });

  it('undefinedに対してfalseを返す', () => {
    expect(isGameState(undefined)).toBe(false);
  });

  it('文字列に対してfalseを返す', () => {
    expect(isGameState('not an object')).toBe(false);
  });

  it('数値に対してfalseを返す', () => {
    expect(isGameState(42)).toBe(false);
  });

  it('配列に対してfalseを返す', () => {
    expect(isGameState([1, 2, 3])).toBe(false);
  });

  // --- balance ---

  it('balance が負の場合falseを返す', () => {
    const state = createGameState({ balance: -1 });
    expect(isGameState(state)).toBe(false);
  });

  it('balance が文字列の場合falseを返す', () => {
    const state = createGameState();
    (state as Record<string, unknown>).balance = '100000';
    expect(isGameState(state)).toBe(false);
  });

  it('balance が Infinity の場合falseを返す', () => {
    const state = createGameState({ balance: Infinity });
    expect(isGameState(state)).toBe(false);
  });

  it('balance が NaN の場合falseを返す', () => {
    const state = createGameState({ balance: NaN });
    expect(isGameState(state)).toBe(false);
  });

  // --- totalSpent ---

  it('totalSpent が負の場合falseを返す', () => {
    const state = createGameState({ totalSpent: -100 });
    expect(isGameState(state)).toBe(false);
  });

  it('totalSpent が Infinity の場合falseを返す', () => {
    const state = createGameState({ totalSpent: Infinity });
    expect(isGameState(state)).toBe(false);
  });

  // --- totalWon ---

  it('totalWon が負の場合falseを返す', () => {
    const state = createGameState({ totalWon: -1 });
    expect(isGameState(state)).toBe(false);
  });

  it('totalWon が Infinity の場合falseを返す', () => {
    const state = createGameState({ totalWon: -Infinity });
    expect(isGameState(state)).toBe(false);
  });

  // --- totalTickets ---

  it('totalTickets が負の場合falseを返す', () => {
    const state = createGameState({ totalTickets: -1 });
    expect(isGameState(state)).toBe(false);
  });

  it('totalTickets が小数の場合falseを返す', () => {
    const state = createGameState({ totalTickets: 1.5 });
    expect(isGameState(state)).toBe(false);
  });

  // --- totalDraws ---

  it('totalDraws が負の場合falseを返す', () => {
    const state = createGameState({ totalDraws: -1 });
    expect(isGameState(state)).toBe(false);
  });

  it('totalDraws が小数の場合falseを返す', () => {
    const state = createGameState({ totalDraws: 0.5 });
    expect(isGameState(state)).toBe(false);
  });

  // --- winCountByLevel ---

  it('winCountByLevel が null の場合falseを返す', () => {
    const state = createGameState();
    (state as Record<string, unknown>).winCountByLevel = null;
    expect(isGameState(state)).toBe(false);
  });

  it('winCountByLevel が配列の場合falseを返す', () => {
    const state = createGameState();
    (state as Record<string, unknown>).winCountByLevel = [1, 2];
    expect(isGameState(state)).toBe(false);
  });

  it('winCountByLevel の値に負の数がある場合falseを返す', () => {
    const state = createGameState({ winCountByLevel: { '1等': -1 } });
    expect(isGameState(state)).toBe(false);
  });

  it('winCountByLevel の値に文字列がある場合falseを返す', () => {
    const state = createGameState();
    (state as Record<string, unknown>).winCountByLevel = { '1等': 'three' };
    expect(isGameState(state)).toBe(false);
  });

  // --- lastRefillDate ---

  it('lastRefillDate が不正な形式の場合falseを返す', () => {
    const state = createGameState({ lastRefillDate: '2026/01/01' });
    expect(isGameState(state)).toBe(false);
  });

  it('lastRefillDate が ISO 8601 形式の場合falseを返す', () => {
    const state = createGameState({
      lastRefillDate: '2026-01-01T00:00:00.000Z',
    });
    expect(isGameState(state)).toBe(false);
  });

  it('lastRefillDate が数値の場合falseを返す', () => {
    const state = createGameState();
    (state as Record<string, unknown>).lastRefillDate = 20260101;
    expect(isGameState(state)).toBe(false);
  });

  // --- isFirstVisit ---

  it('isFirstVisit が文字列の場合falseを返す', () => {
    const state = createGameState();
    (state as Record<string, unknown>).isFirstVisit = 'true';
    expect(isGameState(state)).toBe(false);
  });

  // --- createdAt ---

  it('createdAt がパース不可能な文字列の場合falseを返す', () => {
    const state = createGameState({ createdAt: 'not-a-date' });
    expect(isGameState(state)).toBe(false);
  });

  it('createdAt が数値の場合falseを返す', () => {
    const state = createGameState();
    (state as Record<string, unknown>).createdAt = 1234567890;
    expect(isGameState(state)).toBe(false);
  });

  // --- updatedAt ---

  it('updatedAt がパース不可能な文字列の場合falseを返す', () => {
    const state = createGameState({ updatedAt: 'invalid' });
    expect(isGameState(state)).toBe(false);
  });

  it('updatedAt が数値の場合falseを返す', () => {
    const state = createGameState();
    (state as Record<string, unknown>).updatedAt = Date.now();
    expect(isGameState(state)).toBe(false);
  });

  // --- ログ出力しないことの確認 ---

  it('isGameStateはconsole.errorを呼ばない', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // 不正データを渡してもログを出さない
    isGameState(null);
    isGameState({ balance: -1 });

    expect(consoleSpy).not.toHaveBeenCalled();
  });
});

// ============================================================
// loadGameState
// ============================================================

describe('loadGameState', () => {
  it('正常なデータを読み込める', () => {
    const savedState = createGameState({ balance: 50_000, totalDraws: 5 });
    const storage = createMockStorage({
      initialData: {
        gameState: JSON.stringify(savedState),
      },
    });

    const result = loadGameState(storage);

    expect(result.balance).toBe(50_000);
    expect(result.totalDraws).toBe(5);
  });

  it('データが存在しない場合、初期値を返す', () => {
    const storage = createMockStorage();

    const result = loadGameState(storage);

    expect(result.balance).toBe(GAME_CONSTANTS.INITIAL_BALANCE);
    expect(result.totalSpent).toBe(0);
    expect(result.isFirstVisit).toBe(true);
  });

  it('バリデーション失敗時、初期値にフォールバックしconsole.errorを出力する', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // balance が負の不正データ
    const invalidState = createGameState({ balance: -999 });
    const storage = createMockStorage({
      initialData: {
        gameState: JSON.stringify(invalidState),
      },
    });

    const result = loadGameState(storage);

    expect(result.balance).toBe(GAME_CONSTANTS.INITIAL_BALANCE);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('バリデーション失敗')
    );
  });

  it('破損データ（JSONパース不可）の場合、初期値を返す', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const storage = createMockStorage();
    // 破損データシミュレーション（getがnullを返す）
    storage._errors.corruptedKeys = new Set(['gameState']);

    const result = loadGameState(storage);

    // nullが返されるため、初期値にフォールバック
    expect(result.balance).toBe(GAME_CONSTANTS.INITIAL_BALANCE);
  });

  it('不正な型のデータ（文字列）の場合、初期値にフォールバックする', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const storage = createMockStorage({
      initialData: {
        gameState: JSON.stringify('just a string'),
      },
    });

    const result = loadGameState(storage);

    expect(result.balance).toBe(GAME_CONSTANTS.INITIAL_BALANCE);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('バリデーション失敗')
    );
  });
});

// ============================================================
// saveGameState
// ============================================================

describe('saveGameState', () => {
  it('正常にGameStateを保存できる', () => {
    const storage = createMockStorage();
    const state = createGameState({ balance: 70_000 });

    saveGameState(storage, state);

    // 内部ストアに保存されていることを確認
    const saved = storage._store.get('gameState');
    expect(saved).toBeDefined();

    const parsed = JSON.parse(saved!);
    expect(parsed.balance).toBe(70_000);
  });

  it('QuotaExceeded時にconsole.errorのみ出力しスローしない', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const storage = createMockStorage();
    storage._errors.quotaExceeded = true;

    const state = createGameState();

    // エラーがスローされないことを確認
    expect(() => saveGameState(storage, state)).not.toThrow();

    // console.errorが呼ばれていることを確認（mock-storageのset内で出力される）
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('データ保存失敗'),
      expect.anything()
    );
  });

  it('保存後に読み込み可能である', () => {
    const storage = createMockStorage();
    const state = createGameState({
      balance: 42_000,
      totalDraws: 3,
      winCountByLevel: { '6等': 2 },
    });

    saveGameState(storage, state);
    const loaded = loadGameState(storage);

    expect(loaded.balance).toBe(42_000);
    expect(loaded.totalDraws).toBe(3);
    expect(loaded.winCountByLevel).toEqual({ '6等': 2 });
  });
});

// ============================================================
// resetGameState
// ============================================================

describe('resetGameState', () => {
  it('初期値で上書きし、初期値を返す', () => {
    const storage = createMockStorage();

    // まず非初期値を保存
    const oldState = createGameState({ balance: 1000, totalDraws: 99 });
    saveGameState(storage, oldState);

    // リセット実行
    const result = resetGameState(storage);

    expect(result.balance).toBe(GAME_CONSTANTS.INITIAL_BALANCE);
    expect(result.totalSpent).toBe(0);
    expect(result.totalDraws).toBe(0);
    expect(result.isFirstVisit).toBe(true);
  });

  it('リセット後、ストレージから読み込んでも初期値が返る', () => {
    const storage = createMockStorage();

    // 非初期値を保存
    const oldState = createGameState({ balance: 500, totalTickets: 50 });
    saveGameState(storage, oldState);

    // リセット
    resetGameState(storage);

    // 読み込み
    const loaded = loadGameState(storage);
    expect(loaded.balance).toBe(GAME_CONSTANTS.INITIAL_BALANCE);
    expect(loaded.totalTickets).toBe(0);
  });

  it('ストレージが空の状態でリセットしてもエラーにならない', () => {
    const storage = createMockStorage();

    expect(() => resetGameState(storage)).not.toThrow();

    const result = resetGameState(storage);
    expect(result.balance).toBe(GAME_CONSTANTS.INITIAL_BALANCE);
  });
});
