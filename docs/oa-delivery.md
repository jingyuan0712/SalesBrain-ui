# OA 系統快速跳轉交付

2026-10-22。本次沿用既有網站、hash 導覽與企業 SaaS 樣式。沒有修改 Mock Data、Vite base 或遠端部署流程，沒有推送遠端或發布網站。

## 功能與入口

CRM 與 OA 共用 `SystemQuickLink`，提供 system、label、taskType、returnPath。原有 `CRMQuickLink` 保留作為相容包裝，既有呼叫位置與 CRM_URL 不變。兩種按鈕均使用既有 secondary 樣式、ExternalLink 圖示、Hover 效果及 `target="_blank" rel="noopener noreferrer"`。

| 入口 | OA 作業 |
| --- | --- |
| SOP 使用手冊：折讓作業 `DOC-S1` | 折讓申請 |
| SOP 使用手冊：產品折扣 `DOC-S2` | 產品折扣申請 |
| SOP 使用手冊：溢收款證明 `DOC-S4` | 溢收款證明 |
| 以上三份文件的預覽視窗，包含知識庫入口 | 對應同一作業 |
| 首頁 AI 回覆以上三種 SOP | 對應同一作業；可保存為任務 |
| OA 任務的新增／編輯／詳情 | 折讓申請、產品折扣申請、溢收款證明或一般行政作業處理 |

任務新增了「折讓申請」「產品折扣申請」「溢收款證明」「OA 行政作業」四個類型。首頁保存的查詢任務透過 `oaTaskType` 保存明確來源，重新整理仍保留 OA 入口。具有 CRM 及 OA 來源的任務可同時顯示兩種連結，不從任務名稱推測流程。

CRM／拜訪手冊、純產品文件、福利、進藥包等沒有加入無關的 OA 按鈕。現有訂單／簽核資料來源為 SAP 與 CRM 承接，因此沒有將全部訂單簽核誤認為 OA。

## 模擬頁及返回方式

預設連結示例：

```text
/SalesBrain-ui/#/oa-demo?taskType=allowance&return=%23%2FF7%3Fsop%3DDOC-S1
```

`taskType` 支援 allowance、product-discount、overpayment、administration。缺少或未知類型時顯示「一般 OA 首頁（未指定作業）」，不選取任意申請。

OA 模擬頁顯示「OA 行政作業系統」「SalesBrain — OA 系統跳轉展示」、目前作業、展示說明與兩個操作入口：

- 「返回 SalesBrain」返回來源 SOP、首頁、知識庫或任務列表。
- 「查看原作業說明」對三種明確 SOP 使用 `#/F7?sop=DOC-S1` 等網址；行政任務返回任務列表。一般首頁沒有來源時回到常用功能選擇入口。

F7 現已支援 sop 參數；點選頁籤同步更新網址。新分頁、重新整理及返回時，明確網址優先於瀏覽器先前保存的 SOP。OA 頁面僅展示跳轉，不提供登入、提交或簽核操作。

返回網址採內部白名單，只保留已知頁面及有效 SOP ID。外部網址、任意查詢參數或不明來源回到首頁。OA 模擬網址只攜帶作業列舉與安全返回位置，不帶任務名稱、客戶資料或查詢全文。

## 正式 OA 網址

集中設定在 `src/config/links.ts`：

```ts
export const OA_URL: string = import.meta.env.VITE_OA_URL || '#/oa-demo';
```

可修改 OA_URL，或於 `.env.local` 設定後重新啟動／建置：

```dotenv
VITE_OA_URL=https://oa.example.com/
```

正式網址直接使用原設定值，**不附加 Demo 的 taskType、return 或其他業務資料**。不宣稱已支援企業流程深連結；是否可以直達指定表單，需取得企業 OA 的正式規格後另行整合。Vite 環境變數會進入前端產物，只應設定公開系統網址。

## 檔案清單

