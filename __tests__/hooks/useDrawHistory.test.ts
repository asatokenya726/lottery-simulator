/**
 * useDrawHistory フックの単体テスト
 *
 * renderHook + act を使い、抽選履歴管理の全メソッドを検証する。
 * Storage は mock-storage を使用する。
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { GAME_CONSTANTS } from '@/config/game-constants';
import { createDrawHistory } from '../helpers/test-factories';

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

// useDrawHistory のインポートはモック設定後に行う
import { useDrawHistory } from '@/hooks/useDrawHistory';

beforeEach(() => {
  vi.restoreAllMocks();
  mockStorage._store.clear();
});

// ============================================================
// 初期ロード
// ============================================================

describe('初期ロード', () => {
  it('Storage にデータがない場合、空配列を返す', () => {
    const { result } = renderHook(() => useDrawHistory());

    expect(result.current.drawHistory).toEqual([]);
    expect(result.current.latestDraw).toBeNull();
  });

  it('Storage に既存データがある場合、それを読み込む', () => {
    const existing = [
      createDrawHistory({ id: 'h-1' }),
      createDrawHistory({ id: 'h-2' }),
    ];
    mockStorage.set('drawHistory', existing);

    const { result } = renderHook(() => useDrawHistory());

    expect(result.current.drawHistory).toHaveLength(2);
    expect(result.current.drawHistory[0].id).toBe('h-1');
    expect(result.current.drawHistory[1].id).toBe('h-2');
  });
});

// ============================================================
// addDraw
// ============================================================

describe('addDraw', () => {
  it('新しい履歴を追加できる', () => {
    const { result } = renderHook(() => useDrawHistory());
    const newDraw = createDrawHistory({ id: 'new-1', cost: 3000 });

    act(() => {
      result.current.addDraw(newDraw);
    });

    expect(result.current.drawHistory).toHaveLength(1);
    expect(result.current.drawHistory[0].id).toBe('new-1');
  });

  it('追加後に Storage に保存される', () => {
    const { result } = renderHook(() => useDrawHistory());
    const newDraw = createDrawHistory({ id: 'save-1' });

    act(() => {
      result.current.addDraw(newDraw);
    });

    const savedRaw = mockStorage._store.get('drawHistory');
    expect(savedRaw).toBeDefined();
    const saved = JSON.parse(savedRaw!);
    expect(saved).toHaveLength(1);
    expect(saved[0].id).toBe('save-1');
  });

  it('連続追加で履歴が累積される', () => {
    const { result } = renderHook(() => useDrawHistory());

    act(() => {
      result.current.addDraw(createDrawHistory({ id: 'seq-1' }));
    });

    act(() => {
      result.current.addDraw(createDrawHistory({ id: 'seq-2' }));
    });

    act(() => {
      result.current.addDraw(createDrawHistory({ id: 'seq-3' }));
    });

    expect(result.current.drawHistory).toHaveLength(3);
    expect(result.current.drawHistory[0].id).toBe('seq-1');
    expect(result.current.drawHistory[2].id).toBe('seq-3');
  });

  it('FIFO: MAX_HISTORY件を超えると古い履歴が削除される', () => {
    // MAX_HISTORY件の履歴をセット
    const existing = Array.from({ length: GAME_CONSTANTS.MAX_HISTORY }, (_, i) =>
      createDrawHistory({ id: `old-${i}` })
    );
    mockStorage.set('drawHistory', existing);

    const { result } = renderHook(() => useDrawHistory());

    // もう1件追加 → 先頭（old-0）が切り落とされる
    act(() => {
      result.current.addDraw(createDrawHistory({ id: 'new-overflow' }));
    });

    expect(result.current.drawHistory).toHaveLength(
      GAME_CONSTANTS.MAX_HISTORY
    );
    // 先頭が old-1 になっている（old-0 が削除された）
    expect(result.current.drawHistory[0].id).toBe('old-1');
    // 末尾が new-overflow
    expect(
      result.current.drawHistory[GAME_CONSTANTS.MAX_HISTORY - 1].id
    ).toBe('new-overflow');
  });
});

// ============================================================
// latestDraw
// ============================================================

describe('latestDraw', () => {
  it('履歴が空の場合 null を返す', () => {
    const { result } = renderHook(() => useDrawHistory());

    expect(result.current.latestDraw).toBeNull();
  });

  it('履歴がある場合、末尾の要素を返す', () => {
    const existing = [
      createDrawHistory({ id: 'first' }),
      createDrawHistory({ id: 'latest' }),
    ];
    mockStorage.set('drawHistory', existing);

    const { result } = renderHook(() => useDrawHistory());

    expect(result.current.latestDraw).not.toBeNull();
    expect(result.current.latestDraw!.id).toBe('latest');
  });

  it('addDraw 後に最新の履歴を反映する', () => {
    const { result } = renderHook(() => useDrawHistory());

    act(() => {
      result.current.addDraw(createDrawHistory({ id: 'added-latest' }));
    });

    expect(result.current.latestDraw).not.toBeNull();
    expect(result.current.latestDraw!.id).toBe('added-latest');
  });
});

// ============================================================
// clearHistory
// ============================================================

describe('clearHistory', () => {
  it('全履歴が削除される', () => {
    const existing = [
      createDrawHistory({ id: 'c-1' }),
      createDrawHistory({ id: 'c-2' }),
    ];
    mockStorage.set('drawHistory', existing);

    const { result } = renderHook(() => useDrawHistory());

    expect(result.current.drawHistory).toHaveLength(2);

    act(() => {
      result.current.clearHistory();
    });

    expect(result.current.drawHistory).toEqual([]);
    expect(result.current.latestDraw).toBeNull();
  });

  it('Storage からも削除される', () => {
    mockStorage.set('drawHistory', [createDrawHistory()]);

    const { result } = renderHook(() => useDrawHistory());

    act(() => {
      result.current.clearHistory();
    });

    expect(mockStorage.get('drawHistory')).toBeNull();
  });

  it('削除後に再度追加できる', () => {
    mockStorage.set('drawHistory', [createDrawHistory({ id: 'before' })]);

    const { result } = renderHook(() => useDrawHistory());

    act(() => {
      result.current.clearHistory();
    });

    act(() => {
      result.current.addDraw(createDrawHistory({ id: 'after-clear' }));
    });

    expect(result.current.drawHistory).toHaveLength(1);
    expect(result.current.drawHistory[0].id).toBe('after-clear');
  });
});
