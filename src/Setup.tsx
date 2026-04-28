import { useState } from 'react';
import { CATEGORIES, getUsers } from './types';
import { ArrowLeft, Swords, AlertTriangle, Zap, Flame, Globe, Monitor, Ruler, Scroll, Map, Brain } from 'lucide-react';

interface Props {
  onStart: (p1: string, p2: string, category: string) => void;
  onBack: () => void;
}

export default function Setup({ onStart, onBack }: Props) {
  const users = getUsers();
  const [p1, setP1] = useState(users[0]?.name || '');
  const [p2, setP2] = useState(users[1]?.name || '');
  const [cat, setCat] = useState('Барлығы');
  const [error, setError] = useState('');

  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!p1.trim() || !p2.trim()) { setError('Екі ойыншының атын енгізіңіз!'); return; }
    if (p1.trim().toLowerCase() === p2.trim().toLowerCase()) { setError('Ойыншылардың аттары бірдей болмауы керек!'); return; }
    onStart(p1.trim(), p2.trim(), cat);
  };

  return (
    <div className="setup-page">
      <div className="grid-bg" />
      <div className="setup-inner">
        <button className="back-btn" onClick={onBack} style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <ArrowLeft size={16} /> Артқа
        </button>
        <h2 className="setup-title">Ойын баптауы</h2>
        <p className="setup-sub">Ойыншылар аттарын енгізіп, санатты таңдаңыз</p>

        <form className="setup-form" onSubmit={handle}>
          {/* Players */}
          <div className="players-setup">
            <div className="player-input-card p1-card">
              <div className="player-label p1-label" style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}><Zap size={16} /> 1-ші Ойыншы</div>
              <select
                className="name-input p1-input"
                value={p1}
                onChange={e => setP1(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: '#10121c', color: 'var(--text)', outline: 'none' }}
              >
                {users.map(u => <option key={u.id} value={u.name}>{u.name} ({u.role})</option>)}
              </select>
            </div>

            <div className="vs-divider">VS</div>

            <div className="player-input-card p2-card">
              <div className="player-label p2-label" style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}><Flame size={16} /> 2-ші Ойыншы</div>
              <select
                className="name-input p2-input"
                value={p2}
                onChange={e => setP2(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: '#10121c', color: 'var(--text)', outline: 'none' }}
              >
                {users.map(u => <option key={u.id} value={u.name}>{u.name} ({u.role})</option>)}
              </select>
            </div>
          </div>

          {/* Category */}
          <div className="cat-section">
            <h3 className="cat-title">Санатты таңдаңыз</h3>
            <div className="cat-grid">
              {CATEGORIES.map(c => (
                <button
                  type="button"
                  key={c}
                  className={`cat-btn ${cat === c ? 'cat-active' : ''}`}
                  onClick={() => setCat(c)}
                  style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
                >
                  {CAT_ICONS[c]} <span>{c}</span>
                </button>
              ))}
            </div>
          </div>

          {error && <div className="error-msg" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><AlertTriangle size={18} color="var(--warning)" /> {error}</div>}

          <button type="submit" className="btn-primary btn-xl setup-start" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center' }}>
            <Swords size={20} />
            <span>Шайқасты бастау!</span>
            <div className="btn-shine" />
          </button>
        </form>
      </div>
    </div>
  );
}

const CAT_ICONS: Record<string, JSX.Element> = {
  'Барлығы': <Globe size={16} />,
  'Бағдарламалау': <Monitor size={16} />,
  'Математика': <Ruler size={16} />,
  'Тарих': <Scroll size={16} />,
  'География': <Map size={16} />,
  'Жалпы білім': <Brain size={16} />,
};
