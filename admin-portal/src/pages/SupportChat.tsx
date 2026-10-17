import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';
import { 
  ChevronLeft, 
  Send, 
  Image as ImageIcon, 
  Smile, 
  User, 
  CheckCircle2, 
  Clock, 
  Search, 
  MoreVertical,
  X,
  Plus,
  Loader2,
  MessageSquare
} from 'lucide-react';
import { Button, Card, Input, Badge } from '@/src/shared/UI';

export default function SupportChat() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [uploading, setUploading] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('cb_admin_session');
    if (saved) {
      setSession(JSON.parse(saved));
    }

    fetchSessions();
    fetchUsers();

    const sub = supabase
      .channel('public:cb_support_sessions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cb_support_sessions' }, () => {
        fetchSessions();
      })
      .subscribe();

    const interval = setInterval(() => {
      if (document.hidden) return; 
      fetchSessions();
      fetchUsers();
    }, 15000);

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

  const getUserStatus = (username: string) => {
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

  const fetchMessages = async (sessionId: string) => {
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

  const handleSend = async (e: React.FormEvent) => {
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

    await supabase.from('cb_support_sessions').update({
      last_message_at: new Date().toISOString()
    }).eq('id', activeSession.id);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

    } catch (error: any) {
      toast.error('Error uploading image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const filteredSessions = getFilteredSessions();

  return (
    <div className="h-[calc(100vh-140px)] flex gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Session List Sidebar */}
      <Card className="w-80 flex flex-col p-0 overflow-hidden shrink-0 shadow-xl border-slate-200 dark:border-slate-800">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Messages</h3>
            <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest">{filteredSessions.length}</Badge>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-[11px] font-bold outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-slate-300 dark:text-slate-700" />
              </div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">No active support tickets in your node.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {filteredSessions.map(s => {
                const userStatus = getUserStatus(s.user_username);
                const isOnline = userStatus === 'Online';
                const isActive = activeSession?.id === s.id;
                return (
                  <button 
                    key={s.id} 
                    onClick={() => setActiveSession(s)}
                    className={`w-full p-5 text-left transition-all relative group flex items-start gap-3 ${isActive ? 'bg-indigo-50/50 dark:bg-indigo-500/5' : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'}`}
                  >
                    <div className="relative shrink-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs border shadow-sm ${isActive ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}>
                        {s.user_username.substring(0, 2).toUpperCase()}
                      </div>
                      {isOnline && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-950 animate-pulse" />}
                    </div>
                    
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[11px] font-black uppercase tracking-tight truncate ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white'}`}>
                          {s.user_username}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 font-mono">
                          {new Date(s.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium line-clamp-1">Support Session Active</p>
                    </div>

                    {s.unread_admin_count > 0 && (
                      <div className="absolute top-1/2 -translate-y-1/2 right-4 w-5 h-5 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-[10px] font-black shadow-lg shadow-indigo-600/20">
                        {s.unread_admin_count}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {/* Main Chat Area */}
      <Card className="flex-1 flex flex-col p-0 overflow-hidden shadow-2xl border-slate-200 dark:border-slate-800">
        {activeSession ? (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900/50 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 font-black text-xs border border-slate-200 dark:border-slate-700">
                  {activeSession.user_username.substring(0,2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{activeSession.user_username}</h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${getUserStatus(activeSession.user_username) === 'Online' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{getUserStatus(activeSession.user_username)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400">
                  <Search className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 dark:bg-slate-950/20 custom-scrollbar">
              <div className="flex flex-col items-center justify-center py-8">
                <div className="px-4 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-widest border border-slate-200 dark:border-slate-700 shadow-sm">
                  Conversation Established
                </div>
              </div>

              {messages.map((m, idx) => {
                const isAdmin = m.sender === 'admin';
                return (
                  <div key={m.id || idx} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`group relative max-w-[75%] space-y-1 ${isAdmin ? 'items-end' : 'items-start'}`}>
                      <div className={`p-4 rounded-3xl text-sm font-medium shadow-sm transition-all ${
                        isAdmin 
                          ? 'bg-indigo-600 text-white rounded-br-none' 
                          : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-none border border-slate-100 dark:border-slate-700'
                      }`}>
                        {m.image_url && (
                          <div className="mb-3 rounded-2xl overflow-hidden border border-black/5 dark:border-white/5 shadow-2xl">
                            <img src={m.image_url} alt="Attachment" className="max-w-full h-auto object-cover" />
                          </div>
                        )}
                        {m.content && <p className="leading-relaxed break-words">{m.content}</p>}
                        <div className={`mt-2 flex items-center gap-2 opacity-60 text-[9px] font-black uppercase tracking-tighter ${isAdmin ? 'justify-end text-white' : 'justify-start text-slate-400'}`}>
                          <Clock className="w-2.5 h-2.5" />
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {isAdmin && <CheckCircle2 className="w-2.5 h-2.5 text-indigo-200" />}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatBottomRef} />
            </div>

            {/* Input Bar */}
            <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
              <form onSubmit={handleSend} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-2 rounded-[28px] border border-slate-200 dark:border-slate-800 shadow-inner">
                <button 
                  type="button" 
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  className={`p-3 rounded-full transition-all shrink-0 ${uploading ? 'bg-indigo-50 text-indigo-400' : 'hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'}`}
                >
                  {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
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
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  placeholder="Draft your reply..."
                  className="flex-1 bg-transparent border-none text-sm font-bold text-slate-900 dark:text-white outline-none placeholder:text-slate-400 px-2"
                />
                <button 
                  type="submit" 
                  disabled={!inputMsg.trim() || uploading}
                  className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:grayscale rounded-full text-white transition-all shadow-lg shadow-indigo-600/20 active:scale-90"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-6">
            <div className="w-24 h-24 rounded-[32px] bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center shadow-xl border border-indigo-100 dark:border-indigo-900/30 animate-bounce-slow">
              <MessageSquare className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="space-y-2 max-w-xs mx-auto">
              <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Support Terminal</h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">Select an active client session from the directory to begin the administrative support protocol.</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
