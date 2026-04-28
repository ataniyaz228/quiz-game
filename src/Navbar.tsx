import { useState, useEffect } from 'react';
import { User, getUsers, getUnreadNotificationCount, getUnreadMessageCount, Notification, ChatMessage, getNotifications, markNotificationAsRead, getMessages, sendMessage, markMessagesAsRead } from './types';
import { Key, Settings, LogOut, Bell, MessageSquare, X, Send, ArrowLeft } from 'lucide-react';

interface Props {
  currentUser: User | null;
  onLogin: (u: User | null) => void;
  onAdmin: () => void;
}

export default function Navbar({ currentUser, onLogin, onAdmin }: Props) {
  const [showLogin, setShowLogin] = useState(false);
  const usersList = getUsers();

  const [showNotifs, setShowNotifs] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [unreadMsgs, setUnreadMsgs] = useState(0);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Chat state
  const [chatUser, setChatUser] = useState<number | ''>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');

  // Polling for updates (Simulated real-time)
  useEffect(() => {
    if (!currentUser) return;
    
    const fetchStats = () => {
      setUnreadNotifs(getUnreadNotificationCount(currentUser.id));
      setUnreadMsgs(getUnreadMessageCount(currentUser.id));
      
      if (showNotifs) {
        setNotifications(getNotifications(currentUser.id));
      }

      if (showChat && chatUser !== '') {
        setMessages(getMessages(currentUser.id, Number(chatUser)));
        // mark as read when chat is open
        markMessagesAsRead(Number(chatUser), currentUser.id);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 2000);
    return () => clearInterval(interval);
  }, [currentUser, showNotifs, showChat, chatUser]);

  const toggleNotifs = () => {
    setShowNotifs(!showNotifs);
    setShowChat(false);
  };

  const toggleChat = () => {
    setShowChat(!showChat);
    setShowNotifs(false);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || chatUser === '' || !chatInput.trim()) return;
    sendMessage(currentUser.id, Number(chatUser), chatInput);
    setChatInput('');
    setMessages(getMessages(currentUser.id, Number(chatUser)));
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <div className="navbar">
        {currentUser ? (
          <div className="nav-actions">
            <button className="icon-btn" onClick={toggleChat}>
              <MessageSquare size={20} />
              {unreadMsgs > 0 && <span className="badge">{unreadMsgs}</span>}
            </button>
            <button className="icon-btn" onClick={toggleNotifs}>
              <Bell size={20} />
              {unreadNotifs > 0 && <span className="badge">{unreadNotifs}</span>}
            </button>

            <div className="user-profile" style={{ marginLeft: '1rem' }}>
              <span className={`role-badge role-${currentUser.role}`}>{currentUser.role}</span>
              <span className="user-name">{currentUser.name}</span>
            </div>
            
            {currentUser.role === 'admin' && (
              <button className="btn-ghost btn-sm" onClick={onAdmin} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Settings size={16} /> Админ
              </button>
            )}
            <button className="btn-ghost btn-sm" onClick={() => {
              onLogin(null);
              setShowNotifs(false);
              setShowChat(false);
            }} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <LogOut size={16} /> Шығу
            </button>
          </div>
        ) : (
          <button className="btn-primary btn-sm" onClick={() => setShowLogin(true)} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Key size={16} /> Кіру
          </button>
        )}
      </div>

      {/* Notifications Panel */}
      {showNotifs && currentUser && (
        <div className="side-panel">
          <div className="sp-header">
            <h3><Bell size={18}/> Хабарландырулар</h3>
            <button className="icon-btn" onClick={() => setShowNotifs(false)}><X size={18}/></button>
          </div>
          <div className="sp-body">
            {notifications.length > 0 && (
              <button 
                onClick={() => {
                  const all: Notification[] = JSON.parse(localStorage.getItem('qb_notifications') || '[]');
                  const filtered = all.filter(n => n.user_id !== currentUser.id);
                  localStorage.setItem('qb_notifications', JSON.stringify(filtered));
                  setNotifications([]);
                }} 
                className="btn-ghost btn-sm" 
                style={{ width: '100%', marginBottom: '1rem', display: 'flex', justifyContent: 'center', color: 'var(--muted)' }}
              >
                Барлығын өшіру
              </button>
            )}
            {notifications.length === 0 ? (
              <p style={{ color: 'var(--muted)', textAlign: 'center', marginTop: '2rem' }}>Хабарландыру жоқ</p>
            ) : (
              notifications.map(n => (
                <div 
                  key={n.id} 
                  className={`notif-card ${!n.is_read ? 'unread' : ''}`}
                  onClick={() => {
                    if (!n.is_read) {
                      markNotificationAsRead(n.id);
                      setNotifications(getNotifications(currentUser.id));
                    }
                  }}
                  style={{ cursor: !n.is_read ? 'pointer' : 'default' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4>{n.title}</h4>
                    {!n.is_read && <div className="unread-dot" title="Жаңа хабарландыру"></div>}
                  </div>
                  <p>{n.message}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                    <span className="notif-time">{formatDate(n.created_at)}</span>
                    {!n.is_read && <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>Оқу үшін басыңыз</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Chat Panel */}
      {showChat && currentUser && (
        <div className="side-panel">
          <div className="sp-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {chatUser !== '' && (
                <button className="icon-btn" onClick={() => setChatUser('')} style={{ padding: '0.2rem' }}>
                  <ArrowLeft size={16} />
                </button>
              )}
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MessageSquare size={18}/> 
                {chatUser === '' ? 'Чат' : usersList.find(u => u.id === chatUser)?.name}
              </h3>
            </div>
            <button className="icon-btn" onClick={() => setShowChat(false)}><X size={18}/></button>
          </div>
          <div className="sp-body" style={{ display: 'flex', flexDirection: 'column', height: '400px' }}>
            {chatUser === '' ? (
              <div className="chat-user-list-view">
                 {usersList.filter(u => u.id !== currentUser.id).map(u => {
                   const unread = getMessages(u.id, currentUser.id).filter(m => m.receiver_id === currentUser.id && !m.is_read).length;
                   return (
                     <button key={u.id} className="chat-user-btn" onClick={() => setChatUser(u.id)}>
                       <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '1rem' }}>{u.name[0]}</div>
                       <div className="user-info" style={{ flex: 1, textAlign: 'left' }}>
                          <div className="u-name">{u.name}</div>
                          <div className={`role-badge role-${u.role}`} style={{ fontSize: '0.6rem', padding: '0.1rem 0.3rem' }}>{u.role}</div>
                       </div>
                       {unread > 0 && <span className="chat-unread-badge">{unread} жаңа</span>}
                     </button>
                   );
                 })}
              </div>
            ) : (
              <>
                <div className="chat-messages">
                  {messages.length === 0 ? (
                    <p style={{ color: 'var(--muted)', textAlign: 'center', margin: 'auto' }}>Хаттар жоқ. Бірінші болып жазыңыз!</p>
                  ) : (
                    messages.map(m => (
                      <div key={m.id} className={`msg-bubble ${m.sender_id === currentUser.id ? 'sent' : 'received'}`}>
                        {m.message_text}
                        <span className="msg-time">{formatDate(m.created_at)}</span>
                      </div>
                    ))
                  )}
                </div>
                <form className="chat-input-area" onSubmit={handleSendChat}>
                  <input 
                    type="text" 
                    className="chat-input" 
                    placeholder="Хабарлама жазу..." 
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    maxLength={200}
                  />
                  <button type="submit" className="chat-send" disabled={!chatInput.trim()}>
                    <Send size={16} />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLogin && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowLogin(false); }}>
          <div className="modal">
            <h2>Рөлді таңдаңыз (Mock Login)</h2>
            <div className="user-list">
              {usersList.map(u => (
                <button key={u.id} className="user-login-card" onClick={() => { onLogin(u); setShowLogin(false); }}>
                  <div className="user-avatar">{u.name[0]}</div>
                  <div className="user-info">
                    <div className="u-name">{u.name}</div>
                    <div className={`role-badge role-${u.role}`}>{u.role}</div>
                  </div>
                </button>
              ))}
            </div>
            <div className="modal-actions" style={{ marginTop: '1rem', justifyContent: 'center' }}>
              <button className="btn-ghost" onClick={() => setShowLogin(false)}>Жабу</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
