import { useApp } from '../context/AppContext.tsx';
import { features } from '../config/features.ts';
import type { FeatureId } from '../data/demo/types.ts';
import { CallKpiPage, SalesPage } from './features/CallSales.tsx';
import { OrdersPage, QuotesPage } from './features/OrdersQuotes.tsx';
import { VisitPage, NumbersPage } from './features/VisitNumbers.tsx';
import { SopPage, CompanyPage, PackagePage } from './features/DocumentsPackage.tsx';
const pages = { F1: CallKpiPage, F2: SalesPage, F3: OrdersPage, F4: QuotesPage, F5: VisitPage, F6: NumbersPage, F7: SopPage, F8: CompanyPage, F9: PackagePage };
export default function FeaturePage({ id }: { id: FeatureId }) {
  const { setCurrentPage } = useApp();
  const feature = features.find(f => f.id === id)!;
  const Page = pages[id];
  return <div className="page-content"><button className="btn btn-ghost breadcrumb" onClick={() => setCurrentPage('toolbox')}>← 常用功能</button><div className="section-heading"><div><p className="eyebrow">{id} · 業務工作工具</p><h1 className="page-title">{feature.title}</h1><p className="page-subtitle">{feature.description}</p></div></div><Page /></div>;
}