| 檔案 | 變更 |
| --- | --- |
| 新增 `src/components/SystemQuickLink.tsx` | CRM／OA 共用連結元件 |
| 新增 `src/pages/OaDemoPage.tsx` | OA 模擬頁與來源返回 |
| 新增 `src/domain/oaRules.ts` | 作業、SOP、任務對應 |
| 新增 `src/domain/systemNavigation.ts` | Demo 參數、正式網址直達、內部返回白名單 |
| 新增 `tests/system-navigation.test.mjs` | OA 情境、任務保存、正式網址與安全返回測試 |
| 新增 `tests/oa.browser.mjs` | OA 實際瀏覽器驗收 |
| `src/config/links.ts` | OA_URL／VITE_OA_URL |
| `src/components/CRMQuickLink.tsx` | 改用共用元件，保留原介面 |
| `src/components/DemoUI.tsx` | 相關文件預覽加入 OA 入口 |
| `src/pages/features/DocumentsPackage.tsx` | 三種 SOP 的 OA 入口 |
| `src/pages/HomePage.tsx` | OA 回覆入口與任務來源保存 |
| `src/pages/TasksPage.tsx` | OA 任務類型及新增／編輯／詳情入口 |
| `src/context/AppContext.tsx` | SOP 網址參數還原與切換同步 |
| `src/domain/demoState.ts` | oa-demo 路由、oaTaskType 型別 |
| `src/App.tsx` | 掛入 OA 模擬頁 |
| `src/components/MobileNavigation.tsx` | OA 頁標題 |
| `src/demo.css` | CRM 原樣式改為兩系統共用類名 |
| `package.json` | npm test 納入 OA 規則測試 |
| `README.md`、本文件 | 設定、測試與交付說明 |

## 驗證

- `npm test`：49／49 通過，包含原有 44 項及新增 5 項 OA 規則測試。
- `npm run build`：TypeScript 與 Vite 正式建置成功，62 份文件與 4 份圖文教學正常生成。
- `npm run lint`：exit 0，沒有錯誤；保留原有 7 項 React effect／Fast Refresh 警告。
- `tests/oa.browser.mjs`：在 Edge headless 實際操作正式 dist 預覽，通過三種 SOP 的新分頁／opener 隔離、OA 重新整理、返回來源、查看原作業說明、知識庫預覽、首頁 AI 入口、保存任務、一般 OA 任務、CRM／OA 同時顯示、未知類型與外部返回網址回退、手機導覽。
- `tests/product-crm.browser.mjs`：既有 CRM 與產品回歸通過，包含九功能頁、CRM 新分頁、A／B／C 的 AI → DM／教育訓練 → 詳情、網址還原及返回操作。
- 1440、390、320px 檢查 OA 與 SOP 畫面無水平溢出；兩套瀏覽器驗收沒有 pageerror、Console error 或 HTTP 4xx／5xx。
- 未連接或驗證企業 OA／SSO／真實表單，未實際發布 GitHub Pages；部署路徑以本地正式預覽的 `/SalesBrain-ui/` 驗證。

## 本地啟動及部署

Node.js 24，乾淨環境先執行 `npm ci`。PowerShell 可使用 `npm.cmd`：

```sh
npm run dev
npm test
npm run build
npm run preview -- --host 127.0.0.1 --port 4176 --strictPort
```

開發預設 `http://localhost:5173/SalesBrain-ui/`；上述正式預覽為 `http://127.0.0.1:4176/SalesBrain-ui/`。

瀏覽器測試沿用本環境已有的 `.tools/browser/node_modules/playwright-core`，沒有新增應用依賴。在另一個 PowerShell 終端機執行：

```powershell
$env:BROWSER_PATH = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
$env:TEST_BASE_URL = 'http://127.0.0.1:4176/SalesBrain-ui/'
node tests/oa.browser.mjs
node --experimental-strip-types tests/product-crm.browser.mjs
```

其他環境可透過 PLAYWRIGHT_MODULE 指定已安裝的 Playwright Core 模組；BROWSER_PATH 指定瀏覽器，SCREENSHOT_DIR 指定可選截圖目錄。

部署沿用既有工作流程：push main 會建置並發布 gh-pages；`npm run deploy` 也會直接更新 gh-pages。需先取得使用者明確同意才執行發布。本次沒有進行這些操作。
