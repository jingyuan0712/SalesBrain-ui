import { useState } from 'react';
import { features, featureGroups } from '../config/features.ts';
import { FeatureCard, Empty } from '../components/DemoUI.tsx';
export default function ToolboxPage() {
  const [search, setSearch] = useState('');
  const visible = features.filter(f => f.enabled && `${f.title}${f.description}`.toLowerCase().includes(search.toLowerCase()));
  return <div className="page-content"><div className="section-heading"><div><p className="eyebrow">SALESBRAIN TOOLBOX</p><h1 className="page-title">常用功能</h1><p className="page-subtitle">從工作情境出發，快速查資料、找流程、備文件。</p></div>
    <input className="input compact-search" aria-label="搜尋常用功能功能" placeholder="搜尋功能…" value={search} onChange={e => setSearch(e.target.value)} /></div>
    {visible.length === 0 ? <Empty /> : featureGroups.map(group => <section className="feature-group" key={group.id}><h2>{group.title}</h2><div className="feature-grid">{visible.filter(f => f.group === group.id).map(f => <FeatureCard key={f.id} id={f.id} />)}</div></section>)}
  </div>;
}
