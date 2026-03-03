import type { Metadata } from "next";
import "./globals.css";

/** metadataBase: VERCEL_URL環境変数で動的解決、ローカルはlocalhost:3000 */
const getBaseUrl = (): string => {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
};

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: {
    default: "宝くじシミュレーター",
    template: "%s | 宝くじシミュレーター",
  },
  description:
    "宝くじの当選確率を「10連ガチャ」UIで体感できるWebアプリ。年末ジャンボなどの宝くじを仮想的に購入し、当選確率を実感できます。",
  openGraph: {
    title: "宝くじシミュレーター",
    description:
      "宝くじの当選確率を「10連ガチャ」UIで体感。ゲーム内通貨「ぃえん」でノーリスクに宝くじ体験。",
    siteName: "宝くじシミュレーター",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "宝くじシミュレーター",
    description:
      "宝くじの当選確率を「10連ガチャ」UIで体感。ゲーム内通貨「ぃえん」でノーリスクに宝くじ体験。",
  },
  robots: {
    index: true,
    follow: true,
  },
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
