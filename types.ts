
export interface UserProfile {
  id: string; 
  password?: string;
  name: string;
  age: string;
  birthYear: string;
  profession: string;
  address?: string;
  quizHistory: QuizResult[];
  bookmarks?: number[]; // IDs of bookmarked blogs
}

export interface QuizResult {
  date: string;
  score: number;
  totalQuestions: number;
  category: string;
  level?: number;
}

export interface ChatSession {
  id: string;
  title: string;
  mode: 'spiritual' | 'student';
  messages: any[];
  created_at: string;
}

export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image: string;
  author?: string;
}

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  source?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface VideoItem {
  id: string;
  title: string;
  thumbnail: string;
  channel: string;
  duration: string;
}

export type ViewState = 'home' | 'quiz' | 'profile' | 'onboarding' | 'about' | 'hidayah' | 'contact';
