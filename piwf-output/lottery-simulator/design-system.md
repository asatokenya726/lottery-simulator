# 宝くじシミュレーター デザインシステム文書
> 最終更新: 2026-02-10
> 対応要件定義書: requirements-v1.1（M-10）
> 技術スタック: Tailwind CSS v4（CSS-first設定）

---

## 1. デザインコンセプト

| 項目 | 内容 |
|------|------|
| テーマ | ダーク基調 + ゴールドアクセント（宝くじの「夢」「ゴージャス」感を演出） |
| トーン | ソシャゲ風のワクワク感 + 落ち着きのある大人のエンタメ |
| モバイルファースト | 375px〜1920px対応。スマホ80%想定 |

---

## 2. カラーパレット

### 2-1. ベースカラー

| トークン名 | HEX | 用途 |
|-----------|------|------|
| `--color-bg-primary` | `#0F172A` | メイン背景（slate-900） |
| `--color-bg-secondary` | `#1E293B` | カード/パネル背景（slate-800） |
| `--color-bg-tertiary` | `#334155` | ホバー/アクティブ背景（slate-700） |
| `--color-surface` | `#1E293B` | ボタン等のサーフェス |

### 2-2. テキストカラー

| トークン名 | HEX | 用途 |
|-----------|------|------|
| `--color-text-primary` | `#F8FAFC` | メインテキスト（slate-50） |
| `--color-text-secondary` | `#94A3B8` | サブテキスト（slate-400） |
| `--color-text-muted` | `#64748B` | 注釈テキスト（slate-500） |

### 2-3. アクセントカラー

| トークン名 | HEX | 用途 |
|-----------|------|------|
| `--color-accent-gold` | `#F59E0B` | メインアクセント（amber-500）。CTA、当選ハイライト |
| `--color-accent-gold-light` | `#FCD34D` | ゴールド明るめ（amber-300）。ホバー |
| `--color-accent-gold-dark` | `#D97706` | ゴールド暗め（amber-600）。アクティブ |

### 2-4. セマンティックカラー

| トークン名 | HEX | 用途 |
|-----------|------|------|
| `--color-win` | `#F59E0B` | 当選表示（amber-500） |
| `--color-win-jackpot` | `#EF4444` | 高額当選（1等〜2等）（red-500） |
| `--color-lose` | `#64748B` | ハズレ表示（slate-500） |
| `--color-success` | `#22C55E` | 成功（補給完了等）（green-500） |
| `--color-warning` | `#EAB308` | 警告（yellow-500） |
| `--color-error` | `#EF4444` | エラー（red-500） |
| `--color-info` | `#3B82F6` | 情報（blue-500） |

### 2-5. 当選等級カラー

| 等級 | カラー | HEX | 演出イメージ |
|------|--------|------|------------|
| 1等 | レインボー/レッド | `#EF4444` | 最も派手。背景フラッシュ |
| 1等前後賞 | オレンジ | `#F97316` | 1等に次ぐ派手さ |
| 1等組違い賞 | ピンク | `#EC4899` | 中程度の演出 |
| 2等 | パープル | `#A855F7` | 中程度の演出 |
| 3等 | ブルー | `#3B82F6` | 控えめな演出 |
| 4等 | ティール | `#14B8A6` | 控えめな演出 |
| 5等 | グリーン | `#22C55E` | 小さな当選表示 |
| 6等 | ライム | `#84CC16` | 小さな当選表示 |
| 7等 | グレー明 | `#94A3B8` | ほぼハズレと同じだが当選マーク |
| ハズレ | グレー暗 | `#475569` | 控えめ |

---

## 3. タイポグラフィ

### 3-1. フォントファミリー

| 用途 | フォント | フォールバック |
|------|---------|-------------|
| 本文 | システムフォント | `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif` |
| 金額表示 | `"Tabular Nums"` 付きシステムフォント | `font-variant-numeric: tabular-nums` で等幅数字 |

**方針**: Webフォントは使用しない（パフォーマンス優先。初回ロード3秒以内の要件）

### 3-2. フォントサイズ

| トークン名 | サイズ | 行高 | 用途 |
|-----------|--------|------|------|
| `--text-xs` | 12px (0.75rem) | 1.5 | 注釈、フッター |
| `--text-sm` | 14px (0.875rem) | 1.5 | サブテキスト、ラベル |
| `--text-base` | 16px (1rem) | 1.5 | 本文、ボタンテキスト |
| `--text-lg` | 18px (1.125rem) | 1.5 | セクション見出し |
| `--text-xl` | 20px (1.25rem) | 1.4 | カード見出し |
| `--text-2xl` | 24px (1.5rem) | 1.3 | ページ見出し |
| `--text-3xl` | 30px (1.875rem) | 1.2 | 残高表示（メイン） |
| `--text-4xl` | 36px (2.25rem) | 1.1 | 当選金額（大） |

