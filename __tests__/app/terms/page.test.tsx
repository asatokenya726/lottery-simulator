import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TermsPage from "@/app/terms/page";

describe("TermsPage", () => {
  // --- h1 見出し ---
  it('h1 に「利用規約」が表示される', () => {
    render(<TermsPage />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("利用規約");
  });

  // --- 9つのセクション見出し ---
  const sectionTitles = [
    "サービスの性質",
    "ゲーム内通貨",
    "確率データの出典",
    "免責事項",
    "知的財産権",
    "禁止事項",
    "規約の変更",
    "準拠法",
    "プライバシー",
  ];

  it.each(sectionTitles)(
    'セクション見出し「%s」が表示される',
    (title) => {
      render(<TermsPage />);

      const headings = screen.getAllByRole("heading", { level: 2 });
      const match = headings.find((h) => h.textContent?.includes(title));
      expect(match).toBeDefined();
    }
  );

  it("9つ全てのセクション見出し（h2）が存在する", () => {
    render(<TermsPage />);

    const headings = screen.getAllByRole("heading", { level: 2 });
    expect(headings).toHaveLength(9);
  });

  // --- 重要な法的文言の存在確認 ---
  it('「シミュレーション」の文言が含まれる', () => {
    render(<TermsPage />);

    expect(
      screen.getByText(/シミュレーション/, { exact: false })
    ).toBeInTheDocument();
  });

  it('「エンターテインメント」の文言が含まれる', () => {
    render(<TermsPage />);

    expect(
      screen.getByText(/エンターテインメント/, { exact: false })
    ).toBeInTheDocument();
  });

  it('「ぃえん」の文言が含まれる', () => {
    render(<TermsPage />);

    expect(
      screen.getByText(/ぃえん/, { exact: false })
    ).toBeInTheDocument();
  });

  it('「交換はできません」の文言が含まれる', () => {
    render(<TermsPage />);

    expect(
      screen.getByText(/交換はできません/, { exact: false })
    ).toBeInTheDocument();
  });

  it('「個人情報を収集しません」の文言が含まれる', () => {
    render(<TermsPage />);

    expect(
      screen.getByText(/個人情報を収集しません/, { exact: false })
    ).toBeInTheDocument();
  });

  it('「一切の責任を負いません」の免責文言が含まれる', () => {
    render(<TermsPage />);

    expect(
      screen.getByText(/一切の責任を負いません/, { exact: false })
    ).toBeInTheDocument();
  });

  it('「日本法に準拠」の文言が含まれる', () => {
    render(<TermsPage />);

    expect(
      screen.getByText(/日本法に準拠/, { exact: false })
    ).toBeInTheDocument();
  });

  it('「公式の宝くじとは無関係」の文言が含まれる', () => {
    render(<TermsPage />);

    expect(
      screen.getByText(/公式の宝くじとは無関係/, { exact: false })
    ).toBeInTheDocument();
  });

  // --- トップページリンク ---
  it("トップページへのリンクが存在する", () => {
    render(<TermsPage />);

    const link = screen.getByRole("link", { name: /トップページに戻る/ });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/");
  });

  // --- セクション番号の付与 ---
  it("セクション見出しに番号が付与されている", () => {
    render(<TermsPage />);

    const headings = screen.getAllByRole("heading", { level: 2 });
    headings.forEach((heading, index) => {
      expect(heading.textContent).toContain(`${index + 1}.`);
    });
  });

  // --- article 要素で囲まれている ---
  it("article 要素で本文が囲まれている", () => {
    render(<TermsPage />);

    const article = document.querySelector("article");
    expect(article).not.toBeNull();
  });
});
