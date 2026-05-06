/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
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
  Circle,
  Sun,
  Moon,
  Camera,
  Scale,
  Gavel,
  ShieldAlert,
  FileText,
  Briefcase,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---

type Screen = 'home' | 'explore' | 'quiz' | 'results' | 'profile' | 'reminders' | 'auth' | 'edit-profile';

interface Subject {
  id: string;
  name: string;
  description: string;
  quizzes: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  icon: React.ReactNode;
  color: string;
}

interface Reminder {
  id: string;
  subjectId: string;
  time: string;
  active: boolean;
}

// --- Data ---

const SUBJECTS: Subject[] = [
  { id: 'const', name: 'Direito Constitucional', description: 'Direitos fundamentais e organização do Estado.', quizzes: 142, level: 'Beginner', icon: <Scale className="w-8 h-8" />, color: 'bg-blue-50 text-blue-900' },
  { id: 'civil', name: 'Direito Civil', description: 'Contratos, família e sucessões.', quizzes: 186, level: 'Intermediate', icon: <BookOpen className="w-8 h-8" />, color: 'bg-emerald-50 text-emerald-900' },
  { id: 'penal', name: 'Direito Penal', description: 'Teoria do crime e legislação especial.', quizzes: 210, level: 'Advanced', icon: <Gavel className="w-8 h-8" />, color: 'bg-red-50 text-red-900' },
  { id: 'adm', name: 'Direito Administrativo', description: 'Atos administrativos e licitações.', quizzes: 94, level: 'Intermediate', icon: <FileText className="w-8 h-8" />, color: 'bg-purple-50 text-purple-900' },
  { id: 'trabalho', name: 'Direito do Trabalho', description: 'Relações de emprego e leis sociais.', quizzes: 124, level: 'Beginner', icon: <Briefcase className="w-8 h-8" />, color: 'bg-amber-50 text-amber-900' },
  { id: 'tributario', name: 'Direito Tributário', description: 'Impostos, taxas e obrigações fiscais.', quizzes: 78, level: 'Advanced', icon: <Scale className="w-8 h-8" />, color: 'bg-indigo-50 text-indigo-900' },
  { id: 'etica', name: 'Ética Profissional', description: 'Estatuto da OAB e deveres do advogado.', quizzes: 156, level: 'Beginner', icon: <ShieldCheck className="w-8 h-8" />, color: 'bg-yellow-50 text-yellow-900' },
  { id: 'empresarial', name: 'Direito Empresarial', description: 'Sociedades, falências e títulos de crédito.', quizzes: 62, level: 'Advanced', icon: <Briefcase className="w-8 h-8" />, color: 'bg-cyan-50 text-cyan-900' },
  { id: 'ambiental', name: 'Direito Ambiental', description: 'Proteção ao meio ambiente e sustentabilidade.', quizzes: 45, level: 'Intermediate', icon: <Scale className="w-8 h-8" />, color: 'bg-green-50 text-green-900' },
  { id: 'eleitoral', name: 'Direito Eleitoral', description: 'Sistemas eleitorais e partidos políticos.', quizzes: 38, level: 'Intermediate', icon: <FileText className="w-8 h-8" />, color: 'bg-slate-100 text-slate-900' },
  { id: 'consumidor', name: 'Direito do Consumidor', description: 'Relações de consumo e proteção ao cliente.', quizzes: 82, level: 'Beginner', icon: <BookOpen className="w-8 h-8" />, color: 'bg-orange-50 text-orange-900' },
];

