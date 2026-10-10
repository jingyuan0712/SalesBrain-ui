import { useEffect, useState } from 'react';
import { demoData } from '../data/demo/demoData.ts';
export default function SopTutorial({ docId = 'DOC-S1' }: { docId?: string }) {
  const doc = demoData.documents.find(d => d.id === docId)!;
  const steps = doc.text.replace(/^示範：/, '').split('。')[0].split(' → ');
  const [seconds, setSeconds] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => setSeconds(s => Math.min(20, s + 1)), 1000);
    return () => clearInterval(timer);
  }, [playing]);
  useEffect(() => { if (seconds === 20) setPlaying(false); }, [seconds]);
  return <section className="tutorial" aria-label="示範圖文教學"><span className="badge badge-blue">本地圖文動畫 · 虛構流程</span><h3>{doc.title.replace('示範', '').replace('作業手冊', '準備').replace('手冊', '')} · 步驟 {Math.min(4, Math.floor(seconds / 5) + 1)}／4</h3>
    <strong>{steps[Math.min(3, Math.floor(seconds / 5))]}</strong><p>對應 {doc.id} {doc.locator} v{doc.version}；不是企業 OA 實際操作錄影。</p>
    <progress max={20} value={seconds} aria-label="教學播放進度" /><div className="action-row"><button className="btn btn-primary" onClick={() => { if (seconds === 20) setSeconds(0); setPlaying(v => !v); }}>{playing ? '暫停教學' : seconds === 20 ? '重新播放' : '播放教學'}</button><button className="btn btn-secondary" onClick={() => { setPlaying(false); setSeconds(0); }}>重播至開頭</button><span>{seconds}／20 秒</span></div>
  </section>;
}
