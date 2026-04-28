import { useEffect, useRef } from 'react';
import type { GameState } from './App';
import { Handshake, Trophy, Crown, Target, BarChart2, Clock, Flame, Check, Home, RotateCcw } from 'lucide-react';

interface Props {
  game: GameState;
  onRestart: () => void;
  onHome: () => void;
}

export default function Results({ game, onRestart, onHome }: Props) {
  const { player1: p1, player2: p2, questions } = game;
  const isDraw = p1.score === p2.score;
  const winner = isDraw ? null : p1.score > p2.score ? p1 : p2;
  const loser = isDraw ? null : p1.score > p2.score ? p2 : p1;
  const confettiRef = useRef<HTMLDivElement>(null);

  const accuracy = (p: typeof p1) =>
    questions.length > 0 ? Math.round((p.correctCount / questions.length) * 100) : 0;
  const avgTime = (p: typeof p1) =>
    p.correctCount > 0 ? (p.totalTime / 1000 / questions.length).toFixed(1) : '—';

  useEffect(() => {
    const el = confettiRef.current;
    if (!el || isDraw) return;
    for (let i = 0; i < 60; i++) {
      const dot = document.createElement('div');
      dot.className = 'confetti-dot';
      dot.style.left = Math.random() * 100 + '%';
      dot.style.animationDelay = Math.random() * 2 + 's';
      dot.style.background = ['#00ff88', '#ff2060', '#ffcc00', '#00d4ff', '#ff6b35'][Math.floor(Math.random() * 5)];
      dot.style.setProperty('--rand-x', (Math.random() * 200 - 100) + 'px');
      el.appendChild(dot);
    }
    return () => { el.innerHTML = ''; };
  }, [isDraw]);

  return (
    <div className="results-page">
      <div className="grid-bg" />
      <div className="confetti-container" ref={confettiRef} />

      <div className="results-inner">
        {/* Winner announcement */}
        <div className="winner-block">
          {isDraw ? (
            <>
              <div className="draw-emoji"><Handshake size={64} /></div>
              <h1 className="winner-title">Тең нәтиже!</h1>
              <p className="winner-sub">Екеуіңіз де тамаша ойнадыңыздар!</p>
            </>
          ) : (
            <>
              <div className="trophy-emoji"><Trophy size={64} /></div>
              <h1 className="winner-title">
                <span className={p1.score > p2.score ? 'p1-name' : 'p2-name'}>{winner!.name}</span> жеңді!
              </h1>
              <p className="winner-sub">{loser!.name} жақсы тырысты, ойынды жалғастыр!</p>
            </>
          )}
        </div>

        {/* Score comparison */}
        <div className="score-compare">
          <div className={`score-card ${!isDraw && winner === p1 ? 'winner-card' : ''}`}>
            {!isDraw && winner === p1 && <div className="winner-crown"><Crown size={32} /></div>}
            <div className="sc-name p1-name">{p1.name}</div>
            <div className="sc-score">{p1.score}</div>
            <div className="sc-label">ұпай</div>
            <div className="sc-stats">
              <div className="sc-stat"><span style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}><Target size={14} /> Дұрыс:</span><strong>{p1.correctCount}/{questions.length}</strong></div>
              <div className="sc-stat"><span style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}><BarChart2 size={14} /> Нақтылық:</span><strong>{accuracy(p1)}%</strong></div>
              <div className="sc-stat"><span style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}><Clock size={14} /> Орт. уақыт:</span><strong>{avgTime(p1)}с</strong></div>
              <div className="sc-stat"><span style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}><Flame size={14} /> Стрик:</span><strong>{p1.streak}</strong></div>
            </div>
          </div>

          <div className="vs-badge">VS</div>

          <div className={`score-card ${!isDraw && winner === p2 ? 'winner-card' : ''}`}>
            {!isDraw && winner === p2 && <div className="winner-crown"><Crown size={32} /></div>}
            <div className="sc-name p2-name">{p2.name}</div>
            <div className="sc-score">{p2.score}</div>
            <div className="sc-label">ұпай</div>
            <div className="sc-stats">
              <div className="sc-stat"><span style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}><Target size={14} /> Дұрыс:</span><strong>{p2.correctCount}/{questions.length}</strong></div>
              <div className="sc-stat"><span style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}><BarChart2 size={14} /> Нақтылық:</span><strong>{accuracy(p2)}%</strong></div>
              <div className="sc-stat"><span style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}><Clock size={14} /> Орт. уақыт:</span><strong>{avgTime(p2)}с</strong></div>
              <div className="sc-stat"><span style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}><Flame size={14} /> Стрик:</span><strong>{p2.streak}</strong></div>
            </div>
          </div>
        </div>

        {/* Per-question breakdown */}
        <div className="breakdown-section">
          <h3 className="breakdown-title">Сұрақтар бойынша нәтижелер</h3>
          <div className="breakdown-table">
            <div className="bt-header">
              <span>#</span><span>Сұрақ</span>
              <span className="p1-name">{p1.name}</span>
              <span className="p2-name">{p2.name}</span>
            </div>
            {questions.map((q, i) => (
              <div className="bt-row" key={q.id}>
                <span>{i + 1}</span>
                <span className="bt-q">{q.text.slice(0, 45)}...</span>
                <span>{i < questions.length ? <Check size={16} /> : '—'}</span>
                <span>{i < questions.length ? <Check size={16} /> : '—'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="results-actions">
          <button className="btn-primary btn-xl" onClick={onRestart} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <RotateCcw size={20} />
            <span>Қайтадан ойнау</span>
            <div className="btn-shine" />
          </button>
          <button className="btn-ghost" onClick={onHome} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Home size={18} /> Басты бет
          </button>
        </div>
      </div>
    </div>
  );
}
