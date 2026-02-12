/**
 * LocalStorageラッパー
 *
 * LocalStorage利用可否を判定し、利用不可時はメモリフォールバックで動作する。
 * api-design.md セクション2-1 / error-handling.md STORAGE分類 に準拠。
 */

import type { Storage } from '@/types';
import { GAME_CONSTANTS } from '@/config/game-constants';

/** LocalStorageキーのプレフィックス付きセパレータ */
const PREFIX = `${GAME_CONSTANTS.STORAGE_PREFIX}:`;

/**
 * LocalStorageが利用可能かを判定する
 *
 * 実際に書き込み・削除を試行して確認する。
 * SecurityError（プライベートブラウジング等）やLocalStorage非対応環境を検出。
 */
function checkLocalStorageAvailability(): boolean {
  // SSR環境ではwindowが存在しない
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const testKey = `${PREFIX}__storage_test__`;
    window.localStorage.setItem(testKey, 'test');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * メモリベースのフォールバックStorage実装を生成する
 *
 * LocalStorage非対応環境で使用。セッション中のみデータを保持。
 */
function createMemoryStorage(): Storage {
  const store = new Map<string, string>();

  return {
    get<T>(key: string): T | null {
      const prefixedKey = `${PREFIX}${key}`;
      const raw = store.get(prefixedKey);
      if (raw === undefined) {
        return null;
      }

      try {
        return JSON.parse(raw) as T;
      } catch (e) {
        console.error(`JSONパース失敗 (key: ${prefixedKey}):`, e);
        return null;
      }
    },

    set<T>(key: string, value: T): void {
      const prefixedKey = `${PREFIX}${key}`;
      try {
        store.set(prefixedKey, JSON.stringify(value));
      } catch (e) {
        console.error(`データ保存失敗 (key: ${prefixedKey}):`, e);
      }
    },

    remove(key: string): void {
      const prefixedKey = `${PREFIX}${key}`;
      store.delete(prefixedKey);
    },

    clear(): void {
      // プレフィックスに一致するキーのみ削除
      for (const k of Array.from(store.keys())) {
        if (k.startsWith(PREFIX)) {
          store.delete(k);
        }
      }
    },

    isAvailable: false,
  };
}

/**
 * LocalStorageベースのStorage実装を生成する
 */
function createLocalStorage(): Storage {
  return {
    get<T>(key: string): T | null {
      const prefixedKey = `${PREFIX}${key}`;
      try {
        const raw = window.localStorage.getItem(prefixedKey);
        if (raw === null) {
          return null;
        }
        return JSON.parse(raw) as T;
      } catch (e) {
        console.error(`JSONパース失敗 (key: ${prefixedKey}):`, e);
        return null;
      }
    },

    set<T>(key: string, value: T): void {
      const prefixedKey = `${PREFIX}${key}`;
      try {
        window.localStorage.setItem(prefixedKey, JSON.stringify(value));
      } catch (e) {
        // QuotaExceededError や SecurityError をキャッチ
        console.error(`データ保存失敗 (key: ${prefixedKey}):`, e);
      }
    },

    remove(key: string): void {
      const prefixedKey = `${PREFIX}${key}`;
      try {
        window.localStorage.removeItem(prefixedKey);
      } catch (e) {
        console.error(`データ削除失敗 (key: ${prefixedKey}):`, e);
      }
    },

    clear(): void {
      try {
        // プレフィックスに一致するキーのみ削除（他アプリのデータを守る）
        const keysToRemove: string[] = [];
        for (let i = 0; i < window.localStorage.length; i++) {
          const k = window.localStorage.key(i);
          if (k !== null && k.startsWith(PREFIX)) {
            keysToRemove.push(k);
          }
        }
        for (const k of keysToRemove) {
          window.localStorage.removeItem(k);
        }
      } catch (e) {
        console.error('ストレージクリア失敗:', e);
      }
    },

    isAvailable: true,
  };
}

/**
 * Storageインスタンスを生成する
 *
 * LocalStorage利用可能時はLocalStorageベース、利用不可時はメモリフォールバックを返す。
 * DI対応: 戻り値のStorageオブジェクトを関数引数で他モジュールに渡して使う。
 */
export function createStorage(): Storage {
  const available = checkLocalStorageAvailability();

  if (!available) {
    console.warn('LocalStorage利用不可。メモリフォールバックで動作します。');
    return createMemoryStorage();
  }

  return createLocalStorage();
}
