'use client';

import { InsufficientFunds } from './InsufficientFunds';

/** GachaButton の props 型定義 */
type GachaButtonProps = {
  /** ガチャ実行コールバック */
  onDraw: () => void;
  /** 残高が購入額以上か */
  canDraw: boolean;
  /** 抽選中フラグ */
  isDrawing: boolean;
};

/** 10連ガチャ購入ボタンコンポーネント */
export function GachaButton({ onDraw, canDraw, isDrawing }: GachaButtonProps) {
  const isDisabled = !canDraw || isDrawing;
  /** 残高不足かつ抽選中でないときのみメッセージ表示 */
  const showInsufficientFunds = !canDraw && !isDrawing;

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={onDraw}
        disabled={isDisabled}
        aria-busy={isDrawing}
        className="bg-accent-gold text-white px-8 py-4 lg:px-10 lg:py-5 text-lg lg:text-xl font-semibold rounded-md shadow-sm transition-all enabled:hover:bg-accent-gold-light enabled:active:bg-accent-gold-dark enabled:active:scale-95 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-gold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isDrawing ? '抽選中...' : '10連ガチャ！（3,000ぃえん）'}
      </button>
      {showInsufficientFunds && <InsufficientFunds />}
    </div>
  );
}
