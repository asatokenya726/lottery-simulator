'use client';

/** 残高不足メッセージコンポーネント（要件M-02準拠） */
export function InsufficientFunds() {
  return (
    <p role="alert" className="text-warning text-sm mt-2">
      資金が足りません。0時に補給されます
    </p>
  );
}
