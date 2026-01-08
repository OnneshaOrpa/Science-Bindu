
import React, { useState, useEffect } from 'react';
import { UserProfile, QuizResult, Question } from '../types';
import { ACADEMIC_DATA, ADMISSION_JOB_DATA } from '../constants';
import { BookOpen, GraduationCap, ArrowLeft, ArrowRight, CheckCircle, XCircle, LayoutGrid, FileText, ChevronRight, Brain, Lightbulb, Loader, Share2, Download, Printer, PlayCircle, Eye, EyeOff, CheckSquare, List, HelpCircle, Layers, Star, Book, Activity, Map, Target, DollarSign, AlertTriangle, Briefcase, Award } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface Props {
  user: UserProfile;
  onQuizComplete: (result: QuizResult) => void;
}

// --- NEW DATA STRUCTURE FOR SUGGESTIONS ---
interface SuggestionData {
  summary: string; // Brief chapter summary
  cqs: {
    id: number;
    stem: string; // Uddipok
    img?: string; // Optional diagram description
    questions: {
      a: string; // Gyan
      b: string; // Anudhabon
      c: string; // Proyog (Written)
      d: string; // Ucchotor (Written)
    };
    solutions: {
      c: string; // Solution hint for C
      d: string; // Solution hint for D
    };
    boardRef: string; // e.g., "BCS 45 Preliminary"
    importance: number; // 99%, 100% etc represented as 1-100
  }[];
  mcqs: {
    id: number;
    question: string;
    options: string[];
    correct: number;
    explanation: string;
  }[];
  knowledge: {
    q: string;
    a: string;
    type: 'Gyan' | 'Anudhabon';
  }[];
}

// --- STATIC DEMO DATA (Liberation War) ---
const STATIC_SUGGESTION_DATA: SuggestionData = {
  summary: "মুক্তিযুদ্ধ বাংলাদেশের ইতিহাসের সবচেয়ে গৌরবোজ্জ্বল অধ্যায়। এই অধ্যায়ে ১১টি সেক্টর, খেতাবপ্রাপ্ত মুক্তিযোদ্ধা, বুদ্ধিজীবী হত্যাকাণ্ড এবং স্বাধীনতার ঘোষণা নিয়ে প্রশ্ন বেশি আসে।",
  cqs: [
    {
      id: 1,
      stem: "১৯৭১ সালের ৭ই মার্চ রেসকোর্স ময়দানে বঙ্গবন্ধু শেখ মুজিবুর রহমান এক ঐতিহাসিক ভাষণ দেন। এই ভাষণে তিনি বাঙালি জাতিকে স্বাধীনতার জন্য প্রস্তুত হওয়ার আহ্বান জানান। পরবর্তীতে ২৫শে মার্চ রাতে পাকিস্তানি বাহিনী গণহত্যা শুরু করে।",
      questions: {
        a: "মুক্তিযুদ্ধের সর্বাধিনায়ক কে ছিলেন?",
        b: "অপারেশন সার্চলাইট বলতে কী বোঝায়?",
        c: "উদ্দীপকের ভাষণের গুরুত্ব মুক্তিযুদ্ধের প্রেক্ষাপটে ব্যাখ্যা কর।",
        d: "স্বাধীনতা অর্জনে বঙ্গবন্ধুর ৭ই মার্চের ভাষণের ভূমিকা বিশ্লেষণ কর।"
      },
      solutions: {
        c: "৭ই মার্চের ভাষণ ছিল বাঙালির মুক্তির সনদ। এর মাধ্যমে জনগণ যুদ্ধের জন্য মানসিক প্রস্তুতি নেয়।",
        d: "এই ভাষণেই পরোক্ষভাবে স্বাধীনতার ঘোষণা দেওয়া হয়। ইউনেস্কো একে বিশ্ব প্রামাণ্য ঐতিহ্য হিসেবে স্বীকৃতি দিয়েছে।"
      },
      boardRef: "BCS 40 Written",
      importance: 100
    },
    {
      id: 2,
      stem: "মুক্তিযুদ্ধের সময় বাংলাদেশকে ১১টি সেক্টরে ভাগ করা হয়। এর মধ্যে ১০ নং সেক্টর ছিল ব্যতিক্রমধর্মী।",
      questions: {
        a: "মুজিবনগর সরকার কবে গঠিত হয়?",
        b: "বধ্যভূমি বলতে কী বোঝ?",
        c: "১০ নং সেক্টরের বিশেষত্ব ব্যাখ্যা কর।",
        d: "মুক্তিযুদ্ধে সেক্টর কমান্ডারদের ভূমিকা মূল্যায়ন কর।"
      },
      solutions: {
        c: "১০ নং সেক্টর ছিল নৌ-কমান্ডো অধীন। এর কোনো নির্দিষ্ট সেক্টর কমান্ডার ছিল না।",
        d: "সেক্টর কমান্ডাররা যুদ্ধ পরিচালনায় এবং গেরিলা আক্রমণে নেতৃত্ব দিয়ে বিজয় ত্বরান্বিত করেন।"
      },
      boardRef: "BCS 41 Written",
      importance: 95
    }
  ],
  mcqs: [
    {
      id: 101,
      question: "মুক্তিযুদ্ধের সময় ঢাকা কত নম্বর সেক্টরের অধীনে ছিল?",
      options: ["১ নং", "২ নং", "৩ নং", "৪ নং"],
      correct: 1,
      explanation: "ঢাকা জেলা ছিল ২ নং সেক্টরের অধীনে। সেক্টর কমান্ডার ছিলেন খালেদ মোশাররফ ও এটিএম হায়দার।"
    },
    {
      id: 102,
      question: "বাংলাদেশের প্রথম অস্থায়ী সরকার কোথায় গঠিত হয়?",
      options: ["মেহেরপুরের বৈদ্যনাথতলায়", "কলকাতায়", "ঢাকায়", "আগরতলায়"],
      correct: 0,
      explanation: "মেহেরপুরের বৈদ্যনাথতলার ভবেরপাড়া গ্রামে (বর্তমান মুজিবনগর) প্রথম সরকার গঠিত হয়।"
    },
    {
      id: 103,
      question: "বীরশ্রেষ্ঠদের মধ্যে কে সেনাবাহিনীতে ছিলেন না?",
      options: ["সিপাহী মোস্তফা কামাল", "ক্যাপ্টেন মহিউদ্দিন জাহাঙ্গীর", "ইঞ্জিনিয়ার রুহুল আমিন", "ল্যান্স নায়েক নূর মোহাম্মদ"],
      correct: 2,
      explanation: "বীরশ্রেষ্ঠ রুহুল আমিন ছিলেন নৌবাহিনীর স্কোয়াড্রন ইঞ্জিন আর্টিফিসার।"
    }
  ],
  knowledge: [
    { q: "মুক্তিযুদ্ধে বীরপ্রতীক খেতাবপ্রাপ্ত একমাত্র বিদেশি কে?", a: "ডব্লিউ এ এস ওডারল্যান্ড (অস্ট্রেলিয়া)।", type: "Gyan" },
    { q: "কনসার্ট ফর বাংলাদেশ কোথায় অনুষ্ঠিত হয়?", a: "নিউইয়র্কের ম্যাডিসন স্কয়ার গার্ডেনে।", type: "Gyan" }
  ]
};

