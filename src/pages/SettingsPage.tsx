import { useApp } from '../context/AppContext.tsx';
import { Select } from '../components/DemoUI.tsx';

export default function SettingsPage() {
  const { density, setDensity, addToast } = useApp();
  return <div className="page-content settings-page">
    <h1 className="page-title">系統設定</h1>
    <p className="page-subtitle">管理你的工作介面偏好。</p>
    <section className="card detail-card">
      <h2>顯示設定</h2>
      <Select label="介面間距" value={density} options={[{ value: 'comfortable', label: '舒適' }, { value: 'compact', label: '緊湊' }]} onChange={value => {
        setDensity(value as 'comfortable' | 'compact'); addToast('顯示設定已儲存。');
      }} />
      <p>變更立即生效，並保存在目前瀏覽器。</p>
    </section>
    <section className="card detail-card"><h2>帳號資訊</h2>
      <div className="detail-grid"><div>使用者<strong>示範業務陳小晴</strong></div><div>業務編號<strong>S001</strong></div><div>角色<strong>業務人員</strong></div><div>所屬區域<strong>示範北區</strong></div></div>
      <p>目前使用示範工作階段，尚未串接企業帳號登入。</p>
    </section>
  </div>;
}
