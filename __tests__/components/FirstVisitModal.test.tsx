import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FirstVisitModal } from '@/components/FirstVisitModal';

describe('FirstVisitModal', () => {
  /** テスト間のモック汚染を防止 */
  const defaultProps = {
    isOpen: true,
    onAccept: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================
  // 基本動作
  // ===========================================

  describe('基本動作', () => {
    it('isOpen=true でモーダルが表示される', () => {
      render(<FirstVisitModal {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('isOpen=false でモーダルが非表示になる', () => {
      render(<FirstVisitModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('「了承して始める」ボタンが表示される', () => {
      render(<FirstVisitModal {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: '了承して始める' })
      ).toBeInTheDocument();
    });

    it('「了承して始める」ボタンクリックで onAccept が呼ばれる', async () => {
      const onAccept = vi.fn();
      render(<FirstVisitModal {...defaultProps} onAccept={onAccept} />);

      await userEvent.click(
        screen.getByRole('button', { name: '了承して始める' })
      );

      expect(onAccept).toHaveBeenCalledTimes(1);
    });

    it('利用規約リンク（/terms）が存在する', () => {
      render(<FirstVisitModal {...defaultProps} />);

      const termsLink = screen.getByRole('link', { name: '利用規約' });
      expect(termsLink).toHaveAttribute('href', '/terms');
    });

    it('「ぃえん」通貨の説明テキストが表示される', () => {
      render(<FirstVisitModal {...defaultProps} />);

      expect(
        screen.getByText(
          /ゲーム内通貨「ぃえん」は現実の通貨との交換はできません/
        )
      ).toBeInTheDocument();
    });

    it('シミュレーションであることが表示される', () => {
      render(<FirstVisitModal {...defaultProps} />);

      expect(screen.getByText(/シミュレーション/)).toBeInTheDocument();
    });
  });

  // ===========================================
  // 閉鎖制限（法的リスク回避）
  // ===========================================

  describe('閉鎖制限', () => {
    it('Escape キー押下でモーダルが閉じない（onAccept が呼ばれない）', async () => {
      const onAccept = vi.fn();
      render(<FirstVisitModal isOpen={true} onAccept={onAccept} />);

      await userEvent.keyboard('{Escape}');

      expect(onAccept).not.toHaveBeenCalled();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('背景オーバーレイクリックでモーダルが閉じない（onAccept が呼ばれない）', async () => {
      const onAccept = vi.fn();
      render(<FirstVisitModal isOpen={true} onAccept={onAccept} />);

      // オーバーレイ要素をクリック
      const overlay = screen.getByTestId('modal-overlay');
      await userEvent.click(overlay);

      expect(onAccept).not.toHaveBeenCalled();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  // ===========================================
  // アクセシビリティ
  // ===========================================

  describe('アクセシビリティ', () => {
    it('role="dialog" が設定されている', () => {
      render(<FirstVisitModal {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('aria-modal="true" が設定されている', () => {
      render(<FirstVisitModal {...defaultProps} />);

      expect(screen.getByRole('dialog')).toHaveAttribute(
        'aria-modal',
        'true'
      );
    });

    it('aria-labelledby でモーダルタイトルが参照されている', () => {
      render(<FirstVisitModal {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      const labelledBy = dialog.getAttribute('aria-labelledby');
      expect(labelledBy).toBeTruthy();

      // 参照先の要素が存在し、タイトルテキストを含む
      const titleElement = document.getElementById(labelledBy!);
      expect(titleElement).toBeInTheDocument();
      expect(titleElement).toHaveTextContent('ご利用にあたって');
    });

    it('フォーカストラップ: Tab キーでモーダル外にフォーカスが移らない', async () => {
      render(<FirstVisitModal {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      const focusableElements = dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])'
      );

      // フォーカス可能な要素が存在する
      expect(focusableElements.length).toBeGreaterThan(0);

      // 最後のフォーカス可能な要素にフォーカスを設定
      const lastElement = focusableElements[focusableElements.length - 1];
      lastElement.focus();

      // Tab を押すと最初の要素に戻る
      await userEvent.tab();
      expect(document.activeElement).toBe(focusableElements[0]);
    });

    it('フォーカストラップ: Shift+Tab キーでモーダル外にフォーカスが移らない', async () => {
      render(<FirstVisitModal {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      const focusableElements = dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])'
      );

      // 最初のフォーカス可能な要素にフォーカスを設定
      const firstElement = focusableElements[0];
      firstElement.focus();

      // Shift+Tab を押すと最後の要素に移る
      await userEvent.tab({ shift: true });
      expect(document.activeElement).toBe(
        focusableElements[focusableElements.length - 1]
      );
    });
  });
});
