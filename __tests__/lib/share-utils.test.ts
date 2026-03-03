/**
 * share-utils テスト
 *
 * findBestPrize / buildShareText / buildShareUrl の単体テスト。
 */

import { describe, it, expect } from 'vitest';
import { findBestPrize, buildShareText, buildShareUrl } from '@/lib/share-utils';
import { createDrawResult } from '../helpers/test-factories';

// ============================================================
// findBestPrize
// ============================================================
describe('findBestPrize', () => {
  it('当選1件の場合、その結果を返す', () => {
    const results = [
      createDrawResult({ prizeLevel: '6th', amount: 300 }),
      createDrawResult(),
      createDrawResult(),
    ];

    const best = findBestPrize(results);
    expect(best).toEqual({ prizeLevel: '6th', amount: 300 });
  });

  it('複数当選で異なる金額の場合、最高金額の結果を返す', () => {
    const results = [
      createDrawResult({ prizeLevel: '7th', amount: 300 }),
      createDrawResult({ prizeLevel: '5th', amount: 10_000 }),
      createDrawResult({ prizeLevel: '6th', amount: 3_000 }),
      createDrawResult(),
    ];

    const best = findBestPrize(results);
    expect(best).toEqual({ prizeLevel: '5th', amount: 10_000 });
  });

  it('同額の当選が複数ある場合、先頭（最初に見つかった方）を返す', () => {
    const results = [
      createDrawResult({ prizeLevel: '6th', amount: 3_000 }),
      createDrawResult({ prizeLevel: '7th', amount: 3_000 }),
      createDrawResult(),
    ];

    const best = findBestPrize(results);
    expect(best).toEqual({ prizeLevel: '6th', amount: 3_000 });
  });

  it('全ハズレ（全て amount === 0）の場合、null を返す', () => {
    const results = [
      createDrawResult(),
      createDrawResult(),
      createDrawResult(),
    ];

    const best = findBestPrize(results);
    expect(best).toBeNull();
  });

  it('prizeLevel が null で amount > 0 の結果がある場合でも、amount で判定する', () => {
    // エッジケース: prizeLevel が null だが amount が 0 でない（通常は起こらないが型上は可能）
    const results = [
      createDrawResult({ prizeLevel: null, amount: 500 }),
      createDrawResult(),
    ];

    const best = findBestPrize(results);
    expect(best).toEqual({ prizeLevel: null, amount: 500 });
  });

  it('空配列の場合、null を返す', () => {
    const best = findBestPrize([]);
    expect(best).toBeNull();
  });

  it('全要素が amount === 0 の場合、null を返す（prizeLevel が "miss" のケース）', () => {
    const results = [
      createDrawResult({ prizeLevel: null, amount: 0 }),
      createDrawResult({ prizeLevel: null, amount: 0 }),
    ];

    const best = findBestPrize(results);
    expect(best).toBeNull();
  });
});

// ============================================================
// buildShareText
// ============================================================
describe('buildShareText', () => {
  it('displayName がある場合、等級と金額を含むテキストを返す', () => {
    const text = buildShareText('1等 7億ぃえん', 700_000_000, 'https://example.com');

    expect(text).toContain('1等 7億ぃえん');
    expect(text).toContain('700,000,000ぃえん');
    expect(text).toContain('当たった');
  });

  it('displayName が null の場合、全ハズレ用テキストを返す', () => {
    const text = buildShareText(null, 0, 'https://example.com');

    expect(text).toContain('全ハズレ');
    expect(text).not.toContain('当たった');
  });

  it('サイトURLがテキスト末尾に含まれる', () => {
    const text = buildShareText('6等 300ぃえん', 300, 'https://example.com');

    expect(text).toContain('https://example.com');
    expect(text.endsWith('https://example.com')).toBe(true);
  });

  it('サイトURLが空文字の場合、URLを含まない', () => {
    const text = buildShareText('6等 300ぃえん', 300, '');

    expect(text).not.toContain('\n');
    expect(text).toContain('当たった');
  });

  it('合計当選額が桁区切りでフォーマットされる', () => {
    const text = buildShareText('1等 7億ぃえん', 700_000_000, '');

    expect(text).toContain('700,000,000');
  });
});

// ============================================================
// buildShareUrl
// ============================================================
describe('buildShareUrl', () => {
  it('Twitter Web Intent URLフォーマットで返す', () => {
    const url = buildShareUrl('テスト');

    expect(url).toMatch(/^https:\/\/twitter\.com\/intent\/tweet\?text=/);
  });

  it('テキストが encodeURIComponent でエンコードされる', () => {
    const text = '宝くじシミュレーターで1等が当たった!';
    const url = buildShareUrl(text);

    expect(url).toContain(encodeURIComponent(text));
  });

  it('日本語や特殊文字が正しくエンコードされる', () => {
    const text = 'テスト!\n https://example.com';
    const url = buildShareUrl(text);

    // 改行やスペースがエンコードされていることを確認
    expect(url).not.toContain('\n');
    expect(url).toContain(encodeURIComponent(text));
  });

  it('空文字の場合、text パラメータが空でURLが生成される', () => {
    const url = buildShareUrl('');

    expect(url).toBe('https://twitter.com/intent/tweet?text=');
  });
});
