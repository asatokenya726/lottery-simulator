# 宝くじシミュレーター ライブラリ対策ドキュメント
> 最終更新: 2026-02-10
> 調査時点の最新バージョンに基づく

---

## 1. Next.js 15（App Router）

### 1-1. バージョン情報

| 項目 | 内容 |
|------|------|
| 使用バージョン | 15.x（**必ずパッチ済み最新版を使用: 15.5.10以降**） |
| ルーティング | App Router |
| レンダリング | SSG（Static Site Generation） |

> **セキュリティ警告**: Next.js 15 + React 19のReact Server Components（Flightプロトコル）にCritical（CVSS 10.0）のRCE脆弱性（CVE-2025-66478）が発見されている。本プロダクトはクライアントサイド完結のためServer Componentsの動的データ処理は行わないが、**必ずパッチ済みバージョン（15.5.10以降）を使用すること**。

### 1-2. 既知のハマりどころ

| # | ハマりポイント | 詳細 | 対策 |
|---|-------------|------|------|
| 1 | **"use client" の付け忘れ** | App RouterではデフォルトがServer Component。useState/useEffectを使うコンポーネントに`"use client"`がないとビルドエラー | LocalStorageやuseState/useEffectを使う全コンポーネントに `"use client"` を宣言。本プロダクトはほぼ全てClient Component |
| 2 | **SSGでのLocalStorage参照** | ビルド時（サーバーサイド）にLocalStorageが存在しないため、直接参照するとビルドエラー | `typeof window !== 'undefined'` ガードを入れるか、useEffect内でのみアクセスする |
| 3 | **metadata APIとClient Component** | `export const metadata` はServer Componentでのみ使用可能。Client Componentのpage.tsxでは使えない | `layout.tsx`（Server Component）でmetadataを定義する。page.tsxは`"use client"`で分離 |
| 4 | **Turbopack（dev時）の挙動差異** | `next dev --turbopack` はWebpackと一部挙動が異なる場合がある | 問題が出たら `next dev`（Turbopackなし）で確認。本番ビルドは常にWebpack |
| 5 | **キャッシュ動作の変更** | Next.js 15ではfetchのデフォルトキャッシュが `no-store` に変更（14では `force-cache`） | 本プロダクトはサーバーサイドfetchを使わないため影響なし。ただし認識しておく |
| 6 | **React 19の新機能との互換** | Next.js 15はReact 19を使用。一部のサードパーティライブラリがReact 19に未対応の可能性 | 依存ライブラリの互換性を `npm install` 時に確認 |

### 1-3. 推奨される使い方

| パターン | 説明 |
|---------|------|
| Server Component で metadata 定義 | `layout.tsx` に `export const metadata` を記述し、SEO/OGP対応 |
| Client Component でインタラクション | `page.tsx` は `"use client"` を宣言し、ガチャUI等のインタラクティブ部分を担当 |
| SSG（静的エクスポート） | `next.config.ts` に `output: 'export'` を設定し、完全静的サイトとしてビルド。Vercelでは不要（Vercelが自動最適化） |
| `generateStaticParams` 不要 | 動的ルートがないため使用しない |

### 1-4. やってはいけないパターン

| 禁止パターン | 理由 |
|-------------|------|
| Server ComponentでuseState/useEffect | ビルドエラーになる |
| page.tsx内で`export const metadata` + `"use client"` | metadataはServer Componentでのみ有効 |
| `getServerSideProps` / `getStaticProps` | App Routerでは廃止。Pages Routerの機能 |
| `next/router` | App Routerでは `next/navigation` を使用 |

---

## 2. Tailwind CSS v4

### 2-1. バージョン情報

| 項目 | 内容 |
|------|------|
| 使用バージョン | 4.x |
| 設定方式 | CSS-first（`@theme` ディレクティブ） |

### 2-2. 既知のハマりどころ

