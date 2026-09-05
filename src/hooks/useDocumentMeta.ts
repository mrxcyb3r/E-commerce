import { useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { BUSINESS_CONFIG } from '../config/business';

interface MetaOptions {
  title: string;
  description?: string;
  image?: string;
  canonicalPath?: string;
  type?: 'website' | 'product' | 'article' | 'video.other';
  keywords?: string;
  jsonLd?: object;
}

function setMeta(attr: 'name' | 'property', key: string, value?: string) {
  if (!value) return;
  const selector = `${attr === 'name' ? 'name' : 'property'}="${key}"`;
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${selector}]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

function setLink(rel: string, href?: string) {
  if (!href) return;
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/**
 * White-label aware document metadata setter. Title/description/OG defaults
 * come from `storeInfo` (store_settings table) and fall back to the branding
 * config file, so every deployed client gets its own title/meta without code.
 */
export function useDocumentMeta(options: MetaOptions) {
  const { storeInfo } = useStore();

  useEffect(() => {
    const brand = storeInfo.businessName || BUSINESS_CONFIG.businessName;
    const siteTitle = storeInfo.defaultSeoTitle || BUSINESS_CONFIG.defaultSeoTitle || brand;
    const siteDesc = storeInfo.defaultSeoDescription || BUSINESS_CONFIG.defaultSeoDescription || '';
    const siteImage = storeInfo.ogImageUrl || BUSINESS_CONFIG.ogImageUrl || '';
    const origin = window.location.origin;
    const canonical = `${origin}${options.canonicalPath && options.canonicalPath !== '/' ? options.canonicalPath : '/'}`;

    const title = options.title ? `${options.title} | ${brand}` : siteTitle;
    document.title = title;
    setLink('canonical', canonical);

    setMeta('property', 'og:site_name', brand);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', options.description ?? siteDesc);
    setMeta('property', 'og:image', options.image ?? siteImage);
    setMeta('property', 'og:type', options.type ?? 'website');
    setMeta('property', 'og:url', canonical);

    setMeta('name', 'description', options.description ?? siteDesc);
    setMeta('name', 'keywords', options.keywords ?? (storeInfo.businessCategory || BUSINESS_CONFIG.businessCategory || ''));
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', options.description ?? siteDesc);
    setMeta('name', 'twitter:image', options.image ?? siteImage);

    if (options.jsonLd) {
      let script = document.head.querySelector<HTMLScriptElement>('#page-jsonld');
      if (!script) {
        script = document.createElement('script');
        script.id = 'page-jsonld';
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(options.jsonLd);
    }
  }, [storeInfo, options.title, options.description, options.image, options.canonicalPath, options.type, options.jsonLd, options.keywords]);
}

export function formatSeoPrice(price: number): string {
  return `${new Intl.NumberFormat('en-US').format(price)} UZS`;
}