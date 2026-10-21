import { useState } from 'react';
import { ArrowRight, FileText, Video } from 'lucide-react';
import type { Product } from '../data/demo/types.ts';
import { demoData } from '../data/demo/demoData.ts';
import { useApp } from '../context/AppContext.tsx';
import { resourceHref } from '../config/links.ts';
import { DocumentPreview } from './DemoUI.tsx';

export function ProductResources({ product, kind = 'all' }: { product: Product; kind?: 'dm' | 'training' | 'all' }) {
  const [preview, setPreview] = useState(false);
  return <><div className="action-row">
    {kind !== 'training' && (product.dm.url
      ? <a className="btn btn-secondary" href={resourceHref(product.dm.url)} target="_blank" rel="noopener noreferrer"><FileText size={16} />查看產品 DM</a>
      : <button className="btn btn-secondary" onClick={() => setPreview(true)}><FileText size={16} />查看產品 DM</button>)}
    {kind !== 'dm' && <a className="btn btn-secondary" href={resourceHref(product.training.url)} target="_blank" rel="noopener noreferrer"><Video size={16} />觀看影音教育訓練</a>}
  </div>{preview && <DocumentPreview id={product.dm.document_id} onClose={() => setPreview(false)} />}</>;
}

export function ProductDocuments({ product }: { product: Product }) {
  const dm = demoData.documents.find(doc => doc.id === product.dm.document_id);
  return <div className="product-resource-grid"><section className="card detail-card"><h2>產品文件</h2><h3>{dm?.title ?? '產品 DM'}</h3>
    {dm && <p>文件版本 v{dm.version} · 更新日期 {dm.updated_at}</p>}
    {product.dm.is_demo && <p className="text-muted">此為 SalesBrain Demo 模擬文件，正式版本將提供企業核准的最新產品 DM。</p>}
    <ProductResources key={`${product.id}-dm`} product={product} kind="dm" />
  </section><section className="card detail-card"><h2>影音教育訓練</h2><h3>{product.training.title}</h3><p>{product.training.description}</p>
    <ProductResources product={product} kind="training" />
  </section></div>;
}

export function ProductAnswer({ product }: { product: Product }) {
  const { openFeature } = useApp();
  return <div className="product-answer"><h3>{product.name}</h3><dl className="product-facts"><div><dt>產品 ID</dt><dd>{product.id}</dd></div><div><dt>產品製編</dt><dd>{product.manufacturing_no}</dd></div><div><dt>物料號碼</dt><dd>{product.material_no}</dd></div></dl>
    <h3>產品介紹</h3><p className="answer-text">{product.description}</p><ProductResources key={product.id} product={product} />
    <button className="btn btn-primary" onClick={() => openFeature('F6', { selectedProductId: product.id })}>查看完整產品資訊 <ArrowRight size={15} /></button>
    <aside className="source-note"><div>資料來源：SalesBrain 本地產品示範資料</div><div>資料類型：Demo Mock Data</div></aside>
  </div>;
}
