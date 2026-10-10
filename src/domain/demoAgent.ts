import { demoData } from '../data/demo/demoData.ts';
import type { FeatureId } from '../data/demo/types.ts';
import type { QueryState } from './demoState.ts';
import { getCallKpi, getSalesSummary, compareSales, getOrderProgress, getPackageSummary, getProductTier, getHistoricalQuotes, formatPercentage, quoteDisclosure } from './demoRules.ts';

export type RequiredField = 'month' | 'customer' | 'product' | 'year';
export interface AgentResult { feature: FeatureId | null; patch: Partial<QueryState>; required: RequiredField[]; text: string; sources: string[]; updatedAt: string; special?: 'tier' | 'refund' | 'subsidy' | 'unknown-product' | 'unknown-target' }
export const demoQuestions = [
  '本月有哪些 A 級客戶還沒 Call？', '比較九月與十月產品 A、B、C 的銷量。', 'O007 訂單為什麼還沒出貨？',
  '晨星醫院的產品 B 過去怎麼報價？', '拜訪林醫師需要準備什麼資料？', '產品 B 的製編和 PM 是誰？',
  '折讓作業要怎麼做？', '新人福利資訊在哪裡？', '晨星醫院的產品 B 進藥包齊了嗎？',
];
const stamp = '2026-10-20 08:55（模擬更新）';
export function routeDemoQuestion(question: string, current: QueryState): AgentResult {
  const q = question.replace(/\s+/g, '').toUpperCase();
  const patch: Partial<QueryState> = {};
  const productMatch = q.match(/(?:產品|P-)([A-Z])/);
  const bareProduct = q.match(/^([A-Z])(?:製編|哪個|在哪|什麼)/);
  const product = productMatch?.[1] ?? bareProduct?.[1];
  if (product) patch.selectedProductId = `P-${product}`;
  for (const c of demoData.customers) if (q.includes(c.name.replace('示範', ''))) patch.selectedCustomerId = c.id;
  if (q.includes('晨星')) patch.selectedCustomerId = 'C001';
  if (q.includes('林醫師') || q.includes('林醫生')) { patch.selectedCustomerId = 'C001'; patch.selectedDoctorId = 'DR001'; if (!product) patch.selectedProductId = 'P-B'; }
  const matchedDoctor = demoData.doctors.find(d => q.includes(d.name.replace('示範', '')) || q.includes(d.id));
  if (matchedDoctor && (!patch.selectedCustomerId || matchedDoctor.customer_id === patch.selectedCustomerId)) {
    patch.selectedCustomerId = matchedDoctor.customer_id; patch.selectedDoctorId = matchedDoctor.id;
    if (!product) patch.selectedProductId = demoData.visits.find(v => v.doctor_id === matchedDoctor.id)?.product_id ?? '';
  }
  if (q.includes('本月') || q.includes('十月') || q.includes('2026-10')) patch.selectedMonth = '2026-10';
  if ((q.includes('九月') || q.includes('2026-09')) && !q.includes('十月') && !q.includes('比較')) patch.selectedMonth = '2026-09';
  const year = q.match(/20\d{2}/)?.[0];
  const orderId = q.match(/O\d{3,4}/)?.[0];
  let feature: FeatureId | null = null;
  let special: AgentResult['special'];
  if (/進藥/.test(q)) feature = 'F9';
  else if (/退稅|報價|議價/.test(q)) { feature = 'F4'; if (q.includes('退稅')) special = 'refund'; }
  else if (/CALL|KPI|分級|還沒拜訪|尚未拜訪/.test(q)) {
    feature = 'F1'; patch.selectedCustomerId = '';
    const grade = q.match(/([ABC])級/)?.[1]; if (grade) patch.grade = grade as 'A' | 'B' | 'C';
    patch.callStatus = /還沒|尚未|未CALL|沒CALL/.test(q) ? 'zero' : /未達標/.test(q) ? 'unreached' : /已達標/.test(q) ? 'reached' : '';
  } else if (/銷量|銷售|業績/.test(q)) {
    feature = 'F2';
    if (/比較|近兩/.test(q)) { patch.selectedCustomerId = ''; patch.selectedProductId = ''; patch.selectedMonth = '2026-10'; }
  } else if (/折讓|折扣|SOP|手冊|溢收款|CRM怎麼/.test(q)) {
    feature = 'F7'; patch.sopId = /折扣/.test(q) ? 'DOC-S2' : /CRM/.test(q) ? 'DOC-S3' : /溢收款/.test(q) ? 'DOC-S4' : 'DOC-S1';
  } else if (/訂單|出貨|請款|收款/.test(q) || orderId) {
    feature = 'F3'; if (orderId) {
      patch.orderId = orderId;
      const order = demoData.orders.find(o => o.id === orderId);
      if (order) { patch.selectedCustomerId = order.customer_id; patch.selectedProductId = order.product_id; }
    }
  }
  else if (/梯隊|製編|物料|PM|編號/.test(q)) {
    feature = 'F6'; if (q.includes('梯隊')) { special = 'tier'; patch.selectedYear = year ? Number(year) : null; }
  } else if (/福利|公司簡介|補助/.test(q)) {
    feature = 'F8'; patch.companyTab = q.includes('公司簡介') ? 'company' : 'hr'; if (q.includes('補助')) special = 'subsidy';
  } else if (/拜訪|醫師|醫生/.test(q)) feature = 'F5';
  else if (/^(查|查詢)?(示範)?產品[A-Z][？?。]?$/.test(q)) feature = 'F6';
  if (!feature) return { feature: null, patch: {}, required: [], text: '目前 Demo 僅支援指定業務情境，請選擇下方的示範問題或功能方塊。', sources: [], updatedAt: stamp };
  if (product && !demoData.products.some(p => p.id === `P-${product}`)) { special = 'unknown-product'; patch.selectedProductId = ''; }
  if (/客戶編號/.test(q) && patch.selectedCustomerId && !product) patch.selectedProductId = '';
  const namedCustomer = q.match(/(?:拜訪|查詢|準備)?([^，。？?]{2,8}(?:醫院|診所|藥局))/)?.[1];
  if (namedCustomer && !demoData.customers.some(c => q.includes(c.name.replace('示範', '')))) special = 'unknown-target';
  const namedDoctor = q.match(/([\u4e00-\u9fff])(?:醫師|醫生)/)?.[1];
  if (namedDoctor && !demoData.doctors.some(d => d.name.includes(namedDoctor + '醫師'))) special = 'unknown-target';
  if (special === 'unknown-target') { patch.selectedCustomerId = ''; patch.selectedDoctorId = ''; }
  if (feature === 'F1') patch.grade = patch.grade ?? '';
  if (patch.selectedCustomerId !== undefined && patch.selectedCustomerId !== current.selectedCustomerId && patch.selectedDoctorId === undefined) patch.selectedDoctorId = '';
  const combined = { ...current, ...patch };
  const required: RequiredField[] = [];
  if (['F1', 'F2'].includes(feature) && !('selectedMonth' in patch) && !/比較|近兩/.test(q)) required.push('month');
  if (['F4', 'F5', 'F9'].includes(feature) && !combined.selectedCustomerId) required.push('customer');
  if (['F4', 'F5', 'F9'].includes(feature) && !combined.selectedProductId) required.push('product');
  if (feature === 'F6' && !combined.selectedProductId && !/客戶編號/.test(q)) required.push('product');
  if (feature === 'F6' && /客戶編號/.test(q) && !combined.selectedCustomerId) required.push('customer');
  if (special === 'tier' && combined.selectedYear === null) required.push('year');
  const result: AgentResult = { feature, patch, required, special, text: '', sources: [], updatedAt: stamp };
  return answerDemo(result, combined);
}

