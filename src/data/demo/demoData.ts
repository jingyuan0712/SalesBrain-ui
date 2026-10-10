import type { DemoData, DemoDocument, DocumentStatus, Sale } from './types.ts';

// Source: SalesBrain 決賽共識與前端 Demo 規格 v1.0, pp. 19–46.
// Original specification scenarios are retained; additional fictional records enrich the UI.
const snapshot = '2026-10-20T09:00:00+08:00';
const masterUpdated = '2026-10-20T08:55:00+08:00';
const salesUpdated = '2026-10-20T08:00:00+08:00';
const salesRows: [string, string, string, string, number, number, string, string][] = [
  ['SL001', '2026-09-02', 'C001', 'P-A', 40, 100, 'O0901', 'INV0901'],
  ['SL002', '2026-09-04', 'C003', 'P-A', 60, 100, 'O0902', 'INV0902'],
  ['SL003', '2026-09-06', 'C001', 'P-B', 40, 200, 'O0903', 'INV0903'],
  ['SL004', '2026-09-08', 'C002', 'P-B', 40, 200, 'O0904', 'INV0904'],
  ['SL005', '2026-09-10', 'C004', 'P-C', 20, 50, 'O0905', 'INV0905'],
  ['SL006', '2026-09-12', 'C005', 'P-C', 40, 50, 'O0906', 'INV0906'],
  ['SL007', '2026-10-02', 'C001', 'P-A', 60, 100, 'O001', 'INV001'],
  ['SL008', '2026-10-04', 'C003', 'P-A', 60, 100, 'O002', 'INV002'],
  ['SL009', '2026-10-06', 'C001', 'P-B', 30, 200, 'O003', 'INV003'],
  ['SL010', '2026-10-08', 'C002', 'P-B', 30, 200, 'O004', 'INV004'],
  ['SL011', '2026-10-10', 'C004', 'P-C', 40, 50, 'O005', 'INV005'],
  ['SL012', '2026-10-12', 'C005', 'P-C', 50, 50, 'O006', 'INV006'],
];
const sales: Sale[] = salesRows.map(([id, date, customer_id, product_id, quantity, unit_price, order_id, invoice_id]) => ({
  id, date, customer_id, product_id, quantity, unit_price, amount: quantity * unit_price, order_id, invoice_id, salesperson_id: 'S001',
}));
const approvedOrders = sales.map(s => ({
  id: s.order_id, customer_id: s.customer_id, product_id: s.product_id, quantity: s.quantity,
  amount: s.amount, created_at: `${s.date}T08:00:00+08:00`, approval_status: 'approved' as const, block_reason: null,
}));
const orders: DemoData['orders'] = [...approvedOrders,
  { id: 'O007', customer_id: 'C001', product_id: 'P-B', quantity: 30, amount: 6000, created_at: '2026-10-20T08:00:00+08:00', approval_status: 'pending', block_reason: '示範價格條件覆核中' },
  { id: 'O008', customer_id: 'C002', product_id: 'P-A', quantity: 10, amount: 1000, created_at: '2026-10-19T08:00:00+08:00', approval_status: 'approved', block_reason: null },
];
const callRows: [string, string, string, string | null][] = [
  ['CALL001', '2026-10-02', 'C002', 'DR003'], ['CALL002', '2026-10-12', 'C002', 'DR003'],
  ['CALL003', '2026-10-03', 'C003', 'DR004'], ['CALL004', '2026-10-14', 'C003', 'DR004'],
  ['CALL005', '2026-10-04', 'C004', 'DR005'], ['CALL006', '2026-10-10', 'C004', 'DR005'],
  ['CALL007', '2026-10-18', 'C004', 'DR005'], ['CALL008', '2026-10-09', 'C005', null],
];
type DocRow = [string, string, string, string, string, DocumentStatus, string | null, string, string, string];
const documentRows: DocRow[] = [
  ['DOC-B2', '示範產品 B 第二章', 'product', '2.0', '2026-10-10', 'current', 'P-B', '示範 PM02', '章 2', '示範章節僅列文件用途與版本，無適應症、劑量、療效或真實核准資訊。'],
  ['DOC-LIT', '示範醫藥文獻索引佔位', 'literature', '1.0', '2026-10-10', 'placeholder', 'P-B', '示範 PM02', '索引', '示範佔位，無作者、期刊、DOI 或研究結論；正式須取得可合法使用的文獻。'],
  ['DOC-DM1', '示範產品 B DM', 'marketing', '1.0', '2026-08-01', 'superseded', 'P-B', '示範 PM02', '頁 1', '示範舊版文件，已被 DOC-DM2 取代；僅供歷史追溯。'],
  ['DOC-DM2', '示範產品 B DM', 'marketing', '2.0', '2026-10-15', 'current', 'P-B', '示範 PM02', '頁 1', '示範新版 DM 佔位，不含促銷承諾或醫療宣稱。'],
  ['DOC-S1', '示範折讓作業手冊', 'sop', '2.0', '2026-10-12', 'current', null, '示範作業窗口', '節 1', '示範：查原單 → 核對差異 → 備妥附件 → 交授權窗口覆核。不是企業正式流程。'],
  ['DOC-S2', '示範產品折扣指引', 'sop', '1.0', '2026-10-10', 'current', 'P-B', '示範 PM02', '節 1', '示範僅引導查核可用折扣文件與 PM，不提供折扣比例或自動核價。'],
  ['DOC-S3', '示範 CRM 使用手冊', 'sop', '1.0', '2026-10-01', 'current', null, '示範 CRM 窗口', '節 1', '示範：選擇客戶 → 檢視拜訪 → 搜尋訂單。正式按企業核准手冊。'],
  ['DOC-S4', '示範溢收款證明指引', 'sop', '1.0', '2026-10-01', 'current', null, '示範財務窗口', '節 1', '示範：列原單與差額證據 → 交財務確認；未產生可對外使用的證明。'],
  ['DOC-HR', '示範公司福利', 'hr', '1.0', '2026-10-01', 'current', null, '示範 HR', '節 1', '虛構福利：新人學習資源與示範內部諮詢入口；非中化福利政策，無補助金額。'],
  ['DOC-CO', '示範公司簡介', 'company', '1.0', '2026-10-01', 'current', null, '示範 HR', '節 1', '虛構示範企業提供產品資訊與通路服務；本頁不代表中化正式簡介。'],
  ['DOC-QUAL', '示範資格證明佔位', 'qualification', '1.0', '2026-10-01', 'current', null, '示範文件窗口', '頁 1', '無真實證號、章戳或有效資格；僅作檔案齊備狀態展示。'],
  ['DOC-RAW', '示範原料來源佔位', 'raw-material', '1.0', '2026-10-01', 'current', 'P-B', '示範 PM02', '頁 1', '虛構原料來源欄位佔位；不宣稱任何真實供應商或來源。'],
  ['DOC-Q1', '示範歷史報價六月', 'quote', '1.0', '2026-06-15', 'historical', 'P-B', '示範 PM02', '頁 1', '示範含稅單價 220；退稅未確認。'],
  ['DOC-Q2', '示範歷史報價九月', 'quote', '1.0', '2026-09-05', 'historical', 'P-B', '示範 PM02', '頁 1', '示範含稅單價 200；退稅未確認。'],
];
const documents: DemoDocument[] = documentRows.map(([id, title, type, version, updated_at, status, product_id, owner, locator, text]) => ({
  id, title, type, version, updated_at, status, product_id, owner, locator, text, is_demo: true,
  asset_path: `demo-docs/${id}.html`, ...(id === 'DOC-DM1' ? { replacement: 'DOC-DM2' } : {}),
}));
type QARow = [string, DemoData['qa_templates'][number]['intent'], string, string, string[], string, Record<string, string | number>];
const qaRows: QARow[] = [
  ['QA01', 'F1', '本月哪些 A 級客戶還沒 Call？', '示範晨星醫院 C001，{{c001_actual}}／{{c001_required}} 次。', ['customers:C001', 'calls:2026-10,S001'], masterUpdated, { month: '2026-10', grade: 'A', call_status: 'zero' }],
  ['QA02', 'F2', '近兩個月 A／B／C 銷量？', '示範 A {{a_prev}}→{{a_cur}}（{{a_change}}）；B {{b_prev}}→{{b_cur}}（{{b_change}}）；C {{c_prev}}→{{c_cur}}（{{c_change}}）。', ['sales:2026-09,2026-10', 'products:P-A,P-B,P-C'], salesUpdated, { month: '2026-10', previous_month: '2026-09' }],
  ['QA03', 'F3', 'O007 為什麼未出貨？', '{{order_summary}}', ['orders:O007', 'approvals:AP-O007', 'shipments/invoices/receipts:O007'], masterUpdated, { order_id: 'O007' }],
  ['QA04', 'F4', '晨星產品 B 過去怎麼報價？', '示範六月含稅 {{q001_price}}、九月含稅 {{q002_price}}；退稅未確認，歷史價不代表現行授權。', ['quotes:Q001,Q002', 'documents:DOC-Q1,DOC-Q2'], '2026-09-05', { customer_id: 'C001', product_id: 'P-B' }],
  ['QA05', 'F5', '拜訪晨星林醫師需要什麼？', 'V001 要 B 第二章及進藥資料；有示範佔位文件，但文獻未提供。{{package_summary}}', ['visits:V001', 'documents:DOC-B2,DOC-DM2,DOC-LIT', 'package_items:PK01'], '2026-10-15', { customer_id: 'C001', product_id: 'P-B', doctor_id: 'DR001' }],
  ['QA06', 'F6', 'B 製編和 PM？', '示範製編 {{manufacturing_no}}、物料 {{material_no}}、窗口 {{pm_id}}。', ['products:P-B', 'pms:PM02'], masterUpdated, { product_id: 'P-B' }],
  ['QA07', 'F7', '折讓怎麼準備？', '示範查原單、核對差異、備附件、交授權窗口；正式必須依企業核准流程。', ['documents:DOC-S1 節1 v2.0', 'videos:VID01'], '2026-10-12', { doc_id: 'DOC-S1' }],
  ['QA08', 'F8', '新人福利有哪些？', '虛構示範只有學習資源與諮詢入口，非真實公司政策；補助金額未提供。', ['documents:DOC-HR 節1 v1.0'], '2026-10-01', { doc_id: 'DOC-HR' }],
  ['QA09', 'F9', '晨星 B 進藥包齊了嗎？', '{{package_summary}}', ['package_items:PK01', 'documents:DOC-QUAL,DOC-RAW,DOC-B2,DOC-DM1,DOC-DM2'], '2026-10-15', { customer_id: 'C001', product_id: 'P-B', package_id: 'PK01' }],
  ['QA10', 'F6', 'B 哪個梯隊？', '請補充年度；2025 與 2026 示範清單不同。', ['tiers:2025,P-B', 'tiers:2026,P-B'], masterUpdated, { product_id: 'P-B' }],
  ['QA11', 'F6', '查產品 Z', '示範資料沒有此產品。已查產品主檔；請補充產品名稱或編號，不猜製編與 PM。', ['products:query=Z,0筆'], masterUpdated, { product_query: 'Z' }],
  ['QA12', 'F4', '退稅後單價是多少？', '沒有足夠規則，無法計算；請檢視原始註記或向示範 PM02 確認。', ['quotes:Q001,Q002 refund_amount=null', 'pms:PM02'], '2026-09-05', { customer_id: 'C001', product_id: 'P-B' }],
  ['QA13', 'F3', 'O003 收款了嗎？', '{{order_summary}}', ['orders:O003', 'shipments:SH-O003', 'invoices:INV003', 'receipts:INV003,0筆'], masterUpdated, { order_id: 'O003' }],
];

