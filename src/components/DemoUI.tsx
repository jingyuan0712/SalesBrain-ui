import { useEffect, useRef } from 'react';
import type { ReactNode, RefObject } from 'react';
import { X, FileText, ArrowRight } from 'lucide-react';
import { demoData } from '../data/demo/demoData.ts';
import { useApp } from '../context/AppContext.tsx';
import { features } from '../config/features.ts';
import type { FeatureId } from '../data/demo/types.ts';

export const money = (n: number) => `NT$ ${n.toLocaleString('zh-TW')}`;
export const customerName = (id: string) => demoData.customers.find(c => c.id === id)?.name ?? id;
export const productName = (id: string) => demoData.products.find(p => p.id === id)?.name ?? id;
export function Empty({ children = '目前沒有符合條件的示範資料，請調整篩選。' }: { children?: ReactNode }) {
  return <div className="empty-state"><FileText size={28} /><div className="empty-state-title">沒有可確認的資料</div><div className="empty-state-desc">{children}</div></div>;
}
export function Modal({ title, children, onClose, returnFocusRef }: { title: string; children: ReactNode; onClose: () => void; returnFocusRef?: RefObject<HTMLElement | null> }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const previous = returnFocusRef?.current ?? (document.activeElement as HTMLElement | null);
    dialog?.showModal();
    return () => { dialog?.close(); previous?.focus(); };
  }, [returnFocusRef]);
  return <dialog ref={ref} className="demo-dialog" onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) onClose(); }} aria-labelledby="dialog-title">
    <div className="modal-header"><h2 id="dialog-title" className="modal-title">{title}</h2><button className="btn btn-ghost btn-icon" aria-label="關閉視窗" onClick={onClose}><X size={18} /></button></div>
    <div className="modal-body">{children}</div>
    <div className="modal-footer"><button className="btn btn-secondary" onClick={onClose}>關閉</button></div>
  </dialog>;
}
export function DocumentPreview({ id, onClose }: { id: string; onClose: () => void }) {
  const doc = demoData.documents.find(d => d.id === id);
  return <Modal title={doc?.title ?? '文件不存在'} onClose={onClose}>{doc ? <>
    <p className="notice">虛構示範文件，非核准醫藥資料或真實證明／政策。</p>
    {doc.type === 'quote' && <p className="notice">歷史報價僅供參考，不代表現行有效價格。</p>}
    <div className="detail-grid"><div>文件 ID<strong>{doc.id}</strong></div><div>版本<strong>v{doc.version} · {documentStatus(doc.status)}</strong></div>
      <div>更新日期<strong>{doc.updated_at}</strong></div><div>維護窗口<strong>{doc.owner}</strong></div></div>
    <article className="document-text"><h3>{doc.locator}</h3><p>{doc.text}</p>{doc.replacement && <p>取代版本：{doc.replacement}</p>}</article>
    <a className="btn btn-secondary" target="_blank" rel="noreferrer" href={`${import.meta.env.BASE_URL}${doc.asset_path}`}>開啟本地示範原文</a>
  </> : <Empty />}</Modal>;
}
export function documentStatus(status: string) { return ({ current: '目前有效', superseded: '已被新版取代', historical: '歷史用途', placeholder: '內容佔位' } as Record<string, string>)[status] ?? status; }
export function SourceNote({ systems, ids, updated = '2026-10-20 08:55', basis }: { systems: string; ids: string[]; updated?: string; basis?: string }) {
  return <aside className="source-note"><span className="badge badge-blue">Demo 模擬資料</span><span>正式預期來源：{systems}；目前使用本地資料</span>
    <div>來源 ID：{ids.join('、') || '本次查詢 0 筆'} · 資料更新：{updated}</div>{basis && <div>計算依據：{basis}</div>}</aside>;
}
export function Stat({ label, value, note }: { label: string; value: ReactNode; note?: string }) {
  return <div className="card stat-card"><span>{label}</span><strong>{value}</strong>{note && <small>{note}</small>}</div>;
}
export function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (s: string) => void; options: { value: string; label: string }[] }) {
  return <label className="filter-field"><span>{label}</span><select aria-label={label} className="input" value={value} onChange={e => onChange(e.target.value)}>{options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></label>;
}
export function SharedFilters({ month = false, customer = true, product = true }: { month?: boolean; customer?: boolean; product?: boolean }) {
  const { query, updateQuery } = useApp();
  return <>{month && <Select label="月份" value={query.selectedMonth} onChange={selectedMonth => updateQuery({ selectedMonth })} options={['2026-10', '2026-09'].map(m => ({ value: m, label: m }))} />}
    {customer && <Select label="客戶" value={query.selectedCustomerId} onChange={selectedCustomerId => updateQuery({ selectedCustomerId })} options={[{ value: '', label: '全部客戶／未指定' }, ...demoData.customers.map(c => ({ value: c.id, label: c.name }))]} />}
    {product && <Select label="產品" value={query.selectedProductId} onChange={selectedProductId => updateQuery({ selectedProductId })} options={[{ value: '', label: '全部產品／未指定' }, ...demoData.products.map(p => ({ value: p.id, label: p.name }))]} />}</>;
}
export function FeatureCard({ id }: { id: FeatureId }) {
  const f = features.find(f => f.id === id)!;
  const { openFeature } = useApp();
  return <button className="card feature-card" onClick={() => openFeature(id)}><span className="feature-number">{id}</span><h3>{f.title}</h3><p>{f.description}</p><span className="feature-action">開始查詢 <ArrowRight size={14} /></span></button>;
}
