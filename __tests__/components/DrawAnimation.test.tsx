import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { DrawAnimation } from '@/components/DrawAnimation';
import { createDrawResult } from '../helpers/test-factories';
import type { DrawResult } from '@/types';

/** 順次表示の間隔（コンポーネントと同じ値） */
const REVEAL_INTERVAL_MS = 300;

describe('DrawAnimation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('結果が順次表示される', () => {
    const results: DrawResult[] = Array.from({ length: 3 }, () =>
      createDrawResult()
    );
    const onComplete = vi.fn();

    render(<DrawAnimation results={results} onComplete={onComplete} />);

    // aria-hidden="true" の要素も含めて取得
    const items = screen.getAllByRole('listitem', { hidden: true });

    // 初期状態: 全てopacity-0（aria-hidden="true"）
    for (const item of items) {
      expect(item.className).toContain('opacity-0');
      expect(item).toHaveAttribute('aria-hidden', 'true');
    }

    // 1回目のインターバル後: 1枚目が表示
    act(() => {
      vi.advanceTimersByTime(REVEAL_INTERVAL_MS);
    });

    expect(items[0].className).toContain('opacity-100');
    expect(items[1].className).toContain('opacity-0');
    expect(items[2].className).toContain('opacity-0');

    // 2回目のインターバル後: 2枚目も表示
    act(() => {
      vi.advanceTimersByTime(REVEAL_INTERVAL_MS);
    });

    expect(items[0].className).toContain('opacity-100');
    expect(items[1].className).toContain('opacity-100');
    expect(items[2].className).toContain('opacity-0');
  });

  it('当選カードに当選用スタイル（scale-105等）が適用される', () => {
    const results: DrawResult[] = [
      createDrawResult({ prizeLevel: '1st', amount: 700_000_000 }),
    ];
    const onComplete = vi.fn();

    render(<DrawAnimation results={results} onComplete={onComplete} />);

    // 表示させる
    act(() => {
      vi.advanceTimersByTime(REVEAL_INTERVAL_MS);
    });

    const item = screen.getByRole('listitem');
    expect(item.className).toContain('scale-105');
    expect(item.className).toContain('duration-300');
    expect(item.className).toContain('opacity-100');
  });

  it('ハズレカードにハズレ用スタイル（opacity-100、scaleなし）が適用される', () => {
    const results: DrawResult[] = [
      createDrawResult({ prizeLevel: null, amount: 0 }),
    ];
    const onComplete = vi.fn();

    render(<DrawAnimation results={results} onComplete={onComplete} />);

    // 表示させる
    act(() => {
      vi.advanceTimersByTime(REVEAL_INTERVAL_MS);
    });

    const item = screen.getByRole('listitem');
    expect(item.className).toContain('opacity-100');
    expect(item.className).toContain('duration-200');
    expect(item.className).not.toContain('scale-105');
  });

  it('スキップボタンクリックで全件即時表示される', () => {
    const results: DrawResult[] = Array.from({ length: 5 }, () =>
      createDrawResult()
    );
    const onComplete = vi.fn();

    render(<DrawAnimation results={results} onComplete={onComplete} />);

    // スキップボタンが存在する
    const skipButton = screen.getByRole('button', { name: 'スキップ' });
    expect(skipButton).toBeInTheDocument();

    // スキップをクリック（fireEventを使用、fake timersとの相性問題を回避）
    act(() => {
      fireEvent.click(skipButton);
    });

    // 全件表示される
    const items = screen.getAllByRole('listitem');
    for (const item of items) {
      expect(item.className).toContain('opacity-100');
    }

    // onCompleteが呼ばれる
    expect(onComplete).toHaveBeenCalledTimes(1);

    // スキップボタンが消える
    expect(
      screen.queryByRole('button', { name: 'スキップ' })
    ).not.toBeInTheDocument();
  });

  it('全件表示完了後に onComplete が呼ばれる', () => {
    const results: DrawResult[] = Array.from({ length: 3 }, () =>
      createDrawResult()
    );
    const onComplete = vi.fn();

    render(<DrawAnimation results={results} onComplete={onComplete} />);

    // useEffect 内の setInterval は visibleCount が依存配列にあるため、
    // 各 tick で interval が再生成される。各 tick を個別に進める。
    for (let i = 0; i < results.length; i++) {
      act(() => {
        vi.advanceTimersByTime(REVEAL_INTERVAL_MS);
      });
    }

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('結果が空配列の場合は何も表示されない', () => {
    const onComplete = vi.fn();

    const { container } = render(
      <DrawAnimation results={[]} onComplete={onComplete} />
    );

    expect(container.innerHTML).toBe('');
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('当選結果に等級別バッジと金額が表示される', () => {
    const results: DrawResult[] = [
      createDrawResult({ prizeLevel: '3rd', amount: 1_000_000 }),
    ];
    const onComplete = vi.fn();

    render(<DrawAnimation results={results} onComplete={onComplete} />);

    // 表示させる
    act(() => {
      vi.advanceTimersByTime(REVEAL_INTERVAL_MS);
    });

    const item = screen.getByRole('listitem');
    expect(item).toHaveTextContent('3等 100万ぃえん');
    expect(item).toHaveTextContent('1,000,000ぃえん');

    // バッジに正しい背景色クラス
    const badge = item.querySelector('span');
    expect(badge).not.toBeNull();
    expect(badge!.className).toContain('bg-prize-3rd');
  });

  it('ハズレ結果に「ハズレ」バッジが表示され金額は非表示', () => {
    const results: DrawResult[] = [
      createDrawResult({ prizeLevel: null, amount: 0 }),
    ];
    const onComplete = vi.fn();

    render(<DrawAnimation results={results} onComplete={onComplete} />);

    // 表示させる
    act(() => {
      vi.advanceTimersByTime(REVEAL_INTERVAL_MS);
    });

    const item = screen.getByRole('listitem');
    expect(item).toHaveTextContent('ハズレ');
    expect(item).not.toHaveTextContent('ぃえん');
  });
});
