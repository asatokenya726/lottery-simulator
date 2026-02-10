# 宝くじシミュレーター エラーハンドリング設計書
> 最終更新: 2026-02-10
> 対応要件定義書: requirements-v1.1（M-13, NFR-06）
> 対応設計メモ: design-doc-v1（セクション5.5）

---

## 1. エラー分類

| 分類 | 説明 | 例 |
|------|------|-----|
| STORAGE | LocalStorage関連のエラー | LocalStorage非対応、容量超過、読み書き失敗 |
| DATA_CORRUPTION | 保存データの破損・不整合 | JSON パース失敗、スキーマ不一致、型不一致 |
| LOGIC | ビジネスロジックの前提条件違反 | 残高不足での購入試行、不正な引数 |
| RENDER | UIレンダリングエラー | コンポーネントのクラッシュ |
| UNKNOWN | 上記に分類できないエラー | 予期しない例外 |

---

## 2. エラー分類別の対応方針

### 2-1. STORAGE — LocalStorage関連

| エラー | 検出タイミング | ユーザー表示 | ログレベル | 復旧方針 |
|--------|-------------|------------|----------|---------|
| LocalStorage非対応 | アプリ初期化時 | 「ブラウザの設定でデータ保存が無効です。設定を確認するか、通常モードでアクセスしてください。セッション中のデータは保存されません。」 | `warn` | メモリフォールバックで動作継続 |
| 容量超過（QuotaExceededError） | データ保存時 | 表示なし（バックグラウンドで処理） | `error` | 古い履歴を追加削除して再試行 |
| 読み書き失敗（SecurityError等） | データアクセス時 | LocalStorage非対応と同じ扱い | `error` | メモリフォールバック |

### 2-2. DATA_CORRUPTION — データ破損

| エラー | 検出タイミング | ユーザー表示 | ログレベル | 復旧方針 |
|--------|-------------|------------|----------|---------|
| GameState JSONパース失敗 | アプリ初期化時 | 「データが破損していたため初期化しました」 | `error` | 全データ削除 → 初期値で再開 |
| GameState スキーマ不一致 | アプリ初期化時 | マイグレーション成功時: 表示なし / 失敗時: 上記と同じ | `warn` / `error` | マイグレーション実行 / 失敗時は初期化 |
| DrawHistory JSONパース失敗 | アプリ初期化時 | 「履歴データが破損していたため、履歴を初期化しました」 | `error` | DrawHistoryのみ空配列で初期化（GameStateは維持） |
| 型不一致（数値フィールドに文字列等） | データ読み込み時 | データ破損と同じ扱い | `error` | 該当データを初期化 |

### 2-3. LOGIC — ビジネスロジックエラー

| エラー | 検出タイミング | ユーザー表示 | ログレベル | 復旧方針 |
|--------|-------------|------------|----------|---------|
| 残高不足での購入試行 | ガチャ実行時 | 「資金が足りません。0時に補給されます」 | なし（正常フロー） | ボタンdisabled化（UIで事前防止） |
| 不正な引数（負数等） | ロジック実行時 | 表示なし（開発者のバグ） | `error` | throw Error（ErrorBoundaryでキャッチ） |

### 2-4. RENDER — UIレンダリングエラー

| エラー | 検出タイミング | ユーザー表示 | ログレベル | 復旧方針 |
|--------|-------------|------------|----------|---------|
| コンポーネントクラッシュ | レンダリング時 | 「予期しないエラーが発生しました。ページを再読み込みしてください。」 | `error` | ErrorBoundaryでキャッチ。フォールバックUIを表示 |

### 2-5. UNKNOWN — 未分類エラー

| エラー | 検出タイミング | ユーザー表示 | ログレベル | 復旧方針 |
|--------|-------------|------------|----------|---------|
| 予期しない例外 | 任意 | 「予期しないエラーが発生しました。ページを再読み込みしてください。」 | `error` | ErrorBoundaryでキャッチ |

---

## 3. レイヤー別のエラーハンドリング実装ルール

### 3-1. Business Logic Layer（src/lib/）

```
ルール:
- 不正引数 → throw Error（メッセージに原因を含める）
- 判定系関数 → boolean / null で結果を返す（throwしない）
- ロギングは行わない（呼び出し元の責務）
```

| パターン | 実装 |
|---------|------|
| 引数が範囲外 | `throw new Error('Invalid argument: balance must be >= 0')` |
| 購入可否判定 | `return balance >= cost` （throwしない） |
| 抽選結果なし | `return null` （throwしない） |

### 3-2. Data Access Layer（src/data/）

```
ルール:
- データ読み込み失敗 → フォールバック値を返す + console.error
- データ書き込み失敗 → console.error（エラーを握りつぶさない。ただしthrowもしない）
- バリデーション失敗 → フォールバック値を返す + console.error
```

