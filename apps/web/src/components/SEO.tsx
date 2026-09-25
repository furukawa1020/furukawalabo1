import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

type SEOProps = {
    title?: string;
    description?: string;
    image?: string;
    type?: 'website' | 'article';
};

export const SEO = ({
    title,
    description,
    image = "https://furukawalab.com/images/og-main.png",
    type = "website"
}: SEOProps) => {
    const { t } = useTranslation();

    // Use props if provided, otherwise fallback to translated defaults
    const siteDesc = description || t('seo.default_description');

    const siteTitle = title ? `${title} | 古川耕太郎 公式サイト` : t('seo.default_title');

    return (
        <Helmet>
            <title>{siteTitle}</title>
            <meta name="description" content={siteDesc} />
            <meta property="og:title" content={siteTitle} />
            <meta property="og:description" content={siteDesc} />
            <meta property="og:image" content={image} />
            <meta property="og:type" content={type} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:creator" content="@HATAKE55555" />
            <meta name="keywords" content="古川耕太郎, Kotaro Furukawa, hatake, furukawa, furukawa1020, ko1020, ポートフォリオ, アーカイブ, 作品集, 製造業DX, ソフトウェア開発実務, ハードウェアプロトタイプ, ソフトウェアプロトタイプ, 受託開発, 業務委託, プロトタイプ開発, フリーランス, エンジニア採用, 仕事受付中, ハードウェア開発, IoT, React, FastAPI, M5Stack, AI開発, OpenAI, Gemini" />

            <script type="application/ld+json">
                {JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Person",
                    "name": "古川耕太郎",
                    "alternateName": ["Kotaro Furukawa", "はたけ/Furukawa", "hatake", "furukawa", "furukawa1020", "ko1020", "古川 耕太郎"],
                    "url": "https://furukawalab.com/",
                    "email": "f.kotaro.0530@gmail.com",
                    "jobTitle": "エンジニア / 研究者 / プロトタイパー",
                    "description": siteDesc,
                    "knowsAbout": ["製造業DX", "ソフトウェア開発実務", "ハードウェアプロトタイプ受託開発", "ソフトウェアプロトタイプ受託開発", "React", "TypeScript", "FastAPI", "Ruby on Rails", "M5Stack", "IoT", "HCI", "生体信号処理", "AI開発", "プロトタイプ開発", "受託開発", "ハッカソン"],
                    "hasOccupation": {
                        "@type": "Occupation",
                        "name": "フリーランスエンジニア / 研究者",
                        "description": "製造業DXでのソフトウェア開発実務、ハードウェアおよびソフトウェア両面でのプロトタイプ受託開発・業務委託・AI開発を受け付けています。"
                    },
                    "sameAs": [
                        "https://twitter.com/HATAKE55555",
                        "https://github.com/furukawa1020",
                        "https://protopedia.net/prototyper/hatake",
                        "https://www.instagram.com/ko1020/"
                    ]
                })}
            </script>
        </Helmet>
    );
};
