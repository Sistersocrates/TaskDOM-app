import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SocialMetaTagsProps {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  type?: 'website' | 'article';
  siteName?: string;
  twitterCard?: 'summary' | 'summary_large_image';
}

const SocialMetaTags: React.FC<SocialMetaTagsProps> = ({
  title,
  description,
  url,
  imageUrl,
  type = 'website',
  siteName = 'TaskDOM - Reading Companion',
  twitterCard = 'summary_large_image'
}) => {
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content={siteName} />
      {imageUrl && <meta property="og:image" content={imageUrl} />}
      {imageUrl && <meta property="og:image:width" content="1200" />}
      {imageUrl && <meta property="og:image:height" content="630" />}
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {imageUrl && <meta name="twitter:image" content={imageUrl} />}
      <meta name="twitter:site" content="@TaskDOM" />
      <meta name="twitter:creator" content="@TaskDOM" />

      {/* LinkedIn */}
      <meta property="linkedin:title" content={title} />
      <meta property="linkedin:description" content={description} />
      {imageUrl && <meta property="linkedin:image" content={imageUrl} />}

      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="TaskDOM" />
      <meta name="theme-color" content="#DC2626" />
      
      {/* Structured Data for Books */}
      {type === 'article' && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": title,
            "description": description,
            "url": url,
            "image": imageUrl,
            "author": {
              "@type": "Organization",
              "name": "TaskDOM"
            },
            "publisher": {
              "@type": "Organization",
              "name": "TaskDOM",
              "logo": {
                "@type": "ImageObject",
                "url": `${window.location.origin}/logo.png`
              }
            }
          })}
        </script>
      )}
    </Helmet>
  );
};

export default SocialMetaTags;