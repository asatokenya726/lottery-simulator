# 宝くじシミュレーター API設計書（内部モジュールインターフェース）
> 最終更新: 2026-02-10
> 対応要件定義書: requirements-v1.1
> 対応設計メモ: design-doc-v1

---

## 概要

本プロダクトはクライアントサイド完結のSPAであり、REST APIは存在しない。
本文書では、Business Logic Layer（`src/lib/`）およびData Access Layer（`src/data/`）の**関数インターフェース仕様**を定義する。

---

## 1. Business Logic Layer（src/lib/）

### 1-1. lottery-engine.ts — 抽選エンジン

全て**純粋関数**。副作用なし。

#### `drawLottery(config: PrizeConfig, count: number): DrawResult[]`

| 項目 | 内容 |
|------|------|
| 概要 | 指定枚数分の宝くじ抽選を実行する |
| 引数 | `config`: 確率テーブル設定、`count`: 抽選枚数（デフォルト10） |
| 戻り値 | `DrawResult[]` — 各枚の抽選結果 |
| エラー | `count <= 0` の場合: 空配列を返す |
| 備考 | 整数重み付きランダム抽選。`Math.random()` を内部で使用 |

```typescript
// 型定義
type DrawResult = {
  prizeLevel: string | null; // 等級名（null = ハズレ）
  amount: number;            // 当選金額（0 = ハズレ）
};
```

#### `selectPrize(prizes: PrizeEntry[], random: number): PrizeEntry | null`

| 項目 | 内容 |
|------|------|
| 概要 | 重み付きランダムで1つの等級を選択する（内部関数だがテスト対象のためexport） |
| 引数 | `prizes`: 確率テーブル、`random`: 0〜1の乱数値 |
| 戻り値 | `PrizeEntry | null` — 当選した等級（null = ハズレ） |
| 備考 | 乱数を引数で受け取ることでテスト容易性を確保 |

---

### 1-2. currency-manager.ts — 通貨管理

全て**純粋関数**。副作用なし。

#### `canPurchase(balance: number, cost: number): boolean`

| 項目 | 内容 |
|------|------|
| 概要 | 残高が購入額以上かを判定する |
| 引数 | `balance`: 現在の所持金、`cost`: 購入額 |
| 戻り値 | `boolean` — 購入可否 |

#### `deductBalance(balance: number, cost: number): number`

| 項目 | 内容 |
|------|------|
| 概要 | 残高から購入額を差し引く |
| 引数 | `balance`: 現在の所持金、`cost`: 購入額 |
| 戻り値 | `number` — 差し引き後の残高 |
| エラー | `balance < cost` の場合: `Error('Insufficient balance')` をスロー |

#### `addWinnings(balance: number, winnings: number): number`

| 項目 | 内容 |
|------|------|
| 概要 | 当選金を残高に加算する |
| 引数 | `balance`: 現在の所持金、`winnings`: 当選金額 |
| 戻り値 | `number` — 加算後の残高 |

#### `calculateDrawCost(ticketPrice: number, count: number): number`

| 項目 | 内容 |
|------|------|
| 概要 | 指定枚数分の購入額を計算する |
| 引数 | `ticketPrice`: 1枚の価格、`count`: 枚数 |
| 戻り値 | `number` — 合計購入額 |

---

### 1-3. refill-manager.ts — 資金補給判定

全て**純粋関数**。副作用なし。

#### `shouldRefill(balance: number, lastRefillDate: string, today: string, threshold: number): boolean`

| 項目 | 内容 |
|------|------|
| 概要 | 資金補給の要否を判定する |
| 引数 | `balance`: 現在の所持金、`lastRefillDate`: 最終補給日（YYYY-MM-DD）、`today`: 今日の日付（YYYY-MM-DD）、`threshold`: 補給条件の閾値 |
| 戻り値 | `boolean` — 補給すべきか |
| ロジック | `today > lastRefillDate && balance < threshold` |
| 備考 | 日付を引数で受け取ることでテスト容易性を確保（時刻依存を排除） |

#### `applyRefill(balance: number, refillAmount: number): number`

| 項目 | 内容 |
|------|------|
| 概要 | 補給額を残高に加算する |
| 引数 | `balance`: 現在の所持金、`refillAmount`: 補給額 |
| 戻り値 | `number` — 補給後の残高 |

