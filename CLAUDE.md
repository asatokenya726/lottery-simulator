# CLAUDE.md — 宝くじシミュレーター

## プロジェクト概要

宝くじの当選確率を「10連ガチャ」のUIで体感できるWebアプリ。ゲーム内通貨「ぃえん」と毎日の資金補給サイクルにより、ノーリスクで継続的に宝くじ体験を提供するエンターテインメント。

**技術スタック**: Next.js 15 (App Router) / TypeScript / Tailwind CSS v4 / Vitest / Vercel

## アーキテクチャ

```
src/
├── app/                  # Presentation Layer — Next.js App Routerページ
│   ├── layout.tsx        # ルートレイアウト（metadata定義、注意喚起フッター）
│   ├── page.tsx          # メインページ（"use client"）
│   ├── terms/page.tsx    # 利用規約（静的）
│   └── globals.css       # Tailwind CSS v4 エントリ（@theme定義）
├── components/           # Presentation Layer — UIコンポーネント
├── hooks/                # Hooks Layer — 状態管理・操作フロー
│   ├── useGameState.ts   # ゲーム状態管理（ガチャ実行、補給、リセット）
│   └── useDrawHistory.ts # 抽選履歴管理
├── lib/                  # Business Logic Layer — 純粋関数のみ
│   ├── lottery-engine.ts # 抽選エンジン（重み付きランダム）
│   ├── currency-manager.ts # 通貨管理
│   ├── refill-manager.ts   # 資金補給判定
│   └── stats-calculator.ts # 統計計算
├── data/                 # Data Access Layer — LocalStorage永続化
│   ├── storage.ts        # LocalStorageラッパー（メモリフォールバック付き）
│   ├── game-state.ts     # GameState CRUD
│   ├── draw-history.ts   # DrawHistory CRUD（FIFO 100件）
│   └── migration.ts      # スキーママイグレーション
├── config/               # Config Layer — 定数・設定
│   ├── prize-config.ts   # 宝くじ確率テーブル（2024年末ジャンボ）
│   └── game-constants.ts # ゲーム定数
└── types/                # 型定義（全レイヤーから参照可能）
    └── index.ts
```

### レイヤー間の依存ルール

- **上→下のみ参照可能**（Presentation → Hooks → lib/data → config/types）
- **lib/（Business Logic）は components/ を絶対に参照しない**
- **lib/ 内は全て純粋関数**（副作用なし、テスト容易）
- **data/ はLocalStorage操作を担当**（lib/ から直接参照してもよい）

## 開発コマンド

```bash
# 開発サーバー
npm run dev

# ビルド
npm run build

# Lint
npm run lint

# 型チェック
npm run type-check
```

### テスト実行コマンド

```bash
# 全テスト実行（watchモード）
npm test

# CI環境向け（1回実行 + カバレッジ）
npm run test:ci

# カバレッジレポート生成
npm run test:coverage

# 統計テスト（大量試行、ローカルのみ）
npm run test:statistical
```

## コーディング規約

### 命名規則

| 対象 | 規則 | 例 |
|------|------|-----|
| 変数・関数 | camelCase | `drawLottery`, `currentBalance` |
| 型・インターフェース | PascalCase | `GameState`, `DrawResult` |
| 定数 | UPPER_SNAKE_CASE | `INITIAL_BALANCE`, `DRAW_COUNT` |
| ファイル | kebab-case | `lottery-engine.ts`, `game-state.ts` |
| コンポーネント | PascalCase | `GachaButton.tsx`, `DrawResultList.tsx` |
| LocalStorageキー | `lottery-sim:` + camelCase | `lottery-sim:gameState` |

### コメント規約

- コメントは**日本語**で書くこと
- 変数名・関数名は**英語**で書くこと
- 自明なコードにはコメントを書かない。「なぜ」を説明するコメントのみ

### 禁止事項

