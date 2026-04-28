// Ойын типтері мен сұрақтар банкі

export type GamePhase = 'landing' | 'setup' | 'p1_turn' | 'p2_turn' | 'reveal' | 'results' | 'database' | 'admin';

export type Role = 'admin' | 'player' | 'guest';

export interface User {
  id: number;
  name: string;
  role: Role;
}

export interface Player {
  name: string;
  score: number;
  streak: number;
  correctCount: number;
  totalTime: number;
}

export interface Question {
  id: number;
  text: string;
  options: string[];
  correct: number;
  category: string;
  difficulty: 'оңай' | 'орташа' | 'қиын';
}

export const QUESTIONS: Question[] = [
  // Бағдарламалау
  { id: 1, text: "JavaScript-те айнымалыны жариялау үшін қолданылмайтын кілт сөз?", options: ["let", "const", "var", "int"], correct: 3, category: "Бағдарламалау", difficulty: "оңай" },
  { id: 2, text: "React-тегі useState хукі не қайтарады?", options: ["Объект", "Массив", "Функция", "Сан"], correct: 1, category: "Бағдарламалау", difficulty: "орташа" },
  { id: 3, text: "SQL-де жазбаларды жою үшін қандай команда қолданылады?", options: ["REMOVE", "DROP", "DELETE", "ERASE"], correct: 2, category: "Бағдарламалау", difficulty: "оңай" },
  { id: 4, text: "HTTP қай хаттаманың қысқартуы?", options: ["HyperText Transfer Protocol", "High Tech Transfer Program", "Home Text Transfer Process", "Hyper Transfer Tech Protocol"], correct: 0, category: "Бағдарламалау", difficulty: "оңай" },
  { id: 5, text: "Python-да тізімнің соңғы элементін алу синтаксисі?", options: ["list.last()", "list[-1]", "list[end]", "last(list)"], correct: 1, category: "Бағдарламалау", difficulty: "орташа" },
  { id: 6, text: "CSS-те flex контейнерінде элементтерді ортаға қою үшін?", options: ["text-align: center", "justify-content: center", "align: middle", "center: flex"], correct: 1, category: "Бағдарламалау", difficulty: "орташа" },
  { id: 7, text: "Git-те жаңа тармақ (branch) жасау командасы?", options: ["git new branch", "git branch -new", "git checkout -b", "git create branch"], correct: 2, category: "Бағдарламалау", difficulty: "орташа" },

  // Математика
  { id: 8, text: "π (пи) санының шамамен мәні?", options: ["2.718", "3.141", "1.618", "2.302"], correct: 1, category: "Математика", difficulty: "оңай" },
  { id: 9, text: "2 санының 10-шы дәрежесі (2¹⁰) нешеге тең?", options: ["512", "1024", "256", "2048"], correct: 1, category: "Математика", difficulty: "орташа" },
  { id: 10, text: "Квадраттың периметрі 40 см болса, оның ауданы қанша?", options: ["80 см²", "100 см²", "160 см²", "400 см²"], correct: 1, category: "Математика", difficulty: "орташа" },
  { id: 11, text: "Фибоначчи қатарының алғашқы алты мүшесінің қосындысы?", options: ["20", "12", "25", "33"], correct: 0, category: "Математика", difficulty: "қиын" },

  // Тарих
  { id: 12, text: "Қазақстан Тәуелсіздік алған жыл?", options: ["1989", "1990", "1991", "1992"], correct: 2, category: "Тарих", difficulty: "оңай" },
  { id: 13, text: "Ұлы Жібек жолы қай елдерді байланыстырды?", options: ["Еуропа мен Азияны", "Африка мен Азияны", "Еуропа мен Американы", "Азия мен Австралияны"], correct: 0, category: "Тарих", difficulty: "орташа" },
  { id: 14, text: "Алаш партиясы қашан құрылды?", options: ["1905", "1910", "1917", "1920"], correct: 2, category: "Тарих", difficulty: "қиын" },

  // География
  { id: 15, text: "Қазақстанның астанасы?", options: ["Алматы", "Шымкент", "Астана", "Қарағанды"], correct: 2, category: "География", difficulty: "оңай" },
  { id: 16, text: "Дүниежүзіндегі ең үлкен мұхит?", options: ["Атлант", "Үнді", "Тынық", "Арктика"], correct: 2, category: "География", difficulty: "оңай" },
  { id: 17, text: "Каспий теңізінің ауданы шамамен қанша?", options: ["271 000 км²", "150 000 км²", "371 000 км²", "98 000 км²"], correct: 2, category: "География", difficulty: "қиын" },

  // Жалпы білім
  { id: 18, text: "Адам ағзасындағы ең ұзын сүйек?", options: ["Білезік", "Жамбас", "Асықты жілік", "Жауырын"], correct: 2, category: "Жалпы білім", difficulty: "орташа" },
  { id: 19, text: "Судың химиялық формуласы?", options: ["HO", "H₂O₂", "H₂O", "OH"], correct: 2, category: "Жалпы білім", difficulty: "оңай" },
  { id: 20, text: "Жарықтың вакуумдағы жылдамдығы шамамен?", options: ["300 000 км/с", "150 000 км/с", "450 000 км/с", "1 000 000 км/с"], correct: 0, category: "Жалпы білім", difficulty: "орташа" },
];

