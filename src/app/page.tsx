"use client";

import { useState, useCallback, useEffect } from "react";
import type { DrawResult } from "@/types";
import { useGameState } from "@/hooks/useGameState";
import { useDrawHistory } from "@/hooks/useDrawHistory";
import { calculateTotalWinFromResults } from "@/lib/stats-calculator";
import { calculateDrawCost } from "@/lib/currency-manager";
import { GAME_CONSTANTS } from "@/config/game-constants";
import { DEFAULT_CONFIG } from "@/config/prize-config";
import { BalanceDisplay } from "@/components/BalanceDisplay";
import { GachaButton } from "@/components/GachaButton";
import { DrawAnimation } from "@/components/DrawAnimation";
import { DrawResultList } from "@/components/DrawResultList";
import { StatsPanel } from "@/components/StatsPanel";
import { RefillNotice } from "@/components/RefillNotice";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { FirstVisitModal } from "@/components/FirstVisitModal";
import { ResetButton } from "@/components/ResetButton";
import { ShareButton } from "@/components/ShareButton";

export default function Home() {
  const {
    gameState,
    executeDraw,
    canDraw,
    checkAndRefill,
    resetAll,
    dismissFirstVisit,
  } = useGameState();

  const { addDraw, clearHistory } = useDrawHistory();

  // ローカルUI状態
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentResults, setCurrentResults] = useState<DrawResult[]>([]);
  const [showRefillNotice, setShowRefillNotice] = useState(false);

  // マウント時に資金補給をチェック
  useEffect(() => {
    const refilled = checkAndRefill();
    if (!refilled) return;

    // effect内の同期的setState回避のためタイマー経由で通知表示
    const id = setTimeout(() => setShowRefillNotice(true), 0);
    return () => clearTimeout(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /** 10連ガチャ実行 */
  const handleDraw = useCallback(() => {
    const results = executeDraw();
    if (results.length === 0) return;

    setIsDrawing(true);
    setCurrentResults(results);

    // DrawHistory エントリを作成して保存
    const cost = calculateDrawCost(
      DEFAULT_CONFIG.ticketPrice,
      GAME_CONSTANTS.DRAW_COUNT
    );
    const totalWin = calculateTotalWinFromResults(results);

    addDraw({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      cost,
      totalWin,
      results,
    });
  }, [executeDraw, addDraw]);

  /** アニメーション完了 */
  const handleAnimationComplete = useCallback(() => {
    setIsDrawing(false);
  }, []);

  /** 初回訪問モーダル了承 */
  const handleAcceptFirstVisit = useCallback(() => {
    dismissFirstVisit();
  }, [dismissFirstVisit]);

  /** 補給通知を閉じる */
  const handleDismissRefill = useCallback(() => {
    setShowRefillNotice(false);
  }, []);

  /** 全データリセット */
  const handleReset = useCallback(() => {
    clearHistory();
    resetAll();
    setCurrentResults([]);
    setIsDrawing(false);
  }, [clearHistory, resetAll]);

  return (
    <div className="flex min-h-screen flex-col">
      {/* メインコンテンツ */}
      <div className="flex flex-1 items-start justify-center px-4 py-8 lg:px-8">
        <main className="flex w-full max-w-md flex-col items-center gap-6">
          {/* タイトル */}
          <h1 className="text-4xl font-bold text-accent-gold">
            宝くじシミュレーター
          </h1>

          {/* 補給通知 */}
          <RefillNotice
            isVisible={showRefillNotice}
            amount={GAME_CONSTANTS.REFILL_AMOUNT}
            onDismiss={handleDismissRefill}
          />

          {/* 残高表示 */}
          <BalanceDisplay balance={gameState.balance} />

          {/* ガチャボタン */}
          <GachaButton
            onDraw={handleDraw}
            canDraw={canDraw}
            isDrawing={isDrawing}
          />

          {/* 抽選結果: アニメーション中はDrawAnimation、完了後はDrawResultList */}
          {currentResults.length > 0 && (
            <section className="w-full" aria-label="抽選結果セクション">
              {isDrawing ? (
                <DrawAnimation
                  results={currentResults}
                  onComplete={handleAnimationComplete}
                />
              ) : (
                <>
                  <DrawResultList results={currentResults} />
                  <ShareButton results={currentResults} />
                </>
              )}
            </section>
          )}

          {/* 累計収支パネル */}
          <StatsPanel
            totalSpent={gameState.totalSpent}
            totalWon={gameState.totalWon}
            totalDraws={gameState.totalDraws}
            totalTickets={gameState.totalTickets}
            winCountByLevel={gameState.winCountByLevel}
          />

          {/* リセットボタン */}
          <ResetButton onReset={handleReset} />
        </main>
      </div>

      {/* 免責フッター */}
      <DisclaimerBanner />

      {/* 初回訪問モーダル */}
      <FirstVisitModal
        isOpen={gameState.isFirstVisit}
        onAccept={handleAcceptFirstVisit}
      />
    </div>
  );
}