### 3-3. フォントウェイト

| トークン名 | ウェイト | 用途 |
|-----------|---------|------|
| `--font-normal` | 400 | 本文 |
| `--font-medium` | 500 | ラベル、小見出し |
| `--font-semibold` | 600 | ボタン、カード見出し |
| `--font-bold` | 700 | ページ見出し、金額 |
| `--font-extrabold` | 800 | 当選金額（特大） |

---

## 4. スペーシング

### 4-1. スペーシングスケール

Tailwind CSSのデフォルトスケール（4pxベース）を使用:

| トークン | 値 | 用途 |
|---------|-----|------|
| `1` | 4px | 最小間隔（アイコンとテキスト） |
| `2` | 8px | インライン要素間 |
| `3` | 12px | コンパクトな内部パディング |
| `4` | 16px | 標準的なパディング |
| `5` | 20px | - |
| `6` | 24px | セクション内の間隔 |
| `8` | 32px | セクション間の間隔 |
| `10` | 40px | - |
| `12` | 48px | 大きなセクション間 |
| `16` | 64px | ページレベルの間隔 |

### 4-2. レイアウトルール

| 対象 | ルール |
|------|--------|
| ページ全体の水平パディング | モバイル: `px-4` (16px) / デスクトップ: `px-8` (32px) |
| コンテンツ最大幅 | `max-w-md` (448px) — モバイルファーストの1カラム |
| カード内パディング | `p-4` (16px) |
| セクション間マージン | `mb-6` (24px) |
| ボタン内パディング | `px-6 py-3` (24px / 12px) |

---

## 5. 角丸・影

### 5-1. 角丸（Border Radius）

| トークン | 値 | 用途 |
|---------|-----|------|
| `--radius-sm` | 6px | 小さなバッジ、チップ |
| `--radius-md` | 8px | ボタン |
| `--radius-lg` | 12px | カード |
| `--radius-xl` | 16px | モーダル |
| `--radius-full` | 9999px | アイコンボタン、アバター |

### 5-2. 影（Box Shadow）

| トークン | 値 | 用途 |
|---------|-----|------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.3)` | ボタン |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.4)` | カード |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.5)` | モーダル |
| `--shadow-glow` | `0 0 20px rgba(245,158,11,0.3)` | ゴールドグロー（当選演出） |

---

## 6. コンポーネント規約

### 6-1. ボタン

| Variant | 背景 | テキスト | 用途 |
|---------|------|---------|------|
| `primary` | `--color-accent-gold` | white | CTAボタン（10連ガチャ） |
| `secondary` | `--color-bg-tertiary` | `--color-text-primary` | セカンダリアクション |
| `danger` | `--color-error` | white | 破壊的操作（リセット） |
| `ghost` | transparent | `--color-text-secondary` | テキストボタン |

| Size | パディング | フォントサイズ |
|------|----------|-------------|
| `sm` | `px-3 py-1.5` | `--text-sm` |
| `md` | `px-6 py-3` | `--text-base` |
| `lg` | `px-8 py-4` | `--text-lg` |

| State | 変化 |
|-------|------|
| hover | 明度+10%、カーソルpointer |
| active | 明度-5%、scale(0.98) |
| disabled | opacity: 0.5、cursor: not-allowed |
| focus-visible | ring-2 ring-offset-2 ring-amber-500 |

### 6-2. カード

```
背景: --color-bg-secondary
角丸: --radius-lg
影: --shadow-md
パディング: p-4
```

### 6-3. バッジ

```
用途: 等級表示
角丸: --radius-sm
パディング: px-2 py-0.5
フォントサイズ: --text-xs
フォントウェイト: --font-semibold
背景色: 各等級カラー（セクション2-5参照）
テキスト: white
```

### 6-4. モーダル

```
背景オーバーレイ: rgba(0, 0, 0, 0.7) + backdrop-blur-sm
コンテンツ背景: --color-bg-secondary
角丸: --radius-xl
影: --shadow-lg
パディング: p-6
最大幅: max-w-sm
```

---

## 7. アニメーション

### 7-1. トランジション

| 用途 | プロパティ | duration | easing |
|------|----------|----------|--------|
| ボタンホバー | background-color, transform | 150ms | ease-in-out |
| カード出現 | opacity, transform | 300ms | ease-out |
| 数値変化（残高） | （CSS counter不使用。JS実装） | 500ms | ease-out |

### 7-2. 当選演出アニメーション（MVP: 簡易版）

| 等級 | 演出 |
|------|------|
| 当選（全等級） | カードの背景色が等級カラーに変化（300ms fade-in） + テキスト強調（bold + scale） |
| ハズレ | 控えめなフェードイン（200ms）。グレー背景のまま |

**Should版（等級別演出）**: 1等〜2等で背景フラッシュ + パーティクル。CSSアニメーション + `@keyframes` で実装。

---

## 8. レスポンシブブレークポイント

| ブレークポイント | 幅 | 用途 |
|----------------|------|------|
| デフォルト（モバイル） | 0〜639px | 1カラム。全コンテンツ縦積み |
| `sm` | 640px〜 | 小型タブレット。パディング拡大 |
| `md` | 768px〜 | タブレット。サイドパネル検討（将来） |
| `lg` | 1024px〜 | デスクトップ。コンテンツ中央寄せ |

### MVP段階のレイアウト

```
モバイル（デフォルト）:
┌──────────────────┐
│ ヘッダー（ロゴ）   │
│ 残高表示          │
│ [10連ガチャボタン] │
│ 抽選結果表示      │
│ 累計収支パネル    │
│ フッター（注意喚起）│
└──────────────────┘

