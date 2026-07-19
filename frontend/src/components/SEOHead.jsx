/**
 * SEOHead — Dynamic meta tags using BRAND_NAME
 */
import { useEffect } from 'react';
import { getPageTitle, getMetaDescription } from '../constants';

export default function SEOHead({ page, title, description }) {
  useEffect(() => {
    document.title = title || getPageTitle(page);
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', description || getMetaDescription(page));
  }, [page, title, description]);

  return null;
}
