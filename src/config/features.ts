import type { FeatureId } from '../data/demo/types.ts';

export const featureGroups = [
  { id: 'administration', title: '降低行政工時' },
  { id: 'experience', title: '傳承經驗' },
  { id: 'onboarding', title: '新手即戰力' },
] as const;

export interface FeatureConfig {
  id: FeatureId;
  group: typeof featureGroups[number]['id'];
  title: string;
  description: string;
  enabled: boolean;
  frequent: boolean;
  datasets: string[];
}

// Configuration describes the target scope; it does not claim the UI is implemented.
export const features: FeatureConfig[] = [
  { id: 'F1', group: 'administration', title: '客戶分級與 Call KPI', description: '查看本月拜訪缺口與尚未 Call 的客戶。', enabled: true, frequent: true, datasets: ['D01', 'D02', 'D03', 'D15'] },
  { id: 'F2', group: 'administration', title: '即時銷售查詢', description: '對照銷售明細、目標與兩月產品數量。', enabled: true, frequent: true, datasets: ['D04', 'D05', 'D06', 'D07', 'D15'] },
  { id: 'F3', group: 'administration', title: '異常訂單查詢', description: '分別查看簽核、出貨、請款與收款狀態。', enabled: true, frequent: true, datasets: ['D06', 'D07', 'D15'] },
  { id: 'F4', group: 'experience', title: '報價紀錄查詢', description: '追溯歷史價格、議價背景及原單註記。', enabled: true, frequent: false, datasets: ['D08', 'D10', 'D15'] },
  { id: 'F5', group: 'experience', title: '客戶拜訪諮詢', description: '依既有拜訪需求準備文件與進藥資料。', enabled: true, frequent: true, datasets: ['D02', 'D09', 'D10', 'D13'] },
  { id: 'F6', group: 'experience', title: '編號與窗口查詢', description: '查詢物料、製編、PM 與指定年度梯隊。', enabled: true, frequent: false, datasets: ['D02', 'D04', 'D15'] },
  { id: 'F7', group: 'onboarding', title: 'SOP 使用手冊', description: '查閱四類作業手冊、章節與有效版本。', enabled: true, frequent: false, datasets: ['D10', 'D11'] },
  { id: 'F8', group: 'onboarding', title: '公司福利與公司簡介', description: '查看示範內容、文件版本及負責窗口。', enabled: true, frequent: false, datasets: ['D10', 'D12'] },
  { id: 'F9', group: 'onboarding', title: '進藥包', description: '辨識缺件、舊版及有效文件齊備率。', enabled: true, frequent: false, datasets: ['D10', 'D13'] },
];