---

### 1-4. stats-calculator.ts — 統計計算

全て**純粋関数**。副作用なし。

#### `calculateRecoveryRate(totalWon: number, totalSpent: number): number`

| 項目 | 内容 |
|------|------|
| 概要 | 回収率を計算する |
| 引数 | `totalWon`: 累計当選額、`totalSpent`: 累計購入額 |
| 戻り値 | `number` — 回収率（%）。小数第1位まで |
| エッジケース | `totalSpent === 0` の場合: `0` を返す（ゼロ除算回避） |

#### `aggregateDrawResults(results: DrawResult[]): Record<string, number>`

| 項目 | 内容 |
|------|------|
| 概要 | 1回の10連結果から等級別当選回数を集計する |
| 引数 | `results`: 10枚分の抽選結果 |
| 戻り値 | `Record<string, number>` — 等級名をキー、当選回数を値とするオブジェクト |

#### `mergeWinCounts(existing: Record<string, number>, newCounts: Record<string, number>): Record<string, number>`

| 項目 | 内容 |
|------|------|
| 概要 | 既存の等級別当選回数に新しい結果をマージする |
| 引数 | `existing`: 既存の集計、`newCounts`: 新しい集計 |
| 戻り値 | `Record<string, number>` — マージ後の集計 |

#### `calculateTotalWinFromResults(results: DrawResult[]): number`

| 項目 | 内容 |
|------|------|
| 概要 | 1回の10連結果から合計当選額を計算する |
| 引数 | `results`: 10枚分の抽選結果 |
| 戻り値 | `number` — 合計当選額 |

---

## 2. Data Access Layer（src/data/）

### 2-1. storage.ts — LocalStorageラッパー

#### `createStorage(): Storage`

| 項目 | 内容 |
|------|------|
| 概要 | LocalStorage利用可否を判定し、利用不可の場合はメモリフォールバックを返す |
| 戻り値 | `Storage` — get/set/remove/clearメソッドを持つオブジェクト |

```typescript
// インターフェース
type Storage = {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  clear(): void;
  isAvailable: boolean; // LocalStorageが利用可能か
};
```

| メソッド | 概要 | エラー時 |
|---------|------|---------|
| `get<T>(key)` | キーに対応する値をパース済みで返す | パース失敗時: `null`を返す + console.error |
| `set<T>(key, value)` | 値をJSON文字列化して保存する | 容量超過時: console.error（データ消失は許容） |
| `remove(key)` | キーを削除する | - |
| `clear()` | `lottery-sim:` プレフィックスのキーを全て削除する | - |

---

### 2-2. game-state.ts — GameState CRUD

#### `loadGameState(storage: Storage): GameState`

| 項目 | 内容 |
|------|------|
| 概要 | LocalStorageからGameStateを読み込む。存在しない場合は初期値を生成 |
| 引数 | `storage`: Storageインスタンス |
| 戻り値 | `GameState` |
| エラー | データ破損時: 初期値を返す + console.error |

#### `saveGameState(storage: Storage, state: GameState): void`

| 項目 | 内容 |
|------|------|
| 概要 | GameStateをLocalStorageに保存する |
| 引数 | `storage`: Storageインスタンス、`state`: 保存するGameState |

#### `createInitialGameState(): GameState`

| 項目 | 内容 |
|------|------|
| 概要 | 初期GameStateを生成する |
| 戻り値 | `GameState` — balance: 100000, isFirstVisit: true, 各集計値: 0 |

#### `resetGameState(storage: Storage): GameState`

| 項目 | 内容 |
|------|------|
| 概要 | GameStateを初期化し、LocalStorageも更新する |
| 戻り値 | `GameState` — 初期値 |

---

### 2-3. draw-history.ts — DrawHistory CRUD

#### `loadDrawHistory(storage: Storage): DrawHistory[]`

| 項目 | 内容 |
|------|------|
| 概要 | LocalStorageからDrawHistory配列を読み込む |
| 戻り値 | `DrawHistory[]` — 直近100件 |

#### `addDrawHistory(storage: Storage, history: DrawHistory[], newDraw: DrawHistory): DrawHistory[]`

