
import React from 'react';
import { ViewState, UserProfile } from '../types';
import { Atom, User, LogOut, Info, Sparkles, BookOpen, MessageSquare } from 'lucide-react';

interface Props {
  user: UserProfile | null;
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  onLogout: () => void;
}

const Header: React.FC<Props> = ({ user, currentView, onChangeView, onLogout }) => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex flex-wrap justify-between items-center">
        {/* Logo Area */}
        <div 
          className="flex items-center gap-2 cursor-pointer group" 
          onClick={() => onChangeView('home')}
        >
          <div className="bg-brand-500 p-2 rounded-lg group-hover:rotate-12 transition-transform duration-300">
            <Atom className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-brand-900 font-bengali leading-none">Science Bindu</h1>
            <p className="text-xs text-brand-600 font-bengali">বিজ্ঞান ও বিশ্বাসের মেলবন্ধন</p>
          </div>
        </div>

        {/* Navigation */}
        {user && (
          <nav className="flex items-center gap-2 sm:gap-4 mt-3 sm:mt-0 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 custom-scrollbar">
            <button
              onClick={() => onChangeView('home')}
              className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium transition-colors font-bengali whitespace-nowrap ${
                currentView === 'home' 
                  ? 'bg-brand-100 text-brand-800' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Atom size={16} />
              হোম
            </button>

            <button
              onClick={() => onChangeView('hidayah')}
              className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm font-bold transition-all font-bengali whitespace-nowrap border ${
                currentView === 'hidayah' 
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-transparent shadow-md' 
                  : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
              }`}
            >
              <Sparkles size={16} className={currentView === 'hidayah' ? 'text-yellow-300' : 'text-emerald-500'} />
              HidayahAI
            </button>
            
            <button
              onClick={() => onChangeView('quiz')}
              className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium transition-colors font-bengali whitespace-nowrap ${
                currentView === 'quiz' 
                  ? 'bg-brand-100 text-brand-800' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BookOpen size={16} />
              ইসলামিক কর্নার
            </button>
            
            <button
              onClick={() => onChangeView('contact')}
              className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium transition-colors font-bengali whitespace-nowrap ${
                currentView === 'contact' 
                  ? 'bg-brand-100 text-brand-800' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <MessageSquare size={16} />
              যোগাযোগ
            </button>

            <button
              onClick={() => onChangeView('profile')}
              className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium transition-colors font-bengali whitespace-nowrap ${
                currentView === 'profile' 
                  ? 'bg-brand-100 text-brand-800' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <User size={16} />
              প্রোফাইল
            </button>
            
            <button
              onClick={() => onChangeView('about')}
              className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium transition-colors font-bengali whitespace-nowrap ${
                currentView === 'about' 
                  ? 'bg-brand-100 text-brand-800' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Info size={16} />
              সম্পর্কে
            </button>

             <button
              onClick={onLogout}
              className="flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium text-red-500 hover:bg-red-50 transition-colors font-bengali ml-2"
              title="লগ আউট"
            >
              <LogOut size={18} />
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
