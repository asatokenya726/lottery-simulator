# 宝くじシミュレーター 実装ハンドオフ文書
> 生成日: 2026-02-10

## プロジェクト概要

宝くじの当選確率を「10連ガチャ」のUIで体感できるWebアプリ。ゲーム内通貨「ぃえん」と毎日の資金補給サイクルにより、ノーリスクで継続的に宝くじ体験を提供するエンターテインメント。

## 成果物一覧

| Phase | ファイル | 概要 |
|---|---|---|
| 0 | `piwf-output/lottery-simulator/phase0-validation.md` | コンセプト定義、競合分析、技術フィージビリティ |
| 1 | `piwf-output/lottery-simulator/requirements-v1.md` | 要件定義書（Must/Should/Could分類、データモデル、技術スタック、工数見積もり） |
| 2 | `piwf-output/lottery-simulator/design-doc-v1.md` | 設計メモ（ディレクトリ構造、レイヤー設計、データフロー、マイグレーション、セキュリティ） |
| 2 | `piwf-output/lottery-simulator/legal-risk-analysis-v1.md` | 法務リスク分析（富くじ罪、賭博罪、景表法、著作権、依存症対策） |
| 3 | `piwf-output/lottery-simulator/api-design.md` | API設計書（内部モジュールインターフェース仕様、関数シグネチャ、命名規則） |
| 3 | `piwf-output/lottery-simulator/error-handling.md` | エラーハンドリング設計（エラー分類、レイヤー別対応方針、バリデーション仕様） |
| 3 | `piwf-output/lottery-simulator/test-strategy.md` | テスト戦略（単体/統合テスト方針、カバレッジ目標、CI/CD設計、モック方針） |
| 3 | `piwf-output/lottery-simulator/design-system.md` | デザインシステム（カラーパレット、タイポグラフィ、スペーシング、コンポーネント規約） |
| 3 | `piwf-output/lottery-simulator/library-notes.md` | ライブラリ対策（Next.js 16, Tailwind v4, Vitest, React 19のハマりどころ） |
| 3 | `piwf-output/lottery-simulator/task-breakdown.md` | タスク分割表（26タスク、依存関係図、Day 1〜15割り当て） |
| - | `CLAUDE.md`（プロジェクトルート） | 実装時の行動指針 |

## 申し送り事項サマリー

全Phaseの申し送りは消化済み。未消化の申し送りなし。

### Phase 0 → Phase 1（消化済み）
- SNSシェア機能: MVPはテキストベースのみ → ✅ 完了

### Phase 1 → Phase 2（消化済み）
- PrizeConfigのid/version設計留意 → ✅ 対応済み
- スキーママイグレーション戦略 → ✅ design-doc-v1で設計
- Tailwind CSS v4の設定変更 → ✅ design-doc-v1で留意事項記載

## 実装開始ガイド

1. **CLAUDE.md を読む** — 実装時の行動指針、コーディング規約、禁止事項
2. **タスク分割表を確認** — `task-breakdown.md` で作業順序と依存関係を把握
3. **各タスクの実装時に参照する設計文書**:
   - ロジック実装 → `api-design.md`（関数インターフェース仕様）
   - エラー処理 → `error-handling.md`（エラー分類・対応方針）
   - UI実装 → `design-system.md`（カラー・タイポ・コンポーネント規約）
   - テスト作成 → `test-strategy.md`（テスト方針・モック戦略）
   - ライブラリの罠 → `library-notes.md`（ハマりどころ・禁止パターン）
   - 法的要件 → `legal-risk-analysis-v1.md`（利用規約に含める項目）
   - データモデル → `requirements-v1.md`（セクション5）

---

作成日: 2026-02-10
