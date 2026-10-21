import { Component } from 'react';
import type { ReactNode } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import MobileNavigation from './components/MobileNavigation';
import ToastContainer from './components/Toast';
import HomePage from './pages/HomePage';
import TasksPage from './pages/TasksPage';
import CustomersPage from './pages/CustomersPage';
import KnowledgePage from './pages/KnowledgePage';
import ToolboxPage from './pages/ToolboxPage';
import FeaturePage from './pages/FeaturePage';
import SettingsPage from './pages/SettingsPage';
import DemoResourcePage from './pages/DemoResourcePage';
import { Zap } from 'lucide-react';
import type { FeatureId } from './data/demo/types.ts';
import './index.css';
import './demo.css';
class PageBoundary extends Component<{ children: ReactNode }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  render() { return this.state.error ? <div className="page-content"><h1>頁面暫時無法顯示</h1><p>請重新載入頁面，再重新查詢。</p><button className="btn btn-primary" onClick={() => location.reload()}>重新載入</button></div> : this.props.children; }
}
function AppContent() {
  const { currentPage, resetVersion, loggedOut, enterDemo, density } = useApp();
  if (loggedOut) return <main className="signed-out-page"><section className="card signed-out-card"><div className="signed-out-brand"><div className="sidebar-logo"><Zap size={20} color="#fff" /></div><strong>SalesBrain</strong></div><h1>已登出</h1><p>你已離開示範工作階段。重新進入後可以繼續使用已保存的任務與查詢條件。</p><button className="btn btn-primary" onClick={enterDemo}>進入示範工作區</button></section></main>;
  return <div className={`app-layout${density === 'compact' ? ' compact-layout' : ''}`}><Sidebar /><main className="main-content">
    <MobileNavigation />
    <PageBoundary key={`${currentPage}-${resetVersion}`}>
      {(currentPage === 'crm-demo' || currentPage === 'training') && <DemoResourcePage />}
      {currentPage === 'home' && <HomePage />}{currentPage === 'tasks' && <TasksPage />}{currentPage === 'customers' && <CustomersPage />}{currentPage === 'knowledge' && <KnowledgePage />}{currentPage === 'toolbox' && <ToolboxPage />}{currentPage === 'settings' && <SettingsPage />}{/^F[1-9]$/.test(currentPage) && <FeaturePage id={currentPage as FeatureId} />}
    </PageBoundary></main><ToastContainer /></div>;
}
export default function App() { return <AppProvider><AppContent /></AppProvider>; }
