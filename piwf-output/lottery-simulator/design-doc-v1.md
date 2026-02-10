# 宝くじシミュレーター 設計メモ v1
> 最終更新: 2026-02-10
> 対応要件定義書: requirements-v1.1

---

## 申し送り消化（Phase 1 → Phase 2）

| # | 指摘事項 | ステータス |
|---|---------|----------|
| 1 | PrizeConfigのid/versionフィールド — 将来のC-01対応時にDrawHistoryにlotteryTypeIdを追加する前提で設計に留意 | **対応済み** — PrizeConfigにid/versionを定義済み（requirements-v1.1）。設計メモのデータアクセス層で将来拡張パスを注記 |
| 2 | データスキーマバージョニングの具体的なマイグレーション戦略はPhase 2で設計する | **対応済み** — セクション4で詳細化 |
| 3 | Tailwind CSS v4はv3から設定方法が大幅変更 | **対応済み** — セクション1でCSS-first設定に留意する旨を記載 |

---

## 1. ディレクトリ構造

```
lottery-simulator/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx              # ルートレイアウト（注意喚起フッター含む）
│   │   ├── page.tsx                # メインページ（ガチャUI）
│   │   ├── terms/
│   │   │   └── page.tsx            # 利用規約ページ（M-09）
│   │   ├── globals.css             # Tailwind CSS v4 エントリ
│   │   ├── favicon.ico
│   │   └── opengraph-image.png     # 固定OGP画像
│   │
│   ├── components/                 # UIコンポーネント
│   │   ├── GachaButton.tsx         # 10連ガチャ購入ボタン（M-02）
│   │   ├── BalanceDisplay.tsx      # 残高表示（M-01）
│   │   ├── DrawResultList.tsx      # 10枚分の結果一覧（M-04）
│   │   ├── DrawAnimation.tsx       # 当選/ハズレ演出（M-05）
│   │   ├── StatsPanel.tsx          # 累計収支表示（M-07）
│   │   ├── RefillNotice.tsx        # 資金補給通知（M-06）
│   │   ├── InsufficientFunds.tsx   # 残高不足メッセージ（M-02）
│   │   ├── DisclaimerBanner.tsx    # 注意喚起バナー（M-08）
│   │   ├── FirstVisitModal.tsx     # 初回訪問モーダル（M-08）
│   │   ├── ResetButton.tsx         # データリセットボタン（M-14）
│   │   ├── ShareButton.tsx         # SNSシェアボタン（S-01）
│   │   └── ErrorBoundary.tsx       # エラーバウンダリ（M-13）
│   │
│   ├── lib/                        # ビジネスロジック（テスト重点）
│   │   ├── lottery-engine.ts       # 抽選ロジック（M-03）
│   │   ├── currency-manager.ts     # 通貨管理（M-01）
│   │   ├── refill-manager.ts       # 資金補給判定（M-06）
│   │   └── stats-calculator.ts     # 統計計算（M-07）
│   │
│   ├── data/                       # データアクセス層
│   │   ├── storage.ts              # LocalStorageラッパー（M-11, M-13）
│   │   ├── game-state.ts           # GameState CRUD
│   │   ├── draw-history.ts         # DrawHistory CRUD（FIFO管理含む）
│   │   └── migration.ts            # スキーママイグレーション
│   │
│   ├── config/                     # 設定ファイル
│   │   └── prize-config.ts         # 宝くじ確率テーブル
│   │
│   ├── types/                      # TypeScript型定義
│   │   └── index.ts                # GameState, DrawHistory, DrawResult, PrizeConfig等
│   │
│   └── hooks/                      # カスタムフック
│       ├── useGameState.ts         # ゲーム状態管理フック
│       └── useDrawHistory.ts       # 抽選履歴管理フック
│
├── __tests__/                      # テスト
│   ├── lib/
│   │   ├── lottery-engine.test.ts  # 抽選ロジックテスト
│   │   ├── currency-manager.test.ts
│   │   ├── refill-manager.test.ts
│   │   └── stats-calculator.test.ts
│   └── data/
│       ├── storage.test.ts
│       └── migration.test.ts
│
├── public/                         # 静的ファイル
├── .github/
│   └── workflows/
│       └── ci.yml                  # GitHub Actions CI
├── next.config.ts
├── postcss.config.mjs              # PostCSS設定（@tailwindcss/postcss プラグイン）
├── tsconfig.json
├── vitest.config.ts
├── package.json
└── CLAUDE.md                       # 実装時の行動指針（Phase 3で生成）
```

