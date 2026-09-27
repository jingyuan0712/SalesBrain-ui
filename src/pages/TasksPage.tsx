import { useState } from 'react';
import {
  Plus, Search, X, CheckCircle, Trash2,
  AlertCircle, Clock, Building, Calendar,
  Flag
} from 'lucide-react';
import { mockTasks } from '../data/mockData';
import type { Task } from '../data/mockData';
import { useApp } from '../context/AppContext';

const statusLabel: Record<Task['status'], string> = {
  'pending': '待處理',
  'in-progress': '進行中',
  'done': '已完成',
};

const priorityLabel: Record<Task['priority'], string> = {
  high: '高', medium: '中', low: '低'
};

const statusBadgeClass: Record<Task['status'], string> = {
  'pending': 'badge-orange',
  'in-progress': 'badge-blue',
  'done': 'badge-green',
};

const priorityBadgeClass: Record<Task['priority'], string> = {
  high: 'badge-red', medium: 'badge-orange', low: 'badge-gray'
};

type FilterTab = 'all' | 'in-progress' | 'pending' | 'done';

const tabs: { id: FilterTab; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'in-progress', label: '進行中' },
  { id: 'pending', label: '待處理' },
  { id: 'done', label: '已完成' },
];

const taskTypes = ['拜訪準備', '訂單追蹤', '客戶需求', '退貨申請', '拜訪紀錄', '資料更新', '其他'];

interface AddTaskForm {
  name: string; customer: string; type: string;
  dueDate: string; priority: Task['priority'];
}

