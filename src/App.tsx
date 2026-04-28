import { useState, useEffect, useCallback } from 'react';
import Landing from './Landing';
import Setup from './Setup';
import Battle from './Battle';
import Results from './Results';
import Database from './Database';
import AdminPanel from './AdminPanel';
import Navbar from './Navbar';
import type { GamePhase, Player, Question, User } from './types';
import { getQuestions, updateLeaderboard, logAction, sendNotification, getUsers } from './types';

export interface GameState {
  player1: Player;
  player2: Player;
  questions: Question[];
  currentQ: number;
  p1Answer: number | null;
  p2Answer: number | null;
  p1TimeMs: number;
  p2TimeMs: number;
}

const defaultPlayer = (): Player => ({ name: '', score: 0, streak: 0, correctCount: 0, totalTime: 0 });

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [phase, setPhase] = useState<GamePhase>('landing');
  const [, setCategory] = useState('Барлығы');
  const [game, setGame] = useState<GameState>({
    player1: defaultPlayer(),
    player2: defaultPlayer(),
    questions: [],
    currentQ: 0,
    p1Answer: null,
    p2Answer: null,
    p1TimeMs: 0,
    p2TimeMs: 0,
  });

  const startGame = useCallback((p1Name: string, p2Name: string, cat: string) => {
    const qs = getQuestions(cat);
    setCategory(cat);
    setGame({
      player1: { ...defaultPlayer(), name: p1Name },
      player2: { ...defaultPlayer(), name: p2Name },
      questions: qs,
      currentQ: 0,
      p1Answer: null,
      p2Answer: null,
      p1TimeMs: 0,
      p2TimeMs: 0,
    });
    setPhase('p1_turn');
  }, []);

  const submitAnswer = useCallback((player: 1 | 2, answerIdx: number, timeMs: number) => {
    setGame(prev => {
      const q = prev.questions[prev.currentQ];
      const isCorrect = answerIdx === q.correct;
      const SPEED_BONUS = timeMs < 5000 ? 5 : 0;
      const pts = isCorrect ? 10 + SPEED_BONUS : 0;

      if (player === 1) {
        return {
          ...prev,
          p1Answer: answerIdx,
          p1TimeMs: timeMs,
          player1: {
            ...prev.player1,
            score: prev.player1.score + pts,
            streak: isCorrect ? prev.player1.streak + 1 : 0,
            correctCount: prev.player1.correctCount + (isCorrect ? 1 : 0),
            totalTime: prev.player1.totalTime + timeMs,
          },
        };
      } else {
        return {
          ...prev,
          p2Answer: answerIdx,
          p2TimeMs: timeMs,
          player2: {
            ...prev.player2,
            score: prev.player2.score + pts,
            streak: isCorrect ? prev.player2.streak + 1 : 0,
            correctCount: prev.player2.correctCount + (isCorrect ? 1 : 0),
            totalTime: prev.player2.totalTime + timeMs,
          },
        };
      }
    });
    setPhase(player === 1 ? 'p2_turn' : 'reveal');
  }, []);

  const nextQuestion = useCallback(() => {
    setGame(prev => {
      const next = prev.currentQ + 1;
      const isLast = next >= prev.questions.length;
      // We'll set phase based on this
      setTimeout(() => setPhase(isLast ? 'results' : 'p1_turn'), 0);
      if (isLast) return prev;
      return { ...prev, currentQ: next, p1Answer: null, p2Answer: null, p1TimeMs: 0, p2TimeMs: 0 };
    });
  }, []);

  // Save to leaderboard when results shown
  useEffect(() => {
    if (phase === 'results' && game.player1.name && game.player2.name) {
      const winner = game.player1.score >= game.player2.score ? game.player1 : game.player2;
      const loser = game.player1.score >= game.player2.score ? game.player2 : game.player1;
      updateLeaderboard(winner.name, loser.name, winner.streak);

      // Send Notifications
      const users = getUsers();
      const u1 = users.find(u => u.name === game.player1.name);
      const u2 = users.find(u => u.name === game.player2.name);
      
      const isDraw = game.player1.score === game.player2.score;

      if (u1) {
        const msg = isDraw ? 'Ойын тең аяқталды!' : (winner === game.player1 ? 'Құттықтаймыз, сіз жеңдіңіз! 🏆' : 'Өкінішке орай, сіз жеңілдіңіз.');
        sendNotification(u1.id, 'Ойын аяқталды', msg);
      }
      if (u2) {
        const msg = isDraw ? 'Ойын тең аяқталды!' : (winner === game.player2 ? 'Құттықтаймыз, сіз жеңдіңіз! 🏆' : 'Өкінішке орай, сіз жеңілдіңіз.');
        sendNotification(u2.id, 'Ойын аяқталды', msg);
      }
    }
  }, [phase]);

  const goTo = useCallback((p: GamePhase) => {
    if (p === 'admin' && currentUser?.role !== 'admin') {
      logAction('Unauthorized admin access attempt', currentUser?.name || 'unknown');
    }
    setPhase(p);
  }, [currentUser]);

  if (phase === 'admin' && currentUser?.role !== 'admin') {
    return (
      <div className="access-denied-page">
        <div className="grid-bg" />
        <div className="ad-card">
          <h1>🔒 Қолжетімділік шектелген</h1>
          <p>Бұл бетке (Admin Panel) кіруге сізде рұқсат жоқ.</p>
          <button className="btn-primary" onClick={() => goTo('landing')}>Артқа қайту</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app" style={{ paddingTop: '70px' }}>
      <Navbar 
        currentUser={currentUser} 
        onLogin={setCurrentUser} 
        onAdmin={() => goTo('admin')} 
      />
      {phase === 'landing' && (
        <Landing
          onPlay={() => goTo('setup')}
          onDatabase={() => goTo('database')}
        />
      )}
      {phase === 'setup' && <Setup onStart={startGame} onBack={() => goTo('landing')} />}
      {(phase === 'p1_turn' || phase === 'p2_turn') && (
        <Battle
          game={game}
          phase={phase}
          onAnswer={submitAnswer}
          onNext={nextQuestion}
        />
      )}
      {phase === 'reveal' && (
        <Battle
          game={game}
          phase={phase}
          onAnswer={submitAnswer}
          onNext={nextQuestion}
        />
      )}
      {phase === 'results' && <Results game={game} onRestart={() => goTo('setup')} onHome={() => goTo('landing')} />}
      {phase === 'database' && <Database onBack={() => goTo('landing')} />}
      {phase === 'admin' && currentUser?.role === 'admin' && <AdminPanel onBack={() => goTo('landing')} currentUser={currentUser} />}
    </div>
  );
}
