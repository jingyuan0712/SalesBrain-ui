import { useState } from 'react';
import { demoData } from '../data/demo/demoData.ts';
import { useApp } from '../context/AppContext.tsx';
import { DocumentPreview, Empty, Select, documentStatus } from '../components/DemoUI.tsx';
export default function KnowledgePage() {
  const { openFeature } = useApp();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [includeHistory, setIncludeHistory] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const rows = demoData.documents.filter(d => `${d.title}${d.id}${d.text}`.toLowerCase().includes(search.toLowerCase()) && (!category || d.type === category) && (includeHistory || d.status === 'current' || d.status === 'placeholder'));
  return <div className="page-content"><div className="section-heading"><div><h1 className="page-title">知識庫</h1><p className="page-subtitle">同一份示範文件庫，保留版本、更新日期與負責窗口。</p></div><button className="btn btn-secondary" onClick={() => openFeature('F7')}>SOP 與教學</button></div>
    <div className="filter-bar"><label className="filter-field"><span>搜尋文件</span><input className="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="文件名稱、ID 或內容…" /></label><Select label="分類" value={category} onChange={setCategory} options={[{ value: '', label: '全部分類' }, { value: 'product', label: '產品資訊' }, { value: 'marketing', label: '行銷文件' }, { value: 'sop', label: 'SOP 手冊' }, { value: 'literature', label: '文獻佔位' }, { value: 'hr', label: '公司福利' }, { value: 'company', label: '公司簡介' }, { value: 'quote', label: '歷史報價' }, { value: 'qualification', label: '資格文件佔位' }, { value: 'raw-material', label: '原料來源佔位' }]} />
      <label className="checkbox-label"><input type="checkbox" checked={includeHistory} onChange={e => setIncludeHistory(e.target.checked)} />包含歷史與舊版</label></div>
    <p className="text-muted">{rows.length} 份示範文件 · 此頁收藏 {favorites.length} 份</p>
    {rows.length ? <div className="knowledge-list">{rows.map(d => <article className="card knowledge-card" key={d.id}><div><span className={`badge ${d.status === 'current' ? 'badge-blue' : 'badge-orange'}`}>{documentStatus(d.status)}</span><h2>{d.title}</h2><p>{d.id} · v{d.version} · 更新 {d.updated_at} · {d.owner}</p><p className="text-muted">{d.text}</p></div><div className="action-row"><button className="btn btn-secondary" onClick={() => setFavorites(xs => xs.includes(d.id) ? xs.filter(id => id !== d.id) : [...xs, d.id])}>{favorites.includes(d.id) ? '取消收藏' : '收藏'}</button><button className="btn btn-primary" onClick={() => setPreview(d.id)}>預覽</button></div></article>)}</div> : <Empty />}
    {preview && <DocumentPreview id={preview} onClose={() => setPreview(null)} />}
  </div>;
}
