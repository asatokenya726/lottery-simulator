/**
 * draw-history.ts の単体テスト
 *
 * DrawHistory CRUD + バリデーションの動作を検証する。
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  loadDrawHistory,
  addDrawHistory,
  clearDrawHistory,
  isDrawHistory,
  isDrawResult,
} from '@/data/draw-history';
import { GAME_CONSTANTS } from '@/config/game-constants';
import { createMockStorage } from '../helpers/mock-storage';
import {
  createDrawHistory,
  createDrawResult,
} from '../helpers/test-factories';

beforeEach(() => {
  vi.restoreAllMocks();
});

// ============================================================
// isDrawResult
// ============================================================

describe('isDrawResult', () => {
  it('正常なDrawResult（当選）に対してtrueを返す', () => {
    const result = createDrawResult({ prizeLevel: '6等', amount: 300 });
    expect(isDrawResult(result)).toBe(true);
  });

  it('正常なDrawResult（ハズレ: prizeLevel=null）に対してtrueを返す', () => {
    const result = createDrawResult({ prizeLevel: null, amount: 0 });
    expect(isDrawResult(result)).toBe(true);
  });

  it('amount が 0 でtrueを返す', () => {
    const result = createDrawResult({ amount: 0 });
    expect(isDrawResult(result)).toBe(true);
  });

  it('amount が負の場合falseを返す', () => {
    const result = createDrawResult({ amount: -100 });
    expect(isDrawResult(result)).toBe(false);
  });

  it('amount が Infinity の場合falseを返す', () => {
    const result = createDrawResult({ amount: Infinity });
    expect(isDrawResult(result)).toBe(false);
  });

  it('amount が NaN の場合falseを返す', () => {
    const result = createDrawResult({ amount: NaN });
    expect(isDrawResult(result)).toBe(false);
  });

  it('prizeLevel が数値の場合falseを返す', () => {
    const result = createDrawResult();
    (result as Record<string, unknown>).prizeLevel = 6;
    expect(isDrawResult(result)).toBe(false);
  });

  it('prizeLevel が空文字の場合falseを返す', () => {
    const result = createDrawResult({ prizeLevel: '' });
    expect(isDrawResult(result)).toBe(false);
  });

  it('フィールド欠損（amountなし）の場合falseを返す', () => {
    expect(isDrawResult({ prizeLevel: '1等' })).toBe(false);
  });

  it('フィールド欠損（prizeLevelなし）の場合falseを返す', () => {
    expect(isDrawResult({ amount: 300 })).toBe(false);
  });

  it('nullに対してfalseを返す', () => {
    expect(isDrawResult(null)).toBe(false);
  });

  it('undefinedに対してfalseを返す', () => {
    expect(isDrawResult(undefined)).toBe(false);
  });

  it('配列に対してfalseを返す', () => {
    expect(isDrawResult([1, 2])).toBe(false);
  });
});

// ============================================================
// isDrawHistory
// ============================================================

describe('isDrawHistory', () => {
  it('正常なDrawHistoryに対してtrueを返す', () => {
    const history = createDrawHistory();
    expect(isDrawHistory(history)).toBe(true);
  });

  it('当選を含むDrawHistoryに対してtrueを返す', () => {
    const history = createDrawHistory({
      totalWin: 300,
      results: [
        createDrawResult({ prizeLevel: '6等', amount: 300 }),
        ...Array.from({ length: 9 }, () => createDrawResult()),
      ],
    });
    expect(isDrawHistory(history)).toBe(true);
  });

  // --- id ---

  it('id が空文字の場合falseを返す', () => {
    const history = createDrawHistory({ id: '' });
    expect(isDrawHistory(history)).toBe(false);
  });

  it('id が数値の場合falseを返す', () => {
    const history = createDrawHistory();
    (history as Record<string, unknown>).id = 123;
    expect(isDrawHistory(history)).toBe(false);
  });

  // --- timestamp ---

  it('timestamp がパース不可能な文字列の場合falseを返す', () => {
    const history = createDrawHistory({ timestamp: 'not-a-date' });
    expect(isDrawHistory(history)).toBe(false);
  });

  it('timestamp が数値の場合falseを返す', () => {
    const history = createDrawHistory();
    (history as Record<string, unknown>).timestamp = 1234567890;
    expect(isDrawHistory(history)).toBe(false);
  });

  // --- cost ---

  it('cost が負の場合falseを返す', () => {
    const history = createDrawHistory({ cost: -1 });
    expect(isDrawHistory(history)).toBe(false);
  });

  it('cost が Infinity の場合falseを返す', () => {
    const history = createDrawHistory({ cost: Infinity });
    expect(isDrawHistory(history)).toBe(false);
  });

  // --- totalWin ---

  it('totalWin が負の場合falseを返す', () => {
    const history = createDrawHistory({ totalWin: -500 });
    expect(isDrawHistory(history)).toBe(false);
  });

  it('totalWin が Infinity の場合falseを返す', () => {
    const history = createDrawHistory({ totalWin: Infinity });
    expect(isDrawHistory(history)).toBe(false);
  });

  // --- results ---

  it('results が空配列の場合falseを返す', () => {
    const history = createDrawHistory({ results: [] });
    expect(isDrawHistory(history)).toBe(false);
  });

  it('results 内に不正な要素がある場合falseを返す', () => {
    const history = createDrawHistory({
      results: [
        createDrawResult(),
        { prizeLevel: 6, amount: 300 } as unknown as ReturnType<typeof createDrawResult>,
      ],
    });
    expect(isDrawHistory(history)).toBe(false);
  });

  it('results がオブジェクト（非配列）の場合falseを返す', () => {
    const history = createDrawHistory();
    (history as Record<string, unknown>).results = { 0: createDrawResult() };
    expect(isDrawHistory(history)).toBe(false);
  });

  // --- フィールド欠損 ---

  it('id フィールドが欠損している場合falseを返す', () => {
    const history = createDrawHistory();
    const { id: _id, ...rest } = history;
    void _id;
    expect(isDrawHistory(rest)).toBe(false);
  });

  it('timestamp フィールドが欠損している場合falseを返す', () => {
    const history = createDrawHistory();
    const { timestamp: _timestamp, ...rest } = history;
    void _timestamp;
    expect(isDrawHistory(rest)).toBe(false);
  });

  // --- null / undefined ---

  it('nullに対してfalseを返す', () => {
    expect(isDrawHistory(null)).toBe(false);
  });

  it('undefinedに対してfalseを返す', () => {
    expect(isDrawHistory(undefined)).toBe(false);
  });

  // --- ログ出力しないことの確認 ---

  it('isDrawHistoryはconsole.errorを呼ばない', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    isDrawHistory(null);
    isDrawHistory({ id: '', cost: -1 });

    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it('isDrawResultはconsole.errorを呼ばない', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    isDrawResult(null);
    isDrawResult({ amount: -1 });

    expect(consoleSpy).not.toHaveBeenCalled();
  });
});

// ============================================================
// loadDrawHistory
// ============================================================

describe('loadDrawHistory', () => {
  it('正常なデータを読み込める', () => {
    const draw1 = createDrawHistory({ id: 'draw-1' });
    const draw2 = createDrawHistory({ id: 'draw-2', cost: 3000 });
    const storage = createMockStorage({
      initialData: {
        drawHistory: JSON.stringify([draw1, draw2]),
      },
    });

    const result = loadDrawHistory(storage);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('draw-1');
    expect(result[1].id).toBe('draw-2');
  });

  it('データが存在しない場合、空配列を返す', () => {
    const storage = createMockStorage();

    const result = loadDrawHistory(storage);

    expect(result).toEqual([]);
  });

  it('空配列が保存されている場合、空配列を返す', () => {
    const storage = createMockStorage({
      initialData: {
        drawHistory: JSON.stringify([]),
      },
    });

    const result = loadDrawHistory(storage);

    expect(result).toEqual([]);
  });

  it('データが配列でない場合、空配列を返しconsole.errorを出力する', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const storage = createMockStorage({
      initialData: {
        drawHistory: JSON.stringify('not an array'),
      },
    });

    const result = loadDrawHistory(storage);

    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('配列ではありません')
    );
  });

  it('一部不正なエントリはスキップし、正常なエントリのみ返す', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const validDraw = createDrawHistory({ id: 'valid-1' });
    const invalidDraw = { id: '', cost: -1 }; // 不正

    const storage = createMockStorage({
      initialData: {
        drawHistory: JSON.stringify([validDraw, invalidDraw]),
      },
    });

    const result = loadDrawHistory(storage);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('valid-1');
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('不正なエントリ')
    );
  });

  it('全要素が不正な場合、空配列を返す', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const storage = createMockStorage({
      initialData: {
        drawHistory: JSON.stringify([
          { id: '', cost: -1 },
          { id: 123, cost: 'abc' },
        ]),
      },
    });

    const result = loadDrawHistory(storage);

    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('データ破損（JSONパース不可）の場合、空配列を返す', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const storage = createMockStorage();
    storage._errors.corruptedKeys = new Set(['drawHistory']);

    const result = loadDrawHistory(storage);

    expect(result).toEqual([]);
  });
});

// ============================================================
// addDrawHistory
// ============================================================

describe('addDrawHistory', () => {
  it('正常に履歴を追加できる', () => {
    const storage = createMockStorage();
    const existing = [createDrawHistory({ id: 'existing-1' })];
    const newDraw = createDrawHistory({ id: 'new-1' });

    const result = addDrawHistory(storage, existing, newDraw);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('existing-1');
    expect(result[1].id).toBe('new-1');
  });

  it('空配列に追加できる', () => {
    const storage = createMockStorage();
    const newDraw = createDrawHistory({ id: 'first-1' });

    const result = addDrawHistory(storage, [], newDraw);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('first-1');
  });

  it('99件に追加して100件になる（上限内）', () => {
    const storage = createMockStorage();
    const existing = Array.from({ length: 99 }, (_, i) =>
      createDrawHistory({ id: `draw-${i}` })
    );
    const newDraw = createDrawHistory({ id: 'draw-99' });

    const result = addDrawHistory(storage, existing, newDraw);

    expect(result).toHaveLength(100);
    expect(result[99].id).toBe('draw-99');
  });

  it('100件に追加するとFIFOで先頭が削除される', () => {
    const storage = createMockStorage();
    const existing = Array.from({ length: 100 }, (_, i) =>
      createDrawHistory({ id: `draw-${i}` })
    );
    const newDraw = createDrawHistory({ id: 'draw-100' });

    const result = addDrawHistory(storage, existing, newDraw);

    expect(result).toHaveLength(GAME_CONSTANTS.MAX_HISTORY);
    // 先頭のdraw-0が削除され、draw-1が先頭になる
    expect(result[0].id).toBe('draw-1');
    // 末尾が新しいエントリ
    expect(result[result.length - 1].id).toBe('draw-100');
  });

  it('Storageに保存される', () => {
    const storage = createMockStorage();
    const newDraw = createDrawHistory({ id: 'save-test' });

    addDrawHistory(storage, [], newDraw);

    const saved = storage._store.get('drawHistory');
    expect(saved).toBeDefined();
    const parsed = JSON.parse(saved!) as Array<{ id: string }>;
    expect(parsed).toHaveLength(1);
    expect(parsed[0].id).toBe('save-test');
  });

  it('元の配列を変更しない（immutability）', () => {
    const storage = createMockStorage();
    const existing = [createDrawHistory({ id: 'original' })];
    const originalLength = existing.length;
    const newDraw = createDrawHistory({ id: 'added' });

    const result = addDrawHistory(storage, existing, newDraw);

    // 元の配列は変更されない
    expect(existing).toHaveLength(originalLength);
    // 戻り値は新しい配列
    expect(result).not.toBe(existing);
    expect(result).toHaveLength(2);
  });

  it('Storage保存失敗時にconsole.errorを出力しスローしない', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const storage = createMockStorage();
    storage._errors.quotaExceeded = true;

    const newDraw = createDrawHistory({ id: 'fail-test' });

    expect(() => addDrawHistory(storage, [], newDraw)).not.toThrow();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('データ保存失敗'),
      expect.anything()
    );
  });
});

// ============================================================
// clearDrawHistory
// ============================================================

describe('clearDrawHistory', () => {
  it('全履歴を削除できる', () => {
    const storage = createMockStorage();
    const draws = [createDrawHistory({ id: 'to-delete' })];
    addDrawHistory(storage, [], draws[0]);

    // 保存されていることを確認
    expect(storage._store.has('drawHistory')).toBe(true);

    clearDrawHistory(storage);

    // 削除されていることを確認
    expect(storage._store.has('drawHistory')).toBe(false);
  });

  it('空の状態でクリアしてもエラーにならない', () => {
    const storage = createMockStorage();

    expect(() => clearDrawHistory(storage)).not.toThrow();
  });

  it('クリア後にloadするとき空配列が返る', () => {
    const storage = createMockStorage();
    const draw = createDrawHistory({ id: 'to-clear' });
    addDrawHistory(storage, [], draw);

    clearDrawHistory(storage);

    const result = loadDrawHistory(storage);
    expect(result).toEqual([]);
  });
});
