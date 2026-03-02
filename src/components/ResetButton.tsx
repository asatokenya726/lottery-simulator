'use client';

import { useState } from 'react';

/** ResetButton の props 型定義 */
type ResetButtonProps = {
  /** リセット実行コールバック */
  onReset: () => void;
};

/** 確認ID（aria-describedby用） */
const CONFIRM_DESC_ID = 'reset-confirm-description';

/**
 * 確認ダイアログ付きデータリセットボタン
 *
 * トリガーボタンは ghost 風スタイル（text-error のみ）を採用。
 * デザインシステムの danger variant（bg-error）はモーダル内の
 * 最終確認ボタンに使用し、トリガーは控えめにすることで
 * 誤操作を防ぐUX判断。
 */
export function ResetButton({ onReset }: ResetButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  /** 確認ダイアログを開く */
  const handleOpenConfirm = () => {
    setIsConfirming(true);
  };

  /** リセットを実行してダイアログを閉じる */
  const handleConfirmReset = () => {
    onReset();
    setIsConfirming(false);
  };

  /** キャンセルしてダイアログを閉じる */
  const handleCancel = () => {
    setIsConfirming(false);
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleOpenConfirm}
        className="text-error text-sm font-medium cursor-pointer transition-colors hover:text-error/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error"
      >
        データをリセット
      </button>

      {isConfirming && (
        <div
          role="alertdialog"
          aria-describedby={CONFIRM_DESC_ID}
          className="mt-3 bg-bg-secondary rounded-lg p-4 border border-error/30"
        >
          <p id={CONFIRM_DESC_ID} className="text-text-secondary text-sm mb-3">
            全てのゲームデータが削除されます。この操作は元に戻せません。
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleConfirmReset}
              className="bg-error text-bg-primary px-4 py-2 text-sm font-semibold rounded-md cursor-pointer transition-colors hover:bg-error/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error"
            >
              リセット実行
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-bg-tertiary text-text-secondary px-4 py-2 text-sm font-semibold rounded-md cursor-pointer transition-colors hover:bg-bg-tertiary/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bg-tertiary"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
