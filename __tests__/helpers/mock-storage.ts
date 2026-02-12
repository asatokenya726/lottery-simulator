/**
 * テスト用モック Storage
 *
 * Storage型準拠のMapベースin-memory実装。
 * エラーシミュレーション機能付き。
 */

import type { Storage } from '@/types';

/** モックStorageのオプション */
type MockStorageOptions = {
  /** 初期データ（キー: JSON文字列化済みの値） */
  initialData?: Record<string, string>;
  /** isAvailableの値（デフォルト: true） */
  isAvailable?: boolean;
};

/** エラーシミュレーション設定 */
type ErrorSimulation = {
  /** get時にパース不可能なデータを返す */
  corruptedKeys?: Set<string>;
  /** set時にQuotaExceededErrorをスローする */
  quotaExceeded?: boolean;
};

/**
 * テスト用モックStorageを作成する
 *
 * テスト内で直接Mapの中身を確認・操作できる。
 */
export function createMockStorage(
  options: MockStorageOptions = {}
): Storage & {
  /** 内部ストアへの直接アクセス（テスト検証用） */
  _store: Map<string, string>;
  /** エラーシミュレーション設定 */
  _errors: ErrorSimulation;
} {
  const { initialData = {}, isAvailable = true } = options;

  const store = new Map<string, string>(Object.entries(initialData));
  const errors: ErrorSimulation = {};

  return {
    _store: store,
    _errors: errors,

    get<T>(key: string): T | null {
      // 破損データシミュレーション
      if (errors.corruptedKeys?.has(key)) {
        const raw = '{invalid json';
        try {
          return JSON.parse(raw) as T;
        } catch (e) {
          console.error(`JSONパース失敗 (key: ${key}):`, e);
          return null;
        }
      }

      const raw = store.get(key);
      if (raw === undefined) {
        return null;
      }

      try {
        return JSON.parse(raw) as T;
      } catch (e) {
        console.error(`JSONパース失敗 (key: ${key}):`, e);
        return null;
      }
    },

    set<T>(key: string, value: T): void {
      // 容量超過シミュレーション
      if (errors.quotaExceeded) {
        const error = new DOMException(
          'QuotaExceededError',
          'QuotaExceededError'
        );
        console.error(`データ保存失敗 (key: ${key}):`, error);
        return;
      }

      store.set(key, JSON.stringify(value));
    },

    remove(key: string): void {
      store.delete(key);
    },

    clear(): void {
      store.clear();
    },

    isAvailable,
  };
}
