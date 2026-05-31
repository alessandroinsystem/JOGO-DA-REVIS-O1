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
  Download,
  Users,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---

// Definição dos tipos de telas válidos para controle de fluxo e navegação interna na aplicação SPA
type Screen = 'home' | 'explore' | 'quiz' | 'results' | 'profile' | 'reminders' | 'auth' | 'edit-profile' | 'vademecum' | 'ultima-prova';

// Interface TypeScript que define a estrutura de representação de uma Disciplina/Matéria do Direito
interface Subject {
  id: string;          // Identificador único curto da matéria (ex: 'const', 'civil')
  name: string;        // Título oficial da matéria exibido nas interfaces do app
  description: string; // Resumo abordando o objeto de estudo daquela matéria
  quizzes: number;     // Número total estimado de questões estruturadas para estudo
  level: 'Beginner' | 'Intermediate' | 'Advanced'; // Classificação de complexidade da matéria
  icon: React.ReactNode; // Componente React correspondente ao ícone visual da biblioteca Lucide React
  color: string;       // String contendo classes de estilização de cores de fundo e texto no Tailwind CSS
}

// Interface TypeScript que define o formato de dados de cada Lembrete de Estudo programado pelo aluno
interface Reminder {
  id: string;        // Identificador exclusivo alfa-numérico gerado dinamicamente
  subjectId: string; // ID da matéria associada ao horário de estudo configurado
  time: string;      // String representativa da hora e minuto configurada (formato HH:MM)
  active: boolean;   // Status boleano determinando se o lembrete está habilitado/ativo ou inativo
}

// --- Data ---

// Coleção selecionada de links de imagens profissionais de alta qualidade focadas no tema direito e justiça (Unsplash)
// Servem para enriquecer as capas e backgrounds dos cards de forma sofisticada e realista.
const LAW_IMAGES = [
  "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=600&auto=format&fit=crop", // Gavel Courtroom
  "https://images.unsplash.com/photo-1589244159943-460088ed5c92?q=80&w=600&auto=format&fit=crop", // Scales of Justice
  "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=600&auto=format&fit=crop", // Law book & gavel
  "https://images.unsplash.com/photo-1505664194762-85b1758c5f40?q=80&w=600&auto=format&fit=crop", // Antique legal book
  "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=600&auto=format&fit=crop", // Signing justice documents
  "https://images.unsplash.com/photo-1521791136064-7986c2923216?q=80&w=600&auto=format&fit=crop", // Business consulting
  "https://images.unsplash.com/photo-1447069387593-a5de0862481e?q=80&w=600&auto=format&fit=crop", // Library documents
  "https://images.unsplash.com/photo-1528747045269-390fe33c19f2?q=80&w=600&auto=format&fit=crop", // Legal books shelves
  "https://images.unsplash.com/photo-1505664063603-23e56228b368?q=80&w=600&auto=format&fit=crop", // Classic laws
  "https://images.unsplash.com/photo-1621574539437-4b7cb63120b8?q=80&w=600&auto=format&fit=crop"  // Court desk setup
];

// Função utilitária que seleciona uma imagem jurídica aleatória ou específica de nossa coleção de alta qualidade.
// @param index - Parâmetro opcional para buscar um índice sequencial estático de forma determinística
const getRandomLawImage = (index?: number) => {
  if (typeof index === 'number') {
    // Escolhe dinamicamente usando operador de resto da divisão para não estourar o tamanho do array
    return LAW_IMAGES[index % LAW_IMAGES.length];
  }
  // Retorna uma imagem randômica se nenhum índice for especificado
  return LAW_IMAGES[Math.floor(Math.random() * LAW_IMAGES.length)];
};

