import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

import toast from 'react-hot-toast';
export default function Support() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const chatBottomRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let sub = null;

    const initChat = async () => {
      const userSessionStr = localStorage.getItem('cb_user_session');
      if (!userSessionStr) return;
      const userSession = JSON.parse(userSessionStr);
      
      // Find or create session
      let { data: sessions } = await supabase
        .from('cb_support_sessions')
        .select('*')
        .eq('user_id', userSession.id);
        
      let activeSessionId;
      if (!sessions || sessions.length === 0) {
        const { data: newSession } = await supabase
          .from('cb_support_sessions')
          .insert([{ user_id: userSession.id, user_username: userSession.username }])
          .select();
        activeSessionId = newSession[0].id;
      } else {
        activeSessionId = sessions[0].id;
      }
      
      setSessionId(activeSessionId);
      
      // Fetch messages
      const { data: msgs } = await supabase
        .from('cb_support_messages')
        .select('*')
        .eq('session_id', activeSessionId)
        .order('created_at', { ascending: true });
        
      if (msgs) setMessages(msgs);

      // Subscribe to new messages
      sub = supabase
        .channel(`support_${activeSessionId}_${Date.now()}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'cb_support_messages', filter: `session_id=eq.${activeSessionId}` }, payload => {
          setMessages(prev => [...prev, payload.new]);
        })
        .subscribe();
    };

    initChat();

    return () => { 
      if (sub) supabase.removeChannel(sub); 
    };
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !sessionId) return;

    const text = inputText;
    setInputText('');

    const newMsg = {
      session_id: sessionId,
      sender: 'user',
      content: text
    };

    await supabase.from('cb_support_messages').insert([newMsg]);
    await supabase.from('cb_support_sessions').update({ 
      last_message_at: new Date().toISOString(),
      unread_admin_count: 1 // Just a simple increment approach could be better, but this triggers admin attention
    }).eq('id', sessionId);
  };

  const handleImageUpload = async (event) => {
    try {
      if (!event.target.files || event.target.files.length === 0 || !sessionId) {
        return;
      }
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${sessionId}-${Date.now()}.${fileExt}`;
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

      // Insert message with image
      const newMsg = {
        session_id: sessionId,
        sender: 'user',
        content: '', // Optional: could be empty if just an image
        image_url: imageUrl
      };

      await supabase.from('cb_support_messages').insert([newMsg]);
      await supabase.from('cb_support_sessions').update({ 
        last_message_at: new Date().toISOString(),
        unread_admin_count: 1
      }).eq('id', sessionId);

    } catch (error) {
      toast.error('Error uploading image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div className="support-page scale-up">
        {/* Support Header replicated from Screenshot 6 */}
        <div className="support-header">
          <div className="header-back-btn" onClick={() => navigate('/home')}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </div>
          
          <div className="agent-info-row">
            {/* Agent Avatar representation */}
            <div className="agent-avatar" style={{ backgroundColor: 'var(--bg-input)' }}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span className="online-indicator-dot"></span>
            </div>
            <div className="agent-titles">
              <span className="agent-name">Online customer service</span>
              <span className="agent-status">Always here to help</span>
            </div>
          </div>

          <div className="header-audio-btn">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          </div>
        </div>

        {/* Message history */}
        <div className="chat-history-container">
          <span className="message-history-title">Message History</span>
          <span className="chat-date-divider">5/28/2026</span>

          {messages.map(msg => (
            <div key={msg.id} className={`chat-bubble-row ${msg.sender === 'user' ? 'outgoing' : 'incoming'}`}>
              {msg.sender === 'admin' && (
                <div className="chat-avatar-mini">CS</div>
              )}
              <div className="chat-bubble-container">
                <div className="chat-bubble" style={{ padding: msg.image_url ? '8px' : undefined }}>
                  {msg.image_url ? (
                    <img src={msg.image_url} alt="Attachment" style={{ maxWidth: '100%', borderRadius: '8px' }} />
                  ) : null}
                  {msg.content && <div style={{ marginTop: msg.image_url ? 8 : 0 }}>{msg.content}</div>}
                </div>
                <span className="chat-meta-time">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                  {msg.sender === 'user' && <span className="read-status">{msg.is_read ? 'Read' : 'Delivered'}</span>}
                </span>
              </div>
            </div>
          ))}
          <div ref={chatBottomRef} />
        </div>

        {/* Floating Chat input box */}
        <div className="chat-input-bar">
          <div className="chat-input-wrapper">
            <button className="chat-tool-btn" title="Add emoji">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
              </svg>
            </button>

            <button className="chat-tool-btn" title="Attach image" onClick={() => !uploading && fileInputRef.current?.click()}>
              {uploading ? (
                <span style={{ fontSize: 10 }}>...</span>
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
              className="message-text-input" 
              placeholder="Please enter message..." 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              id="txt-support-message"
            />

            <button className="message-send-btn" onClick={handleSendMessage} id="btn-send-message">
              Send
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .support-page {
          display: flex;
          flex-direction: column;
          height: calc(100vh - 68px); /* Height minus tab bar */
          background-color: var(--bg-app);
          position: relative;
        }

        .support-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--primary-gradient);
          color: white;
          padding: 10px 16px;
          height: 60px;
          box-shadow: 0 4px 12px rgba(255, 95, 31, 0.15);
        }

        .agent-info-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
          margin-left: 8px;
        }

        .agent-avatar {
          width: 40px;
          height: 40px;
          background-color: white;
          border-radius: 50%;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid rgba(255,255,255,0.4);
        }

        .avatar-img-placeholder {
          font-size: 24px;
        }

        .online-indicator-dot {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 10px;
          height: 10px;
          background-color: #22c55e;
          border: 2px solid white;
          border-radius: 50%;
        }

        .agent-titles {
          display: flex;
          flex-direction: column;
        }

        .agent-name {
          font-size: 14px;
          font-weight: 600;
        }

        .agent-status {
          font-size: 10px;
          opacity: 0.85;
        }

        .header-audio-btn {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
        }

        /* Message feed area */
        .chat-history-container {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding-bottom: 74px; /* Space for input bar */
        }

        .message-history-title {
          font-size: 12px;
          color: var(--text-light);
          text-align: center;
          margin: 8px 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .chat-date-divider {
          background-color: #e2e8f0;
          color: var(--text-muted);
          font-size: 10px;
          font-weight: 550;
          font-family: var(--font-secondary);
          padding: 2px 8px;
          border-radius: 4px;
          align-self: center;
          margin-bottom: 8px;
        }

        .chat-bubble-row {
          display: flex;
          gap: 8px;
          max-width: 80%;
        }

        .chat-bubble-row.incoming {
          align-self: flex-start;
        }

        .chat-bubble-row.outgoing {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .chat-avatar-mini {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background-color: var(--primary-light);
          border: 1px solid var(--primary-color);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 700;
          color: var(--primary-color);
          margin-top: 4px;
          flex-shrink: 0;
        }

        .chat-bubble-container {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .chat-bubble {
          padding: 10px 14px;
          border-radius: var(--border-radius-md);
          font-size: 13px;
          line-height: 1.5;
          word-break: break-word;
        }

        .incoming .chat-bubble {
          background-color: var(--bg-input);
          color: var(--text-main);
          border-top-left-radius: 4px;
          border: var(--border-glass);
        }

        .outgoing .chat-bubble {
          background: var(--primary-gradient);
          color: white;
          border-top-right-radius: 4px;
          box-shadow: 0 2px 8px rgba(0, 113, 206, 0.2);
        }

        .chat-meta-time {
          font-size: 9px;
          color: var(--text-light);
          font-family: var(--font-secondary);
        }

        .incoming .chat-meta-time {
          align-self: flex-start;
        }

        .outgoing .chat-meta-time {
          align-self: flex-end;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .read-status {
          color: #3b82f6;
          font-weight: 600;
        }

        /* Floating Input box */
        .chat-input-bar {
          position: absolute;
          bottom: 12px;
          left: 12px;
          right: 12px;
          z-index: 10;
        }

        .chat-input-wrapper {
          display: flex;
          align-items: center;
          background-color: var(--bg-card);
          padding: 6px;
          border-radius: 30px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
          border: 1.5px solid var(--primary-color);
        }

        .chat-tool-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-light);
        }

        .chat-tool-btn:hover {
          color: var(--text-muted);
        }

        .message-text-input {
          flex: 1;
          height: 36px;
          padding: 0 10px;
          font-size: 13px;
          background-color: transparent;
        }

        .message-send-btn {
          height: 34px;
          padding: 0 16px;
          border-radius: 17px;
          background: var(--primary-gradient);
          color: white;
          font-size: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(255, 95, 31, 0.2);
        }
      `}</style>
    </>
  );
}
