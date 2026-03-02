import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BalanceDisplay } from '@/components/BalanceDisplay';

describe('BalanceDisplay', () => {
  it('ラベル「所持金」が表示される', () => {
    render(<BalanceDisplay balance={100_000} />);

    expect(screen.getByText('所持金')).toBeInTheDocument();
  });

  it('残高がカンマ区切りで表示される', () => {
    render(<BalanceDisplay balance={100_000} />);

    expect(screen.getByRole('status')).toHaveTextContent('100,000');
  });

  it('単位「ぃえん」が表示される', () => {
    render(<BalanceDisplay balance={100_000} />);

    expect(screen.getByText('ぃえん')).toBeInTheDocument();
  });

  it('0ぃえんが正しく表示される', () => {
    render(<BalanceDisplay balance={0} />);

    expect(screen.getByRole('status')).toHaveTextContent('0');
    expect(screen.getByText('ぃえん')).toBeInTheDocument();
  });

  it('大きな金額（億単位）がカンマ区切りで正しく表示される', () => {
    render(<BalanceDisplay balance={700_000_000} />);

    expect(screen.getByRole('status')).toHaveTextContent('700,000,000');
  });

  it('負の値が渡された場合も表示できる（防御的テスト）', () => {
    render(<BalanceDisplay balance={-5_000} />);

    expect(screen.getByRole('status')).toHaveTextContent('-5,000');
  });

  it('小数点を含む値が渡された場合も表示できる', () => {
    render(<BalanceDisplay balance={1_234.56} />);

    expect(screen.getByRole('status')).toHaveTextContent('1,234.56');
  });

  it('role="status" と aria-label="所持金" が設定されている', () => {
    render(<BalanceDisplay balance={100_000} />);

    const statusElement = screen.getByRole('status');
    expect(statusElement).toHaveAttribute('aria-label', '所持金');
  });
});