const AcademicSection: React.FC<Props> = ({ user, onQuizComplete }) => {
  const [step, setStep] = useState<'class' | 'subject' | 'chapter' | 'suggestion' | 'exam-running' | 'exam-result' | 'roadmap'>('class');
  
  // Selection State
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<{id: string, name: string, originalQuestions: Question[]} | null>(null);

  // Suggestion State
  const [activeTab, setActiveTab] = useState<'cq' | 'mcq' | 'exam'>('cq');
  const [suggestionData, setSuggestionData] = useState<SuggestionData | null>(null);
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);

  // Exam State
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [examScore, setExamScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // --- Helpers to get current objects ---
  const currentClass = ACADEMIC_DATA.concat(ADMISSION_JOB_DATA).find(c => c.id === selectedClassId);
  const currentSubject = currentClass?.subjects.find(s => s.id === selectedSubjectId);
  
  // --- AI GENERATION ---
  const generateSuggestion = async (chapterName: string, subjectName: string, className: string) => {
    setIsLoadingSuggestion(true);
    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("API Key not found");

      const ai = new GoogleGenAI({ apiKey });
      const model = "gemini-2.5-flash";

      const prompt = `
        Create a detailed academic suggestion for Bangladeshi BCS/Job Preparation Student.
        Subject: ${subjectName}
        Topic: ${chapterName}

        Output must be a valid JSON object with this exact structure:
        {
          "summary": "2-3 sentences summary of the topic in Bengali",
          "cqs": [
             {
               "id": 1,
               "stem": "A creative stem (Uddipok) relevant to BCS written exam in Bengali.",
               "questions": {
                 "a": "Knowledge question (Gyan) in Bengali",
                 "b": "Comprehension question (Anudhabon) in Bengali",
                 "c": "Analytical question in Bengali",
                 "d": "Higher Order Thinking question in Bengali"
               },
               "solutions": {
                 "c": "Brief hint for answer c in Bengali",
                 "d": "Brief hint for answer d in Bengali"
               },
               "boardRef": "BCS or Bank Job Year (e.g. 40th BCS) or 'Very Important'",
               "importance": 95
             }
          ],
          "mcqs": [
             {
               "id": 1,
               "question": "MCQ Question in Bengali",
               "options": ["Op1", "Op2", "Op3", "Op4"],
               "correct": 0,
               "explanation": "Why correct in Bengali"
             }
          ],
          "knowledge": [
             { "q": "Short question?", "a": "Short Answer", "type": "Gyan" }
          ]
        }
        
        Generate at least 2 Written Questions (CQs), 5 MCQs, and 3 Knowledge questions. 
        Ensure content is strictly relevant to BCS Preliminary and Written syllabus.
      `;

      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const text = response.text;
      if (text) {
        const data = JSON.parse(text);
        setSuggestionData(data);
      }
    } catch (error) {
      console.error("AI Generation Error", error);
      // Fallback: Just use static data structure empty or error message
    } finally {
      setIsLoadingSuggestion(false);
    }
  };

  // --- Navigation Handlers ---
  const handleClassSelect = (id: string) => {
    setSelectedClassId(id);
    setStep('subject');
  };

  const handleSubjectSelect = (id: string) => {
    setSelectedSubjectId(id);
    setStep('chapter');
  };

  const handleChapterSelect = (chapter: any) => {
    setSelectedChapter({
        id: chapter.id,
        name: chapter.name,
        originalQuestions: chapter.questions
    });
    setStep('suggestion');
    setActiveTab('mcq'); // Default to MCQ for BCS
    
    // Check if we have static data for Liberation War (Demo purpose)
    if (chapter.id === 'liberation-war') {
        setSuggestionData(STATIC_SUGGESTION_DATA);
    } else {
        // Trigger AI Generation
        setSuggestionData(null);
        if (currentSubject && currentClass) {
            generateSuggestion(chapter.name, currentSubject.name, currentClass.name);
        }
    }
  };

  // --- Exam Logic ---
  const startExam = () => {
    setCurrentQuestionIdx(0);
    setExamScore(0);
    setSelectedOption(null);
    setShowFeedback(false);
    setStep('exam-running');
  };

  const handleExamOptionClick = (idx: number) => {
    if (showFeedback) return;
    setSelectedOption(idx);
    setShowFeedback(true);
    if (!suggestionData) return;
    if (idx === suggestionData.mcqs[currentQuestionIdx].correct) {
        setExamScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (!suggestionData) return;
    if (currentQuestionIdx < suggestionData.mcqs.length - 1) {
        setCurrentQuestionIdx(prev => prev + 1);
        setSelectedOption(null);
        setShowFeedback(false);
    } else {
        setStep('exam-result');
        onQuizComplete({
            date: new Date().toLocaleDateString('bn-BD'),
            score: examScore,
            totalQuestions: suggestionData.mcqs.length,
            category: `BCS Prep: ${selectedChapter?.name}`
        });
    }
  };

  // --- RENDER HELPERS ---
  const renderMathText = (text: string) => {
      // Very basic rendering for now, could integrate KaTeX component here if needed
      // Just replacing basic LaTeX markers for display
      return text.split(/(\$.*?\$)/g).map((part, i) => {
          if (part.startsWith('$') && part.endsWith('$')) {
             return <span key={i} className="font-mono bg-slate-100 px-1 rounded text-brand-700">{part.slice(1, -1)}</span>
          }
          return part;
      });
  }

  // --- VIEW: ROADMAP ---
  if (step === 'roadmap') {
      return (
        <div className="max-w-5xl mx-auto animate-fade-in pb-20">
            <button onClick={() => setStep('subject')} className="flex items-center gap-2 text-slate-500 hover:text-brand-600 mb-6 font-bengali transition">
              <ArrowLeft size={20} /> ফিরে যান
            </button>
            
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 md:p-12 text-white text-center mb-10 relative overflow-hidden shadow-2xl">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500 rounded-full filter blur-3xl opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
                 <div className="relative z-10">
                     <span className="bg-white/10 text-brand-200 px-4 py-1 rounded-full text-sm font-bold tracking-wider uppercase mb-4 inline-block">Day 28 of 365</span>
                     <h1 className="text-3xl md:text-5xl font-bold font-bengali mb-4 leading-tight">BCS ক্যাডার হওয়ার <span className="text-brand-400">কমপ্লিট রোডম্যাপ</span></h1>
                     <p className="text-slate-300 font-bengali max-w-2xl mx-auto text-lg">স্বপ্ন যদি হয় ক্যাডার হওয়া, তবে এলোমেলো পড়াশোনা নয়। আগে জানুন গন্তব্য, তারপর শুরু করুন যাত্রা।</p>
                 </div>
            </div>

            <div className="grid grid-cols-1 gap-12">
                
                {/* Stage 1: Basic Structure */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-4">
                        <div className="bg-brand-100 p-3 rounded-xl text-brand-600"><Map size={32}/></div>
                        <h2 className="text-2xl font-bold text-slate-800 font-bengali">BCS পরীক্ষার ধাপসমূহ</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-slate-50 p-6 rounded-xl border-l-4 border-brand-500 relative overflow-hidden">
                            <span className="absolute top-2 right-2 text-6xl font-black text-slate-200 opacity-20 pointer-events-none">1</span>
                            <h3 className="font-bold text-xl mb-2 font-bengali text-slate-800">প্রিলিমিনারি (Preliminary)</h3>
                            <p className="text-brand-600 font-bold mb-4">২০০ নম্বর (MCQ)</p>
                            <ul className="text-sm text-slate-600 space-y-2 font-bengali">
                                <li className="flex justify-between"><span>বাংলা</span> <span className="font-bold">৩০</span></li>
                                <li className="flex justify-between"><span>ইংরেজি</span> <span className="font-bold">৩০</span></li>
                                <li className="flex justify-between"><span>বাংলাদেশ বিষয়াবলি</span> <span className="font-bold">২৫</span></li>
                                <li className="flex justify-between"><span>আন্তর্জাতিক বিষয়াবলি</span> <span className="font-bold">২৫</span></li>
                                <li className="flex justify-between"><span>গাণিতিক যুক্তি</span> <span className="font-bold">২০</span></li>
                                <li className="flex justify-between"><span>মানসিক দক্ষতা</span> <span className="font-bold">১৫</span></li>
                                <li className="flex justify-between"><span>বিজ্ঞান ও প্রযুক্তি</span> <span className="font-bold">১৫</span></li>
                                <li className="col-span-2 pt-2 text-xs text-red-500 font-bold">* ৯০% পরীক্ষার্থী এখানেই বাদ পড়ে।</li>
                            </ul>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-xl border-l-4 border-amber-500 relative overflow-hidden">
                             <span className="absolute top-2 right-2 text-6xl font-black text-slate-200 opacity-20 pointer-events-none">2</span>
                             <h3 className="font-bold text-xl mb-2 font-bengali text-slate-800">লিখিত (Written)</h3>
                             <p className="text-amber-600 font-bold mb-4">৯০০ নম্বর</p>
                             <p className="text-sm text-slate-600 font-bengali leading-relaxed mb-4">
                                 এটাই "REAL BCS"। এখানে নকল বা অনুমানের সুযোগ নেই। গভীর জ্ঞান ও লেখার দক্ষতা প্রয়োজন।
                             </p>
                             <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Compulsory Subjects:</div>
                             <div className="flex flex-wrap gap-2 mt-2">
                                 <span className="bg-white border px-2 py-1 rounded text-xs">বাংলা</span>
                                 <span className="bg-white border px-2 py-1 rounded text-xs">English</span>
                                 <span className="bg-white border px-2 py-1 rounded text-xs">Math/Science</span>
                                 <span className="bg-white border px-2 py-1 rounded text-xs">Mental Ability</span>
                             </div>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-xl border-l-4 border-emerald-500 relative overflow-hidden">
                             <span className="absolute top-2 right-2 text-6xl font-black text-slate-200 opacity-20 pointer-events-none">3</span>
                             <h3 className="font-bold text-xl mb-2 font-bengali text-slate-800">ভাইভা (Viva Voce)</h3>
                             <p className="text-emerald-600 font-bold mb-4">১০০ নম্বর</p>
                             <ul className="text-sm text-slate-600 space-y-2 font-bengali">
                                 <li className="flex items-center gap-2"><CheckCircle size={14} className="text-emerald-500"/> ব্যক্তিত্ব (Personality)</li>
                                 <li className="flex items-center gap-2"><CheckCircle size={14} className="text-emerald-500"/> যোগাযোগ দক্ষতা</li>
                                 <li className="flex items-center gap-2"><CheckCircle size={14} className="text-emerald-500"/> মানসিক চাপ সহনশীলতা</li>
                                 <li className="flex items-center gap-2"><CheckCircle size={14} className="text-emerald-500"/> স্মার্টনেস ও সততা</li>
                             </ul>
                        </div>
                    </div>
                </div>

                {/* Stage 2: Cadre Profiles */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-4">
                        <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600"><Briefcase size={32}/></div>
                        <h2 className="text-2xl font-bold text-slate-800 font-bengali">কোন ক্যাডারের কাজ কী?</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        <div className="p-5 border border-slate-100 rounded-xl hover:shadow-md transition bg-slate-50">
                            <h3 className="font-bold text-lg text-indigo-700 mb-2 font-bengali">প্রশাসন (Admin)</h3>
                            <p className="text-sm text-slate-600 font-bengali">জেলা প্রশাসন, ফিল্ড পোস্টিং। পাওয়ার ও দায়িত্ব অনেক বেশি। ট্রান্সফার বেশি হয়।</p>
                        </div>
                        <div className="p-5 border border-slate-100 rounded-xl hover:shadow-md transition bg-slate-50">
                            <h3 className="font-bold text-lg text-rose-700 mb-2 font-bengali">পুলিশ (Police)</h3>
                            <p className="text-sm text-slate-600 font-bengali">অপারেশনাল ফিল্ড, আইন-শৃঙ্খলা রক্ষা। হাই প্রেসার ও হাই প্রেস্টিজ জব।</p>
                        </div>
                        <div className="p-5 border border-slate-100 rounded-xl hover:shadow-md transition bg-slate-50">
                            <h3 className="font-bold text-lg text-cyan-700 mb-2 font-bengali">পররাষ্ট্র (Foreign)</h3>
                            <p className="text-sm text-slate-600 font-bengali">কূটনৈতিক কাজ, বিদেশ পোস্টিং। কম্পিটিশন সবচেয়ে বেশি।</p>
                        </div>
                        <div className="p-5 border border-slate-100 rounded-xl hover:shadow-md transition bg-slate-50">
                            <h3 className="font-bold text-lg text-emerald-700 mb-2 font-bengali">শিক্ষা (Education)</h3>
                            <p className="text-sm text-slate-600 font-bengali">সরকারি কলেজে শিক্ষকতা। স্টেবল লাইফ, পলিটিক্যাল প্রেসার কম।</p>
                        </div>
                        <div className="p-5 border border-slate-100 rounded-xl hover:shadow-md transition bg-slate-50">
                            <h3 className="font-bold text-lg text-orange-700 mb-2 font-bengali">কর ও শুল্ক (Tax/Customs)</h3>
                            <p className="text-sm text-slate-600 font-bengali">দেশের রাজস্ব ও অর্থনীতি নিয়ে কাজ। টেকনিক্যাল ও স্মার্ট ওয়ার্কলোড।</p>
                        </div>
                        <div className="p-5 border border-slate-100 rounded-xl hover:shadow-md transition bg-slate-50">
                            <h3 className="font-bold text-lg text-red-600 mb-2 font-bengali">স্বাস্থ্য (Health)</h3>
                            <p className="text-sm text-slate-600 font-bengali">শুধুমাত্র ডাক্তারদের জন্য। সরকারি হাসপাতাল ও স্বাস্থ্যসেবা পরিচালনা।</p>
                        </div>
                    </div>
                </div>

                {/* Stage 3: Salary & Reality */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="bg-green-100 p-3 rounded-xl text-green-600"><DollarSign size={24}/></div>
                            <h2 className="text-xl font-bold text-slate-800 font-bengali">বেতন ও সুযোগ-সুবিধা</h2>
                        </div>
                        <ul className="space-y-4 font-bengali">
                            <li className="flex justify-between border-b border-slate-50 pb-2">
                                <span className="text-slate-600">Grade-9 (Starting)</span>
                                <span className="font-bold text-slate-800">২২,০০০ - ৫৩,০০০</span>
                            </li>
                            <li className="flex justify-between border-b border-slate-50 pb-2">
                                <span className="text-slate-600">Grade-8</span>
                                <span className="font-bold text-slate-800">৩৮,০০০ - ৭০,০০০</span>
                            </li>
                            <li className="bg-green-50 p-3 rounded-lg text-sm text-green-800">
                                <strong>বাড়তি সুবিধা:</strong> পুলিশ ও এডমিন ক্যাডারে পোস্টিং অনুযায়ী গাড়ি, বাড়ি ও অন্যান্য ভাতা পাওয়া যায়। ফরেন ক্যাডারে বিশেষ ভাতা থাকে।
                            </li>
                        </ul>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="bg-red-100 p-3 rounded-xl text-red-600"><AlertTriangle size={24}/></div>
                            <h2 className="text-xl font-bold text-slate-800 font-bengali">চাকরি যাওয়ার কারণ (Red Flags)</h2>
                        </div>
                        <ul className="space-y-2 text-sm text-slate-600 font-bengali">
                            <li className="flex gap-2"><XCircle size={16} className="text-red-500 mt-0.5"/> দুর্নীতি বা গুরুতর অসদাচরণ</li>
                            <li className="flex gap-2"><XCircle size={16} className="text-red-500 mt-0.5"/> রাষ্ট্রবিরোধী কার্যকলাপে লিপ্ত হওয়া</li>
                            <li className="flex gap-2"><XCircle size={16} className="text-red-500 mt-0.5"/> ইন্টেলিজেন্স রিপোর্টে নেগেটিভ আসা</li>
                            <li className="flex gap-2"><XCircle size={16} className="text-red-500 mt-0.5"/> দীর্ঘ সময় কর্মস্থলে অনুপস্থিত থাকা</li>
                        </ul>
                    </div>
                </div>

                {/* Final CTA */}
                <div className="bg-brand-600 text-white rounded-2xl p-8 text-center shadow-lg">
                    <h2 className="text-2xl font-bold font-bengali mb-4">আপনার লক্ষ্য স্থির করুন!</h2>
                    <p className="text-brand-100 font-bengali mb-8 max-w-xl mx-auto">
                        ১. আপনি কি পাওয়ার চান নাকি গবেষণা? <br/>
                        ২. আপনি কি ফিল্ড ওয়ার্ক পছন্দ করেন নাকি অফিস?<br/>
                        ৩. আপনি কি বদলি জীবন মেনে নিতে পারবেন?
                    </p>
                    <button 
                        onClick={() => setStep('subject')}
                        className="bg-white text-brand-700 px-8 py-3 rounded-full font-bold font-bengali hover:bg-brand-50 transition transform hover:scale-105"
                    >
                        পড়াশোনা শুরু করুন
                    </button>
                </div>

            </div>
        </div>
      )
  }

  // --- VIEW: CLASS SELECTION ---
  if (step === 'class') {
    return (
      <div className="max-w-5xl mx-auto animate-fade-in">
        <div className="text-center mb-10">
          <span className="text-brand-600 font-bold tracking-wider uppercase text-sm">একাডেমিক জোন</span>
          <h2 className="text-3xl font-bold text-slate-800 mt-2 font-bengali">আপনার ক্যাটাগরি নির্বাচন করুন</h2>
          <div className="w-24 h-1 bg-brand-500 mx-auto mt-4 rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
          {ACADEMIC_DATA.map((cls) => (
            <button
              key={cls.id}
              onClick={() => handleClassSelect(cls.id)}
              className="bg-white hover:bg-brand-50 border-2 border-transparent hover:border-brand-200 p-8 rounded-2xl shadow-lg transition group flex flex-col items-center gap-4"
            >
              <div className="bg-brand-100 text-brand-600 w-20 h-20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <GraduationCap size={40} />
              </div>
              <h3 className="text-xl font-bold font-bengali text-slate-800">{cls.name}</h3>
              <span className="text-sm text-slate-500 font-bengali">{cls.subjects.length} টি বিষয়</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // --- VIEW: SUBJECT SELECTION ---
  if (step === 'subject' && currentClass) {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in">
        <button onClick={() => setStep('class')} className="flex items-center gap-2 text-slate-500 hover:text-brand-600 mb-6 font-bengali transition">
          <ArrowLeft size={20} /> ক্যাটাগরি পরিবর্তন
        </button>
        
        {/* BCS Roadmap Banner */}
        {selectedClassId === 'bcs-job' && (
            <div 
                onClick={() => setStep('roadmap')}
                className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-6 mb-8 text-white flex items-center justify-between cursor-pointer hover:shadow-xl transition group relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full opacity-10 transform translate-x-10 -translate-y-10"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <Map size={20} className="text-brand-400"/>
                        <span className="text-xs font-bold uppercase tracking-wider text-brand-300">New Feature</span>
                    </div>
                    <h2 className="text-2xl font-bold font-bengali mb-1">🔰 নতুন? আগে রোডম্যাপ দেখুন</h2>
                    <p className="text-slate-300 text-sm font-bengali">ক্যাডার চয়েস, মান বণ্টন এবং প্রস্তুতির কমপ্লিট গাইডলাইন।</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full group-hover:bg-white/30 transition">
                    <ArrowRight size={24} />
                </div>
            </div>
        )}

        <div className="text-center mb-10">
           <h2 className="text-3xl font-bold text-slate-800 font-bengali">{currentClass.name}</h2>
           <p className="text-slate-500 font-bengali">বিষয় নির্বাচন করুন</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {currentClass.subjects.map((sub) => (
            <button
              key={sub.id}
              onClick={() => handleSubjectSelect(sub.id)}
              className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-brand-500 hover:shadow-md transition text-left flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-bold group-hover:bg-brand-100 group-hover:text-brand-600 transition">
                    {sub.name.charAt(0)}
                 </div>
                 <span className="font-bold text-slate-700 font-bengali group-hover:text-brand-700">{sub.name}</span>
              </div>
              <ChevronRight size={18} className="text-slate-300 group-hover:text-brand-500" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  // --- VIEW: CHAPTER SELECTION ---
  if (step === 'chapter' && currentSubject) {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in">
         <button onClick={() => setStep('subject')} className="flex items-center gap-2 text-slate-500 hover:text-brand-600 mb-6 font-bengali transition">
          <ArrowLeft size={20} /> বিষয় পরিবর্তন
        </button>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
           <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-brand-100 rounded-xl text-brand-600"><BookOpen size={24}/></div>
              <h2 className="text-2xl font-bold text-slate-800 font-bengali">{currentSubject.name}</h2>
           </div>
           <p className="text-slate-500 font-bengali ml-16">টপিক ভিত্তিক সাজেশন্স ও কুইজ</p>
        </div>

        <div className="space-y-3">
           {currentSubject.sets.map((set, idx) => (
              <button
                 key={set.id}
                 onClick={() => handleChapterSelect(set)}
                 className="w-full bg-white hover:bg-slate-50 p-5 rounded-xl border border-slate-200 hover:border-brand-300 shadow-sm transition flex items-center justify-between group"
              >
                 <div className="flex items-center gap-4">
                    <span className="text-slate-300 font-bold text-lg w-6">{idx + 1}.</span>
                    <div className="text-left">
                       <h3 className="font-bold text-slate-800 font-bengali text-lg group-hover:text-brand-700">{set.name}</h3>
                       <p className="text-xs text-slate-400 font-bengali mt-0.5">Suggestion & Practice</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-2 text-slate-400 group-hover:text-brand-600">
                    <span className="text-xs font-bold font-bengali hidden sm:inline">প্র্যাকটিস করুন</span>
                    <ArrowRight size={18} />
                 </div>
              </button>
           ))}
        </div>
      </div>
    );
  }

  // --- VIEW: SUGGESTION DASHBOARD (SMART SOHAY STYLE) ---
  if (step === 'suggestion' && selectedChapter) {
      if (isLoadingSuggestion) {
          return (
              <div className="flex flex-col items-center justify-center h-[60vh] animate-fade-in">
                  <div className="relative w-24 h-24 mb-6">
                      <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                      <Brain className="absolute inset-0 m-auto text-brand-500 animate-pulse" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 font-bengali mb-2">স্মার্ট সাজেশন তৈরি হচ্ছে...</h3>
                  <p className="text-slate-500 font-bengali text-sm">AI বিসিএস প্রশ্ন বিশ্লেষণ করছে</p>
              </div>
          )
      }

      if (!suggestionData) return <div className="text-center p-10 font-bengali text-red-500">ডাটা লোড করা যায়নি। আবার চেষ্টা করুন।</div>

      return (
          <div className="max-w-5xl mx-auto animate-fade-in pb-20">
              {/* Header */}
              <div className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 py-3 md:py-4 mb-6 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <button onClick={() => setStep('chapter')} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition"><ArrowLeft size={20}/></button>
                      <div>
                          <h1 className="text-lg md:text-xl font-bold text-slate-800 font-bengali line-clamp-1">{selectedChapter.name}</h1>
                          <p className="text-xs text-slate-500 font-bengali">{currentSubject?.name}</p>
                      </div>
                  </div>
                  <div className="flex gap-2">
                      <button className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-full transition" title="Print"><Printer size={18}/></button>
                      <button className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-full transition" title="Share"><Share2 size={18}/></button>
                  </div>
              </div>

              {/* Summary Card */}
              <div className="bg-gradient-to-r from-brand-50 to-indigo-50 p-6 rounded-2xl border border-brand-100 mb-8 mx-4 md:mx-0">
                  <div className="flex items-start gap-3">
                      <Lightbulb className="text-brand-600 shrink-0 mt-1" size={20}/>
                      <div>
                          <h3 className="font-bold text-brand-800 font-bengali mb-1">টপিক সারসংক্ষেপ</h3>
                          <p className="text-brand-900/80 font-bengali text-sm leading-relaxed">{suggestionData.summary}</p>
                      </div>
                  </div>
              </div>

              {/* Tabs */}
              <div className="flex justify-center mb-6 px-4">
                  <div className="bg-slate-100 p-1 rounded-xl inline-flex w-full md:w-auto">
                      <button 
                        onClick={() => setActiveTab('mcq')} 
                        className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold font-bengali transition-all flex items-center justify-center gap-2 ${activeTab === 'mcq' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                          <CheckSquare size={16}/> নৈর্ব্যক্তিক (MCQ)
                      </button>
                      <button 
                        onClick={() => setActiveTab('cq')} 
                        className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold font-bengali transition-all flex items-center justify-center gap-2 ${activeTab === 'cq' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                          <FileText size={16}/> লিখিত (Written)
                      </button>
                      <button 
                        onClick={() => setActiveTab('exam')} 
                        className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold font-bengali transition-all flex items-center justify-center gap-2 ${activeTab === 'exam' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                          <Activity size={16}/> কুইজ দিন
                      </button>
                  </div>
              </div>

              {/* Tab Content: CQ (Written) */}
              {activeTab === 'cq' && (
                  <div className="space-y-6 px-4 md:px-0">
                      {suggestionData.cqs.map((cq, idx) => (
                          <div key={idx} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                                  <span className="font-bold text-slate-700 font-bengali">প্রশ্ন {idx + 1}</span>
                                  {cq.boardRef && (
                                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${cq.importance > 90 ? 'bg-red-100 text-red-600' : 'bg-slate-200 text-slate-600'}`}>
                                          {cq.boardRef}
                                      </span>
                                  )}
                              </div>
                              <div className="p-6 md:p-8">
                                  <div className="bg-brand-50/50 p-6 rounded-xl border border-brand-100 mb-6 text-slate-800 font-bengali leading-relaxed italic">
                                      {renderMathText(cq.stem)}
                                  </div>
                                  <div className="space-y-4">
                                      {['a', 'b', 'c', 'd'].map((part) => (
                                          <div key={part} className="flex gap-3">
                                              <span className="font-bold text-slate-400 font-mono text-sm uppercase mt-1">{part}.</span>
                                              <div className="flex-1">
                                                  <p className="text-slate-700 font-bengali font-medium">
                                                      {renderMathText((cq.questions as any)[part])}
                                                  </p>
                                                  {/* Solution Hints for C & D */}
                                                  {(part === 'c' || part === 'd') && (cq.solutions as any)[part] && (
                                                      <div className="mt-2 text-xs text-slate-500 font-bengali bg-slate-50 p-2 rounded border border-slate-100 inline-block">
                                                          <span className="font-bold text-brand-600">উত্তর সংকেত: </span> {(cq.solutions as any)[part]}
                                                      </div>
                                                  )}
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              )}

              {/* Tab Content: MCQ (Reading Mode) */}
              {activeTab === 'mcq' && (
                  <div className="space-y-4 px-4 md:px-0">
                      {suggestionData.mcqs.map((mcq, idx) => (
                          <MCQCard key={idx} mcq={mcq} idx={idx} />
                      ))}
                  </div>
              )}

              {/* Tab Content: Exam Start */}
              {activeTab === 'exam' && (
                  <div className="text-center py-12 px-4">
                      <div className="inline-block bg-brand-100 p-6 rounded-full text-brand-600 mb-6">
                          <Activity size={48} />
                      </div>
                      <h2 className="text-2xl font-bold text-slate-800 font-bengali mb-4">নিজেকে যাচাই করুন</h2>
                      <p className="text-slate-500 font-bengali mb-8 max-w-md mx-auto">
                          এই অধ্যায়ের গুরুত্বপূর্ণ {suggestionData.mcqs.length} টি নৈর্ব্যক্তিক প্রশ্ন দিয়ে কুইজ শুরু করুন। প্রতিটি প্রশ্নের মান ১।
                      </p>
                      <button 
                        onClick={startExam}
                        className="bg-brand-600 hover:bg-brand-700 text-white px-10 py-4 rounded-xl font-bold text-lg font-bengali shadow-lg shadow-brand-200 transition transform hover:scale-105"
                      >
                          কুইজ শুরু করুন
                      </button>
                  </div>
              )}

              {/* Bonus: Knowledge Questions (Always Visible at bottom) */}
              {activeTab === 'mcq' && suggestionData.knowledge && (
                 <div className="mt-12 px-4 md:px-0">
                    <h3 className="text-lg font-bold text-slate-700 font-bengali mb-4 border-l-4 border-emerald-500 pl-3">গুরুত্বপূর্ণ জ্ঞানমূলক (এক কথায় উত্তর)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {suggestionData.knowledge.map((k, i) => (
                            <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <p className="font-bold text-slate-800 font-bengali text-sm mb-2">প্র: {k.q}</p>
                                <p className="text-slate-600 font-bengali text-xs leading-relaxed bg-slate-50 p-2 rounded">উ: {k.a}</p>
                            </div>
                        ))}
                    </div>
                 </div>
              )}
          </div>
      );
  }

  // --- VIEW: EXAM RUNNING ---
  if (step === 'exam-running' && suggestionData) {
      const currentQ = suggestionData.mcqs[currentQuestionIdx];
      const progress = ((currentQuestionIdx + 1) / suggestionData.mcqs.length) * 100;

      return (
          <div className="max-w-3xl mx-auto animate-fade-in p-6">
              <div className="flex items-center justify-between mb-8">
                  <div className="text-sm font-bold text-slate-500 font-bengali">প্রশ্ন {currentQuestionIdx + 1} / {suggestionData.mcqs.length}</div>
                  <button onClick={() => setStep('suggestion')} className="text-slate-400 hover:text-red-500"><XCircle size={24}/></button>
              </div>
              
              <div className="w-full bg-slate-100 h-2 rounded-full mb-8 overflow-hidden">
                  <div className="bg-brand-500 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100 mb-8 min-h-[300px] flex flex-col justify-center">
                  <h2 className="text-xl md:text-2xl font-bold text-slate-800 font-bengali mb-8 text-center">{renderMathText(currentQ.question)}</h2>
                  <div className="space-y-3">
                      {currentQ.options.map((opt, i) => {
                          let btnClass = "bg-white border-2 border-slate-200 text-slate-600 hover:border-brand-300 hover:bg-slate-50";
                          if (showFeedback) {
                              if (i === currentQ.correct) btnClass = "bg-emerald-500 text-white border-emerald-500";
                              else if (i === selectedOption) btnClass = "bg-red-500 text-white border-red-500";
                              else btnClass = "bg-slate-50 border-slate-100 text-slate-300";
                          } else if (selectedOption === i) {
                              btnClass = "bg-brand-50 border-brand-500 text-brand-700";
                          }

                          return (
                              <button
                                key={i}
                                onClick={() => handleExamOptionClick(i)}
                                disabled={showFeedback}
                                className={`w-full p-4 rounded-xl font-bengali text-left transition-all font-medium ${btnClass}`}
                              >
                                  {renderMathText(opt)}
                              </button>
                          )
                      })}
                  </div>
              </div>

              {showFeedback && (
                  <div className="animate-slide-up">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
                          <p className="font-bold text-slate-700 font-bengali text-sm mb-1">ব্যাখ্যা:</p>
                          <p className="text-slate-600 font-bengali text-sm">{currentQ.explanation}</p>
                      </div>
                      <button 
                        onClick={handleNextQuestion}
                        className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold font-bengali flex items-center justify-center gap-2 hover:bg-slate-800 transition"
                      >
                          {currentQuestionIdx < suggestionData.mcqs.length - 1 ? 'পরবর্তী প্রশ্ন' : 'ফলাফল দেখুন'} <ArrowRight size={18}/>
                      </button>
                  </div>
              )}
          </div>
      )
  }

  // --- VIEW: EXAM RESULT ---
  if (step === 'exam-result' && suggestionData) {
      const percentage = Math.round((examScore / suggestionData.mcqs.length) * 100);
      return (
          <div className="max-w-md mx-auto animate-fade-in p-6 text-center pt-20">
               <div className="inline-block p-6 rounded-full bg-brand-50 text-brand-600 mb-6 shadow-sm">
                   <Star size={64} fill={percentage > 80 ? "currentColor" : "none"} />
               </div>
               <h2 className="text-3xl font-bold text-slate-800 font-bengali mb-2">পরীক্ষা সম্পন্ন!</h2>
               <p className="text-slate-500 font-bengali mb-8">আপনি পেয়েছেন</p>
               
               <div className="text-6xl font-black text-slate-800 mb-2">{examScore}<span className="text-2xl text-slate-400">/{suggestionData.mcqs.length}</span></div>
               <div className={`inline-block px-4 py-1 rounded-full text-sm font-bold font-bengali mb-10 ${percentage >= 40 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                   {percentage >= 40 ? 'উত্তীর্ণ' : 'অনুত্তীর্ণ'} ({percentage}%)
               </div>

               <div className="flex gap-4">
                   <button onClick={() => { setActiveTab('exam'); setStep('suggestion'); }} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 font-bengali">আবার দিন</button>
                   <button onClick={() => setStep('chapter')} className="flex-1 py-3 bg-brand-600 rounded-xl font-bold text-white hover:bg-brand-700 font-bengali">অন্য টপিক</button>
               </div>
          </div>
      )
  }

  return null;
};

// --- Helper Component for MCQ Reading Mode ---
const MCQCard: React.FC<{ mcq: any, idx: number }> = ({ mcq, idx }) => {
    const [showAns, setShowAns] = useState(false);
    
    return (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-3">
                <div className="font-bold text-slate-800 font-bengali flex gap-2">
                    <span className="text-slate-400">{idx + 1}.</span>
                    <span>{mcq.question}</span>
                </div>
                <button onClick={() => setShowAns(!showAns)} className="text-slate-400 hover:text-brand-600 transition">
                    {showAns ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
                {mcq.options.map((opt: string, i: number) => (
                    <div key={i} className={`text-sm font-bengali px-3 py-2 rounded border ${showAns && i === mcq.correct ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                        <span className="mr-2 opacity-50">{['ক', 'খ', 'গ', 'ঘ'][i]}</span> {opt}
                    </div>
                ))}
            </div>
            {showAns && (
                <div className="text-xs text-slate-500 font-bengali bg-slate-50 p-2 rounded">
                    <span className="font-bold">ব্যাখ্যা:</span> {mcq.explanation}
                </div>
            )}
        </div>
    )
}

export default AcademicSection;
