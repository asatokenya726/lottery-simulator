'use client';

import { useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

/** FirstVisitModal の props 型定義 */
type FirstVisitModalProps = {
  /** モーダルの表示状態 */
  isOpen: boolean;
  /** 了承ボタン押下時のコールバック */
  onAccept: () => void;
};

/** モーダルタイトルのID（aria-labelledby用） */
const MODAL_TITLE_ID = 'first-visit-modal-title';

/**
 * 初回訪問時モーダル
 *
 * 法務リスク分析書 セクション2-6 に準拠。
 * Escape キー・背景クリックでは閉じない（法的リスク回避）。
 * 「了承して始める」ボタンのみで閉鎖可能。
 */
export function FirstVisitModal({ isOpen, onAccept }: FirstVisitModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const acceptButtonRef = useRef<HTMLButtonElement>(null);

  /** Escape キーを無効化（法的リスク回避: 了承ボタンでのみ閉じる） */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isOpen) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      // フォーカストラップ: Tab キーでモーダル内をループ
      if (event.key === 'Tab') {
        const modal = modalRef.current;
        if (!modal) return;

        const focusableElements = modal.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          // Shift+Tab: 最初の要素からさらに戻ると最後の要素へ
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab: 最後の要素から進むと最初の要素へ
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    },
    [isOpen]
  );

  /** モーダル表示時にフォーカスを了承ボタンへ移動 */
  useEffect(() => {
    if (isOpen) {
      // フォーカスを了承ボタンに設定
      acceptButtonRef.current?.focus();
    }
  }, [isOpen]);

  /** キーボードイベントの登録 */
  useEffect(() => {
    if (!isOpen) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      data-testid="modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={MODAL_TITLE_ID}
        className="bg-bg-secondary rounded-xl shadow-lg max-w-sm w-full mx-4 p-6"
      >
        <h2
          id={MODAL_TITLE_ID}
          className="text-text-primary text-xl font-bold text-center mb-4"
        >
          ご利用にあたって
        </h2>

        <div className="text-text-secondary text-sm space-y-3">
          <p>
            このサイトは宝くじの当選確率を体感するための
            <strong className="text-warning">シミュレーション</strong>
            です。
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>実際のお金は使用されません</li>
            <li>実際の宝くじとは関係ありません</li>
            <li>
              ゲーム内通貨「ぃえん」は現実の通貨との交換はできません
            </li>
          </ul>
          <p className="text-text-muted text-xs">
            詳しくは
            <Link href="/terms" className="text-info underline mx-1">
              利用規約
            </Link>
            をご確認ください。
          </p>
        </div>

        <button
          ref={acceptButtonRef}
          type="button"
          onClick={onAccept}
          className="mt-6 w-full bg-accent-gold text-white py-3 rounded-md font-semibold shadow-sm transition-colors hover:bg-accent-gold-light active:bg-accent-gold-dark focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-gold"
        >
          了承して始める
        </button>
      </div>
    </div>
  );
}
