import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import ToastContainer from './components/Toast';
import HomePage from './pages/HomePage';
import TasksPage from './pages/TasksPage';
import CustomersPage from './pages/CustomersPage';
import CasesPage from './pages/CasesPage';
import KnowledgePage from './pages/KnowledgePage';
import './index.css';

function AppContent() {
  const { currentPage } = useApp();

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'tasks' && <TasksPage />}
        {currentPage === 'customers' && <CustomersPage />}
        {currentPage === 'cases' && <CasesPage />}
        {currentPage === 'knowledge' && <KnowledgePage />}
      </main>
      <ToastContainer />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