const specificationData: DemoData = {
  meta: { is_demo: true, snapshot_at: snapshot, current_month: '2026-10', previous_month: '2026-09', region: 'R01', region_name: '示範北區', salesperson_id: 'S001', kpi_unit: 'customer', rules: { A: 4, B: 2, C: 1 }, sales_basis: '示範已請款含稅金額，非正式公司業績口徑' },
  users: [{ id: 'S001', name: '示範業務陳小晴', role: 'sales', region: 'R01' }, { id: 'S002', name: '示範主管王怡安', role: 'manager', region: 'R01' }],
  customers: [
    { id: 'C001', name: '示範晨星醫院', channel: '醫院', grade: 'A', required: 4, owner: 'S001', region: 'R01' },
    { id: 'C002', name: '示範青禾醫院', channel: '醫院', grade: 'A', required: 4, owner: 'S001', region: 'R01' },
    { id: 'C003', name: '示範安和診所', channel: '診所', grade: 'B', required: 2, owner: 'S001', region: 'R01' },
    { id: 'C004', name: '示範晴川診所', channel: '診所', grade: 'B', required: 2, owner: 'S001', region: 'R01' },
    { id: 'C005', name: '示範松澄藥局', channel: '藥局', grade: 'C', required: 1, owner: 'S001', region: 'R01' },
  ],
  doctors: [
    { id: 'DR001', customer_id: 'C001', name: '示範林醫師', department: '心臟內科', clinic_load: 40 },
    { id: 'DR002', customer_id: 'C001', name: '示範周醫師', department: '心臟內科', clinic_load: 25 },
    { id: 'DR003', customer_id: 'C002', name: '示範何醫師', department: '心臟內科', clinic_load: 35 },
    { id: 'DR004', customer_id: 'C003', name: '示範陳醫師', department: '家醫科', clinic_load: 20 },
    { id: 'DR005', customer_id: 'C004', name: '示範吳醫師', department: '家醫科', clinic_load: 15 },
  ],
  calls: callRows.map(([id, date, customer_id, doctor_id]) => ({ id, date, customer_id, doctor_id, salesperson_id: 'S001', status: 'completed', valid: true, note: '示範已完成拜訪紀錄' })),
  products: [
    { id: 'P-A', name: '示範產品 A', material_no: 'M26001', manufacturing_no: 'FG-A01', pm_id: 'PM01', demo_price: 100, unit: '盒' },
    { id: 'P-B', name: '示範產品 B', material_no: 'M26002', manufacturing_no: 'FG-B01', pm_id: 'PM02', demo_price: 200, unit: '盒' },
    { id: 'P-C', name: '示範產品 C', material_no: 'M26003', manufacturing_no: 'FG-C01', pm_id: 'PM01', demo_price: 50, unit: '盒' },
  ],
  pms: [{ id: 'PM01', name: '示範許 PM', email: 'pm01@example.invalid' }, { id: 'PM02', name: '示範葉 PM', email: 'pm02@example.invalid' }],
  tiers: [
    { year: 2025, product_id: 'P-A', tier: '第二梯隊' }, { year: 2026, product_id: 'P-A', tier: '第一梯隊' },
    { year: 2025, product_id: 'P-B', tier: '第一梯隊' }, { year: 2026, product_id: 'P-B', tier: '第二梯隊' },
    { year: 2025, product_id: 'P-C', tier: '第三梯隊' }, { year: 2026, product_id: 'P-C', tier: '第三梯隊' },
  ],
  sales, targets: [{ salesperson_id: 'S001', month: '2026-10', amount: 40000, basis: 'demo_invoiced_gross' }], orders,
  approvals: orders.map(o => ({ id: `AP-${o.id}`, order_id: o.id, status: o.approval_status, step: o.approval_status === 'pending' ? '示範主管覆核' : '示範核准完成', updated_at: `${o.created_at.slice(0, 10)}T${o.approval_status === 'pending' ? '08:45' : '08:30'}:00+08:00` })),
  shipments: orders.filter(o => o.id !== 'O007').map(o => ({ id: `SH-${o.id}`, order_id: o.id, quantity: o.quantity, status: 'shipped', date: o.created_at.slice(0, 10) })),
  invoices: sales.map(s => ({ id: s.invoice_id, order_id: s.order_id, amount: s.amount, date: s.date, status: 'issued', due_date: s.order_id === 'O003' ? '2026-11-06' : s.order_id === 'O004' ? '2026-11-08' : s.date })),
  receipts: sales.filter(s => !['O003', 'O004'].includes(s.order_id)).map(s => ({ id: `RC-${s.order_id}`, invoice_id: s.invoice_id, amount: s.amount, date: s.date })),
  quotes: [
    { id: 'Q001', customer_id: 'C001', product_id: 'P-B', date: '2026-06-15', gross_unit_price: 220, tax_note: '示範原單註記含稅；稅率與拆算未提供', refund_note: '示範原單提退稅待確認', refund_amount: null, context: '示範既有議價', status: 'historical', source_doc: 'DOC-Q1' },
    { id: 'Q002', customer_id: 'C001', product_id: 'P-B', date: '2026-09-05', gross_unit_price: 200, tax_note: '示範原單註記含稅；稅率與拆算未提供', refund_note: '示範退款／退稅適用條件尚未確認', refund_amount: null, context: '虛構健保調價後議價情境，非真實事件', status: 'historical', source_doc: 'DOC-Q2' },
  ],
  visits: [
    { id: 'V001', customer_id: 'C001', doctor_id: 'DR001', date: '2026-09-22', product_id: 'P-B', note: '示範林醫師希望下次帶 B 第二章與進藥資料，未承諾價格或療效。', source_call_id: null, next_need: ['DOC-B2', 'PK01'] },
    { id: 'V002', customer_id: 'C002', doctor_id: 'DR003', date: '2026-10-12', product_id: 'P-B', note: '示範確認一般文件需求，不含病患資料。', source_call_id: 'CALL002', next_need: ['DOC-DM2'] },
  ], documents,
  // The user's allowed fallback is an interactive tutorial, clearly labeled as animation.
  videos: [{ id: 'VID01', doc_id: 'DOC-S1', version: '2.0', duration_seconds: 20, asset_path: 'demo-tutorials/VID01.html', title: '示範折讓圖文教學', updated_at: '2026-10-12', asset_status: 'available', media_type: 'animation' }],
  package_items: [
    { id: 'PI01', package_id: 'PK01', customer_id: 'C001', product_id: 'P-B', kind: '資格證明', required: true, doc_id: 'DOC-QUAL', status: 'ready' },
    { id: 'PI02', package_id: 'PK01', customer_id: 'C001', product_id: 'P-B', kind: '營業證明', required: true, doc_id: null, status: 'missing' },
    { id: 'PI03', package_id: 'PK01', customer_id: 'C001', product_id: 'P-B', kind: '原料來源', required: true, doc_id: 'DOC-RAW', status: 'ready' },
    { id: 'PI04', package_id: 'PK01', customer_id: 'C001', product_id: 'P-B', kind: '產品第二章', required: true, doc_id: 'DOC-B2', status: 'ready' },
    { id: 'PI05', package_id: 'PK01', customer_id: 'C001', product_id: 'P-B', kind: 'DM', required: true, doc_id: 'DOC-DM1', status: 'outdated', replacement_doc_id: 'DOC-DM2' },
  ],
  qa_templates: qaRows.map(([id, intent, query, template, sources, data_updated_at, params]) => ({ id, intent, query, template, sources, data_updated_at, params, mode: 'preset_demo' })),
  freshness: [
    { dataset: 'customers/doctors/calls/products/tiers', source_updated_at: masterUpdated, retrieved_at: snapshot, time_basis: 'snapshot' },
    { dataset: 'sales/targets', source_updated_at: salesUpdated, retrieved_at: snapshot, time_basis: 'snapshot' },
    { dataset: 'orders/approvals/shipments/invoices/receipts', source_updated_at: masterUpdated, retrieved_at: snapshot, time_basis: 'snapshot' },
    { dataset: 'documents/quotes/visits/package_items', source_updated_at: null, retrieved_at: snapshot, time_basis: 'record' },
  ],
  glossary: [
    { term: 'Call', definition: '業務拜訪，不是電話通話次數', scope: '拜訪 KPI', year_required: false },
    { term: 'A 級', definition: '客戶分級，非產品 A', scope: '客戶', year_required: false },
    { term: '產品 A', definition: '產品 P-A，非客戶 A 級', scope: '產品', year_required: false },
    { term: '梯隊', definition: '依指定年度的產品分級清單', scope: '產品年度', year_required: true },
    { term: '製編／物料號碼', definition: '先分別列欄，兩者是否等同待確認', scope: '產品主檔', year_required: false },
    { term: '退稅', definition: '保留原文，含義與計算未確認', scope: '歷史報價', year_required: false },
  ],
};