- `any` 型の使用禁止（`unknown` を使い、型ガードで絞り込む）
- `dangerouslySetInnerHTML` 使用禁止
- `console.log` を本番コードに残さない（`console.warn` / `console.error` のみ許可）
- `!important` 使用禁止
- Tailwindの任意値 `px-[13px]`、`bg-[#FF0000]` 使用禁止（デザイントークンを使用）
- インラインstyle属性の使用禁止

## クイックリファレンスマップ

| タスク | 参照ドキュメント |
|--------|----------------|
| 新機能の追加 | `piwf-output/lottery-simulator/requirements-v1.md` → `api-design.md` |
| 抽選ロジックの変更 | `requirements-v1.md`（セクション2: 確率テーブル） → `api-design.md`（lottery-engine） |
| UI実装 | `design-system.md`（カラー/タイポ/コンポーネント規約） |
| テスト作成 | `test-strategy.md`（テスト方針、モック方針） → `library-notes.md`（ライブラリの注意点） |
| エラー処理追加 | `error-handling.md`（エラー分類、レイヤー別ルール） |
| データモデル変更 | `requirements-v1.md`（セクション5: データモデル） → `migration.ts` でマイグレーション追加 |
| 法的リスク確認 | `legal-risk-analysis-v1.md` |
| 実装順序確認 | `task-breakdown.md`（依存関係図、Day割り当て） |
| 成果物全体マップ | `piwf-output/lottery-simulator/handoff.md` |

## テスト容易性ルール

> テストを書きやすく保守しやすいコードにするためのルール。具体的なテスト戦略（カバレッジ目標・配置ルール等）は `piwf-output/lottery-simulator/test-strategy.md` を参照。

### MUST

- 外部依存（LocalStorage）はStorageインターフェースとして注入可能にせよ
  - 実装: `createStorage()` で生成し、関数引数で渡す
- 1関数/1メソッドの責務を単一にせよ（テスト対象が明確になる）
- 副作用を持つ処理と純粋なロジックを分離せよ
  - `src/lib/` は全て純粋関数（副作用なし）
  - `src/data/` はLocalStorage操作（副作用あり）
  - この2つを混在させない

### SHOULD

- テスト用のファクトリ関数を用意し、テストデータの作成を容易にする
  - `__tests__/helpers/test-factories.ts` に `createGameState()`, `createDrawHistory()` 等を配置
- 公開APIの境界でテストし、内部実装への依存を避ける
- 環境依存値（日付、乱数）は関数引数で注入可能にする
  - `shouldRefill(balance, lastRefillDate, today, threshold)` のように `today` を引数で受け取る
  - `selectPrize(prizes, random)` のように乱数を引数で受け取る

### FORBIDDEN

- テスト不可能なグローバル状態への依存（シングルトンの直接参照等）
- テスト内での本番LocalStorageの直接操作（モック `mock-storage.ts` を使用）
- 時刻・乱数などの非決定的な値のハードコード（引数で注入可能にする）

### 技術スタック別の実装ガイド

- **DI方法**: 関数引数で注入。Reactコンポーネントではカスタムフック経由で利用
- **モック戦略**: `vi.spyOn(Math, 'random')` で乱数固定、カスタム `mock-storage.ts` でLocalStorageモック
- **テストヘルパー配置**: `__tests__/helpers/`

## テスト必須ルール

> テストの実行タイミングやCI運用方針を規定するルール。

### テスト実行タイミング

- `push` to main → lint → type-check → テスト（カバレッジ付き） → ビルド
- `pull_request` to main → 同上

### カバレッジ目標（二段構え: 目標値 / CI最低ライン）

- `src/lib/`（ビジネスロジック）: 目標 **80%以上** / CI最低ライン **60%**（60%未満でCI失敗）
- `src/data/`（データアクセス）: 目標 **80%以上** / CI最低ライン: 警告のみ
- `src/hooks/`（フック）: 目標 **60%以上** / CI最低ライン: 警告のみ
- 全体: 目標 **60%以上** / CI最低ライン: 警告のみ
- **CIを失敗させるのは `src/lib/` が60%未満の場合のみ**。それ以外は警告表示でマージ可能

