import { Play, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { demoData } from '../data/demo/demoData.ts';
import { routeProductId, productDetailRoute } from '../domain/productLookup.ts';
import { resourceHref } from '../config/links.ts';
import { Empty } from '../components/DemoUI.tsx';

export default function DemoResourcePage() {
  const { currentPage, routeHash } = useApp();
  const product = demoData.products.find(p => p.id === routeProductId(routeHash));
  return <div className="page-content resource-page"><a className="btn btn-ghost breadcrumb" href={resourceHref('#/home')}>← 返回 SalesBrain 首頁</a>
    {currentPage === 'crm-demo' ? <section className="card detail-card"><div className="resource-symbol"><ExternalLink size={30} /></div><h1 className="page-title">CRM 系統（Demo 模擬畫面）</h1><p>正式版本將導向企業 CRM 系統，以進行登記或後續作業</p><p className="notice">此畫面僅展示系統跳轉；未連接企業 CRM。</p></section>
      : product ? <section className="card detail-card"><h1 className="page-title">{product.name.replace('示範', '')}－影音教育訓練</h1><p>此為影音教育訓練 Demo 預覽頁面。</p><p>正式版本將連接企業雲端教育訓練影片。</p>
        <div className="training-placeholder" role="img" aria-label={`${product.name}教育訓練播放器占位畫面，沒有實際影片`}><Play size={48} aria-hidden="true" /><strong>{product.name}</strong><span>Demo 預覽 · 尚未提供影片</span></div>
        <p>{product.training.description}</p><a className="btn btn-secondary" href={resourceHref(productDetailRoute(product.id))}>返回此產品完整資訊</a>
      </section> : <Empty>找不到此產品的教育訓練資料，請返回 SalesBrain 選擇產品。</Empty>}
  </div>;
}
