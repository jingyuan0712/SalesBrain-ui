import { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import type { DemoTask } from '../domain/demoState.ts';
import { demoData } from '../data/demo/demoData.ts';
import { Select, Modal, Empty } from '../components/DemoUI.tsx';
const statuses = { pending: '待處理', 'in-progress': '進行中', done: '已完成' };
function TaskEditor({ task, onClose }: { task?: DemoTask; onClose: () => void }) {
  const { setTasks, addToast } = useApp();
  const [form, setForm] = useState<DemoTask>(task ?? { id: crypto.randomUUID(), name: '', customer: '', type: '拜訪準備', createdAt: '2026-10-20', dueDate: '', status: 'pending', priority: 'medium' });
  return <Modal title={task ? '編輯任務' : '新增任務'} onClose={onClose}><form onSubmit={e => { e.preventDefault(); if (!form.name.trim()) return; setTasks(ts => task ? ts.map(t => t.id === task.id ? { ...form, name: form.name.trim() } : t) : [{ ...form, name: form.name.trim() }, ...ts]); addToast(task ? '已更新本地任務。' : '已新增本地任務。'); onClose(); }} className="form-grid">
    <label className="filter-field"><span>任務名稱（必填）</span><input className="input" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></label>
    <Select label="客戶" value={form.customer} onChange={customer => setForm(f => ({ ...f, customer }))} options={[{ value: '', label: '未指定' }, ...demoData.customers.map(c => ({ value: c.name, label: c.name }))]} />
    <Select label="任務類型" value={form.type} onChange={type => setForm(f => ({ ...f, type }))} options={['拜訪準備', '訂單追蹤', '客戶需求', '查詢追蹤', '退貨申請', '拜訪紀錄', '資料更新', '其他'].map(t => ({ value: t, label: t }))} />
    <label className="filter-field"><span>截止日期</span><input className="input" type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} /></label>
    <Select label="優先級" value={form.priority} onChange={v => setForm(f => ({ ...f, priority: v as DemoTask['priority'] }))} options={[{ value: 'high', label: '高' }, { value: 'medium', label: '中' }, { value: 'low', label: '低' }]} />
    <button type="submit" className="btn btn-primary" disabled={!form.name.trim()}>儲存任務</button><p className="text-muted">只保存於瀏覽器 Demo，不寫入 CRM。固定建立日期：2026-10-20。</p>
  </form></Modal>;
}
export default function TasksPage() {
  const { tasks, setTasks, addToast } = useApp();
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<DemoTask | 'new' | null>(null);
  const [detail, setDetail] = useState<DemoTask | null>(null);
  const rows = tasks.filter(t => (!status || t.status === status) && `${t.name}${t.customer}`.includes(search));
  return <div className="page-content"><div className="section-heading"><div><h1 className="page-title">我的任務</h1><p className="page-subtitle">保存查詢與拜訪準備工作；切頁或重新整理後仍可繼續。</p></div><button className="btn btn-primary" onClick={() => setEditing('new')}>新增任務</button></div>
    <div className="filter-bar"><Select label="任務狀態" value={status} onChange={setStatus} options={[{ value: '', label: `全部（${tasks.length}）` }, ...Object.entries(statuses).map(([value, label]) => ({ value, label: `${label}（${tasks.filter(t => t.status === value).length}）` }))]} /><label className="filter-field"><span>搜尋任務或客戶</span><input className="input" value={search} onChange={e => setSearch(e.target.value)} /></label></div>
    {rows.length ? <div className="table-container" role="region" aria-label="任務列表" tabIndex={0}><table className="responsive-table" role="table" aria-label="任務列表"><thead role="rowgroup"><tr role="row"><th role="columnheader" scope="col">任務名稱</th><th role="columnheader" scope="col">客戶</th><th role="columnheader" scope="col">類型</th><th role="columnheader" scope="col">建立／截止日期</th><th role="columnheader" scope="col">優先級</th><th role="columnheader" scope="col">狀態</th><th role="columnheader" scope="col">操作</th></tr></thead><tbody role="rowgroup">{rows.map(t => <tr role="row" key={t.id}><td role="cell" data-label="任務名稱"><div className="table-cell-value"><button className="text-link" onClick={() => setDetail(t)}>{t.name}</button></div></td><td role="cell" data-label="客戶"><div className="table-cell-value">{t.customer || '未指定'}</div></td><td role="cell" data-label="類型"><div className="table-cell-value">{t.type}</div></td><td role="cell" data-label="建立／截止日期"><div className="table-cell-value">{t.createdAt}<small className="table-id">{t.dueDate || '未設截止日期'}</small></div></td><td role="cell" data-label="優先級"><div className="table-cell-value">{{ high: '高', medium: '中', low: '低' }[t.priority]}</div></td><td role="cell" data-label="狀態"><div className="table-cell-value"><select className="input" aria-label={`${t.name}狀態`} value={t.status} onChange={e => { setTasks(ts => ts.map(x => x.id === t.id ? { ...x, status: e.target.value as DemoTask['status'] } : x)); addToast('任務狀態已更新。'); }}>{Object.entries(statuses).map(([v, label]) => <option key={v} value={v}>{label}</option>)}</select></div></td><td role="cell" data-label="操作"><div className="table-cell-value"><div className="action-row"><button className="btn btn-secondary btn-sm" onClick={() => setEditing(t)}>編輯</button><button className="btn btn-ghost btn-sm" onClick={() => { setTasks(ts => ts.filter(x => x.id !== t.id)); addToast('已刪除本地任務。'); }}>刪除</button></div></div></td></tr>)}</tbody></table></div> : <Empty />}
    {editing && <TaskEditor task={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />}
    {detail && <Modal title="任務詳情" onClose={() => setDetail(null)}><h3>{detail.name}</h3><p>{detail.customer || '未指定客戶'} · {detail.type} · {statuses[detail.status]}</p><p>建立 {detail.createdAt} · 截止 {detail.dueDate || '未設定'}</p><button className="btn btn-primary" onClick={() => { setEditing(detail); setDetail(null); }}>編輯任務</button></Modal>}
  </div>;
}
