import { useEffect, useRef, useState } from 'react';
import { ChevronDown, CirclePlay, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { Modal, Select } from './DemoUI.tsx';
import { demoData } from '../data/demo/demoData.ts';
import SopTutorial from './SopTutorial.tsx';

export default function HomeMoreMenu() {
  const { openFeature } = useApp();
  const [open, setOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [tutorialDocId, setTutorialDocId] = useState('DOC-S1');
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const lastItem = useRef(false);
  const restoreFocus = useRef(false);

  useEffect(() => {
    if (!tutorialOpen && restoreFocus.current) {
      trigger.current?.focus(); restoreFocus.current = false;
    }
  }, [tutorialOpen]);

  useEffect(() => {
    if (!open) return;
    const items = menu.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]');
    items?.[lastItem.current ? items.length - 1 : 0]?.focus();
    const dismiss = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, [open]);

  return <>
    <div className="home-more" ref={container} onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
    }} onKeyDown={event => {
      if (event.key === 'Escape') { event.preventDefault(); setOpen(false); trigger.current?.focus(); }
    }}>
      <button ref={trigger} className="btn btn-secondary home-more-trigger" aria-haspopup="menu" aria-expanded={open} aria-controls="home-more-menu" onClick={() => { lastItem.current = false; setOpen(value => !value); }} onKeyDown={event => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault(); lastItem.current = event.key === 'ArrowUp'; setOpen(true);
        }
      }}>更多功能 <ChevronDown size={16} className={open ? 'is-open' : ''} aria-hidden="true" /></button>
      {open && <div ref={menu} id="home-more-menu" role="menu" aria-label="更多功能" className="home-more-menu" onKeyDown={event => {
        const items = Array.from(menu.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? []);
        const index = items.indexOf(document.activeElement as HTMLButtonElement);
        if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
          event.preventDefault();
          const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
          items[next]?.focus();
        }
      }}>
        <button role="menuitem" onClick={() => { setOpen(false); setTutorialOpen(true); }}><CirclePlay size={19} className="home-more-video-icon" aria-hidden="true" /><span>教學影片</span></button>
        <button role="menuitem" onClick={() => { setOpen(false); openFeature('F7', { sopId: 'DOC-S1' }); }}><FileText size={19} className="home-more-doc-icon" aria-hidden="true" /><span>相關文件與流程</span></button>
      </div>}
    </div>
    {tutorialOpen && <Modal title="教學影片" onClose={() => { restoreFocus.current = true; setTutorialOpen(false); }}>
      <Select label="選擇教學" value={tutorialDocId} onChange={setTutorialDocId} options={demoData.videos.map(video => ({ value: video.doc_id, label: video.title }))} />
      <p className="notice">目前提供可播放、暫停與重播的示範圖文動畫；尚未提供實際操作影片。</p>
      <SopTutorial key={tutorialDocId} docId={tutorialDocId} />
    </Modal>}
  </>;
}
