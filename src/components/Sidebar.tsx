import React from 'react';
import {
  LayoutDashboard, CheckSquare, Users, BookOpen, Database,
  Zap, LogOut, Settings, ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Page } from '../context/AppContext';

const navItems: { id: Page; label: string; icon: React.FC<{ size?: number; className?: string }> }[] = [
  { id: 'home', label: '工作入口', icon: LayoutDashboard },
  { id: 'tasks', label: '我的任務', icon: CheckSquare },
  { id: 'customers', label: '客戶洞察', icon: Users },
  { id: 'cases', label: '案例教練', icon: BookOpen },
  { id: 'knowledge', label: '知識庫', icon: Database },
];

export default function Sidebar() {
  const { currentPage, setCurrentPage } = useApp();

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <Zap size={18} color="#fff" />
        </div>
        <div className="sidebar-brand-text">
          <span className="sidebar-brand-name">SalesBrain</span>
          <span className="sidebar-brand-tagline">AI 業務助理</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">主要功能</div>
        {navItems.map(item => {
          const Icon = item.icon;
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item${active ? ' active' : ''}`}
              onClick={() => setCurrentPage(item.id)}
            >
              <Icon size={17} className="nav-icon" />
              <span style={{ flex: 1 }}>{item.label}</span>
              {active && <ChevronRight size={13} style={{ opacity: 0.5 }} />}
            </button>
          );
        })}

        <div className="sidebar-section-label" style={{ marginTop: 20 }}>設定</div>
        <button className="nav-item">
          <Settings size={17} className="nav-icon" />
          系統設定
        </button>
        <button className="nav-item">
          <LogOut size={17} className="nav-icon" />
          登出
        </button>
      </nav>

      {/* User */}
      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">王</div>
          <div className="user-info">
            <div className="user-name">王小美</div>
            <div className="user-role">業務專員</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
