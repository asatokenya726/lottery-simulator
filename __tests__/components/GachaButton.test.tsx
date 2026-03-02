import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GachaButton } from '@/components/GachaButton';

describe('GachaButton', () => {
  const defaultProps = {
    onDraw: vi.fn(),
    canDraw: true,
    isDrawing: false,
  };

  it('ボタンクリックで onDraw コールバックが呼ばれる', async () => {
    const onDraw = vi.fn();
    render(<GachaButton {...defaultProps} onDraw={onDraw} />);

    await userEvent.click(screen.getByRole('button'));

    expect(onDraw).toHaveBeenCalledTimes(1);
  });

  it('canDraw=false で disabled 属性が付く', () => {
    render(<GachaButton {...defaultProps} canDraw={false} />);

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('canDraw=false かつ isDrawing=false で残高不足メッセージが表示される', () => {
    render(<GachaButton {...defaultProps} canDraw={false} isDrawing={false} />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      '資金が足りません。0時に補給されます'
    );
  });

  it('canDraw=true で残高不足メッセージが非表示', () => {
    render(<GachaButton {...defaultProps} canDraw={true} />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('isDrawing=true で disabled かつテキストが「抽選中...」になる', () => {
    render(<GachaButton {...defaultProps} isDrawing={true} />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('抽選中...');
  });

  it('isDrawing=true で残高不足メッセージが非表示', () => {
    render(
      <GachaButton {...defaultProps} canDraw={false} isDrawing={true} />
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('aria-busy属性がisDrawingと連動する', () => {
    const { rerender } = render(
      <GachaButton {...defaultProps} isDrawing={false} />
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'false');

    rerender(<GachaButton {...defaultProps} isDrawing={true} />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
  });

  it('disabled時にクリックしても onDraw が呼ばれない', async () => {
    const onDraw = vi.fn();
    render(<GachaButton onDraw={onDraw} canDraw={false} isDrawing={false} />);

    await userEvent.click(screen.getByRole('button'));

    expect(onDraw).not.toHaveBeenCalled();
  });
});
