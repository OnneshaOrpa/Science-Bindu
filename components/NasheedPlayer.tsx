

import React, { useState, useEffect, useRef } from 'react';
import { ISLAMIC_VIDEO_CATEGORIES, STATIC_ISLAMIC_VIDEOS } from '../constants';
import { VideoItem } from '../types'; // Fixed: Imported VideoItem from types.ts
import { Play, ArrowLeft, Search, Loader, Home, Youtube, X, ChevronRight, RefreshCw, WifiOff, Sparkles } from 'lucide-react';

interface Props {
  onBack: () => void;
}

// Robust list of Piped instances to cycle through
const PIPED_INSTANCES = [
  "https://pipedapi.kavin.rocks",
  "https://api.piped.io",
  "https://pipedapi.drg.li",
  "https://pipedapi.adminforge.de",
  "https://piped-api.garudalinux.org"
];

const NasheedPlayer: React.FC<Props> = ({ onBack }) => {
  const [view, setView] = useState<'home' | 'search' | 'watch'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<VideoItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<VideoItem | null>(null);
  
  // Home Feed State
  const [homeVideos, setHomeVideos] = useState<Record<string, VideoItem[]>>({});
  const [loadingCategory, setLoadingCategory] = useState<string | null>(null);

  // --- API Helper ---
  const fetchFromPiped = async (endpoint: string) => {
    for (const instance of PIPED_INSTANCES) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);
        const res = await fetch(`${instance}${endpoint}`, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          return data;
        }
      } catch (e) {
        continue;
      }
    }
    throw new Error("All Piped instances failed");
  };

  // --- Initial Load: Fetch Home Categories ---
  useEffect(() => {
    const fetchHomeFeed = async () => {
      // Fetch each category defined in config
      for (const cat of ISLAMIC_VIDEO_CATEGORIES) {
        if (!homeVideos[cat.id]) { // Avoid refetching if already exists
          setLoadingCategory(cat.id);
          try {
            const data = await fetchFromPiped(`/search?q=${encodeURIComponent(cat.searchQuery)}&filter=videos`);
            const items = data.items.slice(0, 10).map((item: any) => ({
                id: item.url.split('v=')[1],
                title: item.title,
                thumbnail: item.thumbnail,
                channel: item.uploaderName,
                duration: formatDuration(item.duration)
            }));
            setHomeVideos(prev => ({ ...prev, [cat.id]: items }));
          } catch (e) {
            console.error(`Failed to fetch ${cat.name}`, e);
          }
        }
      }
      setLoadingCategory(null);
    };

    fetchHomeFeed();
  }, []);

  // --- Search Logic ---
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setView('search');
    setSearchResults([]);

    try {
        const data = await fetchFromPiped(`/search?q=${encodeURIComponent(searchQuery)}&filter=videos`);
        const results = data.items.map((item: any) => ({
            id: item.url.split('v=')[1],
            title: item.title,
            thumbnail: item.thumbnail,
            channel: item.uploaderName,
            duration: formatDuration(item.duration)
        }));
        setSearchResults(results);
    } catch (err) {
        // alert("সার্চ করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।");
    } finally {
        setIsSearching(false);
    }
  };

  const formatDuration = (seconds: number) => {
      if (!seconds || seconds < 0) return "Live";
      const min = Math.floor(seconds / 60);
      const sec = seconds % 60;
      return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const playVideo = (video: VideoItem) => {
      setCurrentVideo(video);
      setView('watch');
  };

  // --- UI Components ---

  const VideoCardHorizontal: React.FC<{ video: VideoItem }> = ({ video }) => (
      <div onClick={() => playVideo(video)} className="shrink-0 w-60 cursor-pointer group snap-start">
          <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden relative mb-2 shadow-lg border border-transparent group-hover:border-red-600/50 transition-all">
              <img src={video.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt={video.title} loading="lazy" />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition"></div>
              <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-mono shadow-sm">{video.duration}</span>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                  <div className="bg-red-600/90 p-2 rounded-full shadow-xl transform scale-90 group-hover:scale-100 transition"><Play fill="white" size={20} className="ml-0.5"/></div>
              </div>
          </div>
          <h3 className="font-bengali font-bold text-sm text-gray-200 line-clamp-2 leading-snug group-hover:text-white transition-colors">{video.title}</h3>
          <p className="text-gray-500 text-xs mt-1 truncate">{video.channel}</p>
      </div>
  );

  const VideoCardList: React.FC<{ video: VideoItem }> = ({ video }) => (
      <div onClick={() => playVideo(video)} className="flex gap-3 cursor-pointer group bg-[#1a1a1a] p-2 rounded-lg hover:bg-[#252525] transition">
          <div className="w-32 h-20 bg-gray-800 rounded-md overflow-hidden shrink-0 relative">
              <img src={video.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition" alt={video.title}/>
              <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 rounded">{video.duration}</span>
          </div>
          <div className="flex-grow min-w-0 py-1">
              <h3 className="font-bengali font-bold text-sm text-gray-200 line-clamp-2 leading-snug group-hover:text-red-400">{video.title}</h3>
              <p className="text-gray-500 text-xs mt-1">{video.channel}</p>
          </div>
      </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col font-sans bg-[#0f0f0f] text-white animate-fade-in overflow-hidden">
      
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 bg-[#0f0f0f]/95 backdrop-blur-sm border-b border-[#272727] shrink-0 sticky top-0 z-50">
          <div className="flex items-center gap-4">
              <button onClick={() => { if(view === 'watch') setView('home'); else onBack(); }} className="p-2 rounded-full hover:bg-white/10 transition">
                  <ArrowLeft size={22} className="text-gray-300" />
              </button>
              <div className="flex items-center gap-1.5 font-bold text-xl font-bengali tracking-tight cursor-pointer" onClick={() => setView('home')}>
                  <div className="bg-red-600 text-white p-1 rounded-lg"><Youtube size={20} fill="white"/></div>
                  <span>Waz<span className="text-red-500">TV</span></span>
              </div>
          </div>
          
          <div className="flex items-center gap-2">
             <button onClick={() => setView('home')} className={`p-2 rounded-full transition ${view === 'home' ? 'text-red-500 bg-red-500/10' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}><Home size={22}/></button>
             <button onClick={() => setView('search')} className={`p-2 rounded-full transition ${view === 'search' ? 'text-red-500 bg-red-500/10' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}><Search size={22}/></button>
          </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow overflow-y-auto custom-scrollbar bg-[#0f0f0f]">
          
          {/* SEARCH VIEW */}
          {view === 'search' && (
              <div className="p-4 max-w-3xl mx-auto min-h-full">
                  <form onSubmit={handleSearch} className="relative mb-6 sticky top-0 z-40 pt-2 pb-2 bg-[#0f0f0f]">
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="ওয়াজ, গজল বা নাশিদ খুঁজুন..." 
                        className="w-full bg-[#202020] border border-[#333] rounded-full py-3.5 pl-12 pr-12 text-white focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none font-bengali shadow-lg transition-all"
                        autoFocus
                      />
                      <Search className="absolute left-4 top-5.5 text-gray-400" size={20}/>
                      {isSearching ? 
                        <Loader className="absolute right-4 top-5.5 text-red-500 animate-spin" size={20}/> :
                        searchQuery && <button type="button" onClick={() => setSearchQuery('')} className="absolute right-4 top-5.5 text-gray-400 hover:text-white"><X size={20}/></button>
                      }
                  </form>

                  {!isSearching && searchResults.length === 0 && !searchQuery && (
                      <div className="text-center text-gray-500 mt-20">
                          <Search size={48} className="mx-auto mb-4 opacity-20"/>
                          <p className="font-bengali">আপনার পছন্দের ভিডিও সার্চ করুন</p>
                      </div>
                  )}

                  <div className="space-y-3 pb-20">
                      {searchResults.map((video, idx) => (
                          <VideoCardList key={idx} video={video} />
                      ))}
                  </div>
              </div>
          )}

          {/* HOME VIEW */}
          {view === 'home' && (
              <div className="pb-20">
                  {/* Hero Banner (Dynamic based on first loaded category or static) */}
                  <div className="relative h-64 md:h-80 w-full overflow-hidden mb-6 group cursor-pointer">
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-black/60 z-10"></div>
                      <img src="https://images.unsplash.com/photo-1564121211835-e88c852648ab?w=1000&q=80" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition duration-700" alt="Hero"/>
                      <div className="absolute bottom-0 left-0 p-6 z-20 w-full max-w-4xl">
                          <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider mb-2 inline-block">Featured</span>
                          <h1 className="text-3xl md:text-5xl font-bold font-bengali mb-2 text-white leading-tight">ইসলামিক জ্ঞান ও বিনোদন</h1>
                          <p className="text-gray-300 font-bengali text-sm md:text-base max-w-xl line-clamp-2">বিক্ষিপ্ত ইন্টারনেট থেকে দূরে, হালাল বিনোদনের জন্য একটি নিরাপদ প্ল্যাটফর্ম।</p>
                      </div>
                  </div>

                  {/* STATIC FEATURED SECTION */}
                  <div className="px-4 md:px-8 mb-8">
                      <div className="flex items-center gap-2 mb-4">
                          <Sparkles className="text-yellow-400" size={20}/>
                          <h2 className="text-xl font-bold font-bengali text-gray-100">নির্বাচিত ভিডিও (Editor's Choice)</h2>
                      </div>
                      <div className="flex overflow-x-auto gap-4 pb-4 custom-scrollbar snap-x">
                          {STATIC_ISLAMIC_VIDEOS.map((video, idx) => (
                              <VideoCardHorizontal key={idx} video={video} />
                          ))}
                      </div>
                  </div>

                  {/* DYNAMIC CATEGORIES */}
                  <div className="px-4 md:px-8 space-y-10">
                      {ISLAMIC_VIDEO_CATEGORIES.map((cat) => (
                          <div key={cat.id} className="relative">
                              <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                      <img src={cat.image} className="w-10 h-10 rounded-full object-cover border border-gray-700" alt={cat.name}/>
                                      <h2 className="text-xl font-bold font-bengali text-gray-100">{cat.name}</h2>
                                  </div>
                                  <button onClick={() => { setSearchQuery(cat.searchQuery); handleSearch(); }} className="text-xs font-bold text-gray-500 hover:text-white flex items-center gap-1 transition">
                                      সব দেখুন <ChevronRight size={14}/>
                                  </button>
                              </div>
                              
                              <div className="flex overflow-x-auto gap-4 pb-4 custom-scrollbar snap-x scroll-pl-4">
                                  {loadingCategory === cat.id ? (
                                      [...Array(4)].map((_, i) => (
                                          <div key={i} className="shrink-0 w-60 h-40 bg-gray-800/50 rounded-lg animate-pulse"></div>
                                      ))
                                  ) : homeVideos[cat.id]?.length > 0 ? (
                                      homeVideos[cat.id].map((video, idx) => (
                                          <VideoCardHorizontal key={idx} video={video} />
                                      ))
                                  ) : (
                                      <div className="w-full py-8 text-center text-gray-600 text-sm border border-dashed border-gray-800 rounded-lg flex flex-col items-center justify-center gap-2">
                                          <WifiOff size={24}/>
                                          <span>লোড করা যায়নি</span>
                                          <button onClick={() => window.location.reload()} className="text-red-500 text-xs hover:underline">রিফ্রেশ</button>
                                      </div>
                                  )}
                              </div>
                          </div>
                      ))}
                  </div>
                  
                  <div className="mt-12 text-center text-gray-600 text-xs py-8 border-t border-[#222]">
                      <p>Waz TV • Powered by YouTube Data</p>
                  </div>
              </div>
          )}

          {/* WATCH VIEW (PLAYER) */}
          {view === 'watch' && currentVideo && (
              <div className="flex flex-col h-full bg-black animate-fade-in">
                  <div className="w-full aspect-video bg-black sticky top-0 z-50 shadow-2xl">
                      <iframe 
                          src={`https://www.youtube.com/embed/${currentVideo.id}?autoplay=1&origin=${window.location.origin}&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1`} 
                          title="YouTube video player" 
                          frameBorder="0" 
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                          allowFullScreen
                          className="w-full h-full"
                      ></iframe>
                  </div>
                  
                  <div className="flex-grow overflow-y-auto p-4 md:p-6 max-w-5xl mx-auto w-full">
                      <h1 className="text-lg md:text-xl font-bold font-bengali leading-snug mb-3 text-white">{currentVideo.title}</h1>
                      
                      <div className="flex items-center justify-between border-b border-[#272727] pb-4 mb-6">
                          <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center font-bold text-gray-400 border border-gray-700">{currentVideo.channel[0]}</div>
                              <div>
                                  <p className="font-bold text-sm text-gray-200">{currentVideo.channel}</p>
                                  <p className="text-xs text-gray-500">YouTube Channel</p>
                              </div>
                          </div>
                          <div className="flex gap-2">
                              <button className="bg-white text-black px-4 py-2 rounded-full font-bold text-sm hover:bg-gray-200 transition">Share</button>
                          </div>
                      </div>
                      
                      <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#333]">
                          <p className="text-sm text-gray-300 font-bengali leading-relaxed">
                              <span className="font-bold text-white block mb-1">ভিডিও বিবরণ:</span> 
                              এই ভিডিওটি পাবলিক YouTube API এর মাধ্যমে স্ট্রিম করা হচ্ছে। মহান আল্লাহর বানী এবং রাসূল (সা.) এর সুন্নাহ প্রচারের উদ্দেশ্যে এটি শেয়ার করা হলো।
                          </p>
                      </div>

                      {/* Related Videos (Mock for now, could be dynamic) */}
                      <div className="mt-8">
                          <h3 className="text-gray-400 font-bold mb-4 font-bengali">আরও দেখুন</h3>
                          <div className="space-y-3">
                              {/* Show some videos from search results or other categories as suggestions */}
                              {(searchResults.length > 0 ? searchResults : Object.values(homeVideos).flat()).slice(0, 5).map((v, i) => (
                                  v.id !== currentVideo.id && <VideoCardList key={i} video={v} />
                              ))}
                          </div>
                      </div>
                  </div>
              </div>
          )}

      </div>
    </div>
  );
};

export default NasheedPlayer;