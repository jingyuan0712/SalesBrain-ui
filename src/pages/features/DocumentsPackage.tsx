import { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { demoData } from '../../data/demo/demoData.ts';
import { getPackageSummary, applyPackageReplacement, formatPercentage } from '../../domain/demoRules.ts';
import { Select, SharedFilters, DocumentPreview, Empty, SourceNote, Stat, documentStatus, customerName, productName } from '../../components/DemoUI.tsx';
import { crmSopIds } from '../../domain/crmRules.ts';
import CRMQuickLink from '../../components/CRMQuickLink.tsx';
import SopTutorial from '../../components/SopTutorial.tsx';
export function SopPage() {
  const { query, updateQuery } = useApp();
  const [search, setSearch] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [dmId, setDmId] = useState('DOC-DM2');
  const sops = demoData.documents.filter(d => d.type === 'sop' && `${d.title}${d.text}`.toLowerCase().includes(search.toLowerCase()));
  const doc = sops.find(d => d.id === query.sopId) ?? sops[0] ?? demoData.documents.find(d => d.id === query.sopId)!;
  const steps = doc.text.replace(/^示範：/, '').split('。')[0].split(' → ');
  return <><div className="filter-bar"><label className="filter-field"><span>搜尋 SOP</span><input className="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="折讓、折扣、CRM、溢收款…" /></label></div>
    <div className="tab-list">{sops.map(d => <button key={d.id} className={`tab-item ${doc.id === d.id ? 'active' : ''}`} onClick={() => updateQuery({ sopId: d.id })}>{d.title.replace('示範', '')}</button>)}</div>
    {sops.length ? <section className="card detail-card"><div className="section-heading"><h2>{doc.title}</h2>{crmSopIds.includes(doc.id) && <CRMQuickLink />}</div><p>v{doc.version} · {documentStatus(doc.status)} · 更新 {doc.updated_at} · {doc.owner}</p><details open><summary>章節列表 · {doc.locator}</summary><ol className="sop-steps">{steps.map((step, i) => <li key={i}>{step}</li>)}</ol></details><p className="notice">以上為虛構準備流程，正式依企業核准 SOP；不執行核價、送簽或財務沖單。</p><button className="btn btn-secondary" onClick={() => setPreview(doc.id)}>預覽手冊原文</button>{demoData.videos.some(video => video.doc_id === doc.id) && <SopTutorial key={doc.id} docId={doc.id} />}
      <SourceNote systems="OA／知識文件" ids={[doc.id, ...demoData.videos.filter(video => video.doc_id === doc.id).map(video => `${video.id}（以可操作圖文動畫呈現）`)]} updated={doc.updated_at} />
    </section> : <Empty>沒有匹配的 SOP，請選擇已提供分類。</Empty>}
    <section className="card detail-card"><h2>產品 B 文件版本</h2><div className="filter-bar"><Select label="查看版本" value={dmId} onChange={setDmId} options={[{ value: 'DOC-DM2', label: '新版 DM v2.0 · 目前有效' }, { value: 'DOC-DM1', label: '舊版 DM v1.0 · 已被取代' }]} /><button className="btn btn-secondary" onClick={() => setPreview(dmId)}>預覽此版本</button></div><p>{demoData.documents.find(d => d.id === dmId)?.text}</p><p className="text-muted">新版發布於 2026-10-15；舊版僅供追溯，不作準備文件預設。</p></section>
    {preview && <DocumentPreview id={preview} onClose={() => setPreview(null)} />}
  </>;
}
export function CompanyPage() {
  const { query, updateQuery } = useApp();
  const [search, setSearch] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [contactId, setContactId] = useState<string | null>(null);
  const noAmount = /補助|金額|多少/.test(search);
  const docs = demoData.documents.filter(d => d.type === query.companyTab && `${d.title}${d.text}`.includes(search));
  return <><p className="notice">所有福利與公司資訊均為 Demo 虛構內容，不代表公司真實福利制度或中化正式簡介。</p><div className="tab-list">{[{ id: 'hr', title: '公司福利' }, { id: 'company', title: '公司簡介' }].map(t => <button key={t.id} className={`tab-item ${query.companyTab === t.id ? 'active' : ''}`} onClick={() => { updateQuery({ companyTab: t.id as 'hr' | 'company' }); setContactId(null); }}>{t.title}</button>)}</div>
    <label className="filter-field compact-search"><span>搜尋內容</span><input className="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="學習資源、通路服務、補助金額…" /></label>
    {noAmount ? <p className="notice">目前沒有可確認的補助金額資料。請向示範 HR 確認。</p> : docs.length ? <div className="quote-grid">{docs.map(doc => <section className="card detail-card" key={doc.id}><h2>{doc.title}</h2><p>{doc.text}</p><p>v{doc.version} · 更新 {doc.updated_at} · {documentStatus(doc.status)}</p><div className="action-row"><button className="btn btn-primary" onClick={() => setPreview(doc.id)}>預覽文件</button><button className="btn btn-secondary" onClick={() => setContactId(id => id === doc.id ? null : doc.id)}>查看文件負責窗口</button></div>{contactId === doc.id && <p className="notice">{doc.owner} · 此為示範窗口；沒有真實聯絡資料。</p>}
      <SourceNote systems="HR／企業核准文件（待確認）" ids={[doc.id]} updated={doc.updated_at} /></section>)}</div> : <Empty />}
    {preview && <DocumentPreview id={preview} onClose={() => setPreview(null)} />}
  </>;
}
export function PackagePage() {
  const { query, updateQuery, addToast } = useApp();
  const [preview, setPreview] = useState<string | null>(null);
  const [checked, setChecked] = useState<string[]>([]);
  const items = demoData.package_items.filter(i => i.customer_id === query.selectedCustomerId && i.product_id === query.selectedProductId);
  const result = items.length ? getPackageSummary(items[0].package_id, query.packageOverrides) : null;
  const packages = demoData.package_items.filter((item, index, rows) => rows.findIndex(other => other.package_id === item.package_id) === index);
  function replace(id: string) {
    try { updateQuery({ packageOverrides: applyPackageReplacement(id, query.packageOverrides) }); addToast('已套用有效新版文件，缺件仍須另行補齊。'); }
    catch (err) { addToast(err instanceof Error ? err.message : '更新文件失敗', 'error'); }
  }
  function exportSummary() {
    if (!result) return;
    const text = `SalesBrain Demo 模擬準備摘要\n非真實資格文件、政策或醫藥資料\n固定快照：2026-10-20 09:00 +08:00\n${customerName(query.selectedCustomerId)}／${productName(query.selectedProductId)}\n有效齊備：${result.ready}／${result.total}，${formatPercentage(result.completeness)}\n${result.rows.map(r => `${r.item.kind}：${r.status === 'ready' ? '有效齊備' : r.status === 'outdated' ? '舊版' : '缺件'} ${r.document ? `${r.document.id} v${r.document.version} 更新 ${r.document.updated_at}` : '無文件'}`).join('\n')}\n仍缺：${result.missing.map(r => r.item.kind).join('、') || '無'}\n僅包含五項示範清單，不代表完整企業進藥要求。`;
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = `SalesBrain-${items[0].package_id}-demo-summary.txt`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); addToast('已匯出帶示範標記的本地準備摘要。');
  }
  return <><div className="filter-bar"><SharedFilters /><Select label="已有進藥清單" value={items[0]?.package_id ?? ''} onChange={id => { const selected = packages.find(item => item.package_id === id); if (selected) { updateQuery({ selectedCustomerId: selected.customer_id, selectedProductId: selected.product_id }); setChecked([]); } }} options={[{ value: '', label: '請選擇已有清單' }, ...packages.map(item => ({ value: item.package_id, label: `${item.package_id} · ${customerName(item.customer_id)}／${productName(item.product_id)}` }))]} /></div><p className="notice">提供 {packages.length} 組客戶產品清單，每組五項示範附件，不代表完整企業進藥文件；勾選只記錄檢視進度，不改變有效齊備率。</p>
    {result ? <><div className="stats-grid"><Stat label="有效齊備率" value={formatPercentage(result.completeness)} note={`${result.ready}／${result.total} 有效文件`} /><Stat label="缺件" value={`${result.missing.length} 項`} note={result.missing.map(r => r.item.kind).join('、')} /><Stat label="需替換舊版" value={`${result.outdated.length} 項`} /></div>
      <div className="table-container" role="region" aria-label="進藥文件清單" tabIndex={0}><table className="responsive-table" role="table" aria-label="進藥文件清單"><thead role="rowgroup"><tr role="row"><th role="columnheader" scope="col">已檢視</th><th role="columnheader" scope="col">文件需求</th><th role="columnheader" scope="col">狀態</th><th role="columnheader" scope="col">目前文件／版本</th><th role="columnheader" scope="col">更新日期</th><th role="columnheader" scope="col">操作</th></tr></thead><tbody role="rowgroup">{result.rows.map(r => <tr role="row" key={r.item.id}><td role="cell" data-label="已檢視"><div className="table-cell-value"><label className="table-checkbox"><input type="checkbox" aria-label={`已檢視${r.item.kind}`} checked={checked.includes(r.item.id)} onChange={e => setChecked(xs => e.target.checked ? [...xs, r.item.id] : xs.filter(id => id !== r.item.id))} /></label></div></td><td role="cell" data-label="文件需求"><div className="table-cell-value">{r.item.kind}<small className="table-id">{r.item.id}</small></div></td><td role="cell" data-label="狀態"><div className="table-cell-value"><span className={`badge ${r.ready ? 'badge-green' : 'badge-orange'}`}>{r.ready ? '已齊備' : r.status === 'outdated' ? '舊版' : '缺件'}</span></div></td><td role="cell" data-label="目前文件／版本"><div className="table-cell-value">{r.document ? `${r.document.id} · v${r.document.version}` : '尚未提供'}</div></td><td role="cell" data-label="更新日期"><div className="table-cell-value">{r.document?.updated_at ?? '無文件'}</div></td><td role="cell" data-label="操作"><div className="table-cell-value"><div className="action-row">{r.document && <button className="btn btn-secondary btn-sm" onClick={() => setPreview(r.document!.id)}>預覽</button>}{r.status === 'outdated' && r.item.replacement_doc_id && <button className="btn btn-primary btn-sm" onClick={() => replace(r.item.id)}>套用新版 DM2</button>}</div></div></td></tr>)}</tbody></table></div>
      <section className="card detail-card" aria-live="polite"><h2>準備摘要</h2><p>{result.complete ? '示範清單已齊備。' : `尚未全部齊備：${result.missing.map(r => r.item.kind).join('、') || '無'}缺件${result.outdated.length ? '，DM 需要換新版' : ''}。`}</p><div className="action-row"><button className="btn btn-primary" onClick={exportSummary}>匯出準備摘要</button><button className="btn btn-secondary" onClick={() => { const next = { ...query.packageOverrides }; items.forEach(item => { delete next[item.id]; }); updateQuery({ packageOverrides: next }); setChecked([]); addToast(`此進藥包已恢復初始 ${formatPercentage(getPackageSummary(items[0].package_id).completeness)}。`); }}>重置此進藥包</button></div></section>
      <SourceNote systems="企業進藥清單／OA／文件庫候選" ids={[items[0].package_id, ...result.rows.flatMap(r => [r.item.id, ...(r.document ? [r.document.id] : [])])]} updated="依上表各文件日期與版本" basis="required 且關聯 current 文件的項數／required 項數；缺件與舊版不計。" /></> : <Empty>此客戶與產品沒有已提供的進藥清單，請從「已有進藥清單」選擇。</Empty>}
    {preview && <DocumentPreview id={preview} onClose={() => setPreview(null)} />}
  </>;
}
