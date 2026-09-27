import { useState } from 'react';
import {
  Search, X, Building, ExternalLink, ChevronRight,
  Edit, Bot,
  Star, Phone, Mail, Info
} from 'lucide-react';
import { mockOrders, mockVisits } from '../data/mockData';
import { useApp } from '../context/AppContext';

type CustomerTab = 'overview' | 'orders' | 'visits' | 'opportunities' | 'contacts';

const customerTabs: { id: CustomerTab; label: string }[] = [
  { id: 'overview', label: '總覽' },
  { id: 'orders', label: '訂單紀錄' },
  { id: 'visits', label: '拜訪紀錄' },
  { id: 'opportunities', label: '需求與商機' },
  { id: 'contacts', label: '相關聯絡人' },
];

const statusBadge: Record<string, string> = {
  shipped: 'badge-blue', processing: 'badge-orange', delivered: 'badge-green'
};
const statusLabel: Record<string, string> = {
  shipped: '出貨中', processing: '處理中', delivered: '已交貨'
};

const opportunities = [
  { title: '產品 D 新品推廣', tag: '商機', desc: '心臟科主任提及對新品有興趣，建議安排說明會', urgency: 'high' },
  { title: '年度採購合約續簽', tag: '待追蹤', desc: '目前合約將於 Q4 到期，需提前啟動續約討論', urgency: 'medium' },
  { title: '科室擴展合作機會', tag: '商機', desc: '神經科有潛在引入需求，目前與科主任接洽中', urgency: 'low' },
];

const relatedContacts = [
  { name: '王醫師', role: '心臟內科主任', phone: '02-2345-XXXX', email: 'wang@hospital.com', primary: true },
  { name: '李主任', role: '採購主任', phone: '02-2345-XXXX', email: 'lee@hospital.com', primary: false },
  { name: '陳小姐', role: '行政助理', phone: '02-2345-XXXX', email: 'chen@hospital.com', primary: false },
];

