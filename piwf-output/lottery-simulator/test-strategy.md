# 宝くじシミュレーター テスト戦略書
> 最終更新: 2026-02-10
> 対応要件定義書: requirements-v1.1（NFR-08）

---

## 1. テスト方針概要

| 項目 | 内容 |
|------|------|
| テストランナー | Vitest |
| UIテストライブラリ | React Testing Library |
| カバレッジツール | Vitest built-in (v8 provider) |
| E2Eテスト | MVP段階では手動確認。将来的にPlaywright導入を検討 |
| CI | GitHub Actions — push時に自動実行 |

---

## 2. テストの役割分担

### 2-1. 単体テスト（Unit Test）

| 項目 | 内容 |
|------|------|
| 対象 | Business Logic Layer（`src/lib/`）、Data Access Layer（`src/data/`） |
| カバレッジ目標 | **80%以上** |
| 方針 | 純粋関数を中心にテスト。入力→出力の検証 |
| モック | LocalStorageのみモック（`src/data/`のテスト時） |

#### 必須テスト対象と観点

| モジュール | 必須テスト観点 |
|-----------|--------------|
| `lottery-engine.ts` | 正常系: 10枚分の結果が返る、各結果がPrizeConfigの等級に含まれる |
| | エッジケース: count=0で空配列、確率分布が統計的に妥当（大量試行テスト） |
| | 境界値: 全等級の当選が発生し得ることの確認（固定乱数で検証） |
| `currency-manager.ts` | 正常系: 残高差し引き、当選金加算、購入可否判定 |
| | エッジケース: 残高0、残高ちょうど購入額、残高不足でのthrow |
| | 境界値: 大きな金額（7億ぃえん当選時）のオーバーフロー未発生確認 |
| `refill-manager.ts` | 正常系: 補給条件成立/不成立の判定 |
| | エッジケース: 同日の2回目アクセス（補給済み）、日付変更直後 |
| | 境界値: 残高がちょうど閾値（3,000）の場合 |
| `stats-calculator.ts` | 正常系: 回収率計算、等級別集計 |
| | エッジケース: totalSpent=0（ゼロ除算回避）、空の結果配列 |
| `storage.ts` | 正常系: get/set/remove/clear |
| | エッジケース: LocalStorage非対応時のメモリフォールバック |
| | エッジケース: JSONパース失敗時のnull返却 |
| `game-state.ts` | 正常系: 読み込み/保存/リセット |
| | エッジケース: 保存データ破損時の初期値フォールバック |
| | バリデーション: 各フィールドの型チェック |
| `draw-history.ts` | 正常系: 追加/読み込み/削除 |
| | エッジケース: 100件超過時のFIFO削除 |
| `migration.ts` | 正常系: バージョン一致時はスキップ |
| | エッジケース: バージョン不一致時のマイグレーション実行、失敗時のリセット |

### 2-2. コンポーネントテスト（Integration Test）

| 項目 | 内容 |
|------|------|
| 対象 | Hooks Layer（`src/hooks/`） |
| カバレッジ目標 | **60%以上** |
| 方針 | `renderHook` でフックの統合テスト |
| モック | LocalStorageをモック |

#### 必須テスト観点

| フック | テスト観点 |
|--------|---------|
| `useGameState` | ガチャ実行フロー（残高チェック→抽選→状態更新→保存）の一連動作 |
| | 資金補給フローの一連動作 |
| | データリセットの動作 |
| `useDrawHistory` | 履歴追加・FIFO管理の動作 |

### 2-3. E2Eテスト

| 項目 | 内容 |
|------|------|
| MVP段階 | **手動テスト**（テストチェックリストに従う） |
| 将来 | Playwright導入 |

#### 手動テストチェックリスト

- [ ] 初回アクセス → 注意事項モーダル表示 → 閉じる → 初期資金100,000ぃえん
- [ ] 10連ガチャ実行 → 残高3,000ぃえん減少 → 結果10枚表示
- [ ] 当選時 → 当選演出表示 → 当選金加算
- [ ] 残高不足 → ボタンdisabled → 補給メッセージ表示
- [ ] 日付変更後のアクセス → 資金補給 → 補給通知表示
- [ ] 累計収支表示 → 正しい回収率
- [ ] データリセット → 確認ダイアログ → 初期状態に復帰
- [ ] ブラウザ再起動 → データが保持されている
- [ ] モバイル表示 → レスポンシブ対応
- [ ] 利用規約ページ → 表示・遷移・戻り

---

## 3. テストファイル配置ルール

```
__tests__/
├── lib/                           # 単体テスト（Business Logic Layer）
│   ├── lottery-engine.test.ts
│   ├── currency-manager.test.ts
│   ├── refill-manager.test.ts
│   └── stats-calculator.test.ts
├── data/                          # 単体テスト（Data Access Layer）
│   ├── storage.test.ts
│   ├── game-state.test.ts
│   ├── draw-history.test.ts
│   └── migration.test.ts
├── hooks/                         # コンポーネントテスト（Hooks Layer）
│   ├── useGameState.test.ts
│   └── useDrawHistory.test.ts
└── helpers/                       # テストヘルパー
    ├── mock-storage.ts            # LocalStorageモック
    └── test-factories.ts          # テストデータファクトリ
```

