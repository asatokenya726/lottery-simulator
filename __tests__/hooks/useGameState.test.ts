/**
 * useGameState フックの単体テスト
 *
 * renderHook + act を使い、ゲーム状態管理の全メソッドを検証する。
 * Storage は mock-storage を使用し、乱数は vi.spyOn で固定する。
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { GAME_CONSTANTS } from '@/config/game-constants';
import { DEFAULT_CONFIG } from '@/config/prize-config';
import { calculateDrawCost } from '@/lib/currency-manager';
import { createGameState } from '../helpers/test-factories';

// モジュールモック: createStorage をモックし、テストごとにモックStorageを注入する
const mockStorage = {
  _store: new Map<string, string>(),
  get<T>(key: string): T | null {
    const raw = this._store.get(key);
    if (raw === undefined) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
  set<T>(key: string, value: T): void {
    this._store.set(key, JSON.stringify(value));
  },
  remove(key: string): void {
    this._store.delete(key);
  },
  clear(): void {
    this._store.clear();
  },
  isAvailable: true,
};

vi.mock('@/data/storage', () => ({
  createStorage: () => mockStorage,
}));

// useGameState のインポートはモック設定後に行う
import { useGameState } from '@/hooks/useGameState';

/** 10連ガチャ1回分の費用 */
const DRAW_COST = calculateDrawCost(
  DEFAULT_CONFIG.ticketPrice,
  GAME_CONSTANTS.DRAW_COUNT
);

beforeEach(() => {
  vi.restoreAllMocks();
  mockStorage._store.clear();
  // 時刻を固定（2026-03-01 09:00:00 JST = 2026-03-01 00:00:00 UTC）
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-03-01T00:00:00.000Z'));
});

afterEach(() => {
  vi.useRealTimers();
});

// ============================================================
// 初期ロード
// ============================================================

describe('初期ロード', () => {
  it('Storage にデータがない場合、初期 GameState を返す', () => {
    const { result } = renderHook(() => useGameState());

    expect(result.current.gameState.balance).toBe(
      GAME_CONSTANTS.INITIAL_BALANCE
    );
    expect(result.current.gameState.totalSpent).toBe(0);
    expect(result.current.gameState.totalWon).toBe(0);
    expect(result.current.gameState.totalTickets).toBe(0);
    expect(result.current.gameState.totalDraws).toBe(0);
    expect(result.current.gameState.winCountByLevel).toEqual({});
    expect(result.current.gameState.isFirstVisit).toBe(true);
  });

  it('Storage に既存データがある場合、それを読み込む', () => {
    const savedState = createGameState({
      balance: 50_000,
      totalDraws: 5,
      totalSpent: 15_000,
      isFirstVisit: false,
    });
    mockStorage.set('gameState', savedState);

    const { result } = renderHook(() => useGameState());

    expect(result.current.gameState.balance).toBe(50_000);
    expect(result.current.gameState.totalDraws).toBe(5);
    expect(result.current.gameState.totalSpent).toBe(15_000);
    expect(result.current.gameState.isFirstVisit).toBe(false);
  });
});

// ============================================================
// executeDraw
// ============================================================

