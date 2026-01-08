
import React, { useState } from 'react';
import { supabase } from '../supabase';
import { LogIn, UserPlus, Lock, User, Briefcase, Calendar, MapPin, ArrowRight, HelpCircle, ArrowLeft, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

interface Props {
  onComplete: () => void; // Triggered when auth state changes in App.tsx
}

const OnboardingModal: React.FC<Props> = ({ onComplete }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [profession, setProfession] = useState('');
  const [address, setAddress] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return setError('ইমেইল এবং পাসওয়ার্ড প্রদান করুন।');
    
    setError('');
    setLoading(true);

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError('ভুল ইমেইল অথবা পাসওয়ার্ড। দয়া করে সঠিক তথ্য দিয়ে চেষ্টা করুন।');
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !age || !birthYear || !profession) {
      return setError('সবগুলো ঘর সঠিকভাবে পূরণ করুন।');
    }

    setError('');
    setLoading(true);

    try {
      // 1. Supabase Auth Signup
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

      if (authData.user) {
        // 2. Create entry in 'profiles' table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            name,
            age: parseInt(age) || 0,
            birth_year: parseInt(birthYear) || 0,
            profession,
            address,
          });

        if (profileError) {
          console.error("Profile saving error details:", profileError);
          // Special case: Account created but profile insertion failed
          setError("অ্যাকাউন্ট তৈরি হয়েছে কিন্তু ডাটাবেসে সেভ করতে সমস্যা হয়েছে। দয়া করে সুপাবেসে SQL কোডটি ঠিকমতো রান করেছেন কি না নিশ্চিত করুন।");
          setLoading(false);
          return;
        }
      }
    } catch (err: any) {
      setError(err.message || 'সাইন আপ করতে সমস্যা হয়েছে।');
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return setError('রিসেট করতে আপনার ইমেইল দিন।');
    
    setLoading(true);
    setError('');
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);

    if (resetError) {
      setError(resetError.message);
    } else {
      setSuccessMsg("আপনার ইমেইলে পাসওয়ার্ড রিসেট লিঙ্ক পাঠানো হয়েছে।");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border border-white/20 flex flex-col max-h-[90vh]">
        
        {/* Header Section */}
        <div className="bg-slate-900 p-8 text-center relative shrink-0">
           <div className="absolute inset-0 bg-gradient-to-br from-brand-600/20 to-transparent opacity-50"></div>
           <h2 className="text-3xl font-black text-white font-bengali relative z-10 tracking-tight">Science Bindu</h2>
           <p className="text-slate-400 text-sm mt-1 font-bengali relative z-10">বিজ্ঞান ও দ্বীনের আলোকবর্তিকা</p>
           
           {mode !== 'forgot' && (
             <div className="flex mt-8 bg-white/5 p-1.5 rounded-2xl relative z-10 backdrop-blur-md border border-white/10">
               <button 
                 onClick={() => { setMode('login'); setError(''); }}
                 className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all font-bengali flex items-center justify-center gap-2 ${mode === 'login' ? 'bg-white text-slate-900 shadow-xl' : 'text-white/60 hover:text-white'}`}
               >
                 <LogIn size={18} /> লগিন
               </button>
               <button 
                 onClick={() => { setMode('signup'); setError(''); }}
                 className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all font-bengali flex items-center justify-center gap-2 ${mode === 'signup' ? 'bg-white text-slate-900 shadow-xl' : 'text-white/60 hover:text-white'}`}
               >
                 <UserPlus size={18} /> সাইন আপ
               </button>
             </div>
           )}
        </div>
        
        {/* Form Body */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex-grow bg-white">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bengali mb-6 border border-red-100 flex items-center gap-3 animate-shake">
              <AlertCircle size={20} className="shrink-0" />
              <p>{error}</p>
            </div>
          )}
          
          {successMsg && (
            <div className="bg-emerald-50 text-emerald-700 p-6 rounded-2xl text-center font-bengali mb-6 border border-emerald-200">
              <CheckCircle className="mx-auto mb-3 text-emerald-500" size={32}/>
              <p className="font-bold text-lg mb-4">{successMsg}</p>
              <button 
                onClick={() => { setMode('login'); setSuccessMsg(''); }}
                className="bg-emerald-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition"
              >
                লগিন পেজে ফিরুন
              </button>
            </div>
          )}

          {mode === 'login' && !successMsg && (
            <form onSubmit={handleLogin} className="space-y-5">
               <div className="space-y-4">
                 <div>
                   <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest font-bengali ml-1">আপনার ইমেইল</label>
                   <div className="relative">
                     <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                     <input
                       type="email"
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                       required
                       className="w-full pl-12 pr-5 py-4 border-2 border-slate-100 rounded-2xl focus:border-brand-500 focus:ring-0 outline-none transition-all font-sans"
                       placeholder="name@example.com"
                     />
                   </div>
                 </div>

                 <div>
                   <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest font-bengali ml-1">পাসওয়ার্ড</label>
                   <div className="relative">
                     <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                     <input
                       type="password"
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                       required
                       className="w-full pl-12 pr-5 py-4 border-2 border-slate-100 rounded-2xl focus:border-brand-500 focus:ring-0 outline-none transition-all font-sans"
                       placeholder="••••••••"
                     />
                   </div>
                 </div>
               </div>

               <button 
                 type="button"
                 onClick={() => setMode('forgot')}
                 className="text-brand-600 text-sm font-bengali font-bold hover:underline block ml-1"
               >
                 পাসওয়ার্ড মনে নেই?
               </button>

               <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <><span className="font-bengali text-lg">লগিন করুন</span><ArrowRight size={20} /></>}
              </button>
            </form>
          )}

          {mode === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4">
               <div>
                 <label className="block text-xs font-bold text-slate-400 mb-1.5 font-bengali ml-1">পূর্ণ নাম</label>
                 <input
                   type="text"
                   value={name}
                   onChange={(e) => setName(e.target.value)}
                   className="w-full px-5 py-3 border-2 border-slate-100 rounded-2xl focus:border-brand-500 outline-none transition font-bengali"
                   placeholder="আপনার নাম লিখুন"
                 />
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-xs font-bold text-slate-400 mb-1.5 font-bengali ml-1">বয়স</label>
                   <input
                     type="number"
                     value={age}
                     onChange={(e) => setAge(e.target.value)}
                     className="w-full px-5 py-3 border-2 border-slate-100 rounded-2xl focus:border-brand-500 outline-none transition"
                     placeholder="বয়স"
                   />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-slate-400 mb-1.5 font-bengali ml-1">জন্ম সাল</label>
                   <input
                     type="number"
                     value={birthYear}
                     onChange={(e) => setBirthYear(e.target.value)}
                     className="w-full px-5 py-3 border-2 border-slate-100 rounded-2xl focus:border-brand-500 outline-none transition"
                     placeholder="সাল"
                   />
                 </div>
               </div>

               <div>
                 <label className="block text-xs font-bold text-slate-400 mb-1.5 font-bengali ml-1">পেশা বা শ্রেণি</label>
                 <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      value={profession}
                      onChange={(e) => setProfession(e.target.value)}
                      className="w-full pl-12 pr-5 py-3 border-2 border-slate-100 rounded-2xl focus:border-brand-500 outline-none transition font-bengali"
                      placeholder="ছাত্র / শিক্ষক / প্রকৌশলী"
                    />
                 </div>
               </div>

               <div>
                 <label className="block text-xs font-bold text-slate-400 mb-1.5 font-bengali ml-1">ঠিকানা</label>
                 <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full pl-12 pr-5 py-3 border-2 border-slate-100 rounded-2xl focus:border-brand-500 outline-none transition font-bengali"
                      placeholder="আপনার এলাকা বা জেলার নাম"
                    />
                 </div>
               </div>

               <div>
                 <label className="block text-xs font-bold text-slate-400 mb-1.5 font-bengali ml-1">ইমেইল ঠিকানা</label>
                 <input
                   type="email"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   className="w-full px-5 py-3 border-2 border-slate-100 rounded-2xl focus:border-brand-500 outline-none transition font-sans"
                   placeholder="your@email.com"
                 />
               </div>

               <div>
                 <label className="block text-xs font-bold text-slate-400 mb-1.5 font-bengali ml-1">পাসওয়ার্ড</label>
                 <input
                   type="password"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="w-full px-5 py-3 border-2 border-slate-100 rounded-2xl focus:border-brand-500 outline-none transition font-sans"
                   placeholder="কমপক্ষে ৬ অক্ষর"
                 />
               </div>

               <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <><span className="font-bengali text-lg">অ্যাকাউন্ট তৈরি করুন</span><ArrowRight size={20} /></>}
              </button>
            </form>
          )}

          {mode === 'forgot' && (
            <form onSubmit={handleResetPassword} className="space-y-6">
               <div className="text-center">
                 <h3 className="text-xl font-bold text-slate-800 font-bengali">পাসওয়ার্ড ফিরে পান</h3>
                 <p className="text-sm text-slate-500 font-bengali mt-2">আপনার রেজিস্টার্ড ইমেইলটি নিচে লিখুন</p>
               </div>

               <div>
                 <label className="block text-xs font-bold text-slate-400 mb-2 font-bengali ml-1">আপনার ইমেইল</label>
                 <input
                   type="email"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   required
                   className="w-full px-5 py-4 border-2 border-slate-100 rounded-2xl focus:border-brand-500 outline-none transition font-sans"
                   placeholder="example@mail.com"
                 />
               </div>

               <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <span className="font-bengali text-lg">রিসেট লিঙ্ক পাঠান</span>}
              </button>

              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full text-slate-500 text-sm font-bold flex items-center justify-center gap-2 hover:text-slate-900 transition font-bengali"
              >
                <ArrowLeft size={18} /> লগিন পেজে ফিরুন
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