### レイヤー構成方針

```
┌─────────────────────────┐
│  Presentation Layer     │  src/app/, src/components/
│  （UI表示・ユーザー操作）  │  Next.js App Router + React コンポーネント
├─────────────────────────┤
│  Hooks Layer            │  src/hooks/
│  （状態管理・UIロジック）  │  useGameState, useDrawHistory
├─────────────────────────┤
│  Business Logic Layer   │  src/lib/
│  （コアロジック）         │  lottery-engine, currency-manager, refill-manager
├─────────────────────────┤
│  Data Access Layer      │  src/data/
│  （永続化・マイグレーション）│  storage, game-state, draw-history, migration
├─────────────────────────┤
│  Config Layer           │  src/config/
│  （設定データ）           │  prize-config
└─────────────────────────┘
```

**レイヤー間の依存ルール**:
- 上位レイヤーは下位レイヤーを参照できる
- 下位レイヤーは上位レイヤーを参照してはならない
- Business Logic Layer（lib/）は Presentation Layer（components/）を参照してはならない
- Business Logic Layer（lib/）は Data Access Layer（data/）を直接参照してもよい（MVPの簡素化のため）
- types/ は全レイヤーから参照可能

---

## 2. 各レイヤーの責任範囲

### 2-1. Presentation Layer（src/app/, src/components/）

| 責任 | 詳細 |
|------|------|
| ページルーティング | Next.js App Routerによるページ管理（/ と /terms の2ページ） |
| UIレンダリング | コンポーネントの描画・スタイリング |
| ユーザー入力のハンドリング | ボタンクリック等のイベント処理 |
| 状態のUI反映 | hooksから受け取った状態をUIに反映 |

**Presentation Layerに置かないもの**:
- 抽選ロジック、通貨計算、統計計算（→ lib/）
- LocalStorage操作（→ data/）

### 2-2. Hooks Layer（src/hooks/）

| 責任 | 詳細 |
|------|------|
| ゲーム状態管理 | useGameState: GameStateの読み書き、UIへの状態提供 |
| 履歴管理 | useDrawHistory: DrawHistoryの読み書き、FIFO管理 |
| 操作フロー | ガチャ実行フロー（残高チェック→抽選→結果保存→状態更新）のオーケストレーション |

### 2-3. Business Logic Layer（src/lib/）

| モジュール | 責任 |
|-----------|------|
| lottery-engine.ts | 重み付きランダム抽選。PrizeConfigを受け取り、DrawResult[]を返す。**純粋関数**（副作用なし） |
| currency-manager.ts | 残高の加減算、購入可否判定。**純粋関数** |
| refill-manager.ts | 資金補給の要否判定（日付比較）。**純粋関数** |
| stats-calculator.ts | 回収率計算、統計値の算出。**純粋関数** |

**テストのポイント**: lib/ 内のモジュールは全て純粋関数として実装し、Vitestで容易にテスト可能にする。カバレッジ目標80%はこのレイヤーに適用。

### 2-4. Data Access Layer（src/data/）

| モジュール | 責任 |
|-----------|------|
| storage.ts | LocalStorageの抽象ラッパー。get/set/remove/clear。**LocalStorage非対応時はメモリフォールバック** |
| game-state.ts | GameStateのCRUD。初期値生成、読み込み、保存、リセット |
| draw-history.ts | DrawHistory配列のCRUD。追加時にFIFO（100件超過分を物理削除） |
| migration.ts | スキーマバージョンチェック、マイグレーション関数の実行 |

