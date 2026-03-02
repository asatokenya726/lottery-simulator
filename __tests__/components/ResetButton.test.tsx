import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResetButton } from '@/components/ResetButton';

describe('ResetButton', () => {
  const defaultProps = {
    onReset: vi.fn(),
  };

  /** テスト間のモック汚染を防止 */
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================
  // 初期表示
  // ===========================================

  describe('初期表示', () => {
    it('「データをリセット」ボタンが表示される', () => {
      render(<ResetButton {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: 'データをリセット' })
      ).toBeInTheDocument();
    });

    it('初期状態では確認UIが表示されない', () => {
      render(<ResetButton {...defaultProps} />);

      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });

    it('初期状態では警告文が表示されない', () => {
      render(<ResetButton {...defaultProps} />);

      expect(
        screen.queryByText(/全てのゲームデータが削除されます/)
      ).not.toBeInTheDocument();
    });
  });

  // ===========================================
  // 確認ダイアログ表示
  // ===========================================

  describe('確認ダイアログ表示', () => {
    it('ボタンクリックで確認UIが表示される', async () => {
      render(<ResetButton {...defaultProps} />);

      await userEvent.click(
        screen.getByRole('button', { name: 'データをリセット' })
      );

      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    it('確認UIに警告文が含まれる', async () => {
      render(<ResetButton {...defaultProps} />);

      await userEvent.click(
        screen.getByRole('button', { name: 'データをリセット' })
      );

      expect(
        screen.getByText(
          '全てのゲームデータが削除されます。この操作は元に戻せません。'
        )
      ).toBeInTheDocument();
    });

    it('確認UIに「リセット実行」ボタンが含まれる', async () => {
      render(<ResetButton {...defaultProps} />);

      await userEvent.click(
        screen.getByRole('button', { name: 'データをリセット' })
      );

      expect(
        screen.getByRole('button', { name: 'リセット実行' })
      ).toBeInTheDocument();
    });

    it('確認UIに「キャンセル」ボタンが含まれる', async () => {
      render(<ResetButton {...defaultProps} />);

      await userEvent.click(
        screen.getByRole('button', { name: 'データをリセット' })
      );

      expect(
        screen.getByRole('button', { name: 'キャンセル' })
      ).toBeInTheDocument();
    });
  });

  // ===========================================
  // リセット実行
  // ===========================================

  describe('リセット実行', () => {
    it('「リセット実行」クリックで onReset が呼ばれる', async () => {
      const onReset = vi.fn();
      render(<ResetButton onReset={onReset} />);

      await userEvent.click(
        screen.getByRole('button', { name: 'データをリセット' })
      );
      await userEvent.click(
        screen.getByRole('button', { name: 'リセット実行' })
      );

      expect(onReset).toHaveBeenCalledTimes(1);
    });

    it('リセット実行後に確認UIが閉じる', async () => {
      render(<ResetButton {...defaultProps} />);

      await userEvent.click(
        screen.getByRole('button', { name: 'データをリセット' })
      );
      await userEvent.click(
        screen.getByRole('button', { name: 'リセット実行' })
      );

      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
  });

  // ===========================================
  // キャンセル
  // ===========================================

  describe('キャンセル', () => {
    it('「キャンセル」クリックで確認UIが閉じる', async () => {
      render(<ResetButton {...defaultProps} />);

      await userEvent.click(
        screen.getByRole('button', { name: 'データをリセット' })
      );
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();

      await userEvent.click(
        screen.getByRole('button', { name: 'キャンセル' })
      );

      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });

    it('「キャンセル」クリックで onReset は呼ばれない', async () => {
      const onReset = vi.fn();
      render(<ResetButton onReset={onReset} />);

      await userEvent.click(
        screen.getByRole('button', { name: 'データをリセット' })
      );
      await userEvent.click(
        screen.getByRole('button', { name: 'キャンセル' })
      );

      expect(onReset).not.toHaveBeenCalled();
    });
  });

  // ===========================================
  // アクセシビリティ
  // ===========================================

  describe('アクセシビリティ', () => {
    it('トリガーボタンに aria-expanded が設定されている（初期: false）', () => {
      render(<ResetButton {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: 'データをリセット' })
      ).toHaveAttribute('aria-expanded', 'false');
    });

    it('確認UI表示時に aria-expanded が true になる', async () => {
      render(<ResetButton {...defaultProps} />);

      await userEvent.click(
        screen.getByRole('button', { name: 'データをリセット' })
      );

      expect(
        screen.getByRole('button', { name: 'データをリセット' })
      ).toHaveAttribute('aria-expanded', 'true');
    });

    it('alertdialog に aria-labelledby でタイトルが参照されている', async () => {
      render(<ResetButton {...defaultProps} />);

      await userEvent.click(
        screen.getByRole('button', { name: 'データをリセット' })
      );

      const dialog = screen.getByRole('alertdialog');
      const labelledBy = dialog.getAttribute('aria-labelledby');
      expect(labelledBy).toBeTruthy();

      const titleElement = document.getElementById(labelledBy!);
      expect(titleElement).toBeInTheDocument();
      expect(titleElement).toHaveTextContent('データリセットの確認');
    });

    it('alertdialog に aria-describedby で説明が参照されている', async () => {
      render(<ResetButton {...defaultProps} />);

      await userEvent.click(
        screen.getByRole('button', { name: 'データをリセット' })
      );

      const dialog = screen.getByRole('alertdialog');
      const describedBy = dialog.getAttribute('aria-describedby');
      expect(describedBy).toBeTruthy();

      const descElement = document.getElementById(describedBy!);
      expect(descElement).toBeInTheDocument();
      expect(descElement).toHaveTextContent(
        '全てのゲームデータが削除されます。この操作は元に戻せません。'
      );
    });

    it('確認ダイアログ表示時にキャンセルボタンへフォーカスが移る', async () => {
      render(<ResetButton {...defaultProps} />);

      await userEvent.click(
        screen.getByRole('button', { name: 'データをリセット' })
      );

      expect(
        screen.getByRole('button', { name: 'キャンセル' })
      ).toHaveFocus();
    });
  });

  // ===========================================
  // エッジケース
  // ===========================================

  describe('エッジケース', () => {
    it('確認ダイアログを開閉した後、再度開ける', async () => {
      render(<ResetButton {...defaultProps} />);

      // 1回目: 開く → キャンセル
      await userEvent.click(
        screen.getByRole('button', { name: 'データをリセット' })
      );
      await userEvent.click(
        screen.getByRole('button', { name: 'キャンセル' })
      );
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();

      // 2回目: 再度開く
      await userEvent.click(
        screen.getByRole('button', { name: 'データをリセット' })
      );
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    it('リセット実行後に再度確認ダイアログを開ける', async () => {
      const onReset = vi.fn();
      render(<ResetButton onReset={onReset} />);

      // 1回目: リセット実行
      await userEvent.click(
        screen.getByRole('button', { name: 'データをリセット' })
      );
      await userEvent.click(
        screen.getByRole('button', { name: 'リセット実行' })
      );
      expect(onReset).toHaveBeenCalledTimes(1);

      // 2回目: 再度開く
      await userEvent.click(
        screen.getByRole('button', { name: 'データをリセット' })
      );
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    it('確認ダイアログが閉じた状態で onReset が呼ばれることはない', () => {
      render(<ResetButton {...defaultProps} />);

      // 初期状態では onReset は呼ばれていない
      expect(defaultProps.onReset).not.toHaveBeenCalled();
    });
  });
});