| パターン | 実装 |
|---------|------|
| JSONパース失敗 | フォールバック値（初期値）返却 + `console.error('Data corruption detected:', e)` |
| LocalStorage非対応 | メモリストレージに切り替え + `console.warn('LocalStorage unavailable, using memory fallback')` |
| 容量超過 | `console.error('Storage quota exceeded')` + 古い履歴を追加で削除して再試行 |

### 3-3. Hooks Layer（src/hooks/）

```
ルール:
- lib/ のthrowをtry-catchでキャッチし、ユーザー向けのステートに変換する
- data/ のエラーは基本的にdata/内で処理済み（フォールバック値返却）
- UI向けのエラーステートを管理する
```

| パターン | 実装 |
|---------|------|
| ガチャ実行中のエラー | catchしてerrorState更新。UIでエラーメッセージ表示 |
| 初期化時のデータ破損 | data/がフォールバック値を返すので、resetNotification表示 |

### 3-4. Presentation Layer（src/components/）

```
ルール:
- ErrorBoundaryを設置し、未キャッチエラーを補足する
- ErrorBoundaryのフォールバックUIに「ページを再読み込みしてください」ボタンを設置
- 個別のエラー表示はhooksのstateに基づいて条件レンダリング
```

---

## 4. データバリデーション仕様

### 4-1. GameState バリデーション

アプリ初期化時にLocalStorageから読み込んだデータに対して以下を検証する:

| フィールド | 型 | バリデーション | 不正時の対応 |
|-----------|-----|-------------|------------|
| balance | number | `typeof === 'number' && >= 0 && isFinite` | 全データ初期化 |
| totalSpent | number | `typeof === 'number' && >= 0 && isFinite` | 全データ初期化 |
| totalWon | number | `typeof === 'number' && >= 0 && isFinite` | 全データ初期化 |
| totalTickets | number | `typeof === 'number' && >= 0 && Number.isInteger` | 全データ初期化 |
| totalDraws | number | `typeof === 'number' && >= 0 && Number.isInteger` | 全データ初期化 |
| winCountByLevel | Record | `typeof === 'object' && 全値がnumber >= 0` | 全データ初期化 |
| lastRefillDate | string | `typeof === 'string' && YYYY-MM-DD形式` | 全データ初期化 |
| isFirstVisit | boolean | `typeof === 'boolean'` | 全データ初期化 |
| createdAt | string | `typeof === 'string' && ISO 8601形式` | 全データ初期化 |
| updatedAt | string | `typeof === 'string' && ISO 8601形式` | 全データ初期化 |

### 4-2. DrawHistory バリデーション

| フィールド | 型 | バリデーション | 不正時の対応 |
|-----------|-----|-------------|------------|
| 配列自体 | DrawHistory[] | `Array.isArray` | 履歴のみ初期化（空配列） |
| 各要素 | DrawHistory | 必須フィールドの存在チェック | 不正な要素をスキップ |

### 4-3. バリデーション実装方針

- バリデーション関数は `src/data/game-state.ts` と `src/data/draw-history.ts` に配置
- Zodなどのバリデーションライブラリは**使用しない**（依存を最小化）
- 手書きの型ガード関数（`isGameState`, `isDrawHistory`）で実装

---

## 5. ログ出力方針

| ログレベル | 用途 | 出力先 |
|-----------|------|--------|
| `console.warn` | 許容可能な異常（LocalStorage非対応、メモリフォールバック） | ブラウザコンソール |
| `console.error` | 対処が必要な異常（データ破損、予期しないエラー） | ブラウザコンソール |
| `console.log` | **使用禁止**（本番コードに残さない） | - |

**外部エラー送信**: MVP段階では不要（Sentry等は導入しない）。将来のアクセス解析（C-07）導入時に併せて検討。

---

## 6. ErrorBoundary仕様

### 配置

```
layout.tsx
└── ErrorBoundary（ルートレベル）
    └── page.tsx
        └── 各コンポーネント
```

### フォールバックUI

```
┌─────────────────────────────────────┐
│                                     │
│   予期しないエラーが発生しました      │
│                                     │
│   [ページを再読み込み]               │
│                                     │
│   ※ 問題が解決しない場合は、         │
│     データリセットをお試しください     │
│   [データをリセットして再開]          │
│                                     │
└─────────────────────────────────────┘
```

### 動作

1. 子コンポーネントでエラーが発生
2. ErrorBoundaryがキャッチ
3. `console.error` でエラー詳細を出力
4. フォールバックUIを表示
5. 「ページを再読み込み」→ `window.location.reload()`
6. 「データをリセットして再開」→ LocalStorage全削除 → `window.location.reload()`

---

作成日: 2026-02-10
