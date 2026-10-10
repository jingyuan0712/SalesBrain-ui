# SalesBrain 決賽 Demo 完整交付

## 本地成果

沿用既有 React + TypeScript + Vite 專案、SalesBrain 品牌、深藍 Sidebar 與淺藍白色 SaaS 卡片。Sidebar 保留工作入口、我的任務、客戶洞察、常用功能、知識庫五個入口；案例教練元件、路由與資料已移除。首頁更多功能提供教學入口。窗口只在產品、報價、SOP、福利或文件結果中顯示。

修改位於既有 demo 分支；沒有 commit、push、合併 main 或發布 GitHub Pages。build 只產生本地 dist。

### 側邊欄調整

依展示圖，主要功能的「百寶袋」改名為「常用功能」，同步頁面標題、返回入口、首頁與手機導覽。側邊欄移除「展示工具」與「重置 Demo」，新增「設定」區塊及齒輪／登出圖示。系統設定可切換舒適／緊湊間距並保存到瀏覽器；登出離開示範工作階段，重新整理仍維持登出，重新進入後保留原有任務與查詢。尚未串接企業帳號驗證。全域 Demo 資訊列（含固定快照與展示選單）已移除，內容直接從頁面頂端開始；不保留空白列。

新增 src/pages/SettingsPage.tsx；更新 Sidebar、App、AppContext、demoState、demo.css 與相關顯示名稱。瀏覽器驗證另涵蓋間距保存、登出／重新進入、手機設定入口。

### Mock data 擴充

依使用者要求，保留原規格情境並加入更多虛構資料；新增樣本不宣稱來自 PDF 或企業來源。產生規則固定，不使用隨機資料，重新整理不會更換名稱、ID 或金額。

| 資料 | 擴充後 |
| --- | --- |
| 客戶／醫師／Call | 18／25／29 筆 |
| 產品／PM／年度梯隊 | 6／3／12 筆 |
| 銷售／月份目標 | 52／2 筆 |
| 訂單／簽核／出貨 | 62／62／57 筆 |
| 請款／收款 | 52／42 筆 |
| 歷史報價／拜訪摘要 | 24／44 筆 |
| 文件／圖文教學 | 62／4 份 |
| SOP／福利／簡介 | 8／4／4 份 |
| 進藥包／附件需求 | 18 組／90 項 |
| 預設任務 | 10 筆 |

Call KPI 全部客戶：實際 29/48（60.42%）、逐客戶封頂 25/48（52.08%）、達標 9/18（50.00%）、待完成 23 次。A 級且尚未 Call 為 C001、C006、C007 三位客戶。十月已請款金額 100,590、銷售量 911、示範目標 180,000、達成率 55.88%；九月 96,650、825 盒、目標 170,000。

每位客戶都有交易、報價和一組五項進藥包；藥局沒有醫師主檔時不捏造醫師。訂單包含待覆核、未出貨、部分出貨、已出貨未請款、未收款、部分收款和逾期情境。報價新增「查看全部報價」，拜訪與進藥包增加已有資料的快捷選擇；客戶洞察未選客戶時顯示 18 張卡片。六產品柱狀圖在手機可橫向捲動。

擴充任務使用 seedVersion=2 進行一次性補入；保留舊任務的編輯內容，已保存新版後不重建被使用者刪除的任務。進藥包替換按附件 ID 保存並核對有效新版；重置只影響當前包，不清除其他包的更新。

## 九功能與操作

首頁右上新增「更多功能」下拉選單，依展示圖使用播放／文件圖示。「教學影片」開啟既有 20 秒圖文動畫視窗，可播放、暫停與重播；畫面明示尚未提供實際操作影片。「相關文件與流程」導向 F7 SOP 手冊與文件版本。選單支援點擊外部、Escape 關閉、方向鍵與 Tab 導覽，並適配手機寬度。新增元件 src/components/HomeMoreMenu.tsx。

