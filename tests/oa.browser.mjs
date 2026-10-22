// Run against npm run preview; see docs/oa-delivery.md for the optional browser setup.
import assert from 'node:assert/strict';
import fs from 'node:fs';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || '../.tools/browser/node_modules/playwright-core/index.mjs');
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:4176/SalesBrain-ui/';
const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_PATH ? { executablePath: process.env.BROWSER_PATH } : {}) });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const errors = [], failures = [];
context.on('page', page => {
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('response', response => { if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`); });
});
const page = await context.newPage();
page.setDefaultTimeout(10000);
async function openOa(link, type, label, returnPath) {
  assert.equal(await link.getAttribute('target'), '_blank');
  assert.equal(await link.getAttribute('rel'), 'noopener noreferrer');
  const [popup] = await Promise.all([context.waitForEvent('page'), link.click()]);
  await popup.getByRole('heading', { name: 'OA 行政作業系統', exact: true }).waitFor();
  await popup.getByRole('heading', { name: `目前作業：${label}`, exact: true }).waitFor();
  assert.equal(await popup.evaluate(() => window.opener === null), true);
  assert.ok(popup.url().startsWith(`${base}#/oa-demo?`));
  const params = new URLSearchParams(new URL(popup.url()).hash.split('?')[1]);
  assert.equal(params.get('taskType'), type);
  assert.equal(params.get('return'), returnPath);
  assert.deepEqual([...params.keys()].sort(), ['return', 'taskType']);
  await popup.reload();
  await popup.getByRole('heading', { name: `目前作業：${label}`, exact: true }).waitFor();
  return popup;
}
try {
  for (const [id, type, label, title] of [
    ['DOC-S1', 'allowance', '折讓申請', '示範折讓作業手冊'],
    ['DOC-S2', 'product-discount', '產品折扣申請', '示範產品折扣指引'],
    ['DOC-S4', 'overpayment', '溢收款證明', '示範溢收款證明指引'],
  ]) {
    await page.goto(`${base}#/F7?sop=${id}`);
    await page.getByRole('heading', { name: title, exact: true }).waitFor();
    const popup = await openOa(page.getByRole('link', { name: '前往 OA 系統' }), type, label, `#/F7?sop=${id}`);
    const oaUrl = popup.url();
    // A different selection saved by another tab must not replace the source SOP.
    await page.getByRole('button', { name: 'CRM 使用手冊', exact: true }).click();
    await popup.getByRole('link', { name: '查看原作業說明', exact: true }).click();
    await popup.getByRole('heading', { name: title, exact: true }).waitFor();
    assert.equal(new URL(popup.url()).hash, `#/F7?sop=${id}`);
    await popup.goto(oaUrl);
    await popup.getByRole('link', { name: '返回 SalesBrain', exact: true }).click();
    await popup.getByRole('heading', { name: title, exact: true }).waitFor();
    await popup.reload();
    await popup.getByRole('heading', { name: title, exact: true }).waitFor();
    await popup.close();
  }
  for (const id of ['DOC-S3', 'DOC-S5', 'DOC-S6', 'DOC-S7', 'DOC-S8']) {
    await page.goto(`${base}#/F7?sop=${id}`);
    await page.locator('.sop-steps').waitFor();
    assert.equal(await page.getByRole('link', { name: '前往 OA 系統' }).count(), 0, id);
    if (['DOC-S3', 'DOC-S5'].includes(id)) assert.equal(await page.getByRole('link', { name: '前往 CRM 系統' }).count(), 1);
  }
  // Knowledge preview has the same workflow link, but returns to the knowledge page.
  await page.goto(`${base}#/knowledge`);
  await page.getByPlaceholder('文件名稱、ID 或內容…').fill('DOC-S4');
  await page.getByRole('button', { name: '預覽', exact: true }).click();
  const docPopup = await openOa(page.getByRole('dialog').getByRole('link', { name: '前往 OA 系統' }), 'overpayment', '溢收款證明', '#/knowledge');
  await docPopup.getByRole('link', { name: '返回 SalesBrain', exact: true }).click();
  await docPopup.getByRole('heading', { name: '知識庫', exact: true }).waitFor();
  await docPopup.close();
  await page.keyboard.press('Escape');

  await page.goto(`${base}#/home`);
  assert.equal(await page.getByRole('link', { name: '前往 OA 系統' }).count(), 0);
  await page.getByRole('textbox', { name: '輸入工作需求' }).fill('產品折扣申請要怎麼做？');
  await page.getByRole('button', { name: '送出查詢' }).click();
  await page.locator('.agent-result h2').waitFor();
  const aiPopup = await openOa(page.locator('.agent-result').getByRole('link', { name: '前往 OA 系統' }), 'product-discount', '產品折扣申請', '#/home');
  await aiPopup.close();
  await page.getByRole('button', { name: '儲存為任務', exact: true }).click();
  await page.goto(`${base}#/tasks`); await page.reload();
  await page.getByRole('button', { name: '產品折扣申請要怎麼做？', exact: true }).click();
  const savedPopup = await openOa(page.getByRole('dialog').getByRole('link', { name: '前往 OA 系統' }), 'product-discount', '產品折扣申請', '#/tasks');
  await savedPopup.close(); await page.keyboard.press('Escape');
  await page.getByRole('button', { name: '新增任務', exact: true }).click();
  await page.getByLabel('任務名稱（必填）').fill('OA 驗收任務');
  await page.getByLabel('任務類型', { exact: true }).selectOption('OA 行政作業');
  await page.getByRole('button', { name: '儲存任務', exact: true }).click();
  await page.getByRole('button', { name: 'OA 驗收任務', exact: true }).click();
  const taskPopup = await openOa(page.getByRole('dialog').getByRole('link', { name: '前往 OA 系統' }), 'administration', '行政作業處理', '#/tasks');
  await taskPopup.getByRole('link', { name: '返回 SalesBrain', exact: true }).click();
  await taskPopup.getByRole('heading', { name: '我的任務', exact: true }).waitFor();
  await taskPopup.close(); await page.keyboard.press('Escape');

  // Explicit mixed provenance can show both systems, with identical shared styling.
  await page.evaluate(() => {
    const saved = JSON.parse(localStorage.getItem('salesbrain-demo-v1'));
    saved.tasks.unshift({ id: 'OA-MIXED-TEST', name: 'OA 與 CRM 混合作業', customer: '', type: '查詢追蹤', createdAt: '2026-10-20', dueDate: '', status: 'pending', priority: 'medium', crmRelated: true, oaTaskType: 'allowance' });
    localStorage.setItem('salesbrain-demo-v1', JSON.stringify(saved));
  });
  await page.reload();
  await page.getByRole('button', { name: 'OA 與 CRM 混合作業', exact: true }).click();
  const dialog = page.getByRole('dialog');
  const crm = dialog.getByRole('link', { name: '前往 CRM 系統' });
  const oa = dialog.getByRole('link', { name: '前往 OA 系統' });
  assert.equal(await crm.getAttribute('class'), await oa.getAttribute('class'));
  const [crmPopup] = await Promise.all([context.waitForEvent('page'), crm.click()]);
  await crmPopup.getByRole('heading', { name: 'CRM 系統（Demo 模擬畫面）', exact: true }).waitFor();
  await crmPopup.close(); await page.keyboard.press('Escape');
  for (const route of ['F1', 'F2', 'F3', 'F4', 'F5', 'F6?product=P-A', 'F8', 'F9', 'customers', 'settings']) {
    await page.goto(`${base}#/${route}`);
    await page.locator('h1').waitFor();
    assert.equal(await page.getByRole('link', { name: '前往 OA 系統' }).count(), 0, route);
  }
  for (const hash of ['#/oa-demo', '#/oa-demo?taskType=unknown&return=https%3A%2F%2Fevil.example', '#/oa-demo?taskType=__proto__']) {
    await page.goto(`${base}${hash}`);
    await page.getByRole('heading', { name: '目前作業：一般 OA 首頁（未指定作業）', exact: true }).waitFor();
    assert.equal(await page.getByRole('link', { name: '返回 SalesBrain', exact: true }).getAttribute('href'), '/SalesBrain-ui/#/home');
  }
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const [stage, hash] of [['sop', '#/F7?sop=DOC-S1'], ['oa', '#/oa-demo?taskType=allowance&return=%23%2FF7%3Fsop%3DDOC-S1']]) {
      await page.goto(`${base}${hash}`); await page.locator('h1').waitFor();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, `${stage} ${width}px overflow`);
      if (process.env.SCREENSHOT_DIR) {
        fs.mkdirSync(process.env.SCREENSHOT_DIR, { recursive: true });
        await page.screenshot({ path: `${process.env.SCREENSHOT_DIR}/${stage}-${width}.png`, fullPage: true });
      }
    }
  }
  await page.getByRole('button', { name: '開啟完整導覽選單' }).click();
  await page.getByRole('navigation', { name: '完整頁面導覽' }).getByRole('button', { name: '常用功能', exact: true }).click();
  await page.getByRole('heading', { name: '常用功能', exact: true }).waitFor();
  assert.deepEqual(errors, [], 'console/page errors');
  assert.deepEqual(failures, [], 'HTTP failures');
  console.log('PASS: OA three SOP workflows, preview, saved AI/task contexts, mixed CRM, new tabs/refresh/returns, generic fallback, safe return, desktop/mobile, no console or HTTP errors.');
} finally { await browser.close(); }