function AISummaryCard({ onViewSource }: { onViewSource: () => void }) {
  return (
    <div className="card" style={{ background: 'linear-gradient(135deg, #EAF2FF 0%, #F5F3FF 100%)', border: '1px solid rgba(21,94,239,0.15)' }}>
      <div className="card-body">
        <div className="flex items-center" style={{ gap: 8, marginBottom: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={16} color="#fff" />
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)' }}>AI 客戶摘要</span>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)', background: '#fff', padding: '2px 8px', borderRadius: 10, border: '1px solid var(--border)' }}>示範資料</span>
        </div>
        <div style={{ fontSize: 13.5, lineHeight: 1.75, color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div><strong>近期狀況：</strong>臺北長安醫院近三個月訂單穩定，產品 A 使用量持續增長，客戶滿意度良好。</div>
          <div><strong>訂單趨勢：</strong>Q2 總金額 NT$245,000，較 Q1 成長約 15%，以產品 A 為主力。</div>
          <div><strong>歷史拜訪重點：</strong>王醫師對臨床數據要求嚴謹，重視產品安全性，過去三次拜訪均有具體進展。</div>
          <div><strong>下次拜訪建議：</strong>建議本月底前拜訪，確認 SO240705-001 出貨情況，並帶產品 D 初步資料供醫師參考。</div>
        </div>
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(21,94,239,0.12)', display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={onViewSource}>
            <Info size={12} /> 查看資料來源
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CustomersPage() {
  const { addToast } = useApp();
  const [activeTab, setActiveTab] = useState<CustomerTab>('overview');
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [searchText, setSearchText] = useState('');

  return (
    <>
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <h1 className="page-title">客戶洞察</h1>
            <p className="page-subtitle">快速掌握客戶訂單、拜訪紀錄與需求。</p>
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="input" placeholder="搜尋客戶" value={searchText} onChange={e => setSearchText(e.target.value)}
              style={{ paddingLeft: 34, width: 220 }} />
          </div>
        </div>
      </div>

      <div className="page-content">
        {/* Customer Header Card */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-body">
            <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 16 }}>
              <div className="flex items-center" style={{ gap: 16 }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building size={26} color="var(--primary)" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>臺北長安醫院</h2>
                    <span className="badge badge-blue">醫院</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: 'var(--warning)', fontWeight: 600 }}>
                      <Star size={13} fill="var(--warning)" color="var(--warning)" /> 等級 A
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 18, marginTop: 6 }}>
                    {[
                      { label: '負責業務', value: '王小美' },
                      { label: '主要聯絡人', value: '王醫師' },
                      { label: '地址', value: '台北市中山區長安東路二段100號' },
                    ].map(item => (
                      <div key={item.label} style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                        <span style={{ color: 'var(--text-muted)', marginRight: 4 }}>{item.label}：</span>
                        {item.value}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <button className="btn btn-secondary" onClick={() => addToast('開啟編輯客戶資訊（示範）', 'info')}>
                <Edit size={14} /> 編輯客戶資訊
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ borderBottom: '2px solid var(--border)', marginBottom: 24 }}>
          <div className="flex" style={{ gap: 0 }}>
            {customerTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '10px 20px', fontSize: 13.5, fontWeight: 500,
                  cursor: 'pointer', border: 'none', background: 'none', fontFamily: 'inherit',
                  color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
                  borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
                  marginBottom: -2, transition: 'all 0.15s'
                }}
              >{tab.label}</button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gap: 20 }}>
            {/* AI Summary */}
            <AISummaryCard onViewSource={() => setShowSourceModal(true)} />

            {/* Recent Orders */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">近期訂單</span>
                <button className="btn btn-ghost btn-sm" style={{ fontSize: 12 }}>查看全部 <ChevronRight size={13} /></button>
              </div>
              <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                <table>
                  <thead>
                    <tr>
                      <th>訂單日期</th><th>訂單編號</th><th>產品名稱</th>
                      <th>數量</th><th>金額</th><th>狀態</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockOrders.map(o => (
                      <tr key={o.orderNo}>
                        <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{o.date}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--primary)' }}>{o.orderNo}</td>
                        <td style={{ fontWeight: 500 }}>{o.product}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{o.qty} 箱</td>
                        <td style={{ fontWeight: 500 }}>{o.amount}</td>
                        <td><span className={`badge ${statusBadge[o.status]}`}>{statusLabel[o.status]}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Visits */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">近期拜訪紀錄</span>
                <button className="btn btn-ghost btn-sm" style={{ fontSize: 12 }}>查看全部 <ChevronRight size={13} /></button>
              </div>
              <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                <table>
                  <thead>
                    <tr>
                      <th>拜訪日期</th><th>拜訪對象</th><th>拜訪重點</th><th>下一步行動</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockVisits.map((v, i) => (
                      <tr key={i}>
                        <td style={{ color: 'var(--text-secondary)', fontSize: 13, whiteSpace: 'nowrap' }}>{v.date}</td>
                        <td style={{ fontWeight: 500 }}>{v.contact}</td>
                        <td style={{ color: 'var(--text-secondary)', maxWidth: 300 }}>{v.focus}</td>
                        <td>
                          <span style={{ fontSize: 12, background: 'var(--primary-light)', color: 'var(--primary)', padding: '3px 10px', borderRadius: 20 }}>
                            {v.nextAction}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">訂單紀錄</span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>共 {mockOrders.length} 筆</span>
            </div>
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>訂單日期</th><th>訂單編號</th><th>產品名稱</th>
                    <th>數量</th><th>金額</th><th>狀態</th><th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {mockOrders.map(o => (
                    <tr key={o.orderNo}>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{o.date}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--primary)' }}>{o.orderNo}</td>
                      <td style={{ fontWeight: 500 }}>{o.product}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{o.qty} 箱</td>
                      <td style={{ fontWeight: 500 }}>{o.amount}</td>
                      <td><span className={`badge ${statusBadge[o.status]}`}>{statusLabel[o.status]}</span></td>
                      <td><button className="btn btn-ghost btn-sm" onClick={() => addToast('查看訂單詳情（示範）', 'info')}><ExternalLink size={13} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'visits' && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">拜訪紀錄</span>
              <button className="btn btn-primary btn-sm" onClick={() => addToast('開啟建立拜訪紀錄（示範）', 'info')}>
                + 新增拜訪紀錄
              </button>
            </div>
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table>
                <thead>
                  <tr><th>拜訪日期</th><th>拜訪對象</th><th>拜訪重點</th><th>下一步行動</th></tr>
                </thead>
                <tbody>
                  {mockVisits.map((v, i) => (
                    <tr key={i}>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 13, whiteSpace: 'nowrap' }}>{v.date}</td>
                      <td style={{ fontWeight: 500 }}>{v.contact}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{v.focus}</td>
                      <td style={{ color: 'var(--primary)', fontSize: 13 }}>{v.nextAction}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'opportunities' && (
          <div style={{ display: 'grid', gap: 14 }}>
            {opportunities.map((opp, i) => (
              <div key={i} className="card" style={{ padding: 18 }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                  <div className="flex items-center" style={{ gap: 10 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{opp.title}</span>
                    <span className={`badge ${opp.tag === '商機' ? 'badge-purple' : 'badge-orange'}`}>{opp.tag}</span>
                  </div>
                  <span className={`badge ${opp.urgency === 'high' ? 'badge-red' : opp.urgency === 'medium' ? 'badge-orange' : 'badge-gray'}`}>
                    {opp.urgency === 'high' ? '高優先' : opp.urgency === 'medium' ? '中優先' : '低優先'}
                  </span>
                </div>
                <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{opp.desc}</p>
                <button className="btn btn-secondary btn-sm" style={{ marginTop: 12 }} onClick={() => addToast('建立追蹤任務（示範）', 'info')}>
                  + 建立追蹤任務
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'contacts' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {relatedContacts.map((c, i) => (
              <div key={i} className="card" style={{ padding: 18 }}>
                <div className="flex items-center" style={{ gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: 'var(--primary)' }}>
                    {c.name[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {c.name}
                      {c.primary && <span className="badge badge-blue" style={{ fontSize: 10 }}>主要聯絡</span>}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{c.role}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className="flex items-center" style={{ gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <Phone size={13} /> {c.phone}
                  </div>
                  <div className="flex items-center" style={{ gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <Mail size={13} /> {c.email}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Source Modal */}
      {showSourceModal && (
        <div className="modal-overlay" onClick={() => setShowSourceModal(false)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">AI 摘要資料來源</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowSourceModal(false)}><X size={17} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {['SAP 訂單系統（SO240705-001, SO240612-003, SO240520-002）', 'CRM 拜訪紀錄（2024/07/05, 2024/06/20, 2024/05/15）', '企業知識庫：臺北長安醫院成功導入案例'].map(s => (
                  <div key={s} className="flex items-center" style={{ gap: 10, padding: '10px 14px', background: 'var(--bg-main)', borderRadius: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <Info size={14} color="var(--primary)" /> {s}
                  </div>
                ))}
              </div>
              <p style={{ marginTop: 14, fontSize: 12, color: 'var(--text-muted)' }}>以上為示範資料來源，實際資料將連結至企業各系統。</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