function expandMockData(base: DemoData): DemoData {
  const data = structuredClone(base);
  const pad = (value: number) => String(value).padStart(3, '0');
  const newCustomers: [string, 'A' | 'B' | 'C', number][] = [
    ['海棠醫院', 'A', 0], ['瑞景醫院', 'A', 0], ['明川醫院', 'A', 1],
    ['景安醫院', 'A', 2], ['向陽醫院', 'A', 4], ['星河醫院', 'A', 5],
    ['沐光診所', 'B', 0], ['和煦診所', 'B', 1], ['新嶼診所', 'B', 2], ['柏森診所', 'B', 3],
    ['澄心藥局', 'C', 0], ['日和藥局', 'C', 1], ['禾光藥局', 'C', 2],
  ];
  const doctorNames = ['許', '黃', '鄭', '蔡', '徐', '曾', '葉', '邱', '蕭', '郭', '賴', '江', '沈', '洪', '杜', '高', '彭', '戴', '簡', '蘇'];
  newCustomers.forEach(([name, grade, callCount], index) => {
    const customerId = `C${pad(index + 6)}`;
    data.customers.push({ id: customerId, name: `示範${name}`, grade, channel: grade === 'A' ? '醫院' : grade === 'B' ? '診所' : '藥局', required: data.meta.rules[grade], owner: 'S001', region: 'R01' });
    if (grade !== 'C') for (let doctorIndex = 0; doctorIndex < 2; doctorIndex++) {
      data.doctors.push({ id: `DR${pad(index * 2 + doctorIndex + 6)}`, customer_id: customerId, name: `示範${doctorNames[index * 2 + doctorIndex]}醫師`, department: doctorIndex === 0 ? '家醫科' : '一般內科', clinic_load: 18 + index * 2 + doctorIndex * 5 });
    }
    for (let callIndex = 0; callIndex < callCount; callIndex++) data.calls.push({
      id: `CALL${pad(data.calls.length + 1)}`, customer_id: customerId,
      doctor_id: grade === 'C' ? null : `DR${pad(index * 2 + callIndex % 2 + 6)}`,
      salesperson_id: 'S001', date: `2026-10-${String(2 + callIndex * 3 + index % 3).padStart(2, '0')}`,
      status: 'completed', valid: true, note: ['核對聯絡窗口與文件版本', '追蹤訂單與附件準備', '確認下次拜訪時段'][callIndex % 3] + '（虛構紀錄）',
    });
  });
  data.pms.push({ id: 'PM03', name: '示範張 PM', email: 'pm03@example.invalid' });
  ['D', 'E', 'F'].forEach((letter, index) => {
    data.products.push({ id: `P-${letter}`, name: `示範產品 ${letter}`, material_no: `M2600${index + 4}`, manufacturing_no: `FG-${letter}01`, pm_id: index === 1 ? 'PM01' : 'PM03', unit: '盒', demo_price: [150, 80, 120][index] });
    data.tiers.push({ year: 2025, product_id: `P-${letter}`, tier: ['第三梯隊', '第二梯隊', '第一梯隊'][index] }, { year: 2026, product_id: `P-${letter}`, tier: ['第二梯隊', '第一梯隊', '第三梯隊'][index] });
  });
  data.targets = [{ salesperson_id: 'S001', month: '2026-09', amount: 170000, basis: 'demo_invoiced_gross' }, { salesperson_id: 'S001', month: '2026-10', amount: 180000, basis: 'demo_invoiced_gross' }];

  function addDocument(id: string, title: string, type: string, text: string, productId: string | null = null, date = '2026-10-10', status: DocumentStatus = 'current') {
    data.documents.push({ id, title: `示範${title}`, type, version: '1.0', updated_at: date, status, product_id: productId, owner: '示範文件維護窗口', locator: '節 1', text, asset_path: `demo-docs/${id}.html`, is_demo: true });
  }
  for (const product of data.products) {
    if (product.id !== 'P-B') {
      addDocument(`DOC-${product.id}-INFO`, `${product.name.replace('示範', '')}文件索引`, 'product', '虛構文件索引：產品編號 → 維護窗口 → 文件版本 → 申請紀錄。無適應症、劑量或療效資訊。', product.id);
      addDocument(`DOC-${product.id}-DM`, `${product.name.replace('示範', '')}資料封面`, 'marketing', '虛構資料封面與版本欄位，僅作拜訪附件展示，不含醫療宣稱。', product.id);
      addDocument(`DOC-${product.id}-RAW`, `${product.name.replace('示範', '')}原料欄位佔位`, 'raw-material', '虛構原料欄位，僅呈現文件齊備狀態，無真實來源或供應商資訊。', product.id);
    }
  }
  addDocument('DOC-BIZ', '營業證明欄位佔位', 'qualification', '虛構營業資料欄位，沒有真實證號、章戳或證明效力。');
  const additionalDocuments: [string, string, string, string][] = [
    ['DOC-S5', '拜訪紀錄整理手冊', 'sop', '示範：選擇客戶 → 核對拜訪日期 → 整理文件需求 → 保存草稿。正式操作依企業規定。'],
    ['DOC-S6', '訂單追蹤準備手冊', 'sop', '示範：核對訂單編號 → 檢查四階段紀錄 → 整理卡點 → 交負責窗口確認。'],
    ['DOC-S7', '文件版本管理手冊', 'sop', '示範：查文件日期 → 核對目前版本 → 標記舊版 → 確認替換紀錄。'],
    ['DOC-S8', '進藥包附件整理手冊', 'sop', '示範：選客戶產品 → 檢查必備清單 → 核對缺件 → 匯出準備摘要。'],
    ['DOC-HR2', '新人學習資源', 'hr', '虛構福利：新人可查看產品編號教學、拜訪紀錄整理與文件版本課程，沒有補助金額或實際政策承諾。'],
    ['DOC-HR3', '內部諮詢資源', 'hr', '虛構福利：提供示範 HR、產品窗口與系統操作諮詢分類，不含真實聯絡資料。'],
    ['DOC-HR4', '團隊交流活動', 'hr', '虛構福利：工作經驗分享、文件準備交流與新人回饋會議，非真實福利制度。'],
    ['DOC-CO2', '業務服務範圍', 'company', '虛構企業服務：產品文件整理、客戶拜訪準備、訂單進度查詢與通路資訊維護。'],
    ['DOC-CO3', '團隊協作介紹', 'company', '虛構團隊：業務整理客戶需求、PM 維護產品文件、作業窗口追蹤附件與流程。'],
    ['DOC-CO4', '資料使用原則', 'company', '虛構企業介紹：以來源紀錄、版本、更新日期與窗口作為資料查詢依據，無真實企業制度宣稱。'],
  ];
  additionalDocuments.forEach(([id, title, type, text]) => addDocument(id, title, type, text));
  ['DOC-S5', 'DOC-S6', 'DOC-S7'].forEach((docId, index) => {
    const doc = data.documents.find(d => d.id === docId)!;
    data.videos.push({ id: `VID0${index + 2}`, doc_id: docId, version: doc.version, asset_path: `demo-tutorials/VID0${index + 2}.html`, title: doc.title.replace('手冊', '圖文教學'), updated_at: doc.updated_at, duration_seconds: 20, asset_status: 'available', media_type: 'animation' });
  });

  function addTransaction(customerId: string, productId: string, quantity: number, date: string, state: 'paid' | 'unpaid' | 'partial' | 'pending' | 'unshipped' | 'uninvoiced' | 'partial-shipment') {
    const product = data.products.find(p => p.id === productId)!;
    const id = `O${pad(data.orders.length + 101)}`;
    const amount = quantity * product.demo_price;
    const pending = state === 'pending';
    data.orders.push({ id, customer_id: customerId, product_id: productId, quantity, amount, created_at: `${date}T08:00:00+08:00`, approval_status: pending ? 'pending' : 'approved', block_reason: pending ? '示範附件及價格條件待主管覆核' : state === 'unshipped' ? '示範排程待倉儲確認' : state === 'partial-shipment' ? '示範剩餘數量待排程' : null });
    data.approvals.push({ id: `AP-${id}`, order_id: id, status: pending ? 'pending' : 'approved', step: pending ? '示範主管覆核' : '示範核准完成', updated_at: `${date}T08:30:00+08:00` });
    if (pending || state === 'unshipped') return;
    data.shipments.push({ id: `SH-${id}`, order_id: id, quantity: state === 'partial-shipment' ? Math.floor(quantity / 2) : quantity, status: 'shipped', date });
    if (state === 'uninvoiced' || state === 'partial-shipment') return;
    const invoiceId = `INV-${id}`;
    data.invoices.push({ id: invoiceId, order_id: id, amount, date, status: 'issued', due_date: state === 'unpaid' ? '2026-10-15' : '2026-11-15' });
    data.sales.push({ id: `SL${pad(data.sales.length + 1)}`, date, customer_id: customerId, product_id: productId, quantity, unit_price: product.demo_price, amount, salesperson_id: 'S001', invoice_id: invoiceId, order_id: id });
    if (state !== 'unpaid') data.receipts.push({ id: `RC-${id}`, invoice_id: invoiceId, date, amount: state === 'partial' ? amount / 2 : amount });
  }
  for (const [index, customer] of data.customers.entries()) for (const [monthIndex, month] of ['09', '10'].entries()) {
    const product = data.products[(index + monthIndex) % data.products.length];
    const day = String(2 + index % 17).padStart(2, '0');
    addTransaction(customer.id, product.id, 15 + (index * 7 + monthIndex * 3) % 36, `2026-${month}-${day}`, month === '09' ? 'paid' : index % 3 === 0 ? 'unpaid' : index % 3 === 1 ? 'partial' : 'paid');
  }
  const states = ['pending', 'unshipped', 'uninvoiced', 'partial-shipment', 'unpaid', 'partial'] as const;
  for (let index = 0; index < 12; index++) addTransaction(data.customers[index + 5].id, data.products[index % 6].id, 20 + index, '2026-10-14', states[index % states.length]);

  const productForCustomer = (index: number) => index === 0 ? 'P-B' : data.products[index % 6].id;
  const packageForCustomer = (index: number) => `PK${String(index + 1).padStart(2, '0')}`;
  for (const [index, customer] of data.customers.entries()) {
    const productId = productForCustomer(index);
    const infoId = productId === 'P-B' ? 'DOC-B2' : `DOC-${productId}-INFO`;
    const dmId = productId === 'P-B' ? 'DOC-DM2' : `DOC-${productId}-DM`;
    if (index > 0) {
      const refs: [string, string | null][] = [['資格證明', 'DOC-QUAL'], ['營業證明', index % 3 === 0 ? null : 'DOC-BIZ'], ['原料來源', productId === 'P-B' ? 'DOC-RAW' : `DOC-${productId}-RAW`], ['產品文件', infoId], ['DM', productId === 'P-B' && index % 2 === 1 ? 'DOC-DM1' : index % 4 === 0 ? null : dmId]];
      refs.forEach(([kind, docId], itemIndex) => data.package_items.push({ id: `PI-${packageForCustomer(index)}-${itemIndex + 1}`, package_id: packageForCustomer(index), customer_id: customer.id, product_id: productId, kind, required: true, doc_id: docId, status: docId === null ? 'missing' : docId === 'DOC-DM1' ? 'outdated' : 'ready', ...(docId === 'DOC-DM1' ? { replacement_doc_id: 'DOC-DM2' } : {}) }));
    }
    const doctors = data.doctors.filter(d => d.customer_id === customer.id);
    if (doctors.length) for (let visitIndex = 0; visitIndex < 3; visitIndex++) {
      const doctor = doctors[visitIndex === 2 && doctors.length > 1 ? 1 : 0];
      const sourceCall = index > 4 && visitIndex === 2 ? data.calls.find(c => c.customer_id === customer.id && c.doctor_id === doctor.id) : null;
      data.visits.push({ id: `V${pad(data.visits.length + 1)}`, customer_id: customer.id, doctor_id: doctor.id, date: sourceCall?.date ?? ['2026-08-18', '2026-09-08', '2026-09-15'][visitIndex], product_id: productId, note: ['確認下次拜訪的文件版本與聯絡窗口。', '整理產品文件索引及附件需求。', '追蹤進藥包缺件，未承諾價格或醫療效果。'][visitIndex] + '（虛構紀錄）', source_call_id: sourceCall?.id ?? null, next_need: [infoId, dmId, packageForCustomer(index)] });
    }
    const price = data.products.find(p => p.id === productId)!.demo_price + (index % 3) * 10;
    const quoteId = `Q${pad(data.quotes.length + 1)}`;
    const docId = `DOC-${quoteId}`;
    addDocument(docId, `${customer.name.replace('示範', '')}歷史報價`, 'quote', `虛構議價紀錄：含稅單價 ${price}；退稅規則未提供，歷史價格不代表現行授權。`, productId, '2026-08-12', 'historical');
    data.quotes.push({ id: quoteId, customer_id: customer.id, product_id: productId, date: '2026-08-12', gross_unit_price: price, tax_note: '示範原單含稅；不拆算稅率', refund_note: '退稅及適用條件尚未確認', refund_amount: null, context: '虛構年度文件更新前的歷史議價紀錄', status: 'historical', source_doc: docId });
  }
  ['2026-02-10', '2026-04-16', '2026-07-08', '2026-08-25'].forEach((date, index) => {
    const id = `Q${pad(data.quotes.length + 1)}`, docId = `DOC-${id}`, price = [230, 225, 215, 205][index];
    addDocument(docId, `晨星產品 B ${date.slice(5, 7)}月報價`, 'quote', `虛構含稅單價 ${price}；退稅未提供，僅供歷史查閱。`, 'P-B', date, 'historical');
    data.quotes.push({ id, customer_id: 'C001', product_id: 'P-B', date, gross_unit_price: price, tax_note: '示範原單註記含稅，稅率未提供', refund_note: '示範退稅條件待確認', refund_amount: null, context: ['年度合作討論', '文件需求更新', '例行歷史議價', '附件整理與窗口確認'][index] + '（虛構情境）', status: 'historical', source_doc: docId });
  });
  return data;
}

export const demoData: DemoData = expandMockData(specificationData);

// UI state must use a clone/overrides, never mutate the shared baseline.
export function createDemoData(): DemoData { return structuredClone(demoData); }
