import { ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { resourceHref } from '../config/links.ts';
import { isOaTaskType, oaOperations } from '../domain/oaRules.ts';
import { safeSystemReturnPath } from '../domain/systemNavigation.ts';

export default function OaDemoPage() {
  const { routeHash } = useApp();
  const params = new URLSearchParams(routeHash.split('?')[1]);
  const taskType = params.get('taskType');
  const operation = isOaTaskType(taskType) ? oaOperations[taskType] : null;
  const returnPath = safeSystemReturnPath(params.get('return'));
  const explanationPath = operation?.sopId ? `#/F7?sop=${operation.sopId}` : returnPath === '#/home' ? '#/toolbox' : returnPath;
  return <div className="page-content resource-page"><section className="card detail-card">
    <div className="section-heading"><div><div className="resource-symbol"><ExternalLink size={30} aria-hidden="true" /></div><h1 className="page-title">OA 行政作業系統</h1><p className="page-subtitle">SalesBrain — OA 系統跳轉展示</p></div><span className="badge badge-blue">Demo 模擬畫面</span></div>
    <article className="document-text"><h2>目前作業：{operation?.label ?? '一般 OA 首頁（未指定作業）'}</h2><p>{operation?.description ?? '尚未指定作業類型，請返回 SalesBrain 查閱相關作業說明。'}</p></article>
    <p>此為 SalesBrain Demo 模擬畫面。</p><p>正式版本中，業務可透過 SalesBrain 查詢操作流程，並快速返回企業 OA 系統，完成正式申請、登記或簽核。</p>
    <p className="notice">目前未連接企業 OA，此頁不會建立申請、登記資料或執行簽核。</p>
    <div className="action-row"><a className="btn btn-primary" href={resourceHref(returnPath)}>返回 SalesBrain</a><a className="btn btn-secondary" href={resourceHref(explanationPath)}>查看原作業說明</a></div>
  </section></div>;
}
