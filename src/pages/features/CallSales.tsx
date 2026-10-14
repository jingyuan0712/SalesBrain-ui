import { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { demoData } from '../../data/demo/demoData.ts';
import { getCallKpi, getSalesSummary, compareSales, formatPercentage } from '../../domain/demoRules.ts';
import { Stat, Select, SharedFilters, Modal, Empty, SourceNote, money, customerName, productName } from '../../components/DemoUI.tsx';
export function CallKpiPage() {
  const { query, updateQuery, openFeature } = useApp();
  const [selected, setSelected] = useState<string | null>(null);
  const result = getCallKpi({ month: query.selectedMonth, grade: query.grade || undefined, status: query.callStatus || undefined, customerId: query.selectedCustomerId || undefined });
  const all = getCallKpi({ month: query.selectedMonth });
  const detail = all.rows.find(r => r.customer.id === selected);
  return <><div className="filter-bar"><SharedFilters month product={false} />
    <Select label="客戶等級" value={query.grade} onChange={grade => updateQuery({ grade: grade as typeof query.grade })} options={[{ value: '', label: '全部等級' }, ...['A', 'B', 'C'].map(g => ({ value: g, label: `${g} 級` }))]} />
    <Select label="Call 狀態" value={query.callStatus} onChange={s => updateQuery({ callStatus: s as typeof query.callStatus })} options={[{ value: '', label: '全部狀態' }, { value: 'reached', label: '已達標' }, { value: 'unreached', label: '未達標' }, { value: 'zero', label: '尚未 Call' }]} />
    <button className="btn btn-secondary" onClick={() => updateQuery({ selectedCustomerId: '', grade: '', callStatus: '', selectedMonth: '2026-10' })}>清除篩選</button></div>
    {result.totals ? <><div className="stats-grid"><Stat label="逐客戶封頂達成率" value={formatPercentage(result.totals.cappedRate)} note={`${result.totals.capped}／${result.totals.required} 次（篩選範圍）`} /><Stat label="實際次數達成率" value={formatPercentage(result.totals.actualRate)} note={`${result.totals.actual} 次實際拜訪／${result.totals.required} 次要求`} /><Stat label="達標客戶比例" value={formatPercentage(result.totals.reachedRate)} note={`${result.totals.reached}／${result.totals.customers} 客戶`} /><Stat label="待完成拜訪" value={`${result.totals.gap} 次`} note="超額拜訪不抵其他客戶缺口" /></div>
      <p className="subtle-summary">全月全部客戶總覽：{all.totals?.actual}／{all.totals?.required} 次，實際 {formatPercentage(all.totals?.actualRate ?? null)}、封頂 {formatPercentage(all.totals?.cappedRate ?? null)}、達標客戶 {formatPercentage(all.totals?.reachedRate ?? null)}。</p>
      {result.rows.length ? <div className="table-container"><table><thead><tr><th>客戶</th><th>等級</th><th>本月要求</th><th>有效 Call</th><th>尚缺</th><th>狀態</th><th>操作</th></tr></thead><tbody>{result.rows.map(r => <tr key={r.customer.id}><td>{r.customer.name}<small className="table-id">{r.customer.id}</small></td><td>{r.customer.grade}</td><td>{r.required} 次</td><td>{r.actual} 次</td><td>{r.gap} 次</td><td><span className={`badge ${r.reached ? 'badge-green' : 'badge-orange'}`}>{r.actual === 0 ? '尚未 Call' : r.reached ? '已達標' : '未達標'}</span></td><td><button className="btn btn-secondary btn-sm" onClick={() => setSelected(r.customer.id)}>查看詳細資訊</button></td></tr>)}</tbody></table></div> : <Empty />}</> : <Empty>此月份沒有可確認的要求快照，無法計算 KPI。請切回 2026-10。</Empty>}
    <SourceNote systems="CRM" ids={[...result.rows.map(r => r.customer.id), ...result.rows.flatMap(r => r.records.map(c => c.id))]} basis="以客戶計；A=4、B=2、C=1；completed 且 valid、同月同業務、Call ID 去重。" />
    {detail && <Modal title={`${detail.customer.name} · ${detail.customer.id}`} onClose={() => setSelected(null)}><div className="stats-grid"><Stat label="本月需求" value={`${detail.required} 次`} /><Stat label="已完成" value={`${detail.actual} 次`} /><Stat label="尚缺" value={`${detail.gap} 次`} /></div>
      <h3>醫師資料（示範）</h3>{demoData.doctors.filter(d => d.customer_id === detail.customer.id).map(d => <p key={d.id}>{d.name} · {d.department} · 示範每日門診量 {d.clinic_load} · {d.id}</p>)}
      <h3>本月有效拜訪紀錄</h3>{detail.records.length ? detail.records.map(c => <p key={c.id}>{c.id} · {c.date} · {c.note}</p>) : <p>本月沒有有效 Call；歷史拜訪摘要不計入本月。</p>}
      <button className="btn btn-primary" onClick={() => { const visit = demoData.visits.find(v => v.customer_id === detail.customer.id && v.product_id === query.selectedProductId) ?? demoData.visits.find(v => v.customer_id === detail.customer.id); openFeature('F5', { selectedCustomerId: detail.customer.id, selectedProductId: visit?.product_id ?? (query.selectedProductId || 'P-B'), selectedDoctorId: visit?.doctor_id ?? demoData.doctors.find(d => d.customer_id === detail.customer.id)?.id ?? '' }); }}>準備客戶拜訪</button></Modal>}
  </>;
}
export function SalesPage() {
  const { query, updateQuery } = useApp();
  const filters = { month: query.selectedMonth, customerId: query.selectedCustomerId || undefined, productId: query.selectedProductId || undefined };
  const sales = getSalesSummary(filters);
  const comparison = compareSales({ customerId: filters.customerId, productId: filters.productId });
  const max = Math.max(1, ...comparison.flatMap(c => [c.previous.quantity, c.current.quantity]));
  return <><div className="filter-bar"><SharedFilters month /><button className="btn btn-secondary" onClick={() => updateQuery({ selectedCustomerId: '', selectedProductId: '', selectedMonth: '2026-10' })}>清除篩選</button></div>
    <p className="notice">九月為全月；十月累計截至 2026/10/20。期間不等長，僅作快照進度對照。資料模擬更新：08:00。</p>
    <div className="stats-grid"><Stat label="示範已請款含稅金額" value={money(sales.amount)} /><Stat label="銷售數量" value={`${sales.quantity} 盒`} /><Stat label="示範目標" value={sales.target === null ? '未設置' : money(sales.target)} note="僅提供業務整體月份目標" /><Stat label="目標達成率" value={formatPercentage(sales.attainment)} /></div>
    <section className="card chart-card"><div className="section-heading"><h2>兩月產品銷量比較</h2><span className="text-muted">淺藍 九月 · 藍色 十月 · 點選柱子查看明細</span></div>
      {comparison.length ? <div className="comparison-chart">{comparison.map(c => <div className="chart-product" key={c.product.id}><div className="chart-bars">{[{ month: '2026-09', quantity: c.previous.quantity }, { month: '2026-10', quantity: c.current.quantity }].map(b => <button key={b.month} className={`chart-bar ${b.month === '2026-09' ? 'previous' : ''}`} style={{ height: `${Math.max(12, b.quantity / max * 155)}px` }} aria-label={`${c.product.name} ${b.month} ${b.quantity}盒`} onClick={() => updateQuery({ selectedProductId: c.product.id, selectedMonth: b.month })}><span>{b.quantity}</span></button>)}</div><strong>{c.product.name}</strong><small>數量變化 {formatPercentage(c.change)}</small></div>)}</div> : <Empty />}</section>
    <h2 className="section-title">{query.selectedMonth} 銷售明細 · {sales.rows.length} 筆</h2>{sales.rows.length ? <div className="table-container"><table><thead><tr><th>紀錄／日期</th><th>客戶</th><th>產品</th><th>數量</th><th>示範單價</th><th>含稅金額</th><th>來源</th></tr></thead><tbody>{sales.rows.map(s => <tr key={s.id}><td>{s.id}<small className="table-id">{s.date}</small></td><td>{customerName(s.customer_id)}</td><td>{productName(s.product_id)}</td><td>{s.quantity}</td><td>{money(s.unit_price)}</td><td>{money(s.amount)}</td><td>{s.order_id}／{s.invoice_id}</td></tr>)}</tbody></table></div> : <Empty />}
    <SourceNote systems="SAP 經 CRM 同步（待驗證）" updated="2026-10-20 08:00" ids={sales.rows.map(s => s.id)} basis="加總已請款含稅金額；待簽核與未請款不計入。數量變化=(十月量−九月量)／九月量；前月為零時不適用。" />
  </>;
}
