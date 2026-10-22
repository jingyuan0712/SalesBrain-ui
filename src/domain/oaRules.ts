import type { DemoTask } from './demoState.ts';

export const oaOperations = {
  allowance: { label: '折讓申請', sopId: 'DOC-S1', description: '查閱折讓準備流程後，回到企業 OA 辦理正式申請。' },
  'product-discount': { label: '產品折扣申請', sopId: 'DOC-S2', description: '核對折扣文件與 PM 窗口後，回到企業 OA 申請產品折扣。' },
  overpayment: { label: '溢收款證明', sopId: 'DOC-S4', description: '備妥原單與差額資料後，回到企業 OA 辦理證明相關流程。' },
  administration: { label: '行政作業處理', sopId: null, description: '請依來源任務確認作業內容，再於企業 OA 完成正式行政作業。' },
} as const;
export type OaTaskType = keyof typeof oaOperations;
export function isOaTaskType(value: unknown): value is OaTaskType {
  return typeof value === 'string' && Object.hasOwn(oaOperations, value);
}
export function oaTypeForSop(sopId: string): OaTaskType | undefined {
  return (Object.keys(oaOperations) as OaTaskType[]).find(type => oaOperations[type].sopId === sopId);
}
export function oaTypeForTask(task: DemoTask): OaTaskType | undefined {
  const types: Record<string, OaTaskType> = { '折讓申請': 'allowance', '產品折扣申請': 'product-discount', '溢收款證明': 'overpayment', 'OA 行政作業': 'administration' };
  if (Object.hasOwn(types, task.type)) return types[task.type];
  // Saved AI results carry explicit provenance; do not infer a workflow from a task's name.
  return task.type === '查詢追蹤' && isOaTaskType(task.oaTaskType) ? task.oaTaskType : undefined;
}
