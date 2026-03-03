/**
 * 当選履歴一覧パネル
 *
 * 過去の10連ガチャ結果をサマリー表示する折りたたみ可能なパネル。
 * 直近100件を新しい順に表示し、損益を色分けする。
 * design-system.md セクション6-2（カード規約）準拠。
 */

"use client";

import { useState } from "react";
import type { DrawHistory } from "@/types";

/** HistoryPanel の props 型定義 */
type HistoryPanelProps = {
  /** 抽選履歴配列（配列先頭が最古、末尾が最新） */
  history: DrawHistory[];
};

/** 金額をカンマ区切りでフォーマットする */
function formatAmount(amount: number): string {
  return amount.toLocaleString("ja-JP");
}

/**
 * ISO 8601 タイムスタンプを YYYY/MM/DD HH:MM 形式に変換する
 *
 * ユーザーのローカルタイムゾーンで表示する。
 */
function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}/${month}/${day} ${hours}:${minutes}`;
}

/** 損益額を計算する */
function calculateProfit(totalWin: number, cost: number): number {
  return totalWin - cost;
}

/** 損益の符号付き表示文字列を生成する */
function formatProfit(profit: number): string {
  const formatted = formatAmount(Math.abs(profit));
  if (profit > 0) return `+${formatted}`;
  if (profit < 0) return `-${formatted}`;
  return `${formatted}`;
}

export function HistoryPanel({ history }: HistoryPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  // 新しい順に並べ替え（元配列は変更しない）
  const reversedHistory = [...history].reverse();

  /** 折りたたみトグル */
  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <section
      className="w-full bg-bg-secondary rounded-lg shadow-md"
      aria-label="当選履歴"
    >
      {/* ヘッダー（折りたたみトグル） — h2がbuttonを内包する構造 */}
      <h2 className="m-0">
        <button
          type="button"
          className="flex w-full items-center justify-between p-4 text-left"
          onClick={handleToggle}
          aria-expanded={isOpen}
          aria-controls="history-panel-content"
        >
          <span className="text-lg font-semibold text-text-primary">
            当選履歴
            <span className="ml-2 text-sm font-normal text-text-muted">
              ({history.length})
            </span>
          </span>
          <span
            className={`text-text-secondary transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          >
            ▼
          </span>
        </button>
      </h2>

      {/* コンテンツ — hidden属性で表示制御（aria-controlsの参照先を常にDOMに保持） */}
      <div
        id="history-panel-content"
        className="max-h-80 overflow-y-auto px-4 pb-4"
        hidden={!isOpen}
      >
          {reversedHistory.length === 0 ? (
            <p className="text-center text-sm text-text-muted py-4">
              まだ抽選履歴がありません
            </p>
          ) : (
            <ul className="space-y-2" role="list">
              {reversedHistory.map((entry) => {
                const profit = calculateProfit(entry.totalWin, entry.cost);
                const profitColorClass =
                  profit > 0
                    ? "text-success"
                    : profit < 0
                      ? "text-error"
                      : "text-text-secondary";

                return (
                  <li
                    key={entry.id}
                    className="rounded-md bg-bg-tertiary p-3"
                  >
                    {/* 上段: 日時 */}
                    <p className="text-xs text-text-muted mb-1">
                      {formatTimestamp(entry.timestamp)}
                    </p>

                    {/* 下段: 金額情報 */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex gap-3">
                        <span className="text-text-secondary">
                          購入: {formatAmount(entry.cost)}
                        </span>
                        <span className="text-text-secondary">
                          当選: {formatAmount(entry.totalWin)}
                        </span>
                      </div>
                      <span
                        className={`font-semibold tabular-nums ${profitColorClass}`}
                      >
                        {formatProfit(profit)}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
    </section>
  );
}
