import { Helmet } from "react-helmet-async";

interface SeoHelmetProps {
  title: string;
  description: string;
  canonical?: string;
}

const SeoHelmet = ({ title, description, canonical }: SeoHelmetProps) => (
  <Helmet>
    <title>{title}</title>
    <meta name="description" content={description} />
    {canonical && <link rel="canonical" href={canonical} />}
  </Helmet>
);

export default SeoHelmet;
