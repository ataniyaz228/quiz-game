import { useState } from 'react';
import { Database as DbIcon, ArrowLeft, Box, FileCode, Link as LinkIcon, Key, ChevronRight, X, Check, Clipboard } from 'lucide-react';

interface Props { onBack: () => void; }

const TABLES = {
  users: {
    label: 'Users', color: '#ff2060', grad: 'from-pink',
    desc: 'Жүйедегі барлық ойыншылар туралы мәліметтерді сақтайды.',
    fields: [
      { name: 'id', type: 'SERIAL', pk: true, note: 'Бірегей идентификатор (басты кілт)' },
      { name: 'name', type: 'VARCHAR(255)', pk: false, note: 'Ойыншының аты' },
      { name: 'role', type: 'VARCHAR(50)', pk: false, note: 'Қолданушы рөлі (admin/player/guest)' },
    ],
  },
  questions: {
    label: 'Questions', color: '#00ffc8', grad: 'from-cyan',
    desc: 'Тест сұрақтарының банкін сақтайды. Games кестесімен тікелей байланысы жоқ.',
    fields: [
      { name: 'id', type: 'SERIAL', pk: true, note: 'Бірегей идентификатор (басты кілт)' },
      { name: 'question_text', type: 'TEXT', pk: false, note: 'Сұрақтың мәтіні' },
      { name: 'option_a', type: 'VARCHAR(255)', pk: false, note: 'А жауап нұсқасы' },
      { name: 'option_b', type: 'VARCHAR(255)', pk: false, note: 'Б жауап нұсқасы' },
      { name: 'option_c', type: 'VARCHAR(255)', pk: false, note: 'В жауап нұсқасы' },
      { name: 'option_d', type: 'VARCHAR(255)', pk: false, note: 'Г жауап нұсқасы' },
      { name: 'correct_answer', type: "VARCHAR(1)", pk: false, note: 'Дұрыс жауап (A/B/C/D)' },
    ],
  },
  games: {
    label: 'Games', color: '#ff6b35', grad: 'from-orange',
    desc: 'Өткен ойындардың нәтижелерін сақтайды. Users кестесіне 3 сыртқы кілт арқылы байланысқан.',
    fields: [
      { name: 'id', type: 'SERIAL', pk: true, note: 'Бірегей идентификатор (басты кілт)' },
      { name: 'player1_id', type: 'INTEGER', pk: false, fk: 'Users.id', note: '1-ші ойыншы (сыртқы кілт)' },
      { name: 'player2_id', type: 'INTEGER', pk: false, fk: 'Users.id', note: '2-ші ойыншы (сыртқы кілт)' },
      { name: 'winner_id', type: 'INTEGER', pk: false, fk: 'Users.id', nullable: true, note: 'Жеңімпаз (нөл болуы мүмкін)' },
    ],
  },
  notifications: {
    label: 'Notifications', color: '#9333ea', grad: 'from-purple',
    desc: 'Жүйелік хабарламалар мен ескертулер.',
    fields: [
      { name: 'id', type: 'SERIAL', pk: true, note: 'Бірегей идентификатор' },
      { name: 'user_id', type: 'INTEGER', pk: false, fk: 'Users.id', note: 'Хабарлама алушы' },
      { name: 'title', type: 'VARCHAR(255)', pk: false, note: 'Тақырыбы' },
      { name: 'message', type: 'TEXT', pk: false, note: 'Мәтіні' },
      { name: 'is_read', type: 'BOOLEAN', pk: false, note: 'Оқылған/оқылмаған күйі' },
      { name: 'created_at', type: 'BIGINT', pk: false, note: 'Құрылған уақыты' },
    ],
  },
  messages: {
    label: 'Messages', color: '#3b82f6', grad: 'from-blue',
    desc: 'Қолданушылар арасындағы чат хабарламалары.',
    fields: [
      { name: 'id', type: 'SERIAL', pk: true, note: 'Бірегей идентификатор' },
      { name: 'sender_id', type: 'INTEGER', pk: false, fk: 'Users.id', note: 'Жіберуші' },
      { name: 'receiver_id', type: 'INTEGER', pk: false, fk: 'Users.id', note: 'Қабылдаушы' },
      { name: 'message_text', type: 'TEXT', pk: false, note: 'Хабарлама мәтіні' },
      { name: 'is_read', type: 'BOOLEAN', pk: false, note: 'Оқылған/оқылмаған күйі' },
      { name: 'created_at', type: 'BIGINT', pk: false, note: 'Жіберілген уақыты' },
    ],
  },
};

