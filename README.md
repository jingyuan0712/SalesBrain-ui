# SalesBrain UI

React + TypeScript + Vite 的業務助理 Demo，沿用深藍 Sidebar、淺藍企業 SaaS 介面。九個常用功能已接入共用示範資料，支援查詢、文件預覽、跨頁條件、任務保存與進藥包重置。

## 本地開發

建議 Node.js 24。已有依賴時直接啟動；乾淨 checkout 先安裝：

```sh
npm ci
npm run dev
```

開啟終端機 Local 網址，通常為 http://localhost:5173/SalesBrain-ui/。請修改 src/，dist/ 為建置產物，node_modules/ 為套件。PowerShell 若封鎖 npm.ps1，可使用 npm.cmd。

```sh
npm test
npm run build
```

測試採 Node 原生 TypeScript stripping；本次實測 Node v24.18.0。建置只產生本地 dist/，不更新 GitHub Pages。

## 決賽資料基礎

- [本次完整交付、檔案清單與測試結果](docs/demo-delivery.md)
- [第一階段歷史盤點](docs/phase-1.md)
- [D01–D15 共用資料](src/data/demo/demoData.ts) 與 [型別](src/data/demo/types.ts)
- [來源候選與規格頁碼](src/data/demo/catalog.ts)
- [九功能配置](src/config/features.ts)
- [共用計算與重置工廠](src/domain/demoRules.ts)
- [資料完整性檢核](src/domain/validateDemoData.ts)
- [自動化規則測試](tests/demo-rules.test.mjs)

所有資料、人物、文件、金額與規則均為虛構示範。固定快照為 2026/10/20 09:00（臺北），AI 為規則路由與預設模擬，尚未連接企業系統或模型。舊 mockData 與案例教練已移除。

非首頁網址採 hash，例如 /SalesBrain-ui/#/F9，GitHub Pages 重新整理仍能載入。客戶、產品、月份、年度、進藥包更新、最近查詢與任務保存在瀏覽器 localStorage。全域 Demo 資訊列與重置入口已依介面需求移除。

目前提供 18 位客戶、25 位醫師、29 筆 Call、6 個產品、52 筆銷售、62 張訂單、24 筆報價、44 筆拜訪、18 組進藥包與 10 筆預設任務。保留原規格情境並增加虛構樣本，KPI 與銷售總額依擴充資料重算。舊版保存的任務會保留編輯內容，僅補入一次新增預設任務。

每次 build 前會由 scripts/generate-demo-assets.mjs 按共用資料產生 62 份本地示範文件與 4 個 20 秒可播放／暫停的圖文教學。它是動畫，不是企業實際操作影片。

## GitHub Pages

Vite base 為 /SalesBrain-ui/。現有工作流程在 push main 時建置並發布到 gh-pages；只 push demo 不會自動部署。

npm run deploy 會建置並直接發布目前工作目錄到 gh-pages，即使是在 demo 也會更新線上網站。此次交付只做本地修改與驗證；待確認後再部署。