describe('executeDraw', () => {
  it('残高差し引き、抽選実行、当選金加算、統計更新、保存が行われる', () => {
    // 乱数固定: 全てハズレ（miss の weight が最大なので、ほぼどの値でもハズレ）
    // miss の累積重み: 2,222,610 〜 20,000,000 の区間
    // random = 0.9 → target = 18,000,000 → miss
    vi.spyOn(Math, 'random').mockReturnValue(0.9);

    const { result } = renderHook(() => useGameState());

    let drawResults: ReturnType<typeof result.current.executeDraw>;
    act(() => {
      drawResults = result.current.executeDraw();
    });

    // 10枚分の結果が返る
    expect(drawResults!).toHaveLength(GAME_CONSTANTS.DRAW_COUNT);

    // 全てハズレ（random=0.9 は miss の区間）
    for (const r of drawResults!) {
      expect(r.prizeLevel).toBeNull();
      expect(r.amount).toBe(0);
    }

    // 残高: 初期100,000 - 3,000（10枚x300） + 0（当選金） = 97,000
    expect(result.current.gameState.balance).toBe(
      GAME_CONSTANTS.INITIAL_BALANCE - DRAW_COST
    );

    // 統計が更新されている
    expect(result.current.gameState.totalSpent).toBe(DRAW_COST);
    expect(result.current.gameState.totalWon).toBe(0);
    expect(result.current.gameState.totalTickets).toBe(
      GAME_CONSTANTS.DRAW_COUNT
    );
    expect(result.current.gameState.totalDraws).toBe(1);

    // Storageに保存されている
    const savedRaw = mockStorage._store.get('gameState');
    expect(savedRaw).toBeDefined();
    const saved = JSON.parse(savedRaw!);
    expect(saved.balance).toBe(GAME_CONSTANTS.INITIAL_BALANCE - DRAW_COST);
  });

  it('当選時に当選金が加算され winCountByLevel が更新される', () => {
    // 7等（300ぃえん）に当選させる: weight 累積 222,610 〜 2,222,610
    // random = 0.11 → target = 2,200,000 → 7th の区間に入る
    // 全10回とも同じ値を返す
    vi.spyOn(Math, 'random').mockReturnValue(0.11);

    const { result } = renderHook(() => useGameState());

    let drawResults: ReturnType<typeof result.current.executeDraw>;
    act(() => {
      drawResults = result.current.executeDraw();
    });

    // 10枚分の結果が返る
    expect(drawResults!).toHaveLength(GAME_CONSTANTS.DRAW_COUNT);

    // 全て7等（300ぃえん）
    for (const r of drawResults!) {
      expect(r.prizeLevel).toBe('7th');
      expect(r.amount).toBe(300);
    }

    // 当選金: 300 x 10 = 3,000
    const totalWin = 300 * GAME_CONSTANTS.DRAW_COUNT;
    // 残高: 100,000 - 3,000 + 3,000 = 100,000
    expect(result.current.gameState.balance).toBe(
      GAME_CONSTANTS.INITIAL_BALANCE - DRAW_COST + totalWin
    );
    expect(result.current.gameState.totalWon).toBe(totalWin);

    // winCountByLevel が更新されている
    expect(result.current.gameState.winCountByLevel['7th']).toBe(
      GAME_CONSTANTS.DRAW_COUNT
    );
  });

  it('残高不足時は空配列を返し、状態が変わらない', () => {
    // 残高をDRAW_COST未満にセット
    const lowBalanceState = createGameState({ balance: DRAW_COST - 1 });
    mockStorage.set('gameState', lowBalanceState);

    const { result } = renderHook(() => useGameState());

    let drawResults: ReturnType<typeof result.current.executeDraw>;
    act(() => {
      drawResults = result.current.executeDraw();
    });

    // 空配列が返る
    expect(drawResults!).toEqual([]);

    // 状態が変わっていない
    expect(result.current.gameState.balance).toBe(DRAW_COST - 1);
    expect(result.current.gameState.totalDraws).toBe(0);
  });

  it('連続実行で統計が累積される', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9); // 全ハズレ

    const { result } = renderHook(() => useGameState());

    // 1回目
    act(() => {
      result.current.executeDraw();
    });

    // 2回目
    act(() => {
      result.current.executeDraw();
    });

    expect(result.current.gameState.totalDraws).toBe(2);
    expect(result.current.gameState.totalSpent).toBe(DRAW_COST * 2);
    expect(result.current.gameState.totalTickets).toBe(
      GAME_CONSTANTS.DRAW_COUNT * 2
    );
    expect(result.current.gameState.balance).toBe(
      GAME_CONSTANTS.INITIAL_BALANCE - DRAW_COST * 2
    );
  });

  it('updatedAt が更新される', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9);

    const { result } = renderHook(() => useGameState());
    const beforeUpdatedAt = result.current.gameState.updatedAt;

    // 時刻を進める
    vi.setSystemTime(new Date('2026-03-01T01:00:00.000Z'));

    act(() => {
      result.current.executeDraw();
    });

    expect(result.current.gameState.updatedAt).not.toBe(beforeUpdatedAt);
    expect(result.current.gameState.updatedAt).toBe(
      '2026-03-01T01:00:00.000Z'
    );
  });
});