type TableKey = keyof typeof TABLES;

const SQL = `-- ============================================
-- Quiz Battle — Мәліметтер Базасы Схемасы
-- ============================================

CREATE TABLE Users (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'player'
);

CREATE TABLE Questions (
    id             SERIAL PRIMARY KEY,
    question_text  TEXT         NOT NULL,
    option_a       VARCHAR(255) NOT NULL,
    option_b       VARCHAR(255) NOT NULL,
    option_c       VARCHAR(255) NOT NULL,
    option_d       VARCHAR(255) NOT NULL,
    correct_answer VARCHAR(1)   NOT NULL
        CHECK (correct_answer IN ('A','B','C','D'))
);

-- Games.player1_id, player2_id, winner_id → Users.id
CREATE TABLE Games (
    id         SERIAL PRIMARY KEY,
    player1_id INTEGER NOT NULL
        REFERENCES Users(id) ON DELETE CASCADE,
    player2_id INTEGER NOT NULL
        REFERENCES Users(id) ON DELETE CASCADE,
    winner_id  INTEGER
        REFERENCES Users(id) ON DELETE SET NULL
);

CREATE TABLE Notifications (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    title      VARCHAR(255) NOT NULL,
    message    TEXT NOT NULL,
    is_read    BOOLEAN DEFAULT FALSE,
    created_at BIGINT NOT NULL
);

CREATE TABLE Messages (
    id           SERIAL PRIMARY KEY,
    sender_id    INTEGER NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    receiver_id  INTEGER NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    is_read      BOOLEAN DEFAULT FALSE,
    created_at   BIGINT NOT NULL
);`;

const DBML = `Table Users {
  id   int [pk, increment]
  name varchar [not null]
  role varchar [default: 'player']
}

Table Questions {
  id             int     [pk, increment]
  question_text  text    [not null]
  option_a       varchar [not null]
  option_b       varchar [not null]
  option_c       varchar [not null]
  option_d       varchar [not null]
  correct_answer varchar [not null]
}

Table Games {
  id         int [pk, increment]
  player1_id int [not null, ref: > Users.id]
  player2_id int [not null, ref: > Users.id]
  winner_id  int [ref: > Users.id]
}

Table Notifications {
  id         int     [pk, increment]
  user_id    int     [not null, ref: > Users.id]
  title      varchar [not null]
  message    text    [not null]
  is_read    boolean [default: false]
  created_at bigint  [not null]
}

Table Messages {
  id           int     [pk, increment]
  sender_id    int     [not null, ref: > Users.id]
  receiver_id  int     [not null, ref: > Users.id]
  message_text text    [not null]
  is_read      boolean [default: false]
  created_at   bigint  [not null]
}`;

