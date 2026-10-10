import { demoData } from '../data/demo/demoData.ts';
import type { DemoData } from '../data/demo/types.ts';

/** Validate source integrity independently from UI calculations; return actionable record IDs. */
export function validateDemoData(data: DemoData = demoData): string[] {
  const issues: string[] = [];
  const has = (table: { id: string }[], id: string | null) => id === null || table.some(r => r.id === id);
  const link = (valid: boolean, message: string) => { if (!valid) issues.push(message); };
  const idTables = ['users', 'customers', 'doctors', 'calls', 'products', 'pms', 'sales', 'orders', 'approvals', 'shipments', 'invoices', 'receipts', 'quotes', 'visits', 'documents', 'videos', 'package_items', 'qa_templates'] as const;
  for (const name of idTables) {
    const seen = new Set<string>();
    for (const row of data[name]) {
      link(!seen.has(row.id), `${name}:${row.id} 重複 ID`);
      seen.add(row.id);
    }
  }
  for (const c of data.customers) {
    link(has(data.users, c.owner), `${c.id} 業務不存在`);
    link(c.required === data.meta.rules[c.grade], `${c.id} 分級要求與規則不一致`);
  }
  for (const d of data.doctors) link(has(data.customers, d.customer_id), `${d.id} 客戶不存在`);
  for (const c of data.calls) {
    link(has(data.customers, c.customer_id) && has(data.users, c.salesperson_id), `${c.id} 客戶／業務不存在`);
    link(has(data.doctors, c.doctor_id) && (c.doctor_id === null || data.doctors.some(d => d.id === c.doctor_id && d.customer_id === c.customer_id)), `${c.id} 醫師關聯錯誤`);
  }
  for (const p of data.products) link(has(data.pms, p.pm_id), `${p.id} PM 不存在`);
  const tierKeys = new Set<string>();
  for (const t of data.tiers) {
    const key = `${t.year},${t.product_id}`;
    link(!tierKeys.has(key) && has(data.products, t.product_id), `${key} 年度梯隊關聯或複合鍵錯誤`);
    tierKeys.add(key);
  }
  for (const t of data.targets) link(has(data.users, t.salesperson_id), `${t.month} 目標業務不存在`);
  for (const o of data.orders) link(has(data.customers, o.customer_id) && has(data.products, o.product_id), `${o.id} 客戶／產品不存在`);
  for (const a of data.approvals) link(data.orders.some(o => o.id === a.order_id && o.approval_status === a.status), `${a.id} 訂單／簽核狀態不一致`);
  for (const s of data.shipments) link(has(data.orders, s.order_id), `${s.id} 訂單不存在`);
  for (const i of data.invoices) link(has(data.orders, i.order_id), `${i.id} 訂單不存在`);
  for (const r of data.receipts) link(has(data.invoices, r.invoice_id), `${r.id} 請款不存在`);
  for (const s of data.sales) {
    const o = data.orders.find(o => o.id === s.order_id);
    const i = data.invoices.find(i => i.id === s.invoice_id);
    link(has(data.users, s.salesperson_id), `${s.id} 業務不存在`);
    link(!!o && !!i && i.order_id === o.id && o.customer_id === s.customer_id && o.product_id === s.product_id,
      `${s.id} 銷售／訂單／請款關聯錯誤`);
    link(s.amount === s.quantity * s.unit_price && s.amount === o?.amount && s.amount === i?.amount && s.quantity === o?.quantity,
      `${s.id} 銷售／訂單／請款金額或數量不一致`);
  }
  for (const q of data.quotes) link(has(data.customers, q.customer_id) && has(data.products, q.product_id) && has(data.documents, q.source_doc), `${q.id} 報價來源關聯錯誤`);
  for (const v of data.visits) {
    link(has(data.customers, v.customer_id) && has(data.products, v.product_id) && data.doctors.some(d => d.id === v.doctor_id && d.customer_id === v.customer_id), `${v.id} 拜訪對象關聯錯誤`);
    if (v.source_call_id !== null) link(data.calls.some(c => c.id === v.source_call_id && c.customer_id === v.customer_id && c.doctor_id === v.doctor_id && c.date === v.date), `${v.id} 來源 Call 不一致`);
    for (const id of v.next_need) link(has(data.documents, id) || data.package_items.some(i => i.package_id === id), `${v.id} 需求 ${id} 不存在`);
  }
  for (const d of data.documents) {
    link(d.is_demo && has(data.products, d.product_id), `${d.id} 文件示範標記／產品錯誤`);
    if (d.replacement) link(has(data.documents, d.replacement), `${d.id} 新版不存在`);
  }
  for (const v of data.videos) link(data.documents.some(d => d.id === v.doc_id && d.version === v.version), `${v.id} 影片手冊版本不一致`);
  for (const i of data.package_items) {
    link(has(data.customers, i.customer_id) && has(data.products, i.product_id) && has(data.documents, i.doc_id), `${i.id} 進藥包關聯錯誤`);
    if (i.replacement_doc_id) link(data.documents.some(d => d.id === i.replacement_doc_id && d.status === 'current' && (d.product_id === null || d.product_id === i.product_id)), `${i.id} 替換文件無效`);
  }
  // The snapshot's Taipei date is intentionally fixed, including document versions.
  for (const name of idTables) for (const row of data[name]) {
    for (const key of ['date', 'created_at', 'updated_at'] as const) {
      if (key in row) {
        const value = (row as unknown as Record<string, unknown>)[key];
        if (typeof value === 'string') link(value.slice(0, 10) <= data.meta.snapshot_at.slice(0, 10), `${name}:${row.id} ${key} 超過示範快照`);
      }
    }
  }
  return issues;
}
