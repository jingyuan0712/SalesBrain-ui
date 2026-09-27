import { useState } from 'react';
import {
  Search, X, Building, Eye, ChevronRight,
  BookOpen, Lightbulb, Target, TrendingUp, ArrowRight,
  Bot, Loader2
} from 'lucide-react';
import { mockCases } from '../data/mockData';
import type { Case } from '../data/mockData';

const allCategories = ['全部情境', '產品推廣', '價格談判', '競品應對', '醫院採購流程', '科室合作', '客戶異議'];

const tagClass = (tag: string) => {
  const map: Record<string, string> = {
    '產品推廣': 'badge-blue',
    '價格談判': 'badge-orange',
    '競品應對': 'badge-red',
    '醫院採購流程': 'badge-purple',
    '科室合作': 'badge-green',
    '客戶異議': 'badge-gray',
    '醫療中心': 'badge-blue',
    '地區醫院': 'badge-orange',
    '醫學中心': 'badge-purple',
  };
  return map[tag] || 'badge-gray';
};

function CaseDetailModal({ caseItem, onClose }: { caseItem: Case; onClose: () => void }) {
  const steps = [
    { icon: Building, label: '客戶', value: caseItem.customer, color: '#155EEF' },
    { icon: Lightbulb, label: '情境', value: caseItem.summary, color: '#F97316' },
    { icon: Target, label: '行動', value: caseItem.action, color: '#7C3AED' },
    { icon: TrendingUp, label: '結果', value: caseItem.result, color: '#17B26A' },
    { icon: ArrowRight, label: '下一步', value: caseItem.nextStep, color: '#EF4444' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="modal-title">{caseItem.title}</span>
            <div className="flex" style={{ gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
              {caseItem.tags.map(t => <span key={t} className={`badge ${tagClass(t)}`}>{t}</span>)}
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={17} /></button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {steps.map(step => {
              const Icon = step.icon;
              return (
                <div key={step.label} style={{
                  display: 'flex', gap: 14, padding: '14px 16px',
                  background: 'var(--bg-main)', borderRadius: 10, borderLeft: `3px solid ${step.color}`
                }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: `${step.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={16} color={step.color} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: step.color, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{step.label}</div>
                    <div style={{ fontSize: 13.5, color: 'var(--text-primary)', lineHeight: 1.65 }}>{step.value}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              資料來源：{caseItem.source} ｜ {caseItem.date} ｜ <Eye size={11} style={{ verticalAlign: 'middle' }} /> {caseItem.views} 次查看
            </div>
            <span className="badge badge-gray">示範資料</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CaseCard({ caseItem, onClick }: { caseItem: Case; onClick: () => void }) {
  return (
    <div
      className="card"
      style={{ padding: 18, cursor: 'pointer', transition: 'all 0.18s' }}
      onClick={onClick}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}
    >
      <div className="flex" style={{ gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        <span className={`badge ${tagClass(caseItem.customerType)}`}>{caseItem.customerType}</span>
        {caseItem.tags.map(t => <span key={t} className={`badge ${tagClass(t)}`}>{t}</span>)}
      </div>
      <h3 style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8, lineHeight: 1.4 }}>{caseItem.title}</h3>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {caseItem.summary}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
        {[
          { label: '採取行動', value: caseItem.action, color: '#7C3AED' },
          { label: '最終結果', value: caseItem.result, color: '#17B26A' },
        ].map(item => (
          <div key={item.label} style={{ fontSize: 12.5, display: 'flex', gap: 6, alignItems: 'flex-start' }}>
            <span style={{ color: item.color, fontWeight: 600, flexShrink: 0 }}>{item.label}：</span>
            <span style={{ color: 'var(--text-secondary)' }}>{item.value}</span>
          </div>
        ))}
      </div>
      <div style={{ paddingTop: 10, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
          {caseItem.source} ｜ {caseItem.date}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
            <Eye size={11} /> {caseItem.views}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--primary)', fontSize: 12, fontWeight: 500 }}>
            查看詳情 <ChevronRight size={13} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CasesPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('全部情境');
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [aiSearchQuery, setAiSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [aiResults, setAiResults] = useState<Case[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const filteredCases = mockCases.filter(c => {
    if (hasSearched && aiResults.length > 0) return aiResults.some(r => r.id === c.id);
    if (category !== '全部情境' && !c.tags.includes(category)) return false;
    if (search && !c.title.includes(search) && !c.summary.includes(search)) return false;
    return true;
  });

  const handleAISearch = () => {
    if (!aiSearchQuery.trim()) return;
    setIsSearching(true);
    setHasSearched(false);
    setTimeout(() => {
      const results = mockCases.filter(c => {
        const query = aiSearchQuery.toLowerCase();
        return c.tags.some(t => t.toLowerCase().includes(query)) ||
          c.summary.toLowerCase().includes(query) ||
          c.title.toLowerCase().includes(query);
      });
      setAiResults(results.length > 0 ? results : mockCases.slice(0, 2));
      setIsSearching(false);
      setHasSearched(true);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAISearch();
  };

  return (
    <>
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <h1 className="page-title">案例教練</h1>
            <p className="page-subtitle">從真實銷售案例中，找到相似情境的成功做法。</p>
          </div>
        </div>
      </div>

      <div className="page-content">
        {/* AI Search Bar */}
        <div style={{
          background: '#fff', border: '2px solid var(--primary)', borderRadius: 12,
          boxShadow: '0 4px 20px rgba(21,94,239,0.1)', padding: '10px 14px',
          display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20
        }}>
          <Bot size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
          <input
            className="input"
            value={aiSearchQuery}
            onChange={e => setAiSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="例如：醫院客戶對產品價格有疑慮，過去有哪些成功的應對方式？"
            style={{ border: 'none', boxShadow: 'none', padding: '4px 0', flex: 1, fontSize: 14 }}
          />
          <button
            className="btn btn-primary"
            onClick={handleAISearch}
            disabled={!aiSearchQuery.trim() || isSearching}
            style={{ borderRadius: 8, flexShrink: 0 }}
          >
            {isSearching ? <Loader2 size={15} style={{ animation: 'spin 0.6s linear infinite' }} /> : <Search size={15} />}
            {isSearching ? '搜尋中…' : '搜尋'}
          </button>
        </div>

        {/* AI Search Result Banner */}
        {hasSearched && (
          <div style={{ padding: '12px 16px', background: 'var(--primary-light)', borderRadius: 8, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--primary)', fontWeight: 500 }}>
              <Bot size={15} /> 根據您的情境，找到 {aiResults.length > 0 ? aiResults.length : mockCases.slice(0,2).length} 個相似案例（依相關度排列）
            </div>
            <button className="btn btn-ghost btn-sm" style={{ fontSize: 12 }} onClick={() => { setHasSearched(false); setAiSearchQuery(''); }}>
              <X size={13} /> 清除搜尋
            </button>
          </div>
        )}

        {/* Category Filter */}
        {!hasSearched && (
          <div className="flex" style={{ gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
            {allCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  padding: '5px 14px', borderRadius: 20, fontSize: 13,
                  border: '1px solid',
                  borderColor: category === cat ? 'var(--primary)' : 'var(--border)',
                  background: category === cat ? 'var(--primary)' : '#fff',
                  color: category === cat ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
                  transition: 'all 0.15s'
                }}
              >{cat}</button>
            ))}
          </div>
        )}

        {/* Keyword Search (non-AI) */}
        {!hasSearched && (
          <div style={{ position: 'relative', marginBottom: 24, maxWidth: 380 }}>
            <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="input" placeholder="篩選案例標題或內容" value={search} onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 34 }} />
          </div>
        )}

        {/* Cases Grid */}
        <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
            {hasSearched ? 'AI 推薦案例' : '推薦案例'}
          </h2>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>共 {filteredCases.length} 個案例</span>
        </div>

        {filteredCases.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><BookOpen size={24} /></div>
            <div className="empty-state-title">未找到相關案例</div>
            <div className="empty-state-desc">試試修改搜尋關鍵字，或切換其他分類</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
            {filteredCases.map(c => (
              <CaseCard key={c.id} caseItem={c} onClick={() => setSelectedCase(c)} />
            ))}
          </div>
        )}
      </div>

      {selectedCase && <CaseDetailModal caseItem={selectedCase} onClose={() => setSelectedCase(null)} />}
    </>
  );
}