| # | ハマりポイント | 詳細 | 対策 |
|---|-------------|------|------|
| 1 | **`tailwind.config.js` が非推奨** | v4ではCSS-first設定が標準。JSの設定ファイルは `@config` ディレクティブで読み込み可能だが推奨されない | `globals.css` 内の `@theme` ディレクティブでトークン定義 |
| 2 | **`@tailwind` ディレクティブ廃止** | `@tailwind base; @tailwind components; @tailwind utilities;` は使えない | `@import "tailwindcss";` の1行で置き換え |
| 3 | **content設定の自動検出** | v3の `content: ['./src/**/*.{ts,tsx}']` 手動設定が不要に。自動検出される | 設定を書かない。自動検出で問題が出た場合のみ `@source` で追加指定 |
| 4 | **カスタムカラーの定義方法変更** | `theme.extend.colors` ではなく `@theme` 内の CSS変数で定義 | `@theme { --color-accent-gold: #F59E0B; }` のように定義 |
| 5 | **プラグインシステムの変更** | JSプラグインは `@plugin` ディレクティブで読み込む新方式 | 本プロダクトではカスタムプラグインは使用しない |
| 6 | **opacity系ユーティリティの廃止** | `bg-opacity-*`、`text-opacity-*`、`border-opacity-*` は全て廃止 | スラッシュ記法（`bg-black/50`）を使用 |
| 7 | **ユーティリティ名のリネーム** | v3→v4で名前が変わったユーティリティがある（下記表参照） | v4の新名称を使用すること |
| 8 | **ボーダー色のデフォルト変更** | v3では `border-*` が `gray-200` だったが、v4では `currentColor` に変更 | `border` 使用時は必ず色を明示指定する |

#### リネームされたユーティリティ一覧

| v3 | v4 |
|-----|-----|
| `shadow` | `shadow-sm` |
| `shadow-sm` | `shadow-xs` |
| `rounded` | `rounded-sm` |
| `rounded-sm` | `rounded-xs` |
| `outline-none` | `outline-hidden` |
| `ring` | `ring-3` |

### 2-3. 推奨される使い方

| パターン | 説明 |
|---------|------|
| `@theme` でデザイントークン定義 | カラー、角丸、影をCSS変数として一元管理 |
| Tailwindユーティリティクラスの使用 | `bg-bg-primary text-text-primary` のようにトークン参照 |
| レスポンシブプレフィックス | `sm:`, `md:`, `lg:` でブレークポイント対応 |
| `@apply` の最小限使用 | 基本はユーティリティクラス直書き。`@apply` はベースリセット程度に |

### 2-4. やってはいけないパターン

| 禁止パターン | 理由 |
|-------------|------|
| `tailwind.config.js` でのテーマ定義 | v4では非推奨。`@theme` を使う |
| 任意値の多用 `px-[13px]` | デザイントークンの一貫性を破壊 |
| `@apply` の乱用 | ユーティリティファーストの利点を失う |
| `@tailwind base/components/utilities` | v4では `@import "tailwindcss"` に統合 |

---

## 3. Vitest

### 3-1. バージョン情報

| 項目 | 内容 |
|------|------|
| 使用バージョン | 4.x（最新安定版。**3.xからの移行時は破壊的変更に注意**） |
| テスト環境 | jsdom |
| カバレッジ | v8 provider |

### 3-2. 既知のハマりどころ

| # | ハマりポイント | 詳細 | 対策 |
|---|-------------|------|------|
| 1 | **Next.jsのパスエイリアス未解決** | `@/components/...` のようなパスエイリアスがVitestで解決できない | `vitest.config.ts` に `resolve.alias` を設定し、tsconfigのpathsと同期 |
| 2 | **jsdom環境の制限** | jsdomはLocalStorageを提供するが一部制限あり（QuotaExceededErrorの再現が困難） | カスタムモック（`mock-storage.ts`）で制御 |
| 3 | **React Testing Libraryとの統合** | `@testing-library/react` がReact 19に対応したバージョンか確認が必要 | `@testing-library/react` v16以上を使用 |
| 4 | **globals: trueのimport省略** | `globals: true` を設定すると `describe/it/expect` のimportが不要だが、TypeScriptの型エラーが出る場合がある | `tsconfig.json` の `types` に `vitest/globals` を追加 |
| 5 | **vi.useFakeTimersとDate** | `vi.useFakeTimers()` 使用時、`new Date()` のモックが期待通りに動かないケースがある | テストの setup/teardown で `vi.useRealTimers()` を呼ぶ。日付文字列を直接渡すAPI設計を優先 |

### 3-3. 推奨される使い方

| パターン | 説明 |
|---------|------|
| `vi.spyOn(Math, 'random')` | 抽選ロジックのテストで乱数を固定 |
| `vi.fn()` でモック関数 | コールバックのテスト |
| `beforeEach` でモックリセット | 各テスト間のモック状態をクリーン |
| テストファクトリ関数 | テストデータの生成を `createGameState()` 等で統一 |

### 3-4. やってはいけないパターン

| 禁止パターン | 理由 |
|-------------|------|
| テスト間の状態共有 | テストの独立性が失われる。各テストは独立して実行可能にする |
| 本番LocalStorageへの直接アクセス | テスト環境を汚染する。モックを使用 |
| `setTimeout` を含むテストで実時間待機 | テストが遅くなる。`vi.useFakeTimers()` + `vi.advanceTimersByTime()` を使用 |
| スナップショットテストの乱用 | 変更に弱いテストになる。アサーションで明示的に検証 |

