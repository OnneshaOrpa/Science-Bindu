
import React, { useState, useEffect } from 'react';
import { UserProfile, ViewState, QuizResult } from './types';
import { BLOG_POSTS, ISLAMIC_QUESTIONS } from './constants';
import Header from './components/Header';
import OnboardingModal from './components/OnboardingModal';
import BlogSection from './components/BlogSection';
import QuizSection from './components/QuizSection';
import ProfileSection from './components/ProfileSection';
import AboutSection from './components/AboutSection';
import ContactSection from './components/ContactSection';
import HidayahAI from './components/HidayahAI'; 
import Footer from './components/Footer';
import { supabase } from './supabase';
import { Sparkles, BookHeart, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [view, setView] = useState<ViewState>('home');
  const [loading, setLoading] = useState(true);

  // Load user from Supabase on mount and listen to changes
  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchUserProfile(session.user.id, session.user.email || '');
      }
      setLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setLoading(true);
        await fetchUserProfile(session.user.id, session.user.email || '');
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setView('home');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string, email: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.warn("No profile found in DB, might be a new signup in progress.");
        return;
      }

      // Fetch Quizzes
      const { data: quizData } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Fetch Bookmarks
      const { data: bookmarkData } = await supabase
        .from('bookmarks')
        .select('blog_id')
        .eq('user_id', userId);

      // Fixed: Mapped total_questions to totalQuestions to satisfy the interface
      const mappedProfile: UserProfile = {
        id: email, 
        name: profileData.name || 'User',
        age: profileData.age?.toString() || '',
        birthYear: profileData.birth_year?.toString() || '',
        profession: profileData.profession || '',
        address: profileData.address || '',
        quizHistory: (quizData || []).map(q => ({
          date: q.date,
          score: q.score,
          totalQuestions: q.total_questions,
          category: q.category
        })) as QuizResult[],
        bookmarks: (bookmarkData || []).map(b => b.blog_id)
      };

      setUser(mappedProfile);
    } catch (err) {
      console.error("System error fetching profile:", err);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleToggleBookmark = async (blogId: number) => {
    if (!user) return;
    const isBookmarked = user.bookmarks?.includes(blogId);
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;

    if (isBookmarked) {
      await supabase.from('bookmarks').delete().eq('user_id', authUser.id).eq('blog_id', blogId);
      setUser({ ...user, bookmarks: user.bookmarks?.filter(id => id !== blogId) });
    } else {
      await supabase.from('bookmarks').insert({ user_id: authUser.id, blog_id: blogId });
      setUser({ ...user, bookmarks: [...(user.bookmarks || []), blogId] });
    }
  };

  // Added handleQuizComplete to persist quiz results and update local state
  const handleQuizComplete = async (result: QuizResult) => {
    if (!user) return;
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;

    const { error } = await supabase
      .from('quiz_results')
      .insert({
        user_id: authUser.id,
        score: result.score,
        total_questions: result.totalQuestions,
        category: result.category,
        date: result.date
      });

    if (!error) {
      setUser({
        ...user,
        quizHistory: [result, ...user.quizHistory]
      });
    }
  };

  const handleUpdateProfile = async (updatedData: Partial<UserProfile>) => {
    if (!user) return;
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        name: updatedData.name,
        profession: updatedData.profession,
        address: updatedData.address,
        age: parseInt(updatedData.age || '0'),
        birth_year: parseInt(updatedData.birthYear || '0')
      })
      .eq('id', authUser.id);

    if (!error) {
      setUser({ ...user, ...updatedData });
      return true;
    }
    return false;
  };

  const QUIZ_CATEGORIES = [
    {
      id: 'islamic',
      name: 'ইসলামিক নলেজ কুইজ',
      icon: BookHeart,
      questions: ISLAMIC_QUESTIONS,
      color: 'emerald'
    }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-brand-600 gap-4">
        <div className="relative">
          <Loader2 className="animate-spin text-brand-500" size={60} />
          <div className="absolute inset-0 flex items-center justify-center">
             <Sparkles size={20} className="text-yellow-400" />
          </div>
        </div>
        <p className="font-bengali text-lg animate-pulse font-bold">Science Bindu লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {!user && <OnboardingModal onComplete={() => {}} />}

      <Header 
        user={user} 
        currentView={view} 
        onChangeView={setView} 
        onLogout={handleLogout}
      />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="transition-all duration-500">
          {view === 'home' && (
            <>
              {user && (
                <div className="mb-12 bg-slate-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-2xl animate-fade-in">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500 rounded-full filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-500 rounded-full filter blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2"></div>
                  
                  <div className="relative z-10 max-w-3xl">
                    <div className="inline-flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-full px-4 py-1 mb-6 backdrop-blur-sm">
                      <Sparkles size={16} className="text-yellow-400" />
                      <span className="text-xs md:text-sm font-bengali text-slate-300">আধুনিক বিজ্ঞান ও আল-কোরানের মেলবন্ধন</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 font-bengali leading-tight">
                      <span className="text-brand-400">বিজ্ঞান</span> জানুন, <br />
                      নিজের <span className="text-accent-500">ঈমান</span> মজবুত করুন
                    </h1>
                    <p className="text-slate-300 text-lg mb-8 max-w-2xl font-bengali leading-relaxed">
                      সায়েন্স বিন্দুতে আপনাকে স্বাগতম, <span className='text-white font-bold'>{user.name}</span>।
                    </p>
                    <button 
                      onClick={() => setView('hidayah')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-full font-bold transition-all transform hover:scale-105 flex items-center gap-2 shadow-lg shadow-emerald-500/25 font-bengali"
                    >
                      হিদায়াহ AI শুরু করুন
                    </button>
                  </div>
                </div>
              )}
              <BlogSection 
                posts={BLOG_POSTS} 
                bookmarks={user?.bookmarks || []} 
                onToggleBookmark={handleToggleBookmark} 
              />
            </>
          )}
          {view === 'quiz' && user && (
            <QuizSection 
              user={user} 
              onQuizComplete={handleQuizComplete}
              categories={QUIZ_CATEGORIES}
            />
          )}
          {view === 'hidayah' && user && <HidayahAI user={user} />}
          {view === 'profile' && user && (
            <ProfileSection 
              user={user} 
              onUpdateProfile={handleUpdateProfile} 
              onNavigate={(v) => setView(v)}
            />
          )}
          {view === 'about' && <AboutSection />}
          {view === 'contact' && <ContactSection user={user} />}
        </div>
      </main>

      <Footer user={user} />
    </div>
  );
};

export default App;
