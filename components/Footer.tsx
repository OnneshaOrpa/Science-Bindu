

import React, { useState, useEffect } from 'react';
import { QURAN_QUOTES, DHIKR_LIST } from '../constants';
import { UserProfile } from '../types';
import { Sun, Moon, Clock } from 'lucide-react';

interface Props {
  user: UserProfile | null;
}

const Footer: React.FC<Props> = ({ user }) => {
  const [tickerContent, setTickerContent] = useState<string>('');
  const [isPrayerTime, setIsPrayerTime] = useState<boolean>(false);
  const [icon, setIcon] = useState<React.ElementType>(Sun);

  useEffect(() => {
    const checkTimeAndSetContent = () => {
      // Get Bangladesh Time
      const now = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Dhaka"}));
      const hour = now.getHours();
      const minute = now.getMinutes();
      const totalMinutes = hour * 60 + minute;

      // Define Prayer Ranges (Approximate for generic advice)
      // Fajr: 4:00 - 6:00 (240 - 360)
      // Dhuhr: 13:00 - 16:00 (780 - 960)
      // Asr: 16:15 - 18:00 (975 - 1080)
      // Maghrib: 18:00 - 19:15 (1080 - 1155)
      // Isha: 19:30 - 23:00 (1170 - 1380)

      let prayerName = '';
      
      if (totalMinutes >= 780 && totalMinutes < 960) prayerName = 'যোহর';
      else if (totalMinutes >= 975 && totalMinutes < 1080) prayerName = 'আসর';
      else if (totalMinutes >= 1080 && totalMinutes < 1155) prayerName = 'মাগরিব';
      else if (totalMinutes >= 1170 && totalMinutes < 1380) prayerName = 'এশা';
      else if (totalMinutes >= 240 && totalMinutes < 360) prayerName = 'ফজর';

      if (prayerName && user) {
         setTickerContent(`${user.name}, এখন ${prayerName}ের ওয়াক্ত। নামাজ না পড়ে থাকলে পড়ে নাও।`);
         setIsPrayerTime(true);
         setIcon(Clock);
      } else {
         // Rotate Dhikr if no active prayer window
         const randomIndex = Math.floor(Math.random() * DHIKR_LIST.length);
         setTickerContent(DHIKR_LIST[randomIndex]);
         setIsPrayerTime(false);
         setIcon(Moon);
      }
    };

    checkTimeAndSetContent(); // Initial check
    const interval = setInterval(checkTimeAndSetContent, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [user]);

  return (
    <footer className="bg-slate-900 text-white mt-12">
      {/* Top wave effect (CSS visual only, simplified border) */}
      <div className="border-t border-slate-800"></div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          
          {/* Owner Info */}
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold text-brand-400 font-bengali mb-2">Science Bindu</h3>
            <div className="text-slate-400 text-sm font-bengali space-y-1">
              <p>স্বত্তাধিকারী: <span className="text-white font-semibold">মুনতাসির আল আলিম</span></p>
              <p>৫ম শ্রেণি</p>
              <p>উজিরপুর সরকারি প্রাথমিক বিদ্যালয়</p>
            </div>
          </div>

          {/* Dynamic Prayer/Dhikr Ticker */}
          <div className={`rounded-xl p-4 border relative overflow-hidden min-h-[100px] flex items-center justify-center shadow-lg transition-colors duration-500 ${isPrayerTime ? 'bg-brand-900/50 border-brand-700' : 'bg-slate-800/50 border-slate-700'}`}>
            <div className="absolute top-2 left-2 opacity-20">
               {React.createElement(icon, { size: 40 })}
            </div>
            <p className={`text-center font-bengali text-lg leading-relaxed transition-opacity duration-500 ease-in-out animate-fade-in ${isPrayerTime ? 'text-white font-bold' : 'text-brand-100 italic'}`}>
              {tickerContent}
            </p>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-slate-800 text-center text-slate-600 text-xs font-bengali">
          &copy; {new Date().getFullYear()} Science Bindu. All rights reserved. Made with ❤️ for Science & Islam.
        </div>
      </div>
    </footer>
  );
};

export default Footer;