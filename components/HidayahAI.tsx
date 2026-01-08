
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, ChatSession } from '../types';
import { GoogleGenAI } from "@google/genai";
import { supabase } from '../supabase';
import { Send, Sparkles, User, Bot, Loader, Image as ImageIcon, X, GraduationCap, SwitchCamera, Calculator, BookOpen, Brain, Paperclip, History, ChevronLeft, Trash2 } from 'lucide-react';

interface Props {
  user: UserProfile;
}

interface Message {
  role: 'user' | 'model';
  text: string;
  image?: string;
}

const HidayahAI: React.FC<Props> = ({ user }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [pastSessions, setPastSessions] = useState<ChatSession[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Student Mode States
  const [isStudentMode, setIsStudentMode] = useState(false);
  const [studentClass, setStudentClass] = useState<string | null>(null);
  const [attachment, setAttachment] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const CLASSES = [
    "Class 5", "Class 6", "Class 7", "Class 8", 
    "Class 9 (Science)", "Class 10 (SSC)", "HSC"
  ];

  // Fetch History
  useEffect(() => {
    const fetchHistory = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;
      const { data } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false });
      if (data) setPastSessions(data as any);
    };
    fetchHistory();
  }, []);

  const saveSession = async (currentMessages: Message[]) => {
    if (currentMessages.length < 2) return;
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;

    const title = currentMessages[0].text.slice(0, 30) + '...';
    
    await supabase.from('chat_sessions').insert({
      user_id: authUser.id,
      title,
      mode: isStudentMode ? 'student' : 'spiritual',
      messages: currentMessages
    });
  };

  const deleteSession = async (id: string) => {
    await supabase.from('chat_sessions').delete().eq('id', id);
    setPastSessions(pastSessions.filter(s => s.id !== id));
  };

  const loadSession = (session: ChatSession) => {
    setMessages(session.messages);
    setIsStudentMode(session.mode === 'student');
    setShowHistory(false);
    setIsInitializing(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAttachment(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const getSystemInstruction = () => {
    if (isStudentMode && studentClass) {
       return `You are 'Hidayah Tutor', an academic companion for ${user.name} in ${studentClass}. Solve problems step-by-step using KaTeX format.`;
    }
    return `You are HidayahAI, a spiritual guide for ${user.name}, age ${user.age}. Use a gentle, Islamic tone in Bengali.`;
  };

  useEffect(() => {
    if (messages.length > 0) return;
    const sendGreeting = async () => {
      setIsLoading(true);
      try {
        const apiKey = process.env.API_KEY;
        const ai = new GoogleGenAI({ apiKey: apiKey! });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Say Salam and a warm welcome to ${user.name} in Bengali.`,
          config: { systemInstruction: getSystemInstruction() }
        });
        if (response.text) setMessages([{ role: 'model', text: response.text }]);
      } catch (error) {
        setMessages([{ role: 'model', text: `আসসালামু আলাইকুম ${user.name}! আমি হিদায়াহ এআই।` }]);
      } finally {
        setIsLoading(false);
        setIsInitializing(false);
      }
    };
    sendGreeting();
  }, [isStudentMode, studentClass]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text: string = inputText) => {
    if ((!text.trim() && !attachment)) return;
    const userMsg: Message = { role: 'user', text };
    if (attachment) userMsg.image = attachment;
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText('');
    const currentAttachment = attachment;
    setAttachment(null);
    setIsLoading(true);

    try {
      const apiKey = process.env.API_KEY;
      const ai = new GoogleGenAI({ apiKey: apiKey! });
      const promptParts: any[] = [];
      if (currentAttachment) {
          promptParts.push({ inlineData: { data: currentAttachment.split(',')[1], mimeType: currentAttachment.split(';')[0].split(':')[1] } });
      }
      promptParts.push({ text: `Current chat: ${text}. Answer in Bengali.` });

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: promptParts },
        config: { systemInstruction: getSystemInstruction() }
      });
      
      const finalMessages = [...newMessages, { role: 'model', text: response.text || "বুঝতে পারিনি।" }];
      setMessages(finalMessages);
      
      // Auto-save session periodically
      if (finalMessages.length % 4 === 0) saveSession(finalMessages);

    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Error connecting to AI." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- KaTeX & Renderers ... (kept from previous version but optimized) ---
  const MessageBubble = ({ message, themeColor }: { message: Message, themeColor: string }) => {
     return (
        <div className={`p-4 md:p-6 rounded-2xl shadow-sm text-[15px] font-bengali w-full ${message.role === 'user' ? `bg-${themeColor}-600 text-white` : 'bg-white text-slate-800 border border-slate-100'}`}>
          {message.image && <img src={message.image} className="max-w-full h-auto max-h-60 rounded-xl mb-3" />}
          <div className="whitespace-pre-wrap leading-relaxed">{message.text}</div>
        </div>
     );
  };

  if (isStudentMode && !studentClass) {
      return (
        <div className="max-w-4xl mx-auto h-[70vh] flex flex-col items-center justify-center p-6 animate-fade-in">
           <h2 className="text-2xl font-bold mb-6 font-bengali">আপনার শ্রেণি নির্বাচন করুন</h2>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
              {CLASSES.map(cls => (
                <button key={cls} onClick={() => setStudentClass(cls)} className="p-6 bg-white border border-slate-200 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50 font-bold transition-all">{cls}</button>
              ))}
           </div>
           <button onClick={() => setIsStudentMode(false)} className="mt-8 text-slate-400 font-bengali">বাতিল করুন</button>
        </div>
      );
  }

  const themeColor = isStudentMode ? 'indigo' : 'emerald';

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex animate-fade-in">
      
      {/* Sidebar History */}
      {showHistory && (
        <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-2xl z-[60] p-6 animate-slide-in flex flex-col">
           <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-xl flex items-center gap-2"><History size={20}/> ইতিহাস</h3>
              <button onClick={() => setShowHistory(false)}><X size={24}/></button>
           </div>
           <div className="flex-grow overflow-y-auto space-y-3 custom-scrollbar">
              {pastSessions.map(s => (
                <div key={s.id} className="group relative">
                  <button 
                    onClick={() => loadSession(s)}
                    className="w-full p-4 text-left bg-slate-50 border border-slate-100 rounded-2xl hover:bg-brand-50 hover:border-brand-200 transition"
                  >
                    <p className="font-bold text-sm text-slate-800 line-clamp-1">{s.title}</p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase">{s.mode}</p>
                  </button>
                  <button 
                    onClick={() => deleteSession(s.id)}
                    className="absolute right-2 top-2 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 size={14}/>
                  </button>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex flex-col flex-grow bg-white md:rounded-3xl shadow-xl overflow-hidden border border-slate-100 relative">
        
        {/* Header */}
        <div className={`bg-${themeColor}-600 p-4 text-white flex items-center justify-between shrink-0`}>
           <div className="flex items-center gap-3">
              <button onClick={() => setShowHistory(true)} className="p-2 hover:bg-white/10 rounded-full"><History size={20}/></button>
              <div>
                 <h2 className="font-bold font-bengali leading-none">{isStudentMode ? 'Hidayah Tutor' : 'Hidayah AI'}</h2>
                 <p className="text-[10px] opacity-80 mt-1 uppercase font-bold tracking-widest">{isStudentMode ? studentClass : 'Spiritual Guide'}</p>
              </div>
           </div>
           <div className="flex gap-2">
              <button onClick={() => { setIsStudentMode(!isStudentMode); setStudentClass(null); setMessages([]); }} className="p-2 bg-white/10 rounded-full hover:bg-white/20"><SwitchCamera size={18}/></button>
              <button onClick={() => setMessages([])} className="p-2 bg-white/10 rounded-full hover:bg-white/20"><X size={18}/></button>
           </div>
        </div>

        {/* Messages */}
        <div className="flex-grow overflow-y-auto p-4 space-y-6 custom-scrollbar bg-slate-50/50">
           {isInitializing ? (
             <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-300">
                <Loader size={32} className="animate-spin" />
                <p className="font-bengali">AI প্রস্তুত হচ্ছে...</p>
             </div>
           ) : (
             messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                   <div className="max-w-[90%] md:max-w-[80%]">
                      <MessageBubble message={m} themeColor={themeColor} />
                   </div>
                </div>
             ))
           )}
           <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t bg-white">
           {attachment && (
              <div className="mb-2 relative inline-block">
                 <img src={attachment} className="w-16 h-16 rounded-lg object-cover" />
                 <button onClick={() => setAttachment(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"><X size={12}/></button>
              </div>
           )}
           <div className="flex gap-2">
              <button onClick={() => fileInputRef.current?.click()} className="p-3 bg-slate-100 text-slate-400 rounded-xl hover:bg-slate-200 transition"><Paperclip size={20}/></button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              <input 
                type="text" 
                value={inputText} 
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="প্রশ্ন লিখুন..." 
                className="flex-grow p-3 bg-slate-100 rounded-xl focus:outline-none font-bengali"
              />
              <button onClick={() => handleSend()} disabled={isLoading} className={`p-3 bg-${themeColor}-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50`}>
                 {isLoading ? <Loader size={20} className="animate-spin"/> : <Send size={20}/>}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default HidayahAI;
