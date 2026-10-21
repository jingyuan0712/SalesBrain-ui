import { ExternalLink } from 'lucide-react';
import { CRM_URL, resourceHref } from '../config/links.ts';

export default function CRMQuickLink() {
  return <a className="btn btn-secondary crm-quick-link" href={resourceHref(CRM_URL)} target="_blank" rel="noopener noreferrer">前往 CRM 系統 <ExternalLink size={15} aria-hidden="true" /></a>;
}
