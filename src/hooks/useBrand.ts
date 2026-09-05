import { useStore } from '../context/StoreContext';
import { BUSINESS_CONFIG } from '../config/business';
import { BusinessConfig } from '../types/business';

/**
 * White-label aware brand accessor.
 * Returns store branding with sensible fallbacks so every field used by
 * components is always defined — either from CMS (store_settings table)
 * or from the branding defaults in src/config/business.ts.
 *
 * Use this hook anywhere you need store identity. It never hardcodes
 * shop-specific values.
 */
export function useBrand(): BusinessConfig & {
  displayName: string;
  siteTitle: string;
  siteDescription: string;
  siteKeywords: string;
  canonicalBase: string;
  brandStyles: { primaryColor: string; secondaryColor: string; accentColor: string };
} {
  const { storeInfo } = useStore();
  const fallback = BUSINESS_CONFIG;

  const cfg: BusinessConfig = { ...fallback, ...storeInfo };

  // Always compute derived values from the merged config.
  const displayName = cfg.name || cfg.businessName || fallback.businessName || 'Store';
  const siteTitle =
    cfg.defaultSeoTitle ||
    fallback.defaultSeoTitle ||
    `${displayName} — Onlayn do'kon`;
  const siteDescription =
    cfg.defaultSeoDescription ||
    fallback.defaultSeoDescription ||
    cfg.businessDescription ||
    fallback.businessDescription ||
    '';
  const siteKeywords =
    cfg.defaultSeoKeywords ||
    fallback.defaultSeoKeywords ||
    cfg.businessCategory ||
    fallback.businessCategory ||
    '';
  const canonicalBase = typeof window !== 'undefined' ? window.location.origin : '';

  return {
    ...cfg,
    displayName,
    siteTitle,
    siteDescription,
    siteKeywords,
    canonicalBase,
    brandStyles: {
      primaryColor: cfg.primaryColor || fallback.primaryColor || '#0f172a',
      secondaryColor: cfg.secondaryColor || fallback.secondaryColor || '#f59e0b',
      accentColor: cfg.accentColor || fallback.accentColor || '#ef4444',
    },
  };
}