/**
 * storage.ts の単体テスト
 *
 * LocalStorageラッパー（createStorage）の動作を検証する。
 * テスト環境: jsdom（localStorage利用可能）
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createStorage } from '@/data/storage';

describe('createStorage', () => {
  beforeEach(() => {
    // 各テスト前にLocalStorageをクリア
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================================
  // 正常系: LocalStorage利用可能時
  // ============================================================

  describe('LocalStorage利用可能時', () => {
    it('isAvailableがtrueを返す', () => {
      const storage = createStorage();
      expect(storage.isAvailable).toBe(true);
    });

    it('set/getで値を保存・取得できる', () => {
      const storage = createStorage();
      storage.set('testKey', { name: 'test', value: 42 });

      const result = storage.get<{ name: string; value: number }>('testKey');
      expect(result).toEqual({ name: 'test', value: 42 });
    });

    it('存在しないキーのgetはnullを返す', () => {
      const storage = createStorage();
      const result = storage.get('nonExistent');
      expect(result).toBeNull();
    });

    it('文字列値を正しく保存・取得できる', () => {
      const storage = createStorage();
      storage.set('strKey', 'hello');

      const result = storage.get<string>('strKey');
      expect(result).toBe('hello');
    });

    it('数値を正しく保存・取得できる', () => {
      const storage = createStorage();
      storage.set('numKey', 12345);

      const result = storage.get<number>('numKey');
      expect(result).toBe(12345);
    });

    it('配列を正しく保存・取得できる', () => {
      const storage = createStorage();
      const data = [1, 2, 3, 'four'];
      storage.set('arrKey', data);

      const result = storage.get<(number | string)[]>('arrKey');
      expect(result).toEqual([1, 2, 3, 'four']);
    });

    it('null値を正しく保存・取得できる', () => {
      const storage = createStorage();
      storage.set('nullKey', null);

      const result = storage.get('nullKey');
      expect(result).toBeNull();
    });

    it('removeでキーを削除できる', () => {
      const storage = createStorage();
      storage.set('removeMe', 'value');
      expect(storage.get('removeMe')).toBe('value');

      storage.remove('removeMe');
      expect(storage.get('removeMe')).toBeNull();
    });

    it('存在しないキーのremoveはエラーにならない', () => {
      const storage = createStorage();
      expect(() => storage.remove('nonExistent')).not.toThrow();
    });

    it('LocalStorageにプレフィックス付きで保存される', () => {
      const storage = createStorage();
      storage.set('myKey', 'myValue');

      // 直接LocalStorageを確認
      const raw = window.localStorage.getItem('lottery-sim:myKey');
      expect(raw).toBe('"myValue"');
    });
  });

  // ============================================================
  // clear() のプレフィックスフィルタリング
  // ============================================================

  describe('clear()', () => {
    it('lottery-sim:プレフィックスのキーのみ削除する', () => {
      const storage = createStorage();

      // lottery-sim:プレフィックスのデータを保存
      storage.set('gameState', { balance: 100 });
      storage.set('drawHistory', []);

      // 他アプリのデータを直接保存（プレフィックスなし）
      window.localStorage.setItem('other-app:data', 'keep-me');
      window.localStorage.setItem('unrelated', 'also-keep');

      storage.clear();

      // lottery-sim:キーは削除されている
      expect(window.localStorage.getItem('lottery-sim:gameState')).toBeNull();
      expect(window.localStorage.getItem('lottery-sim:drawHistory')).toBeNull();

      // 他アプリのデータは残っている
      expect(window.localStorage.getItem('other-app:data')).toBe('keep-me');
      expect(window.localStorage.getItem('unrelated')).toBe('also-keep');
    });

    it('lottery-sim:キーが存在しない場合もエラーにならない', () => {
      const storage = createStorage();
      expect(() => storage.clear()).not.toThrow();
    });
  });

  // ============================================================
  // JSONパース失敗
  // ============================================================

  describe('JSONパース失敗時', () => {
    it('不正なJSONデータに対してnullを返しconsole.errorを出力する', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // 不正なJSONを直接LocalStorageに書き込む
      window.localStorage.setItem('lottery-sim:corrupt', '{invalid json}');

      const storage = createStorage();
      const result = storage.get('corrupt');

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('JSONパース失敗'),
        expect.anything()
      );
    });
  });

  // ============================================================
  // 容量超過（QuotaExceededError）
  // ============================================================

  describe('容量超過時', () => {
    it('set時にQuotaExceededErrorが発生してもスローしない', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // setItemをモックしてQuotaExceededErrorをスロー
      vi.spyOn(window.localStorage.__proto__, 'setItem').mockImplementation(
        (...args: unknown[]) => {
          const key = args[0] as string;
          // 利用可否判定のテスト書き込みは通す
          if (key.includes('__storage_test__')) {
            return;
          }
          throw new DOMException('QuotaExceededError', 'QuotaExceededError');
        }
      );

      const storage = createStorage();

      // エラーがスローされないことを確認
      expect(() => storage.set('bigData', 'x'.repeat(1000))).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('データ保存失敗'),
        expect.anything()
      );
    });
  });

  // ============================================================
  // LocalStorage非対応時（メモリフォールバック）
  // ============================================================

  describe('LocalStorage非対応時（メモリフォールバック）', () => {
    it('isAvailableがfalseを返す', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // LocalStorageを利用不可にする
      vi.spyOn(window.localStorage.__proto__, 'setItem').mockImplementation(
        () => {
          throw new Error('SecurityError');
        }
      );

      const storage = createStorage();
      expect(storage.isAvailable).toBe(false);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('LocalStorage利用不可')
      );
    });

    it('メモリフォールバックでset/getが動作する', () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.spyOn(window.localStorage.__proto__, 'setItem').mockImplementation(
        () => {
          throw new Error('SecurityError');
        }
      );

      const storage = createStorage();
      storage.set('memKey', { data: 'memory' });

      const result = storage.get<{ data: string }>('memKey');
      expect(result).toEqual({ data: 'memory' });
    });

    it('メモリフォールバックでremoveが動作する', () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.spyOn(window.localStorage.__proto__, 'setItem').mockImplementation(
        () => {
          throw new Error('SecurityError');
        }
      );

      const storage = createStorage();
      storage.set('removeMe', 'value');
      expect(storage.get('removeMe')).toBe('value');

      storage.remove('removeMe');
      expect(storage.get('removeMe')).toBeNull();
    });

    it('メモリフォールバックのclearでプレフィックス付きキーのみ削除する', () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.spyOn(window.localStorage.__proto__, 'setItem').mockImplementation(
        () => {
          throw new Error('SecurityError');
        }
      );

      const storage = createStorage();
      storage.set('key1', 'value1');
      storage.set('key2', 'value2');

      storage.clear();

      expect(storage.get('key1')).toBeNull();
      expect(storage.get('key2')).toBeNull();
    });

    it('メモリフォールバックのget: 存在しないキーはnullを返す', () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.spyOn(window.localStorage.__proto__, 'setItem').mockImplementation(
        () => {
          throw new Error('SecurityError');
        }
      );

      const storage = createStorage();
      expect(storage.get('nonExistent')).toBeNull();
    });
  });

  // ============================================================
  // SSR環境（windowなし）
  // ============================================================

  describe('SSR環境シミュレーション', () => {
    it('windowが未定義の場合はメモリフォールバックを使用する', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // windowのtypeof判定をシミュレートするため、
      // checkLocalStorageAvailabilityが使うsetItemをエラーにする
      const originalWindow = globalThis.window;

      // @ts-expect-error -- テスト目的でwindowを一時的にundefinedにする
      delete globalThis.window;

      try {
        const storage = createStorage();
        expect(storage.isAvailable).toBe(false);
        expect(warnSpy).toHaveBeenCalledWith(
          expect.stringContaining('LocalStorage利用不可')
        );
      } finally {
        // windowを復元
        globalThis.window = originalWindow;
      }
    });
  });
});
