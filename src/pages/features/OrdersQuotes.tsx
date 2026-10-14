import { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { demoData } from '../../data/demo/demoData.ts';
import { getOrderProgress, getHistoricalQuotes, quoteDisclosure } from '../../domain/demoRules.ts';
import { Select, SharedFilters, Modal, DocumentPreview, Empty, SourceNote, money, customerName, productName } from '../../components/DemoUI.tsx';
export function OrdersPage() {
  const { query, updateQuery } = useApp();
  const [anomaly, setAnomaly] = useState('');
  const [unknown, setUnknown] = useState(false);
  const [source, setSource] = useState(false);
  const result = getOrderProgress(query.orderId.trim().toUpperCase(), demoData, unknown ? { shipments: false } : {});
  const listed = demoData.orders.filter(o => (!query.selectedCustomerId || o.customer_id === query.selectedCustomerId) && (!query.selectedProductId || o.product_id === query.selectedProductId)).filter(o => {
    const r = getOrderProgress(o.id)!;
    return !anomaly || (anomaly === 'approval' ? r.stages.approval === '主管覆核中' : anomaly === 'shipment' ? !r.shipments?.length : anomaly === 'invoice' ? !!r.shipments?.length && !r.invoices?.length : !!r.invoices?.length && !r.receipts?.length);
  });
  function selectOrder(id: string) {
    const order = demoData.orders.find(o => o.id === id);
    updateQuery({ orderId: id, ...(order ? { selectedCustomerId: order.customer_id, selectedProductId: order.product_id } : {}) });
  }
  return <><div className="filter-bar"><label className="filter-field"><span>訂單 ID 搜尋</span><input className="input" aria-label="訂單 ID 搜尋" value={query.orderId} onChange={e => selectOrder(e.target.value.toUpperCase())} placeholder="例如 O007" /></label><SharedFilters />
    <Select label="異常類型" value={anomaly} onChange={setAnomaly} options={[{ value: '', label: '全部訂單' }, { value: 'approval', label: '待簽核' }, { value: 'shipment', label: '未出貨' }, { value: 'invoice', label: '已出貨未請款' }, { value: 'receipt', label: '已請款未收款' }]} /></div>
    <div className="action-row">{['O007', 'O003', 'O008'].map(id => <button className={`btn ${query.orderId === id ? 'btn-primary' : 'btn-secondary'}`} key={id} onClick={() => selectOrder(id)}>{id}</button>)}<label className="checkbox-label"><input type="checkbox" checked={unknown} onChange={e => setUnknown(e.target.checked)} />示範出貨來源不可用</label></div>
    {result ? <section className="card order-card"><h2>{result.order.id} · {customerName(result.order.customer_id)}</h2><p>{productName(result.order.product_id)} · {result.order.quantity} 盒 · {money(result.order.amount)}</p>
      <ol className="order-stages">{Object.entries(result.stages).map(([key, value], i) => <li key={key} className={value === '未知' ? 'unknown' : value.startsWith('已') ? 'complete' : 'waiting'}><span>{i + 1}</span><h3>{['訂單／簽核', '出貨', '請款', '收款'][i]}</h3><strong>{value}</strong></li>)}</ol>
      {result.order.block_reason && <p className="notice">已記錄卡點：{result.order.block_reason} · {result.approvals?.[0]?.updated_at}</p>}
      <p>請款金額：{result.invoiced === null ? '未知' : money(result.invoiced)} · 收款：{result.received === null ? '未知' : money(result.received)} · 未收餘額：{result.outstanding === null ? '未建立應收或資料未知' : money(result.outstanding)}</p>
      {result.invoices?.map(i => <p key={i.id}>{i.id} · 到期 {i.due_date} · {result.overdue === null ? '無法確認逾期狀態' : result.overdue ? '已逾期' : '示範日尚未逾期'}</p>)}
      <button className="btn btn-secondary" onClick={() => setSource(true)}>查看來源單據</button>
      <SourceNote systems="SAP／簽核／出貨／財務對帳" ids={[result.order.id, ...(result.approvals?.map(a => a.id) ?? []), ...(result.shipments?.map(s => s.id) ?? []), ...(result.invoices?.map(i => i.id) ?? []), ...(result.receipts?.map(r => r.id) ?? [])]} basis="四段單據獨立關聯；未收款不等於未出貨，餘額大於零且快照日期超過到期日才逾期。" />
    </section> : <Empty>查無 {query.orderId || '指定'} 訂單，請輸入完整 ID。</Empty>}
    <div className="section-heading"><h2>符合條件的訂單 · {listed.length} 筆</h2><button className="btn btn-secondary" onClick={() => { updateQuery({ selectedCustomerId: '', selectedProductId: '' }); setAnomaly(''); }}>清除列表篩選</button></div>
    {listed.length ? <div className="table-container"><table><thead><tr><th>訂單</th><th>客戶／產品</th><th>日期</th><th>狀態</th><th>操作</th></tr></thead><tbody>{listed.map(o => <tr key={o.id}><td>{o.id}</td><td>{customerName(o.customer_id)}<small className="table-id">{productName(o.product_id)}</small></td><td>{o.created_at.slice(0, 10)}</td><td>{Object.values(getOrderProgress(o.id)!.stages).join('／')}</td><td><button className="btn btn-secondary btn-sm" onClick={() => selectOrder(o.id)}>查看</button></td></tr>)}</tbody></table></div> : <Empty />}
    {source && result && <Modal title={`${result.order.id} 來源單據（本地示範）`} onClose={() => setSource(false)}><pre className="source-json">{JSON.stringify({ order: result.order, approvals: result.approvals, shipments: result.shipments, invoices: result.invoices, receipts: result.receipts }, null, 2)}</pre></Modal>}
  </>;
}
export function QuotesPage() {
  const { query, updateQuery } = useApp();
  const [ascending, setAscending] = useState(false);
  const [search, setSearch] = useState('');
  const [doc, setDoc] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [refund, setRefund] = useState(false);
  const quotes = getHistoricalQuotes(query.selectedCustomerId, query.selectedProductId, ascending).filter(q => `${customerName(q.customer_id)} ${q.id} ${q.context}`.includes(search));
  const detail = demoData.quotes.find(q => q.id === detailId);
  const pm = demoData.pms.find(pm => pm.id === demoData.products.find(p => p.id === query.selectedProductId)?.pm_id);
  return <><p className="notice">{quoteDisclosure}</p><div className="filter-bar"><SharedFilters /><label className="filter-field"><span>搜尋客戶／紀錄</span><input className="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="客戶、報價 ID 或背景" /></label>
    <Select label="日期排序" value={ascending ? 'asc' : 'desc'} onChange={v => setAscending(v === 'asc')} options={[{ value: 'desc', label: '由新到舊' }, { value: 'asc', label: '由舊到新' }]} /><button className="btn btn-secondary" onClick={() => { updateQuery({ selectedCustomerId: '', selectedProductId: '' }); setSearch(''); }}>查看全部報價</button></div>
    <p className="subtle-summary">符合條件的歷史報價 · {quotes.length} 筆</p>
    {quotes.length ? <div className="quote-grid">{quotes.map(q => <section className="card quote-card" key={q.id}><span className="badge badge-gray">歷史報價 · {q.id}</span><h2>{q.date}</h2><p>{customerName(q.customer_id)} · {productName(q.product_id)}</p><strong className="quote-price">{money(q.gross_unit_price)}<small>／盒（示範含稅）</small></strong><p>{q.context}</p><p className="text-muted">{q.tax_note}</p><p>{q.refund_note} · 金額未提供</p><div className="action-row"><button className="btn btn-secondary" onClick={() => setDetailId(q.id)}>報價詳情</button><button className="btn btn-primary" onClick={() => setDoc(q.source_doc)}>預覽原始文件</button></div></section>)}</div> : <Empty>此組客戶與產品沒有歷史報價，請調整條件或查看全部報價。</Empty>}
    <button className="btn btn-secondary" onClick={() => setRefund(true)}>查詢退稅後單價</button>
    {refund && <div className="notice" role="status">目前資料不足以確認退稅規則，不能計算退稅後單價。{pm ? `請向 ${pm.name}（${pm.id}，${pm.email}）確認適用條件。` : '請先選擇產品以查看對應 PM。'}所有窗口均為示範。</div>}
    <SourceNote systems="歷史報價／SAP／知識文件（待確認）" ids={quotes.map(q => `${q.id}／${q.source_doc}`)} updated={quotes.map(q => q.date).join('、') || '無匹配紀錄'} basis="原單存值，不拆算稅率；refund_amount=null 表示未提供，不等於 0。" />
    {detail && <Modal title={`${detail.id} 報價詳情`} onClose={() => setDetailId(null)}><p>{quoteDisclosure}</p><p>{detail.date} · {customerName(detail.customer_id)} · {productName(detail.product_id)}</p><p>示範含稅單價 {money(detail.gross_unit_price)}</p><p>{detail.context}</p><p>{detail.tax_note}</p><p>{detail.refund_note} · 退稅金額：未提供</p><p>來源：{detail.source_doc}</p><button className="btn btn-secondary" onClick={() => { setDetailId(null); setDoc(detail.source_doc); }}>預覽原文</button></Modal>}
    {doc && <DocumentPreview id={doc} onClose={() => setDoc(null)} />}
  </>;
}
