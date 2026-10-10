import test from 'node:test';
import assert from 'node:assert/strict';
import { demoData, createDemoData } from '../src/data/demo/demoData.ts';
import { features, featureGroups } from '../src/config/features.ts';
import { datasetCatalog } from '../src/data/demo/catalog.ts';
import { validateDemoData } from '../src/domain/validateDemoData.ts';
import { getCallKpi, getSalesSummary, compareSales, getOrderProgress, getPackageSummary, applyPackageReplacement,
  getProductTier, getHistoricalQuotes, createInitialDemoState, percentage, formatPercentage } from '../src/domain/demoRules.ts';

test('擴充樣本完整：D01–D15 紀錄數與所有 ID 關聯', () => {
  const counts = { users: 2, customers: 18, doctors: 25, calls: 29, products: 6, pms: 3, tiers: 12,
    sales: 52, targets: 2, orders: 62, approvals: 62, shipments: 57, invoices: 52, receipts: 42,
    quotes: 24, visits: 44, documents: 62, videos: 4, package_items: 90, qa_templates: 13, freshness: 4, glossary: 6 };
  for (const [table, count] of Object.entries(counts)) assert.equal(demoData[table].length, count, table);
  assert.deepEqual(validateDemoData(), []);
  assert.equal(demoData.documents.filter(d => ['hr', 'company'].includes(d.type)).length, 8);
  assert.equal(demoData.videos[0].asset_status, 'available');
  assert.equal(demoData.videos[0].media_type, 'animation', '依使用者允許提供圖文動畫，不冒充企業影片');
});
test('資料檢核能發現重複 ID、來源不存在與金額錯誤', () => {
  const data = createDemoData();
  data.sales[0].amount = 1;
  data.sales[1].invoice_id = 'missing';
  data.calls.push({ ...data.calls[0] });
  const issues = validateDemoData(data);
  assert.ok(issues.some(s => s.includes('CALL001')));
  assert.ok(issues.some(s => s.includes('SL001')));
  assert.ok(issues.some(s => s.includes('SL002')));
});
test('固定未來模擬日期、身份、資料更新時間與示範標記', () => {
  assert.equal(demoData.meta.snapshot_at, '2026-10-20T09:00:00+08:00');
  assert.equal(demoData.meta.current_month, '2026-10');
  assert.equal(demoData.meta.is_demo, true);
  assert.ok(demoData.customers.every(c => c.name.startsWith('示範')));
  assert.ok(demoData.pms.every(p => p.email.endsWith('@example.invalid')));
  assert.equal(demoData.freshness[1].source_updated_at, '2026-10-20T08:00:00+08:00');
  assert.equal(demoData.freshness[3].source_updated_at, null, '文件來源日期必須從各紀錄取得');
});
test('九個功能配置各三組，皆有資料集映射', () => {
  assert.equal(datasetCatalog.length, 15);
  assert.ok(features.every(f => f.datasets.every(id => datasetCatalog.some(d => d.id === id))));
  assert.equal(new Set(features.map(f => f.id)).size, 9);
  for (const group of featureGroups) assert.equal(features.filter(f => f.group === group.id).length, 3);
  assert.ok(features.every(f => f.datasets.length > 0));
  assert.ok(demoData.qa_templates.every(q => features.some(f => f.id === q.intent)));
});
test('Call 三種 KPI：29/48、25/48、9/18；超額不補別人的缺口', () => {
  const { totals, rows } = getCallKpi();
  assert.deepEqual([totals.actual, totals.required, totals.capped, totals.reached, totals.customers, totals.gap], [29, 48, 25, 9, 18, 23]);
  assert.deepEqual([totals.actualRate, totals.cappedRate, totals.reachedRate].map(formatPercentage), ['60.42%', '52.08%', '50.00%']);
  assert.equal(rows.find(r => r.customer.id === 'C004').capped, 2);
});
test('A 級且尚未 Call 有三位客戶，篩後摘要與明細一致', () => {
  const { rows, totals } = getCallKpi({ grade: 'A', status: 'zero' });
  assert.deepEqual(rows.map(r => [r.customer.id, r.actual, r.required, r.gap]), [['C001', 0, 4, 4], ['C006', 0, 4, 4], ['C007', 0, 4, 4]]);
  assert.equal(totals.customers, 3);
  assert.equal(totals.required, 12);
  assert.equal(getCallKpi({ status: 'unreached' }).rows.length, 9);
  assert.equal(getCallKpi({ status: 'reached' }).rows.length, 9);
});
test('Call 去重、不計無效／草稿／取消／未來日期／其他業務；歷史摘要不重算', () => {
  const data = createDemoData();
  data.calls.push({ ...data.calls[0] });
  for (const change of [{ id: 'invalid', valid: false }, { id: 'draft', status: 'draft' }, { id: 'cancelled', status: 'cancelled' },
    { id: 'future', date: '2026-10-21' }, { id: 'other', salesperson_id: 'S002' }]) data.calls.push({ ...data.calls[0], ...change });
  assert.equal(getCallKpi({}, data).totals.actual, 29);
  assert.equal(getCallKpi({}, data).rows[0].actual, 0);
});
test('缺規則、其他月份、零客戶不冒充 0% 達成率', () => {
  assert.equal(getCallKpi({ month: '2026-09' }).totals, null);
  assert.equal(getCallKpi({ customerId: 'C999' }).totals.actualRate, null);
  const data = createDemoData();
  delete data.meta.rules.A;
  assert.equal(getCallKpi({}, data).availability, 'missing-rules');
  assert.equal(percentage(0, 0), null);
});
test('擴充銷售採已請款口徑，兩個月均有整體目標', () => {
  const october = getSalesSummary();
  assert.deepEqual([october.rows.length, october.amount, october.quantity, october.target], [28, 100590, 911, 180000]);
  assert.equal(formatPercentage(october.attainment), '55.88%');
  const september = getSalesSummary({ month: '2026-09' });
  assert.deepEqual([september.amount, september.quantity, september.target], [96650, 825, 170000]);
  assert.equal(formatPercentage(september.attainment), '56.85%');
  assert.ok(october.rows.every(s => !['O007', 'O008'].includes(s.order_id)));
});
test('六產品兩月比較，B 篩選五筆 132 盒，客戶篩選不借用整體目標', () => {
  assert.deepEqual(compareSales().map(r => [r.previous.quantity, r.current.quantity, formatPercentage(r.change)]), [[163, 189, '15.95%'], [164, 132, '-19.51%'], [165, 183, '10.91%'], [126, 114, '-9.52%'], [111, 153, '37.84%'], [96, 140, '45.83%']]);
  const b = getSalesSummary({ productId: 'P-B' });
  assert.deepEqual([b.rows.length, b.quantity, b.amount, b.target], [5, 132, 26400, null]);
  assert.equal(getSalesSummary({ productId: 'P-B', customerId: 'C001' }).quantity, 48);
  assert.equal(compareSales({ customerId: 'C005' })[0].change, null);
  assert.equal(getSalesSummary({ productId: 'P-Z' }).rows.length, 0);
});
test('O007 四段：主管覆核、未出貨、未請款、未收款，沒有承諾日期', () => {
  const result = getOrderProgress('O007');
  assert.deepEqual(Object.values(result.stages), ['主管覆核中', '尚未出貨', '尚未請款', '尚未收款']);
  assert.equal(result.order.block_reason, '示範價格條件覆核中');
  assert.equal(result.approvals[0].updated_at, '2026-10-20T08:45:00+08:00');
  assert.equal(result.outstanding, null);
});
test('O003 已出貨／已請款／未收款，餘額 6000，11/06 到期未逾期', () => {
  const r = getOrderProgress('O003');
  assert.deepEqual(Object.values(r.stages), ['已核准', '已出貨', '已請款', '尚未收款']);
  assert.deepEqual([r.outstanding, r.overdue, r.invoices[0].due_date], [6000, false, '2026-11-06']);
});
test('O008 已出貨未請款；O999 查無，來源不可用顯示未知', () => {
  assert.deepEqual(Object.values(getOrderProgress('O008').stages), ['已核准', '已出貨', '尚未請款', '尚未收款']);
  assert.equal(getOrderProgress('O999'), null);
  const r = getOrderProgress('O003', demoData, { shipments: false, receipts: false });
  assert.equal(r.stages.shipment, '未知');
  assert.equal(r.stages.receipt, '未知');
  assert.equal(r.overdue, null);
  assert.equal(r.outstanding, null);
});
test('四階段部分數量與多筆收款依獨立紀錄計算', () => {
  const data = createDemoData();
  data.shipments.find(s => s.order_id === 'O003').quantity = 10;
  data.receipts.push({ id: 'partial1', invoice_id: 'INV003', date: '2026-10-10', amount: 1000 },
    { id: 'partial2', invoice_id: 'INV003', date: '2026-10-11', amount: 2000 });
  const r = getOrderProgress('O003', data);
  assert.equal(r.stages.shipment, '部分出貨');
  assert.equal(r.stages.receipt, '部分收款');
  assert.equal(r.outstanding, 3000);
});
test('擴充本月訂單／實際出貨／請款／收款可以對帳', () => {
  const current = demoData.orders.filter(o => o.created_at.startsWith('2026-10'));
  const sum = xs => xs.reduce((n, x) => n + x.amount, 0);
  assert.equal(sum(current), 132090);
  assert.equal(current.reduce((n, o) => n + getOrderProgress(o.id).shipments.reduce((quantity, shipment) => quantity + shipment.quantity, 0) * o.amount / o.quantity, 0), 107840);
  assert.equal(current.reduce((n, o) => n + getOrderProgress(o.id).invoiced, 0), 100590);
  assert.equal(current.reduce((n, o) => n + getOrderProgress(o.id).received, 0), 51225);
  assert.equal(current.reduce((n, o) => n + (getOrderProgress(o.id).outstanding ?? 0), 0), 49365);
});
test('晨星產品 B 七筆報價按日期排序，歷史值保留、退稅仍未知', () => {
  const quotes = getHistoricalQuotes('C001', 'P-B');
  assert.deepEqual(quotes.map(q => q.id), ['Q002', 'Q024', 'Q003', 'Q023', 'Q001', 'Q022', 'Q021']);
  assert.deepEqual(getHistoricalQuotes('C001', 'P-B', true).map(q => q.gross_unit_price), [230, 225, 220, 215, 200, 205, 200]);
  assert.equal(getHistoricalQuotes('', '').length, 24);
  assert.ok(quotes.every(q => q.refund_amount === null));
  assert.equal(getHistoricalQuotes('C001', 'P-A').length, 0);
});
test('梯隊缺年度必須補問，B 在 2025 第一、2026 第二；未知產品不猜', () => {
  assert.equal(getProductTier('P-B').status, 'year-required');
  assert.equal(getProductTier('P-B', 2025).tier.tier, '第一梯隊');
  assert.equal(getProductTier('P-B', 2026).tier.tier, '第二梯隊');
  assert.equal(getProductTier('P-B', 2024).status, 'not-found');
  assert.equal(getProductTier('P-Z').status, 'not-found');
});
test('進藥包 60%→80%，仍缺營業證明；原始資料不變', () => {
  const initial = getPackageSummary('PK01');
  assert.deepEqual([initial.ready, initial.total, initial.completeness, initial.complete], [3, 5, 60, false]);
  const overrides = applyPackageReplacement('PI05');
  const updated = getPackageSummary('PK01', overrides);
  assert.deepEqual([updated.ready, updated.total, updated.completeness, updated.complete], [4, 5, 80, false]);
  assert.equal(updated.missing[0].item.kind, '營業證明');
  assert.equal(updated.outdated.length, 0);
  assert.equal(demoData.package_items[4].doc_id, 'DOC-DM1');
  assert.equal(getPackageSummary('PK01').completeness, 60);
});
test('任意勾選或錯誤文件不能補齊缺件；缺清單不顯示全部完成', () => {
  assert.equal(getPackageSummary('PK01', { PI02: 'DOC-QUAL', PI05: 'DOC-HR' }).completeness, 60);
  assert.throws(() => applyPackageReplacement('PI02'), /有效新版/);
  assert.equal(getPackageSummary('PK99').complete, false);
  assert.equal(getPackageSummary('PK99').completeness, null);
});
test('重置工廠還原月份與 PK01 初始狀態，各次狀態互不影響', () => {
  const state = createInitialDemoState();
  state.selectedMonth = '2026-09'; state.selectedYear = 2025;
  state.packageOverrides = applyPackageReplacement('PI05');
  const reset = createInitialDemoState();
  assert.equal(reset.selectedMonth, '2026-10');
  assert.equal(reset.selectedYear, null);
  assert.equal(getPackageSummary('PK01', reset.packageOverrides).completeness, 60);
  assert.notEqual(reset.packageOverrides, state.packageOverrides);
  const clone = createDemoData(); clone.customers[0].name = 'changed';
  assert.equal(demoData.customers[0].name, '示範晨星醫院');
});

