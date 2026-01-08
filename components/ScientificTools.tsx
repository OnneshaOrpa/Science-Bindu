
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { QURANIC_ELEMENTS, SALAH_BENEFITS } from '../constants';
import { Activity, Beaker, Heart, Clock, Sun, Zap, Brain, ArrowLeft, Atom } from 'lucide-react';

interface Props {
  user: UserProfile;
}

const ScientificTools: React.FC<Props> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'tasbeeh' | 'elements' | 'salah'>('tasbeeh');

  // Tasbeeh Logic
  const [count, setCount] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const handleIncrement = () => {
    if (count === 0) setStartTime(new Date());
    setCount(prev => prev + 1);
  };

  const handleReset = () => {
    setCount(0);
    setStartTime(null);
    setElapsedSeconds(0);
  };

  useEffect(() => {
    let interval: any;
    if (startTime) {
      interval = setInterval(() => {
        setElapsedSeconds(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime]);

  // Scientific Calculations (Approximate)
  const lightDistance = (elapsedSeconds * 299792).toLocaleString(); // km
  const heartBeats = Math.floor(elapsedSeconds * 1.2); // ~72 bpm
  const earthRotation = (elapsedSeconds * 0.46).toFixed(2); // km at equator

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-20">
      
      {/* Header Tabs */}
      <div className="flex justify-center gap-2 md:gap-4 mb-8 sticky top-20 z-30 bg-slate-50/90 backdrop-blur-sm p-2">
        <button 
          onClick={() => setActiveTab('tasbeeh')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all ${activeTab === 'tasbeeh' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-600 border hover:bg-slate-50'}`}
        >
          <Clock size={18} /> <span className="hidden md:inline">কসমিক</span> তাসবিহ
        </button>
        <button 
          onClick={() => setActiveTab('elements')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all ${activeTab === 'elements' ? 'bg-amber-600 text-white shadow-lg' : 'bg-white text-slate-600 border hover:bg-slate-50'}`}
        >
          <Beaker size={18} /> কুরআনিক <span className="hidden md:inline">মৌল</span>
        </button>
        <button 
          onClick={() => setActiveTab('salah')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all ${activeTab === 'salah' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-slate-600 border hover:bg-slate-50'}`}
        >
          <Activity size={18} /> নামাজের <span className="hidden md:inline">বিজ্ঞান</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 min-h-[400px]">
        
        {/* --- COSMIC TASBEEH --- */}
        {activeTab === 'tasbeeh' && (
          <div className="p-8 md:p-12 text-center animate-fade-in relative overflow-hidden">
             <div className="absolute inset-0 bg-slate-900 z-0">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-500 rounded-full filter blur-[100px] opacity-20 transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
             </div>
             
             <div className="relative z-10 text-white">
                <h2 className="text-3xl font-bold font-bengali mb-2">মহাজাগতিক তাসবিহ</h2>
                <p className="text-slate-400 text-sm font-bengali mb-8">জিকির করুন এবং দেখুন মহাবিশ্ব কিভাবে চলছে</p>

                <div className="mb-12">
                   <span className="text-8xl font-bold font-mono tracking-tighter text-indigo-400 drop-shadow-lg">{count}</span>
                   <p className="text-slate-500 text-xs uppercase tracking-widest mt-2">Total Count</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                   <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
                      <Sun className="mx-auto text-yellow-400 mb-2" size={24} />
                      <p className="text-2xl font-bold font-mono">{lightDistance}</p>
                      <p className="text-[10px] text-slate-300">আলো অতিক্রম করেছে (কি.মি.)</p>
                   </div>
                   <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
                      <Activity className="mx-auto text-red-400 mb-2" size={24} />
                      <p className="text-2xl font-bold font-mono">{heartBeats}</p>
                      <p className="text-[10px] text-slate-300">আপনার হৃদস্পন্দন (বার)</p>
                   </div>
                   <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
                      <Atom className="mx-auto text-cyan-400 mb-2" size={24} />
                      <p className="text-2xl font-bold font-mono">{earthRotation}</p>
                      <p className="text-[10px] text-slate-300">পৃথিবী ঘুরেছে (কি.মি.)</p>
                   </div>
                </div>

                <button 
                  onClick={handleIncrement}
                  className="w-full md:w-auto px-12 py-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-2xl text-2xl font-bold shadow-2xl transform active:scale-95 transition-all border-t border-white/20"
                >
                   সুবহানাল্লাহ
                </button>
                
                {count > 0 && (
                   <button onClick={handleReset} className="block mx-auto mt-6 text-slate-500 text-sm hover:text-white transition">রিসেট করুন</button>
                )}
             </div>
          </div>
        )}

        {/* --- QURANIC ELEMENTS --- */}
        {activeTab === 'elements' && (
           <div className="p-8 animate-fade-in bg-slate-50">
              <h2 className="text-2xl font-bold text-slate-800 font-bengali text-center mb-6">কুরআনে বর্ণিত রাসায়নিক মৌল</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {QURANIC_ELEMENTS.map((el, idx) => (
                    <div key={idx} className={`bg-white rounded-2xl shadow-sm border-l-4 border-${el.color}-500 p-6 hover:shadow-lg transition-all`}>
                       <div className="flex justify-between items-start mb-4">
                          <div>
                             <h3 className="text-xl font-bold text-slate-800 font-bengali">{el.name}</h3>
                             <p className="text-xs text-slate-500 font-bengali">{el.surahRef}</p>
                          </div>
                          <div className={`w-12 h-12 rounded-lg bg-${el.color}-100 text-${el.color}-700 flex flex-col items-center justify-center font-bold border border-${el.color}-200`}>
                             <span className="text-lg leading-none">{el.symbol}</span>
                             <span className="text-[10px]">{el.atomicNumber}</span>
                          </div>
                       </div>
                       <p className="text-slate-600 text-sm font-bengali leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                          {el.fact}
                       </p>
                    </div>
                 ))}
              </div>
           </div>
        )}

        {/* --- SCIENCE OF SALAH --- */}
        {activeTab === 'salah' && (
            <div className="p-8 animate-fade-in">
               <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-slate-800 font-bengali">নামাজের বৈজ্ঞানিক উপকারিতা</h2>
                  <p className="text-slate-500 text-sm font-bengali">প্রতিটি রুকন আমাদের স্বাস্থ্যের জন্য উপকারী</p>
               </div>
               
               <div className="space-y-6">
                  {SALAH_BENEFITS.map((item, idx) => (
                      <div key={idx} className="flex flex-col md:flex-row gap-6 items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition">
                          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                              <span className="text-2xl font-bold text-emerald-600">{idx + 1}</span>
                          </div>
                          <div className="text-center md:text-left">
                              <h3 className="text-xl font-bold text-slate-800 font-bengali mb-2">{item.position}</h3>
                              <p className="text-slate-600 font-bengali leading-relaxed">{item.benefits}</p>
                          </div>
                      </div>
                  ))}
               </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default ScientificTools;
