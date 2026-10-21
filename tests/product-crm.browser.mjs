// Optional real-browser acceptance check. See docs/product-crm-delivery.md for setup.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { demoData } from '../src/data/demo/demoData.ts';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || '../.tools/browser/node_modules/playwright-core/index.mjs');
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:4175/SalesBrain-ui/';
const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_PATH ? { executablePath: process.env.BROWSER_PATH } : {}) });
const errors = [];
const failures = [];
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
context.on('page', page => {
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('response', response => { if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`); });
});
const page = await context.newPage();
page.setDefaultTimeout(10000);
async function home() {
  await page.goto(`${base}#/home`);
  await page.getByRole('heading', { name: '今天要完成什麼？' }).waitFor();
}
async function send(question) {
  await page.getByRole('textbox', { name: '輸入工作需求' }).fill(question);
  await page.getByRole('button', { name: '送出查詢' }).click();
  await page.locator('.agent-result h2').waitFor();
}
async function popupFrom(link, heading) {
  assert.equal(await link.getAttribute('target'), '_blank');
  assert.match(await link.getAttribute('rel'), /noopener/);
  assert.match(await link.getAttribute('rel'), /noreferrer/);
  const [popup] = await Promise.all([context.waitForEvent('page'), link.click()]);
  await popup.getByRole('heading', { name: heading, exact: true }).waitFor();
  assert.equal(await popup.evaluate(() => window.opener === null), true);
  await popup.reload();
  await popup.getByRole('heading', { name: heading, exact: true }).waitFor();
  await popup.close();
}
try {
  for (const [letter, question] of [['A', 'A產品'], ['B', '產品 B 的介紹'], ['C', 'C產品教育訓練']]) {
    const product = demoData.products.find(p => p.id === `P-${letter}`);
    await home(); await send(question);
    const answer = page.locator('.agent-result');
    assert.ok((await answer.innerText()).includes(product.material_no));
    assert.ok((await answer.innerText()).includes(product.manufacturing_no));
    assert.ok((await answer.innerText()).includes(product.description));
    await answer.getByRole('button', { name: '查看產品 DM', exact: true }).click();
    await page.getByRole('dialog', { name: `產品 ${letter}－產品 DM` }).waitFor();
    await page.keyboard.press('Escape');
    await popupFrom(answer.getByRole('link', { name: '觀看影音教育訓練' }), `產品 ${letter}－影音教育訓練`);
    await answer.getByRole('button', { name: '查看完整產品資訊' }).click();
    await page.waitForURL(`${base}#/F6?product=${product.id}`);
    assert.equal(await page.getByLabel('產品', { exact: true }).inputValue(), product.id);
    await page.getByRole('heading', { name: product.name, exact: true }).waitFor();
    await page.getByRole('button', { name: '查看產品 DM', exact: true }).click();
    await page.getByRole('dialog', { name: `產品 ${letter}－產品 DM` }).waitFor();
    // Reused preview also opens an actual generated file, never a dead link.
    const originalLink = page.getByRole('link', { name: '開啟本地示範原文' });
    const response = await context.request.get(new URL(await originalLink.getAttribute('href'), base).href);
    assert.equal(response.status(), 200);
    await page.keyboard.press('Escape');
    await page.reload();
    assert.equal(await page.getByLabel('產品', { exact: true }).inputValue(), product.id);
    await page.getByLabel('年度（必填）').selectOption('2026');
    const tier = demoData.tiers.find(t => t.product_id === product.id && t.year === 2026);
    assert.ok((await page.locator('main').innerText()).includes(tier.tier));
    await page.getByRole('button', { name: `查看對應 PM · ${product.pm_id}` }).click();
    await page.getByRole('dialog', { name: '產品對應 PM（示範窗口）' }).waitFor();
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: '返回首頁', exact: true }).click();
    await page.getByRole('heading', { name: '今天要完成什麼？' }).waitFor();
  }
  await send('產品資訊');
  await page.getByLabel('補充產品').selectOption('P-C');
  await page.getByRole('button', { name: '確認條件並查詢' }).click();
  await page.getByRole('heading', { name: '已找到產品 C的相關資訊' }).waitFor();
  await send('產品 XYZ');
  assert.ok((await page.locator('.agent-result').innerText()).includes('查無此產品'));
  assert.equal(await page.locator('[aria-label="可選產品"] button').count(), 6);
  await page.locator('[aria-label="可選產品"]').getByRole('button', { name: '示範產品 A', exact: true }).click();
  await page.getByRole('heading', { name: '已找到產品 A的相關資訊' }).waitFor();
  await send('A 級客戶還沒 Call');
  await page.getByLabel('補充月份').selectOption('2026-10');
  await page.getByRole('button', { name: '確認條件並查詢' }).click();
  assert.ok((await page.locator('.agent-result').innerText()).includes('0／4'));
  assert.equal(await page.locator('.product-answer').count(), 0);
  await popupFrom(page.locator('.agent-result').getByRole('link', { name: '前往 CRM 系統' }), 'CRM 系統（Demo 模擬畫面）');
  await page.getByRole('button', { name: '儲存為任務', exact: true }).click();
  await page.goto(`${base}#/tasks`);
  await page.getByRole('button', { name: 'A 級客戶還沒 Call', exact: true }).click();
  await popupFrom(page.getByRole('dialog').getByRole('link', { name: '前往 CRM 系統' }), 'CRM 系統（Demo 模擬畫面）');
  await page.keyboard.press('Escape');

  for (const route of ['customers', 'F1', 'F2', 'F3', 'F5']) {
    await page.goto(`${base}#/${route}`);
    await popupFrom(page.getByRole('link', { name: '前往 CRM 系統' }).first(), 'CRM 系統（Demo 模擬畫面）');
  }
  await page.goto(`${base}#/tasks`);
  await page.getByRole('button', { name: '準備林醫師拜訪資料', exact: true }).click();
  await popupFrom(page.getByRole('dialog').getByRole('link', { name: '前往 CRM 系統' }), 'CRM 系統（Demo 模擬畫面）');
  await page.keyboard.press('Escape');
  for (const [index, feature] of ['客戶分級與 Call KPI', '即時銷售查詢', '異常訂單查詢', '報價紀錄查詢', '客戶拜訪諮詢', '編號與窗口查詢', 'SOP 使用手冊', '公司福利與公司簡介', '進藥包'].entries()) {
    await page.goto(`${base}#/F${index + 1}`);
    await page.getByRole('heading', { level: 1, name: feature, exact: true }).waitFor();
  }
  await page.goto(`${base}#/F7`);
  await page.getByRole('button', { name: 'CRM 使用手冊', exact: true }).click();
  await popupFrom(page.getByRole('link', { name: '前往 CRM 系統' }), 'CRM 系統（Demo 模擬畫面）');
  await page.goto(`${base}#/F6?product=P-A`);
  await page.getByLabel('產品', { exact: true }).selectOption('P-B');
  await page.waitForURL(`${base}#/F6?product=P-B`);
  await page.goBack();
  assert.equal(await page.getByLabel('產品', { exact: true }).inputValue(), 'P-A');
  await page.getByRole('textbox', { name: '搜尋產品與編號' }).fill('C 產品');
  await page.getByRole('button', { name: '示範產品 C · P-C' }).click();
  assert.equal(await page.getByLabel('產品', { exact: true }).inputValue(), 'P-C');
  // An explicit URL wins over a different product saved by the preceding search.
  const fresh = await context.newPage();
  await fresh.goto(`${base}#/F6?product=P-A`);
  assert.equal(await fresh.getByLabel('產品', { exact: true }).inputValue(), 'P-A');
  await fresh.close();
  await page.goto(`${base}#/training?product=P-Z`);
  await page.getByText('找不到此產品的教育訓練資料，請返回 SalesBrain 選擇產品。').waitFor();
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await home(); await send('A產品');
    for (const stage of ['answer', 'detail', 'training', 'crm']) {
      if (stage === 'detail') await page.getByRole('button', { name: '查看完整產品資訊' }).click();
      if (stage === 'training') await page.goto(`${base}#/training?product=P-A`);
      if (stage === 'crm') await page.goto(`${base}#/crm-demo`);
      await page.locator('.page-content').waitFor();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, `${width}px ${stage} overflow`);
      if (process.env.SCREENSHOT_DIR) {
        fs.mkdirSync(process.env.SCREENSHOT_DIR, { recursive: true });
        await page.screenshot({ path: `${process.env.SCREENSHOT_DIR}/${stage}-${width}.png`, fullPage: true });
      }
    }
  }
  await page.getByRole('button', { name: '開啟完整導覽選單' }).click();
  await page.getByRole('navigation', { name: '完整頁面導覽' }).getByRole('button', { name: '知識庫', exact: true }).click();
  await page.getByRole('heading', { name: '知識庫', exact: true }).waitFor();
  assert.deepEqual(errors, [], 'browser errors');
  assert.deepEqual(failures, [], 'failed HTTP resources');
  console.log('PASS: A/B/C AI → DM/training → product details, selection/unknown, CRM popups, nine features, hash restore/back/new tab, desktop/mobile, no console errors or HTTP failures.');
} finally {
  await browser.close();
}