test('每位客戶有交易、報價與進藥包，擴充訂單包含部分出貨與逾期未收款', () => {
  for (const customer of demoData.customers) {
    for (const month of ['2026-09', '2026-10']) assert.ok(getSalesSummary({ customerId: customer.id, month }).rows.length > 0, `${customer.id} ${month}`);
    assert.ok(demoData.quotes.some(q => q.customer_id === customer.id), customer.id);
    assert.equal(demoData.package_items.filter(item => item.customer_id === customer.id).length, 5);
  }
  const progress = demoData.orders.map(order => getOrderProgress(order.id));
  assert.ok(progress.some(order => order.stages.shipment === '部分出貨'));
  assert.ok(progress.some(order => order.stages.receipt === '部分收款'));
  assert.ok(progress.some(order => order.overdue === true));
  assert.equal(demoData.documents.filter(doc => doc.type === 'sop').length, 8);
});

test('不同客戶的進藥包替換互不影響，完整與缺件狀態都有示範', () => {
  assert.equal(getPackageSummary('PK02').completeness, 80);
  const overrides = applyPackageReplacement('PI-PK02-5');
  assert.equal(getPackageSummary('PK02', overrides).completeness, 100);
  assert.equal(getPackageSummary('PK01', overrides).completeness, 60);
  assert.equal(getPackageSummary('PK03').complete, true);
  assert.equal(getPackageSummary('PK04').missing[0].item.kind, '營業證明');
});