// ============================================================
// canDraw
// ============================================================

describe('canDraw', () => {
  it('残高が十分な場合 true を返す', () => {
    const { result } = renderHook(() => useGameState());

    expect(result.current.canDraw).toBe(true);
  });

  it('残高がちょうど購入額の場合 true を返す', () => {
    const exactState = createGameState({ balance: DRAW_COST });
    mockStorage.set('gameState', exactState);

    const { result } = renderHook(() => useGameState());

    expect(result.current.canDraw).toBe(true);
  });

  it('残高が購入額未満の場合 false を返す', () => {
    const lowState = createGameState({ balance: DRAW_COST - 1 });
    mockStorage.set('gameState', lowState);

    const { result } = renderHook(() => useGameState());

    expect(result.current.canDraw).toBe(false);
  });

  it('残高が 0 の場合 false を返す', () => {
    const zeroState = createGameState({ balance: 0 });
    mockStorage.set('gameState', zeroState);

    const { result } = renderHook(() => useGameState());

    expect(result.current.canDraw).toBe(false);
  });

  it('executeDraw 後に残高に応じて更新される', () => {
    // 残高をちょうど1回分にセット
    vi.spyOn(Math, 'random').mockReturnValue(0.9); // 全ハズレ

    const exactState = createGameState({ balance: DRAW_COST });
    mockStorage.set('gameState', exactState);

    const { result } = renderHook(() => useGameState());

    expect(result.current.canDraw).toBe(true);

    act(() => {
      result.current.executeDraw();
    });

    // 全ハズレなので残高は0になる
    expect(result.current.gameState.balance).toBe(0);
    expect(result.current.canDraw).toBe(false);
  });
});

// ============================================================
// checkAndRefill
// ============================================================

describe('checkAndRefill', () => {
  it('条件を満たす場合、補給が実行されて true を返す', () => {
    // 昨日の日付で残高が閾値未満
    const state = createGameState({
      balance: GAME_CONSTANTS.REFILL_THRESHOLD - 1,
      lastRefillDate: '2026-02-28',
    });
    mockStorage.set('gameState', state);

    const { result } = renderHook(() => useGameState());

    let refilled: boolean;
    act(() => {
      refilled = result.current.checkAndRefill();
    });

    expect(refilled!).toBe(true);
    expect(result.current.gameState.balance).toBe(
      GAME_CONSTANTS.REFILL_THRESHOLD - 1 + GAME_CONSTANTS.REFILL_AMOUNT
    );
    expect(result.current.gameState.lastRefillDate).toMatch(
      /^\d{4}-\d{2}-\d{2}$/
    );
  });

  it('同日の場合、補給されずに false を返す', () => {
    // formatDateToYMD(new Date('2026-03-01T00:00:00.000Z')) はTZ依存
    // fakeTimers で 2026-03-01 に固定しているので、その日のYMDを設定
    const today = new Date('2026-03-01T00:00:00.000Z');
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    const state = createGameState({
      balance: 0,
      lastRefillDate: todayStr,
    });
    mockStorage.set('gameState', state);

    const { result } = renderHook(() => useGameState());

    let refilled: boolean;
    act(() => {
      refilled = result.current.checkAndRefill();
    });

    expect(refilled!).toBe(false);
    expect(result.current.gameState.balance).toBe(0);
  });

  it('残高が閾値以上の場合、補給されずに false を返す', () => {
    const state = createGameState({
      balance: GAME_CONSTANTS.REFILL_THRESHOLD,
      lastRefillDate: '2026-02-28',
    });
    mockStorage.set('gameState', state);

    const { result } = renderHook(() => useGameState());

    let refilled: boolean;
    act(() => {
      refilled = result.current.checkAndRefill();
    });

    expect(refilled!).toBe(false);
    expect(result.current.gameState.balance).toBe(
      GAME_CONSTANTS.REFILL_THRESHOLD
    );
  });

  it('補給後に Storage に保存される', () => {
    const state = createGameState({
      balance: 0,
      lastRefillDate: '2026-02-28',
    });
    mockStorage.set('gameState', state);

    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.checkAndRefill();
    });

    // Storage に保存されていることを確認
    const savedRaw = mockStorage._store.get('gameState');
    expect(savedRaw).toBeDefined();
    const saved = JSON.parse(savedRaw!);
    expect(saved.balance).toBe(GAME_CONSTANTS.REFILL_AMOUNT);
  });
});

