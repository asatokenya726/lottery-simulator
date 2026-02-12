/**
 * 通貨管理ロジック
 *
 * ゲーム内通貨「ぃえん」の購入可否判定・残高差し引き・当選金加算・購入額計算を行う。
 * api-design.md セクション1-2 / error-handling.md セクション3-1 準拠。
 *
 * 全て純粋関数（副作用なし）。整数演算のみ。
 */

/**
 * 残高が購入額以上かを判定する
 *
 * 判定系関数のためthrowせずbooleanで返す。
 *
 * @param balance - 現在の所持金（ぃえん）
 * @param cost - 購入額（ぃえん）
 * @returns 購入可否
 */
export function canPurchase(balance: number, cost: number): boolean {
  return balance >= cost;
}

/**
 * 残高から購入額を差し引く
 *
 * 残高不足時はErrorをスローする（error-handling.md LOGIC分類）。
 *
 * @param balance - 現在の所持金（ぃえん）
 * @param cost - 購入額（ぃえん）
 * @returns 差し引き後の残高
 * @throws {Error} 残高不足の場合
 */
export function deductBalance(balance: number, cost: number): number {
  if (balance < cost) {
    throw new Error('Insufficient balance');
  }
  return balance - cost;
}

/**
 * 当選金を残高に加算する
 *
 * @param balance - 現在の所持金（ぃえん）
 * @param winnings - 当選金額（ぃえん）
 * @returns 加算後の残高
 */
export function addWinnings(balance: number, winnings: number): number {
  return balance + winnings;
}

/**
 * 指定枚数分の購入額を計算する
 *
 * @param ticketPrice - 1枚の価格（ぃえん）
 * @param count - 枚数
 * @returns 合計購入額
 */
export function calculateDrawCost(
  ticketPrice: number,
  count: number
): number {
  return ticketPrice * count;
}
