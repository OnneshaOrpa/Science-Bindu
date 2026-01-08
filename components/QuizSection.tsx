
import React, { useState, useEffect, useRef } from 'react';
import { Question, QuizResult, UserProfile } from '../types';
import { ALL_SURAHS, SURAH_DETAILS, EMOTIONAL_REMEDIES, ASMAUL_HUSNA, QURANIC_ELEMENTS, SALAH_BENEFITS, SEERAH_CHAPTERS, STATIC_HADITH_DATA } from '../constants';
import { ArrowLeft, BookOpen, Sparkles, PieChart, MessageCircleQuestion, Send, Bot, User, Loader, X, Quote, Lightbulb, ChevronRight, Mic, MicOff, Search, PlayCircle, PauseCircle, Clock, Atom, Activity, Crown, HeartPulse, ListTree, History, BookOpenText, Info, AlertTriangle } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface Props {
  user: UserProfile;
  onQuizComplete: (result: QuizResult) => void;
  categories: any[];
}

const QuizSection: React.FC<Props> = ({ user, onQuizComplete }) => {
  const [step, setStep] = useState<string>('islamic-sub-selection');
  const [selectedSurah, setSelectedSurah] = useState<any>(null);
  const [surahContent, setSurahContent] = useState<any>(null);
  const [isLoadingSurah, setIsLoadingSurah] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiMode, setAiMode] = useState<'selection' | 'analysis' | 'chat'>('selection');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [infographicData, setInfographicData] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSurahSelect = (surah: any) => {
    setSelectedSurah(surah);
    setStep('surah-details');
    setInfographicData(null);
    setChatMessages([]);
  };

  const fetchSurahData = async (id: number) => {
    setIsLoadingSurah(true);
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${id}/editions/quran-uthmani,bn.bengali`);
      const data = await res.json();
      setSurahContent({
        arabic: data.data[0].ayahs,
        bengali: data.data[1].ayahs
      });
      setStep('surah-reading');
    } catch (e) {
      alert("ডাটা লোড করতে সমস্যা হয়েছে।");
    } finally {
      setIsLoadingSurah(false);
    }
  };

  // Robust Gemini Call with Retry Logic
  const callGemini = async (prompt: string, isJson: boolean = false, retries = 3) => {
    setApiError(null);
    const apiKey = process.env.API_KEY;
    if (!apiKey) return null;

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: isJson ? { responseMimeType: "application/json" } : {}
      });
      return response.text;
    } catch (error: any) {
      if (retries > 0 && (error.status === 429 || error.message.includes('quota'))) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        return callGemini(prompt, isJson, retries - 1);
      }
      setApiError("সার্ভার ব্যস্ত আছে বা লিমিট শেষ। কিছুক্ষণ পর চেষ্টা করুন।");
      return null;
    }
  };

  const generateInfographic = async () => {
    setInfographicData(null);
    setIsAnalyzing(true);
    setAiMode('analysis');

    const prompt = `Analyze Surah ${selectedSurah.name} (ID: ${selectedSurah.id}) and provide a structured JSON in Bengali:
    {
      "summary": "Core theme",
      "stats": {"commands": 5, "prohibitions": 3},
      "lessons": ["point 1", "point 2"],
      "virtues": "Special value"
    }`;

    const text = await callGemini(prompt, true);
    if (text) {
      try {
        setInfographicData(JSON.parse(text));
      } catch (e) {
        setApiError("ডাটা প্রসেস করতে সমস্যা হয়েছে।");
      }
    }
    setIsAnalyzing(false);
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = { role: 'user', text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsSendingChat(true);

    const prompt = `Context: Surah ${selectedSurah.name}.
    Instructions: Answer the question in Bengali. 
    Use bullet points (•) for key facts. 
    DO NOT write long paragraphs. 
    Keep it respectful.
    Question: ${chatInput}`;

    const text = await callGemini(prompt);
    if (text) {
      setChatMessages(prev => [...prev, { role: 'model', text }]);
    }
    setIsSendingChat(false);
  };

  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('•') || trimmed.startsWith('*') || trimmed.startsWith('-')) {
        return <li key={i} className="ml-4 list-disc text-brand-700 mb-1">{trimmed.replace(/^[*•-]\s*/, '')}</li>;
      }
      return <p key={i} className="mb-2 leading-relaxed">{trimmed}</p>;
    });
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in p-4">
      {/* Sub-Selection View */}
      {step === 'islamic-sub-selection' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <button onClick={() => setStep('surah-list')} className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition flex flex-col items-center gap-4 border border-slate-100 group">
            <div className="bg-emerald-100 p-4 rounded-full text-emerald-600 group-hover:scale-110 transition"><BookOpen size={40}/></div>
            <h3 className="font-bold font-bengali text-xl text-slate-800">আল-কুরআন</h3>
          </button>
          <button onClick={() => setStep('islamic-sub-selection')} className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition flex flex-col items-center gap-4 border border-slate-100 group opacity-50">
            <div className="bg-cyan-100 p-4 rounded-full text-cyan-600"><Crown size={40}/></div>
            <h3 className="font-bold font-bengali text-xl text-slate-800">অন্যান্য</h3>
          </button>
        </div>
      )}

      {/* Surah List */}
      {step === 'surah-list' && (
        <div className="animate-fade-in">
          <button onClick={() => setStep('islamic-sub-selection')} className="flex items-center gap-2 text-slate-500 mb-6 font-bengali hover:text-brand-600"><ArrowLeft size={20}/> ফিরে যান</button>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ALL_SURAHS.map(s => (
              <button key={s.id} onClick={() => handleSurahSelect(s)} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-emerald-300 transition flex justify-between items-center group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-700">{s.id}</div>
                  <div className="text-left">
                    <h4 className="font-bold font-bengali text-slate-800">{s.name}</h4>
                    <p className="text-xs text-slate-400">{s.english}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-500"/>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Surah Details */}
      {step === 'surah-details' && selectedSurah && (
        <div className="animate-fade-in max-w-3xl mx-auto">
          <button onClick={() => setStep('surah-list')} className="flex items-center gap-2 text-slate-500 mb-6 font-bengali"><ArrowLeft size={20}/> সূচিপত্র</button>
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
            <div className="bg-emerald-800 p-12 text-center text-white">
              <h1 className="text-5xl font-arabic mb-2">{selectedSurah.name}</h1>
              <p className="text-xl opacity-80">{selectedSurah.english}</p>
            </div>
            <div className="p-8 text-center space-y-8">
              <p className="font-bengali text-slate-600 leading-relaxed text-lg">{SURAH_DETAILS[selectedSurah.id]?.description}</p>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => fetchSurahData(selectedSurah.id)} className="bg-emerald-600 text-white py-4 rounded-2xl font-bold font-bengali hover:bg-emerald-700 transition shadow-lg flex items-center justify-center gap-2"><BookOpen size={20}/> তেলাওয়াত পড়ুন</button>
                <button onClick={() => { setShowAiModal(true); setAiMode('selection'); }} className="bg-slate-800 text-white py-4 rounded-2xl font-bold font-bengali hover:bg-slate-900 transition shadow-lg flex items-center justify-center gap-2"><Sparkles size={20} className="text-yellow-400"/> AI ইনফোগ্রাফিক</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Surah Reading */}
      {step === 'surah-reading' && surahContent && (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
          <div className="sticky top-0 bg-white/90 backdrop-blur-md p-4 border-b z-20 flex justify-between items-center rounded-xl shadow-sm">
            <button onClick={() => setStep('surah-details')} className="p-2 hover:bg-slate-100 rounded-full"><ArrowLeft size={20}/></button>
            <h2 className="font-bold font-bengali text-xl">{selectedSurah.name}</h2>
            <button onClick={() => setShowAiModal(true)} className="bg-slate-800 text-white p-2 rounded-full"><Sparkles size={20}/></button>
          </div>
          <div className="space-y-6">
            {surahContent.arabic.map((ayah: any, i: number) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition">
                <div className="flex justify-between items-start gap-4 mb-6">
                  <span className="w-8 h-8 bg-slate-50 border rounded-full flex items-center justify-center text-xs text-slate-400">{ayah.numberInSurah}</span>
                  <p className="text-right text-3xl font-arabic leading-loose text-slate-800 flex-1">{ayah.text}</p>
                </div>
                <p className="font-bengali text-lg text-slate-600 border-l-4 border-emerald-200 pl-4 leading-relaxed">{surahContent.bengali[i].text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-4xl h-[85vh] overflow-hidden flex flex-col shadow-2xl relative">
            <button onClick={() => setShowAiModal(false)} className="absolute top-4 right-4 z-50 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition"><X size={24}/></button>
            
            <div className="p-6 border-b bg-slate-50 flex items-center gap-3">
              <Sparkles className="text-brand-500" size={24}/>
              <h2 className="font-bold font-bengali text-xl">Hidayah AI - {selectedSurah?.name}</h2>
            </div>

            <div className="flex-grow overflow-y-auto p-8 bg-white relative">
              {/* API ERROR BAR */}
              {apiError && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-center gap-3 border border-red-100 animate-shake">
                  <AlertTriangle size={20}/>
                  <p className="font-bengali font-bold">{apiError}</p>
                  <button onClick={() => setApiError(null)} className="ml-auto underline text-xs">বন্ধ করুন</button>
                </div>
              )}

              {aiMode === 'selection' && (
                <div className="h-full flex flex-col items-center justify-center gap-8 animate-fade-in">
                  <h3 className="text-2xl font-bold text-slate-800 font-bengali">কি করতে চান?</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                    <button onClick={generateInfographic} className="group p-8 rounded-3xl border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 transition flex flex-col items-center text-center gap-4">
                      <div className="bg-emerald-100 p-6 rounded-full text-emerald-600 group-hover:scale-110 transition"><PieChart size={48}/></div>
                      <div>
                        <h4 className="font-bold text-xl font-bengali text-slate-800">ইনফোগ্রাফিক তৈরি করুন</h4>
                        <p className="text-sm text-slate-500 font-bengali mt-1">পুরো সূরার সারসংক্ষেপ ও পরিসংখ্যান</p>
                      </div>
                    </button>
                    <button onClick={() => setAiMode('chat')} className="group p-8 rounded-3xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition flex flex-col items-center text-center gap-4">
                      <div className="bg-blue-100 p-6 rounded-full text-blue-600 group-hover:scale-110 transition"><MessageCircleQuestion size={48}/></div>
                      <div>
                        <h4 className="font-bold text-xl font-bengali text-slate-800">প্রশ্ন করুন</h4>
                        <p className="text-sm text-slate-500 font-bengali mt-1">যেকোনো বিষয়ে AI এর সাথে কথা বলুন</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {isAnalyzing && (
                <div className="h-full flex flex-col items-center justify-center gap-4">
                  <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="font-bengali font-bold text-emerald-700 animate-pulse">AI ইনফোগ্রাফিক্স তৈরি হচ্ছে...</p>
                </div>
              )}

              {aiMode === 'analysis' && infographicData && (
                <div className="space-y-8 animate-slide-up">
                  <div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100">
                    <h4 className="font-bold text-emerald-800 text-2xl font-bengali mb-4 flex items-center gap-2"><Lightbulb size={24}/> মূল থিম</h4>
                    <p className="text-lg text-emerald-900 font-bengali leading-loose">{infographicData.summary}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <h5 className="font-bold font-bengali text-slate-700 mb-4 border-b pb-2">পরিসংখ্যান</h5>
                      <div className="flex justify-around">
                        <div className="text-center">
                          <p className="text-4xl font-bold text-emerald-600">{infographicData.stats.commands}</p>
                          <p className="text-xs text-slate-400 font-bengali">পালনীয় আদেশ</p>
                        </div>
                        <div className="text-center">
                          <p className="text-4xl font-bold text-red-600">{infographicData.stats.prohibitions}</p>
                          <p className="text-xs text-slate-400 font-bengali">বর্জনীয় নিষেধ</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 shadow-sm">
                      <h5 className="font-bold font-bengali text-amber-800 mb-4 border-b border-amber-200 pb-2">শিক্ষা ও ফজিলত</h5>
                      <ul className="space-y-2">
                        {infographicData.lessons.map((l: string, i: number) => (
                          <li key={i} className="flex gap-2 text-amber-900 text-sm font-bengali"><div className="mt-1 w-1.5 h-1.5 bg-amber-400 rounded-full shrink-0"></div> {l}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <button onClick={() => setAiMode('selection')} className="w-full py-3 bg-slate-100 rounded-xl font-bold font-bengali text-slate-600 hover:bg-slate-200 transition">পেছনে যান</button>
                </div>
              )}

              {aiMode === 'chat' && (
                <div className="h-full flex flex-col">
                  <div className="flex-grow overflow-y-auto space-y-4 pr-2 mb-4">
                    {chatMessages.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4">
                        <Bot size={64} className="opacity-20"/>
                        <p className="font-bengali">এই সূরা সম্পর্কে আপনার প্রশ্ন লিখুন...</p>
                      </div>
                    )}
                    {chatMessages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-4 rounded-2xl font-bengali text-sm leading-relaxed ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'}`}>
                          {msg.role === 'model' ? formatText(msg.text) : msg.text}
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef}></div>
                  </div>
                  <div className="relative mt-auto">
                    <input 
                      type="text" 
                      value={chatInput} 
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleChat()}
                      placeholder="প্রশ্ন লিখুন..."
                      className="w-full bg-slate-100 border-none rounded-2xl py-4 pl-6 pr-14 outline-none focus:ring-2 focus:ring-emerald-500 font-bengali"
                    />
                    <button onClick={handleChat} disabled={isSendingChat || !chatInput.trim()} className="absolute right-2 top-2 bg-emerald-600 text-white p-2 rounded-xl hover:bg-emerald-700 transition disabled:opacity-50">
                      {isSendingChat ? <Loader size={20} className="animate-spin"/> : <Send size={20}/>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizSection;
