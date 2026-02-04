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
    const siteTitleRaw = title || t('seo.default_title');
    const siteDesc = description || t('seo.default_description');

    const siteTitle = siteTitleRaw === "Furukawa Archive OS" ? siteTitleRaw : `${siteTitleRaw}`;

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
                    "description": siteDesc
                })}
            </script>
        </Helmet>
    );
};
