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

  /** aria-live ラッパーを取得するヘルパー */
  function getWrapper() {
    // aria-live="polite" を持つ要素を取得
    return document.querySelector('[aria-live="polite"]') as HTMLElement;
  }

  it('補給額がカンマ区切りで表示される', () => {
    render(<RefillNotice {...defaultProps} amount={30_000} />);

    expect(screen.getByText(/30,000 ぃえん補給されました/)).toBeInTheDocument();
  });

  it('isVisible=true で opacity-100 クラスが付与される', () => {
    render(<RefillNotice {...defaultProps} isVisible={true} />);

    const wrapper = getWrapper();
    expect(wrapper.className).toContain('opacity-100');
    expect(wrapper.className).not.toContain('pointer-events-none');
  });

  it('isVisible=false で opacity-0 と pointer-events-none クラスが付与される', () => {
    render(<RefillNotice {...defaultProps} isVisible={false} />);

    const wrapper = getWrapper();
    expect(wrapper.className).toContain('opacity-0');
    expect(wrapper.className).toContain('pointer-events-none');
  });

  it('isVisible=false でテキストと閉じボタンが非表示になる', () => {
    render(<RefillNotice {...defaultProps} isVisible={false} />);

    expect(screen.queryByText(/ぃえん補給されました/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '通知を閉じる' })).not.toBeInTheDocument();
  });

  it('isVisible=true でテキストと閉じボタンが表示される', () => {
    render(<RefillNotice {...defaultProps} isVisible={true} />);

    expect(screen.getByText(/30,000 ぃえん補給されました/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '通知を閉じる' })).toBeInTheDocument();
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

  it('aria-live="polite" が設定されている', () => {
    render(<RefillNotice {...defaultProps} />);

    const wrapper = getWrapper();
    expect(wrapper).not.toBeNull();
    expect(wrapper).toHaveAttribute('aria-live', 'polite');
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

    expect(screen.getByText(/0 ぃえん補給されました/)).toBeInTheDocument();
  });

  it('大きな金額がカンマ区切りで正しく表示される', () => {
    render(<RefillNotice {...defaultProps} amount={1_000_000} />);

    expect(screen.getByText(/1,000,000 ぃえん補給されました/)).toBeInTheDocument();
  });

  it('閉じボタンに aria-label="通知を閉じる" が設定されている', () => {
    render(<RefillNotice {...defaultProps} />);

    expect(
      screen.getByRole('button', { name: '通知を閉じる' })
    ).toBeInTheDocument();
  });
});
