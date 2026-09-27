import React, { useState, useRef } from 'react';
import {
  Sparkles, Send, ChevronDown, PlayCircle, FileText,
  Phone, Clock, Building, Package, User, Search,
  ClipboardList, RefreshCcw, ArrowRight, Bot, X,
  Loader2, ExternalLink, BookmarkPlus
} from 'lucide-react';
import { mockRecentItems, mockAIResponses } from '../data/mockData';
import { useApp } from '../context/AppContext';

// ── More Features Modal ──────────────────────────────────────────────
const tutorialData = [
  { title: '如何使用 AI 查詢訂單', duration: '3:24', category: '基礎操作' },
  { title: '快速準備客戶拜訪資料', duration: '5:12', category: '拜訪管理' },
  { title: '案例教練功能介紹', duration: '4:08', category: '進階功能' },
  { title: '知識庫搜尋技巧', duration: '2:50', category: '知識管理' },
];

const documentData = [
  { title: '業務作業 SOP', format: 'PDF' },
  { title: '產品通路編碼對照表', format: 'Excel' },
  { title: '退貨流程說明', format: 'PDF' },
  { title: 'PM 名冊（2024 Q3）', format: 'PDF' },
  { title: '新進業務使用指南', format: 'PDF' },
];

const contactData = [
  { name: '陳志遠', dept: '心血管事業部 PM', phone: '02-2345-6789 #201', email: 'chen.zy@company.com' },
  { name: '林美玲', dept: '醫材事業部 PM', phone: '02-2345-6789 #305', email: 'lin.ml@company.com' },
  { name: '張建國', dept: '新產品部 PM', phone: '02-2345-6789 #412', email: 'chang.jk@company.com' },
  { name: 'IT 支援', dept: '資訊部', phone: '02-2345-6789 #100', email: 'it@company.com' },
];

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-md" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={17} /></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

// ── Prompt Chips ──
const promptChips = [
  { label: '查詢訂單', prompt: '查詢臺北長安醫院最近三個月的訂單狀況' },
  { label: '拜訪準備', prompt: '整合臺北長安醫院客戶資訊，協助準備本週拜訪重點' },
  { label: '找產品 PM', prompt: '查詢產品 A 及產品 B 的負責 PM 聯絡資訊' },
  { label: '建立拜訪紀錄', prompt: '協助建立王醫師的拜訪紀錄' },
  { label: '申請退貨', prompt: '查詢退貨申請流程及所需文件' },
];

const quickCards = [
  { id: 'order', icon: ClipboardList, color: '#155EEF', bg: '#EAF2FF', title: '查詢訂單', desc: '快速查詢客戶訂單與出貨狀態', prompt: 'order' },
  { id: 'visit', icon: Building, color: '#F97316', bg: '#FFF7ED', title: '拜訪準備', desc: '整合客戶資訊、訂單及歷史拜訪紀錄', prompt: 'visit' },
  { id: 'pm', icon: User, color: '#7C3AED', bg: '#F5F3FF', title: '找產品 PM', desc: '查詢產品負責人及聯絡窗口', prompt: 'pm' },
  { id: 'record', icon: FileText, color: '#17B26A', bg: '#ECFDF3', title: '建立拜訪紀錄', desc: '填寫拜訪資訊，產生 CRM 紀錄草稿', prompt: '' },
  { id: 'return', icon: RefreshCcw, color: '#EF4444', bg: '#FEF2F2', title: '申請退貨', desc: '查詢退貨流程及申請所需資料', prompt: '' },
];

const recentIcons: Record<string, React.FC<{ size?: number }>> = {
  building: Building, package: Package, user: User, search: Search
};

// ── AI Message types ──
interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  sources?: string[];
  timestamp: string;
}

function getTimeStr() {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
}

function getAIResponse(input: string) {
  const lower = input.toLowerCase();
  if (lower.includes('訂單') || lower.includes('order')) return mockAIResponses.order;
  if (lower.includes('拜訪') || lower.includes('visit')) return mockAIResponses.visit;
  if (lower.includes('pm') || lower.includes('負責人') || lower.includes('聯絡')) return mockAIResponses.pm;
  return mockAIResponses.default;
}

