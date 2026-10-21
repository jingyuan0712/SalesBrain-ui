import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { demoData } from '../src/data/demo/demoData.ts';
import { initialQuery, initialTasks, parsePage, restoreDemo } from '../src/domain/demoState.ts';
import { routeDemoQuestion, answerDemo, demoQuestions } from '../src/domain/demoAgent.ts';
import { findProducts, searchProducts, productDetailRoute, routeProductId } from '../src/domain/productLookup.ts';
import { crmFeatures, taskUsesCrm } from '../src/domain/crmRules.ts';

test('CRM 來源與任務保存：拜訪、資料更新及 AI CRM 查詢保留入口，文件任務不顯示', () => {
  assert.deepEqual(crmFeatures, ['F1', 'F2', 'F3', 'F5']);
  const task = initialTasks()[0];
  assert.equal(taskUsesCrm(task), true);
  assert.equal(taskUsesCrm({ ...task, type: '資料更新' }), true);
  assert.equal(taskUsesCrm({ ...task, type: '訂單追蹤' }), true);
  assert.equal(taskUsesCrm({ ...task, type: '文件準備' }), false);
  const crmTask = { ...task, type: '查詢追蹤', crmRelated: true };
  const saved = restoreDemo(JSON.stringify({ version: 1, seedVersion: 2, query: initialQuery(), tasks: [crmTask], recent: [] }));
  assert.equal(taskUsesCrm(saved.tasks[0]), true);
  assert.equal(taskUsesCrm({ ...crmTask, crmRelated: false }), false);
});

test('產品自然語句、別名、全形與編號均使用共用產品資料', () => {
  const cases = [
    ['A產品', 'P-A'], ['A 產品', 'P-A'], ['產品A', 'P-A'], ['產品 A', 'P-A'], ['P-A', 'P-A'],
    ['查詢 A 產品', 'P-A'], ['我要看 A 產品資訊', 'P-A'], ['A 產品的製編是什麼？', 'P-A'],
    ['A產品DM', 'P-A'], ['A產品教育訓練', 'P-A'], ['幫我找產品 B 的介紹', 'P-B'],
    ['產品 C 有哪些相關文件？', 'P-C'], ['C產品教育訓練', 'P-C'], ['ａ　產品', 'P-A'],
    ['M26002', 'P-B'], ['FG-C01', 'P-C'], ['產品 B 的製編和 PM 是誰？', 'P-B'],
  ];
  for (const [question, id] of cases) {
    const answer = routeDemoQuestion(question, { ...initialQuery(), selectedProductId: 'P-F' });
    const product = demoData.products.find(p => p.id === id);
    assert.equal(answer.intent, 'product_info', question);
    assert.equal(answer.patch.selectedProductId, id, question);
    assert.equal(answer.special, undefined, question);
    assert.deepEqual(answer.required, [], question);
    assert.ok(answer.text.includes(product.description), question);
    assert.ok(answer.text.includes(product.material_no), question);
    assert.ok(answer.text.includes(product.manufacturing_no), question);
    assert.ok(answer.sources.includes(`documents:${product.dm.document_id}`));
  }
  assert.equal(searchProducts('A產品')[0].id, 'P-A');
  assert.equal(searchProducts('產品　b')[0].id, 'P-B');
});

test('產品未指定、未知、多產品不套用前次產品，也不將 A 級或英文片段當產品', () => {
  const state = { ...initialQuery(), selectedProductId: 'P-B' };
  for (const q of ['產品資訊', '請幫我查產品介紹', '產品 DM', '產品教育訓練', '產品 A 和產品 B 的介紹']) {
    const answer = routeDemoQuestion(q, state);
    assert.equal(answer.intent, 'product_info', q);
    assert.equal(answer.patch.selectedProductId, '', q);
    assert.deepEqual(answer.required, ['product'], q);
    const completed = answerDemo({ ...answer, required: [] }, { ...state, selectedProductId: 'P-C' });
    assert.ok(completed.text.includes('M26003'));
  }
  for (const q of ['產品 Z', 'Z產品DM', 'P-AB', '產品 XYZ', '產品 X999 資訊']) {
    const answer = routeDemoQuestion(q, state);
    assert.equal(answer.intent, 'product_info', q);
    assert.equal(answer.special, 'unknown-product', q);
    assert.equal(answer.patch.selectedProductId, '', q);
    assert.match(answer.text, /查無此產品/, q);
  }
  for (const q of ['A 級客戶還沒 Call', 'B 級 Call KPI', 'SAP', 'ABC', 'P-AB']) assert.deepEqual(findProducts(q), [], q);
});

