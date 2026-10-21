# CRM 快速跳轉、完整產品資訊與首頁 AI 查詢

2026-10-21。本次為既有 React／TypeScript 專案的增量修改，沿用深藍 Sidebar、原有九個功能、共用資料與 hash 導覽。未推送遠端或部署。

## 完成內容

- 共用「前往 CRM 系統」連結以新分頁開啟本地模擬頁，使用 `noopener noreferrer`。模擬頁顯示用途與返回首頁入口。
- 保留六個既有產品 A–F 的 ID、物料、製編、PM、價格與年度梯隊；擴充別名、分類、介紹、DM 關聯及教育訓練入口。
- 編號與窗口查詢保留搜尋、複製編號、PM 視窗、客戶編號與年度梯隊；新增產品介紹、文件版本／日期、DM 預覽與訓練卡片。搜尋支援 A產品、產品 A、大小寫與空白差異。
- DM 重用既有文件預覽與生成的本地文件；產品 B 沿用目前有效的 `DOC-DM2` v2.0，保留舊版及進藥包關聯。
- 教育訓練依產品 ID 開啟內部模擬新分頁，含播放器占位與產品名稱；未連接雲端、未播放實際影片。
- 首頁結構化產品回覆提供 DM、影音教育訓練、完整產品資訊、儲存為任務，以及本地 Demo 資料來源標記。
- 首頁到完整資訊使用 `#/F6?product=P-A`。網址中的 ID 優先於 localStorage，支援重新整理、新分頁、上一頁及切換產品；無效 ID 不套用舊產品。

## CRM 按鈕位置

| 位置 | 顯示條件 |
| --- | --- |
| 客戶洞察 | 頁面標題右側 |
| F1 客戶分級與 Call KPI | 頁面標題右側 |
| F2 即時銷售查詢 | 頁面標題右側，既有資料標示由 CRM 同步 |
| F3 異常訂單查詢 | 頁面標題右側，D06 來源清單列有 CRM 承接欄位待驗情境 |
| F5 客戶拜訪諮詢 | 頁面標題右側 |
| F6 編號與窗口查詢 | 顯示客戶編號卡片時，按鈕位於該卡片 |
| F7 SOP／知識庫文件預覽 | CRM 使用手冊 `DOC-S3`、拜訪紀錄整理 `DOC-S5` |
| 任務詳情／新增／編輯 | 拜訪準備、拜訪安排、客戶需求、拜訪紀錄、資料更新、訂單追蹤，或帶有 `crmRelated` 的 AI 查詢任務 |
| 首頁 AI 回覆 | CRM 功能、相關 SOP 或客戶編號查詢有結果時 |

訂單資料本身仍來自 SAP／簽核／財務，CRM 按鈕提供承接追蹤入口，不表示已完成 CRM 串接。歷史報價、純產品文件、福利、進藥包沒有加入無關的 CRM 入口。規則集中於 `src/domain/crmRules.ts`，客戶編號區域則就地顯示。

## 產品資料與意圖路由

唯一產品清單仍是 `src/data/demo/demoData.ts` 的 `demoData.products`，以 `withProductInfo` 擴充既有主檔。DM 用 `dm.document_id` 關聯 `demoData.documents`，版本與日期維持單一來源。

`src/domain/productLookup.ts` 使用 NFKC 正規化、移除空白及統一大小寫，再以產品名稱、aliases、物料或製編匹配。英文邊界避免把 `P-AB` 當成 `P-A`，也不把單獨 A／B 或 A 級當成產品。

`src/domain/demoAgent.ts` 新增 `intent: 'product_info'`，仍以 F6 為功能入口。進藥包、報價、Call KPI、銷售、SOP、訂單等既有規則優先；年度梯隊繼續補問年度，客戶編號繼續查客戶。缺產品或同時匹配多產品時要求選擇，不沿用前次產品；未知產品提供查無提示與六產品選項。沒有呼叫 LLM API。

## 替換正式連結

CRM 集中設定在 `src/config/links.ts` 的 `CRM_URL`，預設為 `#/crm-demo`。可直接修改，或在本地 `.env.local` 設定後重新啟動／建置：

```dotenv
VITE_CRM_URL=https://crm.example.com/
```

連結仍使用新分頁及相同安全屬性。Vite 環境變數會寫入前端產物，請只放公開網址。

企業產品資料仍由同一產品資料來源替換：

- 更新 `description`、`category`、`aliases`，保留交易關聯使用的產品 ID。
- DM：設定該產品 `dm.url` 為核准文件網址、`dm.is_demo` 為 false，並更新其 `dm.document_id` 關聯文件的標題、版本與日期。按鈕將直接開啟該網址；目前 null 表示使用既有本地預覽。
- 教育訓練：替換該產品 `training.url`、title、description、is_demo；正式 URL 會直接開啟新分頁。
- 目前所有介紹與文件都只是展示占位內容，沒有加入真實藥品成分、療效、劑量或研究結論。

## 新增與修改檔案

