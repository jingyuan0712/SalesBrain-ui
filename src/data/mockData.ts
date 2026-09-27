// ==================== Mock Data =====================

export interface Task {
  id: string;
  name: string;
  customer: string;
  type: string;
  createdAt: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'done';
  priority: 'high' | 'medium' | 'low';
}

export interface Order {
  date: string;
  orderNo: string;
  product: string;
  qty: number;
  amount: string;
  status: 'shipped' | 'processing' | 'delivered';
}

export interface Visit {
  date: string;
  contact: string;
  focus: string;
  nextAction: string;
}

export interface Case {
  id: string;
  title: string;
  customerType: string;
  tags: string[];
  summary: string;
  action: string;
  result: string;
  nextStep: string;
  source: string;
  date: string;
  views: number;
  customer: string;
}

export interface KnowledgeItem {
  id: string;
  title: string;
  category: string;
  format: string;
  updatedAt: string;
  summary: string;
  icon: string;
}

export interface RecentItem {
  id: string;
  name: string;
  action: string;
  time: string;
  icon: string;
}

// ── Tasks ──
export const mockTasks: Task[] = [
  { id: 't1', name: '準備臺北長安醫院拜訪資料', customer: '臺北長安醫院', type: '拜訪準備', createdAt: '2024/07/18', dueDate: '2024/07/22', status: 'in-progress', priority: 'high' },
  { id: 't2', name: '追蹤產品 A 訂單出貨進度', customer: '和裕醫院', type: '訂單追蹤', createdAt: '2024/07/17', dueDate: '2024/07/20', status: 'in-progress', priority: 'medium' },
  { id: 't3', name: '整理王醫師需求並提供產品資訊', customer: '東彰醫院', type: '客戶需求', createdAt: '2024/07/16', dueDate: '2024/07/23', status: 'pending', priority: 'medium' },
  { id: 't4', name: '申請產品 B 退貨', customer: '高雄醫院', type: '退貨申請', createdAt: '2024/07/15', dueDate: '2024/07/18', status: 'pending', priority: 'low' },
  { id: 't5', name: '建立林醫師拜訪紀錄', customer: '林口醫院', type: '拜訪紀錄', createdAt: '2024/07/14', dueDate: '2024/07/21', status: 'done', priority: 'low' },
  { id: 't6', name: '更新臺南成大醫院客戶資料', customer: '臺南成大醫院', type: '資料更新', createdAt: '2024/07/12', dueDate: '2024/07/19', status: 'done', priority: 'low' },
];

// ── Orders ──
export const mockOrders: Order[] = [
  { date: '2024/07/05', orderNo: 'SO240705-001', product: '產品 A', qty: 30, amount: 'NT$120,000', status: 'shipped' },
  { date: '2024/06/12', orderNo: 'SO240612-003', product: '產品 B', qty: 15, amount: 'NT$45,000', status: 'delivered' },
  { date: '2024/05/20', orderNo: 'SO240520-002', product: '產品 C', qty: 20, amount: 'NT$80,000', status: 'delivered' },
  { date: '2024/04/18', orderNo: 'SO240418-001', product: '產品 A', qty: 15, amount: 'NT$60,000', status: 'delivered' },
];

// ── Visits ──
export const mockVisits: Visit[] = [
  { date: '2024/07/05', contact: '王醫師', focus: '討論產品 A 臨床使用成效，成功在三個月內導入產品 A，完成心血管科合作佈建', nextAction: '提供方案報價資料' },
  { date: '2024/06/20', contact: '李主任', focus: '採購流程說明及確認品項', nextAction: '安排產品展示會議' },
  { date: '2024/05/15', contact: '王醫師', focus: '確認訂單備貨狀況', nextAction: '下月回訪' },
];

// ── Cases ──
export const mockCases: Case[] = [
  {
    id: 'c1',
    title: '成功導入產品 A 於心臟內科',
    customerType: '醫療中心',
    tags: ['產品推廣', '醫療中心'],
    summary: '透過連續未被錯過的全面關係見補合作，成功在三個月內導入產品 A，完成心血管科合作佈建',
    action: '安排多次產品演示，邀請臨床醫師參與案例分享會，針對醫師顧慮提供實證資料',
    result: '三個月內成功導入，月訂單量達到 40 箱',
    nextStep: '持續追蹤使用狀況，擴展至其他科室',
    source: '臺北長安醫院',
    date: '2024/03',
    views: 12,
    customer: '臺北長安醫院',
  },
  {
    id: 'c2',
    title: '如何在預算有限下爭取採購',
    customerType: '地區醫院',
    tags: ['價格談判', '競品應對'],
    summary: '運用成效比較強化，搭配客戶需要求提供差異化方案，最終完成談判並成功採購',
    action: '提供詳細成效數據對比、安排產品試用期、協助申請院方補助計畫',
    result: '成功簽訂年度採購合約',
    nextStep: '安排季度回訪及使用成效追蹤',
    source: '臺中榮總',
    date: '2024/01',
    views: 8,
    customer: '臺中榮總',
  },
  {
    id: 'c3',
    title: '與神經科科建立合作關係',
    customerType: '醫學中心',
    tags: ['科室合作', '產品推廣'],
    summary: '從藥師接觸出發，透過多個關係鏈接觸關鍵決策者，提供科室解決方案',
    action: '先從藥師建立關係，逐步接觸科室主任，安排學術研討會聯合演講',
    result: '成功拓展至神經科，新增季訂單量',
    nextStep: '規劃全院推廣計畫',
    source: '高雄醫院',
    date: '2023/11',
    views: 15,
    customer: '高雄醫院',
  },
  {
    id: 'c4',
    title: '處理臨時醫院對新備作業的疑慮',
    customerType: '客戶異議',
    tags: ['客戶異議', '醫院採購流程'],
    summary: '透過數據解釋輔以競品比較，解決客戶對於備品庫存政策的疑慮，最終完成採購',
    action: '整理競品比較資料、安排醫院管理層說明會、提供彈性採購方案',
    result: '客戶同意調整採購政策，訂單量增加 30%',
    nextStep: '定期關懷並追蹤備品使用情況',
    source: '林口長庚醫院',
    date: '2023/09',
    views: 10,
    customer: '林口長庚醫院',
  },
];

