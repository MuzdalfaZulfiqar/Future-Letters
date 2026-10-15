import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthPage from './AuthPage';
import { useAuth } from './AuthContext';
import GiftReveal from './GiftReveal';

// const BASE = 'http://localhost:5000';
const BASE = 'https://paper-star-jar.onrender.com';

const INKS = {
  sepia:    { label: 'Sepia',    color: '#7c4a1e', bg: '#fdf6ee', border: '#c9956a' },
  midnight: { label: 'Midnight', color: '#1a3a6e', bg: '#eef3fd', border: '#6a8ac8' },
  crimson:  { label: 'Crimson',  color: '#7a1a1a', bg: '#fdf0ee', border: '#c86a6a' },
  forest:   { label: 'Forest',   color: '#1a4a28', bg: '#eefdf2', border: '#6ac87a' },
  slate:    { label: 'Slate',    color: '#2a2a40', bg: '#f2f2f8', border: '#8a8ab0' },
};

const GiftIcons = {
  candle: (color) => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect x="9" y="13" width="10" height="12" rx="2" stroke={color} strokeWidth="1.5" fill="none"/>
      <path d="M14 13 Q11 9 14 5 Q17 9 14 13Z" fill={color}/>
      <line x1="6" y1="25" x2="22" y2="25" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  moonjar: (color) => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M8 11 Q6 17 8 23 L20 23 Q22 17 20 11Z" stroke={color} strokeWidth="1.5" fill="none"/>
      <rect x="9" y="7" width="10" height="5" rx="1" stroke={color} strokeWidth="1.5" fill="none"/>
      <path d="M15 6 Q18 3 20 7 Q17 6 15 9 Q13 6 15 6Z" fill={color} opacity="0.7"/>
    </svg>
  ),
  pressedrose: (color) => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <ellipse cx="14" cy="11" rx="6" ry="7" stroke={color} strokeWidth="1.5" fill="none"/>
      <ellipse cx="14" cy="10" rx="3.5" ry="4.5" stroke={color} strokeWidth="1" fill="none"/>
      <line x1="14" y1="18" x2="14" y2="25" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M14 23 Q10 21 9 17" stroke={color} strokeWidth="1" fill="none"/>
      <path d="M14 23 Q18 21 19 17" stroke={color} strokeWidth="1" fill="none"/>
    </svg>
  ),
  constellation: (color) => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <circle cx="6" cy="6" r="2" fill={color}/>
      <circle cx="22" cy="8" r="2.5" fill={color}/>
      <circle cx="12" cy="21" r="2" fill={color}/>
      <circle cx="24" cy="22" r="1.5" fill={color} opacity="0.6"/>
      <circle cx="16" cy="12" r="1.2" fill={color} opacity="0.6"/>
      <line x1="6" y1="6" x2="22" y2="8" stroke={color} strokeWidth="0.8" opacity="0.5"/>
      <line x1="22" y1="8" x2="12" y2="21" stroke={color} strokeWidth="0.8" opacity="0.5"/>
      <line x1="12" y1="21" x2="24" y2="22" stroke={color} strokeWidth="0.8" opacity="0.5"/>
    </svg>
  ),
  inkwell: (color) => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M8 12 Q7 19 11 24 L17 24 Q21 19 20 12Z" stroke={color} strokeWidth="1.5" fill="none"/>
      <ellipse cx="14" cy="12" rx="6" ry="3" stroke={color} strokeWidth="1.5" fill="none"/>
      <path d="M20 7 L26 3" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M20 7 Q22 9 21 11 Q19 9 20 7Z" fill={color}/>
    </svg>
  ),
  hourglass: (color) => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M6 3 L22 3 L14 14 L22 25 L6 25 L14 14 Z" stroke={color} strokeWidth="1.5" fill="none"/>
      <path d="M6 3 L22 3 L14 14Z" fill={color} opacity="0.25"/>
      <line x1="5" y1="3" x2="23" y2="3" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <line x1="5" y1="25" x2="23" y2="25" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
};

export const GIFTS = {
  candle:        { label: 'Candlelight',   sub: 'A flame for your night',      icon: GiftIcons.candle        },
  moonjar:       { label: 'Moon Jar',      sub: 'Moonlight caught in glass',   icon: GiftIcons.moonjar       },
  pressedrose:   { label: 'Pressed Rose',  sub: 'Sealed between pages',        icon: GiftIcons.pressedrose   },
  constellation: { label: 'Constellation', sub: 'Stars named just for you',    icon: GiftIcons.constellation },
  inkwell:       { label: 'Ink & Quill',   sub: 'Tools for timeless words',    icon: GiftIcons.inkwell       },
  hourglass:     { label: 'Hourglass',     sub: 'Time, bottled and given',     icon: GiftIcons.hourglass     },
};

const isDelivered = (l) => new Date(l.deliverAt) <= new Date();

export default function App() {
  const { token, loading } = useAuth();

  const urlParams = new URLSearchParams(window.location.search);
  const sharedGiftData = urlParams.get('gift');
  if (sharedGiftData) {
    try { return <SharedGiftPage gift={JSON.parse(atob(sharedGiftData))} />; }
    catch (e) { /* fall through */ }
  }

  if (loading) return <Loader />;
  return token ? <Starmail /> : <AuthPage />;
}