デスクトップ（lg:）:
┌──────────────────────────┐
│       ヘッダー（ロゴ）      │
│  ┌─────────┬──────────┐  │
│  │ 残高表示  │ 累計収支  │  │
│  ├─────────┴──────────┤  │
│  │  [10連ガチャボタン]   │  │
│  │  抽選結果表示         │  │
│  └────────────────────┘  │
│       フッター（注意喚起）   │
└──────────────────────────┘
```

---

## 9. Tailwind CSS v4 トークン実装

### globals.css でのトークン定義

```css
@import "tailwindcss";

@theme {
  /* ベースカラー */
  --color-bg-primary: #0F172A;
  --color-bg-secondary: #1E293B;
  --color-bg-tertiary: #334155;
  --color-surface: #1E293B;

  /* テキストカラー */
  --color-text-primary: #F8FAFC;
  --color-text-secondary: #94A3B8;
  --color-text-muted: #64748B;

  /* アクセントカラー */
  --color-accent-gold: #F59E0B;
  --color-accent-gold-light: #FCD34D;
  --color-accent-gold-dark: #D97706;

  /* セマンティックカラー */
  --color-win: #F59E0B;
  --color-win-jackpot: #EF4444;
  --color-lose: #64748B;
  --color-success: #22C55E;
  --color-warning: #EAB308;
  --color-error: #EF4444;
  --color-info: #3B82F6;

  /* 等級別カラー */
  --color-prize-1st: #EF4444;
  --color-prize-1st-adjacent: #F97316;
  --color-prize-1st-group: #EC4899;
  --color-prize-2nd: #A855F7;
  --color-prize-3rd: #3B82F6;
  --color-prize-4th: #14B8A6;
  --color-prize-5th: #22C55E;
  --color-prize-6th: #84CC16;
  --color-prize-7th: #94A3B8;
  --color-prize-miss: #475569;

  /* 角丸 */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;

  /* 影（ダークテーマ向けに不透明度を高めに設定） */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5);
  --shadow-glow: 0 0 20px rgba(245, 158, 11, 0.3);
}
```

### 使用例

```html
<!-- Tailwindクラスでトークンを参照 -->
<div class="bg-bg-primary text-text-primary">
  <button class="bg-accent-gold hover:bg-accent-gold-light rounded-md px-6 py-3">
    10連ガチャ！
  </button>
</div>
```

---

## 10. 禁止パターン

| 禁止 | 理由 | 代替 |
|------|------|------|
| Tailwindの任意値 `px-[13px]` | デザイントークンの一貫性を破壊 | 最も近いスケール値を使用 |
| インラインstyle属性 | 管理不能 | Tailwindクラスを使用 |
| 直接のカラーコード `bg-[#FF0000]` | トークンを経由しない | セマンティックカラートークンを使用 |
| `!important` | 詳細度の問題を隠蔽 | クラスの順序で解決 |

---

作成日: 2026-02-10
