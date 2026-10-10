import { demoData } from '../data/demo/demoData.ts';
import type { DemoData, Grade } from '../data/demo/types.ts';

export function percentage(numerator: number, denominator: number): number | null {
  return denominator > 0 && Number.isFinite(numerator) && Number.isFinite(denominator)
    ? numerator / denominator * 100 : null;
}
export function formatPercentage(value: number | null): string {
  return value === null ? '不適用' : `${value.toFixed(2)}%`;
}
export const demoDisclosure = 'Demo 模擬資料；AI 回答為預設模擬，尚未連接即時模型。';
export const quoteDisclosure = '歷史報價僅供參考，不代表現行有效價格。';

export interface CallFilters { month?: string; salespersonId?: string; region?: string; grade?: Grade; customerId?: string; status?: 'reached' | 'unreached' | 'zero' }
export function getCallKpi(filters: CallFilters = {}, data: DemoData = demoData) {
  const month = filters.month ?? data.meta.current_month;
  // The specification contains one month of requirements. Other months have no known denominator.
  if (month !== data.meta.current_month) return { availability: 'unsupported-month' as const, rows: [], totals: null };
  const owner = filters.salespersonId ?? data.meta.salesperson_id;
  const region = filters.region ?? data.meta.region;
  const seen = new Set<string>();
  const calls = data.calls.filter(c => {
    if (!c.valid || c.status !== 'completed' || c.salesperson_id !== owner || !c.date.startsWith(month) || c.date > data.meta.snapshot_at.slice(0, 10) || seen.has(c.id)) return false;
    seen.add(c.id);
    return true;
  });
  const scopedCustomers = data.customers.filter(c => c.owner === owner && c.region === region
    && (!filters.grade || c.grade === filters.grade) && (!filters.customerId || c.id === filters.customerId));
  if (scopedCustomers.some(c => !Number.isFinite(data.meta.rules[c.grade]) || data.meta.rules[c.grade] <= 0)) {
    return { availability: 'missing-rules' as const, rows: [], totals: null };
  }
  const rows = scopedCustomers
    .map(customer => {
      const records = calls.filter(c => c.customer_id === customer.id);
      const actual = records.length;
      const required = data.meta.rules[customer.grade];
      return { customer, records, actual, required, capped: Math.min(actual, required), gap: Math.max(required - actual, 0), reached: actual >= required };
    }).filter(r => (!filters.grade || r.customer.grade === filters.grade)
      && (!filters.customerId || r.customer.id === filters.customerId)
      && (!filters.status || (filters.status === 'zero' ? r.actual === 0 : filters.status === 'reached' ? r.reached : !r.reached)));
  const actual = rows.reduce((n, r) => n + r.actual, 0);
  const required = rows.reduce((n, r) => n + r.required, 0);
  const capped = rows.reduce((n, r) => n + r.capped, 0);
  const reached = rows.filter(r => r.reached).length;
  return { availability: 'available' as const, rows, totals: {
    actual, required, capped, reached, customers: rows.length, gap: rows.reduce((n, r) => n + r.gap, 0),
    actualRate: percentage(actual, required), cappedRate: percentage(capped, required), reachedRate: percentage(reached, rows.length),
  } };
}

export interface SalesFilters { month?: string; productId?: string; customerId?: string; salespersonId?: string }
export function getSalesSummary(filters: SalesFilters = {}, data: DemoData = demoData) {
  const month = filters.month ?? data.meta.current_month;
  const owner = filters.salespersonId ?? data.meta.salesperson_id;
  const rows = data.sales.filter(s => s.date.startsWith(month) && s.date <= data.meta.snapshot_at.slice(0, 10)
    && s.salesperson_id === owner && (!filters.productId || s.product_id === filters.productId)
    && (!filters.customerId || s.customer_id === filters.customerId)
    && data.invoices.some(i => i.id === s.invoice_id && i.order_id === s.order_id && i.status === 'issued'));
  const amount = rows.reduce((n, s) => n + s.amount, 0);
  const quantity = rows.reduce((n, s) => n + s.quantity, 0);
  // Only a whole-salesperson target exists: never invent product/customer targets.
  const target = !filters.productId && !filters.customerId
    ? data.targets.find(t => t.month === month && t.salesperson_id === owner)?.amount ?? null : null;
  return { rows, amount, quantity, target, attainment: target === null ? null : percentage(amount, target), basis: data.meta.sales_basis };
}
export function compareSales(filters: Omit<SalesFilters, 'month'> = {}, data: DemoData = demoData) {
  return data.products.filter(p => !filters.productId || p.id === filters.productId).map(product => {
    const previous = getSalesSummary({ ...filters, productId: product.id, month: data.meta.previous_month }, data);
    const current = getSalesSummary({ ...filters, productId: product.id, month: data.meta.current_month }, data);
    return { product, previous, current, change: percentage(current.quantity - previous.quantity, previous.quantity) };
  });
}

