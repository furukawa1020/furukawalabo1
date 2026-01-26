import { Helmet } from 'react-helmet-async';

type SEOProps = {
    title?: string;
    description?: string;
    image?: string;
    type?: 'website' | 'article';
};

export const SEO = ({
    title = "Furukawa Archive OS | Kotaro Furukawa (古川耕太郎)",
    description = "古川耕太郎 (Kotaro Furukawa) のポートフォリオサイト。研究・開発・デザイン・執筆など、様々な領域での活動とアウトプットをアーカイブしています。",
    image = "https://furukawa-archive-os.railway.app/images/research_plan.png",
    type = "website"
}: SEOProps) => {
    const siteTitle = title === "Furukawa Archive OS" ? title : `${title} | Furukawa Archive OS`;

    return (
        <Helmet>
            <title>{siteTitle}</title>
            <meta name="description" content={description} />
            <meta property="og:title" content={siteTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:type" content={type} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:creator" content="@HATAKE55555" />
            <meta name="keywords" content="古川耕太郎, Kotaro Furukawa, hatake, furukawa, furukawa1020, ko1020, ポートフォリオ, アーカイブ, 作品集" />

            <script type="application/ld+json">
                {JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Person",
                    "name": "Kotaro Furukawa",
                    "alternateName": ["古川耕太郎", "はたけ/Furukawa", "hatake", "furukawa", "furukawa1020", "ko1020", "古川 耕太郎"],
                    "url": "https://furukawalab.com/",
                    "sameAs": [
                        "https://twitter.com/HATAKE55555",
                        "https://github.com/furukawa1020",
                        "https://protopedia.net/prototyper/hatake",
                        "https://www.instagram.com/ko1020/"
                    ],
                    "description": "古川耕太郎 (Kotaro Furukawa) のポートフォリオサイト。研究・開発・デザイン・執筆など、様々な領域での活動とアウトプットをアーカイブしています。"
                })}
            </script>
        </Helmet>
    );
};
