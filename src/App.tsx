/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Home, 
  Search, 
  User, 
  Flame, 
  CircleCheck, 
  Play, 
  ChevronRight, 
  Clock, 
  Trophy, 
  Calculator, 
  Beaker, 
  History as HistoryIcon, 
  BookOpen,
  ArrowLeft,
  Timer,
  ArrowRight,
  Brain,
  RefreshCcw,
  Star,
  LogOut,
  Bell,
  Settings,
  TrendingUp,
  Circle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---

type Screen = 'home' | 'explore' | 'quiz' | 'results' | 'profile';

interface Subject {
  id: string;
  name: string;
  description: string;
  quizzes: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  icon: React.ReactNode;
  color: string;
}

// --- Data ---

const SUBJECTS: Subject[] = [
  { id: 'biology', name: 'Biology', description: 'Cells, genetics, and ecology.', quizzes: 124, level: 'Beginner', icon: <Beaker className="w-8 h-8" />, color: 'bg-secondary-container text-[#005312]' },
  { id: 'physics', name: 'Physics', description: 'Mechanics and thermodynamics.', quizzes: 86, level: 'Intermediate', icon: <Timer className="w-8 h-8" />, color: 'bg-blue-100 text-[#1a237e]' },
  { id: 'history', name: 'History', description: 'Modern history and civil wars.', quizzes: 210, level: 'Advanced', icon: <HistoryIcon className="w-8 h-8" />, color: 'bg-orange-100 text-[#604100]' },
  { id: 'math', name: 'Math', description: 'Calculus and linear algebra.', quizzes: 156, level: 'Beginner', icon: <Calculator className="w-8 h-8" />, color: 'bg-slate-200 text-[#000666]' },
  { id: 'chemistry', name: 'Chemistry', description: 'Organic and inorganic studies.', quizzes: 94, level: 'Intermediate', icon: <Beaker className="w-8 h-8" />, color: 'bg-purple-100 text-[#1a237e]' },
];

// --- Components ---

