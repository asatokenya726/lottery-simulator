/** BalanceDisplay の props 型定義 */
type BalanceDisplayProps = {
  /** 現在の所持金（ぃえん） */
  balance: number;
};

/** 残高を常時表示するコンポーネント */
export function BalanceDisplay({ balance }: BalanceDisplayProps) {
  return (
    <div className="text-center" role="status" aria-label="所持金">
      <p className="text-sm text-text-secondary">所持金</p>
      <p className="text-3xl font-bold text-accent-gold tabular-nums">
        {balance.toLocaleString('ja-JP')}
        <span className="text-xl font-semibold ml-1">ぃえん</span>
      </p>
    </div>
  );
}
