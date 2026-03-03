/**
 * 累計収支パネル
 *
 * 累計購入額・当選額・回収率・累計抽選回数/枚数・等級別当選回数を表示する。
 * design-system.md セクション6-2（カード規約）準拠。
 */

import { calculateRecoveryRate } from '@/lib/stats-calculator';
import { getDisplayName } from '@/components/prize-utils';
import { DEFAULT_CONFIG } from '@/config/prize-config';

/** StatsPanel の props 型定義 */
type StatsPanelProps = {
  /** 累計購入額（ぃえん） */
  totalSpent: number;
  /** 累計当選額（ぃえん） */
  totalWon: number;
  /** 累計抽選回数（10連の回数） */
  totalDraws: number;
  /** 累計購入枚数 */
  totalTickets: number;
  /** 等級別当選回数 */
  winCountByLevel: Record<string, number>;
};

/** 金額をカンマ区切りでフォーマットする */
function formatAmount(amount: number): string {
  return amount.toLocaleString('ja-JP');
}

/** 回収率の表示文字列を生成する */
function formatRecoveryRate(rate: number): string {
  return `${rate.toFixed(1)}%`;
}

export function StatsPanel({
  totalSpent,
  totalWon,
  totalDraws,
  totalTickets,
  winCountByLevel,
}: StatsPanelProps) {
  const recoveryRate = calculateRecoveryRate(totalWon, totalSpent);
  const isHighRecovery = recoveryRate >= 100;

  /** ハズレを除外した等級リスト（DEFAULT_CONFIGの配列順） */
  const prizeLevels = DEFAULT_CONFIG.prizes.filter(
    (prize) => prize.level !== 'miss'
  );

  return (
    <section
      className="bg-bg-secondary rounded-lg shadow-md p-4"
      aria-label="累計収支"
    >
      <h2 className="text-lg font-semibold text-text-primary mb-4">
        累計収支
      </h2>

      {/* 上段: 累計購入額・当選額・回収率 */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
        <div className="text-center">
          <p className="text-xs text-text-secondary mb-1">累計購入額</p>
          <p className="text-sm font-bold text-text-primary tabular-nums">
            {formatAmount(totalSpent)}
          </p>
          <p className="text-xs text-text-muted">ぃえん</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-text-secondary mb-1">累計当選額</p>
          <p className="text-sm font-bold text-text-primary tabular-nums">
            {formatAmount(totalWon)}
          </p>
          <p className="text-xs text-text-muted">ぃえん</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-text-secondary mb-1">回収率</p>
          <p
            className={`text-sm font-bold tabular-nums ${
              isHighRecovery ? 'text-accent-gold' : 'text-text-primary'
            }`}
            aria-label={
              isHighRecovery
                ? `回収率 ${formatRecoveryRate(recoveryRate)} 黒字`
                : `回収率 ${formatRecoveryRate(recoveryRate)}`
            }
          >
            {isHighRecovery && '▲'}
            {formatRecoveryRate(recoveryRate)}
          </p>
        </div>
      </div>

      {/* 中段: 累計抽選回数・枚数 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="text-center">
          <p className="text-xs text-text-secondary mb-1">累計抽選回数</p>
          <p className="text-sm font-bold text-text-primary tabular-nums">
            {formatAmount(totalDraws)}
            <span className="text-xs font-normal text-text-muted ml-1">
              回
            </span>
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-text-secondary mb-1">累計購入枚数</p>
          <p className="text-sm font-bold text-text-primary tabular-nums">
            {formatAmount(totalTickets)}
            <span className="text-xs font-normal text-text-muted ml-1">
              枚
            </span>
          </p>
        </div>
      </div>

      {/* 下段: 等級別当選回数 */}
      <div>
        <h3 className="text-sm font-semibold text-text-secondary mb-2">
          等級別当選回数
        </h3>
        <div className="space-y-1">
          {prizeLevels.map((prize) => {
            const count = winCountByLevel[prize.level] ?? 0;
            return (
              <div
                key={prize.level}
                className="flex justify-between items-center text-sm"
              >
                <span className="text-text-secondary">
                  {getDisplayName(prize.level)}
                </span>
                <span className="font-semibold text-text-primary tabular-nums">
                  {formatAmount(count)}
                  <span className="text-xs font-normal text-text-muted ml-1">
                    回
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
