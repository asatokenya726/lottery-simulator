import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "利用規約 | 宝くじシミュレーター",
  description: "宝くじシミュレーターの利用規約・免責事項",
};

/** 利用規約の各セクション定義 */
const sections = [
  {
    title: "サービスの性質",
    content:
      "本サービスはエンターテインメント目的のシミュレーションであり、実際の宝くじの購入・当選とは一切関係ありません。",
  },
  {
    title: "ゲーム内通貨",
    content:
      "ゲーム内通貨「ぃえん」は本サービス内でのみ使用できる仮想の通貨であり、現実の通貨・電子マネー・その他の財産的価値との交換はできません。",
  },
  {
    title: "確率データの出典",
    content:
      "本サービスで使用する当選確率は、公表されている宝くじの当選確率に基づいていますが、公式の宝くじとは無関係です。",
  },
  {
    title: "免責事項",
    content:
      "データの消失、ブラウザの不具合、その他本サービスの利用に起因する損害について、一切の責任を負いません。",
  },
  {
    title: "知的財産権",
    content:
      "本サービスのUI/デザイン/コードの著作権は開発者に帰属します。",
  },
  {
    title: "禁止事項",
    content:
      "本サービスを利用した営利活動、データの改ざん・不正利用を禁止します。",
  },
  {
    title: "規約の変更",
    content: "本規約は予告なく変更する場合があります。",
  },
  {
    title: "準拠法",
    content: "本規約は日本法に準拠します。",
  },
  {
    title: "プライバシー",
    content:
      "本サービスは個人情報を収集しません。ゲームデータはお使いのブラウザにのみ保存されます。",
  },
] as const;

export default function TermsPage() {
  return (
    <main className="min-h-screen px-4 py-8 sm:px-8">
      <article className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-2xl font-bold text-text-primary">
          利用規約
        </h1>

        <div className="space-y-8">
          {sections.map((section, index) => (
            <section key={section.title}>
              <h2 className="mb-2 text-lg font-semibold text-text-primary">
                {index + 1}. {section.title}
              </h2>
              <p className="text-text-secondary leading-relaxed">
                {section.content}
              </p>
            </section>
          ))}
        </div>

        <div className="mt-12">
          <Link
            href="/"
            className="text-accent-gold hover:text-accent-gold-light transition-colors duration-150"
          >
            トップページに戻る
          </Link>
        </div>
      </article>
    </main>
  );
}