// ── Knowledge Items ──
export const mockKnowledge: KnowledgeItem[] = [
  { id: 'k1', title: '產品 A 臨床資料摘要', category: '產品資訊', format: 'PDF', updatedAt: '2024/06/10', summary: '產品 A 之臨床試驗結果與安全性資料摘要，包含適應症、禁忌及用法說明。', icon: 'file-text' },
  { id: 'k2', title: '醫院採購流程說明', category: '內部流程', format: 'PDF', updatedAt: '2024/05/20', summary: '醫院採購流程說明及注意事項，供業務同仁參考，包含表單填寫與審核流程。', icon: 'file-text' },
  { id: 'k3', title: '心臟內科市場分析報告', category: '市場情報', format: 'PDF', updatedAt: '2024/04/15', summary: '台灣心臟內科市場現況及未來趨勢分析，包含競品情報與市場機會評估。', icon: 'bar-chart' },
  { id: 'k4', title: '成功導入案例：臺北長安醫院', category: '銷售案例', format: 'PDF', updatedAt: '2024/03/28', summary: '完整記錄臺北長安醫院導入過程、關鍵成功因素及後續維護策略。', icon: 'award' },
  { id: 'k5', title: '產品 B 使用指引', category: '產品資訊', format: 'PDF', updatedAt: '2024/02/10', summary: '產品 B 之使用方法、注意事項與常見問題解答，適用於第一線業務說明使用。', icon: 'book-open' },
  { id: 'k6', title: '退貨申請作業流程 SOP', category: '內部流程', format: 'PDF', updatedAt: '2024/01/30', summary: '標準退貨申請流程、所需文件清單及注意事項，含 SAP 系統操作說明。', icon: 'file-text' },
];

// ── Recent Items ──
export const mockRecentItems: RecentItem[] = [
  { id: 'r1', name: '臺北長安醫院', action: '訂單查詢', time: '2 小時前', icon: 'building' },
  { id: 'r2', name: '產品 A', action: '訂單及出貨狀態', time: '昨天', icon: 'package' },
  { id: 'r3', name: '王醫師', action: '拜訪紀錄', time: '2 天前', icon: 'user' },
  { id: 'r4', name: '產品 B', action: '負責 PM 查詢', time: '3 天前', icon: 'search' },
];

// ── AI Mock Responses ──
export const mockAIResponses: Record<string, { response: string; sources: string[] }> = {
  default: {
    response: '我已收到您的需求，正在整合 SAP、CRM 與企業知識庫中的相關資訊...',
    sources: ['SAP 訂單系統', 'CRM 客戶資料庫'],
  },
  order: {
    response: `根據您的查詢，以下是臺北長安醫院最近三個月的訂單摘要：

**近期訂單**
- 2024/07/05：產品 A × 30 箱，NT$120,000（出貨中）
- 2024/06/12：產品 B × 15 箱，NT$45,000（已交貨）
- 2024/05/20：產品 C × 20 箱，NT$80,000（已交貨）

**訂單趨勢**：近三個月總金額 NT$245,000，較上季成長 15%。

**下次拜訪建議**：7 月份訂單尚未確認，建議本週內聯繫王醫師確認採購計畫。`,
    sources: ['SAP 訂單系統', 'CRM 客戶資料庫'],
  },
  visit: {
    response: `已為您整合臺北長安醫院的拜訪準備資料：

**客戶概況**
- 主要聯絡人：王醫師（心臟內科主任）
- 上次拜訪：2024/07/05，討論產品 A 使用成效

**近期訂單狀況**
- 產品 A 目前有一筆出貨中訂單（SO240705-001）

**拜訪重點建議**
1. 確認產品 A 使用反饋與臨床成效
2. 討論下半年採購計畫
3. 介紹新產品 C 相關資訊

**注意事項**：王醫師偏好有數據支撐的說明，建議攜帶最新臨床資料。`,
    sources: ['CRM 拜訪紀錄', 'SAP 訂單系統', '企業知識庫'],
  },
  pm: {
    response: `**產品負責人查詢結果**

| 產品 | PM 姓名 | 部門 | 電話 | Email |
|------|---------|------|------|-------|
| 產品 A | 陳志遠 | 心血管事業部 | 02-2345-6789 #201 | chen.zy@company.com |
| 產品 B | 林美玲 | 醫材事業部 | 02-2345-6789 #305 | lin.ml@company.com |
| 產品 C | 張建國 | 新產品部 | 02-2345-6789 #412 | chang.jk@company.com |

以上資料來自企業內部 PM 名冊（更新日期：2024/07）。如需進一步洽詢，可直接致電或發送 Email。`,
    sources: ['企業 PM 名冊', 'OA 通訊錄'],
  },
};
