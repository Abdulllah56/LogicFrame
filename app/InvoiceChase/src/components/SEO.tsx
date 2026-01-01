import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogType?: "website" | "article" | "product";
  ogImage?: string;
  noIndex?: boolean;
  structuredData?: object;
}

const defaultMeta = {
  siteName: "PayChaser",
  title: "PayChaser - Automated Invoice Payment Reminders",
  description: "Stop chasing payments manually. PayChaser automates invoice reminders so you get paid faster. Track unpaid invoices, send professional reminders, and improve cash flow.",
  keywords: "invoice reminders, payment collection, accounts receivable, invoice tracking, payment automation, cash flow management, invoice management software, payment reminder system, overdue invoice reminders, automated billing",
  siteUrl: "https://paychaser.app",
  ogImage: "/og-image.png",
  twitterHandle: "@paychaser",
};

export const SEO = ({
  title,
  description = defaultMeta.description,
  keywords = defaultMeta.keywords,
  canonicalUrl,
  ogType = "website",
  ogImage = defaultMeta.ogImage,
  noIndex = false,
  structuredData,
}: SEOProps) => {
  const pageTitle = title 
    ? `${title} | ${defaultMeta.siteName}` 
    : defaultMeta.title;

  const fullCanonicalUrl = canonicalUrl 
    ? `${defaultMeta.siteUrl}${canonicalUrl}` 
    : defaultMeta.siteUrl;

  const fullOgImage = ogImage.startsWith("http") 
    ? ogImage 
    : `${defaultMeta.siteUrl}${ogImage}`;

  // Default structured data for the organization
  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "PayChaser",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "description": defaultMeta.description,
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "127",
    },
    "featureList": [
      "Automated payment reminders",
      "Invoice tracking",
      "Email customization",
      "Payment status monitoring",
      "Multi-client management",
    ],
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="title" content={pageTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="PayChaser" />
      <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow"} />
      <meta name="googlebot" content={noIndex ? "noindex, nofollow" : "index, follow"} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullCanonicalUrl} />
      
      {/* Language and Locale */}
      <meta httpEquiv="content-language" content="en" />
      <meta name="language" content="English" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullCanonicalUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={defaultMeta.siteName} />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullCanonicalUrl} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />
      <meta name="twitter:site" content={defaultMeta.twitterHandle} />
      <meta name="twitter:creator" content={defaultMeta.twitterHandle} />
      
      {/* Additional SEO Meta */}
      <meta name="theme-color" content="#00d4d4" />
      <meta name="msapplication-TileColor" content="#00d4d4" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={defaultMeta.siteName} />
      <meta name="format-detection" content="telephone=no" />
      
      {/* Preconnect for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Structured Data / JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData || defaultStructuredData)}
      </script>
    </Helmet>
  );
};

// Breadcrumb structured data helper
export const generateBreadcrumbSchema = (items: { name: string; url: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url,
  })),
});

// FAQ structured data helper
export const generateFAQSchema = (faqs: { question: string; answer: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map((faq) => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer,
    },
  })),
});

// Organization structured data
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "PayChaser",
  "url": "https://paychaser.app",
  "logo": "https://paychaser.app/logo.png",
  "sameAs": [
    "https://twitter.com/paychaser",
    "https://linkedin.com/company/paychaser",
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer support",
    "availableLanguage": "English",
  },
};

export default SEO;
