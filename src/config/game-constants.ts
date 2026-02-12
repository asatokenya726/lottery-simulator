/**
 * ゲーム定数
 *
 * 宝くじシミュレーターの全体設定値を一元管理する。
 * requirements-v1.md の要件に準拠。
 * as const で型安全性を確保。
 */
export const GAME_CONSTANTS = {
  /** M-01: 初回訪問時の初期資金（100,000ぃえん） */
  INITIAL_BALANCE: 100_000,

  /** M-02: 10連ガチャの購入枚数 */
  DRAW_COUNT: 10,

  /** M-06: 資金補給条件の残高閾値（3,000ぃえん未満で補給対象） */
  REFILL_THRESHOLD: 3_000,

  /** M-06: 資金補給額（30,000ぃえん） */
  REFILL_AMOUNT: 30_000,

  /** S-02: 抽選履歴の保持上限（直近100回分） */
  MAX_HISTORY: 100,

  /** NFR-06: データスキーマバージョン（マイグレーション対応） */
  SCHEMA_VERSION: '1.0',

  /** LocalStorageキーのプレフィックス（CLAUDE.md命名規則準拠） */
  STORAGE_PREFIX: 'lottery-sim',
} as const;

/** GAME_CONSTANTS の型（読み取り専用） */
export type GameConstants = typeof GAME_CONSTANTS;