test('既有業務意圖優先，產品資訊不攔截 Call、交易、梯隊、SOP 與進藥包', () => {
  for (const [q, feature] of [
    ['A 級客戶還沒 Call', 'F1'], ['本月產品 A 的銷售', 'F2'], ['產品 B 異常訂單', 'F3'],
    ['晨星產品 B 報價', 'F4'], ['拜訪林醫師', 'F5'], ['產品 A 2026 梯隊', 'F6'],
    ['產品 B 折扣 SOP', 'F7'], ['公司簡介', 'F8'], ['晨星產品 B 進藥包', 'F9'],
  ]) {
    const answer = routeDemoQuestion(q, initialQuery());
    assert.equal(answer.feature, feature, q);
    assert.equal(answer.intent, undefined, q);
  }
});

test('六產品保留原主檔、有效 DM 關聯、訓練路由與可還原的產品深連結', () => {
  for (const product of demoData.products) {
    assert.ok(product.aliases.length);
    assert.ok(product.description);
    assert.ok(product.category);
    const dm = demoData.documents.find(doc => doc.id === product.dm.document_id);
    assert.equal(dm.product_id, product.id);
    assert.equal(dm.status, 'current');
    assert.equal(product.dm.is_demo, true);
    assert.equal(product.training.is_demo, true);
    assert.equal(parsePage(product.training.url), 'training');
    assert.equal(routeProductId(product.training.url), product.id);
    assert.equal(parsePage(productDetailRoute(product.id)), 'F6');
    assert.equal(routeProductId(productDetailRoute(product.id)), product.id);
  }
  assert.equal(demoData.products[1].dm.document_id, 'DOC-DM2');
  assert.equal(demoData.products[2].pm_id, 'PM01');
  assert.equal(parsePage('#/crm-demo'), 'crm-demo');
  assert.equal(routeProductId('#/training'), null);
});

