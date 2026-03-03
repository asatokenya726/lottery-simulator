import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '利用規約 | 宝くじシミュレーター',
  description: '宝くじシミュレーターの利用規約・免責事項',
};

/** 利用規約ページ（サーバーコンポーネント） */
export default function TermsPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-text-primary text-2xl font-bold mb-8">利用規約</h1>

      <div className="space-y-8 text-text-secondary text-sm leading-relaxed">
        {/* セクション1: サービスの性質 */}
        <section>
          <h2 className="text-text-primary text-lg font-semibold mb-2">
            1. サービスの性質
          </h2>
          <p>
            本サービスはエンターテインメント目的のシミュレーションであり、実際の宝くじの購入・当選とは一切関係ありません。
          </p>
        </section>

        {/* セクション2: ゲーム内通貨 */}
        <section>
          <h2 className="text-text-primary text-lg font-semibold mb-2">
            2. ゲーム内通貨
          </h2>
          <p>
            ゲーム内通貨「ぃえん」は本サービス内でのみ使用できる仮想の通貨であり、現実の通貨・電子マネー・その他の財産的価値との交換はできません。
          </p>
        </section>

        {/* セクション3: 確率データの出典 */}
        <section>
          <h2 className="text-text-primary text-lg font-semibold mb-2">
            3. 確率データの出典
          </h2>
          <p>
            本サービスで使用する当選確率は、公表されている宝くじの当選確率に基づいていますが、公式の宝くじとは無関係です。
          </p>
        </section>

        {/* セクション4: 免責事項 */}
        <section>
          <h2 className="text-text-primary text-lg font-semibold mb-2">
            4. 免責事項
          </h2>
          <p>
            データの消失、ブラウザの不具合、その他本サービスの利用に起因する損害について、一切の責任を負いません。
          </p>
        </section>

        {/* セクション5: 知的財産権 */}
        <section>
          <h2 className="text-text-primary text-lg font-semibold mb-2">
            5. 知的財産権
          </h2>
          <p>
            本サービスのUI・デザイン・コードの著作権は開発者に帰属します。
          </p>
        </section>

        {/* セクション6: 禁止事項 */}
        <section>
          <h2 className="text-text-primary text-lg font-semibold mb-2">
            6. 禁止事項
          </h2>
          <p>
            本サービスを利用した営利活動、データの改ざん・不正利用を禁止します。
          </p>
        </section>

        {/* セクション7: 規約の変更 */}
        <section>
          <h2 className="text-text-primary text-lg font-semibold mb-2">
            7. 規約の変更
          </h2>
          <p>本規約は予告なく変更する場合があります。</p>
        </section>

        {/* セクション8: 準拠法 */}
        <section>
          <h2 className="text-text-primary text-lg font-semibold mb-2">
            8. 準拠法
          </h2>
          <p>本規約は日本法に準拠します。</p>
        </section>

        {/* セクション9: プライバシー */}
        <section>
          <h2 className="text-text-primary text-lg font-semibold mb-2">
            9. プライバシー
          </h2>
          <p>
            本サービスは個人情報を収集しません。ゲームデータはお使いのブラウザにのみ保存されます。
          </p>
        </section>
      </div>

      {/* トップページへの戻りリンク */}
      <div className="mt-10">
        <Link
          href="/"
          className="text-accent-gold hover:text-accent-gold-light underline text-sm"
        >
          トップページに戻る
        </Link>
      </div>
    </main>
  );
}
