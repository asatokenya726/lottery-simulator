import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "宝くじシミュレーター",
  description:
    "宝くじの当選確率を「10連ガチャ」UIで体感できるWebアプリ。年末ジャンボなどの宝くじを仮想的に購入し、当選確率を実感できます。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="font-sans antialiased bg-bg-primary text-text-primary">
        {children}
      </body>
    </html>
  );
}
