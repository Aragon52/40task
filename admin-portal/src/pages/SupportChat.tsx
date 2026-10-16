import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';

import toast from 'react-hot-toast';
export default function SupportChat() {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [uploading, setUploading] = useState(false);
  const [session, setSession] = useState(null);
  const [users, setUsers] = useState([]);
  const chatBottomRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('cb_admin_session');
    if (saved) {
      setSession(JSON.parse(saved));
    }

    fetchSessions();
    fetchUsers();

    const sub = supabase
      .channel('public:cb_support_sessions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cb_support_sessions' }, payload => {
        fetchSessions();
      })
      .subscribe();

    const interval = setInterval(() => {
      if (document.hidden) return; // Save bandwidth when tab is in background!
      fetchSessions();
      fetchUsers();
    }, 12000); // 12 seconds fallback instead of 4

    return () => { 
      supabase.removeChannel(sub); 
      clearInterval(interval);
    };
  }, []);

  const fetchSessions = async () => {
    const { data, error } = await supabase
      .from('cb_support_sessions')
      .select('*')
      .order('last_message_at', { ascending: false });
    
    if (!error && data) {
      setSessions(data);
    }
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('cb_users')
      .select('id, username, online, member_of_admin_id, referred_by_staff_id');
    
    if (!error && data) {
      setUsers(data);
    }
  };

  const getFilteredSessions = () => {
    return sessions.filter(s => {
      const user = users.find(u => u.username?.toLowerCase() === s.user_username?.toLowerCase() || u.id === s.user_id);
      if (!user) {
        return session?.role === 'Owner';
      }
      
      if (session?.role === 'Admin') {
        return user.member_of_admin_id === session.accountId;
      } else if (session?.role === 'Staff') {
        return user.referred_by_staff_id === session.accountId;
      }
      return true;
    });
  };

  const getUserStatus = (username) => {
    const user = users.find(u => u.username?.toLowerCase() === username?.toLowerCase());
    return user?.online || 'Offline';
  };

  useEffect(() => {
    if (!activeSession) return;

    fetchMessages(activeSession.id);

    // Mark as read
    supabase.from('cb_support_sessions').update({ unread_admin_count: 0 }).eq('id', activeSession.id).then();

    const sub = supabase
      .channel(`support_admin_${activeSession.id}_${Date.now()}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'cb_support_messages', filter: `session_id=eq.${activeSession.id}` }, payload => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => { supabase.removeChannel(sub); };
  }, [activeSession]);

  const fetchMessages = async (sessionId) => {
    const { data, error } = await supabase
      .from('cb_support_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    
    if (!error && data) setMessages(data);
  };

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim() || !activeSession) return;

    const text = inputMsg;
    setInputMsg('');

    const newMsg = {
      session_id: activeSession.id,
      sender: 'admin',
      content: text
    };

    const { error } = await supabase.from('cb_support_messages').insert([newMsg]);
    if (error) {
      toast.error("Failed to send message: " + error.message);
      return;
    }

    // Update session
    await supabase.from('cb_support_sessions').update({
      last_message_at: new Date().toISOString()
    }).eq('id', activeSession.id);
  };

  const handleImageUpload = async (event) => {
    try {
      if (!event.target.files || event.target.files.length === 0 || !activeSession) {
        return;
      }
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${activeSession.id}-admin-${Date.now()}.${fileExt}`;
      const filePath = `chat/${fileName}`;

      setUploading(true);

      const { error: uploadError } = await supabase.storage
        .from('cb_storage')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('cb_storage')
        .getPublicUrl(filePath);

      const imageUrl = publicUrlData.publicUrl;

      const newMsg = {
        session_id: activeSession.id,
        sender: 'admin',
        content: '',
        image_url: imageUrl
      };

      await supabase.from('cb_support_messages').insert([newMsg]);
      await supabase.from('cb_support_sessions').update({
        last_message_at: new Date().toISOString()
      }).eq('id', activeSession.id);

    } catch (error) {
      toast.error('Error uploading image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-page-container scale-up support-chat-layout">
      {/* Session List */}
      <div className="admin-card support-chat-sessions">
        <h3 className="section-title">Support Sessions</h3>
        <div style={{ flex: 1, overflowY: 'auto', marginTop: 12 }}>
          {getFilteredSessions().length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No active sessions.</p>
          ) : (
            getFilteredSessions().map(s => {
              const userStatus = getUserStatus(s.user_username);
              const isOnline = userStatus === 'Online';
              return (
                <div 
                  key={s.id} 
                  onClick={() => setActiveSession(s)}
                  style={{
                    padding: '12px 16px',
                    marginBottom: 8,
                    borderRadius: 12,
                    backgroundColor: activeSession?.id === s.id ? 'var(--bg-app)' : 'transparent',
                    border: `1px solid ${activeSession?.id === s.id ? 'var(--border-color-focus)' : 'var(--border-color)'}`,
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-main)' }}>{s.user_username}</div>
                    <span style={{ 
                      fontSize: 10, 
                      fontWeight: 700, 
                      padding: '2px 8px', 
                      borderRadius: '12px',
                      backgroundColor: isOnline ? '#d1fae5' : '#fee2e2',
                      color: isOnline ? '#065f46' : '#991b1b',
                      textTransform: 'uppercase'
                    }}>
                      {userStatus}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-light)' }}>
                    {new Date(s.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  {s.unread_admin_count > 0 && (
                    <div style={{ position: 'absolute', right: 12, bottom: 12, background: 'var(--color-danger)', color: 'white', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 'bold' }}>
                      {s.unread_admin_count}
                    </div>
                  )}
                </div>
              );
            })
          )}
      </div>

      {/* Chat Area */}
      <div className="admin-card support-chat-conversation">
        {activeSession ? (
          <>
            <div className="support-chat-header">
              Chatting with {activeSession.user_username}
            </div>
            
            <div className="support-chat-messages">
              {messages.map(m => {
                const isAdmin = m.sender === 'admin';
                return (
                  <div key={m.id} style={{ display: 'flex', justifyContent: isAdmin ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '70%',
                      padding: m.image_url ? '8px' : '10px 16px',
                      borderRadius: 16,
                      backgroundColor: isAdmin ? 'var(--color-primary)' : 'var(--chat-bubble-user-bg, #f1f5f9)',
                      color: isAdmin ? '#ffffff' : 'var(--chat-bubble-user-text, #181d28)',
                      fontSize: 14,
                      overflowWrap: 'anywhere'
                    }}>
                      {m.image_url ? (
                        <img src={m.image_url} alt="Attachment" style={{ maxWidth: '100%', borderRadius: 8, display: 'block' }} />
                      ) : null}
                      {m.content && <div style={{ marginTop: m.image_url ? 8 : 0 }}>{m.content}</div>}
                      <div style={{ fontSize: 10, marginTop: 4, opacity: 0.7, textAlign: isAdmin ? 'right' : 'left' }}>
                        {new Date(m.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatBottomRef} />
            </div>

            <form onSubmit={handleSend} className="support-chat-form">
              <button 
                type="button" 
                onClick={() => !uploading && fileInputRef.current?.click()}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-admin-muted)', padding: 4 }}
                title="Attach Image"
              >
                {uploading ? (
                  <span style={{ fontSize: 12 }}>...</span>
                ) : (
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                )}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                accept="image/*" 
                onChange={handleImageUpload} 
              />
              <input 
                type="text" 
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder="Type your message..."
                style={{ 
                  flex: 1, 
                  padding: '10px 16px', 
                  borderRadius: 20, 
                  border: '1px solid var(--border-color)', 
                  backgroundColor: 'var(--bg-surface)', 
                  color: 'var(--text-main)', 
                  outline: 'none' 
                }}
              />
              <button type="submit" className="btn-admin-primary" style={{ borderRadius: 20, padding: '0 24px' }}>
                Send
              </button>
            </form>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            Select a session from the left to start chatting
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