export default function HomePage() {
  const { addToast, setCurrentPage } = useApp();
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalType, setModalType] = useState<'tutorial' | 'docs' | 'contacts' | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const openModal = (type: 'tutorial' | 'docs' | 'contacts') => {
    setModalType(type);
    setDropdownOpen(false);
  };

  const handleChip = (prompt: string) => {
    setInputValue(prompt);
    textareaRef.current?.focus();
  };

  const handleQuickCard = (card: typeof quickCards[0]) => {
    if (card.prompt) {
      const mockKey = card.prompt as keyof typeof mockAIResponses;
      const response = mockAIResponses[mockKey];
      const userMsg: Message = { id: Date.now().toString(), role: 'user', content: card.title + '：' + card.desc, timestamp: getTimeStr() };
      setMessages(prev => [...prev, userMsg]);
      setIsLoading(true);
      setTimeout(() => {
        const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'ai', content: response.response, sources: response.sources, timestamp: getTimeStr() };
        setMessages(prev => [...prev, aiMsg]);
        setIsLoading(false);
      }, 1200);
    } else {
      addToast(`正在開啟${card.title}功能...`, 'info');
    }
  };

  const handleSend = () => {
    if (!inputValue.trim() || isLoading) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: inputValue.trim(), timestamp: getTimeStr() };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    const response = getAIResponse(inputValue);
    setInputValue('');
    setTimeout(() => {
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'ai', content: response.response, sources: response.sources, timestamp: getTimeStr() };
      setMessages(prev => [...prev, aiMsg]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="page-content" style={{ maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      {/* Header row */}
      <div className="flex items-center justify-between" style={{ marginBottom: 32 }}>
        <div>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: 4 }}>早安，王小美 ☀️</p>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px', lineHeight: 1.2 }}>今天要完成什麼？</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6, maxWidth: 600 }}>
            用一句話告訴我你的工作需求，SalesBrain 將整合 SAP、CRM、OA 與企業知識，提供答案、操作教學與下一步。
          </p>
        </div>
        {/* More features dropdown */}
        <div className="dropdown-wrapper">
          <button
            className="btn btn-secondary"
            onClick={() => setDropdownOpen(v => !v)}
            style={{ gap: 6 }}
          >
            更多功能 <ChevronDown size={14} />
          </button>
          {dropdownOpen && (
            <div className="dropdown-menu">
              <button className="dropdown-item" onClick={() => openModal('tutorial')}>
                <PlayCircle size={15} color="var(--primary)" /> 教學影片
              </button>
              <button className="dropdown-item" onClick={() => openModal('docs')}>
                <FileText size={15} color="var(--success)" /> 相關文件與流程
              </button>
              <button className="dropdown-item" onClick={() => openModal('contacts')}>
                <Phone size={15} color="var(--orange)" /> 聯絡窗口
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── AI Input Box ── */}
      <div style={{
        background: '#fff', border: '2px solid var(--primary)', borderRadius: 16,
        boxShadow: '0 4px 24px rgba(21,94,239,0.12)', padding: '12px 14px',
        display: 'flex', alignItems: 'flex-start', gap: 12, maxWidth: 1000, marginBottom: 12
      }}>
        <div style={{ paddingTop: 6 }}>
          <Sparkles size={22} color="var(--primary)" />
        </div>
        <textarea
          ref={textareaRef}
          className="input"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="例如：查詢最近三個月訂單，並整理下次拜訪重點"
          rows={2}
          style={{
            border: 'none', boxShadow: 'none', resize: 'none', fontSize: 15,
            padding: '4px 0', flex: 1, background: 'transparent', lineHeight: 1.6
          }}
        />
        <button
          className="btn btn-primary"
          onClick={handleSend}
          disabled={!inputValue.trim() || isLoading}
          style={{ borderRadius: 10, padding: '9px 14px', marginTop: 2, flexShrink: 0 }}
        >
          {isLoading ? <Loader2 size={17} style={{ animation: 'spin 0.6s linear infinite' }} /> : <Send size={17} />}
        </button>
      </div>

      {/* Prompt Chips */}
      <div className="flex" style={{ gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
        {promptChips.map(chip => (
          <button
            key={chip.label}
            onClick={() => handleChip(chip.prompt)}
            style={{
              padding: '5px 14px', borderRadius: 20, fontSize: 13,
              background: 'var(--primary-light)', color: 'var(--primary)',
              border: '1px solid rgba(21,94,239,0.15)', cursor: 'pointer',
              fontWeight: 500, transition: 'all 0.15s', fontFamily: 'inherit'
            }}
            onMouseEnter={e => { (e.target as HTMLElement).style.background = 'var(--primary)'; (e.target as HTMLElement).style.color = '#fff'; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.background = 'var(--primary-light)'; (e.target as HTMLElement).style.color = 'var(--primary)'; }}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* ── AI Conversation ── */}
      {messages.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {messages.map(msg => (
              <div key={msg.id}>
                {msg.role === 'user' ? (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{
                      background: 'var(--primary)', color: '#fff', padding: '10px 16px',
                      borderRadius: '14px 14px 4px 14px', maxWidth: '75%', fontSize: 14, lineHeight: 1.6
                    }}>
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 10, background: 'var(--primary-light)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      <Bot size={17} color="var(--primary)" />
                    </div>
                    <div className="card" style={{ flex: 1, padding: 16, borderRadius: 14 }}>
                      <pre style={{ fontFamily: 'inherit', fontSize: 13.5, whiteSpace: 'pre-wrap', lineHeight: 1.75, color: 'var(--text-primary)', margin: 0 }}>{msg.content}</pre>
                      {msg.sources && (
                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>資料來源：</span>
                          {msg.sources.map(s => (
                            <span key={s} style={{ fontSize: 12, background: 'var(--border-light)', padding: '2px 10px', borderRadius: 10, color: 'var(--text-secondary)' }}>{s}</span>
                          ))}
                        </div>
                      )}
                      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => addToast('已儲存為任務', 'success')}>
                          <BookmarkPlus size={13} /> 儲存為任務
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => setCurrentPage('customers')}>
                          <ExternalLink size={13} /> 前往客戶洞察
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bot size={17} color="var(--primary)" />
                </div>
                <div className="card" style={{ padding: '14px 18px', borderRadius: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-secondary)', fontSize: 13 }}>
                    <div className="loading-dots"><span /><span /><span /></div>
                    正在整合 SAP、CRM 與企業知識庫…
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Quick Work Cards + Recent ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24 }}>
        {/* Quick Cards */}
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 14 }}>常用工作</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {quickCards.map(card => {
              const Icon = card.icon;
              return (
                <div
                  key={card.id}
                  className="card"
                  style={{ padding: '16px', cursor: 'pointer', transition: 'all 0.18s' }}
                  onClick={() => handleQuickCard(card)}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}
                >
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                    <Icon size={19} color={card.color} />
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{card.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{card.desc}</div>
                  <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 4, color: card.color, fontSize: 12, fontWeight: 500 }}>
                    立即使用 <ArrowRight size={12} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent */}
        <div>
          <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>最近使用</h2>
            <button className="btn btn-ghost btn-sm" style={{ fontSize: 12 }}>查看全部</button>
          </div>
          <div className="card" style={{ overflow: 'hidden' }}>
            {mockRecentItems.map((item, i) => {
              const IconComp = recentIcons[item.icon] || Search;
              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                    borderBottom: i < mockRecentItems.length - 1 ? '1px solid var(--border-light)' : 'none',
                    cursor: 'pointer', transition: 'background 0.12s'
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-main)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--primary)' }}>
                    <IconComp size={15} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>{item.action}</div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Clock size={11} /> {item.time}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      {modalType === 'tutorial' && (
        <Modal title="教學影片" onClose={() => setModalType(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {tutorialData.map((v, i) => (
              <div key={i} className="card" style={{ padding: '12px 16px', cursor: 'pointer' }}
                onClick={() => { addToast('即將播放教學影片（示範）', 'info'); setModalType(null); }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <PlayCircle size={18} color="var(--primary)" />
                    </div>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-primary)' }}>{v.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{v.category} · {v.duration}</div>
                    </div>
                  </div>
                  <ArrowRight size={15} color="var(--text-muted)" />
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {modalType === 'docs' && (
        <Modal title="相關文件與流程" onClose={() => setModalType(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {documentData.map((d, i) => (
              <div key={i} className="card" style={{ padding: '12px 16px', cursor: 'pointer' }}
                onClick={() => { addToast(`正在開啟《${d.title}》（示範）`, 'info'); }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText size={18} color="var(--primary)" />
                    <span style={{ fontSize: 13.5, fontWeight: 500 }}>{d.title}</span>
                  </div>
                  <span className="badge badge-blue">{d.format}</span>
                </div>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 14, fontSize: 12, color: 'var(--text-muted)' }}>
            * 以上為示範資料，實際文件將連結至企業文件管理系統。
          </p>
        </Modal>
      )}

      {modalType === 'contacts' && (
        <Modal title="聯絡窗口" onClose={() => setModalType(null)}>
          <div style={{ display: 'grid', gap: 12 }}>
            {contactData.map((c, i) => (
              <div key={i} className="card" style={{ padding: '14px 18px' }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                  <div className="flex items-center gap-10">
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={16} color="var(--primary)" />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{c.dept}</div>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => addToast('撥打電話（示範）', 'info')}>
                    <Phone size={12} /> {c.phone}
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => addToast('開啟郵件（示範）', 'info')}>
                    {c.email}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
            * 以上為示範聯絡資料，非真實企業聯絡資訊。
          </p>
        </Modal>
      )}
    </div>
  );
}
