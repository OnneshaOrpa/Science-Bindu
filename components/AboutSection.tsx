
import React from 'react';
import { Star, School, Heart, Quote } from 'lucide-react';

const AboutSection: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto animate-fade-in pb-10">
      <div className="text-center mb-10">
        <span className="text-brand-600 font-bold tracking-wider uppercase text-sm">আমাদের সম্পর্কে</span>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mt-2 font-bengali">পরিচালক পরিচিতি</h2>
        <div className="w-24 h-1 bg-brand-500 mx-auto mt-4 rounded-full"></div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 mt-16">
        {/* Header Cover */}
        <div className="h-48 bg-gradient-to-r from-brand-500 to-brand-700 relative">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
        </div>

        <div className="px-8 pb-8 relative">
          {/* Profile Image */}
          <div className="w-48 h-48 bg-white rounded-full border-4 border-white shadow-2xl absolute -top-24 left-1/2 transform -translate-x-1/2 overflow-hidden group z-10">
            <img 
              src="https://postimg.cc/Xp60tz8B" 
              alt="Muntasir Al Anim" 
              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
            />
          </div>

          <div className="mt-28 text-center">
            <h1 className="text-3xl font-bold text-slate-800 font-bengali mb-2">মুনতাসির আল আনিম</h1>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 text-slate-600 mb-8 font-bengali">
              <span className="bg-slate-100 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
                <Star size={16} className="text-orange-500"/> <span className="font-semibold">৫ম শ্রেণি</span>
              </span>
              <span className="bg-slate-100 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
                <School size={16} className="text-blue-500"/> <span className="font-semibold">উজিরপুর সরকারি প্রাথমিক বিদ্যালয়</span>
              </span>
            </div>

            <div className="bg-brand-50 rounded-3xl p-8 text-left font-bengali leading-loose text-slate-700 border border-brand-100 relative shadow-inner">
               <Quote size={40} className="text-brand-200 absolute -top-4 -left-4 transform -scale-x-100" />
               <Heart size={24} className="text-red-400 absolute top-6 right-6 animate-pulse" />
               
               <div className="relative z-10 space-y-4">
                 <p>
                   আসসালামু আলাইকুম! আমি <span className="font-bold text-brand-700">মুনতাসির</span>। আমি বিজ্ঞানকে ভীষণ ভালোবাসি। আমার বাবা আমাকে সবসময় বিজ্ঞানের নতুন নতুন বিষয় জানতে উৎসাহিত করেন। তাঁর অনুপ্রেরণাতেই আমি বিজ্ঞানের প্রতি আগ্রহী হয়েছি।
                 </p>
                 <p>
                   আমি খেয়াল করেছি, আধুনিক বিজ্ঞান যা আজ আবিষ্কার করছে, তার অনেক কিছুই ১৪০০ বছর আগে পবিত্র আল-কোরআনে ইঙ্গিত দেওয়া হয়েছে। এই বিষয়টি আমাকে মুগ্ধ করে।
                 </p>
                 <p>
                   তাই আমার ইচ্ছা হলো এমন একটি ওয়েবসাইট বানানোর যেখানে আমার মতো ছাত্র-ছাত্রীরা খুব সহজে বিজ্ঞান শিখতে পারবে এবং জানতে পারবে কিভাবে ইসলাম ও বিজ্ঞান একে অপরের সাথে সম্পর্কিত। <span className="font-bold text-brand-600">'সায়েন্স বিন্দু'</span> আমার সেই স্বপ্নেরই ফসল।
                 </p>
               </div>
            </div>
            
            {/* Mission & Vision */}
            <div className="mt-10 grid grid-cols-2 gap-4 max-w-md mx-auto">
               <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-brand-600 font-bold font-bengali text-lg mb-1">উদ্দেশ্য</p>
                  <p className="text-xs text-slate-500 font-bengali">বিজ্ঞান ও বিশ্বাসের আলো ছড়ানো</p>
               </div>
               <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-brand-600 font-bold font-bengali text-lg mb-1">স্বপ্ন</p>
                  <p className="text-xs text-slate-500 font-bengali">একজন বড় বিজ্ঞানী হওয়া</p>
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