### 2-5. Config Layer（src/config/）

| モジュール | 責任 |
|-----------|------|
| prize-config.ts | 2024年末ジャンボの確率テーブル定数。将来の種類追加時にファイルを追加する拡張ポイント |

---

## 3. データフロー

### 3-1. ガチャ実行フロー

```
[ユーザー] → GachaButton.onClick()
    │
    ▼
[useGameState] 残高チェック（currency-manager）
    │ 残高 >= 3,000?
    │  ├─ No → InsufficientFunds表示 → 終了
    │  └─ Yes ↓
    ▼
[useGameState] 残高差し引き（currency-manager）
    │
    ▼
[lottery-engine] 10枚分の抽選実行 → DrawResult[10]
    │
    ▼
[useGameState] 当選金加算 + 集計値更新（totalSpent, totalWon, winCountByLevel等）
    │
    ▼
[useDrawHistory] DrawHistory追加（FIFO管理）
    │
    ▼
[DrawAnimation] 演出表示 → [DrawResultList] 結果一覧表示
    │
    ▼
[data/game-state] LocalStorageに保存
[data/draw-history] LocalStorageに保存
```

### 3-2. 資金補給フロー

```
[ページロード / ガチャ実行後]
    │
    ▼
[useGameState] 補給判定（refill-manager）
    │ today > lastRefillDate && balance < 3,000?
    │  ├─ No → 終了
    │  └─ Yes ↓
    ▼
[useGameState] balance += 30,000, lastRefillDate = today
    │
    ▼
[RefillNotice] 補給通知表示
    │
    ▼
[data/game-state] LocalStorageに保存
```

### 3-3. アプリ初期化フロー

```
[ページロード]
    │
    ▼
[data/storage] LocalStorage利用可能チェック
    │  ├─ 不可 → 警告表示 + メモリフォールバック
    │  └─ 可能 ↓
    ▼
[data/migration] スキーマバージョンチェック
    │  ├─ 不一致 → マイグレーション実行
    │  ├─ データ破損 → 自動リセット
    │  └─ OK ↓
    ▼
[data/game-state] GameState読み込み
    │  ├─ 存在しない → 初期値生成（isFirstVisit=true）
    │  └─ 存在する ↓
    ▼
[useGameState] isFirstVisit判定
    │  ├─ true → FirstVisitModal表示 → isFirstVisit=false保存
    │  └─ false ↓
    ▼
[資金補給フロー] → メイン画面表示
```

---

## 4. スキーママイグレーション設計

### 方針

| 項目 | 方針 |
|------|------|
| バージョン管理 | `lottery-sim:version` キーに文字列（例: "1.0"）で管理 |
| マイグレーション実行タイミング | アプリ初期化時（ページロード時）に毎回チェック |
| マイグレーション関数 | バージョンごとのマイグレーション関数を配列で管理 |
| 互換性のないバージョン | データを初期化し、ユーザーに通知する |
| マイグレーション失敗時 | データを初期化し、ユーザーに通知する |

### マイグレーション関数の構造（実装イメージ）

```typescript
type Migration = {
  version: string;
  migrate: (oldData: unknown) => unknown;
};

const migrations: Migration[] = [
  // v1.0 → v1.1 の例（将来追加時）
  // { version: "1.1", migrate: (data) => ({ ...data, newField: defaultValue }) }
];
```

### 初回リリース時

- スキーマバージョン: "1.0"
- マイグレーション関数: 空（初回のため不要）
- `lottery-sim:version` が存在しない場合 → 初回利用と判断し、初期値を生成

---

## 5. セキュリティ設計

### 5-1. 認証・認可