const TopBar = ({ title = "QuizStudy", showBack = false, onBack, showTimer = false }: { title?: string, showBack?: boolean, onBack?: () => void, showTimer?: boolean }) => (
  <header className="bg-white border-b border-slate-200 shadow-sm fixed top-0 w-full z-50">
    <div className="flex justify-between items-center px-4 h-16 max-w-lg mx-auto">
      <div className="flex items-center gap-3">
        {showBack && (
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors">
            <ArrowLeft className="w-6 h-6 text-slate-500" />
          </button>
        )}
        {!showBack && (
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-100 shadow-sm">
            <img 
              src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100&auto=format&fit=crop" 
              alt="User" 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <span className="font-lexend font-bold text-xl text-primary tracking-tight">{title}</span>
      </div>
      
      <div className="flex items-center gap-3">
        {showTimer && (
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full border border-slate-200">
            <Timer className="w-4 h-4 text-primary" />
            <span className="font-medium text-sm text-primary">12:45</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 rounded-full border border-blue-100">
          <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
          <span className="font-bold text-sm text-primary">12</span>
        </div>
      </div>
    </div>
  </header>
);

const BottomNav = ({ active, onChange }: { active: Screen, onChange: (s: Screen) => void }) => (
  <nav className="bg-white fixed bottom-0 w-full border-t border-slate-200 shadow-[0_-2px_10px_rgba(26,35,126,0.05)] z-50">
    <div className="flex justify-around items-center h-20 px-6 max-w-lg mx-auto">
      <NavItem active={active === 'home'} onClick={() => onChange('home')} icon={<Home className="w-6 h-6" />} label="Home" />
      <NavItem active={active === 'explore'} onClick={() => onChange('explore')} icon={<Search className="w-6 h-6" />} label="Explore" />
      <NavItem active={active === 'profile'} onClick={() => onChange('profile')} icon={<User className="w-6 h-6" />} label="Profile" />
    </div>
  </nav>
);

const NavItem = ({ active, label, icon, onClick }: { active: boolean, label: string, icon: React.ReactNode, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-1 transition-all duration-200 ${
      active 
        ? 'text-primary bg-blue-50 px-5 py-2 rounded-xl scale-105' 
        : 'text-slate-400 hover:text-primary'
    }`}
  >
    {icon}
    <span className="font-lexend text-xs font-medium">{label}</span>
  </button>
);

// --- Pages ---

const HomeScreen = ({ onNavigate }: { onNavigate: (s: Screen) => void }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-8 pb-10"
  >
    <section>
      <h1 className="font-lexend font-bold text-2xl text-primary">Good Morning, Alex!</h1>
      <p className="text-slate-500 text-sm mt-1">You're on a 12-day streak. Keep the momentum!</p>
    </section>

    <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-sm text-primary uppercase tracking-wider">Daily Goals</h3>
        <span className="text-xs font-bold text-secondary">75% Complete</span>
      </div>
      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: '75%' }}
          className="h-full bg-secondary rounded-full"
        />
      </div>
      <div className="flex gap-6">
        <div className="flex items-center gap-2">
          <CircleCheck className="w-5 h-5 text-secondary fill-secondary/20" />
          <span className="text-xs font-semibold">3 Quizzes</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Circle className="w-5 h-5" />
          <span className="text-xs font-semibold">15 Flashcards</span>
        </div>
      </div>
    </section>

    <section className="space-y-4">
      <div className="flex justify-between items-end">
        <h3 className="font-lexend font-bold text-xl text-primary">Continue Learning</h3>
        <button className="text-sm font-bold text-blue-600 hover:underline">View All</button>
      </div>
      <div 
        onClick={() => onNavigate('quiz')}
        className="relative h-44 rounded-2xl overflow-hidden cursor-pointer group active:scale-[0.98] transition-transform shadow-md"
      >
        <img 
          src="https://images.unsplash.com/photo-1532187870682-f75566b93463?q=80&w=400&auto=format&fit=crop" 
          className="absolute inset-0 w-full h-full object-cover"
          alt="Chemistry"
        />
        <div className="absolute inset-0 bg-primary-container/80 p-5 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="inline-block bg-amber-400 text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase">In Progress</span>
            <h4 className="text-white font-lexend font-bold text-lg">Organic Chemistry</h4>
            <p className="text-white/80 text-xs">Module 4: Carbonyl Compounds</p>
          </div>
          <div className="flex justify-between items-center">
             <div className="flex -space-x-2">
                <div className="w-7 h-7 rounded-full border-2 border-primary-container bg-white flex items-center justify-center text-[10px] font-bold text-primary">AJ</div>
                <div className="w-7 h-7 rounded-full border-2 border-primary-container bg-blue-200"></div>
             </div>
             <button className="bg-white text-primary px-4 py-2 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2">
                Resume <Play className="w-3 h-3 fill-current" />
             </button>
          </div>
        </div>
      </div>
    </section>

    <section className="space-y-4">
      <h3 className="font-lexend font-bold text-xl text-primary">Recommended for You</h3>
      <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-4 px-4 pb-2">
        <RecommendationCard 
          image="https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=200&auto=format&fit=crop"
          subject="Mathematics"
          title="Calculus III: Integrals"
          duration="25 mins"
        />
        <RecommendationCard 
          image="https://images.unsplash.com/photo-1447069387593-a5de0862481e?q=80&w=200&auto=format&fit=crop"
          subject="History"
          title="Industrial Revolution"
          duration="18 mins"
        />
         <RecommendationCard 
          image="https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=200&auto=format&fit=crop"
          subject="Physics"
          title="Quantum Mechanics"
          duration="35 mins"
        />
      </div>
    </section>

    <section className="space-y-4">
      <h3 className="font-lexend font-bold text-xl text-primary">My Subjects</h3>
      <div className="grid grid-cols-2 gap-4">
        <SubjectSummary icon={<Beaker className="w-5 h-5" />} label="Biology" count={12} color="bg-blue-50" text="text-blue-700" />
        <SubjectSummary icon={<Calculator className="w-5 h-5" />} label="Math" count={8} color="bg-emerald-50" text="text-emerald-700" />
      </div>
    </section>
  </motion.div>
);

const RecommendationCard = ({ image, subject, title, duration }: { image: string, subject: string, title: string, duration: string }) => (
  <div className="min-w-[200px] w-[200px] bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:border-primary transition-colors cursor-pointer">
    <img src={image} className="h-28 w-full object-cover" alt={title} />
    <div className="p-4 space-y-1">
      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{subject}</span>
      <h5 className="font-bold text-sm text-primary leading-tight line-clamp-2">{title}</h5>
      <div className="flex items-center gap-2 text-slate-400 pt-1">
        <Clock className="w-3 h-3" />
        <span className="text-[10px] font-semibold">{duration}</span>
      </div>
    </div>
  </div>
);

const SubjectSummary = ({ icon, label, count, color, text }: { icon: React.ReactNode, label: string, count: number, color: string, text: string }) => (
  <div className={`${color} p-4 rounded-2xl flex items-center gap-3 cursor-pointer hover:scale-[1.02] transition-transform`}>
    <div className="bg-white p-2.5 rounded-xl shadow-sm text-primary">
      {icon}
    </div>
    <div>
      <p className="font-bold text-sm text-primary">{label}</p>
      <p className="text-[10px] text-slate-500">{count} Quizzes</p>
    </div>
  </div>
);

const ExploreScreen = ({ onNavigate }: { onNavigate: (s: Screen) => void }) => (
  <motion.div 
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    className="space-y-8 pb-10"
  >
    <section>
      <h1 className="font-lexend font-bold text-3xl text-primary">Explore</h1>
      <p className="text-slate-500 text-sm mt-1">Choose a subject to test your knowledge.</p>
    </section>

    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
      <input 
        type="text" 
        placeholder="Search subjects..."
        className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-sans shadow-sm"
      />
    </div>

    <div className="space-y-4">
      {SUBJECTS.map((sub, idx) => (
        <motion.div 
          key={sub.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          onClick={() => onNavigate('quiz')}
          className="bg-white border border-slate-200 p-4 rounded-2xl flex gap-4 hover:border-primary transition-all cursor-pointer shadow-sm group"
        >
          <div className={`w-20 h-20 rounded-2xl ${sub.color} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
            {sub.icon}
          </div>
          <div className="flex-1 flex flex-col justify-between py-1">
            <div className="flex justify-between items-start">
              <h3 className="font-lexend font-bold text-lg text-primary">{sub.name}</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sub.color}`}>{sub.level}</span>
            </div>
            <p className="text-slate-500 text-xs">{sub.description}</p>
            <div className="flex items-center gap-2 mt-auto">
              <BookOpen className="w-3 h-3 text-slate-400" />
              <span className="text-[10px] font-bold text-slate-400">{sub.quizzes} Quizzes</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>

    <section>
      <h2 className="font-lexend font-bold text-xl text-primary mb-4">Pick of the Day</h2>
      <div className="relative aspect-video rounded-3xl overflow-hidden shadow-xl group cursor-pointer active:scale-[0.99] transition-transform">
        <img 
          src="https://images.unsplash.com/photo-1541339907198-e08756ebafe3?q=80&w=500&auto=format&fit=crop" 
          alt="Renaissance Art"
          className="w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/40 to-transparent p-6 flex flex-col justify-end">
          <span className="bg-amber-400 text-primary text-[10px] font-bold px-3 py-1 rounded-full w-fit mb-2">HOT TOPIC</span>
          <h3 className="text-white font-lexend font-bold text-2xl">Renaissance Art</h3>
          <p className="text-white/80 text-sm mt-1">Master the works of Da Vinci and Michelangelo.</p>
        </div>
      </div>
    </section>
  </motion.div>
);

const QuizScreen = ({ onComplete }: { onComplete: () => void }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col min-h-[calc(100vh-120px)] pt-6"
  >
    <div className="space-y-6 flex-grow">
      <div className="space-y-3">
        <div className="flex justify-between items-end text-xs font-bold font-lexend">
          <span className="text-slate-400">QUESTION 5 OF 15</span>
          <span className="text-secondary">33% COMPLETE</span>
        </div>
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-secondary w-1/3 rounded-full" />
        </div>
      </div>

      <section className="space-y-6">
        <div className="space-y-3">
          <span className="inline-block px-3 py-1 bg-blue-50 text-primary font-bold text-[10px] rounded-full">Physics: Classical Mechanics</span>
          <h1 className="font-lexend font-bold text-xl text-primary leading-snug">
            According to Newton's Second Law of Motion, what happens to the acceleration of an object if the net force acting on it is doubled while its mass remains constant?
          </h1>
        </div>
        
        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
          <img 
            src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=400&auto=format&fit=crop" 
            className="w-full h-48 object-cover opacity-90"
            alt="Physics visualization"
          />
        </div>
      </section>

      <div className="space-y-3">
        <QuizOption letter="A" text="The acceleration is halved" />
        <QuizOption letter="B" text="The acceleration is doubled" active />
        <QuizOption letter="C" text="The acceleration quadruples" />
        <QuizOption letter="D" text="The acceleration remains unchanged" />
      </div>
    </div>

    <footer className="py-6 flex gap-4 mt-6">
      <button className="flex-1 py-4 border-2 border-primary text-primary font-bold rounded-2xl active:scale-95 transition-transform">
        Skip
      </button>
      <button 
        onClick={onComplete}
        className="flex-[2] py-4 bg-secondary text-white font-bold rounded-2xl shadow-lg shadow-secondary/20 flex items-center justify-center gap-2 active:scale-95 transition-transform"
      >
        Submit Answer <ArrowRight className="w-4 h-4" />
      </button>
    </footer>
  </motion.div>
);

const QuizOption = ({ letter, text, active = false }: { letter: string, text: string, active?: boolean }) => (
  <button className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all duration-200 active:scale-[0.98] ${
    active ? 'border-primary bg-white shadow-md' : 'border-slate-100 bg-white hover:border-primary/30'
  }`}>
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-lexend font-bold transition-colors ${
      active ? 'bg-primary text-white' : 'bg-slate-50 text-slate-400'
    }`}>
      {letter}
    </div>
    <span className={`font-semibold text-sm ${active ? 'text-primary' : 'text-slate-600'}`}>{text}</span>
  </button>
);

const ResultsScreen = ({ onNavigate }: { onNavigate: (s: Screen) => void }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="space-y-6 pb-10"
  >
    <section className="bg-primary p-8 rounded-3xl text-white relative overflow-hidden shadow-xl">
      <div className="relative z-10 space-y-4">
        <p className="font-lexend font-bold text-xs text-white/70 uppercase">Quiz Completed!</p>
        <div className="flex items-baseline gap-2">
          <h2 className="text-5xl font-lexend font-extrabold tracking-tighter">85%</h2>
          <span className="font-bold text-lg text-white/90">Great Job!</span>
        </div>
        <p className="text-sm text-white/70 max-w-[200px] leading-relaxed">You're mastering "Advanced Biology" with impressive speed.</p>
        <div className="flex gap-4 pt-2">
          <div className="bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-sm border border-white/10 flex flex-col">
            <span className="text-[10px] text-white/50 font-bold uppercase">Time Taken</span>
            <span className="text-sm font-bold">12:45s</span>
          </div>
          <div className="bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-sm border border-white/10 flex flex-col">
            <span className="text-[10px] text-white/50 font-bold uppercase">XP Earned</span>
            <span className="text-sm font-bold">+450 XP</span>
          </div>
        </div>
      </div>
      <Trophy className="absolute -right-8 -bottom-8 w-48 h-48 text-white/10 rotate-12" />
    </section>

    <div className="grid grid-cols-2 gap-4">
      <StatCard variant="success" value={17} label="Correct" />
      <StatCard variant="danger" value={3} label="Incorrect" />
    </div>

    <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-sm text-primary">Level 14 Progress</h3>
        <span className="text-xs text-slate-400 font-bold">8,250 / 10,000 XP</span>
      </div>
      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-secondary w-[82%] rounded-full shadow-[0_0_10px_rgba(27,109,36,0.3)]" />
      </div>
      <p className="text-xs text-slate-400 italic text-center">"Small steps every day lead to big results. Keep going!"</p>
    </section>

    <div className="space-y-3 pt-2">
      <button className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform">
        <Brain className="w-5 h-5" /> Review Mistakes
      </button>
      <button 
        onClick={() => onNavigate('explore')}
        className="w-full bg-white text-primary border-2 border-primary font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
      >
        <RefreshCcw className="w-5 h-5" /> Retake Quiz
      </button>
    </div>

    <section className="space-y-4 pt-4">
       <h3 className="font-lexend font-bold text-sm text-slate-400 uppercase tracking-widest text-center">Topic Mastery</h3>
       <div className="space-y-3">
          <MasteryItem label="Cell Structures" percentage={100} icon={<Beaker className="w-4 h-4" />} />
          <MasteryItem label="Genetic Mapping" percentage={70} icon={<Brain className="w-4 h-4" />} />
       </div>
    </section>
  </motion.div>
);

const MasteryItem = ({ label, percentage, icon }: { label: string, percentage: number, icon: React.ReactNode }) => (
  <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="text-primary">{icon}</div>
      <span className="font-semibold text-sm text-slate-700">{label}</span>
    </div>
    <span className={`font-bold text-sm ${percentage === 100 ? 'text-secondary' : 'text-amber-500'}`}>{percentage}%</span>
  </div>
);

const StatCard = ({ variant, value, label }: { variant: 'success' | 'danger', value: number, label: string }) => (
  <div className="bg-white p-5 rounded-3xl border border-slate-200 flex flex-col items-center justify-center text-center shadow-sm">
    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${variant === 'success' ? 'bg-emerald-50 text-secondary' : 'bg-red-50 text-red-500'}`}>
      {variant === 'success' ? <CircleCheck className="w-6 h-6 fill-current/10" /> : <RefreshCcw className="w-6 h-6 rotate-45" />}
    </div>
    <span className={`text-4xl font-lexend font-bold ${variant === 'success' ? 'text-secondary' : 'text-red-500'}`}>{value}</span>
    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
  </div>
);

const ProfileScreen = ({ onNavigate }: { onNavigate: (s: Screen) => void }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-8 pb-10"
  >
    <section className="text-center space-y-4">
      <div className="mx-auto w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden relative group">
        <img 
          src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop" 
          className="w-full h-full object-cover transition-transform group-hover:scale-110"
          alt="Avatar"
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Settings className="text-white w-8 h-8" />
        </div>
      </div>
      <div>
        <h1 className="font-lexend font-bold text-3xl text-primary">Alex</h1>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary rounded-full mt-3 shadow-lg">
          <Trophy className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span className="text-[10px] font-bold text-white uppercase tracking-widest">Level 14 — Scholar</span>
        </div>
      </div>
    </section>

    <section className="grid grid-cols-3 gap-3">
      <ProfileStat value="124" label="Quizzes" />
      <ProfileStat value="92%" label="Avg. Score" />
      <ProfileStat value="4.2k" label="Total XP" />
    </section>

    <section className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-lexend font-bold text-xl text-primary">Achievements</h2>
        <button className="text-xs font-bold text-blue-600 hover:underline">View All</button>
      </div>
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
        <Achievement badge={<Flame className="w-8 h-8 fill-orange-500 text-orange-500" />} label="7-Day Streak" color="bg-orange-50 border-orange-200" />
        <Achievement badge={<Calculator className="w-8 h-8 fill-emerald-500 text-emerald-500" />} label="Math Whiz" color="bg-emerald-50 border-emerald-200" />
        <Achievement badge={<Beaker className="w-8 h-8 fill-blue-500 text-blue-500" />} label="Science Pro" color="bg-blue-50 border-blue-200" />
      </div>
    </section>

    <section className="space-y-4">
      <h2 className="font-lexend font-bold text-xl text-primary">Leaderboard Position</h2>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between p-5 bg-blue-50/50">
          <div className="flex items-center gap-3">
            <span className="font-lexend font-bold text-xl text-primary">#12</span>
            <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden">
              <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=50&auto=format&fit=crop" alt="You" />
            </div>
            <div>
              <p className="font-bold text-sm text-primary">Alex (You)</p>
              <p className="text-[10px] font-bold text-slate-400">4,230 Points</p>
            </div>
          </div>
          <TrendingUp className="text-secondary w-5 h-5" />
        </div>
        <div className="p-5 border-t border-slate-100 flex items-center justify-between opacity-60">
          <div className="flex items-center gap-3">
            <span className="font-bold text-sm text-slate-400 w-6">#11</span>
            <div className="w-8 h-8 rounded-full bg-slate-100" />
            <span className="text-sm font-semibold text-slate-600">Sarah Jenkins</span>
          </div>
          <span className="text-xs font-bold text-slate-400">4,410 pts</span>
        </div>
      </div>
    </section>

    <div className="space-y-3">
      <SettingsAction icon={<User className="w-5 h-5" />} label="Edit Profile" />
      <SettingsAction icon={<Bell className="w-5 h-5" />} label="Notification Settings" />
      <SettingsAction icon={<LogOut className="w-5 h-5" />} label="Log Out" danger />
    </div>
  </motion.div>
);

const ProfileStat = ({ value, label }: { value: string, label: string }) => (
  <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-center">
    <p className="font-lexend font-bold text-xl text-primary">{value}</p>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
  </div>
);

const Achievement = ({ badge, label, color }: { badge: React.ReactNode, label: string, color: string }) => (
  <div className="flex-shrink-0 w-28 flex flex-col items-center gap-3">
    <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-sm border-2 ${color}`}>
      {badge}
    </div>
    <span className="text-center text-[10px] font-bold text-slate-600 leading-tight">{label}</span>
  </div>
);

const SettingsAction = ({ icon, label, danger = false }: { icon: React.ReactNode, label: string, danger?: boolean }) => (
  <button className={`w-full flex items-center justify-between p-5 bg-white rounded-2xl shadow-sm border border-slate-100 active:scale-[0.98] transition-all ${danger ? 'text-red-500' : 'text-slate-600'}`}>
    <div className="flex items-center gap-4">
      {icon}
      <span className="font-bold text-sm">{label}</span>
    </div>
    {!danger && <ChevronRight className="w-5 h-5 text-slate-300" />}
  </button>
);

// --- Main App ---

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');

  const renderScreen = () => {
    switch (screen) {
      case 'home': return <HomeScreen onNavigate={setScreen} />;
      case 'explore': return <ExploreScreen onNavigate={setScreen} />;
      case 'quiz': return <QuizScreen onComplete={() => setScreen('results')} />;
      case 'results': return <ResultsScreen onNavigate={setScreen} />;
      case 'profile': return <ProfileScreen onNavigate={setScreen} />;
      default: return <HomeScreen onNavigate={setScreen} />;
    }
  };

  const getTitle = () => {
    if (screen === 'quiz') return "Physics Quiz";
    if (screen === 'results') return "Quiz Results";
    if (screen === 'profile') return "My Profile";
    return "QuizStudy";
  };

  return (
    <div className="min-h-screen pb-24">
      <TopBar 
        title={getTitle()} 
        showBack={screen === 'quiz' || screen === 'results'} 
        onBack={() => setScreen('explore')} 
        showTimer={screen === 'quiz'}
      />
      <main className="max-w-lg mx-auto pt-24 px-4">
        {renderScreen()}
      </main>
      {(screen === 'home' || screen === 'explore' || screen === 'profile' || screen === 'results') && (
        <BottomNav active={screen} onChange={setScreen} />
      )}
    </div>
  );
}