---

## 4. React 19

### 4-1. バージョン情報

| 項目 | 内容 |
|------|------|
| 使用バージョン | 19.x（Next.js 15にバンドル。**パッチ済み最新版を使用**） |
| 注意点 | Next.js 15はReact 19を前提としている |

> **セキュリティ警告**: React 19のServer Components（Flightプロトコル）に安全でないデシリアライゼーションによるRCE脆弱性（CVE-2025-55182, CVSS 10.0）が発見され、実際に悪用が確認されている。本プロダクトはServer Componentsの動的データ処理を行わないが、Next.jsのパッチ済みバージョンを使用することで自動的に修正される。

### 4-2. 既知のハマりどころ

| # | ハマりポイント | 詳細 | 対策 |
|---|-------------|------|------|
| 1 | **`ref` がpropsとして渡せるようになった** | React 19では `forwardRef` が不要に。ただし既存のライブラリではまだ `forwardRef` を使っている場合がある | 新規コンポーネントでは `ref` をpropsで直接受け取る。`forwardRef` は不要 |
| 2 | **`use` フック** | React 19で新しい `use` フックが追加。PromiseやContextを直接読み取れる | 本プロダクトではMVP段階で使用しない。Suspense連携が必要な場合に検討 |
| 3 | **Actions（form actions）** | `<form action={...}>` でサーバーアクション対応 | 本プロダクトはフォームを持たないため使用しない |
| 4 | **サードパーティライブラリの互換性** | 一部のライブラリがReact 19に未対応で `--legacy-peer-deps` が必要になる場合がある | `npm install` 時にpeer dependencyの警告を確認。必要に応じて `--legacy-peer-deps` |

### 4-3. 推奨される使い方

| パターン | 説明 |
|---------|------|
| 関数コンポーネント + Hooks | クラスコンポーネントは使用しない |
| `useState` + `useEffect` | 基本的な状態管理パターン |
| `useCallback` / `useMemo` | 必要な場合のみ。過度な最適化は避ける |
| ErrorBoundary | クラスコンポーネントで実装（React 19でも変わらず） |

---

## 5. React Testing Library

### 5-1. バージョン情報

| 項目 | 内容 |
|------|------|
| 使用バージョン | 16.x（React 19対応版） |
| 付随ライブラリ | `@testing-library/jest-dom`（マッチャー拡張） |

### 5-2. 既知のハマりどころ

| # | ハマりポイント | 詳細 | 対策 |
|---|-------------|------|------|
| 1 | **`act()` 警告** | 非同期の状態更新を `act()` で囲まないと警告が出る | `renderHook` や `waitFor` を正しく使用する |
| 2 | **`renderHook` のimport先** | `@testing-library/react` からimportする（`@testing-library/react-hooks` は非推奨） | `import { renderHook } from '@testing-library/react'` |

### 5-3. 推奨される使い方

| パターン | 説明 |
|---------|------|
| `renderHook` でカスタムフックをテスト | `useGameState` 等のテストに使用 |
| `screen.getByRole` で要素取得 | アクセシビリティに基づいたクエリを優先 |
| `userEvent` でユーザー操作をシミュレート | `@testing-library/user-event` を使用（`fireEvent` より推奨） |

---

## 6. ライブラリバージョン固定方針

| 方針 | 詳細 |
|------|------|
| `package-lock.json` | コミット必須。バージョンの再現性を確保 |
| メジャーバージョン | 明示的に固定（例: `"next": "^15.0.0"`） |
| 依存の最小化 | 不要なライブラリを入れない。本プロダクトの依存は最小限に抑える |

### 想定される dependencies

```json
{
  "dependencies": {
    "next": "^15.5.10",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/postcss": "^4.0.0",
    "vitest": "^4.0.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "jsdom": "^26.0.0"
  }
}
```

> **注意**:
> - `next` は `^15.5.10` 以上（CVE-2025-66478 パッチ済みバージョン）
> - `vitest` は4.xを使用。3.xからの主な破壊的変更: `poolOptions` 廃止、`vi.fn().getMockName()` のデフォルト値変更、`coverage.all` オプション廃止
> - `jsdom` は26.x以上を使用（25.x は `punycode` 非推奨警告が発生）
> - `postcss.config.mjs` で `@tailwindcss/postcss` プラグインの設定が必要（下記参照）

### PostCSS設定（Next.js 15 + Tailwind CSS v4）

プロジェクトルートに `postcss.config.mjs` を作成:

```js
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

---

作成日: 2026-02-10
