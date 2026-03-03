'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

/** ResetButton の props 型定義 */
type ResetButtonProps = {
  /** リセット実行コールバック */
  onReset: () => void;
};

/** 確認ダイアログのID（aria用） */
const CONFIRM_TITLE_ID = 'reset-confirm-title';
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
  const triggerButtonRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  /** 確認ダイアログ表示時にキャンセルボタンへフォーカス（誤操作防止） */
  useEffect(() => {
    if (isConfirming) {
      cancelButtonRef.current?.focus();
    }
  }, [isConfirming]);

  /** 確認ダイアログを開く */
  const handleOpenConfirm = () => {
    setIsConfirming(true);
  };

  /** ダイアログを閉じてトリガーボタンにフォーカスを戻す */
  const closeDialog = useCallback(() => {
    setIsConfirming(false);
    /** setState後のレンダリング完了を待ってフォーカスを戻す */
    requestAnimationFrame(() => {
      triggerButtonRef.current?.focus();
    });
  }, []);

  /** リセットを実行してダイアログを閉じる */
  const handleConfirmReset = () => {
    onReset();
    closeDialog();
  };

  /** キャンセルしてダイアログを閉じる */
  const handleCancel = () => {
    closeDialog();
  };

  /** Escapeキーでダイアログを閉じる（WAI-ARIA APGダイアログパターン準拠） */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeDialog();
    }
  };

  return (
    <div>
      <button
        ref={triggerButtonRef}
        type="button"
        onClick={handleOpenConfirm}
        aria-expanded={isConfirming}
        className="text-error text-sm font-medium cursor-pointer transition-colors hover:text-error/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error"
      >
        データをリセット
      </button>

      {isConfirming && (
        <div
          role="alertdialog"
          aria-labelledby={CONFIRM_TITLE_ID}
          aria-describedby={CONFIRM_DESC_ID}
          onKeyDown={handleKeyDown}
          className="mt-3 bg-bg-secondary rounded-lg p-4 border border-error/30"
        >
          <p
            id={CONFIRM_TITLE_ID}
            className="text-text-primary text-sm font-semibold mb-1"
          >
            データリセットの確認
          </p>
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
              ref={cancelButtonRef}
              type="button"
              onClick={handleCancel}
              className="bg-bg-tertiary text-text-secondary px-4 py-2 text-sm font-semibold rounded-md cursor-pointer transition-colors hover:bg-bg-tertiary/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-primary"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