// ============================================================
// resetAll
// ============================================================

describe('resetAll', () => {
  it('GameState が初期値にリセットされる', () => {
    // まず非初期値を保存
    const modifiedState = createGameState({
      balance: 1_000,
      totalDraws: 99,
      totalSpent: 297_000,
      isFirstVisit: false,
    });
    mockStorage.set('gameState', modifiedState);

    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.resetAll();
    });

    expect(result.current.gameState.balance).toBe(
      GAME_CONSTANTS.INITIAL_BALANCE
    );
    expect(result.current.gameState.totalDraws).toBe(0);
    expect(result.current.gameState.totalSpent).toBe(0);
    expect(result.current.gameState.isFirstVisit).toBe(true);
  });

  it('DrawHistory も削除される', () => {
    // DrawHistory を Storage に保存
    mockStorage.set('drawHistory', [
      { id: '1', timestamp: '2026-01-01T00:00:00Z', cost: 3000, totalWin: 0, results: [] },
    ]);

    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.resetAll();
    });

    // drawHistory キーが Storage から削除されている
    expect(mockStorage.get('drawHistory')).toBeNull();
  });

  it('リセット後に canDraw が true になる', () => {
    const emptyState = createGameState({ balance: 0 });
    mockStorage.set('gameState', emptyState);

    const { result } = renderHook(() => useGameState());

    expect(result.current.canDraw).toBe(false);

    act(() => {
      result.current.resetAll();
    });

    expect(result.current.canDraw).toBe(true);
  });
});

// ============================================================
// dismissFirstVisit
// ============================================================

describe('dismissFirstVisit', () => {
  it('isFirstVisit を false に更新する', () => {
    const { result } = renderHook(() => useGameState());

    expect(result.current.gameState.isFirstVisit).toBe(true);

    act(() => {
      result.current.dismissFirstVisit();
    });

    expect(result.current.gameState.isFirstVisit).toBe(false);
  });

  it('他のフィールドは変更されない', () => {
    const { result } = renderHook(() => useGameState());
    const balanceBefore = result.current.gameState.balance;
    const totalDrawsBefore = result.current.gameState.totalDraws;

    act(() => {
      result.current.dismissFirstVisit();
    });

    expect(result.current.gameState.balance).toBe(balanceBefore);
    expect(result.current.gameState.totalDraws).toBe(totalDrawsBefore);
  });

  it('Storage に保存される', () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.dismissFirstVisit();
    });

    const savedRaw = mockStorage._store.get('gameState');
    expect(savedRaw).toBeDefined();
    const saved = JSON.parse(savedRaw!);
    expect(saved.isFirstVisit).toBe(false);
  });

  it('updatedAt が更新される', () => {
    const { result } = renderHook(() => useGameState());
    const beforeUpdatedAt = result.current.gameState.updatedAt;

    vi.setSystemTime(new Date('2026-03-01T05:00:00.000Z'));

    act(() => {
      result.current.dismissFirstVisit();
    });

    expect(result.current.gameState.updatedAt).not.toBe(beforeUpdatedAt);
  });
});

// ============================================================
// isStorageAvailable
// ============================================================

describe('isStorageAvailable', () => {
  it('Storage の isAvailable を反映する', () => {
    const { result } = renderHook(() => useGameState());

    // mockStorage.isAvailable は true に設定されている
    expect(result.current.isStorageAvailable).toBe(true);
  });
});
