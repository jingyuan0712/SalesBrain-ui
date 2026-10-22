import { ExternalLink } from 'lucide-react';
import { CRM_URL, OA_URL, resourceHref } from '../config/links.ts';
import { buildSystemUrl } from '../domain/systemNavigation.ts';
import type { EnterpriseSystem, SystemLinkContext } from '../domain/systemNavigation.ts';

interface Props extends SystemLinkContext { system: EnterpriseSystem; label?: string }
export default function SystemQuickLink({ system, label, taskType, returnPath }: Props) {
  const url = buildSystemUrl(system, system === 'CRM' ? CRM_URL : OA_URL, { taskType, returnPath });
  return <a className="btn btn-secondary system-quick-link" href={resourceHref(url)} target="_blank" rel="noopener noreferrer">{label ?? `前往 ${system} 系統`} <ExternalLink size={15} aria-hidden="true" /></a>;
}
