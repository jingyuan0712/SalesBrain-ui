import { useRef, useState } from 'react';
import { LayoutDashboard, CheckSquare, Users, BriefcaseBusiness, Database, Settings, LogOut, Menu, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { features } from '../config/features.ts';
import { Modal } from './DemoUI.tsx';
import type { Page } from '../context/AppContext.tsx';

const items = [
  { id: 'home', label: '工作入口', icon: LayoutDashboard },
  { id: 'tasks', label: '我的任務', icon: CheckSquare },
  { id: 'customers', label: '客戶洞察', icon: Users },
  { id: 'toolbox', label: '常用功能', icon: BriefcaseBusiness },
  { id: 'knowledge', label: '知識庫', icon: Database },
  { id: 'settings', label: '系統設定', icon: Settings },
] as const;

export default function MobileNavigation() {
  const { currentPage, setCurrentPage, logout } = useApp();
  const [open, setOpen] = useState(false);
  const menuTrigger = useRef<HTMLButtonElement>(null);
  const activePage = /^F[1-9]$/.test(currentPage) ? 'toolbox' : currentPage;
  const title = features.find(feature => feature.id === currentPage)?.title
    ?? items.find(item => item.id === currentPage)?.label;
  function navigate(page: Page) { setOpen(false); setCurrentPage(page); }

  return <>
    <header className="mobile-header">
      <div className="mobile-brand"><Zap size={20} aria-hidden="true" /><div><strong>SalesBrain</strong><span>{title}</span></div></div>
      <button ref={menuTrigger} className="btn btn-secondary btn-icon" aria-label="開啟完整導覽選單" aria-haspopup="dialog" onClick={() => setOpen(true)}><Menu size={22} /></button>
    </header>
    <nav className="mobile-nav" aria-label="常用頁面導覽">
      {items.slice(0, 4).map(item => <button key={item.id} aria-current={activePage === item.id ? 'page' : undefined} onClick={() => navigate(item.id)}>
        <item.icon size={20} aria-hidden="true" /><span>{item.label}</span>
      </button>)}
    </nav>
    {open && <Modal title="導覽選單" onClose={() => setOpen(false)} returnFocusRef={menuTrigger}>
      <nav className="mobile-menu" aria-label="完整頁面導覽">
        {items.map(item => <button key={item.id} aria-current={activePage === item.id ? 'page' : undefined} onClick={() => navigate(item.id)}><item.icon size={21} aria-hidden="true" />{item.label}</button>)}
        <button onClick={() => { setOpen(false); logout(); }}><LogOut size={21} aria-hidden="true" />登出</button>
      </nav>
    </Modal>}
  </>;
}