| 項目 | 内容 |
|------|------|
| 概要 | 新しい抽選履歴を追加し、100件を超えた分はFIFOで削除する |
| 引数 | `storage`: Storageインスタンス、`history`: 既存履歴、`newDraw`: 新規履歴 |
| 戻り値 | `DrawHistory[]` — 更新後の履歴配列 |

#### `clearDrawHistory(storage: Storage): void`

| 項目 | 内容 |
|------|------|
| 概要 | 抽選履歴を全て削除する |

---

### 2-4. migration.ts — スキーママイグレーション

#### `checkAndMigrate(storage: Storage): MigrationResult`

| 項目 | 内容 |
|------|------|
| 概要 | スキーマバージョンをチェックし、必要ならマイグレーションを実行する |
| 戻り値 | `MigrationResult` |

```typescript
type MigrationResult = {
  status: 'ok' | 'migrated' | 'reset';
  fromVersion: string | null;
  toVersion: string;
  message?: string; // reset時のユーザー向けメッセージ
};
```

---

## 3. Config Layer（src/config/）

### 3-1. prize-config.ts — 確率テーブル

```typescript
// エクスポートされる定数
export const NENMATSU_JUMBO_2024: PrizeConfig = {
  id: "nenmatsu-jumbo-2024",
  lotteryName: "年末ジャンボ",
  ticketPrice: 300,
  version: "1.0",
  prizes: [ /* PrizeEntry[] */ ],
};

export const DEFAULT_CONFIG = NENMATSU_JUMBO_2024;
```

### 3-2. ゲーム定数

```typescript
// src/config/game-constants.ts
export const GAME_CONSTANTS = {
  INITIAL_BALANCE: 100_000,      // 初期資金
  DRAW_COUNT: 10,                // 10連
  REFILL_THRESHOLD: 3_000,       // 補給条件閾値
  REFILL_AMOUNT: 30_000,         // 補給額
  MAX_HISTORY: 100,              // 履歴保持上限
  SCHEMA_VERSION: "1.0",         // データスキーマバージョン
  STORAGE_PREFIX: "lottery-sim", // LocalStorageキープレフィックス
} as const;
```

---

## 4. Hooks Layer（src/hooks/）

### 4-1. useGameState.ts

```typescript
type UseGameStateReturn = {
  gameState: GameState;
  executeDraw: () => DrawResult[];   // 10連ガチャ実行（残高チェック→抽選→更新→保存）
  canDraw: boolean;                  // 残高が購入額以上か
  checkAndRefill: () => boolean;     // 資金補給チェック＆実行。補給したらtrue
  resetAll: () => void;              // 全データリセット
  dismissFirstVisit: () => void;     // 初回訪問フラグをfalseに
  isStorageAvailable: boolean;       // LocalStorage利用可能か
};
```

### 4-2. useDrawHistory.ts

```typescript
type UseDrawHistoryReturn = {
  drawHistory: DrawHistory[];
  latestDraw: DrawHistory | null;    // 直近の抽選結果（演出表示用）
  addDraw: (draw: DrawHistory) => void;
  clearHistory: () => void;
};
```

---

## 5. 命名規則

| 対象 | 規則 | 例 |
|------|------|-----|
| 関数名 | camelCase、動詞から始める | `drawLottery`, `canPurchase`, `loadGameState` |
| 型名 | PascalCase | `GameState`, `DrawResult`, `PrizeConfig` |
| 定数 | UPPER_SNAKE_CASE | `INITIAL_BALANCE`, `DRAW_COUNT` |
| LocalStorageキー | `lottery-sim:` + camelCase | `lottery-sim:gameState` |
| ファイル名 | kebab-case | `lottery-engine.ts`, `game-state.ts` |

---

## 6. エラーレスポンス統一フォーマット

本プロダクトはREST APIを持たないため、エラーレスポンスではなく**例外/戻り値による統一的なエラー伝播**を定義する。

| レイヤー | エラー伝播方式 |
|---------|--------------|
| Business Logic Layer（lib/） | 不正引数 → `throw Error` 。判定系 → `boolean` or `null` 返却 |
| Data Access Layer（data/） | データ読み込み失敗 → フォールバック値返却 + `console.error` |
| Hooks Layer | try-catchでlib/data/のエラーをキャッチし、UIに反映 |
| Presentation Layer | ErrorBoundaryで未キャッチエラーを補足 |

詳細は `error-handling.md` を参照。

---

作成日: 2026-02-10
