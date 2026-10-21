// Replace with the enterprise URL, or set VITE_CRM_URL in .env.local.
export const CRM_URL: string = import.meta.env.VITE_CRM_URL || '#/crm-demo';

// Internal hash links always start at Vite's deployment base, including in new tabs.
export function resourceHref(url: string): string {
  return url.startsWith('#/') ? `${import.meta.env.BASE_URL}${url}` : url;
}