| 檔案 | 用途 |
| --- | --- |
| 新增 `src/components/CRMQuickLink.tsx` | 共用 CRM 按鈕 |
| 新增 `src/components/ProductInfo.tsx` | ProductAnswer、ProductDocuments、ProductResources |
| 新增 `src/pages/DemoResourcePage.tsx` | CRM／產品訓練模擬頁 |
| 新增 `src/config/links.ts` | CRM_URL 與部署 base 連結 |
| 新增 `src/domain/productLookup.ts` | 產品正規化、搜尋、產品網址 |
| 新增 `src/domain/crmRules.ts` | CRM 功能、SOP 與任務適用規則 |
| 新增 `tests/product-crm.browser.mjs` | 實際瀏覽器驗收 |
| `src/App.tsx` | 掛入模擬頁 |
| `src/context/AppContext.tsx` | 產品 hash 參數與共享選取同步 |
| `src/domain/demoState.ts` | 新路由及任務 CRM 來源標記 |
| `src/domain/demoAgent.ts` | product_info 與既有優先順序 |
| `src/domain/validateDemoData.ts` | 產品資訊、DM 關聯及訓練完整性 |
| `src/data/demo/types.ts`、`demoData.ts` | 擴充既有 Product |
| `src/components/DemoUI.tsx` | 沿用 DM 預覽，補產品概要及相關 CRM 文件入口 |
| `src/components/MobileNavigation.tsx` | 模擬頁標題 |
| `src/config/features.ts` | F6 功能說明與文件資料集 |
| `src/pages/HomePage.tsx` | 結構化回覆、選擇器、跨頁連結與任務 |
| `src/pages/FeaturePage.tsx` | 適用標題 CRM 按鈕與返回首頁 |
| `src/pages/CustomersPage.tsx`、`TasksPage.tsx` | CRM 操作入口 |
| `src/pages/features/VisitNumbers.tsx` | 完整產品資訊與搜尋 |
| `src/pages/features/DocumentsPackage.tsx` | CRM／拜訪紀錄 SOP 入口 |
| `src/demo.css` | 產品卡片與手機排版、訓練占位 |
| `tests/demo-agent.test.mjs` | 新增產品與 CRM 規則驗證 |
| `README.md`、本文件 | 開發、設定與交付說明 |

## 驗證結果

- `npm test`：44／44 通過，包含原有 39 項及新增 5 項；涵蓋產品自然語句／別名、未知與缺產品、意圖優先順序、六產品文件及路由、CRM 任務保存。
- `npm run build`：TypeScript 與 Vite 正式建置成功，62 份既有文件及 4 個圖文教學生成正常。
- `npm run lint`：exit 0，保留 7 項既有 React effect／Fast Refresh 規則警告，無錯誤。
- Edge headless 實測正式 `dist` 預覽，使用 `/SalesBrain-ui/` base：A／B／C 首頁查詢、DM 視窗／原文、訓練新分頁與重新整理、完整產品頁、PM、梯隊、首頁返回、產品選擇器、未知產品及 Call KPI。
- 瀏覽器另驗證 CRM 新分頁／opener 隔離、相關任務、九功能頁、產品搜尋、hash 上一頁／重新整理／新分頁與舊 localStorage 的優先順序、無效訓練產品回退、手機導覽。
- 1440、390、320px 驗證產品回覆、詳情、訓練及 CRM 無水平溢出；測試過程沒有 pageerror、Console error 或 HTTP 4xx／5xx。
- 未測真實企業 CRM、核准 DM／訓練資源或實際 GitHub Pages 發布；本次未連接這些服務，也未部署。

## 啟動與重跑

Node.js 24，乾淨環境先 `npm ci`，已有依賴可直接執行：

```sh
npm run dev
npm test
npm run build
npm run preview -- --host 127.0.0.1 --port 4175 --strictPort
```

本地開發預設 `http://localhost:5173/SalesBrain-ui/`；上述正式預覽為 `http://127.0.0.1:4175/SalesBrain-ui/`。PowerShell 可改用 `npm.cmd`。

瀏覽器驗收獨立於 `npm test`；需要 Playwright Core 及本機瀏覽器。本環境沿用既有 `.tools/browser/node_modules/playwright-core`，無新增應用依賴。在另一個 PowerShell 終端機：

```powershell
$env:BROWSER_PATH = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
node --experimental-strip-types tests/product-crm.browser.mjs
```

其他環境可以 `PLAYWRIGHT_MODULE` 指向已安裝的 Playwright Core 模組（例如 `file:///C:/tools/node_modules/playwright-core/index.mjs`），`BROWSER_PATH` 指向瀏覽器；`TEST_BASE_URL` 可改預覽網址，`SCREENSHOT_DIR` 可指定截圖目錄。

部署沿用既有 GitHub Pages 工作流程：main 收到 push 會建置並發布 gh-pages；`npm run deploy` 也會直接更新 gh-pages。**請取得使用者明確同意後才進行任一發布操作。** 此次僅本地修改、建置及驗證，Vite base 與遠端工作流程未改動。
