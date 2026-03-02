'use client';

import { useEffect } from 'react';

/** 自動非表示までの待機時間（ミリ秒） */
const AUTO_DISMISS_MS = 5_000;

/** RefillNotice の props 型定義 */
type RefillNoticeProps = {
  /** 通知の表示状態 */
  isVisible: boolean;
  /** 補給額（ぃえん） */
  amount: number;
  /** 通知を閉じるコールバック */
  onDismiss: () => void;
};

/** 資金補給時のバナー通知コンポーネント */
export function RefillNotice({ isVisible, amount, onDismiss }: RefillNoticeProps) {
  // isVisible が true の間、5秒後に自動で onDismiss を呼ぶ
  useEffect(() => {
    if (!isVisible) return;

    const timerId = setTimeout(() => {
      onDismiss();
    }, AUTO_DISMISS_MS);

    return () => {
      clearTimeout(timerId);
    };
  }, [isVisible, onDismiss]);

  return (
    <div
      role="alert"
      aria-atomic="true"
      aria-hidden={!isVisible}
      className={`
        rounded-lg p-4 bg-success/10
        transition-opacity duration-300 ease-out
        ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-success text-sm font-medium">
          {amount.toLocaleString('ja-JP')} ぃえん補給されました
        </p>
        <button
          type="button"
          onClick={onDismiss}
          tabIndex={isVisible ? 0 : -1}
          className="text-success/70 hover:text-success text-lg leading-none cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-success"
          aria-label="通知を閉じる"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
