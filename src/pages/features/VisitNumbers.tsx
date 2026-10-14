import { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { demoData } from '../../data/demo/demoData.ts';
import { getProductTier } from '../../domain/demoRules.ts';
import { Select, SharedFilters, Modal, DocumentPreview, Empty, SourceNote, customerName, productName } from '../../components/DemoUI.tsx';
export function VisitPage() {
  const { query, updateQuery, openFeature, setTasks, addToast } = useApp();
  const [doc, setDoc] = useState<string | null>(null);
  const [history, setHistory] = useState(false);
  const doctors = demoData.doctors.filter(d => d.customer_id === query.selectedCustomerId);
  const doctor = doctors.find(d => d.id === query.selectedDoctorId) ?? doctors[0];
  const visits = demoData.visits.filter(v => v.customer_id === query.selectedCustomerId && v.product_id === query.selectedProductId && v.doctor_id === doctor?.id).sort((a, b) => b.date.localeCompare(a.date));
  const visit = visits[0];
  const visitOptions = demoData.visits.filter((visit, index, rows) => rows.findIndex(other => other.customer_id === visit.customer_id && other.product_id === visit.product_id) === index);
  const documentIds = visit ? [...new Set([...visit.next_need.filter(id => id.startsWith('DOC-')), ...demoData.documents.filter(d => d.product_id === query.selectedProductId && ['product', 'marketing'].includes(d.type) && d.status === 'current').map(d => d.id)])] : [];
  return <><div className="filter-bar"><SharedFilters /><Select label="醫師" value={doctor?.id ?? ''} onChange={selectedDoctorId => updateQuery({ selectedDoctorId })} options={doctors.length ? doctors.map(d => ({ value: d.id, label: d.name })) : [{ value: '', label: '此客戶無醫師資料' }]} /><Select label="已有拜訪對象" value={visitOptions.some(v => v.customer_id === query.selectedCustomerId && v.product_id === query.selectedProductId) ? `${query.selectedCustomerId}/${query.selectedProductId}` : ''} onChange={value => { const selected = visitOptions.find(v => `${v.customer_id}/${v.product_id}` === value); if (selected) updateQuery({ selectedCustomerId: selected.customer_id, selectedProductId: selected.product_id, selectedDoctorId: selected.doctor_id }); }} options={[{ value: '', label: '請選擇已有紀錄' }, ...visitOptions.map(v => ({ value: `${v.customer_id}/${v.product_id}`, label: `${customerName(v.customer_id)}／${productName(v.product_id)}` }))]} /></div>
    {doctor && <section className="card detail-card"><h2>{customerName(doctor.customer_id)} · {doctor.name}</h2><p>{doctor.id} · {doctor.department} · 示範每日門診量 {doctor.clinic_load}（僅準備參考）</p></section>}
    {visit ? <><section className="card detail-card"><div className="section-heading"><h2>上次拜訪 · {visit.date}</h2><button className="btn btn-secondary" onClick={() => setHistory(true)}>查看歷史紀錄</button></div><p>{visit.note}</p><p className="text-muted">既有需求：{visit.next_need.join('、')} · 來源 {visit.id}。前月紀錄不代表本月已 Call。</p></section>
      <section className="card detail-card"><h2>建議準備清單</h2><ul className="preparation-list">{documentIds.map(id => <li key={id}><span>{demoData.documents.find(d => d.id === id)?.title}<small className="table-id">{id} · 有效示範版本</small></span><button className="btn btn-secondary" onClick={() => setDoc(id)}>預覽文件</button></li>)}</ul><p className="notice">醫藥文獻尚未提供可引用內容；產品文件只是用途與版本佔位，不含療效或處方建議。</p>
        <div className="action-row"><button className="btn btn-primary" onClick={() => openFeature('F9', { selectedCustomerId: query.selectedCustomerId, selectedProductId: query.selectedProductId, selectedDoctorId: doctor.id })}>查看此客戶產品的進藥包</button>
          <button className="btn btn-secondary" onClick={() => { setTasks(tasks => [{ id: crypto.randomUUID(), name: `準備${doctor.name}的${productName(query.selectedProductId)}拜訪文件`, customer: customerName(query.selectedCustomerId), type: '拜訪準備', createdAt: '2026-10-20', dueDate: '', status: 'pending', priority: 'medium' }, ...tasks]); addToast('已建立本地拜訪準備任務。'); }}>加入我的任務</button></div></section></> : <Empty>此客戶、醫師與產品沒有既有拜訪紀錄。請調整條件，不自行推測文件需求。</Empty>}
    <SourceNote systems="CRM／核准產品資料候選" ids={[...(doctor ? [doctor.id] : []), ...visits.map(v => v.id), ...documentIds]} updated={visit?.date ?? '無匹配紀錄'} />
    {history && <Modal title="歷史拜訪紀錄（示範）" onClose={() => setHistory(false)}>{visits.map(v => <article className="document-text" key={v.id}><h3>{v.id} · {v.date}</h3><p>{v.note}</p><p>來源 Call：{v.source_call_id ?? '前月摘要，沒有關聯 Call'}</p></article>)}</Modal>}
    {doc && <DocumentPreview id={doc} onClose={() => setDoc(null)} />}
  </>;
}
export function NumbersPage() {
  const { query, updateQuery, addToast } = useApp();
  const [search, setSearch] = useState('');
  const [showPm, setShowPm] = useState(false);
  const product = demoData.products.find(p => p.id === query.selectedProductId);
  const pm = demoData.pms.find(pm => pm.id === product?.pm_id);
  const customer = demoData.customers.find(c => c.id === query.selectedCustomerId);
  const tier = getProductTier(query.selectedProductId, query.selectedYear);
  const matches = search.trim() ? demoData.products.filter(p => `${p.name}${p.id}${p.material_no}${p.manufacturing_no}`.toLowerCase().includes(search.toLowerCase())) : [];
  const customerMatches = search.trim() ? demoData.customers.filter(c => `${c.name}${c.id}`.toLowerCase().includes(search.toLowerCase())) : [];
  async function copy(value: string) {
    try { await navigator.clipboard.writeText(value); addToast(`已複製 ${value}`); }
    catch { addToast('瀏覽器未允許複製，請選取編號後手動複製。', 'error'); }
  }
  return <><div className="filter-bar"><SharedFilters /><label className="filter-field"><span>搜尋產品／客戶／編號</span><input className="input" aria-label="搜尋產品與編號" value={search} onChange={e => setSearch(e.target.value)} placeholder="產品 B、晨星、M26002…" /></label></div>
    {search && <section className="card detail-card"><h2>搜尋結果</h2>{matches.length + customerMatches.length ? <div className="action-row">{matches.map(p => <button className="btn btn-secondary" key={p.id} onClick={() => { updateQuery({ selectedProductId: p.id }); setSearch(''); }}>{p.name} · {p.id}</button>)}{customerMatches.map(c => <button className="btn btn-secondary" key={c.id} onClick={() => { updateQuery({ selectedCustomerId: c.id }); setSearch(''); }}>{c.name} · {c.id}</button>)}</div> : <Empty>已查產品與客戶主檔，沒有匹配結果，不猜製編或 PM。</Empty>}</section>}
    {!search && (product ? <section className="card detail-card"><h2>{product.name}</h2><div className="number-grid">{[{ label: '產品 ID', value: product.id }, { label: '物料號碼', value: product.material_no }, { label: '產品製編', value: product.manufacturing_no }].map(n => <div key={n.label}><span>{n.label}</span><strong>{n.value}</strong><button className="btn btn-secondary btn-sm" onClick={() => copy(n.value)}>複製 {n.label}</button></div>)}</div>
      <button className="btn btn-secondary" onClick={() => setShowPm(true)}>查看對應 PM · {product.pm_id}</button>
      <p className="text-muted">物料與製編為兩個示範欄位，是否等同仍待企業確認。</p></section> : <Empty>請選擇或搜尋產品。</Empty>)}
    {customer && !search && <section className="card detail-card"><h2>客戶編號</h2><p>{customer.name} · <strong>{customer.id}</strong></p><button className="btn btn-secondary" onClick={() => copy(customer.id)}>複製客戶編號</button></section>}
    {!search && <section className="card detail-card"><h2>年度梯隊查詢</h2><div className="filter-bar"><Select label="年度（必填）" value={String(query.selectedYear ?? '')} onChange={v => updateQuery({ selectedYear: v ? Number(v) : null })} options={[{ value: '', label: '請選擇年度' }, { value: '2025', label: '2025' }, { value: '2026', label: '2026' }]} />
      <p aria-live="polite">{tier.status === 'year-required' ? '請先選擇年度，年度不同，梯隊清單也不同。' : tier.tier ? `${product?.name} · ${tier.tier.year} 年 · ${tier.tier.tier}（示範）` : '沒有可確認的年度梯隊資料。'}</p></div></section>}
    <SourceNote systems="SAP 產品主檔／CRM 客戶主檔／年度清單／PM 名錄" ids={search ? [...matches.map(p => p.id), ...customerMatches.map(c => c.id)] : [...(product ? [product.id, product.pm_id] : []), ...(customer ? [customer.id] : []), ...(tier.tier ? [`tiers:${tier.tier.year},${tier.tier.product_id}`] : [])]} />
    {showPm && pm && <Modal title="產品對應 PM（示範窗口）" onClose={() => setShowPm(false)}><p>{pm.id} · {pm.name}</p><p>{pm.email}（無效示範信箱）</p><p>此處不提供真實電話或對外聯繫。</p></Modal>}
  </>;
}