### 必須テスト対象

- 抽選エンジン（`lottery-engine.ts`）: 確率分布の正確性
- 通貨管理（`currency-manager.ts`）: 残高計算の正確性
- 資金補給（`refill-manager.ts`）: 日付判定の正確性
- データ永続化（`storage.ts`）: フォールバック動作
- スキーママイグレーション（`migration.ts`）: バージョン不一致時の動作

### 詳細

具体的なテスト戦略（単体/統合の役割分担、モック方針、CI設定等）は `piwf-output/lottery-simulator/test-strategy.md` を参照。

## デザイン変更容易性ルール

> 色・余白・タイポグラフィ等のデザイン変更時に修正箇所を最小化するためのルール。具体的なカラー値・フォント・スペーシングは `piwf-output/lottery-simulator/design-system.md` を参照。

### MUST

- デザイントークン（色/余白/角丸/影/タイポグラフィ）を `globals.css` の `@theme` で一元管理せよ
- 共通UIコンポーネント層（GachaButton, BalanceDisplay, StatsPanel等）を設け、variant/sizeで差異を吸収せよ
- ページコンポーネント（`page.tsx`）で直接スタイルを定義するな（コンポーネント経由で表現せよ）

### SHOULD

- コンポーネントの見た目の差異はvariantとして明示的に定義し、例外的なスタイル上書きを避ける
- 等級別カラーは `design-system.md` のカラーマップに従い、マジックナンバーを直書きしない

### FORBIDDEN

- ハードコードされた色値 `bg-[#FF0000]` をコンポーネント内に直書き
- 同種UIの重複実装（既存コンポーネントを拡張せよ）
- Tailwindの任意値 `px-[13px]` の多用（最も近いスケール値を使用）
- `!important` の使用
- インラインstyle属性の使用

### 技術スタック別の実装ガイド

- **トークン管理**: Tailwind CSS v4の `@theme` ディレクティブ + CSS変数
  - `globals.css` 内で `@theme { --color-accent-gold: #F59E0B; }` のように定義
  - コンポーネントでは `bg-accent-gold` のようにTailwindクラスで参照
- **コンポーネント配置**: `src/components/`
- **禁止パターンの具体例**: `bg-[#F59E0B]` → `bg-accent-gold` を使用

## 避けるべき落とし穴

> 初回プロジェクトのため、今後のプロジェクトで蓄積していく。

### プロジェクト固有の注意点

- **Next.js/Reactのセキュリティパッチ必須**: Next.js 15.5.10以降を使用すること（CVE-2025-66478: RCE脆弱性対策）
- **LocalStorageはビルド時に存在しない**: `useEffect` 内でのみアクセスすること。`typeof window !== 'undefined'` ガード必須
- **`"use client"` の付け忘れ**: useState/useEffectを使うコンポーネントには必ず宣言
- **metadata は layout.tsx で定義**: `"use client"` な page.tsx では `export const metadata` が使えない
- **Tailwind CSS v4 は CSS-first**: `tailwind.config.js` ではなく `globals.css` の `@theme` で設定
- **Tailwind v4 のユーティリティ名変更**: `shadow`→`shadow-sm`、`rounded`→`rounded-sm`、`ring`→`ring-3` 等。詳細は `library-notes.md` 参照
- **Tailwind v4 の border デフォルト色変更**: `border` は `currentColor` がデフォルト（v3は `gray-200`）。色を必ず明示指定すること
- **確率テーブルの数値精度**: 整数の重み（本数/ユニット）で抽選し、浮動小数点誤差を回避する
- **ゲーム内通貨「ぃえん」の表記**: 全画面で統一すること（「円」と混同しない）
