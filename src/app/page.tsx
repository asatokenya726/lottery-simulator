"use client";

import { useState, useEffect, useCallback } from "react";
import type { DrawHistory } from "@/types";
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
import { FirstVisitModal } from "@/components/FirstVisitModal";
import { RefillNotice } from "@/components/RefillNotice";
import { ResetButton } from "@/components/ResetButton";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";

export default function Home() {
  const {
    gameState,
    executeDraw,
    canDraw,
    checkAndRefill,
    resetAll,
    dismissFirstVisit,
  } = useGameState();

  const { latestDraw, addDraw, clearHistory } = useDrawHistory();

  const [isDrawing, setIsDrawing] = useState(false);
  const [showRefillNotice, setShowRefillNotice] = useState(false);

  // 初回マウント時に資金補給チェック
  useEffect(() => {
    if (checkAndRefill()) {
      setShowRefillNotice(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /** 10連ガチャ実行 */
  const handleDraw = useCallback(() => {
    const results = executeDraw();
    if (results.length === 0) return;

    const cost = calculateDrawCost(
      DEFAULT_CONFIG.ticketPrice,
      GAME_CONSTANTS.DRAW_COUNT
    );
    const totalWin = calculateTotalWinFromResults(results);

    const newDraw: DrawHistory = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      cost,
      totalWin,
      results,
    };

    addDraw(newDraw);
    setIsDrawing(true);
  }, [executeDraw, addDraw]);

  /** アニメーション完了時 */
  const handleAnimationComplete = useCallback(() => {
    setIsDrawing(false);

    // アニメーション完了後に補給チェック
    if (checkAndRefill()) {
      setShowRefillNotice(true);
    }
  }, [checkAndRefill]);

  /** データリセット */
  const handleReset = useCallback(() => {
    resetAll();
    clearHistory();
    setIsDrawing(false);
    setShowRefillNotice(false);
  }, [resetAll, clearHistory]);

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 items-start justify-center px-4 py-8 lg:px-8">
        <main className="flex w-full max-w-md flex-col items-center gap-6">
          <h1 className="text-4xl font-bold text-accent-gold">
            宝くじシミュレーター
          </h1>

          <BalanceDisplay balance={gameState.balance} />

          <GachaButton
            onDraw={handleDraw}
            canDraw={canDraw}
            isDrawing={isDrawing}
          />

          <RefillNotice
            isVisible={showRefillNotice}
            amount={GAME_CONSTANTS.REFILL_AMOUNT}
            onDismiss={() => setShowRefillNotice(false)}
          />

          {isDrawing && latestDraw && (
            <DrawAnimation
              results={latestDraw.results}
              onComplete={handleAnimationComplete}
            />
          )}

          {!isDrawing && latestDraw && (
            <DrawResultList results={latestDraw.results} />
          )}

          <StatsPanel
            totalSpent={gameState.totalSpent}
            totalWon={gameState.totalWon}
            totalDraws={gameState.totalDraws}
            totalTickets={gameState.totalTickets}
            winCountByLevel={gameState.winCountByLevel}
          />

          <ResetButton onReset={handleReset} />
        </main>
      </div>

      <DisclaimerBanner />

      <FirstVisitModal
        isOpen={gameState.isFirstVisit}
        onAccept={dismissFirstVisit}
      />
    </div>
  );
}
