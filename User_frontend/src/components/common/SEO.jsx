import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const SEO = ({ title, description, canonical, ogType, ogImage, keywords }) => {
  const location = useLocation();
  const siteUrl = import.meta.env.VITE_FRONTEND_URL || 'https://ticketing.theconnplex.com'; // Replace with your actual production URL
  const currentUrl = `${siteUrl}${location.pathname}${location.search}`;
  const canonicalUrl = canonical || currentUrl;
  console.log(canonicalUrl, ":canonicalUrl")


  return (
    <Helmet>
    
      <link rel="canonical" href={canonicalUrl} />

    </Helmet>
  );
};

export default SEO;