const LAW_QUESTIONS: Record<string, any[]> = {
  const: [
    {
      id: 1,
      subject: "Direito Constitucional",
      topic: "Direitos Fundamentais",
      question: "Qual o remédio constitucional cabível para assegurar o conhecimento de informações relativas à pessoa do impetrante, constantes de registros ou bancos de dados de entidades governamentais?",
      options: ["Habeas Corpus", "Habeas Data", "Mandado de Segurança", "Ação Popular"],
      correct: 1,
      image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: 2,
      subject: "Direito Constitucional",
      topic: "Organização do Estado",
      question: "A República Federativa do Brasil é formada pela união indissolúvel de quais entes?",
      options: ["Estados e Municípios apenas", "União, Estados e Distrito Federal apenas", "União, Estados, Distrito Federal e Municípios", "União e Estados soberanos"],
      correct: 2,
      image: "https://images.unsplash.com/photo-1575517175836-2f0ef0306ea0?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: 3,
      subject: "Direito Constitucional",
      topic: "Poder Legislativo",
      question: "Quem detém a competência privativa para legislar sobre Direito Civil, Comercial, Penal, Processual, Eleitoral, Agrário, Marítimo, Aeronáutico, Espacial e do Trabalho?",
      options: ["Os Estados", "O Distrito Federal", "A União", "Os Municípios"],
      correct: 2,
      image: "https://images.unsplash.com/photo-1521791136064-7986c2923216?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: 4,
      subject: "Direito Constitucional",
      topic: "Poder Executivo",
      question: "Qual a idade mínima exigida pela Constituição Federal para ocupar o cargo de Presidente da República?",
      options: ["21 anos", "30 anos", "35 anos", "18 anos"],
      correct: 2,
      image: "https://images.unsplash.com/photo-1555848962-a2267746522c?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: 5,
      subject: "Direito Constitucional",
      topic: "Ordem Social",
      question: "A segurança social compreende um conjunto integrado de ações destinadas a assegurar os direitos relativos a:",
      options: ["Saúde, educação e lazer", "Saúde, previdência e assistência social", "Educação, trabalho e moradia", "Previdência, segurança e transporte"],
      correct: 1,
      image: "https://images.unsplash.com/photo-1576091160550-217359f4886b?q=80&w=400&auto=format&fit=crop"
    }
  ],
  civil: [
    {
       id: 1,
       subject: "Direito Civil",
       topic: "Parte Geral",
       question: "Aos quantos anos se adquire a plena capacidade civil pelo critério da maioridade?",
       options: ["16 anos completo", "18 anos completo", "21 anos completo", "14 anos completo"],
       correct: 1,
       image: "https://images.unsplash.com/photo-1505664194762-85b1758c5f40?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: 2,
      subject: "Direito Civil",
      topic: "Contratos",
      question: "Como se chama o contrato pelo qual uma das partes se obriga a transferir o domínio de certa coisa, e a outra, a pagar-lhe certo preço em dinheiro?",
      options: ["Locação", "Comodato", "Compra e Venda", "Doação"],
      correct: 2,
      image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: 3,
      subject: "Direito Civil",
      topic: "Fatos Jurídicos",
      question: "O negócio jurídico anulável pode ser confirmado pelas partes, salvo se houver:",
      options: ["Vício de consentimento", "Direito de terceiro", "Erro substancial", "Fraude contra credores"],
      correct: 1,
      image: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: 4,
      subject: "Direito Civil",
      topic: "Direito Real",
      question: "Qual o prazo padrão para usucapião extraordinária de imóvel, independentemente de título ou boa-fé?",
      options: ["5 anos", "10 anos", "15 anos", "20 anos"],
      correct: 2,
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: 5,
      subject: "Direito Civil",
      topic: "Sucessões",
      question: "A legítima dos herdeiros necessários corresponde a qual fração da herança?",
      options: ["Um terço", "Metade", "Dois terços", "Totalidade"],
      correct: 1,
      image: "https://images.unsplash.com/photo-1518112391135-e875c7dd8459?q=80&w=400&auto=format&fit=crop"
    }
  ],
  penal: [
    {
      id: 1,
      subject: "Direito Penal",
      topic: "Aplicação da Lei",
      question: "Pelo princípio da anterioridade, não há crime sem lei anterior que o defina, nem pena sem prévia cominação legal. Isso está previsto em qual artigo da Constituição?",
      options: ["Art. 1º", "Art. 5º, XXXIX", "Art. 144", "Art. 226"],
      correct: 1,
      image: "https://images.unsplash.com/photo-1453941403244-67253457053e?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: 2,
      subject: "Direito Penal",
      topic: "Teoria do Crime",
      question: "Conforme o Código Penal, o crime se considera praticado no momento da:",
      options: ["Ação ou omissão", "Resultado", "Consumação", "Prisão em flagrante"],
      correct: 0,
      image: "https://images.unsplash.com/photo-1507567784013-138350616149?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: 3,
      subject: "Direito Penal",
      topic: "Excludentes",
      question: "Quem, usando moderadamente dos meios necessários, repele injusta agressão, atual ou iminente, a direito seu ou de outrem, age em:",
      options: ["Estado de necessidade", "Legítima defesa", "Estrito cumprimento do dever", "Exercício regular do direito"],
      correct: 1,
      image: "https://images.unsplash.com/photo-1578357078586-491aff1abf2f?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: 4,
      subject: "Direito Penal",
      topic: "Crimes contra a Vida",
      question: "A morte culposa na direção de veículo automotor é crime previsto no:",
      options: ["Código Penal (Homicídio Culposo)", "Código de Trânsito Brasileiro", "Lei de Crimes Hediondos", "Estatuto do Desarmamento"],
      correct: 1,
      image: "https://images.unsplash.com/photo-1449965072335-6577975b2981?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: 5,
      subject: "Direito Penal",
      topic: "Crimes contra a Adm",
      question: "Exigir, para si ou para outrem, direta ou indiretamente, ainda que fora da função ou antes de assumi-la, mas em razão dela, vantagem indevida, configura crime de:",
      options: ["Corrupção Passiva", "Concussão", "Prevaricação", "Peculato"],
      correct: 1,
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=400&auto=format&fit=crop"
    }
  ],
  adm: [
    {
      id: 1,
      subject: "Direito Administrativo",
      topic: "Princípios",
      question: "Quais são os princípios expressos da Administração Pública no Art. 37 da CF (LIMPE)?",
      options: ["Lealdade, Interesse, Moralidade, Pessoalidade, Ética", "Legalidade, Impessoalidade, Moralidade, Publicidade, Eficiência", "Liberdade, Igualdade, Mérito, Patrimônio, Economia", "Legalidade, Independência, Modernidade, Prontidão, Eficácia"],
      correct: 1,
      image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: 2,
      subject: "Direito Administrativo",
      topic: "Poderes",
      question: "Qual o poder da Administração para distribuir e escalonar as funções de seus órgãos?",
      options: ["Poder Vinculado", "Poder Disciplinar", "Poder Hierárquico", "Poder Regulamentar"],
      correct: 2,
      image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: 3,
      subject: "Direito Administrativo",
      topic: "Atos",
      question: "Qual o atributo do ato administrativo que permite a sua execução direta pela própria Administração?",
      options: ["Presunção de Legitimidade", "Imperatividade", "Autoexecutoriedade", "Tipicidade"],
      correct: 2,
      image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: 4,
      subject: "Direito Administrativo",
      topic: "Licitações",
      question: "Conforme a nova Lei de Licitações (14.133), qual modalidade foi criada para contratação de objetos que envolvam inovação tecnológica?",
      options: ["Pregão", "Leilão", "Diálogo Competitivo", "Concurso"],
      correct: 2,
      image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: 5,
      subject: "Direito Administrativo",
      topic: "Servidores",
      question: "O prazo de validade do concurso público será de até quanto tempo, prorrogável uma vez por igual período?",
      options: ["1 ano", "2 anos", "3 anos", "4 anos"],
      correct: 1,
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=400&auto=format&fit=crop"
    }
  ],
  trabalho: [
    {
      id: 1,
      subject: "Direito do Trabalho",
      topic: "Relação de Emprego",
      question: "São requisitos da relação de emprego (vínculo celetista), EXCETO:",
      options: ["Subordinação", "Onerosidade", "Eventualidade", "Pessoalidade"],
      correct: 2,
      image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: 2,
      subject: "Direito do Trabalho",
      topic: "Jornada",
      question: "Qual o limite constitucional padrão da jornada semanal de trabalho?",
      options: ["40 horas", "44 horas", "48 horas", "36 horas"],
      correct: 1,
      image: "https://images.unsplash.com/photo-1495364141860-b0d03eedd023?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: 3,
      subject: "Direito do Trabalho",
      topic: "Férias",
      question: "Após cada período de 12 meses de vigência do contrato, o empregado terá direito a férias na proporção máxima de quantos dias corridos (sem faltas)?",
      options: ["15 dias", "20 dias", "30 dias", "45 dias"],
      correct: 2,
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: 4,
      subject: "Direito do Trabalho",
      topic: "Verbas",
      question: "Qual o percentual do FGTS que o empregador deve depositar mensalmente sobre a remuneração do trabalhador?",
      options: ["5%", "8%", "10%", "11%"],
      correct: 1,
      image: "https://images.unsplash.com/photo-1554224155-1697467276d4?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: 5,
      subject: "Direito do Trabalho",
      topic: "Estabilidades",
      question: "A empregada gestante tem estabilidade provisória desde a confirmação da gravidez até quanto tempo após o parto?",
      options: ["3 meses", "4 meses", "5 meses", "6 meses"],
      correct: 2,
      image: "https://images.unsplash.com/photo-1518112391135-e875c7dd8459?q=80&w=400&auto=format&fit=crop"
    }
  ]
};

// --- Components ---

