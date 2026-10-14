import { LayoutDashboard, CheckSquare, Users, BriefcaseBusiness, Database, Zap, Settings, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import type { Page } from '../context/AppContext.tsx';
const navItems = [
  { id: 'home', label: '工作入口', icon: LayoutDashboard }, { id: 'tasks', label: '我的任務', icon: CheckSquare },
  { id: 'customers', label: '客戶洞察', icon: Users }, { id: 'toolbox', label: '常用功能', icon: BriefcaseBusiness },
  { id: 'knowledge', label: '知識庫', icon: Database },
] as const;
export default function Sidebar() {
  const { currentPage, setCurrentPage, logout } = useApp();
  return <aside className="sidebar"><div className="sidebar-brand"><div className="sidebar-logo"><Zap size={18} color="#fff" /></div>
    <div className="sidebar-brand-text"><span className="sidebar-brand-name">SalesBrain</span><span className="sidebar-brand-tagline">AI 業務助理</span></div></div>
    <nav className="sidebar-nav" aria-label="主要導覽"><div className="sidebar-section-label">主要功能</div>
      {navItems.map(item => <button key={item.id} className={`nav-item${currentPage === item.id || (item.id === 'toolbox' && /^F/.test(currentPage)) ? ' active' : ''}`} onClick={() => setCurrentPage(item.id as Page)} aria-current={currentPage === item.id ? 'page' : undefined}><item.icon size={17} className="nav-icon" /><span>{item.label}</span></button>)}
      <div className="sidebar-section-label sidebar-settings-label">設定</div>
      <button className={`nav-item${currentPage === 'settings' ? ' active' : ''}`} onClick={() => setCurrentPage('settings')} aria-current={currentPage === 'settings' ? 'page' : undefined}><Settings size={19} className="nav-icon" /><span>系統設定</span></button>
      <button className="nav-item" onClick={logout}><LogOut size={19} className="nav-icon" /><span>登出</span></button>
    </nav><div className="sidebar-footer"><div className="user-card"><div className="user-avatar">陳</div><div className="user-info"><div className="user-name">示範業務陳小晴</div><div className="user-role">S001 · 示範北區</div></div></div></div></aside>;
}