| 功能 | 可操作內容 |
| --- | --- |
| F1 客戶分級與 Call KPI | 月份、等級、狀態、客戶篩選；三種 KPI 依同範圍重算；全月總覽另標範圍；A／尚未 Call 得三位客戶，各 0/4；Modal 有醫師與拜訪紀錄 |
| F2 即時銷售查詢 | 月份／客戶／產品篩選、金額目標卡片、六產品柱狀圖；點產品 B 十月柱得到五筆 132 盒；清篩回 100,590／55.88%；明示期間不等長 |
| F3 異常訂單查詢 | ID 搜尋、異常列表篩選、O007/O003/O008 快捷切換、四階段、卡點、到期與餘額、來源單據 Modal；可勾示範來源不可用檢查「未知」 |
| F4 報價紀錄查詢 | 客戶／產品、搜尋、日期排序、220／200 比較、詳情、原文預覽；退稅不算；所有報價畫面與原文保留歷史價格警語與 PM 提示 |
| F5 客戶拜訪諮詢 | 客戶／產品／醫師、歷史 V001/V002、文件需求、有效示範文件預覽；保留 C001/P-B 轉進藥包、新增準備任務；文獻與醫藥內容佔位明示 |
| F6 編號與窗口查詢 | 產品／客戶／物料／製編搜尋；複製實際文字並 Toast；相關 PM Modal；2025/2026 梯隊選擇；缺年度先問、產品 Z 查無 |
| F7 SOP 使用手冊 | 八類搜尋／章節／步驟／原文／日期與窗口；DM1/DM2 版本切換；四個 20 秒示範圖文動畫可播放、暫停、重播 |
| F8 公司福利與簡介 | 兩個 Tab 各四份文件、內容搜尋、版本與日期、原文預覽、文件窗口；補助金額沒有來源時顯示無法確認 |
| F9 進藥包 | 18 組清單各五項文件與狀態、版本日期、預覽、檢視勾選；PK01 套用 DM2 從 60% 到 80%，營業證明仍缺；PK02 從 80% 到 100%；匯出帶示範標記摘要；單包重置 |

資料完全本地模擬；來源是正式環境候選，不宣稱已串接 SAP／CRM／OA、已登入企業、已核准或已寫入。固定未來模擬快照為 2026-10-20 09:00 +08:00。

## 入口、狀態與體驗

首頁保留醒目的 AI 輸入框、四個常用問題、四個常用工具與最近查詢；九工具集中常用功能，配置由 features.ts 管理。文字輸入支援九個示範句，從同一資料計算答案、顯示來源、進入完整功能。未支持問題提供功能入口；缺客戶／產品／月份／年度用選擇器補問。未知人物或產品不套用另一個對象資料。

hash 路由支援直接開啟／刷新功能頁與瀏覽器返回；localStorage 保存共用條件、包 override、任務、最近查詢。顯示用載入狀態、空結果、未知來源、複製失敗 Toast、頁面錯誤回復、可鍵盤操作的原生 dialog。手機使用頂部主要功能、設定與登出導覽，避免 Sidebar 遮擋。

任務保留新增、搜尋、狀態修改、詳情、刪除，補上編輯與跨頁／刷新保存。客戶洞察改為共用主檔與計算結果；知識庫改為共享版本化文件、搜尋、分類、歷史篩選、原文預覽與收藏。

## 檔案清單

修改既有：.gitignore、README.md、index.html、package.json、src/index.css、src/App.tsx、src/context/AppContext.tsx、src/components/Sidebar.tsx、src/components/Toast.tsx、src/pages/HomePage.tsx、src/pages/TasksPage.tsx、src/pages/CustomersPage.tsx、src/pages/KnowledgePage.tsx。

刪除：src/pages/CasesPage.tsx、src/data/mockData.ts（所有引用均已遷移）。

新增：

