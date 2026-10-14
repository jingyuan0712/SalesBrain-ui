import { useEffect, useRef, useState } from 'react';
import { Sparkles, Send, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { demoData } from '../data/demo/demoData.ts';
import { routeDemoQuestion, answerDemo, demoQuestions } from '../domain/demoAgent.ts';
import type { AgentResult } from '../domain/demoAgent.ts';
import type { QueryState } from '../domain/demoState.ts';
import { features } from '../config/features.ts';
import { FeatureCard, Select, SourceNote } from '../components/DemoUI.tsx';
import HomeMoreMenu from '../components/HomeMoreMenu.tsx';

export default function HomePage() {
  const { query, updateQuery, openFeature, recordQuery, recent, setCurrentPage, setTasks, addToast, presetQuestion } = useApp();
  const [input, setInput] = useState(presetQuestion);
  const [pending, setPending] = useState(false);
  const [route, setRoute] = useState<AgentResult | null>(null);
  const [question, setQuestion] = useState('');
  const [supplement, setSupplement] = useState<Partial<QueryState>>({});
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { setInput(presetQuestion); }, [presetQuestion]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const result = route && !route.required.length ? answerDemo(route, query) : route;
  function send(text = input) {
    if (!text.trim() || pending) return;
    setQuestion(text.trim()); setPending(true); setRoute(null); setSupplement({});
    timer.current = setTimeout(() => {
      const next = routeDemoQuestion(text, query);
      updateQuery(next.patch); setRoute(next); setPending(false);
      if (next.feature) recordQuery(next.feature, text.trim());
    }, 400);
  }
  function complete() {
    if (!route) return;
    updateQuery(supplement);
    setRoute({ ...route, required: [] });
  }
  const missingValid = route?.required.every(key => key === 'month' ? !!supplement.selectedMonth : key === 'customer' ? !!supplement.selectedCustomerId : key === 'product' ? !!supplement.selectedProductId : !!supplement.selectedYear);
  return <div className="page-content home-page"><div className="home-header"><div className="home-welcome"><p className="eyebrow">歡迎回到 SalesBrain，陳小晴</p><h1>今天要完成什麼？</h1><p>用一句話查詢示範業務資料，或從常用功能開始你的工作。</p></div><HomeMoreMenu /></div>
    <form className="agent-input" onSubmit={e => { e.preventDefault(); send(); }}><Sparkles size={24} /><textarea ref={textarea} aria-label="輸入工作需求" value={input} onChange={e => setInput(e.target.value)} placeholder="例如：本月有哪些 A 級客戶還沒 Call？" onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(); } }} rows={3} />
      <button className="btn btn-primary" type="submit" disabled={pending || !input.trim()} aria-label="送出查詢"><Send size={18} /></button></form>
    <p className="agent-disclaimer">AI 回答為預設模擬，尚未連接即時模型。</p>
    <div className="prompt-chips">{demoQuestions.slice(0, 4).map((q, i) => <button key={q} onClick={() => { setInput(q); textarea.current?.focus(); }}>{['查未 Call 客戶', '比較兩月銷量', '查 O007 卡點', '查歷史報價'][i]}</button>)}</div>
    {pending && <div className="card agent-result" role="status"><div className="loading-dots"><span /><span /><span /></div>正在查詢本地示範資料…</div>}
    {result && <section className="card agent-result" aria-live="polite"><p className="eyebrow">你的問題：{question}</p><h2>{result.feature ? 'SalesBrain 查詢結果' : '目前支援的情境'}</h2><p className="answer-text">{result.text}</p>
      {result.required.length > 0 && <div className="filter-bar">{result.required.map(field => field === 'month' ? <Select key={field} label="補充月份" value={supplement.selectedMonth ?? ''} onChange={selectedMonth => setSupplement(s => ({ ...s, selectedMonth }))} options={[{ value: '', label: '請選擇月份' }, ...['2026-10', '2026-09'].map(m => ({ value: m, label: m }))]} />
        : field === 'year' ? <Select key={field} label="補充年度" value={String(supplement.selectedYear ?? '')} onChange={v => setSupplement(s => ({ ...s, selectedYear: v ? Number(v) : null }))} options={[{ value: '', label: '請選擇年度' }, { value: '2025', label: '2025' }, { value: '2026', label: '2026' }]} />
        : <Select key={field} label={field === 'customer' ? '補充客戶' : '補充產品'} value={(field === 'customer' ? supplement.selectedCustomerId : supplement.selectedProductId) ?? ''} onChange={v => setSupplement(s => ({ ...s, [field === 'customer' ? 'selectedCustomerId' : 'selectedProductId']: v }))} options={[{ value: '', label: '請選擇' }, ...(field === 'customer' ? demoData.customers : demoData.products).map(x => ({ value: x.id, label: x.name }))]} />)}<button className="btn btn-primary" disabled={!missingValid} onClick={complete}>確認條件並查詢</button></div>}
      {result.sources.length > 0 && <SourceNote systems={result.feature === 'F1' || result.feature === 'F5' ? 'CRM／知識文件' : ['F7', 'F8', 'F9'].includes(result.feature ?? '') ? 'OA／知識文件' : 'SAP／CRM／知識文件'} ids={result.sources} updated={result.updatedAt} />}
      {result.feature && !result.required.length && !result.special?.startsWith('unknown') && <div className="action-row"><button className="btn btn-primary" onClick={() => openFeature(result.feature!)}>查看完整{features.find(f => f.id === result.feature)?.title}<ArrowRight size={15} /></button><button className="btn btn-secondary" onClick={() => { setTasks(ts => [{ id: crypto.randomUUID(), name: question, customer: demoData.customers.find(c => c.id === query.selectedCustomerId)?.name ?? '', type: '查詢追蹤', createdAt: '2026-10-20', dueDate: '', status: 'pending', priority: 'medium' }, ...ts]); addToast('已儲存至本地示範任務。'); }}>儲存為任務</button></div>}
      {result.special?.startsWith('unknown') && <button className="btn btn-secondary" onClick={() => setCurrentPage('toolbox')}>到常用功能選擇查詢條件</button>}
      {!result.feature && <div className="prompt-chips">{demoQuestions.map(q => <button key={q} onClick={() => send(q)}>{q}</button>)}</div>}
    </section>}
    <div className="section-heading"><h2>常用功能</h2><button className="btn btn-ghost" onClick={() => setCurrentPage('toolbox')}>查看全部九個功能 <ArrowRight size={14} /></button></div>
    <div className="feature-grid home-features">{features.filter(f => f.enabled && f.frequent).map(f => <FeatureCard key={f.id} id={f.id} />)}</div>
    <section className="recent-section"><h2>最近查詢</h2>{recent.length ? <div className="recent-list">{recent.slice(0, 4).map(r => <button key={r.id} onClick={() => send(r.query)}><span>{r.query}</span><ArrowRight size={14} /></button>)}</div> : <p className="text-muted">還沒有查詢紀錄。選一個常用問題開始。</p>}</section>
  </div>;
}
