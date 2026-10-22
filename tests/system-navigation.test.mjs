import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSystemUrl, safeSystemReturnPath } from '../src/domain/systemNavigation.ts';
import { oaOperations, isOaTaskType, oaTypeForSop, oaTypeForTask } from '../src/domain/oaRules.ts';
import { parsePage, initialQuery, initialTasks, restoreDemo } from '../src/domain/demoState.ts';
import { taskUsesCrm } from '../src/domain/crmRules.ts';
import { demoData } from '../src/data/demo/demoData.ts';

test('OA SOP 情境沿用既有文件，CRM 與產品文件不被誤認為 OA 作業', () => {
  for (const [id, type, label] of [['DOC-S1', 'allowance', '折讓申請'], ['DOC-S2', 'product-discount', '產品折扣申請'], ['DOC-S4', 'overpayment', '溢收款證明']]) {
    assert.equal(oaTypeForSop(id), type);
    assert.equal(oaOperations[type].label, label);
    assert.equal(demoData.documents.find(doc => doc.id === id).type, 'sop');
  }
  for (const id of ['DOC-S3', 'DOC-S5', 'DOC-S6', 'DOC-S7', 'DOC-S8', 'DOC-DM2', 'DOC-HR', 'unknown']) assert.equal(oaTypeForSop(id), undefined);
});

test('OA 任務採明確類型或保存的來源，不從名稱推測；CRM 與 OA 可並存', () => {
  const task = initialTasks()[0];
  for (const [type, expected] of [['折讓申請', 'allowance'], ['產品折扣申請', 'product-discount'], ['溢收款證明', 'overpayment'], ['OA 行政作業', 'administration']]) {
    assert.equal(oaTypeForTask({ ...task, type }), expected);
  }
  assert.equal(oaTypeForTask({ ...task, name: '折讓申請', type: '其他' }), undefined);
  assert.equal(oaTypeForTask({ ...task, type: '訂單追蹤' }), undefined, '既有 SAP 訂單簽核不自動當作 OA');
  assert.equal(oaTypeForTask({ ...task, type: '其他', oaTaskType: 'allowance' }), undefined, '修改任務類型後不殘留舊流程');
  assert.equal(oaTypeForTask({ ...task, type: '__proto__' }), undefined);
  const mixed = { ...task, type: '查詢追蹤', crmRelated: true, oaTaskType: 'allowance' };
  const restored = restoreDemo(JSON.stringify({ version: 1, seedVersion: 2, query: initialQuery(), tasks: [mixed], recent: [] }));
  assert.equal(oaTypeForTask(restored.tasks[0]), 'allowance');
  assert.equal(taskUsesCrm(restored.tasks[0]), true);
  assert.equal(oaTypeForTask({ ...mixed, oaTaskType: 'unknown' }), undefined);
});

test('OA 模擬路由攜帶作業與可還原的來源；缺少或未知作業回一般首頁', () => {
  for (const [type, operation] of Object.entries(oaOperations)) {
    const origin = operation.sopId ? `#/F7?sop=${operation.sopId}` : '#/tasks';
    const url = buildSystemUrl('OA', '#/oa-demo', { taskType: type, returnPath: origin });
    assert.equal(parsePage(url), 'oa-demo');
    const params = new URLSearchParams(url.split('?')[1]);
    assert.equal(params.get('taskType'), type);
    assert.equal(params.get('return'), origin);
  }
  const generic = new URLSearchParams(buildSystemUrl('OA', '#/oa-demo').split('?')[1]);
  assert.equal(generic.has('taskType'), false);
  assert.equal(generic.get('return'), '#/home');
  for (const type of ['unknown', '__proto__', '', null]) assert.equal(isOaTaskType(type), false);
  assert.equal(new URLSearchParams(buildSystemUrl('OA', '#/oa-demo', { taskType: 'unknown' }).split('?')[1]).has('taskType'), false);
});

test('正式 OA 與既有 CRM 網址完全保留，不附加作業、來源或查詢資料', () => {
  const context = { taskType: 'overpayment', returnPath: '#/F7?sop=DOC-S4&customer=private&token=secret' };
  for (const url of ['https://oa.example.com/', 'https://oa.example.com/?lang=zh-TW#/portal', '#/enterprise-oa']) assert.equal(buildSystemUrl('OA', url, context), url);
  assert.equal(buildSystemUrl('CRM', '#/crm-demo', context), '#/crm-demo');
  assert.equal(buildSystemUrl('CRM', 'https://crm.example.com/', context), 'https://crm.example.com/');
});

test('返回路徑只允許內部白名單，移除額外參數並拒絕外部網址及注入', () => {
  assert.equal(safeSystemReturnPath('#/F7?sop=DOC-S2&token=secret&name=private'), '#/F7?sop=DOC-S2');
  assert.equal(safeSystemReturnPath('#/tasks?task=private'), '#/tasks');
  assert.equal(safeSystemReturnPath('#/knowledge'), '#/knowledge');
  assert.equal(safeSystemReturnPath('#/F7?sop=DOC-DM2'), '#/F7');
  for (const path of ['https://evil.example', '//evil.example', 'javascript:alert(1)', '/SalesBrain-ui/#/F7', '#/unknown', '#/F7/../../evil', null]) assert.equal(safeSystemReturnPath(path), '#/home');
  assert.equal(parsePage('#/oa-demo?taskType=allowance'), 'oa-demo');
});
