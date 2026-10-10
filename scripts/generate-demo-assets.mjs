import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
// Compile this pure data module so asset generation also runs on the existing Node 20 CI.
const source = fs.readFileSync(new URL('../src/data/demo/demoData.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { demoData } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
const root = path.resolve('public');
const esc = s => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const style = 'body{font:16px/1.9 system-ui,sans-serif;color:#15294b;background:#f5f7fb;margin:0;padding:32px}main{max-width:760px;margin:auto;background:white;border:1px solid #e3eaf4;border-radius:14px;padding:32px}.notice{background:#eaf2ff;padding:16px;border-radius:8px}small{color:#71809a}button{padding:10px 20px;border:0;border-radius:8px;background:#155eef;color:white;cursor:pointer}progress{width:100%}';
function write(assetPath, html) {
  const target = path.resolve(root, assetPath);
  if (!target.startsWith(root + path.sep)) throw new Error('Asset path escapes public directory');
  fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, html, 'utf8');
}
for (const doc of demoData.documents) {
  write(doc.asset_path, `<!doctype html><html lang="zh-TW"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(doc.title)} · SalesBrain Demo</title><style>${style}</style><main><p class="notice">虛構示範文件，非核准醫藥資料或真實證明／政策。</p>${doc.type === 'quote' ? '<p class="notice">歷史報價僅供參考，不代表現行有效價格。</p>' : ''}<h1>${esc(doc.title)}</h1><small>${esc(doc.id)} · 版本 ${esc(doc.version)} · 狀態 ${esc(doc.status)}<br>更新 ${esc(doc.updated_at)} · 維護窗口 ${esc(doc.owner)} · 固定資料快照 2026-10-20 09:00 +08:00</small><h2>${esc(doc.locator)}</h2><p>${esc(doc.text)}</p>${doc.replacement ? `<p>取代版本：${esc(doc.replacement)}</p>` : ''}<p>Demo 本地文件；未連接 OA 或企業文件系統。</p></main></html>`);
}
for (const video of demoData.videos) {
  const doc = demoData.documents.find(d => d.id === video.doc_id);
  const steps = doc.text.replace(/^示範：/, '').split('。')[0].split(' → ');
  const stepsJSON = JSON.stringify(steps).replaceAll('<', '\\u003c');
  write(video.asset_path, `<!doctype html><html lang="zh-TW"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(video.title)} · SalesBrain</title><style>${style}</style><main><p class="notice">虛構流程圖文動畫，非企業 OA 實際操作影片。</p><h1>${esc(video.title)}</h1><small>${esc(video.id)} · ${esc(doc.id)} ${esc(doc.locator)} v${esc(doc.version)} · 更新 ${esc(video.updated_at)} · 20 秒</small><h2 id="step">${esc(steps[0])}</h2><progress id="progress" max="20" value="0"></progress><p id="time">0／20 秒</p><button id="play">播放教學</button> <button id="reset">回到開頭</button></main><script>const steps=${stepsJSON};let seconds=0,timer=null;const play=document.querySelector('#play');function paint(){document.querySelector('#step').textContent=steps[Math.min(3,Math.floor(seconds/5))];document.querySelector('#progress').value=seconds;document.querySelector('#time').textContent=seconds+'／20 秒'}function pause(){clearInterval(timer);timer=null;play.textContent=seconds===20?'重新播放':'播放教學'}play.onclick=()=>{if(timer){pause();return}if(seconds===20)seconds=0;paint();play.textContent='暫停教學';timer=setInterval(()=>{seconds++;paint();if(seconds>=20)pause()},1000)};document.querySelector('#reset').onclick=()=>{pause();seconds=0;paint()}</script></html>`);
}
console.log(`Generated ${demoData.documents.length} demo document previews and ${demoData.videos.length} interactive tutorials.`);
