
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { supabase } from '../supabase';
import { Send, Mail, User, MessageSquare, Loader2, CheckCircle, AlertCircle, Phone, MapPin } from 'lucide-react';

interface Props {
  user: UserProfile | null;
}

const ContactSection: React.FC<Props> = ({ user }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.id || '', // Using ID which holds email based on App.tsx mapping
    subject: '',
    message: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      return setError('দয়া করে সবগুলো ঘর পূরণ করুন।');
    }

    setLoading(true);
    setError('');

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      const { error: dbError } = await supabase
        .from('inquiries')
        .insert({
          user_id: authUser?.id || null,
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message
        });

      if (dbError) throw dbError;

      setSuccess(true);
      setFormData({ ...formData, subject: '', message: '' });
    } catch (err: any) {
      console.error("Submission Error:", err);
      setError('মেসেজ পাঠাতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-12">
      <div className="text-center mb-12">
        <span className="text-brand-600 font-bold tracking-wider uppercase text-sm">যোগাযোগ</span>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mt-2 font-bengali">আপনার মতামত আমাদের জানান</h2>
        <div className="w-24 h-1 bg-brand-500 mx-auto mt-4 rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Info Sidebar */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
            <div className="bg-brand-100 p-3 rounded-xl text-brand-600">
              <Phone size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 font-bengali">কল করুন</h3>
              <p className="text-sm text-slate-500">+৮৮০ ১৭০০-০০০০০০</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
            <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
              <Mail size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 font-bengali">ইমেইল</h3>
              <p className="text-sm text-slate-500">info@sciencebindu.com</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
            <div className="bg-amber-100 p-3 rounded-xl text-amber-600">
              <MapPin size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 font-bengali">ঠিকানা</h3>
              <p className="text-sm text-slate-500 font-bengali">উজিরপুর, বরিশাল, বাংলাদেশ</p>
            </div>
          </div>
        </div>

        {/* Inquiry Form */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
            {success ? (
              <div className="text-center py-12 animate-pop">
                <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-slate-800 font-bengali mb-2">ধন্যবাদ!</h3>
                <p className="text-slate-500 font-bengali mb-8">আপনার মেসেজটি আমাদের কাছে পৌঁছেছে। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।</p>
                <button 
                  onClick={() => setSuccess(false)}
                  className="bg-brand-600 text-white px-8 py-3 rounded-xl font-bold font-bengali hover:bg-brand-700 transition"
                >
                  আবার মেসেজ পাঠান
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-100 font-bengali text-sm">
                    <AlertCircle size={20} />
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 font-bengali ml-1">আপনার নাম</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none font-bengali transition"
                        placeholder="আপনার নাম লিখুন"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 font-bengali ml-1">ইমেইল ঠিকানা</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none font-sans transition"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500 font-bengali ml-1">বিষয়</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none font-bengali transition"
                      placeholder="মেসেজের বিষয়"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-500 font-bengali ml-1">বিস্তারিত বার্তা</label>
                  <textarea
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none font-bengali transition resize-none"
                    placeholder="আপনার মেসেজটি এখানে লিখুন..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold font-bengali flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={24} /> : <><Send size={20} /> মেসেজ পাঠান</>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSection;
