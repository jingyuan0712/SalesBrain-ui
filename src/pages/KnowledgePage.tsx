import { useState } from 'react';
import {
  Search, FileText, BarChart2, Award, BookOpen, X,
  Bookmark, BookmarkCheck, ChevronRight, Calendar, Info
} from 'lucide-react';
import { mockKnowledge } from '../data/mockData';
import type { KnowledgeItem } from '../data/mockData';
import { useApp } from '../context/AppContext';

const allCategories = ['全部', '產品資訊', '銷售案例', '醫藥文獻', '內部流程', '市場情報'];

const iconMap: Record<string, React.FC<{ size?: number; color?: string }>> = {
  'file-text': FileText,
  'bar-chart': BarChart2,
  'award': Award,
  'book-open': BookOpen,
};

const categoryBadge: Record<string, string> = {
  '產品資訊': 'badge-blue',
  '銷售案例': 'badge-purple',
  '醫藥文獻': 'badge-green',
  '內部流程': 'badge-orange',
  '市場情報': 'badge-red',
};

const formatColor: Record<string, string> = {
  PDF: '#EF4444',
  Excel: '#17B26A',
  Word: '#155EEF',
};

function KnowledgeDetailModal({ item, onClose, onFavorite, isFav }: {
  item: KnowledgeItem; onClose: () => void; onFavorite: () => void; isFav: boolean;
}) {
  const IconComp = iconMap[item.icon] || FileText;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-md" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center" style={{ gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconComp size={20} color="var(--primary)" />
            </div>
            <div>
              <div className="modal-title">{item.title}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <span className={`badge ${categoryBadge[item.category] || 'badge-gray'}`}>{item.category}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.format}</span>
              </div>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={17} /></button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: '14px 18px', background: 'var(--bg-main)', borderRadius: 10, fontSize: 13.5, color: 'var(--text-primary)', lineHeight: 1.75 }}>
              <strong>文件摘要：</strong><br />
              {item.summary}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: '文件分類', value: item.category },
                { label: '檔案格式', value: item.format },
                { label: '最後更新', value: item.updatedAt },
                { label: '資料來源', value: '企業內部知識庫（示範）' },
              ].map(i => (
                <div key={i.label} style={{ padding: '10px 14px', background: 'var(--bg-main)', borderRadius: 8 }}>
                  <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginBottom: 3 }}>{i.label}</div>
                  <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-primary)' }}>{i.value}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: '14px 16px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, fontSize: 12.5, color: '#92400E', display: 'flex', gap: 8 }}>
              <Info size={14} style={{ flexShrink: 0, marginTop: 1 }} />
              以上為示範資料，實際文件內容將從企業文件管理系統取得。
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className={`btn ${isFav ? 'btn-primary' : 'btn-secondary'}`} onClick={onFavorite}>
            {isFav ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
            {isFav ? '已收藏' : '加入收藏'}
          </button>
          <button className="btn btn-secondary" onClick={onClose}>關閉</button>
        </div>
      </div>
    </div>
  );
}

function KnowledgeRow({ item, onView, isFav, onFavorite }: {
  item: KnowledgeItem; onView: () => void; isFav: boolean; onFavorite: () => void;
}) {
  const IconComp = iconMap[item.icon] || FileText;
  return (
    <div
      className="card"
      style={{ padding: '14px 18px', cursor: 'pointer', transition: 'all 0.18s', marginBottom: 10 }}
      onClick={onView}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = ''; (e.currentTarget as HTMLElement).style.borderColor = ''; }}
    >
      <div className="flex items-center" style={{ gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <IconComp size={20} color="var(--primary)" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{item.title}</span>
            <span className={`badge ${categoryBadge[item.category] || 'badge-gray'}`}>{item.category}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: formatColor[item.format] || '#666', background: `${formatColor[item.format] || '#666'}15`, padding: '2px 8px', borderRadius: 6 }}>
              {item.format}
            </span>
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.55, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.summary}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
            <Calendar size={11} /> {item.updatedAt}
          </div>
          <button
            className="btn btn-ghost btn-icon"
            onClick={e => { e.stopPropagation(); onFavorite(); }}
            title={isFav ? '取消收藏' : '加入收藏'}
          >
            {isFav ? <BookmarkCheck size={16} color="var(--primary)" /> : <Bookmark size={16} color="var(--text-muted)" />}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={e => { e.stopPropagation(); onView(); }}>
            查看詳情 <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function KnowledgePage() {
  const { addToast } = useApp();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('全部');
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const filteredItems = mockKnowledge.filter(item => {
    if (category !== '全部' && item.category !== category) return false;
    if (search && !item.title.includes(search) && !item.summary.includes(search) && !item.category.includes(search)) return false;
    return true;
  });

  const toggleFav = (id: string) => {
    const next = new Set(favorites);
    if (next.has(id)) { next.delete(id); addToast('已取消收藏', 'info'); }
    else { next.add(id); addToast('已加入收藏 ✓', 'success'); }
    setFavorites(next);
  };

  return (
    <>
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <h1 className="page-title">知識庫</h1>
            <p className="page-subtitle">搜尋公司內部文件、產品資訊與銷售經驗。</p>
          </div>
        </div>
      </div>

      <div className="page-content">
        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: 20 }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="input"
            placeholder="搜尋文件、產品、銷售案例、操作流程……"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 42, paddingRight: 120, fontSize: 14, height: 48, borderRadius: 12 }}
          />
          <button className="btn btn-primary" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', borderRadius: 8 }}>
            搜尋
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex" style={{ gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          {allCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                padding: '5px 16px', borderRadius: 20, fontSize: 13,
                border: '1px solid', fontFamily: 'inherit', fontWeight: 500,
                borderColor: category === cat ? 'var(--primary)' : 'var(--border)',
                background: category === cat ? 'var(--primary)' : '#fff',
                color: category === cat ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer', transition: 'all 0.15s'
              }}
            >{cat}</button>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            共找到 <strong style={{ color: 'var(--text-primary)' }}>{filteredItems.length}</strong> 份文件
            {favorites.size > 0 && <span style={{ marginLeft: 8, color: 'var(--primary)' }}>（已收藏 {favorites.size} 份）</span>}
          </span>
          {search && (
            <button className="btn btn-ghost btn-sm" onClick={() => setSearch('')} style={{ fontSize: 12 }}>
              <X size={12} /> 清除搜尋
            </button>
          )}
        </div>

        {/* List */}
        {filteredItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><FileText size={24} /></div>
            <div className="empty-state-title">未找到相關文件</div>
            <div className="empty-state-desc">試試修改搜尋關鍵字，或切換其他分類</div>
          </div>
        ) : (
          <div>
            {filteredItems.map(item => (
              <KnowledgeRow
                key={item.id}
                item={item}
                onView={() => setSelectedItem(item)}
                isFav={favorites.has(item.id)}
                onFavorite={() => toggleFav(item.id)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedItem && (
        <KnowledgeDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onFavorite={() => { toggleFav(selectedItem.id); }}
          isFav={favorites.has(selectedItem.id)}
        />
      )}
    </>
  );
}