function SharedGiftPage({ gift }) {
  const [opened, setOpened] = useState(false);
  const [giftOpen, setGiftOpen] = useState(false);
  const ink = INKS[gift.inkMood] || INKS.sepia;
  const giftCfg = GIFTS[gift.giftType];

  return (
    <div style={{ minHeight: '100vh', background: '#f5ede0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Playfair Display', 'Georgia', serif" }}>
      <GlobalStyles />
      <AnimatePresence mode="wait">
        {!opened ? (
          <motion.div key="envelope"
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
            style={{ textAlign: 'center', maxWidth: 440, width: '100%' }}
          >
            <div style={{ width: 96, height: 72, margin: '0 auto 32px', position: 'relative' }}>
              <svg width="96" height="72" viewBox="0 0 96 72" fill="none">
                <rect x="2" y="2" width="92" height="68" rx="4" fill="#fdf6ee" stroke="#c9956a" strokeWidth="1.5"/>
                <path d="M2 8 L48 44 L94 8" stroke="#c9956a" strokeWidth="1.2" fill="none"/>
                <line x1="2" y1="70" x2="28" y2="48" stroke="#c9956a" strokeWidth="1" opacity="0.4"/>
                <line x1="94" y1="70" x2="68" y2="48" stroke="#c9956a" strokeWidth="1" opacity="0.4"/>
              </svg>
            </div>
            <p style={{ color: '#a07850', letterSpacing: 4, fontSize: 10, textTransform: 'uppercase', marginBottom: 12 }}>A letter has arrived for</p>
            <h2 style={{ color: '#3d2410', fontSize: 32, letterSpacing: 2, marginBottom: 8 }}>{gift.recipientName || 'You'}</h2>
            <p style={{ color: '#a07850', fontSize: 14, marginBottom: 48, fontStyle: 'italic' }}>
              from {gift.isAnonymous ? 'an anonymous sender' : gift.senderName}
            </p>
            <motion.button onClick={() => setOpened(true)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="btn-primary">
              Open Letter
            </motion.button>
          </motion.div>
        ) : (
          <motion.div key="letter"
            initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            style={{ width: '100%', maxWidth: 600 }}
          >
            {giftOpen && gift.giftType && (
              <GiftReveal giftType={gift.giftType} inkAccent={ink.color} onDismiss={() => setGiftOpen(false)} />
            )}
            <div className="letter-paper" style={{ '--ink': ink.color, '--ink-bg': ink.bg, '--ink-border': ink.border }}>
              <div className="letter-paper-header">
                <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 3, color: '#a07850', textTransform: 'uppercase' }}>Starmail</span>
                {giftCfg && (
                  <span style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: ink.color, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {giftCfg.icon(ink.color)} {giftCfg.label}
                  </span>
                )}
              </div>
              <p style={{ color: '#a07850', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>Dear {gift.recipientName || 'You'},</p>
              <div className="letter-body-text">{gift.body}</div>
              {giftCfg && (
                <div className="gift-enclosed-card" onClick={() => setGiftOpen(true)} style={{ cursor: 'pointer' }}>
                  {giftCfg.icon(ink.color)}
                  <div>
                    <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: ink.color, marginBottom: 3 }}>{giftCfg.label}</div>
                    <div style={{ fontSize: 13, color: '#7a6050', fontStyle: 'italic' }}>{giftCfg.sub} — tap to open</div>
                  </div>
                </div>
              )}
              <p style={{ marginTop: 28, color: '#a07850', fontSize: 13, fontStyle: 'italic' }}>
                — {gift.isAnonymous ? 'Anonymous' : gift.senderName}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Starmail() {
  const { token, username, logout } = useAuth();
  const [data, setData] = useState({ selfLetters: [], received: [], sent: [] });
  const [writeOpen, setWriteOpen] = useState(false);
  const [readingLetter, setReadingLetter] = useState(null);
  const [activeTab, setActiveTab] = useState('self');
  const [notification, setNotification] = useState(null);

  const notify = (msg) => { setNotification(msg); setTimeout(() => setNotification(null), 3200); };

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`${BASE}/api/letters`, { headers: { 'x-auth-token': token } });
      const d = await res.json();
      setData({
        selfLetters: Array.isArray(d.selfLetters) ? d.selfLetters : [],
        received: Array.isArray(d.received) ? d.received : [],
        sent: Array.isArray(d.sent) ? d.sent : [],
      });
    } catch (e) { console.error(e); }
  }, [token]);

  useEffect(() => { refresh(); }, [refresh]);

  const handleRead = async (letter) => {
    setReadingLetter(letter);
    if (isDelivered(letter) && !letter.readAt) {
      await fetch(`${BASE}/api/letters/${letter._id}/read`, { method: 'PATCH', headers: { 'x-auth-token': token } });
      refresh();
    }
  };

  const handleDelete = async (id) => {
    await fetch(`${BASE}/api/letters/${id}`, { method: 'DELETE', headers: { 'x-auth-token': token } });
    setReadingLetter(null); refresh(); notify('Letter removed');
  };

  const unreadCount = data.received.filter((l) => isDelivered(l) && !l.readAt).length;

  const tabs = [
    { id: 'self',  label: 'To Myself',  count: data.selfLetters.length },
    // { id: 'inbox', label: 'Received',   count: unreadCount > 0 ? unreadCount : data.received.length, unread: unreadCount > 0 },
    // { id: 'sent',  label: 'Sent',       count: data.sent.length },
  ];

  return (
    <div className="app-root">
      <GlobalStyles />

      <header className="app-header">
        <div className="app-logo">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
            <rect x="1" y="5" width="20" height="14" rx="2" stroke="#7c4a1e" strokeWidth="1.5" fill="none"/>
            <path d="M1 7 L11 14 L21 7" stroke="#7c4a1e" strokeWidth="1.2" fill="none"/>
          </svg>
          <div>
            <span className="logo-title">Starmail</span>
            <span className="logo-sub">Letters across time</span>
          </div>
        </div>

        <nav className="app-tabs" aria-label="Letter sections">
          {tabs.map((tab) => (
            <button key={tab.id} className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)} aria-current={activeTab === tab.id ? 'page' : undefined}>
              {tab.label}
              {tab.count > 0 && (
                <span className={`tab-count ${tab.unread ? 'unread' : ''}`}>{tab.count}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="app-header-right">
          <span className="user-chip">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <circle cx="7" cy="5" r="3" stroke="currentColor" strokeWidth="1.2" fill="none"/>
              <path d="M1 13 Q1 9 7 9 Q13 9 13 13" stroke="currentColor" strokeWidth="1.2" fill="none"/>
            </svg>
            {username}
          </span>
          <button className="compose-btn" onClick={() => setWriteOpen(true)}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M7 2 L7 12 M2 7 L12 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Compose
          </button>
          <button className="logout-btn" onClick={logout} aria-label="Log out" title="Log out">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M6 8 H13 M10 5 L13 8 L10 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 2 H3 Q2 2 2 3 L2 13 Q2 14 3 14 H6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </header>

      <AnimatePresence>
        {notification && (
          <motion.div className="toast" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M5 7 L6.5 8.5 L9 5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="app-main">
        <AnimatePresence mode="wait">
          {activeTab === 'self' && (
            <motion.div key="self" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <LetterGrid
                letters={data.selfLetters}
                emptyTitle="No letters to yourself yet"
                emptyMsg="Write a letter to your future self — it'll wait patiently until its date arrives."
                onSelect={handleRead}
                mode="self"
              />
            </motion.div>
          )}
          {activeTab === 'inbox' && (
            <motion.div key="inbox" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <LetterGrid
                letters={data.received}
                emptyTitle="No letters received"
                emptyMsg="No one has sent you a letter yet. Share your username so friends can write to you."
                onSelect={handleRead}
                mode="inbox"
              />
            </motion.div>
          )}
          {activeTab === 'sent' && (
            <motion.div key="sent" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <LetterGrid
                letters={data.sent}
                emptyTitle="No letters sent"
                emptyMsg="You haven't written to anyone yet. Compose a letter and share it with someone special."
                onSelect={handleRead}
                mode="sent"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {writeOpen && (
          <ComposeModal token={token} senderName={username}
            onClose={() => setWriteOpen(false)}
            onSaved={(msg) => { refresh(); notify(msg || 'Letter sealed'); }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {readingLetter && (
          <ReadModal letter={readingLetter} onClose={() => setReadingLetter(null)} onDelete={() => handleDelete(readingLetter._id)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── LETTER GRID ────────────────────────────────────────────────────────────
function LetterGrid({ letters, emptyTitle, emptyMsg, onSelect, mode }) {
  if (!letters.length) return (
    <div className="empty-state">
      <div className="empty-envelope">
        <svg width="64" height="48" viewBox="0 0 64 48" fill="none" aria-hidden="true">
          <rect x="2" y="2" width="60" height="44" rx="4" stroke="#c9956a" strokeWidth="1.5" fill="#fdf6ee"/>
          <path d="M2 6 L32 28 L62 6" stroke="#c9956a" strokeWidth="1.2" fill="none"/>
        </svg>
      </div>
      <h3 className="empty-title">{emptyTitle}</h3>
      <p className="empty-msg">{emptyMsg}</p>
    </div>
  );

  const sorted = [...letters].sort((a, b) => new Date(b.deliverAt) - new Date(a.deliverAt));

  return (
    <div className="letter-grid-container">
      <div className="letter-grid-header">
        <span>{mode === 'inbox' ? 'Received letters' : mode === 'self' ? 'Letters to yourself' : 'Sent letters'}</span>
        <span>{sorted.length} letter{sorted.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="letter-grid">
        {sorted.map((l, i) => (
          <LetterCard key={l._id} letter={l} onSelect={onSelect} mode={mode} index={i} />
        ))}
      </div>
    </div>
  );
}

function LetterCard({ letter, onSelect, mode, index }) {
  const ink = INKS[letter.inkMood] || INKS.sepia;
  const delivered = isDelivered(letter);
  const unread = delivered && !letter.readAt && mode === 'inbox';
  const daysUntil = delivered ? null : Math.ceil((new Date(letter.deliverAt) - new Date()) / 86400000);

  return (
    <motion.div
      className={`letter-card ${unread ? 'unread' : ''} ${delivered ? 'opened-letter' : 'sealed-envelope'}`}
      style={{ '--ink': ink.color, '--ink-bg': ink.bg, '--ink-border': ink.border }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ y: -3, boxShadow: '0 12px 28px rgba(124, 74, 30, 0.14)' }}
      onClick={() => onSelect(letter)}
    >
      {/* 1. FUTURE ENVELOPE ARCHITECTURE */}
      {!delivered && (
        <>
          <div className="envelope-back-folds" />
          <div className="envelope-top-flap" />
          <div className="wax-seal-dead-center">
            <div className="wax-seal-pour" style={{ background: ink.color }}>
              <div className="wax-seal-stamp">
                <span>✉</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 2. PRESENT OPENED PAPER ARCHITECTURE */}
      {delivered && <div className="paper-waterline-texture" />}

      {unread && <div className="unread-dot" aria-label="Unread" />}

      {/* Structured Content Interface */}
      <div className="envelope-content-wrapper">
        <div className="card-who">
          {mode === 'inbox'
            ? (letter.isAnonymous ? 'Anonymous sender' : `From ${letter.userId?.username || 'Unknown'}`)
            : mode === 'sent'
              ? `To ${letter.recipientId?.username || 'Unknown'}`
              : 'To my future self'
          }
        </div>

        <div className="card-date">
          {delivered
            ? new Date(letter.deliverAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
            : `Opens in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`
          }
        </div>

        <div className="card-preview">
          {delivered ? (
            <div className="read-action-badge" style={{ color: ink.color, borderColor: `${ink.color}44` }}>
              <span>Open Note</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
          ) : (
            '— Sealed Packet —'
          )}
        </div>
      </div>

      {/* Footer safely bounded internally */}
      <div className="card-footer">
        <span className="ink-dot" style={{ background: ink.color }} title={`${ink.label} ink`} aria-label={`${ink.label} ink`} />
        {letter.giftType && GIFTS[letter.giftType] && (
          <span className="gift-badge" style={{ color: ink.color, borderColor: `${ink.color}55` }}>
            {GIFTS[letter.giftType].icon(ink.color)}
            {GIFTS[letter.giftType].label}
          </span>
        )}
        <span className="card-status">{delivered ? (unread ? 'Unread' : 'Read') : 'Sealed'}</span>
      </div>
    </motion.div>
  );
}



// ── COMPOSE MODAL ─────────────────────────────────────────────────────────
function ComposeModal({ token, senderName, onClose, onSaved }) {
  const [step, setStep] = useState('write');
  const [body, setBody] = useState('');
  const [inkMood, setInkMood] = useState('sepia');
  const [anon, setAnon] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [selfDate, setSelfDate] = useState('');
  const [giftType, setGiftType] = useState(null);
  const [recipientType, setRecipientType] = useState(null); // 'self' | 'other'
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  const ink = INKS[inkMood];

  const buildShareUrl = () => {
    const data = {
      body,
      giftType,
      inkMood,
      senderName,
      recipientName: recipientName || 'You',
      isAnonymous: anon
    };
    return `${window.location.origin}${window.location.pathname}?gift=${btoa(JSON.stringify(data))}`;
  };

  const handleSealSelf = async () => {
    if (!selfDate || !body.trim()) return;
    setSaving(true);
    try {
      await fetch(`${BASE}/api/letters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({
          body,
          deliverAt: selfDate,
          inkMood,
          giftType: giftType || undefined
        }),
      });
      onSaved('Letter sealed to yourself');
      onClose();
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const steps = ['write', 'recipient', 'gift', 'confirm'];
  const stepIdx = steps.indexOf(step);

  return (
    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>

      <motion.div className="compose-modal" style={{ '--ink': ink.color, '--ink-bg': ink.bg, '--ink-border': ink.border }}
        initial={{ scale: 0.96, y: 20 }} animate={{ scale: 1, y: 0 }}>

        {/* Top bar */}
        <div className="modal-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {Object.entries(INKS).map(([k, v]) => (
              <button key={k} onClick={() => setInkMood(k)}
                className={`ink-swatch ${inkMood === k ? 'active' : ''}`}
                style={{ background: v.color }}
                aria-label={`${v.label} ink`}
              />
            ))}
          </div>
          <div className="step-pills">
            {['Write', 'Recipient', 'Gift', 'Confirm'].map((s, i) => (
              <span key={i} className={`step-pill ${i === stepIdx ? 'active' : ''} ${i < stepIdx ? 'done' : ''}`}>{s}</span>
            ))}
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 3 L13 13 M13 3 L3 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: WRITE */}
          {step === 'write' && (
            <motion.div key="write" className="modal-body"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="modal-title">Write your letter</h2>
              <div className="letter-paper-write" style={{ '--ink': ink.color, '--ink-bg': ink.bg }}>
                <div className="paper-lines" aria-hidden="true" />
                <textarea className="letter-textarea"
                  placeholder={`Dear future self,\n\nI'm writing this on a quiet afternoon…`}
                  value={body} onChange={(e) => setBody(e.target.value)} />
                <div className="word-count">{body.split(/\s+/).filter(Boolean).length} words</div>
              </div>
              <div className="modal-footer">
                <button className="btn-primary" disabled={!body.trim()} onClick={() => setStep('recipient')}>
                  Next — Choose Recipient
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M3 7 H11 M8 4 L11 7 L8 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: RECIPIENT */}
          {step === 'recipient' && (
            <motion.div key="recipient" className="modal-body"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="modal-title">Where shall this letter go?</h2>
              <div className="send-mode-grid">
                <motion.button className="send-mode-card" onClick={() => { setRecipientType('self'); setStep('confirm'); }}
                  whileHover={{ y: -2 }}>
                  <div className="send-mode-icon" style={{ color: ink.color }}>
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="9" r="5" stroke="currentColor" strokeWidth="1.5" fill="none"/><path d="M4 26 Q4 18 14 18 Q24 18 24 26" stroke="currentColor" strokeWidth="1.5" fill="none"/></svg>
                  </div>
                  <div className="send-mode-title">To Myself</div>
                  <div className="send-mode-desc">A time capsule for your future self</div>
                </motion.button>

                <motion.button className="send-mode-card" onClick={() => { setRecipientType('other'); setStep('gift'); }}
                  whileHover={{ y: -2 }}>
                  <div className="send-mode-icon" style={{ color: ink.color }}>
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="10" cy="9" r="4" stroke="currentColor" strokeWidth="1.5" fill="none"/><circle cx="20" cy="11" r="3.5" stroke="currentColor" strokeWidth="1.5" fill="none"/><path d="M2 25 Q2 18 10 18 Q14 18 16 20 Q18 17 20 17 Q26 17 26 24" stroke="currentColor" strokeWidth="1.5" fill="none"/></svg>
                  </div>
                  <div className="send-mode-title">To Someone Else</div>
                  <div className="send-mode-desc">Share via link (no account needed)</div>
                </motion.button>
              </div>

              <div className="modal-footer">
                <button className="btn-ghost" onClick={() => setStep('write')}>
                  ← Back
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: GIFT (only for other) */}
          {step === 'gift' && recipientType === 'other' && (
            <motion.div key="gift" className="modal-body"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="modal-title">Enclose a gift (optional)</h2>
              <p className="modal-sub">Choose something beautiful to go with your letter</p>
              <div className="gift-grid">
                {Object.entries(GIFTS).map(([key, g]) => (
                  <motion.button key={key} className={`gift-card ${giftType === key ? 'selected' : ''}`}
                    style={giftType === key ? { '--gc': ink.color, borderColor: ink.color, background: ink.bg } : {}}
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => setGiftType(giftType === key ? null : key)}>
                    <div className="gift-card-icon">{g.icon(giftType === key ? ink.color : '#a07850')}</div>
                    <span className="gift-card-label">{g.label}</span>
                    <span className="gift-card-sub">{g.sub}</span>
                  </motion.button>
                ))}
              </div>
              <div className="modal-footer">
                <button className="btn-ghost" onClick={() => setStep('recipient')}>← Back</button>
                <button className="btn-primary" onClick={() => setStep('confirm')}>
                  {giftType ? `Continue with ${GIFTS[giftType].label}` : 'Continue without gift'}
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: CONFIRM */}
          {step === 'confirm' && (
            <motion.div key="confirm" className="modal-body"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="modal-title">
                {recipientType === 'self' ? 'Seal to your future self' : 'Create shareable link'}
              </h2>

              {recipientType === 'self' ? (
                <>
                  <label className="field-label">Unseal on this date</label>
                  <input type="date" className="field-input" value={selfDate}
                    onChange={(e) => setSelfDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]} />
                </>
              ) : (
                <>
                  <label className="field-label">Recipient's name (optional)</label>
                  <input className="field-input" placeholder="e.g. Amara"
                    value={recipientName} onChange={(e) => setRecipientName(e.target.value)} />

                  <label className="anon-label">
                    <input type="checkbox" checked={anon} onChange={(e) => setAnon(e.target.checked)} />
                    Send anonymously
                  </label>

                  {!shareUrl ? (
                    <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => setShareUrl(buildShareUrl())}>
                      Generate Shareable Link
                    </button>
                  ) : (
                    <div style={{ marginTop: 16 }}>
                      <div className="share-url-box">{shareUrl}</div>
                      <button className="btn-primary" style={{ marginTop: 8 }}
                        onClick={() => { navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2500); }}>
                        {copied ? '✅ Copied!' : 'Copy Link'}
                      </button>
                      <p className="share-note">Anyone with this link can open the letter.</p>
                    </div>
                  )}
                </>
              )}

              {recipientType === 'self' && (
                <button className="btn-primary" style={{ marginTop: 20 }} disabled={saving || !selfDate} onClick={handleSealSelf}>
                  {saving ? 'Sealing...' : 'Seal Letter'}
                </button>
              )}

              <div className="modal-footer">
                <button className="btn-ghost" onClick={() => {
                  if (recipientType === 'self') setStep('recipient');
                  else setStep('gift');
                }}>
                  ← Back
                </button>
                {shareUrl && <button className="btn-ghost" onClick={onClose}>Done</button>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
// ── READ MODAL ─────────────────────────────────────────────────────────────
function ReadModal({ letter, onClose, onDelete }) {
  const ink = INKS[letter.inkMood] || INKS.sepia;
  const delivered = isDelivered(letter);
  const [showGift, setShowGift] = useState(false);

  useEffect(() => {
    if (delivered && letter.giftType) {
      const t = setTimeout(() => setShowGift(true), 500);
      return () => clearTimeout(t);
    }
  }, [delivered, letter.giftType]);

  return (
    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>

      {showGift && letter.giftType && (
        <GiftReveal giftType={letter.giftType} inkAccent={ink.color} onDismiss={() => setShowGift(false)} />
      )}

      <motion.div className="read-modal" style={{ '--ink': ink.color, '--ink-bg': ink.bg, '--ink-border': ink.border }}
        initial={{ scale: 0.96, y: 20 }} animate={{ scale: 1, y: 0 }}>

        <div className="modal-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, letterSpacing: 3, color: '#a07850' }}>
              REF {String(letter._id).slice(-8).toUpperCase()}
            </span>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: ink.color, display: 'inline-block' }} />
            <span style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: ink.color }}>{ink.label}</span>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 3 L13 13 M13 3 L3 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="read-meta">
          <span>{new Date(letter.deliverAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          {letter.userId?.username && !letter.isAnonymous && <span>from {letter.userId.username}</span>}
          {letter.isAnonymous && <span>from Anonymous</span>}
          {letter.recipientId?.username && <span>to {letter.recipientId.username}</span>}
        </div>

        <div className="read-body">
          {delivered ? (
            <div className="letter-paper read-paper" style={{ '--ink': ink.color, '--ink-bg': ink.bg }}>
              <div className="paper-lines" aria-hidden="true" />
              <div className="read-content">{letter.body}</div>
              {letter.giftType && GIFTS[letter.giftType] && (
                <motion.div className="gift-enclosed-card" style={{ cursor: 'pointer' }}
                  onClick={() => setShowGift(true)}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
                  <motion.div animate={{ rotate: [0, -6, 6, 0], scale: [1, 1.08, 1] }} transition={{ duration: 3, repeat: Infinity }}>
                    {GIFTS[letter.giftType].icon(ink.color)}
                  </motion.div>
                  <div>
                    <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: ink.color, marginBottom: 3 }}>
                      {GIFTS[letter.giftType].label}
                    </div>
                    <div style={{ fontSize: 13, color: '#7a6050', fontStyle: 'italic' }}>
                      {GIFTS[letter.giftType].sub} — tap to open
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="sealed-state">
              <div className="wax-seal">
                <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden="true">
                  <circle cx="28" cy="28" r="26" fill={ink.bg} stroke={ink.color} strokeWidth="1.5"/>
                  <path d="M28 15 L31 24 L40 25 L33 32 L35 41 L28 36 L21 41 L23 32 L16 25 L25 24 Z"
                    stroke={ink.color} strokeWidth="1.2" fill="none"/>
                </svg>
              </div>
              <p className="sealed-label">Sealed until</p>
              <p className="sealed-date" style={{ color: ink.color }}>
                {new Date(letter.deliverAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              {letter.giftType && GIFTS[letter.giftType] && (
                <p className="sealed-gift-hint" style={{ color: `${ink.color}88` }}>
                  A {GIFTS[letter.giftType].label} awaits inside
                </p>
              )}
            </div>
          )}
        </div>

        <div className="read-footer">
          <button className="btn-ghost-sm" onClick={onClose}>Return</button>
          <button className="btn-danger-sm" onClick={onDelete}>Remove</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Loader() {
  return (
    <div style={{ minHeight: '100vh', background: '#f5ede0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }}
        style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#7c4a1e', letterSpacing: 6, fontSize: 18 }}>
        Future letters
      </motion.div>
    </div>
  );
}

function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Courier+Prime&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');

      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      .app-root {
        min-height: 100vh;
        background: #f5ede0;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
        font-family: 'EB Garamond', Georgia, serif;
        color: #3d2410;
      }

      /* HEADER */
      .app-header {
        position: sticky; top: 0; z-index: 100;
        display: flex; align-items: center; justify-content: space-between; gap: 12px;
        padding: 12px 32px;
        background: rgba(245, 237, 224, 0.96);
        backdrop-filter: blur(12px);
        border-bottom: 1px solid #d4b896;
      }
      .app-logo { display: flex; align-items: center; gap: 12px; }
      .logo-title { display: block; font-family: 'Playfair Display', serif; font-size: 20px; color: #3d2410; letter-spacing: 1px; }
      .logo-sub { display: block; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: #a07850; font-family: 'Courier Prime', monospace; }

      .app-tabs { display: flex; gap: 2px; }
      .tab-btn {
        position: relative; background: none; border: none; border-bottom: 2px solid transparent;
        color: #a07850; font-family: 'Courier Prime', monospace; font-size: 11px; letter-spacing: 2px;
        text-transform: uppercase; padding: 8px 18px; cursor: pointer; transition: all .2s; display: flex; align-items: center; gap: 6px;
      }
      .tab-btn:hover { color: #7c4a1e; }
      .tab-btn.active { color: #7c4a1e; border-bottom-color: #7c4a1e; }
      .tab-count { background: #e8d5be; color: #7c4a1e; font-size: 10px; padding: 1px 6px; border-radius: 10px; font-family: 'Courier Prime', monospace; }
      .tab-count.unread { background: #7c4a1e; color: #fdf6ee; }

      .app-header-right { display: flex; align-items: center; gap: 10px; }
      .user-chip { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #a07850; font-family: 'Courier Prime', monospace; letter-spacing: 1px; }
      .compose-btn {
        display: flex; align-items: center; gap: 6px;
        background: #7c4a1e; color: #fdf6ee; border: none;
        font-family: 'Courier Prime', monospace; font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
        padding: 10px 20px; cursor: pointer; transition: all .2s; border-radius: 2px;
      }
      .compose-btn:hover { background: #5c3214; }
      .logout-btn { background: none; border: none; color: #a07850; cursor: pointer; transition: color .2s; display: flex; align-items: center; }
      .logout-btn:hover { color: #7c4a1e; }

      .toast {
        position: fixed; top: 70px; left: 50%; transform: translateX(-50%);
        background: #fdf6ee; border: 1px solid #c9956a; color: #7c4a1e;
        font-family: 'Courier Prime', monospace; font-size: 12px; letter-spacing: 2px;
        padding: 10px 22px; z-index: 400; display: flex; align-items: center; gap: 8px;
        box-shadow: 0 4px 16px rgba(124,74,30,0.15);
      }

      .app-main { max-width: 1100px; margin: 0 auto; padding: 36px 24px; }

      /* EMPTY STATE */
      .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; padding: 80px 0; text-align: center; }
      .empty-envelope { opacity: 0.5; }
      .empty-title { font-size: 22px; color: #7c4a1e; font-style: italic; }
      .empty-msg { font-size: 15px; color: #a07850; max-width: 360px; line-height: 1.7; }

      /* LETTER GRID */
      .letter-grid-container {
        max-height: calc(100vh - 180px);
        overflow-y: auto;
        overflow-x: hidden;
        padding-right: 4px;
      }
      .letter-grid-container::-webkit-scrollbar {
        width: 8px;
      }
      .letter-grid-container::-webkit-scrollbar-thumb {
        background: rgba(212,165,116,0.35);
        border-radius: 999px;
      }
      .letter-grid-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid #d4b896; font-family: 'Courier Prime', monospace; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #a07850; }
      .letter-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }

      /* LETTER CARD */
      .letter-card {
        position: relative; background: #fdf6ee; border: 1px solid #d4b896;
        padding: 22px 20px 16px; cursor: pointer; transition: all .2s;
        border-radius: 2px;
        box-shadow: 0 2px 8px rgba(124,74,30,0.06), 2px 2px 0 #d4b896;
      }
      .letter-card.unread { background: var(--ink-bg, #fdf6ee); border-color: var(--ink-border, #d4b896); }
      .letter-card.sealed { opacity: 0.75; }
      .card-stamp { position: absolute; top: 12px; right: 12px; }
      .unread-dot { position: absolute; top: 12px; left: 12px; width: 8px; height: 8px; border-radius: 50%; background: var(--ink, #7c4a1e); }
      .card-who { font-family: 'Courier Prime', monospace; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--ink, #7c4a1e); margin-bottom: 6px; padding-right: 28px; }
      .card-date { font-size: 13px; color: #a07850; margin-bottom: 10px; font-style: italic; }
      .card-preview { font-size: 16px; color: #5a3820; line-height: 1.6; margin-bottom: 14px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
      .card-footer { display: flex; align-items: center; gap: 8px; border-top: 1px solid #e8d5be; padding-top: 10px; flex-wrap: wrap; }
      .ink-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
      .gift-badge { display: flex; align-items: center; gap: 4px; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; border: 1px solid; padding: 2px 8px; border-radius: 2px; font-family: 'Courier Prime', monospace; }
      .card-status { margin-left: auto; font-family: 'Courier Prime', monospace; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; color: #a07850; }

      /* LETTER PAPER (shared) */
      .letter-paper {
        position: relative; background: var(--ink-bg, #fdf6ee);
        border: 1px solid #d4b896; padding: 32px 36px;
        overflow: hidden;
      }
      .paper-lines {
        position: absolute; inset: 0; pointer-events: none;
        background-image: repeating-linear-gradient(transparent, transparent 31px, #e8d5be55 31px, #e8d5be55 32px);
        background-position: 0 38px;
      }
      .letter-paper-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 14px; border-bottom: 1px solid #d4b89655; }
      .letter-body-text { font-size: 19px; font-style: italic; line-height: 2; color: #3d2410; white-space: pre-wrap; position: relative; }

      /* COMPOSE */
      .letter-paper-write { position: relative; background: var(--ink-bg, #fdf6ee); border: 1px solid #d4b896; overflow: hidden; }
      .letter-textarea {
        width: 100%; min-height: 220px; background: transparent; border: none; color: #3d2410;
        font-family: 'EB Garamond', Georgia, serif; font-size: 20px; font-style: italic; line-height: 2;
        padding: 24px 24px 12px; resize: vertical; outline: none; position: relative; z-index: 2;
      }
      .letter-textarea::placeholder { color: #c4a882; }
      .word-count { text-align: right; padding: 6px 16px 10px; font-family: 'Courier Prime', monospace; font-size: 11px; color: #a07850; letter-spacing: 1px; position: relative; z-index: 2; }

      /* GIFT ENCLOSED */
      .gift-enclosed-card {
        display: flex; align-items: center; gap: 16px;
        background: #f5ede0; border: 1px solid #d4b896; padding: 16px 20px;
        margin-top: 24px; cursor: pointer; transition: background .15s;
      }
      .gift-enclosed-card:hover { background: #ede5d4; }

      /* MODAL */
      .modal-backdrop {
        position: fixed; inset: 0; z-index: 200;
        background: rgba(61, 36, 16, 0.55); backdrop-filter: blur(8px);
        display: flex; align-items: center; justify-content: center; padding: 24px;
      }
      .compose-modal {
        width: 100%; max-width: 680px; background: #fdf6ee;
        border: 1px solid #d4b896; display: flex; flex-direction: column;
        max-height: 90vh; overflow: hidden;
        box-shadow: 0 20px 60px rgba(61,36,16,0.3), 4px 4px 0 #c9956a;
      }
      .read-modal {
        width: 100%; max-width: 620px; background: #fdf6ee;
        border: 1px solid #d4b896; display: flex; flex-direction: column;
        max-height: 90vh; overflow: hidden;
        box-shadow: 0 20px 60px rgba(61,36,16,0.3), 4px 4px 0 #c9956a;
      }
      .modal-topbar {
        display: flex; align-items: center; justify-content: space-between; gap: 12px;
        padding: 14px 22px; border-bottom: 1px solid #e8d5be;
        background: #f5ede0;
      }
      .step-pills { display: flex; gap: 4px; }
      .step-pill { font-family: 'Courier Prime', monospace; font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: #c4a882; padding: 3px 10px; border: 1px solid #e8d5be; }
      .step-pill.active { color: #7c4a1e; border-color: #7c4a1e; }
      .step-pill.done { color: #a07850; border-color: #d4b896; }
      .modal-body { flex: 1; display: flex; flex-direction: column; padding: 28px 28px 22px; gap: 16px; overflow-y: auto; }
      .modal-body::-webkit-scrollbar { width: 4px; }
      .modal-body::-webkit-scrollbar-thumb { background: #d4b896; }
      .modal-title { font-family: 'Playfair Display', serif; font-size: 20px; color: #3d2410; }
      .modal-sub { font-size: 15px; color: #a07850; font-style: italic; }
      .modal-footer { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding-top: 14px; border-top: 1px solid #e8d5be; margin-top: auto; }

      .read-meta { display: flex; flex-wrap: wrap; gap: 14px; padding: 10px 22px; border-bottom: 1px solid #e8d5be; font-family: 'Courier Prime', monospace; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #a07850; }
      .read-body { flex: 1; overflow-y: auto; padding: 24px 22px; }
      .read-body::-webkit-scrollbar { width: 4px; }
      .read-body::-webkit-scrollbar-thumb { background: #d4b896; }
      .read-paper { }
      .read-content { font-size: 20px; font-style: italic; line-height: 2; color: #3d2410; white-space: pre-wrap; position: relative; z-index: 2; }

      .sealed-state { display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 48px 0; text-align: center; }
      .wax-seal { }
      .sealed-label { font-family: 'Courier Prime', monospace; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #a07850; }
      .sealed-date { font-family: 'Playfair Display', serif; font-size: 22px; font-style: italic; }
      .sealed-gift-hint { font-size: 13px; font-style: italic; color: #a07850; }

      .read-footer { display: flex; justify-content: space-between; align-items: center; padding: 12px 22px; border-top: 1px solid #e8d5be; }

      /* GIFT GRID */
      .gift-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
      .gift-card { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 18px 10px 14px; background: #f5ede0; border: 1px solid #d4b896; cursor: pointer; transition: all .2s; font-family: inherit; text-align: center; border-radius: 2px; }
      .gift-card:hover { background: #ede5d4; border-color: #c9956a; }
      .gift-card.selected { box-shadow: 0 0 0 2px var(--gc, #7c4a1e); }
      .gift-card-icon { display: flex; align-items: center; justify-content: center; }
      .gift-card-label { font-family: 'Courier Prime', monospace; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #7c4a1e; }
      .gift-card-sub { font-size: 12px; color: #a07850; font-style: italic; line-height: 1.4; }

      /* SEND MODE */
      .send-mode-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
      .send-mode-card { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 20px 14px; background: #f5ede0; border: 1px solid #d4b896; cursor: pointer; transition: all .2s; font-family: inherit; text-align: center; border-radius: 2px; }
      .send-mode-card:hover { background: #ede5d4; border-color: #c9956a; }
      .send-mode-icon { color: #7c4a1e; }
      .send-mode-title { font-family: 'Courier Prime', monospace; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #3d2410; }
      .send-mode-desc { font-size: 12px; color: #a07850; font-style: italic; line-height: 1.5; }
      .send-controls { display: flex; flex-direction: column; gap: 6px; }

      /* INK SWATCHES */
      .ink-swatch { width: 16px; height: 16px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; transition: all .15s; }
      .ink-swatch.active { border-color: #3d2410; transform: scale(1.35); box-shadow: 0 0 0 2px #f5ede0, 0 0 0 4px #7c4a1e; }

      /* FIELDS */
      .field-label { font-family: 'Courier Prime', monospace; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #a07850; display: block; margin-bottom: 4px; }
      .field-input { width: 100%; background: #f5ede0; border: 1px solid #d4b896; color: #3d2410; font-family: 'EB Garamond', Georgia, serif; font-size: 17px; padding: 10px 14px; outline: none; transition: border-color .2s; border-radius: 2px; }
      .field-input:focus { border-color: #7c4a1e; }
      .anon-label { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #a07850; cursor: pointer; margin-top: 4px; }
      .anon-label input { accent-color: #7c4a1e; }

      /* USER DROPDOWN */
      .user-dropdown { position: absolute; top: 100%; left: 0; right: 0; background: #fdf6ee; border: 1px solid #d4b896; z-index: 10; max-height: 160px; overflow-y: auto; }
      .user-option { display: block; width: 100%; text-align: left; background: none; border: none; padding: 10px 14px; font-size: 15px; color: #3d2410; cursor: pointer; font-family: 'EB Garamond', serif; }
      .user-option:hover { background: #f5ede0; }

      /* SHARE */
      .share-url-box { font-family: 'Courier Prime', monospace; font-size: 11px; padding: 10px 12px; background: #f5ede0; border: 1px solid #d4b896; word-break: break-all; line-height: 1.6; color: #7c4a1e; }
      .share-note { font-size: 12px; color: #a07850; font-style: italic; }

      /* BUTTONS */
      .btn-primary { display: inline-flex; align-items: center; gap: 8px; background: #7c4a1e; color: #fdf6ee; border: none; font-family: 'Courier Prime', monospace; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; padding: 12px 22px; cursor: pointer; transition: all .2s; border-radius: 2px; }
      .btn-primary:hover { background: #5c3214; }
      .btn-primary:disabled { opacity: 0.35; cursor: wait; }
      .btn-ghost { display: inline-flex; align-items: center; gap: 6px; background: none; border: 1px solid #d4b896; color: #a07850; font-family: 'Courier Prime', monospace; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; padding: 12px 20px; cursor: pointer; transition: all .2s; border-radius: 2px; }
      .btn-ghost:hover { border-color: #7c4a1e; color: #7c4a1e; }
      .btn-ghost-sm { background: none; border: none; font-family: 'Courier Prime', monospace; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #a07850; cursor: pointer; transition: color .2s; }
      .btn-ghost-sm:hover { color: #3d2410; }
      .btn-danger-sm { background: none; border: none; font-family: 'Courier Prime', monospace; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #c86a6a; cursor: pointer; transition: color .2s; }
      .btn-danger-sm:hover { color: #a03030; }
      .icon-btn { background: none; border: none; color: #a07850; cursor: pointer; transition: color .2s; display: flex; align-items: center; padding: 4px; }
      .icon-btn:hover { color: #3d2410; }

      /* RESPONSIVE */
      @media (max-width: 768px) {
        .app-header { padding: 10px 16px; flex-wrap: wrap; }
        .app-tabs { order: 3; width: 100%; justify-content: center; }
        .app-main { padding: 24px 16px; }
        .letter-grid { grid-template-columns: 1fr; }
        .gift-grid { grid-template-columns: repeat(2, 1fr); }
        .send-mode-grid { grid-template-columns: 1fr; }
        .modal-backdrop { padding: 0; align-items: flex-end; }
        .compose-modal, .read-modal { max-height: 95vh; max-width: 100%; border-radius: 8px 8px 0 0; box-shadow: 0 -8px 40px rgba(61,36,16,0.2); }
        .compose-modal .modal-body, .read-modal .read-body { padding: 20px 18px 16px; }
        .logo-sub { display: none; }
        .user-chip { display: none; }
      }
      @media (max-width: 480px) {
        .gift-grid { grid-template-columns: repeat(2, 1fr); }
        .app-tabs { gap: 0; }
        .tab-btn { padding: 6px 12px; font-size: 10px; }
        .compose-btn span { display: none; }
      }
        /* CORE LAYOUT OVERRIDES */
      .letter-card {
        position: relative;
        overflow: hidden !important;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        min-height: 190px;
        box-sizing: border-box;
        padding: 15px 15px 35px !important; /* Fixed padding blocks room for footer container */
      }

      /* REAL WORLD ENVELOPE STYLES (FUTURE) */
      .letter-card.sealed-envelope {
        background: #fdf6ee;
        border: 1px solid #d4b896;
        box-shadow: 0 4px 12px rgba(124, 74, 30, 0.05);
      }

      .envelope-back-folds {
        position: absolute;
        inset: 0 0 45px 0; /* Keeps folds safely constrained inside borders above footer */
        background: 
          linear-gradient(to top right, #fbf3e6 49.5%, transparent 50%),
          linear-gradient(to top left, #fbf3e6 49.5%, transparent 50%);
        background-size: 50% 100%;
        background-position: left bottom, right bottom;
        background-repeat: no-repeat;
        opacity: 0.9;
        z-index: 1;
      }

      .envelope-top-flap {
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 40%; /* Hits the geometric visual center precisely */
        background: #f5ebd9;
        border-bottom: 1px solid rgba(212, 184, 150, 0.4);
        clip-path: polygon(0 0, 100% 0, 50% 100%);
        z-index: 2;
      }

      .wax-seal-dead-center {
        position: absolute;
        top: 40%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 3;
        filter: drop-shadow(0 3px 6px rgba(61, 36, 16, 0.28));
      }

      .wax-seal-pour {
        width: 38px;
        height: 38px;
        border-radius: 48% 52% 46% 54% / 51% 47% 53% 49%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }

      .letter-card.sealed-envelope:hover .wax-seal-pour {
        transform: scale(1.1) rotate(5deg);
      }

      .wax-seal-stamp {
        width: 25px;
        height: 25px;
        border-radius: 50%;
        border: 1px solid rgba(255, 255, 255, 0.15);
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.35), inset 0 -2px 3px rgba(255,255,255,0.1);
        background: rgba(0, 0, 0, 0.04);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .wax-seal-stamp span {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.5);
        text-shadow: -1px -1px 0px rgba(0,0,0,0.35);
      }

      /* PRESENT / OPENED LETTER STYLES */
      .letter-card.opened-letter {
        background: #fdfaf3;
        border: 1px solid #d4b896;
        box-shadow: 0 4px 14px rgba(124, 74, 30, 0.04), 2px 2px 0px #eadecc;
      }

      .paper-waterline-texture {
        position: absolute;
        inset: 0;
        pointer-events: none;
        background-image: linear-gradient(rgba(232, 213, 190, 0.15) 1px, transparent 1px);
        background-size: 100% 24px;
        opacity: 0.7;
        z-index: 1;
      }

      /* Clean call-to-action badge for opened mail */
      .read-action-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-family: 'Courier Prime', monospace;
        font-size: 11px;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        border: 1px solid;
        padding: 6px 14px;
        border-radius: 20px;
        background: rgba(253, 246, 238, 0.9);
        box-shadow: 0 2px 6px rgba(0,0,0,0.02);
        transition: all 0.2s ease;
      }

      .letter-card.opened-letter:hover .read-action-badge {
        background: var(--ink-bg);
        transform: translateY(-1px);
        box-shadow: 0 4px 10px rgba(124, 74, 30, 0.1);
      }

      /* Unified Content Presentation Layouts */
      .envelope-content-wrapper {
        position: relative;
        z-index: 4;
        display: flex;
        flex-direction: column;
        height: 100%;
        justify-content: space-between;
        pointer-events: none;
      }

      .letter-card .card-who,
      .letter-card .card-date,
      .letter-card .card-preview {
        text-align: center;
        padding-right: 0;
      }

      .sealed-envelope .card-who { margin-top: 4px; }
      .opened-letter .card-who { margin-top: 2px; }

      .sealed-envelope .card-date {
        color: #7c4a1e;
        font-weight: 600;
        margin-top: auto;
        margin-bottom: 20px; /* Perfectly bounds content clear of the center axis wax seal */
      }

      .opened-letter .card-date {
        margin-top: 6px;
        margin-bottom: 12px;
      }

      .sealed-envelope .card-preview {
        font-family: 'Courier Prime', monospace;
        font-size: 11px;
        color: #a07850;
        letter-spacing: 1px;
        margin-bottom: 4px;
      }

      .opened-letter .card-preview {
        margin-bottom: 10px;
      }

      /* INTERNALLY BOUNDED CARD FOOTER LOCKS */
      .letter-card .card-footer {
        position: absolute;
        bottom: 0; left: 0; right: 0;
        padding: 10px 20px 14px;
        background: rgba(253, 246, 238, 0.95);
        border-top: 1px solid #e8d5be;
        z-index: 5; /* Forces presentation over elements natively */
        margin: 0 !important;
      }
    `}</style>
  );
}