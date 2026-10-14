import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode, Dispatch, SetStateAction } from 'react';
import { initialQuery, initialTasks, parsePage, restoreDemo } from '../domain/demoState.ts';
import type { Page, QueryState, DemoTask, SavedDemo } from '../domain/demoState.ts';
import type { FeatureId } from '../data/demo/types.ts';
export type { Page } from '../domain/demoState.ts';

interface Toast { id: string; message: string; type: 'success' | 'error' | 'info'; targetPage?: Page }
interface AppContextType {
  loggedOut: boolean; logout: () => void; enterDemo: () => void;
  density: 'comfortable' | 'compact'; setDensity: (density: 'comfortable' | 'compact') => void;
  currentPage: Page; setCurrentPage: (page: Page) => void;
  query: QueryState; updateQuery: (patch: Partial<QueryState>) => void;
  openFeature: (id: FeatureId, patch?: Partial<QueryState>) => void;
  tasks: DemoTask[]; setTasks: Dispatch<SetStateAction<DemoTask[]>>;
  recent: SavedDemo['recent']; recordQuery: (feature: FeatureId, question: string) => void;
  resetDemo: () => void; resetVersion: number;
  presetQuestion: string; setPresetQuestion: (question: string) => void;
  toasts: Toast[]; addToast: (message: string, type?: Toast['type'], targetPage?: Page) => void; removeToast: (id: string) => void;
}
const AppContext = createContext<AppContextType | null>(null);
const storageKey = 'salesbrain-demo-v1';
function readSaved() { try { return restoreDemo(localStorage.getItem(storageKey)); } catch { return restoreDemo(null); } }
export function AppProvider({ children }: { children: ReactNode }) {
  const [loggedOut, setLoggedOut] = useState(() => { try { return sessionStorage.getItem('salesbrain-logged-out') === 'true'; } catch { return false; } });
  const [density, setDensity] = useState<'comfortable' | 'compact'>(() => { try { return localStorage.getItem('salesbrain-density') === 'compact' ? 'compact' : 'comfortable'; } catch { return 'comfortable'; } });
  const [saved] = useState(readSaved);
  const [currentPage, setPage] = useState<Page>(() => parsePage(location.hash));
  const [query, setQuery] = useState<QueryState>(saved.query);
  const [tasks, setTasks] = useState<DemoTask[]>(saved.tasks);
  const [recent, setRecent] = useState(saved.recent);
  const [resetVersion, setResetVersion] = useState(0);
  const [presetQuestion, setPresetQuestion] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);
  useEffect(() => {
    const onHash = () => setPage(parsePage(location.hash));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify({ version: 1, seedVersion: 2, query, tasks, recent })); } catch { /* Keep memory state when storage is unavailable. */ }
  }, [query, tasks, recent]);
  const setCurrentPage = useCallback((page: Page) => { setPage(page); location.hash = `/${page}`; }, []);
  useEffect(() => { try { sessionStorage.setItem('salesbrain-logged-out', String(loggedOut)); } catch { /* Keep session state in memory. */ } }, [loggedOut]);
  useEffect(() => { try { localStorage.setItem('salesbrain-density', density); } catch { /* Keep preferences in memory. */ } }, [density]);
  const logout = useCallback(() => { setLoggedOut(true); setToasts([]); setPresetQuestion(''); setCurrentPage('home'); }, [setCurrentPage]);
  const enterDemo = useCallback(() => { setLoggedOut(false); setCurrentPage('home'); }, [setCurrentPage]);
  const updateQuery = useCallback((patch: Partial<QueryState>) => setQuery(prev => ({ ...prev, ...patch,
    ...(patch.selectedCustomerId !== undefined && patch.selectedCustomerId !== prev.selectedCustomerId && patch.selectedDoctorId === undefined ? { selectedDoctorId: '' } : {}),
  })), []);
  const openFeature = useCallback((id: FeatureId, patch: Partial<QueryState> = {}) => {
    setQuery(prev => {
      const next = { ...prev,
      ...(['F4', 'F5', 'F9'].includes(id) ? { selectedCustomerId: prev.selectedCustomerId || 'C001', selectedProductId: prev.selectedProductId || 'P-B' } : {}),
      ...(id === 'F6' ? { selectedProductId: prev.selectedProductId || 'P-B' } : {}), ...patch };
      if (next.selectedCustomerId !== prev.selectedCustomerId && patch.selectedDoctorId === undefined) next.selectedDoctorId = '';
      return next;
    });
    setCurrentPage(id);
  }, [setCurrentPage]);
  const addToast = useCallback((message: string, type: Toast['type'] = 'success', targetPage?: Page) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, type, targetPage }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), targetPage ? 8000 : 3500);
  }, []);
  const removeToast = useCallback((id: string) => setToasts(prev => prev.filter(t => t.id !== id)), []);
  const recordQuery = useCallback((feature: FeatureId, question: string) => setRecent(prev => [{ id: crypto.randomUUID(), feature, query: question }, ...prev].slice(0, 6)), []);
  const resetDemo = useCallback(() => {
    setQuery(initialQuery()); setTasks(initialTasks()); setRecent([]); setToasts([]); setPresetQuestion(''); setResetVersion(v => v + 1);
    setCurrentPage('home'); addToast('已重置示範資料、任務與篩選條件。');
  }, [setCurrentPage, addToast]);
  return <AppContext.Provider value={{ loggedOut, logout, enterDemo, density, setDensity, currentPage, setCurrentPage, query, updateQuery, openFeature, tasks, setTasks, recent, recordQuery,
    resetDemo, resetVersion, presetQuestion, setPresetQuestion, toasts, addToast, removeToast }}>{children}</AppContext.Provider>;
}
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
