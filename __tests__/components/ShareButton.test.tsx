import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShareButton } from '@/components/ShareButton';
import { createDrawResult } from '../helpers/test-factories';

describe('ShareButton', () => {
  let openSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
  });

  afterEach(() => {
    openSpy.mockRestore();
  });

  it('results が空配列の場合、何もレンダリングしない', () => {
    const { container } = render(<ShareButton results={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('results がある場合、シェアボタンが表示される', () => {
    const results = [createDrawResult({ prizeLevel: '6th', amount: 300 })];
    render(<ShareButton results={results} />);

    const button = screen.getByRole('button', { name: /シェア/ });
    expect(button).toBeInTheDocument();
  });

  it('ボタンに適切な aria-label が設定されている', () => {
    const results = [createDrawResult()];
    render(<ShareButton results={results} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute(
      'aria-label',
      expect.stringContaining('新しいタブで開きます')
    );
  });

  it('ボタンクリック時に window.open が X Web Intent URL で呼ばれる', async () => {
    const user = userEvent.setup();
    const results = [createDrawResult({ prizeLevel: '6th', amount: 300 })];
    render(<ShareButton results={results} />);

    await user.click(screen.getByRole('button'));

    expect(openSpy).toHaveBeenCalledTimes(1);
    const url = openSpy.mock.calls[0][0] as string;
    expect(url).toContain('twitter.com/intent/tweet');
  });

  it('window.open に noopener,noreferrer が指定される', async () => {
    const user = userEvent.setup();
    const results = [createDrawResult({ prizeLevel: '1st', amount: 700_000_000 })];
    render(<ShareButton results={results} />);

    await user.click(screen.getByRole('button'));

    expect(openSpy).toHaveBeenCalledWith(
      expect.any(String),
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('当選結果のシェアテキストに当選情報が含まれる', async () => {
    const user = userEvent.setup();
    const results = [
      createDrawResult({ prizeLevel: '3rd', amount: 1_000_000 }),
      createDrawResult({ prizeLevel: null, amount: 0 }),
    ];
    render(<ShareButton results={results} />);

    await user.click(screen.getByRole('button'));

    const url = openSpy.mock.calls[0][0] as string;
    // シェアURLにエンコードされたテキストが含まれる
    const decodedText = decodeURIComponent(url.split('text=')[1]);
    expect(decodedText).toContain('当たった');
  });

  it('全ハズレ結果のシェアテキストにハズレ情報が含まれる', async () => {
    const user = userEvent.setup();
    const results = [
      createDrawResult({ prizeLevel: null, amount: 0 }),
      createDrawResult({ prizeLevel: null, amount: 0 }),
    ];
    render(<ShareButton results={results} />);

    await user.click(screen.getByRole('button'));

    const url = openSpy.mock.calls[0][0] as string;
    const decodedText = decodeURIComponent(url.split('text=')[1]);
    expect(decodedText).toContain('全ハズレ');
  });
});