export interface SourceAvailability { approvals?: boolean; shipments?: boolean; invoices?: boolean; receipts?: boolean }
export function getOrderProgress(orderId: string, data: DemoData = demoData, available: SourceAvailability = {}) {
  const order = data.orders.find(o => o.id === orderId);
  if (!order) return null;
  const approvals = available.approvals === false ? null : data.approvals.filter(a => a.order_id === orderId);
  const shipments = available.shipments === false ? null : data.shipments.filter(s => s.order_id === orderId);
  const invoices = available.invoices === false ? null : data.invoices.filter(i => i.order_id === orderId);
  const receipts = invoices === null || available.receipts === false ? null : data.receipts.filter(r => invoices.some(i => i.id === r.invoice_id));
  const invoiced = invoices === null ? null : invoices.reduce((n, i) => n + i.amount, 0);
  const received = receipts === null ? null : receipts.reduce((n, r) => n + r.amount, 0);
  const outstanding = invoiced === null || received === null || !invoices?.length ? null : Math.max(invoiced - received, 0);
  const overdue = invoices === null || receipts === null ? null : invoices.some(i => {
    const paid = receipts.filter(r => r.invoice_id === i.id).reduce((n, r) => n + r.amount, 0);
    return i.amount > paid && data.meta.snapshot_at.slice(0, 10) > i.due_date;
  });
  const shippedQuantity = shipments?.reduce((n, s) => n + s.quantity, 0) ?? null;
  return { order, approvals, shipments, invoices, receipts, invoiced, received, outstanding, overdue,
    stages: {
      approval: approvals === null || !approvals.length ? '未知' : approvals.some(a => a.status === 'pending') ? '主管覆核中' : '已核准',
      shipment: shippedQuantity === null ? '未知' : shippedQuantity === 0 ? '尚未出貨' : shippedQuantity < order.quantity ? '部分出貨' : '已出貨',
      invoice: invoices === null ? '未知' : invoices.length ? '已請款' : '尚未請款',
      receipt: received === null ? '未知' : received === 0 ? '尚未收款' : invoiced !== null && received >= invoiced ? '已收款' : '部分收款',
    },
  };
}

export type PackageOverrides = Record<string, string>;
export function getPackageSummary(packageId: string, overrides: PackageOverrides = {}, data: DemoData = demoData) {
  const rows = data.package_items.filter(i => i.package_id === packageId).map(item => {
    const replacement = overrides[item.id];
    const docId = replacement && replacement === item.replacement_doc_id ? replacement : item.doc_id;
    const document = data.documents.find(d => d.id === docId) ?? null;
    const ready = document?.status === 'current';
    return { item, document, ready, status: ready ? 'ready' as const : document ? 'outdated' as const : 'missing' as const };
  });
  const required = rows.filter(r => r.item.required);
  const ready = required.filter(r => r.ready).length;
  return { rows, ready, total: required.length, completeness: percentage(ready, required.length), complete: required.length > 0 && ready === required.length,
    missing: required.filter(r => r.status === 'missing'), outdated: required.filter(r => r.status === 'outdated') };
}
export function applyPackageReplacement(itemId: string, overrides: PackageOverrides = {}, data: DemoData = demoData): PackageOverrides {
  const item = data.package_items.find(i => i.id === itemId);
  const doc = data.documents.find(d => d.id === item?.replacement_doc_id);
  if (!item || !doc || doc.status !== 'current' || (doc.product_id !== null && doc.product_id !== item.product_id)) throw new Error('目前沒有可套用的有效新版文件。');
  return { ...overrides, [item.id]: doc.id };
}
export function getProductTier(productId: string, year: number | null = null, data: DemoData = demoData) {
  if (!data.products.some(p => p.id === productId)) return { status: 'not-found' as const, tier: null };
  if (year === null) return { status: 'year-required' as const, tier: null };
  const tier = data.tiers.find(t => t.product_id === productId && t.year === year) ?? null;
  return { status: tier ? 'available' as const : 'not-found' as const, tier };
}
export function getHistoricalQuotes(customerId: string, productId: string, ascending = false, data: DemoData = demoData) {
  return data.quotes.filter(q => (!customerId || q.customer_id === customerId) && (!productId || q.product_id === productId))
    .sort((a, b) => ascending ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date));
}
export function createInitialDemoState() {
  return { selectedCustomerId: 'C001', selectedProductId: 'P-B', selectedMonth: demoData.meta.current_month,
    selectedYear: null as number | null, packageOverrides: {} as PackageOverrides };
}