| 項目 | 方針 |
|------|------|
| 認証 | **なし**（MVP段階）。全機能を匿名で利用可能 |
| 認可 | **なし**。全ユーザーが同一権限 |
| 将来 | ユーザーアカウント導入時にSupabase Auth等を検討 |

### 5-2. XSS対策

| 項目 | 方針 |
|------|------|
| ユーザー入力 | **ユーザーからのテキスト入力は一切存在しない**（ボタン操作のみ） |
| 動的コンテンツ | Reactの自動エスケープに依存。`dangerouslySetInnerHTML` は使用禁止 |
| LocalStorageデータ | 読み込み時にスキーマバリデーション（型チェック）を実施し、不正値は拒否 |

### 5-3. CSRF対策

| 項目 | 方針 |
|------|------|
| 対策 | **不要**。サーバーサイドの状態変更APIが存在しないため、CSRF攻撃の対象外 |

### 5-4. キャッシュ制御

| 項目 | 方針 |
|------|------|
| SSG | Next.jsのSSG（Static Site Generation）でビルド時に静的ページ生成 |
| ユーザー依存データ | クライアントサイド（LocalStorage）で管理。サーバーにユーザーデータを送信しないため、CDNキャッシュの問題は発生しない |
| OGP画像 | 固定画像をpublic/に配置。CDNキャッシュ可能 |

### 5-5. エラー時の情報開示方針

| エラー種別 | ユーザーへの表示 | 内部ログ |
|-----------|----------------|---------|
| LocalStorage非対応 | 「ブラウザの設定でデータ保存が無効です。設定を確認するか、通常モードでアクセスしてください」 | console.warn |
| データ破損 | 「データが破損していたため初期化しました」 | console.error + 破損データの概要 |
| 抽選ロジックエラー | 「エラーが発生しました。ページを再読み込みしてください」 | console.error + スタックトレース |
| 未知のエラー | ErrorBoundaryでキャッチ。「予期しないエラーが発生しました」 | console.error |

**方針**: ユーザーにはシンプルなメッセージを表示。技術的詳細はconsoleにのみ出力。個人情報を含まないため、エラー情報の外部送信（Sentry等）はMVPでは不要。

### 5-6. データ改ざん対策

| 項目 | 方針 |
|------|------|
| LocalStorageの改ざん | **MVP段階では許容**。ユーザーがDevToolsでデータを書き換えることは可能だが、ゲーム内通貨のみで実害なし |
| スキーマバリデーション | 読み込み時に型チェックを実施。不正な型のデータは拒否しリセット |
| 将来 | サーバーサイド導入時にデータの整合性検証を追加 |

---

## 6. Tailwind CSS v4 留意事項

Tailwind CSS v4はv3から設定方法が大幅に変更されている。以下に留意:

| 項目 | v3 | v4 |
|------|-----|-----|
| 設定方法 | `tailwind.config.js` (JS) | CSS-first (`@theme` ディレクティブ) |
| カラー定義 | config内のオブジェクト | CSS変数 (`--color-*`) |
| プラグイン | JS関数 | CSS `@plugin` |
| コンテンツ検出 | `content: [...]` 手動指定 | 自動検出 |

**対応方針**: プロジェクトセットアップ時に公式ドキュメントを確認し、v4のCSS-first設定で進める。Next.js 16 + Tailwind v4の組み合わせで既知の問題がないか、セットアップ時にWebSearchで確認すること。

---

## 完了条件チェック

- [x] ディレクトリ構造が定義されている
- [x] レイヤー構成と責任範囲が定義されている
- [x] データフロー（ガチャ実行、資金補給、初期化）が定義されている
- [x] スキーママイグレーション戦略が設計されている（申し送り#2消化）
- [x] セキュリティ方針が確定している（認証なし、XSS対策、エラー情報開示）
- [x] Tailwind CSS v4の留意事項が記載されている（申し送り#3消化）
- [x] 申し送り事項が全て消化されている

---

作成日: 2026-02-10