export const CATEGORIES = ['Барлығы', 'Бағдарламалау', 'Математика', 'Тарих', 'География', 'Жалпы білім'];

export function getQuestions(category: string, count: number = 7): Question[] {
  let pool: Question[] = [];
  try {
    const stored = localStorage.getItem('qb_questions');
    if (stored) {
      pool = JSON.parse(stored);
    } else {
      pool = [...QUESTIONS];
      localStorage.setItem('qb_questions', JSON.stringify(pool));
    }
  } catch {
    pool = [...QUESTIONS];
  }

  const filtered = category === 'Барлығы'
    ? pool
    : pool.filter(q => q.category === category);
    
  const shuffled = filtered.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function getAllQuestions(): Question[] {
  try {
    const stored = localStorage.getItem('qb_questions');
    if (stored) return JSON.parse(stored);
    localStorage.setItem('qb_questions', JSON.stringify(QUESTIONS));
    return [...QUESTIONS];
  } catch {
    return [...QUESTIONS];
  }
}

export function saveQuestion(q: Question) {
  const qs = getAllQuestions();
  const idx = qs.findIndex(x => x.id === q.id);
  if (idx >= 0) qs[idx] = q;
  else qs.push(q);
  localStorage.setItem('qb_questions', JSON.stringify(qs));
}

export function deleteQuestion(id: number) {
  const qs = getAllQuestions();
  localStorage.setItem('qb_questions', JSON.stringify(qs.filter(x => x.id !== id)));
}

export function getUsers(): User[] {
  try {
    const stored = localStorage.getItem('qb_users');
    if (stored) return JSON.parse(stored);
    const defaultUsers: User[] = [
      { id: 1, name: 'Admin', role: 'admin' },
      { id: 2, name: 'Player1', role: 'player' },
      { id: 3, name: 'Guest', role: 'guest' }
    ];
    localStorage.setItem('qb_users', JSON.stringify(defaultUsers));
    return defaultUsers;
  } catch {
    return [];
  }
}

export function saveUser(u: User) {
  const users = getUsers();
  const idx = users.findIndex(x => x.id === u.id);
  if (idx >= 0) users[idx] = u;
  else users.push(u);
  localStorage.setItem('qb_users', JSON.stringify(users));
}

export function deleteUser(id: number) {
  const users = getUsers();
  localStorage.setItem('qb_users', JSON.stringify(users.filter(x => x.id !== id)));
}

export function logAction(action: string, user: string) {
  console.log(`[LOG] ${new Date().toISOString()} | User: ${user} | Action: ${action}`);
}

export interface LeaderboardEntry {
  name: string;
  wins: number;
  totalGames: number;
  bestStreak: number;
}

export function getLeaderboard(): LeaderboardEntry[] {
  try {
    return JSON.parse(localStorage.getItem('qb_leaderboard') || '[]');
  } catch { return []; }
}

export function updateLeaderboard(winnerName: string, loserName: string, winnerStreak: number) {
  const lb = getLeaderboard();
  const ensure = (name: string) => {
    let entry = lb.find(e => e.name === name);
    if (!entry) { entry = { name, wins: 0, totalGames: 0, bestStreak: 0 }; lb.push(entry); }
    return entry;
  };
  const winner = ensure(winnerName);
  const loser = ensure(loserName);
  winner.wins++;
  winner.totalGames++;
  winner.bestStreak = Math.max(winner.bestStreak, winnerStreak);
  loser.totalGames++;
  localStorage.setItem('qb_leaderboard', JSON.stringify(lb));
}

// ─── NOTIFICATIONS & MESSAGES (Practice Work 5) ───

export interface Notification {
  id: number;
  user_id: number; // қабылдаушы
  title: string;
  message: string;
  is_read: boolean;
  created_at: number;
}

export interface ChatMessage {
  id: number;
  sender_id: number;
  receiver_id: number;
  message_text: string;
  is_read: boolean;
  created_at: number;
}

// -- Notifications CRUD --
export function getNotifications(userId: number): Notification[] {
  try {
    const all: Notification[] = JSON.parse(localStorage.getItem('qb_notifications') || '[]');
    return all.filter(n => n.user_id === userId).sort((a, b) => b.created_at - a.created_at);
  } catch { return []; }
}

export function sendNotification(userId: number, title: string, message: string) {
  try {
    const all: Notification[] = JSON.parse(localStorage.getItem('qb_notifications') || '[]');
    all.push({
      id: Date.now() + Math.random(),
      user_id: userId,
      title,
      message,
      is_read: false,
      created_at: Date.now()
    });
    localStorage.setItem('qb_notifications', JSON.stringify(all));
  } catch {}
}

export function markNotificationAsRead(id: number) {
  try {
    const all: Notification[] = JSON.parse(localStorage.getItem('qb_notifications') || '[]');
    const updated = all.map(n => n.id === id ? { ...n, is_read: true } : n);
    localStorage.setItem('qb_notifications', JSON.stringify(updated));
  } catch {}
}

export function deleteNotification(id: number) {
  try {
    const all: Notification[] = JSON.parse(localStorage.getItem('qb_notifications') || '[]');
    localStorage.setItem('qb_notifications', JSON.stringify(all.filter(n => n.id !== id)));
  } catch {}
}

export function getUnreadNotificationCount(userId: number): number {
  return getNotifications(userId).filter(n => !n.is_read).length;
}

// -- Messages CRUD --
export function getMessages(user1Id: number, user2Id: number): ChatMessage[] {
  try {
    const all: ChatMessage[] = JSON.parse(localStorage.getItem('qb_messages') || '[]');
    return all.filter(m => 
      (m.sender_id === user1Id && m.receiver_id === user2Id) ||
      (m.sender_id === user2Id && m.receiver_id === user1Id)
    ).sort((a, b) => a.created_at - b.created_at); // oldest first for chat history
  } catch { return []; }
}

export function sendMessage(senderId: number, receiverId: number, text: string) {
  if (!text.trim()) return;
  try {
    const all: ChatMessage[] = JSON.parse(localStorage.getItem('qb_messages') || '[]');
    all.push({
      id: Date.now() + Math.random(),
      sender_id: senderId,
      receiver_id: receiverId,
      message_text: text,
      is_read: false,
      created_at: Date.now()
    });
    localStorage.setItem('qb_messages', JSON.stringify(all));
  } catch {}
}

export function markMessagesAsRead(senderId: number, receiverId: number) {
  // If receiverId is reading messages from senderId
  try {
    const all: ChatMessage[] = JSON.parse(localStorage.getItem('qb_messages') || '[]');
    let changed = false;
    all.forEach(m => {
      if (m.sender_id === senderId && m.receiver_id === receiverId && !m.is_read) {
        m.is_read = true;
        changed = true;
      }
    });
    if (changed) {
      localStorage.setItem('qb_messages', JSON.stringify(all));
    }
  } catch {}
}

export function getUnreadMessageCount(userId: number): number {
  try {
    const all: ChatMessage[] = JSON.parse(localStorage.getItem('qb_messages') || '[]');
    return all.filter(m => m.receiver_id === userId && !m.is_read).length;
  } catch { return 0; }
}
