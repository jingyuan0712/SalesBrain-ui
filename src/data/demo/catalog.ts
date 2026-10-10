/** Candidate enterprise sources only. None of these systems is connected. */
export const datasetCatalog = [
  { id: 'D01', title: '業務與角色', keys: ['users'], expectedSources: ['企業身份目錄', 'CRM'], specPages: '21、23、26' },
  { id: 'D02', title: '客戶與醫師', keys: ['customers', 'doctors'], expectedSources: ['CRM'], specPages: '21、23、26' },
  { id: 'D03', title: 'Call 與月 KPI', keys: ['calls', 'meta.rules'], expectedSources: ['CRM', '企業 KPI 規則'], specPages: '21、23、27、45' },
  { id: 'D04', title: '產品、編號、梯隊與 PM', keys: ['products', 'pms', 'tiers'], expectedSources: ['SAP', '年度產品清單', 'PM 名錄'], specPages: '21、23、27–28' },
  { id: 'D05', title: '銷售明細與目標', keys: ['sales', 'targets'], expectedSources: ['SAP 經 CRM 同步', '目標來源待確認'], specPages: '21、23、28–29' },
  { id: 'D06', title: '訂單與簽核', keys: ['orders', 'approvals'], expectedSources: ['SAP', 'CRM 承接欄位待驗'], specPages: '21、24、29–31' },
  { id: 'D07', title: '出貨、請款與收款', keys: ['shipments', 'invoices', 'receipts'], expectedSources: ['出貨系統／SAP', '財務對帳'], specPages: '22、24、30–31' },
  { id: 'D08', title: '歷史報價', keys: ['quotes'], expectedSources: ['歷史報價／SAP／議價文件（待確認）'], specPages: '22、24、32' },
  { id: 'D09', title: '拜訪與準備', keys: ['visits'], expectedSources: ['CRM', '核准產品資料'], specPages: '22、24、32' },
  { id: 'D10', title: '文件與版本', keys: ['documents'], expectedSources: ['OA', 'PM 核准文件', '文件管理庫'], specPages: '22、24、32–34' },
  { id: 'D11', title: '教學影片', keys: ['videos'], expectedSources: ['OA（使用授權待確認）'], specPages: '22、24、34' },
  { id: 'D12', title: '福利與簡介', keys: ['documents:type=hr/company'], expectedSources: ['HR', '企業核准簡介'], specPages: '22、24、34' },
  { id: 'D13', title: '進藥包', keys: ['package_items'], expectedSources: ['企業核准進藥清單', '文件庫'], specPages: '22、25、34–35' },
  { id: 'D14', title: 'AI 示範問答', keys: ['qa_templates'], expectedSources: ['本地預設模板'], specPages: '22、25、38–39' },
  { id: 'D15', title: '更新時間與字典', keys: ['meta', 'freshness', 'glossary'], expectedSources: ['各來源同步紀錄', '企業術語字典'], specPages: '23、25、35' },
] as const;
