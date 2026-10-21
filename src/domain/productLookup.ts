import { demoData } from '../data/demo/demoData.ts';
import type { Product } from '../data/demo/types.ts';

export const normalizeProductText = (text: string) => text.normalize('NFKC').replace(/\s+/g, '').toUpperCase();
const escapePattern = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export function findProducts(text: string): Product[] {
  const q = normalizeProductText(text);
  return demoData.products.filter(product => [product.name, ...product.aliases, product.material_no, product.manufacturing_no]
    .some(alias => new RegExp(`(?<![A-Z0-9])${escapePattern(normalizeProductText(alias))}(?![A-Z0-9])`).test(q)));
}
export function searchProducts(text: string): Product[] {
  const q = normalizeProductText(text);
  return q ? demoData.products.filter(product => [product.name, ...product.aliases, product.material_no, product.manufacturing_no]
    .some(alias => normalizeProductText(alias).includes(q))) : [];
}
export const productDetailRoute = (id: string) => `#/F6?product=${encodeURIComponent(id)}`;
export function routeProductId(hash: string): string | null {
  return new URLSearchParams(hash.split('?')[1] ?? '').get('product');
}
