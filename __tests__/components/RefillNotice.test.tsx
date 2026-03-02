import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RefillNotice } from '@/components/RefillNotice';

describe('RefillNotice', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const defaultProps = {
    isVisible: true,
    amount: 30_000,
    onDismiss: vi.fn(),
  };

  it('補給額がカンマ区切りで表示される', () => {
    render(<RefillNotice {...defaultProps} amount={30_000} />);

    expect(screen.getByRole('alert')).toHaveTextContent('30,000 ぃえん補給されました');
  });

  it('isVisible=true で opacity-100 クラスが付与される', () => {
    render(<RefillNotice {...defaultProps} isVisible={true} />);

    const alert = screen.getByRole('alert');
    expect(alert.className).toContain('opacity-100');
    expect(alert.className).not.toContain('pointer-events-none');
  });

  it('isVisible=false で opacity-0 と pointer-events-none クラスが付与される', () => {
    render(<RefillNotice {...defaultProps} isVisible={false} />);

    // aria-hidden="true" のため hidden: true で検索
    const alert = screen.getByRole('alert', { hidden: true });
    expect(alert.className).toContain('opacity-0');
    expect(alert.className).toContain('pointer-events-none');
  });

  it('isVisible=false で aria-hidden="true" が設定される', () => {
    render(<RefillNotice {...defaultProps} isVisible={false} />);

    const alert = screen.getByRole('alert', { hidden: true });
    expect(alert).toHaveAttribute('aria-hidden', 'true');
  });

  it('isVisible=true で aria-hidden="false" が設定される', () => {
    render(<RefillNotice {...defaultProps} isVisible={true} />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-hidden', 'false');
  });

  it('isVisible=false で閉じボタンがフォーカス不可（tabIndex=-1）になる', () => {
    render(<RefillNotice {...defaultProps} isVisible={false} />);

    const button = screen.getByRole('button', { hidden: true });
    expect(button).toHaveAttribute('tabindex', '-1');
  });

  it('5秒後に onDismiss が呼ばれる', () => {
    const onDismiss = vi.fn();
    render(<RefillNotice {...defaultProps} onDismiss={onDismiss} />);

    expect(onDismiss).not.toHaveBeenCalled();

    vi.advanceTimersByTime(5_000);

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('5秒未満では onDismiss が呼ばれない', () => {
    const onDismiss = vi.fn();
    render(<RefillNotice {...defaultProps} onDismiss={onDismiss} />);

    vi.advanceTimersByTime(4_999);

    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('閉じボタンクリックで onDismiss が呼ばれる', () => {
    const onDismiss = vi.fn();
    render(<RefillNotice {...defaultProps} onDismiss={onDismiss} />);

    fireEvent.click(screen.getByRole('button', { name: '通知を閉じる' }));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('role="alert" が設定されている', () => {
    render(<RefillNotice {...defaultProps} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('コンポーネントアンマウント時にタイマーがクリアされる', () => {
    const onDismiss = vi.fn();
    const { unmount } = render(
      <RefillNotice {...defaultProps} onDismiss={onDismiss} />
    );

    // アンマウント前にタイマーが設定されていることを確認
    unmount();

    // アンマウント後にタイマーを進めても onDismiss は呼ばれない
    vi.advanceTimersByTime(10_000);

    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('isVisible が途中で false に切り替わった場合にタイマーがクリアされる', () => {
    const onDismiss = vi.fn();
    const { rerender } = render(
      <RefillNotice {...defaultProps} isVisible={true} onDismiss={onDismiss} />
    );

    // 2秒経過後に非表示に切り替え
    vi.advanceTimersByTime(2_000);
    rerender(
      <RefillNotice {...defaultProps} isVisible={false} onDismiss={onDismiss} />
    );

    // さらに5秒経過しても onDismiss は呼ばれない（タイマーがクリアされたため）
    vi.advanceTimersByTime(5_000);

    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('amount=0 の場合でもクラッシュしない', () => {
    render(<RefillNotice {...defaultProps} amount={0} />);

    expect(screen.getByRole('alert')).toHaveTextContent('0 ぃえん補給されました');
  });

  it('大きな金額がカンマ区切りで正しく表示される', () => {
    render(<RefillNotice {...defaultProps} amount={1_000_000} />);

    expect(screen.getByRole('alert')).toHaveTextContent('1,000,000 ぃえん補給されました');
  });

  it('閉じボタンに aria-label="通知を閉じる" が設定されている', () => {
    render(<RefillNotice {...defaultProps} />);

    expect(
      screen.getByRole('button', { name: '通知を閉じる' })
    ).toBeInTheDocument();
  });
});
