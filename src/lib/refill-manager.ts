/**
 * 資金補給ロジック
 *
 * ゲーム内通貨「ぃえん」の補給要否判定と補給額加算を行う。
 * api-design.md セクション1-3 / error-handling.md セクション3-1 準拠。
 *
 * 全て純粋関数（副作用なし）。日付・閾値を引数で受け取りテスト容易性を確保。
 */

/**
 * 資金補給の要否を判定する
 *
 * 以下の2条件を両方満たす場合にtrueを返す:
 * - 今日が最終補給日より後（日付が変わっている）
 * - 残高が閾値未満
 *
 * lastRefillDateが空文字の場合は初回補給とみなしtrueを返す。
 * 判定系関数のためthrowせずbooleanで返す。
 *
 * @param balance - 現在の所持金（ぃえん）
 * @param lastRefillDate - 最終補給日（YYYY-MM-DD、空文字は初回）
 * @param today - 今日の日付（YYYY-MM-DD）
 * @param threshold - 補給条件の残高閾値（ぃえん）
 * @returns 補給すべきか
 */
export function shouldRefill(
  balance: number,
  lastRefillDate: string,
  today: string,
  threshold: number
): boolean {
  // 初回補給: lastRefillDateが空文字の場合は常にtrue
  if (lastRefillDate === '') {
    return true;
  }

  return today > lastRefillDate && balance < threshold;
}

/**
 * 補給額を残高に加算する
 *
 * refillAmountが0以下の場合はErrorをスローする（error-handling.md LOGIC分類）。
 *
 * @param balance - 現在の所持金（ぃえん）
 * @param refillAmount - 補給額（ぃえん）
 * @returns 補給後の残高
 * @throws {Error} 補給額が0以下の場合
 */
export function applyRefill(balance: number, refillAmount: number): number {
  if (refillAmount <= 0) {
    throw new Error('Invalid refill amount');
  }
  return balance + refillAmount;
}
