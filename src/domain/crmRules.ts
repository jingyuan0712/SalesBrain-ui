import type { FeatureId } from '../data/demo/types.ts';
import type { DemoTask } from './demoState.ts';

// D03/D05/D06/D09 include CRM or expected CRM handoff in the existing source catalog.
export const crmFeatures: readonly FeatureId[] = ['F1', 'F2', 'F3', 'F5'];
export const crmSopIds = ['DOC-S3', 'DOC-S5'];
export function taskUsesCrm(task: DemoTask): boolean {
  return task.crmRelated === true || ['拜訪準備', '拜訪安排', '客戶需求', '拜訪紀錄', '資料更新', '訂單追蹤'].includes(task.type);
}
