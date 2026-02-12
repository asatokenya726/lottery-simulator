/**
 * migration.ts の単体テスト
 *
 * スキーママイグレーション（checkAndMigrate）の全パターンを検証する。
 * テスト環境: モックStorage（mock-storage.ts）を使用
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkAndMigrate } from '@/data/migration';
import type { Migration } from '@/data/migration';
import { createMockStorage } from '../helpers/mock-storage';
import { GAME_CONSTANTS } from '@/config/game-constants';

const CURRENT_VERSION = GAME_CONSTANTS.SCHEMA_VERSION;

describe('checkAndMigrate', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================================
  // 初回訪問: バージョン未設定
  // ============================================================

  describe('初回訪問（version未設定）', () => {
    it('status "ok"、fromVersion null、toVersion が現行バージョンを返す', () => {
      const storage = createMockStorage();

      const result = checkAndMigrate(storage);

      expect(result).toEqual({
        status: 'ok',
        fromVersion: null,
        toVersion: CURRENT_VERSION,
      });
    });

    it('バージョンがStorageに設定される', () => {
      const storage = createMockStorage();

      checkAndMigrate(storage);

      // Storageにバージョンが保存されていることを確認
      const savedVersion = storage.get<string>('version');
      expect(savedVersion).toBe(CURRENT_VERSION);
    });
  });

  // ============================================================
  // バージョン一致: マイグレーション不要
  // ============================================================

  describe('バージョン一致', () => {
    it('status "ok"、fromVersion/toVersion が同じ現行バージョンを返す', () => {
      const storage = createMockStorage();
      storage.set('version', CURRENT_VERSION);

      const result = checkAndMigrate(storage);

      expect(result).toEqual({
        status: 'ok',
        fromVersion: CURRENT_VERSION,
        toVersion: CURRENT_VERSION,
      });
    });

    it('マイグレーション関数が呼ばれない', () => {
      const storage = createMockStorage();
      storage.set('version', CURRENT_VERSION);

      const migrateFn = vi.fn();
      const migrations: Migration[] = [
        { version: '2.0', migrate: migrateFn },
      ];

      checkAndMigrate(storage, migrations);

      expect(migrateFn).not.toHaveBeenCalled();
    });
  });

  // ============================================================
  // バージョン不一致: マイグレーション成功
  // ============================================================

  describe('バージョン不一致（マイグレーション成功）', () => {
    it('status "migrated"、fromVersion が旧バージョン、toVersion が現行バージョンを返す', () => {
      const storage = createMockStorage();
      storage.set('version', '0.9');

      const migrations: Migration[] = [
        {
          version: CURRENT_VERSION,
          migrate: () => {
            // マイグレーション処理（テスト用のダミー）
          },
        },
      ];

      const result = checkAndMigrate(storage, migrations);

      expect(result).toEqual({
        status: 'migrated',
        fromVersion: '0.9',
        toVersion: CURRENT_VERSION,
      });
    });

    it('全てのマイグレーション関数が順番に実行される', () => {
      const storage = createMockStorage();
      storage.set('version', '0.8');

      const callOrder: number[] = [];
      const migrations: Migration[] = [
        {
          version: '0.9',
          migrate: () => {
            callOrder.push(1);
          },
        },
        {
          version: CURRENT_VERSION,
          migrate: () => {
            callOrder.push(2);
          },
        },
      ];

      checkAndMigrate(storage, migrations);

      expect(callOrder).toEqual([1, 2]);
    });

    it('マイグレーション成功後にバージョンが更新される', () => {
      const storage = createMockStorage();
      storage.set('version', '0.9');

      const migrations: Migration[] = [
        { version: CURRENT_VERSION, migrate: () => {} },
      ];

      checkAndMigrate(storage, migrations);

      const savedVersion = storage.get<string>('version');
      expect(savedVersion).toBe(CURRENT_VERSION);
    });

    it('マイグレーション関数にstorageが渡される', () => {
      const storage = createMockStorage();
      storage.set('version', '0.9');

      const migrateFn = vi.fn();
      const migrations: Migration[] = [
        { version: CURRENT_VERSION, migrate: migrateFn },
      ];

      checkAndMigrate(storage, migrations);

      expect(migrateFn).toHaveBeenCalledWith(storage);
    });
  });

  // ============================================================
  // バージョン不一致: マイグレーション失敗
  // ============================================================

  describe('バージョン不一致（マイグレーション失敗）', () => {
    it('status "reset"、message付きを返す', () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      const storage = createMockStorage();
      storage.set('version', '0.9');

      const migrations: Migration[] = [
        {
          version: CURRENT_VERSION,
          migrate: () => {
            throw new Error('マイグレーション処理でエラー');
          },
        },
      ];

      const result = checkAndMigrate(storage, migrations);

      expect(result).toEqual({
        status: 'reset',
        fromVersion: '0.9',
        toVersion: CURRENT_VERSION,
        message: 'データが破損していたため初期化しました',
      });
    });

    it('リセット後にバージョンが再設定される', () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      const storage = createMockStorage();
      storage.set('version', '0.9');
      storage.set('gameState', { balance: 100 });

      const migrations: Migration[] = [
        {
          version: CURRENT_VERSION,
          migrate: () => {
            throw new Error('マイグレーション失敗');
          },
        },
      ];

      checkAndMigrate(storage, migrations);

      // リセット後にバージョンが再設定されていることを確認
      const savedVersion = storage.get<string>('version');
      expect(savedVersion).toBe(CURRENT_VERSION);
    });

    it('リセット時にclearが呼ばれてデータが削除される', () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      const storage = createMockStorage();
      storage.set('version', '0.9');
      storage.set('gameState', { balance: 100 });
      storage.set('drawHistory', []);

      const migrations: Migration[] = [
        {
          version: CURRENT_VERSION,
          migrate: () => {
            throw new Error('マイグレーション失敗');
          },
        },
      ];

      checkAndMigrate(storage, migrations);

      // clearされた後、versionだけが再設定されている
      expect(storage.get('gameState')).toBeNull();
      expect(storage.get('drawHistory')).toBeNull();
      expect(storage.get<string>('version')).toBe(CURRENT_VERSION);
    });

    it('console.errorが出力される', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const storage = createMockStorage();
      storage.set('version', '0.9');

      const migrations: Migration[] = [
        {
          version: CURRENT_VERSION,
          migrate: () => {
            throw new Error('マイグレーション失敗');
          },
        },
      ];

      checkAndMigrate(storage, migrations);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('データ破損またはマイグレーション失敗')
      );
    });
  });

  // ============================================================
  // データ破損: storage.getが例外をスロー
  // ============================================================

  describe('データ破損（storage.getが例外をスロー）', () => {
    it('status "reset"、fromVersion null、message付きを返す', () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});

      const storage = createMockStorage();
      storage._errors.throwOnKeys = new Set(['version']);

      const result = checkAndMigrate(storage);

      expect(result).toEqual({
        status: 'reset',
        fromVersion: null,
        toVersion: CURRENT_VERSION,
        message: 'データが破損していたため初期化しました',
      });
    });

    it('リセット後にバージョンが再設定される', () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});

      const storage = createMockStorage();
      storage.set('gameState', { balance: 500 });
      storage._errors.throwOnKeys = new Set(['version']);

      checkAndMigrate(storage);

      // throwOnKeysを解除してバージョンを確認
      storage._errors.throwOnKeys = undefined;
      const savedVersion = storage.get<string>('version');
      expect(savedVersion).toBe(CURRENT_VERSION);
    });

    it('console.errorが出力される', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const storage = createMockStorage();
      storage._errors.throwOnKeys = new Set(['version']);

      checkAndMigrate(storage);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('データ破損またはマイグレーション失敗')
      );
    });
  });

  // ============================================================
  // エッジケース
  // ============================================================

  describe('エッジケース', () => {
    it('migrations配列が空の場合、バージョン不一致でもmigratedを返す', () => {
      const storage = createMockStorage();
      storage.set('version', '0.5');

      const result = checkAndMigrate(storage, []);

      expect(result).toEqual({
        status: 'migrated',
        fromVersion: '0.5',
        toVersion: CURRENT_VERSION,
      });
    });

    it('migrationsを省略した場合（デフォルト空配列）、バージョン不一致でもmigratedを返す', () => {
      const storage = createMockStorage();
      storage.set('version', '0.5');

      const result = checkAndMigrate(storage);

      expect(result).toEqual({
        status: 'migrated',
        fromVersion: '0.5',
        toVersion: CURRENT_VERSION,
      });
    });

    it('2番目のマイグレーションで失敗した場合もresetを返す', () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      const storage = createMockStorage();
      storage.set('version', '0.8');

      const firstMigrateFn = vi.fn();
      const migrations: Migration[] = [
        { version: '0.9', migrate: firstMigrateFn },
        {
          version: CURRENT_VERSION,
          migrate: () => {
            throw new Error('2番目のマイグレーションで失敗');
          },
        },
      ];

      const result = checkAndMigrate(storage, migrations);

      // 1番目は呼ばれる
      expect(firstMigrateFn).toHaveBeenCalledTimes(1);
      // 結果はreset
      expect(result.status).toBe('reset');
      expect(result.fromVersion).toBe('0.8');
    });
  });
});
