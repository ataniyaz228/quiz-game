import { useEffect, useRef } from 'react';
import { getLeaderboard } from './types';
import { Zap, Swords, Database as DatabaseIcon, Flame, Medal } from 'lucide-react';

interface Props {
  onPlay: () => void;
  onDatabase: () => void;
}

export default function Landing({ onPlay, onDatabase }: Props) {
  const lb = getLeaderboard().sort((a, b) => b.wins - a.wins).slice(0, 5);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    let frame: number;
    let t = 0;
    const chars = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ0123456789!@#$%^&*';
    const original = 'QUIZ BATTLE';
    const el = titleRef.current;
    if (!el) return;

    const animate = () => {
      t++;
      if (t % 3 === 0) {
        const glitched = original.split('').map((ch) => {
          if (Math.random() < 0.08 && ch !== ' ') {
            return chars[Math.floor(Math.random() * chars.length)];
          }
          return ch;
        }).join('');
        el.textContent = glitched;
        setTimeout(() => { if (el) el.textContent = original; }, 60);
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="landing">
      {/* Background grid */}
      <div className="grid-bg" />
      <div className="scanline" />

      <div className="landing-inner">
        {/* Hero */}
        <div className="hero">
          <div className="hero-badge" style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
            <Zap size={14} /> Практикалық жұмыс №3
          </div>
          <h1 className="hero-title" ref={titleRef}>QUIZ BATTLE</h1>
          <p className="hero-sub">
            Досыңмен интеллектуалды шайқасқа шық. Жылдам жауап бер, стрик жина, рейтингте бірінші бол.
          </p>
          <div className="hero-actions">
            <button className="btn-primary btn-xl" onClick={onPlay} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Swords size={20} />
              <span>Ойынды бастау</span>
              <div className="btn-shine" />
            </button>
            <button className="btn-ghost" onClick={onDatabase} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <DatabaseIcon size={18} /> Деректер базасы
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-num">{QUESTIONS_COUNT}</span>
            <span className="stat-label">Сұрақ</span>
          </div>
          <div className="stat-card">
            <span className="stat-num">5</span>
            <span className="stat-label">Санат</span>
          </div>
          <div className="stat-card">
            <span className="stat-num">15с</span>
            <span className="stat-label">Таймер</span>
          </div>
          <div className="stat-card">
            <span className="stat-num">+15</span>
            <span className="stat-label">Макс ұпай</span>
          </div>
        </div>

        {/* How to play */}
        <div className="how-section">
          <h2 className="section-heading">Қалай ойнайды?</h2>
          <div className="steps-row">
            <div className="step-card">
              <div className="step-num">01</div>
              <h3>Ойыншыларды тіркеу</h3>
              <p>Екі ойыншының атын енгізіп, санатты таңдаңыз.</p>
            </div>
            <div className="step-card">
              <div className="step-num">02</div>
              <h3>Кезекпен жауап беру</h3>
              <p>Әр сұраққа алдымен 1-ші ойыншы, содан кейін 2-ші ойыншы жауап береді.</p>
            </div>
            <div className="step-card">
              <div className="step-num">03</div>
              <h3>Ұпай жинау</h3>
              <p>Дұрыс жауап = +10 ұпай. Жылдам жауап (5с дейін) = +5 бонус!</p>
            </div>
            <div className="step-card">
              <div className="step-num">04</div>
              <h3>Жеңімпаз анықталады</h3>
              <p>7 сұрақтан кейін ең көп ұпай жинаған ойыншы жеңеді.</p>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        {lb.length > 0 && (
          <div className="leaderboard-section">
            <h2 className="section-heading">🏆 Рейтинг</h2>
            <div className="lb-table">
              <div className="lb-header">
                <span>#</span><span>Аты</span><span>Жеңістер</span><span>Ойындар</span><span>Стрик</span>
              </div>
              {lb.map((e, i) => (
                <div className={`lb-row ${i === 0 ? 'lb-first' : ''}`} key={e.name}>
                  <span className="lb-rank" style={{ display: 'flex', justifyContent: 'center' }}>
                    {i === 0 ? <Medal size={20} color="#ffd700" /> : i === 1 ? <Medal size={20} color="#c0c0c0" /> : i === 2 ? <Medal size={20} color="#cd7f32" /> : i + 1}
                  </span>
                  <span>{e.name}</span>
                  <span className="lb-wins">{e.wins}</span>
                  <span>{e.totalGames}</span>
                  <span style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}><Flame size={16} /> {e.bestStreak}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const QUESTIONS_COUNT = 20;
