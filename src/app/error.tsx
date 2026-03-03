'use client';

import { useEffect } from 'react';
import { createStorage } from '@/data/storage';

/** error.tsx の props 型（Next.js App Router 規約） */
type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * ルートレベルのエラーバウンダリ
 *
 * error-handling.md セクション6 に準拠。
 * 未キャッチエラー時にフォールバックUIを表示し、
 * 「ページを再読み込み」「データをリセットして再開」の2つの復旧アクションを提供する。
 */
export default function ErrorPage({ error }: ErrorProps) {
  /** エラー発生時にコンソールへ出力 */
  useEffect(() => {
    console.error('未キャッチエラー:', error);
  }, [error]);

  /** ページを再読み込み */
  const handleReload = () => {
    window.location.reload();
  };

  /** アプリデータを全削除して再読み込み */
  const handleResetAndReload = () => {
    const storage = createStorage();
    storage.clear();
    window.location.reload();
  };

  return (
    <div
      role="alert"
      className="min-h-screen flex items-center justify-center px-4"
    >
      <div className="bg-bg-secondary rounded-lg shadow-md p-6 max-w-sm w-full text-center">
        <h2 className="text-2xl font-bold text-error mb-4">
          予期しないエラーが発生しました
        </h2>

        <p className="text-text-secondary text-sm mb-6">
          申し訳ありません。問題が発生しました。
        </p>

        <div className="space-y-3">
          <button
            type="button"
            onClick={handleReload}
            className="w-full bg-bg-tertiary text-text-primary px-6 py-3 font-semibold rounded-md cursor-pointer transition-colors hover:bg-bg-tertiary/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-primary"
          >
            ページを再読み込み
          </button>

          <p className="text-text-secondary text-xs">
            問題が解決しない場合は、データリセットをお試しください
          </p>

          <button
            type="button"
            onClick={handleResetAndReload}
            className="w-full bg-error text-bg-primary px-6 py-3 font-semibold rounded-md cursor-pointer transition-colors hover:bg-error/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error"
          >
            データをリセットして再開
          </button>
        </div>
      </div>
    </div>
  );
}
