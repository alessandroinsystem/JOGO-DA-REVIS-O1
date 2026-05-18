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
  Trash2,
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
  RefreshCw,
  FileDown,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---

type Screen = 'home' | 'explore' | 'quiz' | 'results' | 'profile' | 'reminders' | 'auth' | 'edit-profile' | 'vademecum' | 'ultima-prova';

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
  { id: 'vademecum', name: 'Vade Mecum', description: 'Consulta rápida às principais leis e códigos.', quizzes: 0, level: 'Beginner', icon: <Gavel className="w-8 h-8" />, color: 'bg-stone-100 text-stone-900' },
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
    },
    {
      id: 6,
      subject: "Direito Constitucional",
      topic: "Controle de Constitucionalidade",
      question: "Qual o instrumento utilizado para questionar a constitucionalidade de lei municipal em face da Constituição Federal perante o STF?",
      options: ["ADI", "ADC", "ADPF", "Mandado de Injunção"],
      correct: 2,
      image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=400&auto=format&fit=crop"
    },
    {
       id: 7,
       subject: "Direito Constitucional",
       topic: "Poder Executivo",
       question: "O Vice-Presidente da República substituirá o Presidente no caso de impedimento e suceder-lhe-á no de vacância. Se ambos estiverem impedidos, qual a ordem sucessória correta?",
       options: ["Presidente da Câmara, Presidente do Senado, Presidente do STF", "Presidente do Senado, Presidente da Câmara, Presidente do STF", "Presidente do STF, Presidente do Senado, Presidente da Câmara", "Ministro da Justiça, Presidente do Congresso"],
       correct: 0,
       image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?q=80&w=400&auto=format&fit=crop"
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
      question: "A legítima dos herdeiros necessários corresponde a qual fraction da herança?",
      options: ["Um terço", "Metade", "Dois terços", "Totalidade"],
      correct: 1,
      image: "https://images.unsplash.com/photo-1518112391135-e875c7dd8459?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: 6,
      subject: "Direito Civil",
      topic: "Empresa",
      question: "O prazo para o consumidor reclamar de vícios aparentes em produtos duráveis é de:",
      options: ["30 dias", "60 dias", "90 dias", "5 dias"],
      correct: 2,
      image: "https://images.unsplash.com/photo-1556742049-l1256e33997c?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: 7,
      subject: "Direito Civil",
      topic: "Personalidade",
      question: "A existência da pessoa natural termina com a:",
      options: ["Morte", "Sentença de interdição", "Nascimento com vida", "Emancipação"],
      correct: 0,
      image: "https://images.unsplash.com/photo-1505664194762-85b1758c5f40?q=80&w=400&auto=format&fit=crop"
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
    },
    {
      id: 6,
      subject: "Direito Penal",
      topic: "Prescrição",
      question: "A prescrição, antes de transitar em julgado a sentença final, salvo o disposto no § 1º do art. 110 do CP, regula-se pelo máximo da pena privativa de liberdade cominada ao crime, verificando-se em vinte anos, se o máximo da pena é superior a:",
      options: ["8 anos", "10 anos", "12 anos", "15 anos"],
      correct: 2,
      image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: 7,
      subject: "Direito Penal",
      topic: "Dolo",
      question: "Diz-se o crime doloso, quando o agente quis o resultado ou:",
      options: ["Agiu com imprudência", "Assumiu o risco de produzi-lo", "Foi negligente", "Cometeu erro de proibição"],
      correct: 1,
      image: "https://images.unsplash.com/photo-1507567784013-138350616149?q=80&w=400&auto=format&fit=crop"
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
    },
    {
      id: 6,
      subject: "Direito Administrativo",
      topic: "Desapropriação",
      question: "A desapropriação por necessidade ou utilidade pública, ou por interesse social, dar-se-á mediante justa e prévia indenização em:",
      options: ["Dinheiro", "Títulos da dívida pública", "Imóveis permutados", "Ações de empresas estatais"],
      correct: 0,
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: 7,
      subject: "Direito Administrativo",
      topic: "Agentes Públicos",
      question: "A investidura em cargo ou emprego público depende de aprovação prévia em concurso público, ressalvadas as nomeações para cargo em comissão, que são de:",
      options: ["Livre nomeação e livre exoneração", "Mandato de 4 anos", "Exclusividade de servidores de carreira", "Vitalícios"],
      correct: 0,
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
    },
    {
      id: 6,
      subject: "Direito do Trabalho",
      topic: "Aviso Prévio",
      question: "O aviso prévio proporcional ao tempo de serviço é de no mínimo 30 dias, acrescidos de quantos dias por ano de serviço prestado na mesma empresa?",
      options: ["2 dias", "3 dias", "5 dias", "1 dia"],
      correct: 1,
      image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: 7,
      subject: "Direito do Trabalho",
      topic: "Adicionais",
      question: "O adicional de periculosidade, pago a quem trabalha em contato com inflamáveis ou explosivos, é de quanto sobre o salário-base?",
      options: ["10%", "20%", "30%", "40%"],
      correct: 2,
      image: "https://images.unsplash.com/photo-1513828583688-c52646db42da?q=80&w=400&auto=format&fit=crop"
    }
  ],
  tributario: [
    {
      id: 1,
      subject: "Direito Tributário",
      topic: "Sistema Tributário",
      question: "Qual tributo tem como fato gerador a prestação de um serviço público específico e divisível?",
      options: ["Imposto", "Taxa", "Contribuição de Melhoria", "Empréstimo Compulsório"],
      correct: 1,
      image: "https://images.unsplash.com/photo-1554224155-1697467276d4?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: 2,
      subject: "Direito Tributário",
      topic: "IPI",
      question: "O Imposto sobre Produtos Industrializados (IPI) é regido pelo princípio da:",
      options: ["Seletividade", "Cumulatividade", "Anterioridade Nonahesimal apenas", "Irretroatividade apenas"],
      correct: 0,
      image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: 3,
      subject: "Direito Tributário",
      topic: "Competência",
      question: "A competência para instituir o ITCMD (Imposto sobre Transmissão Causa Mortis e Doação) pertence aos:",
      options: ["Municípios", "Distrito Federal apenas", "Estados e Distrito Federal", "União"],
      correct: 2,
      image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=400&auto=format&fit=crop"
    },
    {
       id: 4,
       subject: "Direito Tributário",
       topic: "Lançamento",
       question: "O lançamento tributário que ocorre sem qualquer colaboração do sujeito passivo é o lançamento:",
       options: ["Por homologação", "Por declaração", "De ofício", "Misto"],
       correct: 2,
       image: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: 5,
      subject: "Direito Tributário",
      topic: "Crédito Tributário",
      question: "Suspendem a exigibilidade do crédito tributário, EXCETO:",
      options: ["Moratória", "Depósito do montante integral", "Parcelamento", "Pagamento"],
      correct: 3,
      image: "https://images.unsplash.com/photo-1554224155-1697467276d4?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: 6,
      subject: "Direito Tributário",
      topic: "Imunidade",
      question: "Instituições de educação e de assistência social, sem fins lucrativos, gozam de imunidade tributária relativa a quais impostos?",
      options: ["IPVA", "IPTU e IR sobre seu patrimônio, renda ou serviços", "Apenas Imposto de Renda", "Todos os impostos nacionais"],
      correct: 1,
      image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: 7,
      subject: "Direito Tributário",
      topic: "Princípios",
      question: "O princípio que veda a cobrança de tributo no mesmo exercício financeiro em que haja sido publicada a lei que os instituiu ou aumentou é o da:",
      options: ["Capacidade contributiva", "Legalidade", "Anterioridade", "Irretroatividade"],
      correct: 2,
      image: "https://images.unsplash.com/photo-1554224155-1697467276d4?q=80&w=400&auto=format&fit=crop"
    }
  ],
  etica: [
    {
      id: 1,
      subject: "Ética Profissional",
      topic: "Deveres",
      question: "O sigilo profissional do advogado é:",
      options: ["Relativo", "Inviolável, salvo ordem judicial", "Inviolável, com exceções de grave risco à vida ou honra", "Opcional"],
      correct: 2,
      image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: 2,
      subject: "Ética Profissional",
      topic: "Impedimentos",
      question: "São impedidos de exercer a advocacia os ocupantes de cargos ou funções que tenham competência de:",
      options: ["Lançamento de tributos", "Expedição de alvarás", "Julgamento em tribunais administrativos", "Todas as anteriores"],
      correct: 3,
      image: "https://images.unsplash.com/photo-1453941403244-67253457053e?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: 3,
      subject: "Ética Profissional",
      topic: "Advocacia Pública",
      question: "Os integrantes do Ministério Público e da Magistratura podem exercer a advocacia?",
      options: ["Sim, desde que licenciados", "Não, é atividade incompatível", "Sim, apenas pro bono", "Apenas após 5 anos de carreira"],
      correct: 1,
      image: "https://images.unsplash.com/photo-1589829500361-90407746522c?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: 4,
      subject: "Ética Profissional",
      topic: "Honorários",
      question: "Na falta de estipulação ou de acordo, os honorários são fixados por:",
      options: ["OAB", "Juiz, por arbitramento judicial", "Ministério Público", "Vontade exclusiva do advogado"],
      correct: 1,
      image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: 5,
      subject: "Ética Profissional",
      topic: "Publicidade",
      question: "A publicidade profissional do advogado tem caráter meramente informativo e deve primar pela:",
      options: ["Ostentação", "Captação de clientela", "Moderação e discrição", "Divulgação de preços"],
      correct: 2,
      image: "https://images.unsplash.com/photo-1555543962-a2267746522c?q=80&w=400&auto=format&fit=crop"
    }
  ],
  empresarial: [
    {
      id: 1,
      subject: "Direito Empresarial",
      topic: "Sociedades",
      question: "Na sociedade limitada, a responsabilidade de cada sócio é restringida ao valor de suas quotas, mas todos respondem solidariamente pela:",
      options: ["Gestão da empresa", "Integralização do capital social", "Dívidas trabalhistas apenas", "Prejuízos fiscais"],
      correct: 1,
      image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: 2,
      subject: "Direito Empresarial",
      topic: "Títulos de Crédito",
      question: "A declaração cambial pela qual o sacado concorda em pagar a letra de câmbio é o:",
      options: ["Endosso", "Aval", "Aceite", "Quitação"],
      correct: 2,
      image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: 3,
      subject: "Direito Empresarial",
      topic: "Falência",
      question: "Na classificação dos créditos na falência, os créditos trabalhistas limitados a 150 salários mínimos são considerados:",
      options: ["Extraconcursais", "Privilegiados gerais", "Privilegiados especiais", "Quirografários"],
      correct: 1,
      image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: 4,
      subject: "Direito Empresarial",
      topic: "Estabelecimento",
      question: "O contrato que tem por objeto a alienação, o usufruto ou arrendamento do estabelecimento denomina-se:",
      options: ["Cessão de cotas", "Trespasse", "Franquia", "Comodato"],
      correct: 1,
      image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: 5,
      subject: "Direito Empresarial",
      topic: "Propriedade Industrial",
      question: "A patente de invenção vigorará pelo prazo de quantos anos a contar da data de depósito?",
      options: ["10 anos", "15 anos", "20 anos", "25 anos"],
      correct: 2,
      image: "https://images.unsplash.com/photo-1589829500361-90407746522c?q=80&w=400&auto=format&fit=crop"
    }
  ],
  ambiental: [
    {
      id: 1,
      subject: "Direito Ambiental",
      topic: "Princípios",
      question: "O princípio que obriga o poluidor a arcar com os custos da prevenção e reparação de danos é o:",
      options: ["Princípio da Prevenção", "Princípio do Poluidor-Pagador", "Princípio da Precaução", "Princípio do Usuário-Recebedor"],
      correct: 1,
      image: "https://images.unsplash.com/photo-1501854140801-50d01674aa3e?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: 2,
      subject: "Direito Ambiental",
      topic: "Licenciamento",
      question: "Quais são as três etapas sequenciais do licenciamento ambiental comum?",
      options: ["LP, LI e LO", "LA, LB e LC", "Prévia, Instalação e Reforma", "Avaliação, Autorização e Fiscalização"],
      correct: 0,
      image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: 3,
      subject: "Direito Ambiental",
      topic: "Responsabilidade",
      question: "A responsabilidade civil por danos ambientais é, via de regra:",
      options: ["Subjetiva", "Objetiva", "Inexistente", "Exclusiva do Estado"],
      correct: 1,
      image: "https://images.unsplash.com/photo-1518173946687-a4c8a9b746f5?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: 4,
      subject: "Direito Ambiental",
      topic: "Constituição",
      question: "Todos têm direito ao meio ambiente ecologicamente equilibrado, bem de uso comum do povo e essencial à sadia qualidade de vida. Este princípio está em qual artigo da CF?",
      options: ["Art. 5º", "Art. 170", "Art. 225", "Art. 231"],
      correct: 2,
      image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=400&auto=format&fit=crop"
    }
  ],
  eleitoral: [
    {
      id: 1,
      subject: "Direito Eleitoral",
      topic: "Capacidade Eleitoral",
      question: "O alistamento eleitoral e o voto são facultativos para:",
      options: ["Analfabetos", "Maiores de 70 anos", "Jovens entre 16 e 18 anos", "Todas as anteriores"],
      correct: 3,
      image: "https://images.unsplash.com/photo-1540910419892-4a39d2c3294c?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: 2,
      subject: "Direito Eleitoral",
      topic: "Elegibilidade",
      question: "São condições de elegibilidade para o cargo de Senador, entre outras, a idade mínima de:",
      options: ["21 anos", "30 anos", "35 anos", "18 anos"],
      correct: 2,
      image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: 3,
      subject: "Direito Eleitoral",
      topic: "Sistemas",
      question: "O sistema eleitoral utilizado para a eleição de Deputados Federais, Estaduais e Vereadores é o:",
      options: ["Majoritário", "Proporcional", "Distrital Puro", "Misto"],
      correct: 1,
      image: "https://images.unsplash.com/photo-1540910419892-4a39d2c3294c?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: 4,
      subject: "Direito Eleitoral",
      topic: "Domicílio",
      question: "Qual o prazo mínimo de domicílio eleitoral na circunscrição para ser candidato?",
      options: ["3 meses", "6 meses", "1 ano", "2 anos"],
      correct: 1,
      image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=400&auto=format&fit=crop"
    }
  ],
  consumidor: [
    {
      id: 1,
      subject: "Direito do Consumidor",
      topic: "Prazo de Arrependimento",
      question: "Nas compras fora do estabelecimento comercial (ex: internet), qual o prazo para o consumidor exercer o direito de arrependimento?",
      options: ["24 horas", "3 dias", "7 dias", "15 dias"],
      correct: 2,
      image: "https://images.unsplash.com/photo-1556742049-l1256e33997c?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: 2,
      subject: "Direito do Consumidor",
      topic: "Responsabilidade",
      question: "No Código de Defesa do Consumidor, a responsabilidade do fornecedor de serviços por defeitos na prestação é, via de regra:",
      options: ["Subjetiva", "Objetiva", "Exclusiva do preposto", "Inexistente"],
      correct: 1,
      image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: 3,
      subject: "Direito do Consumidor",
      topic: "Publicidade Enganosa",
      question: "A publicidade que induz o consumidor a se comportar de forma prejudicial ou perigosa à sua saúde ou segurança é considerada:",
      options: ["Publicidade abusiva", "Publicidade enganosa", "Publicidade simulada", "Publicidade comparativa"],
      correct: 0,
      image: "https://images.unsplash.com/photo-1556742049-l1256e33997c?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: 4,
      subject: "Direito do Consumidor",
      topic: "Inversão do Ônus",
      question: "A inversão do ônus da prova no CDC fica a critério do juiz quando for:",
      options: ["Consumidor idoso", "Verossímil a alegação ou o consumidor for hipossuficiente", "Sempre que houver ação judicial", "Apenas em causas superiores a 40 salários"],
      correct: 1,
      image: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=400&auto=format&fit=crop"
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
  <header className="bg-card-bg/70 backdrop-blur-2xl border-b border-primary/5 fixed top-0 w-full z-50 transition-all">
    <div className="flex justify-between items-center px-6 h-20 max-w-7xl mx-auto">
      <div className="flex items-center gap-4">
        <div className="md:hidden">
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
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop";
                }}
              />
            </div>
          )}
        </div>
        {showBack && (
          <button onClick={onBack} className="hidden md:flex p-2.5 -ml-3 rounded-2xl hover:bg-secondary/10 transition-colors active:scale-90 text-primary items-center gap-2">
            <ArrowLeft className="w-6 h-6" />
            <span className="text-sm font-bold">Voltar</span>
          </button>
        )}
        <span className="font-display font-bold text-lg text-primary tracking-tight truncate max-w-[180px] md:max-w-none ml-2 md:ml-0">{title}</span>
      </div>
      
      <div className="flex items-center gap-3">
        <button 
          onClick={onToggleTheme}
          className="p-3 rounded-full bg-card-bg shadow-md text-secondary hover:bg-secondary/5 transition-all active:scale-90 border border-primary/10"
        >
          {isDarkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </div>
  </header>
);


