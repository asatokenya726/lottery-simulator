import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DisclaimerBanner } from '@/components/DisclaimerBanner';

describe('DisclaimerBanner', () => {
  it('免責テキスト「これはシミュレーションです。実際のお金は使用されません。」が表示される', () => {
    render(<DisclaimerBanner />);

    expect(
      screen.getByText(
        'これはシミュレーションです。実際のお金は使用されません。'
      )
    ).toBeInTheDocument();
  });

  it('「実際の宝くじとは関係ありません」が表示される', () => {
    render(<DisclaimerBanner />);

    expect(
      screen.getByText(/実際の宝くじとは関係ありません/)
    ).toBeInTheDocument();
  });

  it('/terms へのリンクが存在する', () => {
    render(<DisclaimerBanner />);

    const termsLink = screen.getByRole('link', { name: '利用規約' });
    expect(termsLink).toHaveAttribute('href', '/terms');
  });

  it('消費者ホットライン（188）の tel:188 リンクが存在する', () => {
    render(<DisclaimerBanner />);

    const hotlineLink = screen.getByRole('link', {
      name: '消費者ホットライン（188）',
    });
    expect(hotlineLink).toHaveAttribute('href', 'tel:188');
  });

  it('いのちの電話（0120-783-556）の tel リンクが存在する', () => {
    render(<DisclaimerBanner />);

    const lifelineLink = screen.getByRole('link', {
      name: 'いのちの電話（0120-783-556）',
    });
    expect(lifelineLink).toHaveAttribute('href', 'tel:0120-783-556');
  });

  it('精神保健福祉センター一覧への外部リンクが存在する', () => {
    render(<DisclaimerBanner />);

    const mhcenterLink = screen.getByRole('link', {
      name: '精神保健福祉センター一覧',
    });
    expect(mhcenterLink).toHaveAttribute(
      'href',
      'https://www.mhlw.go.jp/kokoro/support/mhcenter.html'
    );
    expect(mhcenterLink).toHaveAttribute('target', '_blank');
    expect(mhcenterLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('footer 要素で contentinfo ロールが設定されている', () => {
    render(<DisclaimerBanner />);

    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});
