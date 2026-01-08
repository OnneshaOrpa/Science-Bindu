
import React, { useState } from 'react';
import { UserProfile, ViewState } from '../types';
import { BLOG_POSTS } from '../constants';
// Added Loader2 to the imports
import { User, Award, History, BookOpen, Edit2, MapPin, Briefcase, Calendar, Save, X, Heart, MessageSquare, Loader2 } from 'lucide-react';

interface Props {
  user: UserProfile;
  onUpdateProfile: (data: Partial<UserProfile>) => Promise<boolean>;
  onNavigate: (view: ViewState) => void;
}

const ProfileSection: React.FC<Props> = ({ user, onUpdateProfile, onNavigate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user.name,
    profession: user.profession,
    address: user.address,
    age: user.age,
    birthYear: user.birthYear
  });
  const [loading, setLoading] = useState(false);

  const averageScore = user.quizHistory.length > 0
    ? Math.round(user.quizHistory.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions * 100), 0) / user.quizHistory.length)
    : 0;

  const handleSave = async () => {
    setLoading(true);
    const success = await onUpdateProfile(editData);
    if (success) setIsEditing(false);
    setLoading(false);
  };

  const savedBlogs = BLOG_POSTS.filter(b => user.bookmarks?.includes(b.id));

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-20">
      {/* User Card */}
      <div className="bg-slate-900 rounded-3xl shadow-xl p-8 text-white mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
           <User size={200} />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-24 h-24 bg-brand-500 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-slate-800">
            <User size={48} />
          </div>
          <div className="text-center md:text-left flex-grow">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <h2 className="text-3xl font-bold font-bengali">{user.name}</h2>
              <button 
                onClick={() => setIsEditing(true)} 
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition"
              >
                <Edit2 size={16} />
              </button>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-slate-400 font-bengali text-sm">
              <span className="flex items-center gap-1"><Briefcase size={14}/> {user.profession}</span>
              <span className="flex items-center gap-1"><Calendar size={14}/> {user.age} বছর</span>
              <span className="flex items-center gap-1"><MapPin size={14}/> {user.address}</span>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 text-center">
             <p className="text-xs text-brand-400 uppercase font-bold tracking-widest mb-1">গড় স্কোর</p>
             <p className="text-3xl font-bold">{averageScore}%</p>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Activity & Saved */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Saved Blogs */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b flex items-center justify-between">
              <h3 className="font-bold text-slate-800 font-bengali flex items-center gap-2">
                <Heart size={18} className="text-red-500" /> পছন্দের ব্লগসমূহ
              </h3>
              <span className="text-xs font-bold text-slate-400">{savedBlogs.length} টি</span>
            </div>
            <div className="p-4">
              {savedBlogs.length === 0 ? (
                <div className="py-12 text-center">
                   <BookOpen className="mx-auto text-slate-200 mb-2" size={40} />
                   <p className="text-slate-400 font-bengali text-sm">এখনো কোনো ব্লগ সেভ করা হয়নি</p>
                   <button onClick={() => onNavigate('home')} className="mt-4 text-brand-600 font-bold font-bengali hover:underline">ব্লগ পড়ুন</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedBlogs.map(blog => (
                    <div key={blog.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 transition cursor-pointer">
                      <img src={blog.image} className="w-16 h-16 rounded-xl object-cover" />
                      <div className="flex-grow">
                        <h4 className="font-bold text-slate-800 font-bengali line-clamp-1">{blog.title}</h4>
                        <p className="text-xs text-slate-400 font-bengali">{blog.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quiz History */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b">
              <h3 className="font-bold text-slate-800 font-bengali flex items-center gap-2">
                <History size={18} /> কুইজ ইতিহাস
              </h3>
            </div>
            <div className="divide-y divide-slate-50">
              {user.quizHistory.length === 0 ? (
                <div className="p-12 text-center text-slate-400 font-bengali">এখনো কোনো কুইজ দেওয়া হয়নি</div>
              ) : (
                [...user.quizHistory].map((q, i) => (
                  <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition">
                    <div>
                      <p className="font-bold text-slate-800 font-bengali">{q.category}</p>
                      <p className="text-xs text-slate-400">{q.date}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-lg font-bold text-brand-600">{q.score}/{q.totalQuestions}</p>
                       <p className="text-[10px] text-slate-400 uppercase font-bold">Score</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Badges & Info */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
             <h4 className="font-bold text-slate-800 font-bengali mb-4 flex items-center gap-2">
                <Award size={18} className="text-yellow-500" /> অর্জনসমূহ
             </h4>
             <div className="flex flex-wrap gap-3">
                {user.quizHistory.length > 0 && (
                   <div className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold font-bengali">কুইজার</div>
                )}
                {averageScore >= 80 && (
                   <div className="bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-full text-xs font-bold font-bengali">জিনিয়াস</div>
                )}
                <div className="bg-brand-100 text-brand-700 px-3 py-1.5 rounded-full text-xs font-bold font-bengali">নতুন সদস্য</div>
             </div>
          </div>

          <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden group cursor-pointer" onClick={() => onNavigate('hidayah')}>
             <div className="absolute -bottom-4 -right-4 opacity-20 transform group-hover:scale-125 transition">
                <MessageSquare size={100} />
             </div>
             <h4 className="text-xl font-bold font-bengali mb-2">Hidayah AI</h4>
             <p className="text-indigo-100 text-sm font-bengali mb-4">আপনার করা পূর্ববর্তী প্রশ্নসমূহ এবং AI এর সাথে করা চ্যাটগুলি দেখুন।</p>
             <button className="bg-white text-indigo-700 px-4 py-2 rounded-full font-bold text-xs uppercase transition-colors hover:bg-indigo-50">ইতিহাস দেখুন</button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between bg-slate-50">
               <h3 className="font-bold text-xl font-bengali">প্রোফাইল এডিট করুন</h3>
               <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
            </div>
            <div className="p-6 space-y-4">
               <div>
                  <label className="text-xs font-bold text-slate-500 font-bengali block mb-1">নাম</label>
                  <input 
                    type="text" 
                    value={editData.name} 
                    onChange={e => setEditData({...editData, name: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 font-bengali" 
                  />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 font-bengali block mb-1">বয়স</label>
                    <input 
                      type="number" 
                      value={editData.age} 
                      onChange={e => setEditData({...editData, age: e.target.value})}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 font-bengali block mb-1">জন্ম সাল</label>
                    <input 
                      type="number" 
                      value={editData.birthYear} 
                      onChange={e => setEditData({...editData, birthYear: e.target.value})}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500" 
                    />
                  </div>
               </div>
               <div>
                  <label className="text-xs font-bold text-slate-500 font-bengali block mb-1">পেশা</label>
                  <input 
                    type="text" 
                    value={editData.profession} 
                    onChange={e => setEditData({...editData, profession: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 font-bengali" 
                  />
               </div>
               <div>
                  <label className="text-xs font-bold text-slate-500 font-bengali block mb-1">ঠিকানা</label>
                  <input 
                    type="text" 
                    value={editData.address} 
                    onChange={e => setEditData({...editData, address: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 font-bengali" 
                  />
               </div>
               <button 
                 onClick={handleSave}
                 disabled={loading}
                 className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold font-bengali flex items-center justify-center gap-2 hover:bg-black transition-all disabled:opacity-50"
               >
                 {/* Loader2 is now correctly imported */}
                 {loading ? <Loader2 className="animate-spin" size={20}/> : <><Save size={20}/> সেভ করুন</>}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSection;