export default function Database({ onBack }: Props) {
  const [activeTab, setActiveTab] = useState<'diagram' | 'sql' | 'dbml'>('diagram');
  const [hoveredTable, setHoveredTable] = useState<TableKey | null>(null);
  const [selectedTable, setSelectedTable] = useState<TableKey | null>(null);
  const [copied, setCopied] = useState(false);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="db-page">
      <div className="grid-bg" />
      <div className="db-inner">
        <div className="db-header">
          <button className="back-btn" onClick={onBack} style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <ArrowLeft size={16} /> Артқа
          </button>
          <div>
            <div className="hero-badge" style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
              <DbIcon size={14} /> Мәліметтер базасы
            </div>
            <h1 className="db-title">Quiz Battle схемасы</h1>
            <p className="db-sub">3 кесте · 2 байланыс типі · PostgreSQL синтаксисі</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="db-tabs">
          {(['diagram', 'sql', 'dbml'] as const).map(t => (
            <button key={t} className={`db-tab ${activeTab === t ? 'db-tab-active' : ''}`} onClick={() => setActiveTab(t)} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {t === 'diagram' ? <><Box size={16} /> ER-диаграмма</> : t === 'sql' ? <><FileCode size={16} /> SQL код</> : <><LinkIcon size={16} /> DBML код</>}
            </button>
          ))}
        </div>

        {/* ── ER DIAGRAM ── */}
        {activeTab === 'diagram' && (
          <div className="diagram-section">
            {/* SVG */}
            <div className="er-svg-wrapper">
              <svg viewBox="0 0 860 580" className="er-main-svg" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  {/* Glows */}
                  {(['pink','orange','cyan','purple','blue'] as const).map(c => (
                    <filter key={c} id={`glow-${c}`}>
                      <feGaussianBlur stdDeviation="5" result="b"/>
                      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                  ))}
                  {/* Arrow markers */}
                  <marker id="arr-pink" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3z" fill="#ff2060"/>
                  </marker>
                  <marker id="arr-orange" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3z" fill="#ff6b35"/>
                  </marker>
                  {/* Gradients */}
                  <linearGradient id="g-users" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#ff2060" stopOpacity=".9"/>
                    <stop offset="100%" stopColor="#c4006a" stopOpacity=".5"/>
                  </linearGradient>
                  <linearGradient id="g-questions" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#00ffc8" stopOpacity=".9"/>
                    <stop offset="100%" stopColor="#00a890" stopOpacity=".5"/>
                  </linearGradient>
                  <linearGradient id="g-games" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#ff6b35" stopOpacity=".9"/>
                    <stop offset="100%" stopColor="#cc4400" stopOpacity=".5"/>
                  </linearGradient>
                  <linearGradient id="g-notifications" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#9333ea" stopOpacity=".9"/>
                    <stop offset="100%" stopColor="#6b21a8" stopOpacity=".5"/>
                  </linearGradient>
                  <linearGradient id="g-messages" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity=".9"/>
                    <stop offset="100%" stopColor="#1d4ed8" stopOpacity=".5"/>
                  </linearGradient>
                </defs>

                {/* ── RELATION LINES ── */}
                {/* player1_id → Users */}
                <path d="M320,322 C390,322 390,170 430,140" stroke="#ff2060" strokeWidth="2"
                  strokeDasharray="7 4" fill="none" markerEnd="url(#arr-pink)" opacity=".9"
                  style={{animation:'dash 14s linear infinite'}}/>
                <text x="340" y="255" fill="rgba(255,32,96,.8)" fontSize="10" fontFamily="Outfit,sans-serif">player1_id</text>

                {/* player2_id → Users */}
                <path d="M320,350 C420,350 440,190 430,150" stroke="#ff2060" strokeWidth="2"
                  strokeDasharray="7 4" fill="none" markerEnd="url(#arr-pink)" opacity=".7"
                  style={{animation:'dash 18s linear infinite reverse'}}/>
                <text x="340" y="370" fill="rgba(255,32,96,.7)" fontSize="10" fontFamily="Outfit,sans-serif">player2_id</text>

                {/* winner_id → Users */}
                <path d="M320,378 C450,378 470,210 430,160" stroke="#fbbf24" strokeWidth="2"
                  strokeDasharray="5 6" fill="none" markerEnd="url(#arr-pink)" opacity=".6"
                  style={{animation:'dash 22s linear infinite'}}/>
                <text x="340" y="400" fill="rgba(251,191,36,.8)" fontSize="10" fontFamily="Outfit,sans-serif">winner_id (нөл)</text>

                {/* Relationship cardinality labels */}
                <text x="460" y="270" fill="rgba(255,32,96,0.6)" fontSize="12" fontFamily="Outfit,sans-serif" fontWeight="600">«Көп-бірге»</text>
                <text x="460" y="285" fill="rgba(255,32,96,0.5)" fontSize="10" fontFamily="Outfit,sans-serif">Games → Users</text>

                {/* sender/receiver → Users */}
                <path d="M290,100 C300,100 300,160 310,160" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5 5" fill="none" opacity=".6" />
                {/* notification user_id → Users */}
                <path d="M570,100 C550,100 550,160 530,160" stroke="#9333ea" strokeWidth="2" strokeDasharray="5 5" fill="none" opacity=".6" />

                {/* ── USERS TABLE ── */}
                {(() => {
                  const x=310,y=140,w=220; const rows=TABLES.users.fields; const h=42+rows.length*32+8;
                  const hov=hoveredTable==='users';
                  return (
                    <g onMouseEnter={()=>setHoveredTable('users')} onMouseLeave={()=>setHoveredTable(null)}
                       onClick={()=>setSelectedTable(s=>s==='users'?null:'users')} style={{cursor:'pointer',filter:hov?'url(#glow-pink)':'none'}}>
                      <rect x={x} y={y} width={w} height={h} rx="14" fill="#10121c" stroke={hov?'#ff2060':'rgba(255,32,96,.35)'} strokeWidth={hov?2.5:1.5}/>
                      <rect x={x} y={y} width={w} height={42} rx="14" fill="url(#g-users)"/>
                      <rect x={x} y={y+28} width={w} height={14} fill="url(#g-users)"/>
                      <text x={x+w/2} y={y+27} textAnchor="middle" fill="#fff" fontSize="15" fontWeight="700" fontFamily="Outfit,sans-serif">Users</text>
                      {rows.map((f,i)=>(
                        <g key={f.name}>
                          <line x1={x} y1={y+42+i*32} x2={x+w} y2={y+42+i*32} stroke="rgba(255,255,255,.05)" strokeWidth="1"/>
                          <text x={x+12} y={y+42+i*32+22} fill={f.pk?'#fbbf24':'#e2e8f0'} fontSize="12.5" fontFamily="Outfit,sans-serif">{f.pk?'🔑':'▸'} {f.name}</text>
                          <text x={x+w-10} y={y+42+i*32+22} textAnchor="end" fill="rgba(255,255,255,.35)" fontSize="10" fontFamily="Outfit,sans-serif">{f.type}</text>
                        </g>
                      ))}
                    </g>
                  );
                })()}

                {/* ── QUESTIONS TABLE ── */}
                {(() => {
                  const x=570,y=280,w=260; const rows=TABLES.questions.fields; const h=42+rows.length*32+8;
                  const hov=hoveredTable==='questions';
                  return (
                    <g onMouseEnter={()=>setHoveredTable('questions')} onMouseLeave={()=>setHoveredTable(null)}
                       onClick={()=>setSelectedTable(s=>s==='questions'?null:'questions')} style={{cursor:'pointer',filter:hov?'url(#glow-cyan)':'none'}}>
                      <rect x={x} y={y} width={w} height={h} rx="14" fill="#10121c" stroke={hov?'#00ffc8':'rgba(0,255,200,.3)'} strokeWidth={hov?2.5:1.5}/>
                      <rect x={x} y={y} width={w} height={42} rx="14" fill="url(#g-questions)"/>
                      <rect x={x} y={y+28} width={w} height={14} fill="url(#g-questions)"/>
                      <text x={x+w/2} y={y+27} textAnchor="middle" fill="#fff" fontSize="15" fontWeight="700" fontFamily="Outfit,sans-serif">Questions</text>
                      {rows.map((f,i)=>(
                        <g key={f.name}>
                          <line x1={x} y1={y+42+i*32} x2={x+w} y2={y+42+i*32} stroke="rgba(255,255,255,.05)" strokeWidth="1"/>
                          <text x={x+12} y={y+42+i*32+22} fill={f.pk?'#fbbf24':'#e2e8f0'} fontSize="12.5" fontFamily="Outfit,sans-serif">{f.pk?'🔑':'▸'} {f.name}</text>
                          <text x={x+w-10} y={y+42+i*32+22} textAnchor="end" fill="rgba(255,255,255,.35)" fontSize="10" fontFamily="Outfit,sans-serif">{f.type}</text>
                        </g>
                      ))}
                    </g>
                  );
                })()}

                {/* ── GAMES TABLE ── */}
                {(() => {
                  const x=30,y=260,w=260; const rows=TABLES.games.fields; const h=42+rows.length*32+8;
                  const hov=hoveredTable==='games';
                  return (
                    <g onMouseEnter={()=>setHoveredTable('games')} onMouseLeave={()=>setHoveredTable(null)}
                       onClick={()=>setSelectedTable(s=>s==='games'?null:'games')} style={{cursor:'pointer',filter:hov?'url(#glow-orange)':'none'}}>
                      <rect x={x} y={y} width={w} height={h} rx="14" fill="#10121c" stroke={hov?'#ff6b35':'rgba(255,107,53,.4)'} strokeWidth={hov?2.5:1.5}/>
                      <rect x={x} y={y} width={w} height={42} rx="14" fill="url(#g-games)"/>
                      <rect x={x} y={y+28} width={w} height={14} fill="url(#g-games)"/>
                      <text x={x+w/2} y={y+27} textAnchor="middle" fill="#fff" fontSize="15" fontWeight="700" fontFamily="Outfit,sans-serif">Games</text>
                      {rows.map((f: { name: string; type: string; pk: boolean; fk?: string; nullable?: boolean; note: string }, i: number)=>(
                        <g key={f.name}>
                          <line x1={x} y1={y+42+i*32} x2={x+w} y2={y+42+i*32} stroke="rgba(255,255,255,.05)" strokeWidth="1"/>
                          <text x={x+12} y={y+42+i*32+22} fill={f.pk?'#fbbf24':f.fk?'#60a5fa':'#e2e8f0'} fontSize="12.5" fontFamily="Outfit,sans-serif">{f.pk?'🔑':f.fk?'🔗':'▸'} {f.name}</text>
                          <text x={x+w-10} y={y+42+i*32+22} textAnchor="end" fill="rgba(255,255,255,.35)" fontSize="10" fontFamily="Outfit,sans-serif">{f.type}</text>
                        </g>
                      ))}
                    </g>
                  );
                })()}

                {/* ── NOTIFICATIONS TABLE ── */}
                {(() => {
                  const x=570,y=20,w=260; const rows=TABLES.notifications.fields; const h=42+rows.length*32+8;
                  const hov=hoveredTable==='notifications';
                  return (
                    <g onMouseEnter={()=>setHoveredTable('notifications')} onMouseLeave={()=>setHoveredTable(null)}
                       onClick={()=>setSelectedTable(s=>s==='notifications'?null:'notifications')} style={{cursor:'pointer',filter:hov?'url(#glow-purple)':'none'}}>
                      <rect x={x} y={y} width={w} height={h} rx="14" fill="#10121c" stroke={hov?'#9333ea':'rgba(147,51,234,.4)'} strokeWidth={hov?2.5:1.5}/>
                      <rect x={x} y={y} width={w} height={42} rx="14" fill="url(#g-notifications)"/>
                      <rect x={x} y={y+28} width={w} height={14} fill="url(#g-notifications)"/>
                      <text x={x+w/2} y={y+27} textAnchor="middle" fill="#fff" fontSize="15" fontWeight="700" fontFamily="Outfit,sans-serif">Notifications</text>
                      {rows.map((f: { name: string; type: string; pk: boolean; fk?: string; nullable?: boolean; note: string }, i: number)=>(
                        <g key={f.name}>
                          <line x1={x} y1={y+42+i*32} x2={x+w} y2={y+42+i*32} stroke="rgba(255,255,255,.05)" strokeWidth="1"/>
                          <text x={x+12} y={y+42+i*32+22} fill={f.pk?'#fbbf24':f.fk?'#60a5fa':'#e2e8f0'} fontSize="12.5" fontFamily="Outfit,sans-serif">{f.pk?'🔑':f.fk?'🔗':'▸'} {f.name}</text>
                          <text x={x+w-10} y={y+42+i*32+22} textAnchor="end" fill="rgba(255,255,255,.35)" fontSize="10" fontFamily="Outfit,sans-serif">{f.type}</text>
                        </g>
                      ))}
                    </g>
                  );
                })()}

                {/* ── MESSAGES TABLE ── */}
                {(() => {
                  const x=30,y=20,w=260; const rows=TABLES.messages.fields; const h=42+rows.length*32+8;
                  const hov=hoveredTable==='messages';
                  return (
                    <g onMouseEnter={()=>setHoveredTable('messages')} onMouseLeave={()=>setHoveredTable(null)}
                       onClick={()=>setSelectedTable(s=>s==='messages'?null:'messages')} style={{cursor:'pointer',filter:hov?'url(#glow-blue)':'none'}}>
                      <rect x={x} y={y} width={w} height={h} rx="14" fill="#10121c" stroke={hov?'#3b82f6':'rgba(59,130,246,.4)'} strokeWidth={hov?2.5:1.5}/>
                      <rect x={x} y={y} width={w} height={42} rx="14" fill="url(#g-messages)"/>
                      <rect x={x} y={y+28} width={w} height={14} fill="url(#g-messages)"/>
                      <text x={x+w/2} y={y+27} textAnchor="middle" fill="#fff" fontSize="15" fontWeight="700" fontFamily="Outfit,sans-serif">Messages</text>
                      {rows.map((f: { name: string; type: string; pk: boolean; fk?: string; nullable?: boolean; note: string }, i: number)=>(
                        <g key={f.name}>
                          <line x1={x} y1={y+42+i*32} x2={x+w} y2={y+42+i*32} stroke="rgba(255,255,255,.05)" strokeWidth="1"/>
                          <text x={x+12} y={y+42+i*32+22} fill={f.pk?'#fbbf24':f.fk?'#60a5fa':'#e2e8f0'} fontSize="12.5" fontFamily="Outfit,sans-serif">{f.pk?'🔑':f.fk?'🔗':'▸'} {f.name}</text>
                          <text x={x+w-10} y={y+42+i*32+22} textAnchor="end" fill="rgba(255,255,255,.35)" fontSize="10" fontFamily="Outfit,sans-serif">{f.type}</text>
                        </g>
                      ))}
                    </g>
                  );
                })()}
              </svg>
            </div>

            {/* Legend */}
            <div className="er-legend">
              <div className="legend-item"><div className="legend-dot" style={{background:'#ff2060'}}/> Users</div>
              <div className="legend-item"><div className="legend-dot" style={{background:'#ff6b35'}}/> Games</div>
              <div className="legend-item"><div className="legend-dot" style={{background:'#00ffc8'}}/> Questions</div>
              <div className="legend-item"><div className="legend-dot" style={{background:'#9333ea'}}/> Notifications</div>
              <div className="legend-item"><div className="legend-dot" style={{background:'#3b82f6'}}/> Messages</div>
              <div className="legend-item"><span style={{color:'#ff2060'}}>──→</span> Сыртқы кілт (FK)</div>
              <div className="legend-item"><span style={{color:'#fbbf24'}}>──→</span> Нөл рұқсат (Nullable FK)</div>
              <div className="legend-item">🔑 Басты кілт (PK)</div>
              <div className="legend-item">🔗 Сыртқы кілт (FK)</div>
            </div>

            {/* Table detail card */}
            {selectedTable && (
              <div className="table-detail">
                <div className="td-header" style={{borderColor: TABLES[selectedTable].color}}>
                  <h3 style={{color: TABLES[selectedTable].color}}>{TABLES[selectedTable].label}</h3>
                  <button onClick={()=>setSelectedTable(null)} className="close-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={16} />
                  </button>
                </div>
                <p className="td-desc">{TABLES[selectedTable].desc}</p>
                <table className="field-table">
                  <thead><tr><th>Өріс</th><th>Тип</th><th>Ескерту</th></tr></thead>
                  <tbody>
                    {TABLES[selectedTable].fields.map((f: { name: string; type: string; pk: boolean; fk?: string; nullable?: boolean; note: string }) => (
                      <tr key={f.name}>
                        <td style={{color: f.pk ? '#fbbf24' : f.fk ? '#60a5fa' : '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.4rem'}}>
                          {f.pk ? <Key size={14}/> : f.fk ? <LinkIcon size={14}/> : <ChevronRight size={14}/>}{f.name}
                        </td>
                        <td><code>{f.type}</code></td>
                        <td>{f.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── SQL ── */}
        {activeTab === 'sql' && (
          <div className="code-section">
            <div className="code-header">
              <span>schema.sql</span>
              <button className="copy-btn" onClick={() => copyCode(SQL)} style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                {copied ? <><Check size={14} /> Көшірілді!</> : <><Clipboard size={14} /> Көшіру</>}
              </button>
            </div>
            <pre className="code-block">{SQL}</pre>
          </div>
        )}

        {/* ── DBML ── */}
        {activeTab === 'dbml' && (
          <div className="code-section">
            <div className="code-header">
              <span>schema.dbml</span>
              <a href="https://dbdiagram.io" target="_blank" rel="noreferrer" className="copy-btn" style={{textDecoration:'none', display: 'flex', gap: '0.4rem', alignItems: 'center'}}>
                <LinkIcon size={14} /> dbdiagram.io-да ашу
              </a>
              <button className="copy-btn" onClick={() => copyCode(DBML)} style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                {copied ? <><Check size={14} /> Көшірілді!</> : <><Clipboard size={14} /> Көшіру</>}
              </button>
            </div>
            <pre className="code-block">{DBML}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