### ファイル命名規則

| 対象 | パターン | 例 |
|------|---------|-----|
| テストファイル | `{対象ファイル名}.test.ts` | `lottery-engine.test.ts` |
| テストヘルパー | 説明的な名前 | `mock-storage.ts`, `test-factories.ts` |

---

## 4. モック方針

### 4-1. モック対象

| 対象 | モック方法 | 理由 |
|------|----------|------|
| LocalStorage | カスタムモック（`mock-storage.ts`） | テスト環境にLocalStorageが存在しないため |
| `Math.random()` | `vi.spyOn(Math, 'random')` | 抽選結果の決定性を確保するため |
| 日付（`new Date()`） | `vi.useFakeTimers()` | 資金補給の日付判定テスト |

### 4-2. モックしない対象

| 対象 | 理由 |
|------|------|
| Business Logic Layer（`src/lib/`）の関数 | 純粋関数のため、モック不要。実際の関数をテスト |
| Config（`src/config/`） | 定数のため。必要に応じてテスト用の設定を直接渡す |

### 4-3. テストデータファクトリ

```typescript
// __tests__/helpers/test-factories.ts

// GameStateの生成（デフォルト値をオーバーライド可能）
function createGameState(overrides?: Partial<GameState>): GameState

// DrawHistoryの生成
function createDrawHistory(overrides?: Partial<DrawHistory>): DrawHistory

// DrawResultの生成
function createDrawResult(overrides?: Partial<DrawResult>): DrawResult

// PrizeConfigの生成（テスト用の簡易版）
function createTestPrizeConfig(): PrizeConfig
```

---

## 5. カバレッジ目標

| レイヤー | 目標 | 計測対象 |
|---------|------|---------|
| Business Logic Layer（`src/lib/`） | **80%以上** | Statements, Branches, Functions |
| Data Access Layer（`src/data/`） | **80%以上** | Statements, Branches, Functions |
| Hooks Layer（`src/hooks/`） | **60%以上** | Statements, Branches, Functions |
| 全体 | **60%以上** | Statements |
| Presentation Layer（`src/components/`） | **計測対象外** | MVP段階では手動テスト |

### カバレッジ未達時の扱い

- CI上でカバレッジを計測し、レポートを出力する
- **カバレッジ未達でもCIは失敗させない**（MVP段階では警告のみ）
- ただし、`src/lib/` のカバレッジが60%を下回った場合はCIを失敗させる

---

## 6. CI/CD パイプライン設計

### 6-1. GitHub Actions ワークフロー

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:ci
      - run: npm run build
```

### 6-2. テスト実行コマンド

| コマンド | 用途 | 説明 |
|---------|------|------|
| `npm test` | ローカル開発 | watchモードでテスト実行 |
| `npm run test:ci` | CI環境 | 1回実行 + カバレッジレポート出力 |
| `npm run test:coverage` | ローカルカバレッジ確認 | カバレッジレポート生成 |

### 6-3. テスト実行タイミング

| イベント | 実行内容 |
|---------|---------|
| `push` to main | lint → type-check → テスト（カバレッジ付き） → ビルド |
| `pull_request` to main | 同上 |

### 6-4. 失敗時のブロック条件

| 条件 | PR マージ |
|------|----------|
| テスト失敗 | **ブロック**（マージ不可） |
| lint エラー | **ブロック** |
| 型チェックエラー | **ブロック** |
| ビルド失敗 | **ブロック** |
| カバレッジ未達（lib/ < 60%） | **ブロック** |
| カバレッジ未達（全体 < 60%） | 警告のみ（マージ可） |

---

## 7. 抽選ロジックの統計テスト

抽選エンジンの確率分布が正しいことを検証するための特別なテスト:

### 7-1. 大量試行テスト

```
テスト: 100万回の抽選を実行し、各等級の出現率が理論値と一定の誤差範囲内に収まることを確認
許容誤差: 理論値の ±20%（7等以上）、低確率等級（1等〜3等）は出現の有無のみ確認
実行: CIでは実行しない（ローカルのみ。`test:statistical` コマンドで手動実行）
```

### 7-2. 固定乱数テスト

```
テスト: Math.random()をモックし、特定の乱数値で期待する等級が選択されることを確認
対象: 全等級の境界値
```

---

## 8. Vitest 設定

```typescript
// vitest.config.ts の設定方針
{
  test: {
    environment: 'jsdom',        // DOM APIが必要なテスト用
    globals: true,               // describe/it/expectをグローバルに
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/lib/**', 'src/data/**', 'src/hooks/**'],
      exclude: ['src/config/**', 'src/types/**'],
      thresholds: {
        'src/lib/**': { statements: 60 },  // CIブロック閾値
      },
    },
    setupFiles: ['__tests__/helpers/setup.ts'],
  },
}
```

---

作成日: 2026-02-10