test('首頁九個示範句路由到對應功能並提供來源', () => {
  const expected = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9'];
  demoQuestions.forEach((question, i) => {
    const answer = routeDemoQuestion(question, initialQuery());
    assert.equal(answer.feature, expected[i], question);
    assert.equal(answer.required.length, 0, question);
    assert.ok(answer.sources.length > 0, question);
  });
});
test('Call 問句實際查出晨星 0/4 並帶入篩選，不保留舊等級', () => {
  const answer = routeDemoQuestion(demoQuestions[0], { ...initialQuery(), grade: 'B', selectedCustomerId: 'C004' });
  assert.equal(answer.patch.grade, 'A'); assert.equal(answer.patch.callStatus, 'zero');
  assert.equal(answer.patch.selectedCustomerId, ''); assert.match(answer.text, /C001/); assert.match(answer.text, /0／4/);
  assert.equal(routeDemoQuestion('本月 Call KPI', { ...initialQuery(), grade: 'B' }).patch.grade, '');
});
test('銷售比較清除舊客戶產品篩選，顯示擴充資料計算值', () => {
  const a = routeDemoQuestion(demoQuestions[1], { ...initialQuery(), selectedCustomerId: 'C001', selectedProductId: 'P-B' });
  assert.equal(a.patch.selectedProductId, ''); assert.equal(a.patch.selectedCustomerId, '');
  assert.match(a.text, /100,590/); assert.match(a.text, /55.88%/); assert.match(a.text, /-19.51%/); assert.match(a.text, /期間不等長/);
});
test('訂單帶入實際客戶產品，O003 未收款不冒充未出貨', () => {
  const a = routeDemoQuestion('O003 收款了嗎？', initialQuery());
  assert.equal(a.patch.selectedCustomerId, 'C001'); assert.equal(a.patch.selectedProductId, 'P-B');
  assert.match(a.text, /已出貨/); assert.match(a.text, /尚未收款/); assert.match(a.text, /未逾期/);
  assert.match(routeDemoQuestion('O999 訂單卡在哪', initialQuery()).text, /查無/);
});
test('報價、退稅問答保留原價與未知提示', () => {
  const state = { ...initialQuery(), selectedCustomerId: 'C001', selectedProductId: 'P-B' };
  const quote = routeDemoQuestion(demoQuestions[3], state);
  assert.match(quote.text, /220/); assert.match(quote.text, /200/); assert.match(quote.text, /不代表現行有效價格/);
  const refund = routeDemoQuestion('退稅後單價是多少？', state);
  assert.match(refund.text, /無法計算/); assert.doesNotMatch(refund.text, /0 元|退稅後.*180/);
});
test('缺客戶產品月份使用補問，未偷偷選年度', () => {
  assert.deepEqual(routeDemoQuestion('歷史報價', initialQuery()).required, ['customer', 'product']);
  assert.deepEqual(routeDemoQuestion('銷售業績', initialQuery()).required, ['month']);
  const state = { ...initialQuery(), selectedProductId: 'P-B', selectedYear: 2025 };
  const tier = routeDemoQuestion('產品 B 哪個梯隊？', state);
  assert.equal(tier.patch.selectedYear, null); assert.deepEqual(tier.required, ['year']);
  const answer = answerDemo({ ...tier, required: [] }, { ...state, selectedYear: 2026 });
  assert.match(answer.text, /第二梯隊/);
});
test('拜訪林醫師按既有 V001 關聯解析 C001/P-B，不生成療效', () => {
  const a = routeDemoQuestion(demoQuestions[4], initialQuery());
  assert.equal(a.patch.selectedCustomerId, 'C001'); assert.equal(a.patch.selectedProductId, 'P-B');
  assert.equal(a.patch.selectedDoctorId, 'DR001'); assert.match(a.text, /V001/); assert.match(a.text, /未提供可引用/);
});
test('客戶編號問題不會被前次產品查詢覆蓋', () => {
  const a = routeDemoQuestion('晨星客戶編號？', { ...initialQuery(), selectedProductId: 'P-B' });
  assert.equal(a.patch.selectedProductId, ''); assert.match(a.text, /客戶編號 C001/); assert.doesNotMatch(a.text, /M26002/);
});
test('溢收款證明屬 SOP，不誤判為訂單收款', () => {
  const a = routeDemoQuestion('溢收款證明怎麼做？', initialQuery());
  assert.equal(a.feature, 'F7'); assert.equal(a.patch.sopId, 'DOC-S4');
});
test('未知產品、未知人物、未支持問題不套其他客戶答案', () => {
  const unknown = routeDemoQuestion('查產品 Z', initialQuery());
  assert.match(unknown.text, /查無此產品/);
  assert.equal(unknown.patch.selectedProductId, '', '未知產品不污染下一次拜訪查詢條件');
  const state = { ...initialQuery(), selectedCustomerId: 'C001', selectedProductId: 'P-B', selectedDoctorId: 'DR001' };
  assert.match(routeDemoQuestion('拜訪王醫師需要什麼？', state).text, /沒有此客戶或醫師/);
  assert.match(routeDemoQuestion('拜訪臺北長安醫院需要什麼？', state).text, /沒有此客戶或醫師/);
  assert.equal(routeDemoQuestion('產品 B 劑量是多少？', state).feature, null);
  assert.equal(routeDemoQuestion('明天天氣如何？', state).feature, null);
});
test('福利未提供金額不編造，HR 文件可追溯', () => {
  const a = routeDemoQuestion('新人補助金額多少？', initialQuery());
  assert.equal(a.feature, 'F8'); assert.match(a.text, /沒有可確認/); assert.match(a.sources[0], /DOC-HR/);
});
test('進藥包 AI 每次讀取目前 override，與卡片 60/80 同步', () => {
  const state = { ...initialQuery(), selectedCustomerId: 'C001', selectedProductId: 'P-B' };
  const a = routeDemoQuestion(demoQuestions[8], state);
  assert.match(a.text, /60.00%/); assert.match(a.text, /舊版/);
  const b = answerDemo(a, { ...state, packageOverrides: { PI05: 'DOC-DM2' } });
  assert.match(b.text, /80.00%/); assert.match(b.text, /營業證明/); assert.doesNotMatch(b.text, /舊版/);
});
test('Hash 路由可恢復非首頁，移除的 cases 路由回首頁', () => {
  assert.equal(parsePage('#/F9'), 'F9'); assert.equal(parsePage('#/knowledge'), 'knowledge');
  assert.equal(parsePage('#/cases'), 'home'); assert.equal(parsePage('#/unknown'), 'home');
});
test('localStorage 還原、安全回退與 reset 狀態', () => {
  const saved = { version: 1, seedVersion: 2, query: { ...initialQuery(), selectedCustomerId: 'C001', selectedProductId: 'P-B', selectedYear: 2026, packageOverrides: { PI05: 'DOC-DM2' } }, tasks: initialTasks(), recent: [] };
  const restored = restoreDemo(JSON.stringify(saved));
  assert.equal(restored.query.selectedYear, 2026); assert.equal(restored.query.packageOverrides.PI05, 'DOC-DM2');
  assert.deepEqual(restoreDemo('invalid').query, initialQuery());
  assert.deepEqual(restoreDemo(JSON.stringify({ ...saved, version: 0 })).query, initialQuery());
  const broken = restoreDemo(JSON.stringify({ ...saved, query: { selectedProductId: 'P-Z', selectedCustomerId: 'C999', selectedYear: 2099, packageOverrides: { PI02: 'DOC-QUAL' } }, tasks: [{ invalid: true }] }));
  assert.equal(broken.query.selectedProductId, ''); assert.equal(broken.query.selectedYear, null); assert.equal(broken.tasks.length, 0);
});
test('所有文件實際資產、教學動畫路徑與標記皆存在', () => {
  for (const doc of demoData.documents) {
    const text = fs.readFileSync(`public/${doc.asset_path}`, 'utf8');
    assert.match(text, /虛構示範文件/); assert.ok(text.includes(doc.id)); assert.ok(text.includes(doc.version));
  }
  for (const video of demoData.videos) {
    const tutorial = fs.readFileSync(`public/${video.asset_path}`, 'utf8');
    assert.match(tutorial, /播放教學/); assert.match(tutorial, /暫停教學/); assert.match(tutorial, /非企業 OA/);
    assert.ok(tutorial.includes(video.doc_id));
  }
});

