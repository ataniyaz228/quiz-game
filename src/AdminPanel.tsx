import { useState, useEffect } from 'react';
import {
  Question, User, Role,
  getAllQuestions, saveQuestion, deleteQuestion, CATEGORIES,
  getUsers, saveUser, deleteUser,
  getLeaderboard, logAction
} from './types';

interface Props {
  onBack: () => void;
  currentUser: User;
}

export default function AdminPanel({ onBack, currentUser }: Props) {
  const [activeTab, setActiveTab] = useState<'users' | 'questions' | 'stats'>('users');

  // --- Users State ---
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // --- Questions State ---
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [searchQ, setSearchQ] = useState('');

  // --- Stats State ---
  const [leaderboard] = useState(getLeaderboard());

  useEffect(() => {
    setUsers(getUsers());
    setQuestions(getAllQuestions());
    logAction('Accessed Admin Panel', currentUser.name);
  }, [currentUser]);

  // -- Handlers for Users --
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      saveUser(editingUser);
      setUsers(getUsers());
      logAction(`Saved user ${editingUser.name}`, currentUser.name);
      setEditingUser(null);
    }
  };

  const handleDeleteUser = (id: number) => {
    if (id === currentUser.id) {
      alert("Өзіңізді өшіре алмайсыз!");
      return;
    }
    if (confirm("Қолданушыны өшіруге сенімдісіз бе?")) {
      deleteUser(id);
      setUsers(getUsers());
      logAction(`Deleted user ID ${id}`, currentUser.name);
    }
  };

  // -- Handlers for Questions --
  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingQuestion) {
      saveQuestion(editingQuestion);
      setQuestions(getAllQuestions());
      logAction(`Saved question ID ${editingQuestion.id}`, currentUser.name);
      setEditingQuestion(null);
    }
  };

  const handleDeleteQuestion = (id: number) => {
    if (confirm("Сұрақты өшіруге сенімдісіз бе?")) {
      deleteQuestion(id);
      setQuestions(getAllQuestions());
      logAction(`Deleted question ID ${id}`, currentUser.name);
    }
  };

  const filteredQuestions = questions.filter(q =>
    q.text.toLowerCase().includes(searchQ.toLowerCase()) ||
    q.category.toLowerCase().includes(searchQ.toLowerCase())
  );

  return (
    <div className="admin-page">
      <div className="grid-bg" />
      <div className="admin-inner">
        <div className="admin-header">
          <button className="back-btn" onClick={onBack}>← Артқа</button>
          <div>
            <div className="hero-badge">🛡️ Әкімшілік панель</div>
            <h1 className="admin-title">Басқару Орталығы</h1>
            <p className="admin-sub">Қош келдіңіз, {currentUser.name}</p>
          </div>
        </div>

        <div className="admin-tabs">
          <button className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>👥 Қолданушылар</button>
          <button className={`admin-tab ${activeTab === 'questions' ? 'active' : ''}`} onClick={() => setActiveTab('questions')}>📝 Сұрақтар</button>
          <button className={`admin-tab ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>📊 Статистика</button>
        </div>

        <div className="admin-content">
          {activeTab === 'users' && (
            <div className="admin-section">
              <div className="section-head">
                <h2>Қолданушылар тізімі</h2>
                <button className="btn-primary" onClick={() => setEditingUser({ id: Date.now(), name: '', role: 'player' })}>+ Қосу</button>
              </div>
              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Аты</th>
                      <th>Рөлі</th>
                      <th>Әрекеттер</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td>{u.name}</td>
                        <td>
                          <span className={`role-badge role-${u.role}`}>{u.role}</span>
                        </td>
                        <td>
                          <button className="btn-ghost btn-sm" onClick={() => setEditingUser(u)}>Өңдеу</button>
                          <button className="btn-ghost btn-sm text-red" onClick={() => handleDeleteUser(u.id)}>Жою</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'questions' && (
            <div className="admin-section">
              <div className="section-head">
                <h2>Сұрақтар базасы</h2>
                <div className="search-box">
                  <input
                    type="text"
                    placeholder="Іздеу..."
                    value={searchQ}
                    onChange={e => setSearchQ(e.target.value)}
                    className="admin-input"
                  />
                </div>
                <button className="btn-primary" onClick={() => setEditingQuestion({
                  id: Date.now(), text: '', options: ['', '', '', ''], correct: 0, category: 'Бағдарламалау', difficulty: 'оңай'
                })}>+ Қосу</button>
              </div>
              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Сұрақ</th>
                      <th>Санат</th>
                      <th>Қиындық</th>
                      <th>Әрекеттер</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuestions.map(q => (
                      <tr key={q.id}>
                        <td className="truncate-text">{q.text}</td>
                        <td>{q.category}</td>
                        <td>{q.difficulty}</td>
                        <td>
                          <button className="btn-ghost btn-sm" onClick={() => setEditingQuestion(q)}>Өңдеу</button>
                          <button className="btn-ghost btn-sm text-red" onClick={() => handleDeleteQuestion(q.id)}>Жою</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="admin-section">
              <h2>Ойын статистикасы</h2>
              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Ойыншы</th>
                      <th>Жеңістер</th>
                      <th>Барлық ойындар</th>
                      <th>Макс стрик</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map(lb => (
                      <tr key={lb.name}>
                        <td>{lb.name}</td>
                        <td>{lb.wins}</td>
                        <td>{lb.totalGames}</td>
                        <td>{lb.bestStreak}</td>
                      </tr>
                    ))}
                    {leaderboard.length === 0 && <tr><td colSpan={4}>Статистика бос</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* User Edit Modal */}
        {editingUser && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>{editingUser.name ? 'Қолданушыны өңдеу' : 'Жаңа қолданушы'}</h2>
              <form onSubmit={handleSaveUser}>
                <div className="form-group">
                  <label>Аты</label>
                  <input required value={editingUser.name} onChange={e => setEditingUser({ ...editingUser, name: e.target.value })} className="admin-input" />
                </div>
                <div className="form-group">
                  <label>Рөлі</label>
                  <select value={editingUser.role} onChange={e => setEditingUser({ ...editingUser, role: e.target.value as Role })} className="admin-input">
                    <option value="admin">Admin</option>
                    <option value="player">Player</option>
                    <option value="guest">Guest</option>
                  </select>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-ghost" onClick={() => setEditingUser(null)}>Болдырмау</button>
                  <button type="submit" className="btn-primary">Сақтау</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Question Edit Modal */}
        {editingQuestion && (
          <div className="modal-overlay">
            <div className="modal modal-lg">
              <h2>{editingQuestion.text ? 'Сұрақты өңдеу' : 'Жаңа сұрақ'}</h2>
              <form onSubmit={handleSaveQuestion}>
                <div className="form-group">
                  <label>Сұрақ мәтіні</label>
                  <textarea required value={editingQuestion.text} onChange={e => setEditingQuestion({ ...editingQuestion, text: e.target.value })} className="admin-input" rows={2} />
                </div>
                
                <div className="options-grid">
                  {[0, 1, 2, 3].map(i => (
                    <div className="form-group" key={i}>
                      <label>
                        <input
                          type="radio"
                          name="correctOption"
                          checked={editingQuestion.correct === i}
                          onChange={() => setEditingQuestion({ ...editingQuestion, correct: i })}
                        />
                        Нұсқа {i + 1} (Дұрыс)
                      </label>
                      <input required value={editingQuestion.options[i]} onChange={e => {
                        const newOpts = [...editingQuestion.options];
                        newOpts[i] = e.target.value;
                        setEditingQuestion({ ...editingQuestion, options: newOpts });
                      }} className="admin-input" />
                    </div>
                  ))}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Санат</label>
                    <select value={editingQuestion.category} onChange={e => setEditingQuestion({ ...editingQuestion, category: e.target.value })} className="admin-input">
                      {CATEGORIES.filter(c => c !== 'Барлығы').map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Қиындық</label>
                    <select value={editingQuestion.difficulty} onChange={e => setEditingQuestion({ ...editingQuestion, difficulty: e.target.value as any })} className="admin-input">
                      <option value="оңай">Оңай</option>
                      <option value="орташа">Орташа</option>
                      <option value="қиын">Қиын</option>
                    </select>
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-ghost" onClick={() => setEditingQuestion(null)}>Болдырмау</button>
                  <button type="submit" className="btn-primary">Сақтау</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
