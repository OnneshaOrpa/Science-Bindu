
import React, { useState } from 'react';
import { BlogPost } from '../types';
import { BookOpen, X, Clock, User, Share2, Heart, Bookmark } from 'lucide-react';

interface Props {
  posts: BlogPost[];
  bookmarks?: number[];
  onToggleBookmark?: (id: number) => void;
}

const BlogSection: React.FC<Props> = ({ posts, bookmarks = [], onToggleBookmark }) => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  return (
    <div className="animate-fade-in relative">
      <div className="text-center mb-10">
        <span className="text-brand-600 font-bold tracking-wider uppercase text-sm">জ্ঞান ভান্ডার</span>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mt-2 font-bengali">বিজ্ঞান ও আল-কোরআন ব্লগ</h2>
        <div className="w-24 h-1 bg-brand-500 mx-auto mt-4 rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => {
          const isBookmarked = bookmarks.includes(post.id);
          return (
            <article 
              key={post.id} 
              className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col border border-slate-100 group"
            >
              <div className="relative h-56 overflow-hidden cursor-pointer" onClick={() => setSelectedPost(post)}>
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 bg-brand-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                  {post.category}
                </div>
                {onToggleBookmark && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onToggleBookmark(post.id); }}
                    className={`absolute top-4 right-4 p-2 rounded-full transition-all ${isBookmarked ? 'bg-red-500 text-white' : 'bg-white/90 text-slate-400 hover:text-red-500'}`}
                  >
                    <Heart size={18} fill={isBookmarked ? "currentColor" : "none"} />
                  </button>
                )}
              </div>
              
              <div className="p-8 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-slate-900 mb-4 font-bengali group-hover:text-brand-600 transition-colors leading-tight">
                  {post.title}
                </h3>
                <p className="text-slate-500 mb-6 text-sm leading-relaxed font-bengali line-clamp-3">
                  {post.excerpt}
                </p>
                
                <button 
                  onClick={() => setSelectedPost(post)}
                  className="mt-auto w-full bg-slate-50 hover:bg-brand-600 hover:text-white text-brand-600 font-bold py-3 rounded-2xl border border-slate-100 transition-all flex items-center justify-center gap-2"
                >
                  <span className="font-bengali">বিস্তারিত পড়ুন</span>
                  <BookOpen size={18} />
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Full Screen Reader View */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6 bg-slate-900/95 backdrop-blur-md animate-fade-in overflow-hidden">
          <div className="bg-white rounded-none md:rounded-3xl w-full max-w-4xl h-full md:h-[95vh] flex flex-col shadow-2xl animate-slide-up">
            
            {/* Navbar */}
            <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white z-20">
               <div className="flex items-center gap-3">
                 <button onClick={() => setSelectedPost(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><X size={24}/></button>
                 <span className="hidden sm:inline font-bold text-slate-400 font-bengali text-sm">{selectedPost.category}</span>
               </div>
               <div className="flex gap-2">
                 <button className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><Share2 size={20}/></button>
               </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-grow overflow-y-auto custom-scrollbar">
              <div className="relative h-[40vh] md:h-96">
                <img src={selectedPost.image} className="w-full h-full object-cover" alt={selectedPost.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
              </div>

              <div className="px-6 md:px-16 py-10">
                <div className="flex items-center gap-4 text-slate-400 text-xs mb-6 font-bengali uppercase tracking-widest font-bold">
                   <div className="flex items-center gap-1"><User size={14}/> {selectedPost.author || 'Science Bindu'}</div>
                   <div className="flex items-center gap-1"><Clock size={14}/> ৫ মিনিট পাঠ</div>
                </div>

                <h1 className="text-3xl md:text-5xl font-black text-slate-900 font-bengali mb-10 leading-tight">
                  {selectedPost.title}
                </h1>

                <div 
                  className="prose prose-lg max-w-none text-slate-700 font-bengali leading-loose prose-p:mb-6 prose-headings:text-brand-700 prose-headings:font-bold prose-img:rounded-3xl"
                  dangerouslySetInnerHTML={{ __html: selectedPost.content }}
                />
              </div>
            </div>
            
            <div className="p-4 border-t bg-slate-50 flex justify-center sticky bottom-0">
               <button onClick={() => setSelectedPost(null)} className="bg-slate-900 text-white px-8 py-3 rounded-full font-bold font-bengali hover:bg-black shadow-lg">পড়া শেষ করুন</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogSection;
