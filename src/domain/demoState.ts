import type { FeatureId, Grade } from '../data/demo/types.ts';
import type { PackageOverrides } from './demoRules.ts';
import { demoData } from '../data/demo/demoData.ts';

export type Page = 'home' | 'tasks' | 'customers' | 'toolbox' | 'knowledge' | 'settings' | 'crm-demo' | 'training' | FeatureId;
export interface DemoTask { id: string; name: string; customer: string; type: string; createdAt: string; dueDate: string; status: 'pending' | 'in-progress' | 'done'; priority: 'high' | 'medium' | 'low'; crmRelated?: boolean }
export interface QueryState {
  selectedCustomerId: string; selectedProductId: string; selectedMonth: string; selectedYear: number | null;
  selectedDoctorId: string; orderId: string; grade: Grade | ''; callStatus: '' | 'zero' | 'reached' | 'unreached';
  sopId: string; companyTab: 'hr' | 'company'; packageOverrides: PackageOverrides;
}
export interface SavedDemo { query: QueryState; tasks: DemoTask[]; recent: { id: string; feature: FeatureId; query: string }[] }
export function initialQuery(): QueryState {
  return { selectedCustomerId: '', selectedProductId: '', selectedMonth: demoData.meta.current_month,
    selectedYear: null, selectedDoctorId: '', orderId: 'O007', grade: '', callStatus: '',
    sopId: 'DOC-S1', companyTab: 'hr', packageOverrides: {} };
}
export function initialTasks(): DemoTask[] {
  return [
    { id: 'TASK01', name: '準備林醫師拜訪資料', customer: '示範晨星醫院', type: '拜訪準備', createdAt: '2026-10-20', dueDate: '2026-10-22', status: 'pending', priority: 'high' },
    { id: 'TASK02', name: '追蹤 O007 主管覆核進度', customer: '示範晨星醫院', type: '訂單追蹤', createdAt: '2026-10-20', dueDate: '2026-10-21', status: 'in-progress', priority: 'medium' },
    { id: 'TASK03', name: '安排海棠醫院本月首次拜訪', customer: '示範海棠醫院', type: '拜訪安排', createdAt: '2026-10-18', dueDate: '2026-10-22', status: 'pending', priority: 'high' },
    { id: 'TASK04', name: '核對瑞景醫院產品文件', customer: '示範瑞景醫院', type: '文件準備', createdAt: '2026-10-17', dueDate: '2026-10-23', status: 'in-progress', priority: 'medium' },
    { id: 'TASK05', name: '整理明川醫院歷史報價', customer: '示範明川醫院', type: '報價整理', createdAt: '2026-10-16', dueDate: '2026-10-21', status: 'pending', priority: 'medium' },
    { id: 'TASK06', name: '確認景安醫院出貨排程', customer: '示範景安醫院', type: '訂單追蹤', createdAt: '2026-10-15', dueDate: '2026-10-22', status: 'in-progress', priority: 'high' },
    { id: 'TASK07', name: '完成向陽醫院附件版本核對', customer: '示範向陽醫院', type: '文件準備', createdAt: '2026-10-14', dueDate: '2026-10-19', status: 'done', priority: 'low' },
    { id: 'TASK08', name: '補齊沐光診所營業資料欄位', customer: '示範沐光診所', type: '進藥準備', createdAt: '2026-10-18', dueDate: '2026-10-24', status: 'pending', priority: 'high' },
    { id: 'TASK09', name: '整理和煦診所拜訪需求', customer: '示範和煦診所', type: '拜訪準備', createdAt: '2026-10-17', dueDate: '2026-10-23', status: 'pending', priority: 'medium' },
    { id: 'TASK10', name: '完成禾光藥局編號核對', customer: '示範禾光藥局', type: '資料核對', createdAt: '2026-10-13', dueDate: '2026-10-18', status: 'done', priority: 'low' },
  ];
}
export function parsePage(hash: string): Page {
  const value = hash.replace(/^#\/?/, '').split('?')[0];
  return ['home', 'tasks', 'customers', 'toolbox', 'knowledge', 'settings', 'crm-demo', 'training', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9'].includes(value) ? value as Page : 'home';
}
export function restoreDemo(raw: string | null): SavedDemo {
  const fallback = { query: initialQuery(), tasks: initialTasks(), recent: [] };
  if (!raw) return fallback;
  try {
    const saved = JSON.parse(raw);
    if (saved.version !== 1 || !saved.query || !Array.isArray(saved.tasks) || !Array.isArray(saved.recent)) return fallback;
    const q = saved.query;
    const query = initialQuery();
    if (q.selectedCustomerId === '' || demoData.customers.some(c => c.id === q.selectedCustomerId)) query.selectedCustomerId = q.selectedCustomerId;
    if (q.selectedProductId === '' || demoData.products.some(p => p.id === q.selectedProductId)) query.selectedProductId = q.selectedProductId;
    if (['2026-10', '2026-09'].includes(q.selectedMonth)) query.selectedMonth = q.selectedMonth;
    if ([2025, 2026].includes(q.selectedYear)) query.selectedYear = q.selectedYear;
    if (demoData.doctors.some(d => d.id === q.selectedDoctorId && d.customer_id === query.selectedCustomerId)) query.selectedDoctorId = q.selectedDoctorId;
    if (typeof q.orderId === 'string') query.orderId = q.orderId;
    if (['', 'A', 'B', 'C'].includes(q.grade)) query.grade = q.grade;
    if (['', 'zero', 'reached', 'unreached'].includes(q.callStatus)) query.callStatus = q.callStatus;
    if (demoData.documents.some(d => d.id === q.sopId && d.type === 'sop')) query.sopId = q.sopId;
    if (['hr', 'company'].includes(q.companyTab)) query.companyTab = q.companyTab;
    for (const item of demoData.package_items) {
      if (item.replacement_doc_id && q.packageOverrides?.[item.id] === item.replacement_doc_id) query.packageOverrides[item.id] = item.replacement_doc_id;
    }
    const tasks = saved.tasks.filter((t: DemoTask) => t && ['id', 'name', 'customer', 'type', 'createdAt', 'dueDate'].every(key => typeof t[key as keyof DemoTask] === 'string')
      && ['pending', 'in-progress', 'done'].includes(t.status) && ['high', 'medium', 'low'].includes(t.priority));
    if (saved.seedVersion !== 2) {
      tasks.push(...initialTasks().slice(2).filter(task => !tasks.some((existing: DemoTask) => existing.id === task.id)));
    }
    const recent = saved.recent.filter((r: SavedDemo['recent'][number]) => r && typeof r.id === 'string' && typeof r.query === 'string' && /^F[1-9]$/.test(r.feature)).slice(0, 6);
    return { query, tasks, recent };
  } catch { return fallback; }
}