test('舊任務只補入一次擴充樣本，保留編輯與查詢；新版保存不補回已刪任務', () => {
  const edited = { ...initialTasks()[0], name: '使用者已編輯的任務' };
  const saved = { version: 1, query: initialQuery(), tasks: [edited], recent: [] };
  const migrated = restoreDemo(JSON.stringify(saved));
  assert.equal(migrated.tasks.length, 9);
  assert.equal(migrated.tasks[0].name, '使用者已編輯的任務');
  assert.equal(migrated.tasks.some(task => task.id === 'TASK02'), false);
  const deleted = migrated.tasks.filter(task => task.id !== 'TASK03');
  assert.equal(restoreDemo(JSON.stringify({ ...saved, seedVersion: 2, tasks: deleted })).tasks.length, 8);
});

test('新增產品、醫師與清單可由 AI 查詢，SOP 與各包替換可還原', () => {
  assert.equal(routeDemoQuestion('查產品 D', initialQuery()).patch.selectedProductId, 'P-D');
  assert.match(routeDemoQuestion('查產品 D', initialQuery()).text, /M26004/);
  const doctor = routeDemoQuestion('拜訪示範許醫師要準備什麼？', initialQuery());
  assert.equal(doctor.patch.selectedCustomerId, 'C006'); assert.match(doctor.text, /DOC-P-F-INFO/);
  const restored = restoreDemo(JSON.stringify({ version: 1, seedVersion: 2, query: { ...initialQuery(), sopId: 'DOC-S6', packageOverrides: { 'PI-PK02-5': 'DOC-DM2', 'PI-PK04-2': 'DOC-BIZ' } }, tasks: [], recent: [] }));
  assert.equal(restored.query.sopId, 'DOC-S6');
  assert.deepEqual(restored.query.packageOverrides, { 'PI-PK02-5': 'DOC-DM2' });
  const answer = routeDemoQuestion('青禾醫院產品 B 進藥包齊了嗎？', { ...initialQuery(), packageOverrides: restored.query.packageOverrides });
  assert.match(answer.text, /100.00%/); assert.equal(answer.sources[0], 'package_items:PK02');
});