// Catálogo completo de Disciplinas/Matérias do Exame de Ordem (OAB) disponíveis no aplicativo.
// Cada elemento possui o identificador, nome exibido, descrição, nível e componentes visuais específicos.
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
  { id: 'int_privado', name: 'Direito Internacional Privado', description: 'Leis no espaço e jurisdição internacional.', quizzes: 52, level: 'Advanced', icon: <Scale className="w-8 h-8" />, color: 'bg-blue-50 text-blue-900' },
  { id: 'int_publico', name: 'Direito Internacional Público', description: 'Tratados e relações entre Estados.', quizzes: 48, level: 'Advanced', icon: <Scale className="w-8 h-8" />, color: 'bg-indigo-50 text-indigo-900' },
  { id: 'proc_civil', name: 'Direito Processual Civil', description: 'Procedimentos judiciais e recursos cíveis.', quizzes: 175, level: 'Intermediate', icon: <Gavel className="w-8 h-8" />, color: 'bg-emerald-50 text-emerald-900' },
  { id: 'proc_penal', name: 'Direito Processual Penal', description: 'Inquérito, ação penal e provas.', quizzes: 162, level: 'Intermediate', icon: <ShieldAlert className="w-8 h-8" />, color: 'bg-red-50 text-red-900' },
  { id: 'hermeneutica', name: 'Hermenêutica Jurídica', description: 'Interpretação e aplicação das normas.', quizzes: 34, level: 'Advanced', icon: <Brain className="w-8 h-8" />, color: 'bg-purple-50 text-purple-900' },
  { id: 'previdencia', name: 'Direito Previdenciário', description: 'Benefícios e custeio da Seguridade Social.', quizzes: 88, level: 'Intermediate', icon: <FileText className="w-8 h-8" />, color: 'bg-amber-50 text-amber-900' },
  { id: 'proc_penal_militar', name: 'Proc. Penal Militar', description: 'Justiça militar e crimes militares.', quizzes: 22, level: 'Advanced', icon: <ShieldAlert className="w-8 h-8" />, color: 'bg-slate-50 text-slate-900' },
  { id: 'direitos_humanos', name: 'Direitos Humanos', description: 'Dignidade humana e proteção internacional.', quizzes: 112, level: 'Beginner', icon: <Star className="w-8 h-8" />, color: 'bg-yellow-50 text-yellow-900' },
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
  int_privado: [
    {
      id: 1,
      subject: "Direito Internacional Privado",
      topic: "LINDB",
      question: "Para qualificar os bens e regular as relações a eles concernentes, aplica-se a lei do país em que:",
      options: ["Eles estiverem situados", "O proprietário residir", "O contrato foi assinado", "A ação for proposta"],
      correct: 0,
      image: "https://images.unsplash.com/photo-1521791136064-7986c2923216?q=80&w=400&auto=format&fit=crop"
    }
  ],
  int_publico: [
    {
      id: 1,
      subject: "Direito Internacional Público",
      topic: "Tratados",
      question: "O ato unilateral pelo qual um Estado indica seu consentimento em vincular-se a um tratado, após a assinatura, denomina-se:",
      options: ["Adesão", "Ratificação", "Promulgação", "Reserva"],
      correct: 1,
      image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?q=80&w=400&auto=format&fit=crop"
    }
  ],
  proc_civil: [
    {
      id: 1,
      subject: "Direito Processual Civil",
      topic: "Prazos",
      question: "Na contagem de prazo em dias, estabelecido por lei ou pelo juiz, computar-se-ão apenas os dias:",
      options: ["Corridos", "Úteis", "De expediente bancário", "De plantão judiciário"],
      correct: 1,
      image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=400&auto=format&fit=crop"
    }
  ],
  proc_penal: [
    {
      id: 1,
      subject: "Direito Processual Penal",
      topic: "Inquérito",
      question: "O inquérito policial é um procedimento administrativo:",
      options: ["Judicial e obrigatório", "Inquisitivo e facultativo", "Público e contraditório", "Sempre presidido por juiz"],
      correct: 1,
      image: "https://images.unsplash.com/photo-1453941403244-67253457053e?q=80&w=400&auto=format&fit=crop"
    }
  ],
  hermeneutica: [
    {
      id: 1,
      subject: "Hermenêutica Jurídica",
      topic: "Interpretação",
      question: "A interpretação que busca o sentido da norma através da análise da evolução histórica e social é a:",
      options: ["Gramatical", "Sistemática", "Teleológica ou Sociológica", "Histórica"],
      correct: 2,
      image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=400&auto=format&fit=crop"
    }
  ],
  previdencia: [
    {
      id: 1,
      subject: "Direito Previdenciário",
      topic: "Benefícios",
      question: "O auxílio-reclusão é devido aos dependentes do segurado de:",
      options: ["Qualquer renda", "Baixa renda", "Mais de 10 anos de contribuição", "Renda variável"],
      correct: 1,
      image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=400&auto=format&fit=crop"
    }
  ],
  proc_penal_militar: [
    {
      id: 1,
      subject: "Proc. Penal Militar",
      topic: "Prisão",
      question: "A prisão em flagrante delito poderá ser efetuada:",
      options: ["Apenas por oficiais", "Apenas por superiores", "Por qualquer pessoa, em caso de crime propriamente militar", "Apenas mediante ordem judicial"],
      correct: 2,
      image: "https://images.unsplash.com/photo-1507567784013-138350616149?q=80&w=400&auto=format&fit=crop"
    }
  ],
  direitos_humanos: [
    {
      id: 1,
      subject: "Direitos Humanos",
      topic: "Pactos",
      question: "A Declaração Universal dos Direitos Humanos foi adotada pela ONU em:",
      options: ["1945", "1948", "1966", "1988"],
      correct: 1,
      image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=400&auto=format&fit=crop"
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

// --- Components ---

// Componente TopBar: Barra superior de cabeçalho fixa.
// Gerencia a exibição do título da tela ativa, botões de retrocesso personalizados tanto para mobile
// quanto para desktop, e a funcionalidade de chaveamento entre os temas Claro (Light) e Escuro (Dark).
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
        {/* Bloco exclusivo para telas mobile (md:hidden) */}
        <div className="md:hidden">
          {/* Se a tela atual permitir voltar (ex: em simulados ou edição), exibe o ícone de seta */}
          {showBack && (
            <button onClick={onBack} className="p-2.5 -ml-3 rounded-2xl hover:bg-secondary/10 transition-colors active:scale-90 text-primary">
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
          {/* Caso não seja tela de retrocesso e o usuário esteja logado, exibe sua foto de perfil como atalho de navegação */}
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
        {/* Bloco exclusivo para telas desktop (Hidden md:flex) para botão Voltar estruturado */}
        {showBack && (
          <button onClick={onBack} className="hidden md:flex p-2.5 -ml-3 rounded-2xl hover:bg-secondary/10 transition-colors active:scale-90 text-primary items-center gap-2">
            <ArrowLeft className="w-6 h-6" />
            <span className="text-sm font-bold">Voltar</span>
          </button>
        )}
        {/* Renderiza o título dinâmico da tela ativa com limites e tratamento de texto comprimido (truncate) se necessário */}
        <span className="font-display font-bold text-lg text-primary tracking-tight truncate max-w-[180px] md:max-w-none ml-2 md:ml-0">{title}</span>
      </div>
      
      {/* Botão de alternância do modo escuro/claro que controla a classe "dark" do elemento root */}
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


// Componente BottomNav: Menu de navegação inferior voltado para dispositivos móveis (MD:HIDDEN).
// Permite a alternância rápida de telas facilitando o alcance do polegar do usuário.
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

// Componente Sidebar: Menu de navegação lateral exibido apenas em resoluções desktop (HIDDEN md:flex).
// Conta também com um minicard na base que expõe os metadados do usuário logado (nome, foto e status).
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
    
    {/* Minicard na parte inferior da barra mostrando perfil rápido se autenticado */}
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

// Componente SidebarItem: Botão unitário utilizado na Sidebar lateral com estilos condicionais elegantes
// de foco e seleção ativos e hover transitions baseados em Tailwind.
const SidebarItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-bold text-sm ${active ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' : 'text-slate-500 hover:bg-primary/5 hover:text-primary'}`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

// Componente NavItem: Elemento de botão unitário usado no menu de navegação inferior (BottomNav) dos celulares.
// Oferece transições suaves no ícone e rótulo quando o status se altera para "ativo".
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

// Tela HomeScreen: Painel principal (Dashboard) do Estudante de Direito.
// Exibe saudações dinâmicas, barra de progresso semanal de simulados,
// lista de amigos ativos na mesa de estudos, atalho para retomar a última sessão,
// aforismos jurídicos diários e cartões de recomendações especiais de estudo.
const HomeScreen = ({ onNavigate, user, simulations = 0 }: { onNavigate: (s: Screen) => void, user: SupabaseUser | null, simulations?: number }) => {
  // Lista simulada de membros/colegas na mesa de estudos ativa simultaneamente
  const recentUsers = [
    { name: "Juliana", avatar: "https://i.pravatar.cc/150?u=12" },
    { name: "Marcos", avatar: "https://i.pravatar.cc/150?u=45" },
    { name: "Fernanda", avatar: "https://i.pravatar.cc/150?u=89" },
    { name: "Ricardo", avatar: "https://i.pravatar.cc/150?u=33" }
  ];

  // Função interna para obter saudação baseada no horário atual da máquina do usuário
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";      // Manhã (antes de 12:00)
    if (hour < 18) return "Boa tarde";    // Tarde (12:00 até 17:59)
    return "Boa noite";                  // Noite (18:00 em diante)
  };

  // Cálculo da porcentagem completada da meta semanal (cada simulado equivale a 10% da meta de 10)
  const completedPct = simulations > 0 ? Math.min(simulations * 10, 100) : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-10 pb-16"
    >
      {/* Visual Header Banner */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary via-primary/95 to-slate-950 text-white border border-white/5 p-8 md:p-10 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(197,160,89,0.15),transparent_45%)]" />
        <div className="absolute -bottom-48 -right-48 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-secondary/20 border border-secondary/30 rounded-full px-3 py-1 text-secondary text-xs font-bold uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5" /> Preparação para aluno de direito
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-medium tracking-tight">
              {getGreeting()}, <span className="text-secondary font-bold">Futuro(a) Advogado(a) {user?.user_metadata?.full_name?.split(' ')[0] || 'Alessandro'}</span>
            </h1>
            <p className="text-slate-300 text-sm md:text-base max-w-xl font-medium leading-relaxed">
              O seu caminho rumo à aprovação exige constância. Você está a apenas <span className="text-white font-bold">12 dias</span> do seu grande objetivo. Continue focado!
            </p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 flex items-center gap-4 self-start md:self-auto shadow-xl">
            <div className="p-3 bg-secondary rounded-xl text-primary font-bold shadow-lg shadow-secondary/20">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Série de Estudos</p>
              <p className="text-xl font-black text-white">12 Dias Ativos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bento Dashboard Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Metas Card */}
        <div className="bg-card-bg/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-secondary/10 shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden group">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">METAS OAB</p>
            </div>
            
            <h3 className="text-lg font-bold text-primary font-display">Meta Semanal de Simulados</h3>
            
            <div className="h-2.5 w-full bg-slate-100/50 dark:bg-slate-800 rounded-full overflow-hidden relative border border-white/20">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${completedPct}%` }}
                className="h-full bg-gradient-to-r from-secondary to-secondary/80 rounded-full shadow-[0_0_12px_rgba(197,160,89,0.3)]"
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <div className="flex items-center gap-2 bg-primary/5 px-3 py-2 rounded-xl border border-primary/5">
              <CircleCheck className="w-3.5 h-3.5 text-secondary" />
              <span className="text-[10px] font-bold text-primary">{simulations}/{Math.max(10, simulations)} Simulados</span>
            </div>
            <div className="flex items-center gap-2 bg-primary/5 px-3 py-2 rounded-xl border border-primary/5">
              <Gavel className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-bold text-primary">Peças Práticas</span>
            </div>
          </div>
        </div>

        {/* Community studies group */}
        <div className="bg-card-bg/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-secondary/10 shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden group">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">COMUNIDADE</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-black text-secondary uppercase tracking-widest">Mesa de Estudos</p>
              <div className="flex -space-x-3 pt-2">
                {recentUsers.map((u, i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-4 border-card-bg bg-slate-100 shadow-lg overflow-hidden group relative">
                    <img src={u.avatar} alt={u.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                       <span className="text-[8px] text-white font-black">{u.name}</span>
                    </div>
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-4 border-card-bg bg-secondary flex items-center justify-center shadow-lg text-primary font-bold text-[10px]">
                  +15k
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-400 font-medium">
            Junte-se a <span className="font-bold text-primary">15.742 estudantes</span> estudando nesta manhã.
          </p>
        </div>
      </div>

      {/* Main Study module & Quote Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-end">
            <h3 className="text-xl text-primary font-display font-bold flex items-center gap-2">
              <Brain className="w-5 h-5 text-secondary" /> Retomar de Onde Parou
            </h3>
          </div>
          <div 
            onClick={() => {
              localStorage.setItem('selectedSubject', 'const');
              onNavigate('quiz');
            }}
            className="relative h-60 rounded-[2rem] overflow-hidden cursor-pointer group active:scale-[0.99] transition-all duration-300 shadow-xl border border-secondary/15"
          >
            <img 
              src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=600&auto=format&fit=crop" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              alt="Direito Constitucional"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent p-8 flex flex-col justify-end">
              <div className="space-y-2">
                <span className="inline-block bg-secondary text-primary text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest mb-2">Artigo 5º da CF</span>
                <h4 className="text-white font-display font-medium text-3xl">Direito Constitucional</h4>
                <p className="text-slate-300 text-xs max-w-md font-medium">Revisão focada em Direitos Individuais e Coletivos com grande probabilidade de incidência.</p>
              </div>
              <div className="flex justify-between items-center mt-6 border-t border-white/10 pt-4">
                 <div className="flex items-center gap-2 text-slate-300">
                    <Clock className="w-4 h-4 text-secondary" />
                    <span className="text-[11px] font-bold">Aproximadamente 15 minutos restantes</span>
                 </div>
                 <button className="bg-secondary text-primary font-bold text-xs px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 transition-transform duration-300 group-hover:translate-x-1">
                    Praticar Questões <Play className="w-3 h-3 fill-current" />
                 </button>
              </div>
            </div>
          </div>
        </div>

        {/* Daily axiom display card */}
        <div className="bg-slate-50 dark:bg-slate-900/40 border border-secondary/10 p-8 rounded-[2rem] flex flex-col justify-between text-left space-y-6">
          <div className="space-y-4">
            <div className="p-3 bg-secondary/10 text-secondary w-fit rounded-2xl">
              <Star className="w-6 h-6 fill-current" />
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Aforismo do Jurista</p>
            <blockquote className="text-primary font-display italic text-lg leading-relaxed pt-2">
              "A justiça apoia-se na clareza do direito; e a clareza do direito, no esforço diário de quem o estuda."
            </blockquote>
          </div>
          <p className="text-slate-500 font-mono text-[10px] uppercase">Rumo à aprovação • Exame XXXIX</p>
        </div>
      </div>

      {/* Vade Mecum Mini Banner */}
      <section className="bg-gradient-to-br from-card-bg to-card-bg/40 p-8 rounded-[2.5rem] border border-secondary/10 shadow-xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(197,160,89,0.03),transparent)] pointer-events-none" />
        <div className="w-24 h-24 md:w-32 md:h-32 bg-secondary/10 text-secondary rounded-[2rem] flex items-center justify-center shadow-inner group-hover:rotate-3 transition-transform duration-300 flex-shrink-0 border border-secondary/20">
          <Gavel className="w-12 h-12 md:w-16 md:h-16" />
        </div>
        <div className="flex-1 text-center md:text-left space-y-4">
          <div>
            <span className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-1 block">BIBLIOTECA JURÍDICA PORTÁTIL</span>
            <h3 className="text-2xl font-display font-bold text-primary">Vade Mecum Integrado</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-md italic">"A lei é a inteligência pública." — Acesse todos os códigos e leis atualizados sem carregar peso.</p>
          </div>
          <button 
            onClick={() => onNavigate('vademecum')}
            className="bg-primary hover:bg-secondary text-white hover:text-primary px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl hover:shadow-secondary/10 transition-all duration-300 flex items-center justify-center md:justify-start gap-3 active:scale-95"
          >
            Abrir Biblioteca <BookOpen className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Recommended activities */}
      <section className="space-y-6">
        <h3 className="text-2xl text-primary font-display font-bold">Recomendações Especiais</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <RecommendationCard 
            image="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=600&auto=format&fit=crop"
            subject="Processual Civil"
            title="Teoria Geral dos Recursos"
            duration="22 min"
            onClick={() => {
              localStorage.setItem('selectedSubject', 'proc_civil');
              onNavigate('quiz');
            }}
          />
          <RecommendationCard 
            image="https://images.unsplash.com/photo-1453941403244-67253457053e?q=80&w=400&auto=format&fit=crop"
            subject="Processual Penal"
            title="Liberdade e Prisão Preventiva"
            duration="20 min"
            onClick={() => {
              localStorage.setItem('selectedSubject', 'proc_penal');
              onNavigate('quiz');
            }}
          />
          <RecommendationCard 
            image="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=400&auto=format&fit=crop"
            subject="Direitos Humanos"
            title="Pacto de San José da Costa Rica"
            duration="15 min"
            onClick={() => {
              localStorage.setItem('selectedSubject', 'direitos_humanos');
              onNavigate('quiz');
            }}
          />
          <RecommendationCard 
            image="https://images.unsplash.com/photo-1521791136064-7986c2923216?q=80&w=400&auto=format&fit=crop"
            subject="Int. Privado"
            title="Conflito de Leis no Espaço"
            duration="28 min"
            onClick={() => {
              localStorage.setItem('selectedSubject', 'int_privado');
              onNavigate('quiz');
            }}
          />
          <RecommendationCard 
            image="https://images.unsplash.com/photo-1554224155-1697467276d4?q=80&w=400&auto=format&fit=crop"
            subject="Previdenciário"
            title="Regras de Aposentadoria 2024"
            duration="30 min"
            onClick={() => {
              localStorage.setItem('selectedSubject', 'previdencia');
              onNavigate('quiz');
            }}
          />
          <RecommendationCard 
            image="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=400&auto=format&fit=crop"
            subject="Hermenêutica"
            title="Métodos de Interpretação"
            duration="12 min"
            onClick={() => {
              localStorage.setItem('selectedSubject', 'hermeneutica');
              onNavigate('quiz');
            }}
          />
        </div>
      </section>


    </motion.div>
  );
};

// Componente RecommendationCard: Cartão de estudo individual sugerido.
// Renderiza uma capa fotográfica tematizada, identificação da disciplina, título do assunto,
// tempo estimado de estudo e suporte a cliques (callbacks) para início rápido do simulado específico.
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
          // Trata falhas de carregamento carregando uma imagem aleatória confiável do acervo do Vade Mecum
          const target = e.target as HTMLImageElement;
          target.src = getRandomLawImage();
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

// Componente SubjectSummary: Card compacto detalhando sumários de disciplinas e contagem de simulados.
// Exibe ícone, nome do ramo e ações de redirecionamento.
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

// Tela ExploreScreen: Catálogo completo de matérias e disciplinas doutrinárias.
// Permite buscar disciplinas em tempo real (Constitucional, Penal, Civil, etc.),
// carregar mais matérias sequencialmente sob demanda (lazy loading simulated)
// e exibe o "Caso Jurídico do Dia" com jurisprudências e dilemas de ética.
const ExploreScreen = ({ onNavigate }: { onNavigate: (s: Screen) => void }) => {
  // Controle de estado para exibir esqueleto animado (Skeleton layout loading)
  const [isLoading, setIsLoading] = useState(true);
  
  // Variável que guarda a palavra digitada na caixa de busca pelo estudante
  const [search, setSearch] = useState('');
  
  // Limite inicial de disciplinas visíveis (exibe de 4 em 4 usando .slice())
  const [visibleLimit, setVisibleLimit] = useState(4);

  // Efeito useEffect de simulação de carga: gera um pequeno atraso (800ms) ao carregar
  // a tela, conferindo um aspecto realista de busca assíncrona ao utilizador.
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer); // Limpa o temporizador se o componente desmontar
  }, []);

  // Inicia um simulado salvando a matéria escolhida no localStorage para que a tela de Quiz saiba de onde puxar
  const startQuiz = (id: string) => {
    localStorage.setItem('selectedSubject', id);
    onNavigate('quiz'); // Direciona para a tela do questionário
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
            src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=800&auto=format&fit=crop" 
            alt="Justiça"
            className="w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = getRandomLawImage();
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

// Tela UltimaProvaScreen: Centralizador oficial da última prova unificada da OAB.
// Renderiza o caderno oficial de questões unificado (PDF) diretamente no navegador,
// utilizando o visualizador embutidor do Google Docs Viewer, permitindo também o download do arquivo.
const UltimaProvaScreen = () => {
  // URL absoluta correspondente ao documento PDF oficial do Exame da Ordem do site da OAB/FGV
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
          {/* Botão de download direto do PDF oficial da OAB */}
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
          {/* Visualizador do PDF utilizando proxy embutido do Google Docs */}
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

// Tela VademecumScreen: Biblioteca digital compacta para pesquisa rápida de leis.
// Apresenta links diretos do governo para a Constituição Federal, Códigos (Civil, Penal, CLT),
// Estatuto da OAB e disposições de processamento, filtrados em tempo real por um buscador textual.
const VademecumScreen = () => {
  // Vetor contendo a base de dados de leis principais com descrição inicial e link oficial para o Planalto
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

// Tela QuizScreen: Motor lógico dos simulados da OAB e responder questões.
// Controla o índice da questão ativa, a alternativa clicada e o acúmulo de acertos (score).
// No fim do simulado, salva o rendimento do aluno no localStorage e aciona o encerramento do bloco.
const QuizScreen = ({ questions, onComplete }: { questions: any[], onComplete: (score: number) => void }) => {
  // Índice representando a questão em andamento (0 a N)
  const [currentIdx, setCurrentIdx] = useState(0);
  
  // Opção escolhida no momento pelo aluno (A=0, B=1, C=2, D=3). Nulo quando nenhuma for assinalada.
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  
  // Somatória ou totalizador de respostas corretas alcançadas no bloco
  const [score, setScore] = useState(0);

  // Seleciona o objeto de questão referencial baseado no índice atual
  const question = questions[currentIdx];

  // Função disparada ao clicar para prosseguir para o próximo quesito
  const handleNext = () => {
    // Verifica se a opção marcada equivale ao index gabarito (question.correct)
    const isCorrect = selectedOption === question.correct;
    const finalScore = isCorrect ? score + 1 : score;
    
    // Se ainda houver questões no questionário:
    if (currentIdx < questions.length - 1) {
      setScore(finalScore);         // Atualiza pontuação parcial
      setCurrentIdx(i => i + 1);    // Incrementa ponteiro do vetor
      setSelectedOption(null);      // Limpa seleção do usuário para o próximo quesito
    } else {
      // Se era a última pergunta, salva no LocalStorage persistindo os acertos e avança
      localStorage.setItem('lastScore', finalScore.toString());
      localStorage.setItem('totalQuestions', questions.length.toString());
      onComplete(finalScore);       // Invoca o callback de conclusão configurado no App.tsx
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
                target.src = getRandomLawImage();
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

// Componente QuizOption: Alternativa unitária do simulado (A, B, C, D).
// Exibe seu índice em letra correspondente (gerado dinamicamente via ASCII/String.fromCharCode).
// Muda as bordas, sombras e cores de fundo no Tailwind baseado no status "active".
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

// Tela ResultsScreen: Relatório gerencial final do simulado recém-concluído.
// Carrega as pontuações e quesitos totais guardados no localStorage, tirando a média
// para classificar se o aluno está "Apto" (>= 70%) ou "Em Formação".
const ResultsScreen = ({ onNavigate }: { onNavigate: (s: Screen) => void }) => {
  // Puxa a pontuação guardada no localStorage ao finalizar o simulado
  const lastScore = parseInt(localStorage.getItem('lastScore') || '0');
  
  // Puxa o total de questões que compunham aquele simulado específico
  const totalQuestions = parseInt(localStorage.getItem('totalQuestions') || '5');
  
  // Calcula matematicamente o aproveitamento percentual de respostas procedentes
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

// Tela ProfileScreen: Painel do perfil pessoal acadêmico do utilizador.
// Exibe avatar do estudante, classificação/rank atual de pontuação para o exame de ordem (leaderboard),
// contadores de estatísticas de precisão de simulados e redirecionadores para dados da conta.
const ProfileScreen = ({ onNavigate, user }: { onNavigate: (s: Screen) => void, user: SupabaseUser | null }) => {
  // Função que executa a saída (logout) do usuário chamando o client SDK do Supabase
  const handleLogout = async () => {
    if (!supabase) return; // Retorna imediatamente caso o Supabase não esteja provisionado
    try {
      // Dispara o encerramento de sessão remoto no Supabase Auth
      await supabase.auth.signOut();
      
      // Limpa dados residuais de tokens e sessões locais de autenticação no browser
      localStorage.removeItem('supabase.auth.token'); 
      
      onNavigate('auth'); // Redireciona o estudante de volta à tela de login
    } catch (err) {
      console.error('Logout error:', err);
      onNavigate('auth'); // Redireciona de forma resiliente mesmo em caso de erro na rede
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
            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Estudante de Direito</span>
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

// Tela RemindersScreen: Gerenciador da agenda de revisões periódicas do aluno.
// Controla o dropdown de seleção de disciplinas, seletor de horários (time picker)
// e repassa funções herdadas de salvamento, remoção e chaveamento de status ativo/inativo.
const RemindersScreen = ({ reminders, subjects, onAdd, onDelete, onToggle }: { 
  reminders: Reminder[], 
  subjects: Subject[],
  onAdd: (r: Omit<Reminder, 'id' | 'active'>) => void,
  onDelete: (id: string) => void,
  onToggle: (id: string) => void
}) => {
  // Guarda a disciplina selecionada pelo estudante para configurar o novo alerta de estudos
  const [selectedSubject, setSelectedSubject] = useState(subjects[0].id);
  
  // Guarda o horário (time picker) selecionado, com padrão às 09:00h da manhã
  const [selectedTime, setSelectedTime] = useState('09:00');

  // Dispara o callback para registrar o novo lembrete com ID gerado dinamicamente
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

// Tela AuthScreen: Sistema de controle de acesso (Login e Cadastro).
// Altera estados entre telas de login ou cadastro (isLogin) e utiliza o Supabase Client
// para registrar novos e-mails ou validar credenciais criptografadas existentes com tratamento de erros.
const AuthScreen = () => {
  // Controle booleano: true exibe formulário de Login, false de Cadastro de nova conta
  const [isLogin, setIsLogin] = useState(true);
  
  // States correspondentes à captura das caixas de entrada textuais (inputs)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  // State de controle de erros do Supabase Auth para exibir na UI em tarja vermelha
  const [error, setError] = useState<string | null>(null);
  
  // State indicativo de aguardando resposta da API do Supabase (loading spinner/disabled)
  const [loading, setLoading] = useState(false);

  // Manipulador do envio do formulário (submissão)
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault(); // Impede o recarregamento natural da página
    if (!supabase) {
      setError('Configuração do Supabase ausente.');
      return;
    }
    setError(null);      // Reseta erros prévios
    setLoading(true);    // Define estado de aguardando API ativa

    try {
      if (isLogin) {
        // Fluxo 1: Efetuar autenticação de login de usuário existente
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        // Fluxo 2: Efetuar registro de cadastro de um novo utilizador
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName, // Persiste o Nome Completo na coluna user_metadata do auth.users do Supabase
            }
          }
        });
        if (error) throw error;
      }
    } catch (err: any) {
      // Repassa o erro de autenticação amigável pego da resposta da API
      setError(err.message || 'Erro durante a autenticação.');
    } finally {
      setLoading(false);  // Desativa tela de bloqueio de formulário
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

// Tela EditProfileScreen: Editores e capturas cadastrais do usuário autenticado.
// Lê e altera o Nome Completo e Foto de Perfil (Avatar). Converte imagens enviadas localmente
// pelo computador do estudante em strings codificadas em Base64 (DataURLs) via FileReader.
const EditProfileScreen = ({ user, onBack }: { user: SupabaseUser | null, onBack: () => void }) => {
  // Inicializa o state com o nome cadastrado no metadata do usuário Supabase logado
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  
  // Inicializa o link ou String Base64 correspondente à foto do avatar
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || '');
  
  // State indicativo de salvamento pendente na API Supabase
  const [loading, setLoading] = useState(false);
  
  // State de controle de alertas contendo mensagem de sucesso ou erro
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Submissão do editor: Atualiza o objeto do usuário na tabela Auth do Supabase
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setMessage(null);

    try {
      // Envia uma instrução de patch de metadados ao serviço Supabase Auth
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

  // Evento disparado quando o utilizador clica no ícone de Câmera e escolhe um novo arquivo de imagem
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; // Captura a primeira imagem escolhida nos arquivos locais
    if (file) {
      // Impede envios de imagens gigantes (limita a 200KB) para que a gravação em Base64 caiba nos metadados da conta
      if (file.size > 200000) { // ~200KB
        setMessage({ type: 'error', text: 'A imagem deve ter menos de 200KB.' });
        return;
      }

      // Classe nativa do JavaScript para ler arquivos binários de e-mails/computadores locais
      const reader = new FileReader();
      
      // Função assíncrona disparada após concluir a conversão do arquivo
      reader.onloadend = () => {
        // Converte o arquivo lido em string Base64 e insere no avatar url do state
        setAvatarUrl(reader.result as string);
      };
      // Inicia a transformação da imagem jogando os dados convertidos para strings base64 url
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
    if (screen === 'profile') return "Meu Perfil";
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
