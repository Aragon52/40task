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
      unread_admin_count: 1
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
        content: '',
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
    <div className="flex flex-col h-screen max-w-md mx-auto bg-slate-50 relative pb-32">
      {/* Sticky Chat Header */}
      <div className="h-16 px-4 bg-white/95 backdrop-blur border-b border-slate-100 flex items-center justify-between sticky top-0 z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-2xs">
              CS
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Live Support</h3>
            <p className="text-[11px] text-emerald-600 font-medium">Online • Typically replies instantly</p>
          </div>
        </div>

        <button 
          onClick={() => navigate('/home')} 
          className="p-2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer rounded-xl hover:bg-slate-100"
          title="Back to Home"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
      </div>

      {/* Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-36">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div 
              key={msg.id} 
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div 
                className={
                  isUser 
                    ? "bg-blue-600 text-white rounded-2xl rounded-tr-xs px-4 py-2.5 text-sm max-w-[80%] ml-auto shadow-xs"
                    : "bg-white border border-slate-200/80 text-slate-800 rounded-2xl rounded-tl-xs px-4 py-2.5 text-sm max-w-[80%] mr-auto shadow-2xs"
                }
              >
                {msg.image_url && (
                  <img 
                    src={msg.image_url} 
                    alt="Attachment" 
                    className="max-w-full rounded-lg mb-2 object-cover" 
                  />
                )}
                {msg.content && <div>{msg.content}</div>}
              </div>

              <span className="text-[10px] text-slate-400 mt-1 block px-1 font-mono">
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {isUser && (
                  <span className="ml-1 text-blue-500 font-medium">
                    {msg.is_read ? '• Read' : '• Delivered'}
                  </span>
                )}
              </span>
            </div>
          );
        })}
        <div ref={chatBottomRef} />
      </div>

      {/* Docked Modern Input Bar */}
      <div className="fixed bottom-14 inset-x-0 mx-auto w-full max-w-md bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-3 py-2.5 z-40 shadow-lg">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }} 
          className="flex items-center gap-2"
        >
          <button 
            type="button" 
            onClick={() => !uploading && fileInputRef.current?.click()} 
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer rounded-xl hover:bg-slate-100 shrink-0"
            title="Attach image"
          >
            {uploading ? (
              <span className="text-xs font-bold animate-pulse">...</span>
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            )}
          </button>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleImageUpload} 
          />

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            id="txt-support-message"
          />

          <button
            type="submit"
            id="btn-send-message"
            className="h-10 px-5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center shrink-0 cursor-pointer"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