const BottomNav = ({ active, onChange }: { active: Screen, onChange: (s: Screen) => void }) => (
  <nav className="md:hidden bg-card-bg/80 backdrop-blur-2xl fixed bottom-0 w-full border-t border-primary/5 shadow-[0_-10px_40px_rgba(26,35,126,0.08)] z-50 transition-all">
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
        icon={<BookOpen className="w-6 h-6" />} 
        label="Leis" 
        active={active === 'vademecum'} 
        onClick={() => onChange('vademecum')} 
      />
      <NavItem 
        icon={<FileText className="w-6 h-6" />} 
        label="Prova" 
        active={active === 'ultima-prova'} 
        onClick={() => onChange('ultima-prova')} 
      />
      <NavItem 
        icon={<User className="w-6 h-6" />} 
        label="Perfil" 
        active={active === 'profile' || active === 'edit-profile' || active === 'reminders'} 
        onClick={() => onChange('profile')} 
      />
    </div>
  </nav>
);

const Sidebar = ({ active, onChange, user }: { active: Screen, onChange: (s: Screen) => void, user: SupabaseUser | null }) => (
  <aside className="hidden md:flex flex-col w-64 fixed left-0 top-0 h-full bg-card-bg border-r border-primary/5 pt-28 px-6 z-40">
    <div className="flex flex-col gap-2 flex-grow">
      <SidebarItem 
        icon={<Home className="w-5 h-5" />} 
        label="Início" 
        active={active === 'home'} 
        onClick={() => onChange('home')} 
      />
      <SidebarItem 
        icon={<Search className="w-5 h-5" />} 
        label="Explorar Doutrinas" 
        active={active === 'explore' || active === 'quiz' || active === 'results'} 
        onClick={() => onChange('explore')} 
      />
      <SidebarItem 
        icon={<Bell className="w-5 h-5" />} 
        label="Agenda" 
        active={active === 'reminders'} 
        onClick={() => onChange('reminders')} 
      />
      <SidebarItem 
        icon={<Gavel className="w-5 h-5" />} 
        label="Vade Mecum" 
        active={active === 'vademecum'} 
        onClick={() => onChange('vademecum')} 
      />
      <SidebarItem 
        icon={<FileText className="w-5 h-5" />} 
        label="Última Prova" 
        active={active === 'ultima-prova'} 
        onClick={() => onChange('ultima-prova')} 
      />
      <SidebarItem 
        icon={<User className="w-5 h-5" />} 
        label="Meu Perfil" 
        active={active === 'profile' || active === 'edit-profile'} 
        onClick={() => onChange('profile')} 
      />
    </div>
    
    {user && (
      <div className="mb-10 p-4 bg-primary/5 rounded-[2rem] border border-primary/5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
          <img 
            src={user.user_metadata?.avatar_url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop"} 
            alt="User" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="font-bold text-xs text-primary truncate">{user.user_metadata?.full_name || 'Alessandro'}</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">OAB Ativa</p>
        </div>
      </div>
    )}
  </aside>
);

const SidebarItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-bold text-sm ${active ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' : 'text-slate-500 hover:bg-primary/5 hover:text-primary'}`}
  >
    {icon}
    <span>{label}</span>
  </button>
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

const HomeScreen = ({ onNavigate, user, simulations = 0 }: { onNavigate: (s: Screen) => void, user: SupabaseUser | null, simulations?: number }) => (
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

    <section className="bg-card-bg/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-secondary/20 shadow-2xl shadow-primary/5 space-y-6 relative overflow-hidden group md:grid md:grid-cols-2 md:gap-10 md:space-y-0">
      <div className="absolute top-0 right-0 w-40 h-40 bg-secondary/5 rounded-full -mr-20 -mt-20 blur-3xl transition-transform group-hover:scale-120" />
      
      <div className="space-y-6 flex flex-col justify-center">
        <div className="flex justify-between items-center relative z-10">
          <h3 className="font-lexend font-extrabold text-[10px] text-primary uppercase tracking-[0.2em]">Metas da OAB</h3>
          <span className="text-[10px] font-black text-secondary bg-secondary/10 px-3 py-1.5 rounded-xl">{simulations > 0 ? (simulations * 10).toString().substring(0, 2) : '0'}% Concluído</span>
        </div>

        <div className="h-3 w-full bg-slate-100/50 rounded-full overflow-hidden relative z-10 border border-white">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: simulations > 0 ? `${Math.min(simulations * 10, 100)}%` : '0%' }}
            className="h-full bg-gradient-to-r from-secondary via-secondary/80 to-secondary rounded-full shadow-[0_0_15px_rgba(197,160,89,0.3)]"
          />
        </div>

        <div className="flex gap-5 relative z-10">
          <div className="flex items-center gap-3 bg-card-bg/50 p-2 pr-4 rounded-2xl border border-white/50">
            <div className="p-2 bg-secondary/10 rounded-xl">
              <CircleCheck className="w-4 h-4 text-secondary" />
            </div>
            <span className="text-[11px] font-black text-primary uppercase tracking-tighter">{simulations} Simulados</span>
          </div>
          <div className="flex items-center gap-3 bg-card-bg/50 p-2 pr-4 rounded-2xl border border-white/50">
            <div className="p-2 bg-primary/5 rounded-xl">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <span className="text-[11px] font-black text-primary uppercase tracking-tighter">0 Súmulas</span>
          </div>
        </div>
      </div>

      <div className="hidden md:flex items-center justify-center relative z-10 border-l border-primary/5 pl-10">
        <div className="text-center space-y-2">
          <div className="text-4xl font-display font-bold text-primary">1.240 XP</div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Até o próximo nível</p>
          <div className="flex justify-center -space-x-3 mt-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-100 shadow-lg overflow-hidden">
                <img src={`https://i.pravatar.cc/150?u=${i}`} alt="Avatar" referrerPolicy="no-referrer" />
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-medium">Junte-se a outros 4.500 estudantes esta semana</p>
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
        referrerPolicy="no-referrer"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = "https://images.unsplash.com/photo-1521791136064-7986c2923216?q=80&w=600&auto=format&fit=crop";
        }}
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
             <button className="bg-card-bg text-primary px-5 py-2.5 rounded-2xl font-bold text-xs shadow-xl flex items-center gap-2 hover:bg-secondary hover:text-primary-container transition-colors">
                Retomar Estudo <Play className="w-3 h-3 fill-current" />
             </button>
          </div>
        </div>
      </div>
    </section>

    <section className="bg-gradient-to-br from-stone-50 to-stone-100 dark:from-stone-900 dark:to-stone-950 p-8 rounded-[2.5rem] border border-stone-200 dark:border-stone-800 shadow-xl shadow-stone-200/50 dark:shadow-none flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(197,160,89,0.05),transparent)] pointer-events-none" />
      <div className="w-24 h-24 md:w-32 md:h-32 bg-stone-200 dark:bg-stone-800 rounded-[2rem] flex items-center justify-center text-stone-600 dark:text-stone-300 shadow-inner group-hover:rotate-3 transition-transform flex-shrink-0">
        <Gavel className="w-12 h-12 md:w-16 md:h-16" />
      </div>
      <div className="flex-1 text-center md:text-left space-y-4">
        <div>
          <span className="text-[10px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-[0.2em] mb-1 block">BIBLIOTECA JURÍDICA</span>
          <h3 className="text-2xl font-display font-bold text-primary">Vade Mecum Digital</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-md italic">"A lei é a inteligência pública." — Acesse todos os códigos e leis sem carregar peso.</p>
        </div>
        <button 
          onClick={() => onNavigate('vademecum')}
          className="bg-primary text-white px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-secondary hover:text-white transition-all flex items-center justify-center md:justify-start gap-3 active:scale-95"
        >
          Abrir Vade Mecum <BookOpen className="w-4 h-4" />
        </button>
      </div>
    </section>

    <section className="space-y-4">
      <h3 className="text-2xl text-primary">Recomendado</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <RecommendationCard 
          image="https://images.unsplash.com/photo-1505664194779-8beaceb93744?q=80&w=600&auto=format&fit=crop"
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
    className="w-full bg-card-bg border border-secondary/10 rounded-3xl overflow-hidden shadow-lg shadow-primary/5 hover:shadow-primary/10 transition-all cursor-pointer group"
  >
    <div className="h-32 w-full overflow-hidden relative">
      <img 
        src={image} 
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
        alt={title}
        referrerPolicy="no-referrer" 
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=400&auto=format&fit=crop";
        }}
      />
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
    <div className="bg-card-bg p-3 rounded-2xl shadow-md text-primary transition-colors border border-primary/10">
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
          className="w-full bg-card-bg border-2 border-secondary/10 rounded-[2rem] py-5 pl-14 pr-6 outline-none focus:border-secondary transition-all font-sans shadow-xl shadow-primary/5 text-primary placeholder:text-slate-300 font-medium"
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
              className="grid md:grid-cols-2 gap-6"
            >
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-card-bg border border-secondary/10 p-5 rounded-3xl flex gap-5 shadow-lg shadow-primary/5 animate-pulse transition-colors">
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
              className="grid md:grid-cols-2 gap-6"
            >
              {displayedSubjects.map((sub, idx) => (
                <motion.div 
                  key={sub.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => startQuiz(sub.id)}
                  className="bg-card-bg border border-secondary/10 p-5 rounded-[2rem] flex gap-5 hover:border-secondary transition-all cursor-pointer shadow-lg shadow-primary/5 group active:scale-[0.98]"
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
                  className="md:col-span-2 w-full py-4 border-2 border-secondary/20 rounded-[2rem] text-secondary font-black text-xs uppercase tracking-widest hover:bg-secondary/5 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>Ver Mais Doutrinas <ChevronRight className="w-4 h-4" /></>
                  )}
                </motion.button>
              )}

              {filteredSubjects.length === 0 && (
                <div className="md:col-span-2 text-center py-20 space-y-4">
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
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://images.unsplash.com/photo-1521791136064-7986c2923216?q=80&w=800&auto=format&fit=crop";
            }}
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

