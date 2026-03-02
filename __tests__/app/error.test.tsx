import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorPage from '@/app/error';

/** createStorage のモック */
vi.mock('@/data/storage', () => ({
  createStorage: vi.fn(() => ({
    clear: vi.fn(),
  })),
}));

/** window.location.reload のモック */
const reloadMock = vi.fn();

describe('ErrorPage', () => {
  const defaultProps = {
    error: new Error('テストエラー'),
    reset: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // window.location.reload をモック
    Object.defineProperty(window, 'location', {
      value: { ...window.location, reload: reloadMock },
      writable: true,
    });
  });

  // ===========================================
  // フォールバックUIの表示
  // ===========================================

  describe('フォールバックUIの表示', () => {
    it('エラー見出しが表示される', () => {
      render(<ErrorPage {...defaultProps} />);

      expect(
        screen.getByRole('heading', { name: '予期しないエラーが発生しました' })
      ).toBeInTheDocument();
    });

    it('「ページを再読み込み」ボタンが表示される', () => {
      render(<ErrorPage {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: 'ページを再読み込み' })
      ).toBeInTheDocument();
    });

    it('「データをリセットして再開」ボタンが表示される', () => {
      render(<ErrorPage {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: 'データをリセットして再開' })
      ).toBeInTheDocument();
    });

    it('role="alert" が設定されている', () => {
      render(<ErrorPage {...defaultProps} />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('データリセットの説明テキストが表示される', () => {
      render(<ErrorPage {...defaultProps} />);

      expect(
        screen.getByText(/問題が解決しない場合/)
      ).toBeInTheDocument();
    });
  });

  // ===========================================
  // ボタン動作
  // ===========================================

  describe('ボタン動作', () => {
    it('「ページを再読み込み」クリックで window.location.reload が呼ばれる', async () => {
      render(<ErrorPage {...defaultProps} />);

      await userEvent.click(
        screen.getByRole('button', { name: 'ページを再読み込み' })
      );

      expect(reloadMock).toHaveBeenCalledTimes(1);
    });

    it('「データをリセットして再開」クリックで storage.clear → reload が呼ばれる', async () => {
      const { createStorage } = await import('@/data/storage');
      const mockClear = vi.fn();
      vi.mocked(createStorage).mockReturnValue({
        get: vi.fn(),
        set: vi.fn(),
        remove: vi.fn(),
        clear: mockClear,
        isAvailable: true,
      });

      render(<ErrorPage {...defaultProps} />);

      await userEvent.click(
        screen.getByRole('button', { name: 'データをリセットして再開' })
      );

      expect(mockClear).toHaveBeenCalledTimes(1);
      expect(reloadMock).toHaveBeenCalledTimes(1);
    });
  });

  // ===========================================
  // エラーログ出力
  // ===========================================

  describe('エラーログ出力', () => {
    it('console.error でエラー詳細が出力される', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const testError = new Error('テストエラー');

      render(<ErrorPage error={testError} reset={vi.fn()} />);

      expect(consoleSpy).toHaveBeenCalledWith('未キャッチエラー:', testError);
      consoleSpy.mockRestore();
    });
  });

  // ===========================================
  // エッジケース
  // ===========================================

  describe('エッジケース', () => {
    it('digest プロパティを持つエラーでも正常動作する', () => {
      const errorWithDigest = Object.assign(new Error('サーバーエラー'), {
        digest: 'DIGEST_123',
      });

      render(<ErrorPage error={errorWithDigest} reset={vi.fn()} />);

      expect(
        screen.getByRole('heading', { name: '予期しないエラーが発生しました' })
      ).toBeInTheDocument();
    });

    it('空メッセージのエラーでも正常動作する', () => {
      const emptyError = new Error('');

      render(<ErrorPage error={emptyError} reset={vi.fn()} />);

      expect(
        screen.getByRole('heading', { name: '予期しないエラーが発生しました' })
      ).toBeInTheDocument();
    });
  });
});
