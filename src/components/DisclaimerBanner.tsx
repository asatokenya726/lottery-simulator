import Link from 'next/link';

/**
 * 免責表示バナー（フッター常時表示）
 *
 * 法務リスク分析書 セクション2-6 に準拠。
 * サーバーコンポーネント（静的テキストとリンクのみ、状態管理不要）。
 */
export function DisclaimerBanner() {
  return (
    <footer
      className="bg-bg-secondary border-t border-bg-tertiary px-4 lg:px-8 py-3 text-center"
    >
      <p className="text-warning text-sm font-semibold">
        これはシミュレーションです。実際のお金は使用されません。
      </p>
      <p className="text-text-secondary text-xs mt-1">
        実際の宝くじとは関係ありません。
        <Link href="/terms" className="text-info underline ml-1">
          利用規約
        </Link>
      </p>
      <div className="text-text-muted text-xs mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
        <a href="tel:188" className="underline hover:text-text-secondary">
          消費者ホットライン（188）
        </a>
        <a
          href="tel:0120-783-556"
          className="underline hover:text-text-secondary"
        >
          いのちの電話（0120-783-556）
        </a>
        <a
          href="https://www.mhlw.go.jp/kokoro/support/mhcenter.html"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-text-secondary"
        >
          精神保健福祉センター一覧
        </a>
      </div>
    </footer>
  );
}