const UltimaProvaScreen = () => {
  const fileUrl = "https://s.oab.org.br/arquivos/2025/08/fda2cc49-fbbd-4893-9b75-0f61c177cd5d.pdf";
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-6 pb-10 h-full flex flex-col"
    >
      <section>
        <h1 className="text-3xl font-display font-bold text-primary">Última Prova OAB</h1>
        <p className="text-slate-500 text-sm">Visualize o caderno de questões oficial do último exame unificado.</p>
      </section>

      <div className="flex-1 bg-card-bg rounded-[2.5rem] border border-secondary/10 shadow-2xl shadow-primary/5 overflow-hidden flex flex-col min-h-[600px]">
        <div className="p-4 bg-primary/5 border-b border-primary/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary/20 rounded-lg text-secondary">
              <FileDown className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Documento PDF Oficial</span>
          </div>
          <a 
            href={fileUrl} 
            download 
            target="_blank"
            className="px-4 py-2 bg-secondary text-white rounded-xl text-[10px] font-black uppercase tracking-tighter hover:bg-primary transition-colors flex items-center gap-2"
          >
            Baixar PDF <Download className="w-3 h-3" />
          </a>
        </div>
        
        <div className="flex-1 relative">
          <iframe 
            src={`https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`}
            className="w-full h-full border-none"
            title="Ultima Prova OAB"
          />
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-[2rem] border border-amber-200 dark:border-amber-800/50 flex gap-4 items-start">
        <div className="p-3 bg-amber-100 dark:bg-amber-800 rounded-2xl text-amber-600 dark:text-amber-400">
          <TrendingUp className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-bold text-amber-900 dark:text-amber-200">Dica de Estudo</h4>
          <p className="text-amber-800/70 dark:text-amber-400/70 text-sm mt-1 leading-relaxed">
            Resolver a prova mais recente é a melhor forma de entender o padrão atual da banca FGV. Cronometre seu tempo: você tem 5 horas para as 80 questões.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const VademecumScreen = () => {
  const laws = [
    { title: "Constituição Federal", year: "1988", excerpt: "Nós, representantes do povo brasileiro, reunidos em Assembleia Nacional Constituinte...", link: "https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm" },
    { title: "Código Civil", year: "2002", excerpt: "Art. 1º Toda pessoa é capaz de direitos e deveres na ordem civil.", link: "https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm" },
    { title: "Código Penal", year: "1940", excerpt: "Art. 1º - Não há crime sem lei anterior que o defina. Não há pena sem prévia cominação legal.", link: "https://www.planalto.gov.br/ccivil_03/decreto-lei/del2848compilado.htm" },
    { title: "CLT", year: "1943", excerpt: "Art. 1º Esta Consolidação estatui as normas que regulam as relações individuais e coletivas de trabalho...", link: "https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452.htm" },
    { title: "Código de Defesa do Consumidor", year: "1990", excerpt: "Art. 1° O presente código estabelece normas de proteção e defesa do consumidor...", link: "https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm" },
    { title: "Estatuto da OAB", year: "1994", excerpt: "Art. 1º São atividades privativas de advocacia: I - a postulação a qualquer órgão do Poder Judiciário...", link: "https://www.planalto.gov.br/ccivil_03/leis/l8906.htm" },
    { title: "Código de Processo Civil", year: "2015", excerpt: "Art. 1º O processo civil será ordenado, disciplinado e interpretado conforme os valores e os princípios fundamentais estabelecidos na Constituição...", link: "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm" },
    { title: "Código de Processo Penal", year: "1941", excerpt: "Art. 1º O processo penal reger-se-á, em todo o território brasileiro, por este Código...", link: "https://www.planalto.gov.br/ccivil_03/decreto-lei/del3689compilado.htm" },
  ];

  const [search, setSearch] = useState('');
  const filteredLaws = laws.filter(l => l.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-6 pb-10"
    >
      <section>
        <h1 className="text-3xl font-display font-bold text-primary">Vade Mecum Digital</h1>
        <p className="text-slate-500 text-sm">Consulte as principais leis brasileiras atualizadas em tempo real.</p>
      </section>

      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-secondary transition-colors" />
        <input 
          type="text" 
          placeholder="Pesquisar lei, código ou estatuto..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-card-bg border-2 border-secondary/10 rounded-[2rem] py-5 pl-14 pr-6 outline-none focus:border-secondary transition-all font-sans shadow-xl shadow-primary/5 text-primary placeholder:text-slate-300 font-medium"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredLaws.map((law, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-card-bg p-6 rounded-[2.5rem] border border-secondary/10 shadow-lg shadow-primary/5 hover:shadow-primary/10 transition-all group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-secondary/10 rounded-2xl text-secondary">
                  <Gavel className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black text-secondary/60 bg-secondary/5 px-2 py-1 rounded-lg uppercase tracking-widest">{law.year}</span>
              </div>
              <h3 className="font-display font-bold text-xl text-primary leading-tight">{law.title}</h3>
              <p className="text-slate-500 text-xs italic line-clamp-3 leading-relaxed">"{law.excerpt}"</p>
            </div>
            <a 
              href={law.link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="mt-6 w-full py-4 bg-primary/5 text-primary font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-secondary hover:text-white transition-all flex items-center justify-center gap-2 group/btn active:scale-95 shadow-inner"
            >
              Consultar Texto Integral <FileText className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
            </a>
          </motion.div>
        ))}
      </div>
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
          
          <div className="rounded-2xl overflow-hidden border border-card-border shadow-sm bg-card-bg transition-colors relative min-h-[192px] flex items-center justify-center">
            <img 
              src={question.image || "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=800&auto=format&fit=crop"} 
              className="w-full h-48 object-cover opacity-90 dark:opacity-75"
              alt="Contexto Jurídico"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://images.unsplash.com/photo-1521791136064-7986c2923216?q=80&w=800&auto=format&fit=crop";
              }}
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

      <section className="bg-card-bg p-8 rounded-[2.5rem] border border-secondary/10 shadow-xl shadow-primary/5 space-y-5">
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
          className="w-full bg-card-bg text-primary border-2 border-secondary/20 font-black text-xs uppercase tracking-widest py-5 rounded-[2rem] flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-secondary/5 hover:border-secondary transition-colors shadow-lg shadow-primary/5"
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
  <div className="bg-card-bg p-6 rounded-[2.5rem] border border-secondary/10 flex flex-col items-center justify-center text-center shadow-xl shadow-primary/5 transition-all hover:border-secondary/30 relative overflow-hidden group">
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
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('supabase.auth.token'); // Limpeza extra
      onNavigate('auth');
    } catch (err) {
      console.error('Logout error:', err);
      onNavigate('auth');
    }
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
            referrerPolicy="no-referrer"
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

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ProfileStat value="142" label="Simulados" />
        <ProfileStat value="88%" label="Precisão" />
        <ProfileStat value="12k" label="Pontos" />
        <ProfileStat value="Level 4" label="Graduação" />
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
                <img src={user?.user_metadata?.avatar_url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop"} alt="Você" referrerPolicy="no-referrer" />
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
                    <Trash2 className="w-5 h-5" />
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
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" referrerPolicy="no-referrer" />
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
        {/* Removed attribution footer */}
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
              referrerPolicy="no-referrer"
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
  <div className="bg-card-bg p-5 rounded-[2rem] shadow-xl shadow-primary/5 border border-secondary/10 text-center transition-all hover:scale-105 group">
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
    className={`w-full flex items-center justify-between p-6 bg-card-bg rounded-[2rem] shadow-lg shadow-primary/5 border border-secondary/5 active:scale-[0.98] transition-all group ${danger ? 'text-red-500 hover:bg-red-50 hover:border-red-100' : 'text-slate-600 hover:border-secondary hover:bg-secondary/5'}`}
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
  const [completedSimulations, setCompletedSimulations] = useState(0);

  useEffect(() => {
    // Carregar simulados concluídos do localStorage
    const saved = localStorage.getItem('completedSimulations');
    if (saved) setCompletedSimulations(parseInt(saved, 10));
  }, []);

  useEffect(() => {
    localStorage.setItem('completedSimulations', completedSimulations.toString());
  }, [completedSimulations]);

  useEffect(() => {
    if (!supabase) return;

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (!session) setScreen('auth');
      } catch (err) {
        console.error('Erro de conexão com Supabase:', err);
        // Se falhar o fetch inicial, provavelmente as chaves estão erradas
        setScreen('auth');
      }
    };

    checkSession();

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
      case 'home': return <HomeScreen onNavigate={setScreen} user={session?.user || null} simulations={completedSimulations} />;
      case 'explore': return <ExploreScreen onNavigate={setScreen} />;
      case 'quiz': 
        // Recuperar questões da disciplina selecionada (ou padrão se não houver)
        const selectedSubjectId = localStorage.getItem('selectedSubject') || 'const';
        const questions = LAW_QUESTIONS[selectedSubjectId] || LAW_QUESTIONS['const'];
        return (
          <QuizScreen 
            questions={questions} 
            onComplete={(score) => {
              setCompletedSimulations(prev => prev + 1);
              setScreen('results');
            }} 
          />
        );
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
      case 'vademecum': return <VademecumScreen />;
      case 'ultima-prova': return <UltimaProvaScreen />;
      default: return <HomeScreen onNavigate={setScreen} user={session?.user || null} simulations={completedSimulations} />;
    }
  };

  const getTitle = () => {
    if (screen === 'auth') return "Vade Mecum Digital";
    if (screen === 'vademecum') return "Vade Mecum Digital";
    if (screen === 'ultima-prova') return "Última Prova OAB";
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
    <div className="min-h-screen pb-24 md:pb-0 transition-colors bg-bg-main">
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
      
      {session && screen !== 'quiz' && screen !== 'auth' && (
        <Sidebar active={screen} onChange={setScreen} user={session?.user || null} />
      )}

      <main className={`max-w-7xl mx-auto pt-24 px-4 ${session && screen !== 'quiz' && screen !== 'auth' ? 'md:pl-72 md:pr-8' : ''}`}>
        <div className="max-w-4xl mx-auto py-6">
          {renderScreen()}
        </div>
      </main>
      
      {session && screen !== 'quiz' && screen !== 'results' && screen !== 'auth' && (
        <BottomNav active={screen} onChange={setScreen} />
      )}
    </div>
  );
}