const TopBar = ({ title = "Direito em Foco", showBack = false, onBack, showTimer = false, isDarkMode, onToggleTheme, user, onNavigate }: { 
  title?: string, 
  showBack?: boolean, 
  onBack?: () => void, 
  showTimer?: boolean, 
  isDarkMode: boolean,
  onToggleTheme: () => void,
  user: SupabaseUser | null,
  onNavigate?: (s: Screen) => void
}) => (
  <header className="bg-white/70 backdrop-blur-2xl border-b border-primary/5 fixed top-0 w-full z-50 transition-all">
    <div className="flex justify-between items-center px-6 h-20 max-w-lg mx-auto">
      <div className="flex items-center gap-4">
        {showBack && (
          <button onClick={onBack} className="p-2.5 -ml-3 rounded-2xl hover:bg-secondary/10 transition-colors active:scale-90 text-primary">
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}
        {!showBack && user && (
          <div 
            onClick={() => onNavigate?.('profile')}
            className="w-11 h-11 rounded-full overflow-hidden border-2 border-white shadow-xl bg-primary-container group cursor-pointer transition-all hover:scale-110 active:scale-95 ring-2 ring-secondary/20"
          >
            <img 
              src={user.user_metadata?.avatar_url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop"} 
              alt="User" 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <span className="font-display font-bold text-lg text-primary tracking-tight truncate max-w-[180px]">{title}</span>
      </div>
      
      <div className="flex items-center gap-3">
        <button 
          onClick={onToggleTheme}
          className="p-3 rounded-full bg-white shadow-md text-secondary hover:bg-secondary/5 transition-all active:scale-90 border border-slate-50"
        >
          {isDarkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5" />}
        </button>
        <div className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-2xl shadow-xl shadow-primary/20 border border-primary/10">
          <Flame className="w-4 h-4 text-secondary fill-secondary" />
          <span className="font-black text-sm tracking-tighter">12</span>
        </div>
      </div>
    </div>
  </header>
);


const BottomNav = ({ active, onChange }: { active: Screen, onChange: (s: Screen) => void }) => (
  <nav className="bg-white/80 backdrop-blur-2xl fixed bottom-0 w-full border-t border-primary/5 shadow-[0_-10px_40px_rgba(26,35,126,0.08)] z-50 transition-all">
    <div className="flex justify-around items-center px-6 h-24 max-w-lg mx-auto">
      <NavItem 
        icon={<Home className="w-6 h-6" />} 
        label="Início" 
        active={active === 'home'} 
        onClick={() => onChange('home')} 
      />
      <NavItem 
        icon={<Search className="w-6 h-6" />} 
        label="Explorar" 
        active={active === 'explore' || active === 'quiz' || active === 'results'} 
        onClick={() => onChange('explore')} 
      />
      <NavItem 
        icon={<User className="w-6 h-6" />} 
        label="Perfil" 
        active={active === 'profile' || active === 'edit-profile'} 
        onClick={() => onChange('profile')} 
      />
    </div>
  </nav>
);

const NavItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1.5 transition-all relative ${active ? 'text-primary scale-110' : 'text-slate-400 opacity-60 hover:opacity-100'}`}
  >
    <div className={`p-3 rounded-2xl transition-all duration-300 ${active ? 'bg-primary/10 shadow-inner' : 'bg-transparent'}`}>
      {icon}
    </div>
    <span className={`text-[10px] font-black uppercase tracking-tight transition-all ${active ? 'opacity-100' : 'opacity-0 -translate-y-2'}`}>{label}</span>
  </button>
);

// --- Pages ---

const HomeScreen = ({ onNavigate, user }: { onNavigate: (s: Screen) => void, user: SupabaseUser | null }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-8 pb-10"
  >
    <section>
      <h1 className="text-4xl text-primary mb-1 font-display leading-[1.1]">
        Doutor(a) {user?.user_metadata?.full_name?.split(' ')[0] || 'Alessandro'}
      </h1>
      <p className="text-slate-500 text-sm font-medium">Sua disciplina está em 12 dias. Siga firme rumo à excelência.</p>
    </section>

    <section className="bg-white/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-secondary/20 shadow-2xl shadow-primary/5 space-y-6 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-40 h-40 bg-secondary/5 rounded-full -mr-20 -mt-20 blur-3xl transition-transform group-hover:scale-120" />
      
      <div className="flex justify-between items-center relative z-10">
        <h3 className="font-lexend font-extrabold text-[10px] text-primary uppercase tracking-[0.2em]">Metas da OAB</h3>
        <span className="text-[10px] font-black text-secondary bg-secondary/10 px-3 py-1.5 rounded-xl">75% Concluído</span>
      </div>

      <div className="h-3 w-full bg-slate-100/50 rounded-full overflow-hidden relative z-10 border border-white">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: '75%' }}
          className="h-full bg-gradient-to-r from-secondary via-secondary/80 to-secondary rounded-full shadow-[0_0_15px_rgba(197,160,89,0.3)]"
        />
      </div>

      <div className="flex gap-5 relative z-10">
        <div className="flex items-center gap-3 bg-white/50 p-2 pr-4 rounded-2xl border border-white/50">
          <div className="p-2 bg-secondary/10 rounded-xl">
            <CircleCheck className="w-4 h-4 text-secondary" />
          </div>
          <span className="text-[11px] font-black text-primary uppercase tracking-tighter">3 Simulados</span>
        </div>
        <div className="flex items-center gap-3 bg-white/50 p-2 pr-4 rounded-2xl border border-white/50">
          <div className="p-2 bg-primary/5 rounded-xl">
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <span className="text-[11px] font-black text-primary uppercase tracking-tighter">15 Súmulas</span>
        </div>
      </div>
    </section>

    <section className="space-y-4">
      <div className="flex justify-between items-end">
        <h3 className="text-2xl text-primary">Continuar Revisão</h3>
        <button onClick={() => onNavigate('explore')} className="text-sm font-bold text-secondary hover:text-primary transition-colors flex items-center gap-1">
          Ver Todas <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div 
        onClick={() => {
          localStorage.setItem('selectedSubject', 'const');
          onNavigate('quiz');
        }}
        className="relative h-48 rounded-3xl overflow-hidden cursor-pointer group active:scale-[0.98] transition-all shadow-2xl shadow-primary/10 border border-white"
      >
        <img 
          src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=600&auto=format&fit=crop" 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          alt="Direito Constitucional"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/40 to-transparent p-6 flex flex-col justify-end">
          <div className="space-y-1">
            <span className="inline-block bg-secondary text-primary-container text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter mb-2">EM REVISÃO</span>
            <h4 className="text-white font-display font-bold text-2xl">Direito Constitucional</h4>
            <p className="text-white/70 text-xs italic">Módulo 2: Direitos e Garantias Fundamentais</p>
          </div>
          <div className="flex justify-between items-center mt-4">
             <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-primary bg-secondary flex items-center justify-center text-[10px] font-bold text-primary shadow-lg">DR</div>
                <div className="w-8 h-8 rounded-full border-2 border-primary bg-primary-container"></div>
             </div>
             <button className="bg-white text-primary px-5 py-2.5 rounded-2xl font-bold text-xs shadow-xl flex items-center gap-2 hover:bg-secondary hover:text-primary-container transition-colors">
                Retomar Estudo <Play className="w-3 h-3 fill-current" />
             </button>
          </div>
        </div>
      </div>
    </section>

    <section className="space-y-4">
      <h3 className="text-2xl text-primary">Recomendado</h3>
      <div className="flex gap-5 overflow-x-auto no-scrollbar -mx-4 px-4 pb-4">
        <RecommendationCard 
          image="https://images.unsplash.com/photo-1574950578143-85f8a971bb44?q=80&w=400&auto=format&fit=crop"
          subject="Direito Civil"
          title="Responsabilidade Civil e Danos"
          duration="25 min"
          onClick={() => {
            localStorage.setItem('selectedSubject', 'civil');
            onNavigate('quiz');
          }}
        />
        <RecommendationCard 
          image="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=400&auto=format&fit=crop"
          subject="Direito Penal"
          title="Tipicidade e Ilicitude"
          duration="18 min"
          onClick={() => {
            localStorage.setItem('selectedSubject', 'penal');
            onNavigate('quiz');
          }}
        />
         <RecommendationCard 
          image="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=400&auto=format&fit=crop"
          subject="Direito Adm"
          title="Atos e Processos Administrativos"
          duration="35 min"
          onClick={() => {
            localStorage.setItem('selectedSubject', 'adm');
            onNavigate('quiz');
          }}
        />
      </div>
    </section>

    <section className="space-y-4">
      <div className="flex justify-between items-end">
        <h3 className="text-2xl text-primary font-display font-bold">Doutrinas</h3>
        <button onClick={() => onNavigate('explore')} className="text-xs font-black text-secondary uppercase tracking-widest hover:text-primary transition-colors">Ver Todas</button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {SUBJECTS.slice(0, 4).map(sub => (
          <SubjectSummary 
            key={sub.id}
            icon={sub.icon}
            label={sub.name.replace('Direito ', '')}
            count={sub.quizzes}
            color={sub.color}
            text="text-primary"
            onClick={() => {
              localStorage.setItem('selectedSubject', sub.id);
              onNavigate('quiz');
            }}
          />
        ))}
      </div>
    </section>
  </motion.div>
);

const RecommendationCard = ({ image, subject, title, duration, onClick }: { image: string, subject: string, title: string, duration: string, onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className="min-w-[220px] w-[220px] bg-white border border-secondary/10 rounded-3xl overflow-hidden shadow-lg shadow-primary/5 hover:shadow-primary/10 transition-all cursor-pointer group"
  >
    <div className="h-32 w-full overflow-hidden relative">
      <img src={image} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" alt={title} />
      <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <Play className="w-8 h-8 text-white fill-white" />
      </div>
    </div>
    <div className="p-5 space-y-2">
      <span className="text-[10px] font-black text-secondary uppercase tracking-[0.1em]">{subject}</span>
      <h5 className="font-display font-bold text-base text-primary leading-tight line-clamp-2 h-10">{title}</h5>
      <div className="flex items-center gap-2 text-slate-400 pt-1 border-t border-slate-50 mt-2">
        <Clock className="w-3.5 h-3.5" />
        <span className="text-[11px] font-bold">{duration}</span>
      </div>
    </div>
  </div>
);

const SubjectSummary = ({ icon, label, count, color, text, onClick }: { key?: React.Key, icon: React.ReactNode, label: string, count: number, color: string, text: string, onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className={`${color} p-5 rounded-3xl flex items-center gap-4 cursor-pointer hover:scale-[1.05] transition-all border border-secondary/10 shadow-sm shadow-primary/5 active:scale-95`}
  >
    <div className="bg-white p-3 rounded-2xl shadow-md text-primary transition-colors border border-slate-50">
      {icon}
    </div>
    <div>
      <p className="font-display font-bold text-lg text-primary leading-none">{label}</p>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{count} Simulados</p>
    </div>
  </div>
);

const ExploreScreen = ({ onNavigate }: { onNavigate: (s: Screen) => void }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [visibleLimit, setVisibleLimit] = useState(4);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const startQuiz = (id: string) => {
    localStorage.setItem('selectedSubject', id);
    onNavigate('quiz');
  };

  const filteredSubjects = SUBJECTS.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.description.toLowerCase().includes(search.toLowerCase())
  );

  const displayedSubjects = filteredSubjects.slice(0, visibleLimit);
  const hasMore = visibleLimit < filteredSubjects.length;

  const loadMore = () => {
    setIsLoading(true);
    setTimeout(() => {
      setVisibleLimit(prev => prev + 4);
      setIsLoading(false);
    }, 500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-10"
    >
      <section>
        <h1 className="text-4xl text-primary mb-2">Doutrinas Jurídicas</h1>
        <p className="text-slate-500 text-sm font-medium">Explore as ramificações do Direito e aprofunde seu saber.</p>
      </section>

      <div className="relative group">
        <div className="absolute inset-0 bg-secondary/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity -z-10" />
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-secondary transition-colors" />
        <input 
          type="text" 
          placeholder="Pesquisar por matéria ou conceito..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setVisibleLimit(4);
          }}
          className="w-full bg-white border-2 border-secondary/10 rounded-[2rem] py-5 pl-14 pr-6 outline-none focus:border-secondary transition-all font-sans shadow-xl shadow-primary/5 text-primary placeholder:text-slate-300 font-medium"
        />
      </div>

      <div className="space-y-5">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white border border-secondary/10 p-5 rounded-3xl flex gap-5 shadow-lg shadow-primary/5 animate-pulse transition-colors">
                  <div className="w-24 h-24 rounded-2xl bg-slate-50 flex-shrink-0" />
                  <div className="flex-1 space-y-3 py-2">
                    <div className="flex justify-between items-start">
                      <div className="h-6 bg-slate-50 rounded-lg w-1/3" />
                      <div className="h-5 bg-slate-50 rounded-full w-16" />
                    </div>
                    <div className="h-4 bg-slate-50 rounded-md w-full" />
                    <div className="h-4 bg-slate-50 rounded-md w-1/4 mt-auto" />
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-5"
            >
              {displayedSubjects.map((sub, idx) => (
                <motion.div 
                  key={sub.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => startQuiz(sub.id)}
                  className="bg-white border border-secondary/10 p-5 rounded-[2rem] flex gap-5 hover:border-secondary transition-all cursor-pointer shadow-lg shadow-primary/5 group active:scale-[0.98]"
                >
                  <div className={`w-24 h-24 rounded-2xl ${sub.color} flex items-center justify-center flex-shrink-0 group-hover:rotate-3 transition-transform shadow-inner`}>
                    {sub.icon}
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-display font-bold text-xl text-primary">{sub.name}</h3>
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full ${sub.color} tracking-tighter uppercase mb-2`}>
                        {sub.level === 'Beginner' ? 'Fundamental' : sub.level === 'Intermediate' ? 'Sênior' : 'Magistratura'}
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs leading-relaxed line-clamp-1 mb-2 italic">"{sub.description}"</p>
                    <div className="flex items-center gap-3 mt-auto">
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-secondary" />
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">{sub.quizzes} Simulados</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">4.9</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {hasMore && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={loadMore}
                  disabled={isLoading}
                  className="w-full py-4 border-2 border-secondary/20 rounded-[2rem] text-secondary font-black text-xs uppercase tracking-widest hover:bg-secondary/5 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>Ver Mais Doutrinas <ChevronRight className="w-4 h-4" /></>
                  )}
                </motion.button>
              )}

              {filteredSubjects.length === 0 && (
                <div className="text-center py-20 space-y-4">
                  <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                    <Search className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-400 font-medium">Nenhuma doutrina encontrada para "{search}"</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <section>
        <h2 className="font-lexend font-bold text-xl text-primary mb-4 italic">Caso Jurídico do Dia</h2>
        <div 
          onClick={() => startQuiz('const')}
          className="relative aspect-video rounded-3xl overflow-hidden shadow-xl group cursor-pointer active:scale-[0.99] transition-transform"
        >
          <img 
            src="https://images.unsplash.com/photo-1505664194762-85b1758c5f40?q=80&w=500&auto=format&fit=crop" 
            alt="Justiça"
            className="w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/40 to-transparent p-6 flex flex-col justify-end">
            <span className="bg-amber-400 text-primary text-[10px] font-bold px-3 py-1 rounded-full w-fit mb-2">JURISPRUDÊNCIA</span>
            <h3 className="text-white font-lexend font-bold text-2xl">O Caso dos Exploradores de Caverna</h3>
            <p className="text-white/80 text-sm mt-1">Analise os dilemas éticos e jurídicos desta obra clássica de Lon Fuller.</p>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

const QuizScreen = ({ questions, onComplete }: { questions: any[], onComplete: (score: number) => void }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const question = questions[currentIdx];

  const handleNext = () => {
    const isCorrect = selectedOption === question.correct;
    const finalScore = isCorrect ? score + 1 : score;
    
    if (currentIdx < questions.length - 1) {
      setScore(finalScore);
      setCurrentIdx(i => i + 1);
      setSelectedOption(null);
    } else {
      // Salvar resultado (opcional) e finalizar
      localStorage.setItem('lastScore', finalScore.toString());
      localStorage.setItem('totalQuestions', questions.length.toString());
      onComplete(finalScore);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col min-h-[calc(100vh-120px)] pt-6"
    >
      <div className="space-y-6 flex-grow">
        <div className="space-y-3">
          <div className="flex justify-between items-end text-xs font-bold font-lexend">
            <span className="text-slate-400">QUESTÃO {currentIdx + 1} DE {questions.length}</span>
            <span className="text-secondary">{Math.round(((currentIdx) / questions.length) * 100)}% CONCLUÍDO</span>
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
              className="h-full bg-secondary rounded-full" 
            />
          </div>
        </div>

        <section className="space-y-6">
          <div className="space-y-3">
            <span className="inline-block px-3 py-1 bg-blue-50 text-primary font-bold text-[10px] rounded-full">
              {question.subject}: {question.topic}
            </span>
            <h1 className="font-lexend font-bold text-xl text-primary leading-snug">
              {question.question}
            </h1>
          </div>
          
          <div className="rounded-2xl overflow-hidden border border-card-border shadow-sm bg-card-bg transition-colors">
            <img 
              src={question.image} 
              className="w-full h-48 object-cover opacity-90 dark:opacity-75"
              alt="Contexto Jurídico"
            />
          </div>
        </section>

        <div className="space-y-3">
          {question.options.map((opt: string, idx: number) => (
            <QuizOption 
              key={idx}
              letter={String.fromCharCode(65 + idx)} 
              text={opt} 
              active={selectedOption === idx}
              onClick={() => setSelectedOption(idx)}
            />
          ))}
        </div>
      </div>

      <footer className="py-6 flex gap-4 mt-6">
        <button 
          onClick={handleNext}
          disabled={selectedOption === null}
          className="flex-1 py-4 bg-secondary text-white font-bold rounded-2xl shadow-lg shadow-secondary/20 flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50 disabled:grayscale"
        >
          {currentIdx < questions.length - 1 ? 'Próxima Questão' : 'Ver Resultados'} <ArrowRight className="w-4 h-4" />
        </button>
      </footer>
    </motion.div>
  );
};

interface QuizOptionProps {
  key?: React.Key;
  letter: string;
  text: string;
  active?: boolean;
  onClick: () => void;
}

const QuizOption = ({ letter, text, active = false, onClick }: QuizOptionProps) => (
  <button 
    onClick={onClick}
    className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all duration-200 active:scale-[0.98] ${
      active ? 'border-primary bg-card-bg shadow-md' : 'border-card-border bg-card-bg hover:border-primary/30'
    }`}
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-lexend font-bold transition-colors ${
      active ? 'bg-primary text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'
    }`}>
      {letter}
    </div>
    <span className={`font-semibold text-sm text-left ${active ? 'text-primary' : 'text-slate-600 dark:text-slate-300'}`}>{text}</span>
  </button>
);

const ResultsScreen = ({ onNavigate }: { onNavigate: (s: Screen) => void }) => {
  const lastScore = parseInt(localStorage.getItem('lastScore') || '0');
  const totalQuestions = parseInt(localStorage.getItem('totalQuestions') || '5');
  const percentage = Math.round((lastScore / totalQuestions) * 100);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8 pb-10"
    >
      <section className="bg-primary p-10 rounded-[3rem] text-white relative overflow-hidden shadow-2xl border-4 border-white">
        <div className="relative z-10 space-y-6">
          <p className="font-black text-[10px] text-white/50 uppercase tracking-[0.3em]">RELATÓRIO JURÍDICO</p>
          <div className="flex items-baseline gap-3">
            <h2 className="text-6xl font-display font-extrabold tracking-tighter">{percentage}%</h2>
            <span className="font-display font-bold text-xl text-secondary italic">
              {percentage >= 70 ? 'Apto' : 'Em Formação'}
            </span>
          </div>
          <p className="text-sm text-white/70 max-w-[240px] leading-relaxed italic">"A perseverança é a base de todo triunfo jurídico. Continue sua jornada acadêmica."</p>
          <div className="flex gap-4 pt-4">
            <div className="bg-white/5 px-5 py-3 rounded-2xl backdrop-blur-md border border-white/10 flex flex-col items-center">
              <span className="text-[9px] text-white/40 font-black uppercase tracking-widest">Quesitos</span>
              <span className="text-base font-bold">{lastScore}/{totalQuestions}</span>
            </div>
            <div className="bg-white/5 px-5 py-3 rounded-2xl backdrop-blur-md border border-white/10 flex flex-col items-center">
              <span className="text-[9px] text-white/40 font-black uppercase tracking-widest">Mérito</span>
              <span className="text-base font-bold">+{lastScore * 50} XP</span>
            </div>
          </div>
        </div>
        <Scale className="absolute -right-12 -bottom-12 w-64 h-64 text-white/5 rotate-12" />
      </section>

      <div className="grid grid-cols-2 gap-5 px-1">
        <StatCard variant="success" value={lastScore} label="Procedentes" />
        <StatCard variant="danger" value={totalQuestions - lastScore} label="Improcedentes" />
      </div>

      <section className="bg-white p-8 rounded-[2.5rem] border border-secondary/10 shadow-xl shadow-primary/5 space-y-5">
        <div className="flex justify-between items-center">
          <h3 className="font-display font-bold text-lg text-primary leading-none">Carreira Jurídica</h3>
          <span className="text-[10px] text-secondary font-black tracking-widest uppercase bg-secondary/10 px-2 py-1 rounded">Mestre</span>
        </div>
        <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
          <div className="h-full bg-gradient-to-r from-secondary to-secondary/70 w-[82%] rounded-full shadow-[0_0_15px_rgba(197,160,89,0.3)]" />
        </div>
        <p className="text-[11px] text-slate-400 italic text-center px-4">"Lex est quod notamus — A lei é o que anotamos."</p>
      </section>

      <div className="space-y-4 pt-4">
        <button 
          onClick={() => onNavigate('explore')}
          className="w-full bg-primary text-white font-black text-xs uppercase tracking-widest py-5 rounded-[2rem] shadow-xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-95 transition-all"
        >
          <Gavel className="w-5 h-5 text-secondary" /> Revisar Doutrina
        </button>
        <button 
          onClick={() => onNavigate('explore')}
          className="w-full bg-white text-primary border-2 border-secondary/20 font-black text-xs uppercase tracking-widest py-5 rounded-[2rem] flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-secondary/5 hover:border-secondary transition-colors shadow-lg shadow-primary/5"
        >
          <Scale className="w-5 h-5 text-secondary" /> Novo Simulado
        </button>
      </div>
    </motion.div>
  );
};

const MasteryItem = ({ label, percentage, icon }: { label: string, percentage: number, icon: React.ReactNode }) => (
  <div className="bg-card-bg border border-card-border p-4 rounded-2xl flex items-center justify-between transition-colors shadow-sm">
    <div className="flex items-center gap-3">
      <div className="text-primary">{icon}</div>
      <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">{label}</span>
    </div>
    <span className={`font-bold text-sm ${percentage === 100 ? 'text-secondary' : 'text-amber-500'}`}>{percentage}%</span>
  </div>
);

const StatCard = ({ variant, value, label }: { variant: 'success' | 'danger', value: number, label: string }) => (
  <div className="bg-white p-6 rounded-[2.5rem] border border-secondary/10 flex flex-col items-center justify-center text-center shadow-xl shadow-primary/5 transition-all hover:border-secondary/30 relative overflow-hidden group">
    <div className={`absolute top-0 left-0 w-full h-1 ${variant === 'success' ? 'bg-secondary' : 'bg-red-500'}`} />
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:rotate-12 ${variant === 'success' ? 'bg-secondary/10 text-secondary border border-secondary/20 shadow-inner' : 'bg-red-50 text-red-500 border border-red-100 shadow-inner'}`}>
      {variant === 'success' ? <CircleCheck className="w-7 h-7" /> : <RefreshCcw className="w-7 h-7" />}
    </div>
    <span className={`text-4xl font-display font-bold leading-none mb-1 ${variant === 'success' ? 'text-primary' : 'text-red-500'}`}>{value}</span>
    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
  </div>
);

const ProfileScreen = ({ onNavigate, user }: { onNavigate: (s: Screen) => void, user: SupabaseUser | null }) => {
  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-10"
    >
      <section className="space-y-4 text-center">
        <div className="mx-auto w-36 h-36 rounded-full border-4 border-white shadow-2xl shadow-primary/20 overflow-hidden relative group transition-all">
          <img 
            src={user?.user_metadata?.avatar_url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop"} 
            className="w-full h-full object-cover transition-transform group-hover:scale-110"
            alt="Avatar"
          />
          <div 
            onClick={() => onNavigate('edit-profile')}
            className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
          >
            <Camera className="text-white w-8 h-8" />
          </div>
        </div>
        <div>
          <h1 className="text-4xl text-primary">{user?.user_metadata?.full_name || 'Estudante'}</h1>
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-primary rounded-2xl mt-4 shadow-xl border border-secondary/20">
            <Scale className="w-4 h-4 text-secondary" />
            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Bacharel em Direito</span>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-4">
        <ProfileStat value="142" label="Simulados" />
        <ProfileStat value="88%" label="Precisão" />
        <ProfileStat value="12k" label="Pontos" />
      </section>

      <section className="space-y-4 text-left">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-2xl text-primary">Medalhas de Mérito</h2>
          <button className="text-xs font-black text-secondary tracking-tighter uppercase">Todas</button>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4">
          <Achievement badge={<Flame className="w-8 h-8 text-orange-500 fill-orange-500" />} label="Série de 7 Dias" color="bg-orange-50 border-orange-100" />
          <Achievement badge={<Scale className="w-8 h-8 text-primary fill-primary/20" />} label="Civilista" color="bg-blue-50 border-blue-100" />
          <Achievement badge={<Gavel className="w-8 h-8 text-secondary fill-secondary/20" />} label="Penalista" color="bg-secondary/5 border-secondary/10" />
          <Achievement badge={<Briefcase className="w-8 h-8 text-purple-500 fill-purple-500/20" />} label="Trabalhista" color="bg-purple-50 border-purple-100" />
        </div>
      </section>

      <section className="space-y-4 text-left">
        <h2 className="text-2xl text-primary">Classificação na Ordem</h2>
        <div className="bg-white rounded-[2rem] shadow-xl shadow-primary/5 border border-secondary/10 overflow-hidden">
          <div className="flex items-center justify-between p-6 bg-secondary/10">
            <div className="flex items-center gap-4">
              <span className="font-display font-bold text-2xl text-primary">#12</span>
              <div className="w-12 h-12 rounded-full border-2 border-white shadow-md overflow-hidden bg-primary-container">
                <img src={user?.user_metadata?.avatar_url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop"} alt="Você" />
              </div>
              <div>
                <p className="font-display font-bold text-base text-primary">{user?.user_metadata?.full_name || 'Você'}</p>
                <p className="text-[10px] font-black text-secondary uppercase tracking-tighter">8.450 Pontos</p>
              </div>
            </div>
            <TrendingUp className="text-secondary w-6 h-6 animate-pulse" />
          </div>
          <div className="p-6 border-t border-secondary/5 flex items-center justify-between opacity-50 bg-slate-50/30">
            <div className="flex items-center gap-4">
              <span className="font-bold text-sm text-slate-400 w-6">#11</span>
              <div className="w-8 h-8 rounded-full bg-slate-200" />
              <span className="text-sm font-bold text-slate-500 leading-none">Dra. Amanda Silva</span>
            </div>
            <span className="text-xs font-black text-slate-400">8.910 pts</span>
          </div>
        </div>
      </section>

      <div className="space-y-4 pt-4">
        <SettingsAction icon={<User className="w-6 h-6" />} label="Dados Cadastrais" onClick={() => onNavigate('edit-profile')} />
        <SettingsAction icon={<Bell className="w-6 h-6" />} label="Agenda de Estudos" onClick={() => onNavigate('reminders')} />
        <SettingsAction icon={<LogOut className="w-6 h-6" />} label="Encerrar Sessão" danger onClick={handleLogout} />
      </div>
    </motion.div>
  );
};

const RemindersScreen = ({ reminders, subjects, onAdd, onDelete, onToggle }: { 
  reminders: Reminder[], 
  subjects: Subject[],
  onAdd: (r: Omit<Reminder, 'id' | 'active'>) => void,
  onDelete: (id: string) => void,
  onToggle: (id: string) => void
}) => {
  const [selectedSubject, setSelectedSubject] = useState(subjects[0].id);
  const [selectedTime, setSelectedTime] = useState('09:00');

  const handleAdd = () => {
    onAdd({ subjectId: selectedSubject, time: selectedTime });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-8 pb-10"
    >
      <section>
        <h1 className="font-lexend font-bold text-3xl text-primary">Lembretes de Estudo</h1>
        <p className="text-slate-500 text-sm mt-1">Defina alertas diários para não esquecer suas matérias.</p>
      </section>

      <section className="bg-card-bg p-6 rounded-3xl border border-card-border shadow-sm space-y-4 transition-colors">
        <h3 className="font-bold text-primary">Adicionar Novo Lembrete</h3>
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Matéria</label>
            <select 
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-card-border rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary/20 appearance-none font-semibold text-primary transition-colors"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Horário</label>
            <input 
              type="time" 
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-card-border rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary/20 font-semibold text-primary transition-colors"
            />
          </div>
          <button 
            onClick={handleAdd}
            className="w-full bg-primary text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            Adicionar Lembrete
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="font-bold text-slate-400 uppercase tracking-widest text-xs">Lembretes Ativos</h3>
        <div className="space-y-3">
          {reminders.length === 0 ? (
            <div className="text-center py-10 bg-card-bg rounded-3xl border border-dashed border-card-border transition-colors">
              <Bell className="w-10 h-10 text-slate-200 dark:text-slate-800 mx-auto mb-2" />
              <p className="text-slate-400 dark:text-slate-500 text-sm">Nenhum lembrete definido ainda.</p>
            </div>
          ) : (
            reminders.map(r => (
              <div key={r.id} className="bg-card-bg p-4 rounded-2xl border border-card-border flex items-center justify-between shadow-sm transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-primary transition-colors">
                    <Bell className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary">{subjects.find(s => s.id === r.subjectId)?.name}</h4>
                    <p className="text-sm font-semibold text-slate-400 dark:text-slate-500">{r.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => onToggle(r.id)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${r.active ? 'bg-secondary' : 'bg-slate-200 dark:bg-slate-800'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${r.active ? 'left-7' : 'left-1'}`} />
                  </button>
                  <button 
                    onClick={() => onDelete(r.id)}
                    className="p-2 text-red-100 hover:text-red-500 transition-colors"
                  >
                    <LogOut className="w-5 h-5 rotate-180" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </motion.div>
  );
};