- src/data/demo/types.ts、demoData.ts、catalog.ts：D01–D15 共用型別、完整樣本、來源對照。
- src/config/features.ts：九功能可顯示設定與分類。
- src/domain/demoRules.ts、validateDemoData.ts：計算與資料完整性。
- src/domain/demoAgent.ts：意圖、條件解析、補問、動態答案與來源。
- src/domain/demoState.ts：共用篩選、固定任務、hash 與持久化狀態檢核。
- src/components/DemoUI.tsx、SopTutorial.tsx：共用表單、Modal、原文、來源、圖文動畫。
- src/pages/ToolboxPage.tsx、FeaturePage.tsx。
- src/pages/features/CallSales.tsx、OrdersQuotes.tsx、VisitNumbers.tsx、DocumentsPackage.tsx。
- src/demo.css：沿用原視覺的新增元件與響應式樣式。
- scripts/generate-demo-assets.mjs：建置前依同一資料產生資產；支援現有 Node 20 建置環境。
- public/demo-docs/ 下 62 份 DOC-*.html；public/demo-tutorials/ 下 VID01–VID04.html。
- public/salesbrain-mark.svg：本地品牌圖示。
- tests/demo-rules.test.mjs、demo-agent.test.mjs、browser-smoke.mjs。
- docs/phase-1.md、demo-delivery.md。

PDF 原文與抽取工具、暫用瀏覽器依賴、測試截圖、下載摘要留在被 ignore 的 .tools/，不公開、不加入網站 package-lock。

## 驗證

規則與 AI 測試：npm test，39 項全部通過，覆蓋 KPI、明細／請款關聯、去重、null、未知來源、部分單據、兩月比較、年度、不同進藥包替換隔離、九意圖、條件補問、新產品與醫師、任務一次性遷移、持久化與實際資產。

瀏覽器：使用本機 Edge headless 與暫用 playwright-core，執行 tests/browser-smoke.mjs，28 組情境全部通過。涵蓋九功能、九 AI 問題完整導頁、補問、圖表點選、Modal、複製、四教學選擇與播放／暫停、版本切換、摘要下載、任務新增／編輯／刪除與舊資料遷移、跨頁條件、多包切換與重置隔離、非首頁刷新、來源文件 HTTP、測試資料還原與手機六產品圖表。截圖檢查桌面 1440×900 與手機 390×844。

npm run build 成功；瀏覽器驗證沒有頁面錯誤或 Console error，62 份示範文件及 4 份教學資產均回傳 HTTP 200。原始測試腳本保留供重跑。瀏覽器未涵蓋所有瀏覽器版本、所有裝置、企業接口或實際現場影片播放設備。

## 本地啟動與部署

建議 Node 24，PowerShell 可以 npm.cmd 取代 npm：

```sh
npm ci
npm run dev
npm test
npm run build
```

開終端機顯示的 Local URL，通常為 http://localhost:5173/SalesBrain-ui/。若已有 dev server，只需刷新，Vite 會更新 src 變更。

瀏覽器測試需自行提供 playwright-core 於 .tools/browser/node_modules，預設使用本機 Edge，或以 DEMO_BROWSER_PATH 指定瀏覽器。啟動 npm run preview -- --host 127.0.0.1 --port 4173，另一終端機執行 node --experimental-strip-types tests/browser-smoke.mjs。此工具只作開發驗證，不是網站依賴。

收到部署授權後才執行 npm run deploy，或合併推送 main 觸發現有工作流程。保留 Vite base /SalesBrain-ui/，功能頁用 #/F1–F9，文件 URL 經 BASE_URL 生成，避免 GitHub Pages 子路由刷新 404。

## 限制與後續確認

沒有真實後端、SSO、模型或企業資料接口；沒有真實醫藥資料、資格證明、福利金額、稅務規則。原規格影片替代為使用者允許的可操作圖文動畫，非 MP4。收藏與部分頁內搜尋／UI 展開狀態只保存到該頁生命週期；核心查詢、任務與包更新保存在 localStorage。PDF 規格與公司正式業務規則仍須團隊人工核對；正式接口、權限、規則與現場設備不屬本次原型驗證。
