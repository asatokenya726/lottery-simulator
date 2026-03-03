import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TermsPage from '@/app/terms/page';

describe('TermsPage', () => {
  // ===========================================
  // ページ構造
  // ===========================================

  describe('ページ構造', () => {
    it('h1 に「利用規約」が含まれる', () => {
      render(<TermsPage />);

      expect(
        screen.getByRole('heading', { level: 1, name: '利用規約' })
      ).toBeInTheDocument();
    });

    it('main 要素でラップされている', () => {
      render(<TermsPage />);

      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('トップページへのリンクが存在する', () => {
      render(<TermsPage />);

      const link = screen.getByRole('link', { name: 'トップページに戻る' });
      expect(link).toHaveAttribute('href', '/');
    });
  });

  // ===========================================
  // 9セクションの見出し
  // ===========================================

  describe('セクション見出し', () => {
    const sectionTitles = [
      '1. サービスの性質',
      '2. ゲーム内通貨',
      '3. 確率データの出典',
      '4. 免責事項',
      '5. 知的財産権',
      '6. 禁止事項',
      '7. 規約の変更',
      '8. 準拠法',
      '9. プライバシー',
    ];

    it.each(sectionTitles)('見出し「%s」が表示される', (title) => {
      render(<TermsPage />);

      expect(
        screen.getByRole('heading', { level: 2, name: title })
      ).toBeInTheDocument();
    });

    it('全9セクションのh2見出しが存在する', () => {
      render(<TermsPage />);

      const h2Elements = screen.getAllByRole('heading', { level: 2 });
      expect(h2Elements).toHaveLength(9);
    });
  });

  // ===========================================
  // 法的文言の確認
  // ===========================================

  describe('法的文言', () => {
    it('「シミュレーション」の文言が含まれる', () => {
      render(<TermsPage />);

      expect(screen.getByText(/シミュレーション/)).toBeInTheDocument();
    });

    it('「エンターテインメント」の文言が含まれる', () => {
      render(<TermsPage />);

      expect(screen.getByText(/エンターテインメント/)).toBeInTheDocument();
    });

    it('「ぃえん」の文言が含まれる', () => {
      render(<TermsPage />);

      expect(screen.getByText(/ぃえん/)).toBeInTheDocument();
    });

    it('「交換はできません」の文言が含まれる', () => {
      render(<TermsPage />);

      expect(screen.getByText(/交換はできません/)).toBeInTheDocument();
    });

    it('「個人情報を収集しません」の文言が含まれる', () => {
      render(<TermsPage />);

      expect(
        screen.getByText(/個人情報を収集しません/)
      ).toBeInTheDocument();
    });

    it('「日本法」の文言が含まれる', () => {
      render(<TermsPage />);

      expect(screen.getByText(/日本法/)).toBeInTheDocument();
    });

    it('「一切の責任を負いません」の文言が含まれる', () => {
      render(<TermsPage />);

      expect(
        screen.getByText(/一切の責任を負いません/)
      ).toBeInTheDocument();
    });

    it('「著作権は開発者に帰属」の文言が含まれる', () => {
      render(<TermsPage />);

      expect(screen.getByText(/著作権は開発者に帰属/)).toBeInTheDocument();
    });

    it('「営利活動」「不正利用」の禁止文言が含まれる', () => {
      render(<TermsPage />);

      expect(screen.getByText(/営利活動/)).toBeInTheDocument();
      expect(screen.getByText(/不正利用/)).toBeInTheDocument();
    });

    it('「予告なく変更」の文言が含まれる', () => {
      render(<TermsPage />);

      expect(screen.getByText(/予告なく変更/)).toBeInTheDocument();
    });

    it('「公式の宝くじとは無関係」の文言が含まれる', () => {
      render(<TermsPage />);

      expect(
        screen.getByText(/公式の宝くじとは無関係/)
      ).toBeInTheDocument();
    });

    it('「ブラウザにのみ保存」の文言が含まれる', () => {
      render(<TermsPage />);

      expect(screen.getByText(/ブラウザにのみ保存/)).toBeInTheDocument();
    });
  });
});
