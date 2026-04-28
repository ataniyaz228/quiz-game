import { useState, useEffect, useRef, useCallback } from 'react';
import type { GameState } from './App';
import type { GamePhase } from './types';
import { Flame, Check, X, Clock, Trophy } from 'lucide-react';

const TIMER_SEC = 15;

interface Props {
  game: GameState;
  phase: GamePhase;
  onAnswer: (player: 1 | 2, answerIdx: number, timeMs: number) => void;
  onNext: () => void;
}

export default function Battle({ game, phase, onAnswer, onNext }: Props) {
  const [timeLeft, setTimeLeft] = useState(TIMER_SEC);
  const [chosen, setChosen] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const startTimeRef = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const q = game.questions[game.currentQ];
  const isReveal = phase === 'reveal';
  const currentPlayer = phase === 'p1_turn' ? 1 : phase === 'p2_turn' ? 2 : null;
  const totalQ = game.questions.length;

  // Reset on phase change
  useEffect(() => {
    if (isReveal) return;
    setChosen(null);
    setLocked(false);
    setTimeLeft(TIMER_SEC);
    startTimeRef.current = Date.now();
  }, [phase, game.currentQ]);

  // Timer
  useEffect(() => {
    if (isReveal || locked) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          // Auto-submit with wrong answer (-1 means timeout)
          const elapsed = Date.now() - startTimeRef.current;
          onAnswer(currentPlayer!, -1, elapsed);
          setLocked(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [phase, locked, isReveal]);

  const handleChoose = useCallback((idx: number) => {
    if (locked || isReveal) return;
    setChosen(idx);
    setLocked(true);
    clearInterval(timerRef.current!);
    const elapsed = Date.now() - startTimeRef.current;
    onAnswer(currentPlayer!, idx, elapsed);
  }, [locked, isReveal, currentPlayer, onAnswer]);

  const timerPct = (timeLeft / TIMER_SEC) * 100;
  const timerColor = timeLeft > 8 ? '#00ff88' : timeLeft > 4 ? '#ffcc00' : '#ff2060';

  const p1 = game.player1;
  const p2 = game.player2;
  const maxScore = (totalQ) * 15;

  // For reveal: get option state
  const optionState = (idx: number) => {
    if (!isReveal) return 'default';
    if (idx === q.correct) return 'correct';
    if (idx === game.p1Answer && idx !== q.correct) return 'wrong-p1';
    if (idx === game.p2Answer && idx !== q.correct) return 'wrong-p2';
    return 'default';
  };

  return (
    <div className="battle-page">
      <div className="grid-bg" />

      {/* Top scoreboard */}
      <div className="scoreboard">
        {/* Player 1 */}
        <div className={`player-panel p1-panel ${currentPlayer === 1 ? 'panel-active' : ''}`}>
          <div className="panel-name p1-name">{p1.name}</div>
          <div className="panel-score">{p1.score} ұпай</div>
          {p1.streak >= 2 && <div className="streak-badge" style={{ display: 'flex', gap: '0.2rem', alignItems: 'center' }}><Flame size={12} /> ×{p1.streak}</div>}
          <div className="score-bar">
            <div className="score-fill p1-fill" style={{ width: `${Math.min((p1.score / maxScore) * 100, 100)}%` }} />
          </div>
        </div>

        {/* Center info */}
        <div className="center-info">
          <div className="q-counter">{game.currentQ + 1} / {totalQ}</div>
          <div className="q-badge">{q.category}</div>
          <div className="diff-badge" data-diff={q.difficulty}>{q.difficulty}</div>
        </div>

        {/* Player 2 */}
        <div className={`player-panel p2-panel ${currentPlayer === 2 ? 'panel-active' : ''}`}>
          <div className="panel-name p2-name">{p2.name}</div>
          <div className="panel-score">{p2.score} ұпай</div>
          {p2.streak >= 2 && <div className="streak-badge" style={{ display: 'flex', gap: '0.2rem', alignItems: 'center' }}><Flame size={12} /> ×{p2.streak}</div>}
          <div className="score-bar">
            <div className="score-fill p2-fill" style={{ width: `${Math.min((p2.score / maxScore) * 100, 100)}%` }} />
          </div>
        </div>
      </div>

      {/* Question area */}
      <div className="question-area">
        {/* Timer (only during turns) */}
        {!isReveal && (
          <div className="timer-ring">
            <svg viewBox="0 0 80 80" className="timer-svg">
              <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
              <circle
                cx="40" cy="40" r="34" fill="none"
                stroke={timerColor} strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 34}`}
                strokeDashoffset={`${2 * Math.PI * 34 * (1 - timerPct / 100)}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset .9s linear, stroke .3s', transform: 'rotate(-90deg)', transformOrigin: 'center' }}
              />
            </svg>
            <span className="timer-num" style={{ color: timerColor }}>{timeLeft}</span>
          </div>
        )}

        {/* Whose turn */}
        {!isReveal && (
          <div className="turn-indicator" data-player={currentPlayer}>
            <span className={`turn-name ${currentPlayer === 1 ? 'p1-name' : 'p2-name'}`}>
              {currentPlayer === 1 ? p1.name : p2.name}
            </span>
            <span className="turn-label">&nbsp;жауап береді...</span>
          </div>
        )}
        {isReveal && (
          <div className="reveal-header">Нәтиже</div>
        )}

        {/* Question text */}
        <div className="q-text">{q.text}</div>

        {/* Options */}
        <div className="options-grid">
          {q.options.map((opt, idx) => {
            const letters = ['A', 'B', 'C', 'D'];
            const state = isReveal ? optionState(idx) : (chosen === idx ? 'chosen' : 'default');
            return (
              <button
                key={idx}
                className={`option-btn state-${state}`}
                onClick={() => handleChoose(idx)}
                disabled={locked || isReveal}
              >
                <span className="opt-letter">{letters[idx]}</span>
                <span className="opt-text">{opt}</span>
                {isReveal && state === 'correct' && <span className="opt-icon"><Check size={18} /></span>}
                {isReveal && (state === 'wrong-p1' || state === 'wrong-p2') && <span className="opt-icon"><X size={18} /></span>}
              </button>
            );
          })}
        </div>

        {/* Reveal summary */}
        {isReveal && (
          <div className="reveal-summary">
            <div className={`reveal-result ${game.p1Answer === q.correct ? 'correct' : 'wrong'}`}>
              <span>{p1.name}:</span>
              <span style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                {game.p1Answer === -1 ? <><Clock size={16} /> Уақыт бітті</> : game.p1Answer === q.correct ? <><Check size={16} /> Дұрыс!</> : <><X size={16} /> Қате</>}
              </span>
            </div>
            <div className={`reveal-result ${game.p2Answer === q.correct ? 'correct' : 'wrong'}`}>
              <span>{p2.name}:</span>
              <span style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                {game.p2Answer === -1 ? <><Clock size={16} /> Уақыт бітті</> : game.p2Answer === q.correct ? <><Check size={16} /> Дұрыс!</> : <><X size={16} /> Қате</>}
              </span>
            </div>
            <button className="btn-primary next-btn" onClick={onNext} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {game.currentQ + 1 >= totalQ ? <><Trophy size={16} /> Нәтижелер</> : 'Келесі сұрақ →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
