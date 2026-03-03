import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HistoryPanel } from "@/components/HistoryPanel";
import { createDrawHistory } from "../helpers/test-factories";

describe("HistoryPanel", () => {
  describe("空配列の場合", () => {
    it("折りたたみを開くと「まだ抽選履歴がありません」が表示される", async () => {
      const user = userEvent.setup();
      render(<HistoryPanel history={[]} />);

      // ヘッダーをクリックして開く
      await user.click(screen.getByRole("button", { name: /当選履歴/ }));

      expect(
        screen.getByText("まだ抽選履歴がありません")
      ).toBeInTheDocument();
    });

    it("件数が(0)と表示される", () => {
      render(<HistoryPanel history={[]} />);

      expect(screen.getByText("(0)")).toBeInTheDocument();
    });
  });

  describe("履歴1件の表示内容", () => {
    const singleHistory = createDrawHistory({
      id: "test-single",
      timestamp: "2026-01-15T14:30:00.000Z",
      cost: 3_000,
      totalWin: 10_000,
    });

    it("日時がYYYY/MM/DD HH:MM形式で表示される", async () => {
      const user = userEvent.setup();
      render(<HistoryPanel history={[singleHistory]} />);

      await user.click(screen.getByRole("button", { name: /当選履歴/ }));

      // タイムゾーン依存を避けるため、期待値をランタイムで計算
      const date = new Date("2026-01-15T14:30:00.000Z");
      const expected = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
      expect(screen.getByText(expected)).toBeInTheDocument();
    });

    it("購入額がカンマ区切りで表示される", async () => {
      const user = userEvent.setup();
      render(<HistoryPanel history={[singleHistory]} />);

      await user.click(screen.getByRole("button", { name: /当選履歴/ }));

      expect(screen.getByText(/購入: 3,000/)).toBeInTheDocument();
    });

    it("当選額がカンマ区切りで表示される", async () => {
      const user = userEvent.setup();
      render(<HistoryPanel history={[singleHistory]} />);

      await user.click(screen.getByRole("button", { name: /当選履歴/ }));

      expect(screen.getByText(/当選: 10,000/)).toBeInTheDocument();
    });

    it("損益がプラスの場合、+記号付きで表示される", async () => {
      const user = userEvent.setup();
      render(<HistoryPanel history={[singleHistory]} />);

      await user.click(screen.getByRole("button", { name: /当選履歴/ }));

      // 10,000 - 3,000 = +7,000
      expect(screen.getByText("+7,000")).toBeInTheDocument();
    });

    it("件数が(1)と表示される", () => {
      render(<HistoryPanel history={[singleHistory]} />);

      expect(screen.getByText("(1)")).toBeInTheDocument();
    });
  });

  describe("複数件の新しい順表示", () => {
    const historyEntries = [
      createDrawHistory({
        id: "oldest",
        timestamp: "2026-01-01T10:00:00.000Z",
        cost: 3_000,
        totalWin: 0,
      }),
      createDrawHistory({
        id: "middle",
        timestamp: "2026-01-02T10:00:00.000Z",
        cost: 3_000,
        totalWin: 5_000,
      }),
      createDrawHistory({
        id: "newest",
        timestamp: "2026-01-03T10:00:00.000Z",
        cost: 3_000,
        totalWin: 100_000,
      }),
    ];

    it("リストの先頭が最新エントリになる", async () => {
      const user = userEvent.setup();
      render(<HistoryPanel history={historyEntries} />);

      await user.click(screen.getByRole("button", { name: /当選履歴/ }));

      const listItems = screen.getAllByRole("listitem");
      expect(listItems).toHaveLength(3);

      // 先頭（最新）は当選100,000を含む
      expect(listItems[0]).toHaveTextContent("当選: 100,000");
      // 末尾（最古）は当選0を含む
      expect(listItems[2]).toHaveTextContent("当選: 0");
    });

    it("件数が(3)と表示される", () => {
      render(<HistoryPanel history={historyEntries} />);

      expect(screen.getByText("(3)")).toBeInTheDocument();
    });
  });

  describe("折りたたみ開閉動作", () => {
    const history = [createDrawHistory({ id: "toggle-test" })];

    it("デフォルトで閉じている（コンテンツがhidden）", () => {
      render(<HistoryPanel history={history} />);

      // コンテンツ部分がhidden属性で非表示
      const content = document.getElementById("history-panel-content");
      expect(content).not.toBeNull();
      expect(content).toHaveAttribute("hidden");
    });

    it("クリックで開閉できる", async () => {
      const user = userEvent.setup();
      render(<HistoryPanel history={history} />);

      const toggleButton = screen.getByRole("button", { name: /当選履歴/ });
      const content = document.getElementById("history-panel-content");

      // 開く
      await user.click(toggleButton);
      expect(content).not.toHaveAttribute("hidden");

      // 閉じる
      await user.click(toggleButton);
      expect(content).toHaveAttribute("hidden");
    });

    it("aria-expandedが開閉状態を反映する", async () => {
      const user = userEvent.setup();
      render(<HistoryPanel history={history} />);

      const toggleButton = screen.getByRole("button", { name: /当選履歴/ });

      // デフォルトは閉じている
      expect(toggleButton).toHaveAttribute("aria-expanded", "false");

      // 開く
      await user.click(toggleButton);
      expect(toggleButton).toHaveAttribute("aria-expanded", "true");

      // 閉じる
      await user.click(toggleButton);
      expect(toggleButton).toHaveAttribute("aria-expanded", "false");
    });
  });

  describe("損益の色分けスタイル", () => {
    it("損益プラスの場合、text-successクラスが適用される", async () => {
      const user = userEvent.setup();
      const profitHistory = createDrawHistory({
        id: "profit",
        cost: 3_000,
        totalWin: 10_000,
      });
      const { container } = render(
        <HistoryPanel history={[profitHistory]} />
      );

      await user.click(screen.getByRole("button", { name: /当選履歴/ }));

      const profitElement = container.querySelector(".text-success");
      expect(profitElement).not.toBeNull();
      expect(profitElement).toHaveTextContent("+7,000");
    });

    it("損益マイナスの場合、text-errorクラスが適用される", async () => {
      const user = userEvent.setup();
      const lossHistory = createDrawHistory({
        id: "loss",
        cost: 3_000,
        totalWin: 0,
      });
      const { container } = render(
        <HistoryPanel history={[lossHistory]} />
      );

      await user.click(screen.getByRole("button", { name: /当選履歴/ }));

      const lossElement = container.querySelector(".text-error");
      expect(lossElement).not.toBeNull();
      expect(lossElement).toHaveTextContent("-3,000");
    });

    it("損益ゼロの場合、text-text-secondaryクラスが適用される", async () => {
      const user = userEvent.setup();
      const evenHistory = createDrawHistory({
        id: "even",
        cost: 3_000,
        totalWin: 3_000,
      });
      const { container } = render(
        <HistoryPanel history={[evenHistory]} />
      );

      await user.click(screen.getByRole("button", { name: /当選履歴/ }));

      // 損益0のテキストを探す — text-text-secondaryクラスかつfont-semiboldを持つ要素
      const profitElements = container.querySelectorAll(
        ".text-text-secondary.font-semibold"
      );
      const zeroProfit = Array.from(profitElements).find(
        (el) => el.textContent === "0"
      );
      expect(zeroProfit).toBeDefined();
    });
  });

  describe("アクセシビリティ", () => {
    it('aria-label="当選履歴"がsection要素に設定されている', () => {
      render(<HistoryPanel history={[]} />);

      const section = screen.getByLabelText("当選履歴");
      expect(section).toBeInTheDocument();
      expect(section.tagName).toBe("SECTION");
    });

    it("aria-controlsが設定されている", () => {
      render(<HistoryPanel history={[]} />);

      const toggleButton = screen.getByRole("button", { name: /当選履歴/ });
      expect(toggleButton).toHaveAttribute(
        "aria-controls",
        "history-panel-content"
      );
    });
  });
});
