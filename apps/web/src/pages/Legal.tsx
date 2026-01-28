import { SEO } from '../components/SEO';

export const Legal = () => {
    return (
        <>
            <SEO
                title="特定商取引法に基づく表記"
                description="Furukawa Archive OS - 特定商取引法に基づく表記"
            />
            <div className="container mx-auto px-6 pt-32 pb-24 max-w-4xl">
                <h1 className="text-4xl font-bold mb-12">特定商取引法に基づく表記</h1>

                <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold mb-4">販売事業者の名称</h2>
                        <p>古川耕太郎（個人）</p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold mb-4">運営統括責任者</h2>
                        <p>古川耕太郎</p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold mb-4">所在地</h2>
                        <p>石川県金沢市（詳細はお問い合わせください）</p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold mb-4">お問い合わせ先</h2>
                        <p>
                            メールアドレス: f.kotaro.0530@gmail.com<br />
                            電話番号: 090-1747-5106<br />
                            X (Twitter): <a href="https://x.com/HATAKE55555" target="_blank" rel="noopener noreferrer" className="text-cyan-600 dark:text-cyan-400 hover:underline">@HATAKE55555</a>
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold mb-4">販売価格</h2>
                        <p>任意の寄付金額（50円〜10,000円）</p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold mb-4">商品の引き渡し時期</h2>
                        <p>本サービスは寄付の受付であり、物品やサービスの提供はありません。</p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold mb-4">返品・キャンセルについて</h2>
                        <p>寄付の性質上、原則として返金には応じかねます。決済前に金額をご確認ください。</p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold mb-4">支払方法</h2>
                        <p>クレジットカード決済（Stripe経由）</p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold mb-4">その他</h2>
                        <p>
                            本サイトで受け付けている「おやつ代」は、対価性のある商品・サービスの販売ではなく、
                            研究活動・作品制作を応援するための任意の寄付です。<br />
                            <br />
                            寄付いただいた資金は、以下の用途に使用させていただきます：
                        </p>
                        <ul className="list-disc pl-6 mt-2">
                            <li>研究開発活動（プロトタイプ制作、実験機器等）</li>
                            <li>技術書籍・学習教材の購入</li>
                            <li>サーバー・ドメイン等の運用費用</li>
                            <li>イベント参加費・交通費</li>
                        </ul>
                    </section>

                    <section className="mb-8 p-6 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                        <h2 className="text-2xl font-bold mb-4">プライバシーと決済の安全性</h2>
                        <p>
                            決済はStripe社の安全な決済システムを通じて行われます。<br />
                            クレジットカード情報が当サイトに保存されることはありません。<br />
                            <br />
                            当サイトでは、Cookie同意管理システムを採用しており、
                            ユーザーの皆様のプライバシーを尊重しています。
                        </p>
                    </section>

                    <div className="mt-12 text-sm text-neutral-500 dark:text-neutral-400">
                        <p>最終更新日: 2026年1月28日</p>
                    </div>
                </div>
            </div>
        </>
    );
};
