import { Helmet } from 'react-helmet-async';

type SEOProps = {
    title?: string;
    description?: string;
    image?: string;
    type?: 'website' | 'article';
};

export const SEO = ({
    title = "Furukawa Archive OS",
    description = "Interactive Research Portfolio & Digital Archive. Exploring the variability of subjective meaning in physiological responses.",
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
            <meta name="keywords" content="古川耕太郎, Kotaro Furukawa, HATAKE, HCI, 未踏, 技育博, 研究, ポートフォリオ" />
        </Helmet>
    );
};
