import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsPanel } from '@/components/StatsPanel';

/** デフォルトprops（全て0の初期状態） */
const defaultProps = {
  totalSpent: 0,
  totalWon: 0,
  totalDraws: 0,
  totalTickets: 0,
  winCountByLevel: {},
};

describe('StatsPanel', () => {
  describe('累計購入額の表示', () => {
    it('累計購入額がカンマ区切りで表示される', () => {
      render(<StatsPanel {...defaultProps} totalSpent={300_000} />);

      expect(screen.getByLabelText('累計収支')).toHaveTextContent('300,000');
    });

    it('大きな金額もカンマ区切りで表示される', () => {
      render(<StatsPanel {...defaultProps} totalSpent={1_500_000} />);

      expect(screen.getByLabelText('累計収支')).toHaveTextContent('1,500,000');
    });
  });

  describe('累計当選額の表示', () => {
    it('累計当選額がカンマ区切りで表示される', () => {
      render(<StatsPanel {...defaultProps} totalWon={150_000} />);

      expect(screen.getByLabelText('累計収支')).toHaveTextContent('150,000');
    });
  });

  describe('回収率の表示', () => {
    it('回収率が正しく小数第1位まで表示される', () => {
      render(
        <StatsPanel {...defaultProps} totalSpent={300_000} totalWon={100_000} />
      );

      // 100,000 / 300,000 = 33.3%
      expect(screen.getByLabelText('累計収支')).toHaveTextContent('33.3%');
    });

    it('購入額0の場合は回収率0.0%が表示される', () => {
      render(<StatsPanel {...defaultProps} totalSpent={0} totalWon={0} />);

      expect(screen.getByLabelText('累計収支')).toHaveTextContent('0.0%');
    });

    it('回収率100%以上の場合にtext-accent-goldクラスと▲記号で強調表示される', () => {
      const { container } = render(
        <StatsPanel {...defaultProps} totalSpent={100_000} totalWon={150_000} />
      );

      // 150,000 / 100,000 = 150.0%
      expect(screen.getByLabelText('累計収支')).toHaveTextContent('150.0%');

      // 回収率100%以上のテキストにaccent-goldクラスが適用される
      const goldElement = container.querySelector('.text-accent-gold');
      expect(goldElement).not.toBeNull();
      expect(goldElement).toHaveTextContent('▲150.0%');

      // 色以外の視覚的手がかり（▲記号）が表示される（WCAG 1.4.1 準拠）
      expect(goldElement).toHaveTextContent('▲');

      // aria-labelに「黒字」が含まれる
      expect(goldElement).toHaveAttribute(
        'aria-label',
        '回収率 150.0% 黒字'
      );
    });

    it('回収率100%未満の場合はtext-text-primaryクラスが適用され▲記号なし', () => {
      const { container } = render(
        <StatsPanel {...defaultProps} totalSpent={100_000} totalWon={50_000} />
      );

      // 50.0%の要素がtext-accent-goldではないことを確認
      const goldElements = container.querySelectorAll('.text-accent-gold');
      const rateTexts = Array.from(goldElements).filter((el) =>
        el.textContent?.includes('50.0%')
      );
      expect(rateTexts).toHaveLength(0);

      // ▲記号が表示されないことを確認
      expect(screen.getByLabelText('累計収支')).not.toHaveTextContent('▲');
    });

    it('回収率ちょうど100%の場合に強調表示と▲記号が表示される', () => {
      const { container } = render(
        <StatsPanel {...defaultProps} totalSpent={100_000} totalWon={100_000} />
      );

      expect(screen.getByLabelText('累計収支')).toHaveTextContent('100.0%');

      const goldElement = container.querySelector('.text-accent-gold');
      expect(goldElement).not.toBeNull();
      expect(goldElement).toHaveTextContent('▲100.0%');
    });
  });

  describe('累計抽選回数・枚数の表示', () => {
    it('累計抽選回数が表示される', () => {
      render(<StatsPanel {...defaultProps} totalDraws={50} />);

      expect(screen.getByLabelText('累計収支')).toHaveTextContent('50');
      expect(screen.getByLabelText('累計収支')).toHaveTextContent('回');
    });

    it('累計購入枚数が表示される', () => {
      render(<StatsPanel {...defaultProps} totalTickets={500} />);

      expect(screen.getByLabelText('累計収支')).toHaveTextContent('500');
      expect(screen.getByLabelText('累計収支')).toHaveTextContent('枚');
    });

    it('大きな数値もカンマ区切りで表示される', () => {
      render(
        <StatsPanel
          {...defaultProps}
          totalDraws={1_000}
          totalTickets={10_000}
        />
      );

      expect(screen.getByLabelText('累計収支')).toHaveTextContent('1,000');
      expect(screen.getByLabelText('累計収支')).toHaveTextContent('10,000');
    });
  });

  describe('等級別当選回数の表示', () => {
    it('等級別当選回数がgetDisplayNameの表示名で表示される', () => {
      const winCountByLevel = {
        '1st': 1,
        '6th': 5,
      };

      render(
        <StatsPanel {...defaultProps} winCountByLevel={winCountByLevel} />
      );

      // getDisplayName で変換された表示名
      expect(screen.getByLabelText('累計収支')).toHaveTextContent(
        '1等 7億ぃえん'
      );
      expect(screen.getByLabelText('累計収支')).toHaveTextContent(
        '6等 3000ぃえん'
      );
    });

    it('winCountByLevelにキーが存在しない等級は0回として表示される', () => {
      render(<StatsPanel {...defaultProps} winCountByLevel={{}} />);

      // 全等級が0回で表示される（ハズレは除外）
      const section = screen.getByLabelText('累計収支');
      expect(section).toHaveTextContent('1等 7億ぃえん');
      expect(section).toHaveTextContent('7等 300ぃえん');
      // ハズレは含まれない
      expect(section).not.toHaveTextContent('ハズレ');
    });

    it('ハズレ（miss）は等級一覧に表示されない', () => {
      const winCountByLevel = {
        miss: 100,
      };

      render(
        <StatsPanel {...defaultProps} winCountByLevel={winCountByLevel} />
      );

      // ハズレの表示名が等級リストに含まれない
      // ただしテキスト検索でヘッダー等に「ハズレ」がないことを確認
      const prizeSection = screen.getByText('等級別当選回数');
      const parent = prizeSection.parentElement;
      expect(parent).not.toBeNull();
      // ハズレは等級リストに表示されない
      const allText = parent?.textContent ?? '';
      expect(allText).not.toContain('ハズレ');
    });
  });

  describe('全て0の初期状態', () => {
    it('全て0の初期状態が正しく表示される', () => {
      render(<StatsPanel {...defaultProps} />);

      const section = screen.getByLabelText('累計収支');
      // 累計購入額・当選額が0
      expect(section).toHaveTextContent('累計購入額');
      expect(section).toHaveTextContent('累計当選額');
      expect(section).toHaveTextContent('回収率');
      expect(section).toHaveTextContent('0.0%');
      expect(section).toHaveTextContent('累計抽選回数');
      expect(section).toHaveTextContent('累計購入枚数');
      expect(section).toHaveTextContent('等級別当選回数');
    });
  });

  describe('アクセシビリティ', () => {
    it('aria-label="累計収支"が設定されている', () => {
      render(<StatsPanel {...defaultProps} />);

      expect(screen.getByLabelText('累計収支')).toBeInTheDocument();
    });

    it('section要素が使用されている', () => {
      render(<StatsPanel {...defaultProps} />);

      const section = screen.getByLabelText('累計収支');
      expect(section.tagName).toBe('SECTION');
    });
  });
});