const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError('Configuração do Supabase ausente.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || 'Erro durante a autenticação.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!supabase) {
      setError('Configuração do Supabase ausente.');
      return;
    }
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Erro no login com Google.');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[70vh] px-4"
    >
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="bg-primary/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Scale className="w-10 h-10 text-primary" />
          </div>
          <h1 className="font-lexend font-bold text-3xl text-primary">
            {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
          </h1>
          <p className="text-slate-500 text-sm">
            {isLogin ? 'Entre para continuar seus estudos.' : 'Comece sua jornada de aprendizado hoje.'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-500 text-xs p-3 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase">Nome Completo</label>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Seu nome"
                className="w-full bg-card-bg border border-card-border rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-sans"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">E-mail</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="seu@email.com"
              className="w-full bg-card-bg border border-card-border rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-sans"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Senha</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full bg-card-bg border border-card-border rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-sans"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-primary/20 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Cadastrar')}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-bg-main px-2 text-slate-400">Ou continue com</span>
          </div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="w-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-card-border font-bold py-4 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-transform"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
          Login com Google
        </button>

        <p className="text-center text-sm text-slate-500">
          {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="ml-2 text-primary font-bold hover:underline"
          >
            {isLogin ? 'Cadastre-se' : 'Faça login'}
          </button>
        </p>
        <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-6">
          Ano atual 2026
        </p>
      </div>
    </motion.div>
  );
};

const EditProfileScreen = ({ user, onBack }: { user: SupabaseUser | null, onBack: () => void }) => {
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          avatar_url: avatarUrl
        }
      });

      if (error) throw error;
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erro ao atualizar perfil.' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamanho (opcional, mas bom para evitar estouro de metadados se for muito grande)
      if (file.size > 200000) { // ~200KB
        setMessage({ type: 'error', text: 'A imagem deve ter menos de 200KB.' });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-8 pb-10"
    >
      <div className="flex flex-col items-center space-y-6">
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-card-bg shadow-xl">
            <img 
              src={avatarUrl || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop"} 
              className="w-full h-full object-cover"
              alt="Avatar Preview"
            />
          </div>
          <label className="absolute bottom-0 right-0 bg-primary text-white p-2.5 rounded-full cursor-pointer shadow-lg hover:scale-110 active:scale-95 transition-transform border-4 border-card-bg">
            <Camera className="w-5 h-5 text-white" />
            <input type="file" className="hidden" accept="image/png, image/jpeg, image/jpg" onChange={handleFileChange} />
          </label>
        </div>

        <form onSubmit={handleUpdate} className="w-full space-y-4">
          <h2 className="font-lexend font-bold text-xl text-primary text-center">Configurações de Perfil</h2>
          
          {message && (
            <div className={`p-3 rounded-xl text-xs font-bold border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-500 border-red-100'}`}>
              {message.text}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Nome Completo</label>
            <input 
              type="text" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-card-bg border border-card-border rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-sans"
              placeholder="Seu nome"
            />
          </div>

          <div className="pt-4 space-y-3">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-primary/20 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
            <button 
              type="button"
              onClick={onBack}
              className="w-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold py-4 rounded-2xl active:scale-95 transition-all"
            >
              Voltar
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

const ConfigErrorScreen = () => (
  <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center space-y-6">
    <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-3xl">
      <Settings className="w-12 h-12 text-red-500 mx-auto" />
    </div>
    <div className="space-y-2">
      <h1 className="font-lexend font-bold text-2xl text-primary">Configuração Necessária</h1>
      <p className="text-slate-500 text-sm max-w-xs mx-auto">
        As credenciais do Supabase não foram encontradas. Por favor, adicione as chaves no painel lateral de Secrets.
      </p>
    </div>
    <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl w-full max-w-sm text-left font-mono text-xs space-y-2">
      <p className="font-bold text-slate-400 uppercase">Variáveis necessárias:</p>
      <ul className="list-disc list-inside text-slate-600 dark:text-slate-300">
        <li>VITE_SUPABASE_URL</li>
        <li>VITE_SUPABASE_ANON_KEY</li>
      </ul>
    </div>
  </div>
);

const ProfileStat = ({ value, label }: { value: string, label: string }) => (
  <div className="bg-white p-5 rounded-[2rem] shadow-xl shadow-primary/5 border border-secondary/10 text-center transition-all hover:scale-105 group">
    <p className="text-2xl text-primary mb-1">{value}</p>
    <p className="text-[9px] font-black text-secondary dark:text-secondary uppercase tracking-[0.2em]">{label}</p>
  </div>
);

const Achievement = ({ badge, label, color }: { badge: React.ReactNode, label: string, color: string }) => (
  <div className="flex-shrink-0 w-24 flex flex-col items-center gap-3 group">
    <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-lg border-2 transition-transform group-hover:scale-110 group-hover:-rotate-3 ${color}`}>
      {badge}
    </div>
    <span className="text-center text-[9px] font-black text-slate-500 tracking-tighter uppercase leading-tight">{label}</span>
  </div>
);

const SettingsAction = ({ icon, label, danger = false, onClick }: { icon: React.ReactNode, label: string, danger?: boolean, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between p-6 bg-white rounded-[2rem] shadow-lg shadow-primary/5 border border-secondary/5 active:scale-[0.98] transition-all group ${danger ? 'text-red-500 hover:bg-red-50 hover:border-red-100' : 'text-slate-600 hover:border-secondary hover:bg-secondary/5'}`}
  >
    <div className="flex items-center gap-4">
      <div className={`p-2.5 rounded-2xl transition-colors ${danger ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-400 group-hover:text-secondary'}`}>
        {icon}
      </div>
      <span className="font-bold text-sm tracking-tight">{label}</span>
    </div>
    {!danger && <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-secondary translate-x-0 group-hover:translate-x-1 transition-all" />}
  </button>
);

// --- Main App ---

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [screen, setScreen] = useState<Screen>('home');
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) setScreen('auth');
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setScreen('home');
      } else {
        setScreen('auth');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const addReminder = (r: Omit<Reminder, 'id' | 'active'>) => {
    const newReminder: Reminder = {
      ...r,
      id: Math.random().toString(36).substr(2, 9),
      active: true
    };
    setReminders([...reminders, newReminder]);
  };

  const deleteReminder = (id: string) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  const toggleReminder = (id: string) => {
    setReminders(reminders.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  const renderScreen = () => {
    if (!supabase) {
      return <ConfigErrorScreen />;
    }

    if (!session && screen !== 'auth') {
      return <AuthScreen />;
    }

    switch (screen) {
      case 'auth': return <AuthScreen />;
      case 'home': return <HomeScreen onNavigate={setScreen} user={session?.user || null} />;
      case 'explore': return <ExploreScreen onNavigate={setScreen} />;
      case 'quiz': 
        // Recuperar questões da disciplina selecionada (ou padrão se não houver)
        const selectedSubjectId = localStorage.getItem('selectedSubject') || 'const';
        const questions = LAW_QUESTIONS[selectedSubjectId] || LAW_QUESTIONS['const'];
        return <QuizScreen questions={questions} onComplete={() => setScreen('results')} />;
      case 'results': return <ResultsScreen onNavigate={setScreen} />;
      case 'profile': return <ProfileScreen onNavigate={setScreen} user={session?.user || null} />;
      case 'edit-profile': return <EditProfileScreen user={session?.user || null} onBack={() => setScreen('profile')} />;
      case 'reminders': return (
        <RemindersScreen 
          reminders={reminders} 
          subjects={SUBJECTS} 
          onAdd={addReminder} 
          onDelete={deleteReminder}
          onToggle={toggleReminder}
        />
      );
      default: return <HomeScreen onNavigate={setScreen} user={session?.user || null} />;
    }
  };

  const getTitle = () => {
    if (screen === 'auth') return "Vade Mecum Digital";
    if (screen === 'quiz') {
      const subId = localStorage.getItem('selectedSubject') || 'const';
      const subName = SUBJECTS.find(s => s.id === subId)?.name || "Simulado";
      return `Simulado: ${subName}`;
    }
    if (screen === 'results') return "Desempenho Jurídico";
    if (screen === 'profile') return "Perfil do Advogado";
    if (screen === 'edit-profile') return "Dados da OAB";
    if (screen === 'reminders') return "Agenda de Audiências";
    return "Direito em Foco";
  };

  return (
    <div className="min-h-screen pb-24 transition-colors">
      <TopBar 
        title={getTitle()} 
        showBack={screen === 'quiz' || screen === 'results' || screen === 'reminders' || screen === 'edit-profile'} 
        onBack={() => {
          if (screen === 'reminders' || screen === 'edit-profile') setScreen('profile');
          else setScreen('explore');
        }} 
        showTimer={screen === 'quiz'}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        user={session?.user || null}
        onNavigate={setScreen}
      />
      <main className="max-w-lg mx-auto pt-24 px-4">
        {renderScreen()}
      </main>
      
      {session && screen !== 'quiz' && screen !== 'results' && screen !== 'auth' && (
        <BottomNav active={screen} onChange={setScreen} />
      )}
    </div>
  );
}