function AddTaskModal({ onClose, onAdd }: { onClose: () => void; onAdd: (t: Task) => void }) {
  const [form, setForm] = useState<AddTaskForm>({ name: '', customer: '', type: '拜訪準備', dueDate: '', priority: 'medium' });

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    const now = new Date();
    const dateStr = `${now.getFullYear()}/${String(now.getMonth()+1).padStart(2,'0')}/${String(now.getDate()).padStart(2,'0')}`;
    onAdd({
      id: Date.now().toString(), ...form, status: 'pending',
      createdAt: dateStr
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-md" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">新增任務</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={17} /></button>
        </div>
        <div className="modal-body">
          <div className="form-grid" style={{ gap: 14 }}>
            <div className="form-group">
              <label className="form-label">任務名稱 <span>*</span></label>
              <input className="input" placeholder="輸入任務名稱" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">客戶</label>
                <input className="input" placeholder="輸入客戶名稱" value={form.customer} onChange={e => setForm(f => ({ ...f, customer: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">任務類型</label>
                <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  {taskTypes.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">截止日期</label>
                <input className="input" type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">優先級</label>
                <select className="input" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Task['priority'] }))}>
                  <option value="high">高</option>
                  <option value="medium">中</option>
                  <option value="low">低</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>取消</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={!form.name.trim()}>新增任務</button>
        </div>
      </div>
    </div>
  );
}

function TaskDetailModal({ task, onClose }: { task: Task; onClose: () => void }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-md" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">任務詳情</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={17} /></button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{task.name}</h3>
              <div className="flex" style={{ gap: 8, flexWrap: 'wrap' }}>
                <span className={`badge ${statusBadgeClass[task.status]}`}>{statusLabel[task.status]}</span>
                <span className={`badge ${priorityBadgeClass[task.priority]}`}>{priorityLabel[task.priority]} 優先</span>
                <span className="badge badge-gray">{task.type}</span>
              </div>
            </div>
            <div className="divider" style={{ margin: '4px 0' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { label: '客戶', value: task.customer || '未指定', icon: Building },
                { label: '任務類型', value: task.type, icon: Flag },
                { label: '建立日期', value: task.createdAt, icon: Calendar },
                { label: '截止日期', value: task.dueDate || '未設定', icon: Clock },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.label} style={{ padding: '10px 14px', background: 'var(--bg-main)', borderRadius: 8 }}>
                    <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Icon size={12} /> {item.label}
                    </div>
                    <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-primary)' }}>{item.value}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>關閉</button>
          <button className="btn btn-primary">編輯任務</button>
        </div>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const { addToast } = useApp();
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const filteredTasks = tasks.filter(t => {
    if (activeTab !== 'all' && t.status !== activeTab) return false;
    if (search && !t.name.includes(search) && !t.customer.includes(search)) return false;
    return true;
  });

  const updateStatus = (id: string, status: Task['status']) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    addToast(status === 'done' ? '任務已標記完成 ✓' : '任務狀態已更新', 'success');
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    addToast('任務已刪除', 'info');
  };

  const addTask = (t: Task) => {
    setTasks(prev => [t, ...prev]);
    addToast('任務已新增 ✓', 'success');
  };

  const counts: Record<FilterTab, number> = {
    all: tasks.length,
    'in-progress': tasks.filter(t => t.status === 'in-progress').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    done: tasks.filter(t => t.status === 'done').length,
  };

  return (
    <>
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <h1 className="page-title">我的任務</h1>
            <p className="page-subtitle">集中管理由 AI 建立及追蹤的業務工作。</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
            <Plus size={15} /> 新增任務
          </button>
        </div>
      </div>

      <div className="page-content">
        {/* Controls */}
        <div className="flex items-center justify-between" style={{ marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div className="tab-list">
            {tabs.map(tab => (
              <button key={tab.id} className={`tab-item${activeTab === tab.id ? ' active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                {tab.label}
                <span style={{
                  marginLeft: 5, fontSize: 11, padding: '1px 7px', borderRadius: 10,
                  background: activeTab === tab.id ? 'var(--primary)' : '#E3EAF4',
                  color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)'
                }}>{counts[tab.id]}</span>
              </button>
            ))}
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="input" placeholder="搜尋任務或客戶" value={search} onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 34, width: 220 }} />
          </div>
        </div>

        {/* Task Table */}
        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><AlertCircle size={24} /></div>
            <div className="empty-state-title">目前沒有符合條件的任務</div>
            <div className="empty-state-desc">試試切換其他狀態標籤，或調整搜尋條件</div>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>任務名稱</th>
                  <th>客戶</th>
                  <th>類型</th>
                  <th>建立日期</th>
                  <th>截止日期</th>
                  <th>優先級</th>
                  <th>狀態</th>
                  <th style={{ textAlign: 'right' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map(task => (
                  <tr key={task.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedTask(task)}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {task.status === 'done'
                          ? <CheckCircle size={15} color="var(--success)" />
                          : <div style={{ width: 15, height: 15, borderRadius: '50%', border: '2px solid var(--border)', flexShrink: 0 }} />
                        }
                        <span style={{ fontWeight: 500, textDecoration: task.status === 'done' ? 'line-through' : 'none', color: task.status === 'done' ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                          {task.name}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Building size={13} color="var(--text-muted)" />
                        <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{task.customer || '—'}</span>
                      </div>
                    </td>
                    <td><span className="badge badge-gray">{task.type}</span></td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{task.createdAt}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{task.dueDate || '—'}</td>
                    <td><span className={`badge ${priorityBadgeClass[task.priority]}`}>{priorityLabel[task.priority]}</span></td>
                    <td><span className={`badge ${statusBadgeClass[task.status]}`}>{statusLabel[task.status]}</span></td>
                    <td onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end" style={{ gap: 4 }}>
                        {task.status !== 'done' && (
                          <button className="btn btn-ghost btn-icon btn-sm" title="標記完成"
                            onClick={() => updateStatus(task.id, 'done')}>
                            <CheckCircle size={15} color="var(--success)" />
                          </button>
                        )}
                        {task.status === 'done' && (
                          <button className="btn btn-ghost btn-icon btn-sm" title="恢復進行中"
                            onClick={() => updateStatus(task.id, 'in-progress')}>
                            <Clock size={15} color="var(--text-muted)" />
                          </button>
                        )}
                        <button className="btn btn-ghost btn-icon btn-sm" title="刪除"
                          onClick={() => deleteTask(task.id)}>
                          <Trash2 size={15} color="var(--danger)" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAdd && <AddTaskModal onClose={() => setShowAdd(false)} onAdd={addTask} />}
      {selectedTask && <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />}
    </>
  );
}
