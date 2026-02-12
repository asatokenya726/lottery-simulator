/**
 * 宝くじシミュレーター 型定義
 *
 * 全レイヤーから参照される共通型を一元管理する。
 * api-design.md / requirements-v1.md セクション5 に準拠。
 */

// ============================================================
// データモデル型
// ============================================================

/**
 * 1枚分の抽選結果
 * DrawHistoryに埋め込まれる（独立エンティティではない）
 */
export type DrawResult = {
  /** 等級名（null = ハズレ） */
  prizeLevel: string | null;
  /** 当選金額（0 = ハズレ） */
  amount: number;
};

/**
 * 1回の10連ガチャ履歴
 * GameStateと1:Nの関係。LocalStorageに配列で保存（直近100件）
 */
export type DrawHistory = {
  /** 一意ID（UUID or timestamp） */
  id: string;
  /** 抽選日時（ISO 8601） */
  timestamp: string;
  /** 購入額（3,000ぃえん） */
  cost: number;
  /** この回の合計当選額 */
  totalWin: number;
  /** 10枚分の結果（1:10固定、ネスト配列で非正規化保存） */
  results: DrawResult[];
};

/**
 * ゲーム状態
 * LocalStorageに1件のみ保存。集計値を独立保持する。
 */
export type GameState = {
  /** 現在の所持金（ぃえん） */
  balance: number;
  /** 累計購入額 */
  totalSpent: number;
  /** 累計当選額 */
  totalWon: number;
  /** 累計購入枚数 */
  totalTickets: number;
  /** 累計抽選回数（10連の回数） */
  totalDraws: number;
  /** 等級別当選回数（例: {"1等": 0, "6等": 5}） */
  winCountByLevel: Record<string, number>;
  /** 最終補給日（YYYY-MM-DD） */
  lastRefillDate: string;
  /** 初回訪問フラグ */
  isFirstVisit: boolean;
  /** 初回プレイ日時（ISO 8601） */
  createdAt: string;
  /** 最終更新日時（ISO 8601） */
  updatedAt: string;
};

// ============================================================
// 設定・確率テーブル型
// ============================================================

/**
 * 確率テーブルの1エントリ（1つの等級）
 * 重みは本数/ユニットの整数で保持（浮動小数点精度の問題を回避）
 */
export type PrizeEntry = {
  /** 等級名（例: "1等"） */
  level: string;
  /** 当選金額（ぃえん） */
  amount: number;
  /** 本数/ユニット（整数で保持） */
  weight: number;
  /** 表示名（例: "1等 7億ぃえん"） */
  displayName: string;
};

/**
 * 宝くじ確率テーブル設定
 * コード内定数として保持。MVPでは1種類固定。
 */
export type PrizeConfig = {
  /** 識別子（例: "nenmatsu-jumbo-2024"） */
  id: string;
  /** 宝くじ名（例: "年末ジャンボ"） */
  lotteryName: string;
  /** 1枚の価格（ぃえん） */
  ticketPrice: number;
  /** 設定バージョン */
  version: string;
  /** 確率テーブル */
  prizes: PrizeEntry[];
};

// ============================================================
// データアクセス層型
// ============================================================

/**
 * LocalStorageラッパーのインターフェース
 * LocalStorage利用不可時はメモリフォールバックを返す。
 */
export type Storage = {
  /** キーに対応する値をパース済みで返す（パース失敗時: null） */
  get<T>(key: string): T | null;
  /** 値をJSON文字列化して保存する */
  set<T>(key: string, value: T): void;
  /** キーを削除する */
  remove(key: string): void;
  /** lottery-sim: プレフィックスのキーを全て削除する */
  clear(): void;
  /** LocalStorageが利用可能か */
  isAvailable: boolean;
};

/**
 * スキーママイグレーション結果
 */
export type MigrationResult = {
  /** マイグレーション結果ステータス */
  status: 'ok' | 'migrated' | 'reset';
  /** マイグレーション前のバージョン（初回はnull） */
  fromVersion: string | null;
  /** マイグレーション後のバージョン */
  toVersion: string;
  /** reset時のユーザー向けメッセージ */
  message?: string;
};

// ============================================================
// Hooks層 戻り値型
// ============================================================

/**
 * useGameState フックの戻り値型
 */
export type UseGameStateReturn = {
  /** 現在のゲーム状態 */
  gameState: GameState;
  /** 10連ガチャ実行（残高チェック→抽選→更新→保存） */
  executeDraw: () => DrawResult[];
  /** 残高が購入額以上か */
  canDraw: boolean;
  /** 資金補給チェック＆実行。補給したらtrue */
  checkAndRefill: () => boolean;
  /** 全データリセット */
  resetAll: () => void;
  /** 初回訪問フラグをfalseに */
  dismissFirstVisit: () => void;
  /** LocalStorage利用可能か */
  isStorageAvailable: boolean;
};

/**
 * useDrawHistory フックの戻り値型
 */
export type UseDrawHistoryReturn = {
  /** 抽選履歴 */
  drawHistory: DrawHistory[];
  /** 直近の抽選結果（演出表示用） */
  latestDraw: DrawHistory | null;
  /** 新しい抽選履歴を追加する */
  addDraw: (draw: DrawHistory) => void;
  /** 抽選履歴を全て削除する */
  clearHistory: () => void;
};
