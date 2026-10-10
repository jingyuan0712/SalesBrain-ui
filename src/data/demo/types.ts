export type Grade = 'A' | 'B' | 'C';
export type FeatureId = 'F1' | 'F2' | 'F3' | 'F4' | 'F5' | 'F6' | 'F7' | 'F8' | 'F9';
export type DocumentStatus = 'current' | 'superseded' | 'historical' | 'placeholder';
export interface User { id: string; name: string; role: 'sales' | 'manager'; region: string }
export interface Customer { id: string; name: string; channel: string; grade: Grade; required: number; owner: string; region: string }
export interface Doctor { id: string; customer_id: string; name: string; department: string; clinic_load: number }
export interface Call { id: string; customer_id: string; doctor_id: string | null; salesperson_id: string; date: string; status: 'completed' | 'draft' | 'cancelled'; valid: boolean; note: string }
export interface Product { id: string; name: string; material_no: string; manufacturing_no: string; pm_id: string; unit: string; demo_price: number }
export interface PM { id: string; name: string; email: string }
export interface Tier { year: number; product_id: string; tier: string }
export interface Sale { id: string; date: string; customer_id: string; product_id: string; quantity: number; unit_price: number; amount: number; salesperson_id: string; invoice_id: string; order_id: string }
export interface Target { salesperson_id: string; month: string; amount: number; basis: string }
export interface DemoOrder { id: string; customer_id: string; product_id: string; quantity: number; amount: number; created_at: string; approval_status: 'approved' | 'pending'; block_reason: string | null }
export interface Approval { id: string; order_id: string; status: 'approved' | 'pending'; step: string; updated_at: string }
export interface Shipment { id: string; order_id: string; quantity: number; status: 'shipped'; date: string }
export interface Invoice { id: string; order_id: string; amount: number; date: string; status: 'issued'; due_date: string }
export interface Receipt { id: string; invoice_id: string; date: string; amount: number }
export interface Quote { id: string; customer_id: string; product_id: string; date: string; gross_unit_price: number; tax_note: string; refund_note: string; refund_amount: number | null; context: string; status: 'historical'; source_doc: string }
export interface DemoVisit { id: string; customer_id: string; doctor_id: string; date: string; product_id: string; note: string; source_call_id: string | null; next_need: string[] }
export interface DemoDocument { id: string; title: string; type: string; version: string; updated_at: string; status: DocumentStatus; product_id: string | null; owner: string; locator: string; text: string; asset_path: string; is_demo: true; replacement?: string }
export interface DemoVideo { id: string; doc_id: string; version: string; asset_path: string; title: string; updated_at: string; duration_seconds: number; asset_status: 'pending' | 'available'; media_type?: 'video' | 'animation' }
export interface PackageItem { id: string; package_id: string; customer_id: string; product_id: string; kind: string; required: boolean; doc_id: string | null; status: 'ready' | 'missing' | 'outdated'; replacement_doc_id?: string }
export interface QATemplate { id: string; intent: FeatureId; query: string; template: string; mode: 'preset_demo'; params: Record<string, string | number>; sources: string[]; data_updated_at: string }
export interface Freshness { dataset: string; source_updated_at: string | null; retrieved_at: string; time_basis: 'snapshot' | 'record' }
export interface GlossaryEntry { term: string; definition: string; scope: string; year_required: boolean }
export interface DemoData {
  meta: { is_demo: true; snapshot_at: string; current_month: string; previous_month: string; region: string; region_name: string; salesperson_id: string; kpi_unit: 'customer'; rules: Record<Grade, number>; sales_basis: string };
  users: User[]; customers: Customer[]; doctors: Doctor[]; calls: Call[];
  products: Product[]; pms: PM[]; tiers: Tier[]; sales: Sale[]; targets: Target[];
  orders: DemoOrder[]; approvals: Approval[]; shipments: Shipment[]; invoices: Invoice[]; receipts: Receipt[];
  quotes: Quote[]; visits: DemoVisit[]; documents: DemoDocument[]; videos: DemoVideo[];
  package_items: PackageItem[]; qa_templates: QATemplate[]; freshness: Freshness[]; glossary: GlossaryEntry[];
}