export function answerDemo(route: AgentResult, query: QueryState): AgentResult {
  const result = { ...route };
  if (route.special === 'unknown-product') return { ...result, required: [], text: '示範產品主檔查無此產品；沒有可確認的製編、PM 或交易資料。請選擇已提供的產品。', sources: ['products：0 筆匹配'] };
  if (route.special === 'unknown-target') return { ...result, required: [], text: '目前沒有此客戶或醫師的示範資料，請選擇已提供的對象。', sources: ['customers/doctors：0 筆匹配'] };
  if (route.required.length) return { ...result, text: '請補充下方條件，再查詢示範資料。', sources: [] };
  const c = query.selectedCustomerId, p = query.selectedProductId;
  switch (route.feature) {
    case 'F1': {
      const kpi = getCallKpi({ month: query.selectedMonth, customerId: c || undefined, grade: query.grade || undefined, status: query.callStatus || undefined });
      result.text = kpi.totals ? `已查詢 ${query.selectedMonth} 的客戶拜訪紀錄。\n${kpi.rows.map(r => `${r.customer.name} ${r.customer.id}：${r.actual}／${r.required} 次，尚缺 ${r.gap} 次。`).join('\n') || '此條件沒有客戶。'}\n篩選範圍：實際 ${formatPercentage(kpi.totals.actualRate)}、封頂 ${formatPercentage(kpi.totals.cappedRate)}、達標客戶 ${formatPercentage(kpi.totals.reachedRate)}。` : '此月份沒有可確認的 Call 要求快照，無法計算達成率。';
      result.sources = [`customers：${kpi.rows.map(r => r.customer.id).join(',') || '0筆'}`, `calls：${query.selectedMonth},S001`]; break;
    }
    case 'F2': {
      const sales = getSalesSummary({ month: query.selectedMonth, customerId: c || undefined, productId: p || undefined });
      result.text = `${query.selectedMonth} 示範已請款含稅金額 ${sales.amount.toLocaleString('zh-TW')}，共 ${sales.quantity} 盒。\n目標：${sales.target?.toLocaleString('zh-TW') ?? '此範圍未設置'}；達成率 ${formatPercentage(sales.attainment)}。\n${compareSales({ customerId: c || undefined, productId: p || undefined }).map(r => `${r.product.name}：${r.previous.quantity} → ${r.current.quantity}（${formatPercentage(r.change)}）`).join('\n')}\n九月為全月；十月截至 20 日，期間不等長。`;
      result.sources = [`sales：${sales.rows.map(s => s.id).join(',') || '0筆'}`, `targets：${query.selectedMonth},S001`]; result.updatedAt = '2026-10-20 08:00（模擬更新）'; break;
    }
    case 'F3': {
      const order = getOrderProgress(query.orderId);
      result.text = order ? `${order.order.id}：${Object.values(order.stages).join(' → ')}。\n${order.order.block_reason || '沒有已記錄的簽核卡點。'}${order.invoices?.length ? `\n請款 ${order.invoiced?.toLocaleString('zh-TW')}，未收餘額 ${order.outstanding?.toLocaleString('zh-TW') ?? '未確認'}；到期 ${order.invoices.map(i => i.due_date).join('、')}，${order.overdue ? '已逾期' : '示範日未逾期'}。` : ''}` : '查無此訂單，沒有可確認的四階段資料。';
      result.sources = [`orders：${query.orderId}`, `approvals/shipments/invoices/receipts：${query.orderId}`]; break;
    }
    case 'F4': {
      const quotes = getHistoricalQuotes(c, p);
      result.text = route.special === 'refund' ? '目前資料不足以確認退稅規則，無法計算退稅後單價。請查看原始註記並向對應示範 PM 確認。'
        : quotes.map(q => `${q.id} ${q.date}：示範含稅單價 ${q.gross_unit_price}；${q.context}。`).join('\n') || '此客戶與產品沒有歷史報價。';
      result.text += `\n${quoteDisclosure}`; result.sources = quotes.map(q => `quotes:${q.id}／documents:${q.source_doc}`); result.updatedAt = quotes[0]?.date ?? '無匹配紀錄'; break;
    }
    case 'F5': {
      const visit = demoData.visits.filter(v => v.customer_id === c && v.product_id === p && (!query.selectedDoctorId || v.doctor_id === query.selectedDoctorId)).sort((a, b) => b.date.localeCompare(a.date))[0];
      result.text = visit ? `${visit.id} ${visit.date}：${visit.note}\n準備需求：${visit.next_need.join('、')}。\n產品文件為示範佔位，未提供可引用的醫藥文獻。` : '此條件沒有既有拜訪紀錄，不產生未經來源支持的建議。';
      result.sources = visit ? [`visits:${visit.id}`, ...visit.next_need] : ['visits：0筆']; result.updatedAt = visit?.date ?? '無匹配紀錄'; break;
    }
    case 'F6': {
      const product = demoData.products.find(x => x.id === p), customer = demoData.customers.find(x => x.id === c);
      const tier = getProductTier(p, query.selectedYear);
      result.text = route.special === 'tier' ? tier.tier ? `${product?.name} ${tier.tier.year}：${tier.tier.tier}（示範分級）。` : '此年度沒有可確認的梯隊資料。'
        : product ? `${product.name} ${product.id}：物料 ${product.material_no}、製編 ${product.manufacturing_no}、窗口 ${product.pm_id}。` : customer ? `${customer.name}：客戶編號 ${customer.id}。` : '查無匹配產品或客戶。';
      result.sources = product ? [`products:${p}`, `pms:${product.pm_id}`, ...(route.special === 'tier' ? [`tiers:${query.selectedYear},${p}`] : [])] : [`customers:${c}`]; break;
    }
    case 'F7': case 'F8': {
      const doc = demoData.documents.find(d => d.id === (route.feature === 'F7' ? query.sopId : query.companyTab === 'hr' ? 'DOC-HR' : 'DOC-CO'))!;
      result.text = route.special === 'subsidy' ? '目前沒有可確認的補助金額資料。請向示範 HR 確認；這不是公司真實福利制度。' : `${doc.title}：${doc.text}`;
      result.sources = [`documents:${doc.id} ${doc.locator} v${doc.version}`]; result.updatedAt = doc.updated_at; break;
    }
    case 'F9': {
      const items = demoData.package_items.filter(i => i.customer_id === c && i.product_id === p);
      const pkg = items.length ? getPackageSummary(items[0].package_id, query.packageOverrides) : null;
      result.text = pkg ? `有效齊備 ${pkg.ready}／${pkg.total} 項，${formatPercentage(pkg.completeness)}。\n缺件：${pkg.missing.map(r => r.item.kind).join('、') || '無'}。${pkg.outdated.length ? `\n舊版：${pkg.outdated.map(r => r.item.kind).join('、')}，請套用新版。` : ''}\n${pkg.complete ? '示範清單已齊備。' : '尚未全部齊備。'}` : '此客戶與產品沒有進藥清單；請補充清單，不自行產生資格文件。';
      result.sources = items.length ? [`package_items:${items[0].package_id}`, ...pkg!.rows.filter(r => r.document).map(r => `documents:${r.document!.id}`)] : ['package_items：0筆']; result.updatedAt = '依各文件日期與版本'; break;
    }
  }
  return result;
}
