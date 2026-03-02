import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { DrawResultList } from '@/components/DrawResultList';
import { createDrawResult } from '../helpers/test-factories';
import type { DrawResult } from '@/types';

describe('DrawResultList', () => {
  it('10件の結果が正しく表示される', () => {
    const results: DrawResult[] = Array.from({ length: 10 }, () =>
      createDrawResult()
    );

    render(<DrawResultList results={results} />);

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(10);
  });

  it('当選時に等級バッジ（displayName）と金額が表示される', () => {
    const results: DrawResult[] = [
      createDrawResult({ prizeLevel: '1st', amount: 700_000_000 }),
    ];

    render(<DrawResultList results={results} />);

    const item = screen.getByRole('listitem');
    expect(item).toHaveTextContent('1等 7億ぃえん');
    expect(item).toHaveTextContent('700,000,000ぃえん');
  });

  it('ハズレ時に「ハズレ」バッジが表示され金額は非表示', () => {
    const results: DrawResult[] = [
      createDrawResult({ prizeLevel: null, amount: 0 }),
    ];

    render(<DrawResultList results={results} />);

    const item = screen.getByRole('listitem');
    expect(item).toHaveTextContent('ハズレ');
    // ハズレ時は「ぃえん」の金額表示がないことを確認
    expect(item).not.toHaveTextContent('ぃえん');
  });

  it('結果が空配列の場合は何も表示されない', () => {
    const { container } = render(<DrawResultList results={[]} />);

    expect(container.innerHTML).toBe('');
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('各等級の背景色が正しいクラスで適用される', () => {
    /** 等級 → 期待するTailwindクラスのマッピング */
    const levelToExpectedClass: Record<string, string> = {
      '1st': 'bg-prize-1st',
      '1st-adj': 'bg-prize-1st-adjacent',
      '1st-group': 'bg-prize-1st-group',
      '2nd': 'bg-prize-2nd',
      '3rd': 'bg-prize-3rd',
      '4th': 'bg-prize-4th',
      '5th': 'bg-prize-5th',
      '6th': 'bg-prize-6th',
      '7th': 'bg-prize-7th',
    };

    const results: DrawResult[] = Object.keys(levelToExpectedClass).map(
      (level) => createDrawResult({ prizeLevel: level, amount: 100 })
    );
    // ハズレも追加
    results.push(createDrawResult({ prizeLevel: null, amount: 0 }));

    render(<DrawResultList results={results} />);

    const items = screen.getAllByRole('listitem');

    // 各当選等級のバッジクラスを確認（最初のspan子要素がバッジ）
    Object.entries(levelToExpectedClass).forEach(
      ([, expectedClass], index) => {
        const badge = items[index].querySelector('span');
        expect(badge).not.toBeNull();
        expect(badge!.className).toContain(expectedClass);
      }
    );

    // ハズレのバッジクラスを確認（最後のアイテム）
    const missItem = items[items.length - 1];
    const missBadge = within(missItem).getByText('ハズレ');
    expect(missBadge.className).toContain('bg-prize-miss');
  });

  it('金額がカンマ区切りで表示される', () => {
    const results: DrawResult[] = [
      createDrawResult({ prizeLevel: '3rd', amount: 1_000_000 }),
      createDrawResult({ prizeLevel: '6th', amount: 3_000 }),
      createDrawResult({ prizeLevel: '7th', amount: 300 }),
    ];

    render(<DrawResultList results={results} />);

    const items = screen.getAllByRole('listitem');

    expect(items[0]).toHaveTextContent('1,000,000ぃえん');
    expect(items[1]).toHaveTextContent('3,000ぃえん');
    expect(items[2]).toHaveTextContent('300ぃえん');
  });
});
