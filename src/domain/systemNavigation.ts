import { demoData } from '../data/demo/demoData.ts';
import { isOaTaskType } from './oaRules.ts';
import type { OaTaskType } from './oaRules.ts';

export type EnterpriseSystem = 'CRM' | 'OA';
export interface SystemLinkContext { taskType?: OaTaskType; returnPath?: string }

// Only allow internal destinations and known SOP IDs. Drop arbitrary query content.
export function safeSystemReturnPath(path?: string | null): string {
  if (!path) return '#/home';
  const [route, query] = path.split('?');
  if (!['#/home', '#/tasks', '#/knowledge', '#/toolbox', '#/F7'].includes(route)) return '#/home';
  if (route === '#/F7') {
    const sop = new URLSearchParams(query).get('sop');
    if (demoData.documents.some(doc => doc.id === sop && doc.type === 'sop')) return `#/F7?sop=${encodeURIComponent(sop!)}`;
  }
  return route;
}
export function buildSystemUrl(system: EnterpriseSystem, url: string, context: SystemLinkContext = {}): string {
  // Enterprise URLs are used verbatim: no invented deep links or forwarded business data.
  if (system !== 'OA' || url !== '#/oa-demo') return url;
  const params = new URLSearchParams();
  if (isOaTaskType(context.taskType)) params.set('taskType', context.taskType);
  params.set('return', safeSystemReturnPath(context.returnPath));
  return `${url}?${params}`;
}
