/**
 * スキーママイグレーション
 *
 * LocalStorageのデータスキーマバージョンを管理し、
 * バージョン不一致時にマイグレーションを実行する。
 * マイグレーション失敗・データ破損時は全データをリセットして初期化する。
 *
 * api-design.md / error-handling.md DATA_CORRUPTION分類 に準拠。
 */

import type { Storage, MigrationResult } from '@/types';
import { GAME_CONSTANTS } from '@/config/game-constants';

/** バージョンを保存するStorageキー（createStorageがプレフィックスを自動付与） */
const VERSION_KEY = 'version';

/**
 * マイグレーション定義
 *
 * バージョン間のデータ変換ロジックを保持する。
 * migrateは対象バージョンへの変換処理を実行する純粋な関数。
 */
export type Migration = {
  /** マイグレーション先のバージョン */
  version: string;
  /** マイグレーション処理（失敗時はthrowする） */
  migrate: (storage: Storage) => void;
};

/**
 * スキーマバージョンをチェックし、必要に応じてマイグレーションを実行する
 *
 * 処理フロー:
 * 1. storage.get('version') でバージョン取得
 * 2. null（初回訪問）→ バージョンを設定して 'ok' を返す
 * 3. 現行バージョンと一致 → 'ok' を返す
 * 4. 不一致 → migrations を順次実行 → 成功: 'migrated' / 失敗: clear+reset
 * 5. 例外発生 → clear → 'reset'（メッセージ付き）
 *
 * @param storage - Storageインターフェース（DI対応）
 * @param migrations - マイグレーション定義配列（テスト時にダミーを注入可能）
 * @returns マイグレーション結果
 */
export function checkAndMigrate(
  storage: Storage,
  migrations: Migration[] = []
): MigrationResult {
  const currentVersion = GAME_CONSTANTS.SCHEMA_VERSION;

  let storedVersion: string | null;

  try {
    storedVersion = storage.get<string>(VERSION_KEY);
  } catch {
    // storage.getが例外をスローした場合はデータ破損とみなす
    return handleReset(storage, null, currentVersion);
  }

  // 初回訪問: バージョン未設定
  if (storedVersion === null) {
    storage.set(VERSION_KEY, currentVersion);
    return {
      status: 'ok',
      fromVersion: null,
      toVersion: currentVersion,
    };
  }

  // バージョン一致: マイグレーション不要
  if (storedVersion === currentVersion) {
    return {
      status: 'ok',
      fromVersion: storedVersion,
      toVersion: currentVersion,
    };
  }

  // バージョン不一致: マイグレーション実行
  try {
    for (const migration of migrations) {
      migration.migrate(storage);
    }

    // マイグレーション成功: バージョンを更新
    storage.set(VERSION_KEY, currentVersion);

    return {
      status: 'migrated',
      fromVersion: storedVersion,
      toVersion: currentVersion,
    };
  } catch {
    // マイグレーション失敗: 全データリセット
    return handleReset(storage, storedVersion, currentVersion);
  }
}

/**
 * データをリセットしてバージョンを再設定する
 *
 * マイグレーション失敗・データ破損時に呼ばれる。
 * error-handling.md: 「データが破損していたため初期化しました」
 */
function handleReset(
  storage: Storage,
  fromVersion: string | null,
  toVersion: string
): MigrationResult {
  console.error('データ破損またはマイグレーション失敗を検出。データを初期化します。');

  storage.clear();
  storage.set(VERSION_KEY, toVersion);

  return {
    status: 'reset',
    fromVersion,
    toVersion,
    message: 'データが破損していたため初期化しました',
  };
}
