
import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  Menu, X, Instagram, Youtube, MessageCircle, 
  ChevronRight, LayoutDashboard, FileText, Settings, 
  Plus, Trash2, Edit3, BarChart3, Home as HomeIcon,
  LogOut, Shield, Users, Target, Camera, Upload, Save,
  MapPin, Link as LinkIcon, Lock
} from 'lucide-react';
import { Post, Program, Trainer, SiteConfig, AppState } from './types';
import { INITIAL_CONFIG, INITIAL_POSTS, INITIAL_PROGRAMS, INITIAL_TRAINERS } from './constants';

// --- Utils ---
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// --- Context & State Management ---

interface AppContextType {
  state: AppState;
  updateConfig: (config: SiteConfig) => void;
  addPost: (post: Post) => void;
  deletePost: (id: string) => void;
  updateProgram: (program: Program) => void;
  addProgram: (program: Program) => void;
  deleteProgram: (id: string) => void;
  updateTrainer: (trainer: Trainer) => void;
  addTrainer: (trainer: Trainer) => void;
  deleteTrainer: (id: string) => void;
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('bros_pt_state');
    if (saved) return JSON.parse(saved);
    return {
      config: INITIAL_CONFIG,
      posts: INITIAL_POSTS,
      programs: INITIAL_PROGRAMS,
      trainers: INITIAL_TRAINERS,
    };
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('admin_auth') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('bros_pt_state', JSON.stringify(state));
    document.documentElement.style.setProperty('--primary-color', state.config.primaryColor);
  }, [state]);

  const login = (password: string) => {
    if (password === 'boribab7631!') {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_auth', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_auth');
  };

  const updateConfig = (config: SiteConfig) => setState(prev => ({ ...prev, config }));
  const addPost = (post: Post) => setState(prev => ({ ...prev, posts: [post, ...prev.posts] }));
  const deletePost = (id: string) => setState(prev => ({ ...prev, posts: prev.posts.filter(p => p.id !== id) }));
  
  const updateProgram = (program: Program) => setState(prev => ({
    ...prev,
    programs: prev.programs.map(p => p.id === program.id ? program : p)
  }));
  const addProgram = (program: Program) => setState(prev => ({ ...prev, programs: [...prev.programs, program] }));
  const deleteProgram = (id: string) => setState(prev => ({ ...prev, programs: prev.programs.filter(p => p.id !== id) }));
  
  const updateTrainer = (trainer: Trainer) => setState(prev => ({
    ...prev,
    trainers: prev.trainers.map(t => t.id === trainer.id ? trainer : t)
  }));
  const addTrainer = (trainer: Trainer) => setState(prev => ({ ...prev, trainers: [...prev.trainers, trainer] }));
  const deleteTrainer = (id: string) => setState(prev => ({ ...prev, trainers: prev.trainers.filter(t => t.id !== id) }));

  return (
    <AppContext.Provider value={{ 
      state, updateConfig, addPost, deletePost, 
      updateProgram, addProgram, deleteProgram,
      updateTrainer, addTrainer, deleteTrainer,
      isAuthenticated, login, logout
    }}>
      {children}
    </AppContext.Provider>
  );
};

// --- Reusable UI Components ---

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { state } = useApp();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) return null;

  const navItems = [
    { name: '홈', path: '/' },
    { name: '프로그램', path: '/programs' },
    { name: '트레이너', path: '/trainers' },
    { name: '블로그', path: '/blog' },
  ];

  return (
    <nav className="fixed w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="text-2xl font-black italic tracking-tighter flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
                <span className="text-black not-italic font-black text-xl">B</span>
            </div>
            {state.config.siteName}
          </Link>
          
          <div className="hidden md:block">
            <div className="flex items-baseline space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${location.pathname === item.path ? 'text-primary' : 'text-gray-300 hover:text-primary'}`}
                >
                  {item.name}
                </Link>
              ))}
              <Link to="/admin" className="p-2 text-gray-400 hover:text-white transition-colors">
                <Shield size={20} />
              </Link>
            </div>
          </div>
          
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-400 hover:text-white">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-black border-b border-white/10 animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className="text-gray-300 hover:text-primary block px-3 py-4 text-base font-medium"
              >
                {item.name}
              </Link>
            ))}
            <Link to="/admin" className="text-gray-400 block px-3 py-4 text-base font-medium" onClick={() => setIsOpen(false)}>
                관리자 페이지
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

const Footer: React.FC = () => {
  const { state } = useApp();
  const location = useLocation();
  if (location.pathname.startsWith('/admin')) return null;

  return (
    <footer className="bg-surface border-t border-white/10 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h3 className="text-xl font-bold mb-4">{state.config.siteName}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              격투기를 통한 신체적, 정신적 성장을 지원합니다.<br />
              어제보다 더 강해진 당신을 만나보세요.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-primary">Contact</h4>
            <p className="text-gray-300 mb-2">T. {state.config.contactNumber}</p>
            <p className="text-gray-400 text-sm">{state.config.address}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-primary">Follow Us</h4>
            <div className="flex space-x-6">
              <a href={state.config.instagram} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-primary transition-colors"><Instagram /></a>
              <a href={state.config.youtube} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-primary transition-colors"><Youtube /></a>
              <a href={state.config.kakao} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-primary transition-colors"><MessageCircle /></a>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/5 text-center text-gray-500 text-xs">
          © 2024 {state.config.siteName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

const ImageUpload: React.FC<{ 
  currentImage?: string; 
  onImageChange: (base64: string) => void;
  label: string;
}> = ({ currentImage, onImageChange, label }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      onImageChange(base64);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm text-gray-400">{label}</label>
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="group relative w-full h-48 bg-black border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-all overflow-hidden"
      >
        {currentImage ? (
          <>
            <img src={currentImage} className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" alt="Preview" />
            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={32} className="text-white mb-2" />
              <span className="text-white text-xs font-bold">사진 변경하기</span>
            </div>
          </>
        ) : (
          <>
            <Upload size={32} className="text-gray-600 mb-2 group-hover:text-primary transition-colors" />
            <span className="text-gray-500 text-xs">클릭하여 사진 업로드</span>
          </>
        )}
      </div>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*" 
      />
    </div>
  );
};

// --- Pages ---

const HomePage: React.FC = () => {
  const { state } = useApp();
  
  return (
    <div className="animate-fade-in">
      <section className="relative h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={state.config.heroImageUrl} 
            alt="Hero"
            className="w-full h-full object-cover opacity-50 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <h1 className="text-6xl md:text-9xl font-black italic dynamic-title text-white mb-6 uppercase">
            {state.config.heroTitle}
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mb-10 leading-relaxed whitespace-pre-wrap">
            {state.config.heroSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/programs" className="bg-primary hover:scale-105 text-white font-bold py-4 px-10 rounded-full transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
              무료 체험 신청 <ChevronRight size={20} />
            </Link>
            <a href={state.config.kakao} target="_blank" rel="noreferrer" className="border border-white/20 hover:bg-white/10 text-white font-bold py-4 px-10 rounded-full transition-all flex items-center justify-center gap-2">
              카카오톡 상담
            </a>
          </div>
        </div>
      </section>

      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4 italic uppercase">Training Programs</h2>
            <div className="w-20 h-1 bg-primary mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {state.programs.map((program) => (
              <div key={program.id} className="group relative overflow-hidden rounded-2xl bg-surface transition-all hover:-translate-y-2 border border-white/5">
                <div className="aspect-video overflow-hidden">
                    <img src={program.imageUrl} alt={program.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-70" />
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-3">{program.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6 h-12 line-clamp-2 whitespace-pre-wrap">{program.description}</p>
                  <Link to="/programs" className="text-primary font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                    자세히 보기 <ChevronRight size={18} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const ProgramsPage: React.FC = () => {
  const { state } = useApp();
  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fade-in">
      <header className="mb-16">
        <h1 className="text-5xl font-black italic mb-4">PROGRAMS</h1>
        <p className="text-gray-400 text-lg">당신의 목적에 가장 적합한 트레이닝을 선택하세요.</p>
      </header>
      <div className="space-y-24">
        {state.programs.map((program, idx) => (
          <div key={program.id} className={`flex flex-col md:flex-row gap-12 items-center ${idx % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
            <div className="flex-1 w-full overflow-hidden rounded-3xl group">
              <img src={program.imageUrl} alt={program.title} className="shadow-2xl shadow-primary/10 w-full object-cover aspect-[4/3] group-hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="flex-1">
              <span className="text-primary font-bold tracking-widest uppercase mb-4 block">LEVEL 01-03</span>
              <h2 className="text-4xl font-black mb-6 italic uppercase">{program.title}</h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-8 whitespace-pre-wrap">{program.description}</p>
              <ul className="space-y-4 mb-8">
                {['전문 강사진의 밀착 케어', '최신 격투용품 무료 대여', '쾌적한 샤워실 및 편의시설'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-200">
                    <Target className="text-primary" size={20} /> {item}
                  </li>
                ))}
              </ul>
              <a 
                href={program.consultUrl || state.config.kakao} 
                target="_blank" 
                rel="noreferrer" 
                className="inline-block bg-white text-black font-black py-4 px-10 rounded-xl hover:bg-primary hover:text-white transition-all"
              >
                수강 문의하기
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TrainersPage: React.FC = () => {
  const { state } = useApp();
  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fade-in">
      <header className="mb-16 text-center">
        <h1 className="text-5xl font-black italic mb-4 uppercase">Meet Our Crew</h1>
        <p className="text-gray-400 text-lg">최고의 실력을 갖춘 코치진이 여러분과 함께합니다.</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {state.trainers.map((trainer) => (
          <div key={trainer.id} className="bg-surface rounded-3xl overflow-hidden flex flex-col md:flex-row group transition-all hover:bg-surface-light border border-white/5">
            <div className="md:w-1/2 overflow-hidden bg-black">
              <img src={trainer.imageUrl} alt={trainer.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 group-hover:opacity-80" />
            </div>
            <div className="md:w-1/2 p-8 flex flex-col justify-between">
              <div>
                <span className="text-primary font-bold uppercase text-xs tracking-widest">{trainer.role}</span>
                <h2 className="text-3xl font-bold mt-2 mb-4">{trainer.name}</h2>
                <p className="text-gray-400 text-sm leading-relaxed mb-6 whitespace-pre-wrap">{trainer.bio}</p>
                <div className="flex flex-wrap gap-2">
                  {trainer.specialties.map(spec => (
                    <span key={spec} className="bg-black/50 text-white text-xs px-3 py-1 rounded-full border border-white/10">#{spec}</span>
                  ))}
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-white/5">
                <a 
                  href={trainer.consultUrl || state.config.kakao} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-sm font-bold flex items-center gap-2 hover:text-primary transition-colors"
                >
                  상담 예약하기 <ChevronRight size={16} />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const BlogPage: React.FC = () => {
  const { state } = useApp();
  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fade-in">
      <header className="mb-16">
        <h1 className="text-5xl font-black italic mb-4 uppercase">Community</h1>
        <p className="text-gray-400 text-lg">브로스 PT의 소식과 유용한 팁을 만나보세요.</p>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {state.posts.map((post) => (
          <article key={post.id} className="bg-surface rounded-2xl overflow-hidden group border border-white/5 flex flex-col h-full">
            {post.imageUrl && (
              <div className="aspect-video overflow-hidden bg-black">
                <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80" />
              </div>
            )}
            <div className="p-6 flex flex-col flex-1">
              <span className={`text-[10px] font-bold px-2 py-1 rounded mb-4 inline-block w-fit ${post.category === 'EVENT' ? 'bg-primary text-white' : 'bg-white/10 text-gray-400'}`}>
                {post.category}
              </span>
              <h2 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{post.title}</h2>
              <div className="text-gray-400 text-sm line-clamp-3 mb-6 leading-relaxed flex-1 whitespace-pre-wrap">
                {post.content}
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 border-t border-white/5 pt-4">
                <span>{post.author}</span>
                <span>{post.date}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

// --- Admin Section ---

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, logout } = useApp();
  const location = useLocation();
  
  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return (
    <div className="min-h-screen bg-[#050505] flex text-gray-100 font-sans">
      <aside className="w-64 border-r border-white/10 flex flex-col fixed inset-y-0 z-50 bg-[#080808]">
        <div className="p-6 border-b border-white/10">
          <Link to="/" className="text-xl font-black italic flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center">
                <span className="text-black text-sm font-black">B</span>
            </div>
            BROS ADMIN
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2 mt-4">
          {[
            { name: '대시보드', path: '/admin', icon: <LayoutDashboard size={20}/> },
            { name: '게시물 관리', path: '/admin/posts', icon: <FileText size={20}/> },
            { name: '프로그램 & 코치', path: '/admin/cms', icon: <Users size={20}/> },
            { name: '사이트 설정', path: '/admin/settings', icon: <Settings size={20}/> },
          ].map(item => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${location.pathname === item.path ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}
            >
              {item.icon} {item.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10 space-y-2">
          <button onClick={logout} className="w-full flex items-center gap-3 p-3 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-500/5 transition-colors">
            <LogOut size={20} /> 로그아웃
          </button>
          <Link to="/" className="flex items-center gap-3 p-3 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors">
            <HomeIcon size={20} /> 사이트 돌아가기
          </Link>
        </div>
      </aside>
      
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

const AdminLogin: React.FC = () => {
  const { login } = useApp();
  const [pw, setPw] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(pw)) {
      setError(false);
    } else {
      setError(true);
      setPw('');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface border border-white/10 rounded-3xl p-10 shadow-2xl animate-fade-in">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Lock className="text-black" size={32} />
          </div>
        </div>
        <h1 className="text-3xl font-black text-center mb-2 italic uppercase">Admin Access</h1>
        <p className="text-gray-500 text-center text-sm mb-8">관리자 비밀번호를 입력해주세요.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <input 
              type="password"
              placeholder="Password"
              className={`w-full bg-black border ${error ? 'border-red-500' : 'border-white/10'} rounded-xl p-4 text-center text-xl focus:border-primary outline-none transition-all tracking-widest`}
              value={pw}
              onChange={e => {
                setPw(e.target.value);
                if(error) setError(false);
              }}
              autoFocus
            />
            {error && <p className="text-red-500 text-xs text-center font-bold">비밀번호가 올바르지 않습니다.</p>}
          </div>
          <button className="w-full bg-primary hover:scale-[1.02] active:scale-[0.98] py-4 rounded-xl font-black text-white transition-all shadow-xl shadow-primary/20">접속하기</button>
        </form>
        <div className="mt-10 pt-6 border-t border-white/5 text-center">
            <Link to="/" className="text-gray-600 hover:text-white text-sm transition-colors">메인 화면으로 돌아가기</Link>
        </div>
      </div>
    </div>
  );
};

const AdminCMS: React.FC = () => {
  const { state, updateProgram, addProgram, deleteProgram, updateTrainer, addTrainer, deleteTrainer } = useApp();
  
  const handleAddNewProgram = () => {
    const newProgram: Program = {
      id: `p-${Date.now()}`,
      title: '새 프로그램',
      description: '프로그램 설명을 입력해주세요.',
      icon: 'target',
      imageUrl: 'https://picsum.photos/seed/new/600/400',
      consultUrl: ''
    };
    addProgram(newProgram);
  };

  const handleAddNewTrainer = () => {
    const newTrainer: Trainer = {
      id: `t-${Date.now()}`,
      name: '새 코치',
      role: '트레이너',
      bio: '코치 소개를 입력해주세요.',
      imageUrl: 'https://picsum.photos/seed/trainer-new/400/500',
      specialties: ['기초 체력'],
      consultUrl: ''
    };
    addTrainer(newTrainer);
  };
  
  return (
    <AdminLayout>
      <header className="mb-10">
        <h1 className="text-3xl font-bold">Content CMS</h1>
        <p className="text-gray-500">프로그램 정보 및 트레이너 프로필을 추가하고 관리하세요.</p>
      </header>

      <div className="space-y-12">
        <section>
          <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-primary uppercase italic tracking-tighter"><Target size={20}/> Programs Management</h2>
            <button onClick={handleAddNewProgram} className="bg-primary/20 hover:bg-primary/40 text-primary text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-2 border border-primary/30 transition-all">
              <Plus size={14}/> 새 프로그램 추가
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {state.programs.map(program => (
              <div key={program.id} className="bg-surface p-6 rounded-3xl border border-white/10 flex flex-col gap-4 relative group animate-fade-in">
                <button 
                  onClick={() => {
                    if(confirm('정말 이 프로그램을 삭제하시겠습니까?')) deleteProgram(program.id);
                  }}
                  className="absolute top-4 right-4 p-2 bg-red-500/10 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white z-10"
                >
                  <Trash2 size={16}/>
                </button>
                <ImageUpload 
                  label={`${program.title} 이미지`} 
                  currentImage={program.imageUrl} 
                  onImageChange={(base64) => updateProgram({...program, imageUrl: base64})} 
                />
                <input 
                  className="bg-black border border-white/10 rounded-xl p-3 text-sm font-bold focus:border-primary outline-none" 
                  value={program.title} 
                  onChange={e => updateProgram({...program, title: e.target.value})}
                  placeholder="프로그램 제목"
                />
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 font-bold ml-2">개별 상담 링크 (비워둘 경우 기본 카톡으로 연결)</label>
                  <div className="relative">
                    <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                    <input 
                      className="w-full bg-black border border-white/10 rounded-xl p-3 pl-10 text-xs focus:border-primary outline-none" 
                      value={program.consultUrl || ''} 
                      onChange={e => updateProgram({...program, consultUrl: e.target.value})}
                      placeholder="상담 링크 URL"
                    />
                  </div>
                </div>
                <textarea 
                  className="bg-black border border-white/10 rounded-xl p-3 text-sm h-32 resize-none focus:border-primary outline-none whitespace-pre-wrap" 
                  value={program.description} 
                  onChange={e => updateProgram({...program, description: e.target.value})}
                  placeholder="프로그램 상세 설명 (엔터를 입력하여 줄바꿈 가능)"
                />
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-primary uppercase italic tracking-tighter"><Users size={20}/> Trainers Management</h2>
            <button onClick={handleAddNewTrainer} className="bg-primary/20 hover:bg-primary/40 text-primary text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-2 border border-primary/30 transition-all">
              <Plus size={14}/> 새 코치 추가
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {state.trainers.map(trainer => (
              <div key={trainer.id} className="bg-surface p-6 rounded-3xl border border-white/10 flex flex-col gap-4 relative group animate-fade-in">
                <button 
                  onClick={() => {
                    if(confirm('정말 이 코치 프로필을 삭제하시겠습니까?')) deleteTrainer(trainer.id);
                  }}
                  className="absolute top-4 right-4 p-2 bg-red-500/10 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white z-10"
                >
                  <Trash2 size={16}/>
                </button>
                <ImageUpload 
                  label={`${trainer.name} 프로필`} 
                  currentImage={trainer.imageUrl} 
                  onImageChange={(base64) => updateTrainer({...trainer, imageUrl: base64})} 
                />
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    className="bg-black border border-white/10 rounded-xl p-3 text-sm font-bold focus:border-primary outline-none" 
                    value={trainer.name} 
                    onChange={e => updateTrainer({...trainer, name: e.target.value})}
                    placeholder="코치 이름"
                  />
                  <input 
                    className="bg-black border border-white/10 rounded-xl p-3 text-sm focus:border-primary outline-none" 
                    value={trainer.role} 
                    onChange={e => updateTrainer({...trainer, role: e.target.value})}
                    placeholder="코치 직책"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 font-bold ml-2">개별 상담 링크 (예: 오픈프로필)</label>
                  <div className="relative">
                    <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                    <input 
                      className="w-full bg-black border border-white/10 rounded-xl p-3 pl-10 text-xs focus:border-primary outline-none" 
                      value={trainer.consultUrl || ''} 
                      onChange={e => updateTrainer({...trainer, consultUrl: e.target.value})}
                      placeholder="코치 개별 상담 링크"
                    />
                  </div>
                </div>
                <textarea 
                  className="bg-black border border-white/10 rounded-xl p-3 text-sm h-40 resize-none focus:border-primary outline-none whitespace-pre-wrap" 
                  value={trainer.bio} 
                  onChange={e => updateTrainer({...trainer, bio: e.target.value})}
                  placeholder="코치 상세 소개 (엔터를 입력하여 한 줄씩 기입 가능)"
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
};

const AdminDashboard: React.FC = () => {
  const { state } = useApp();
  
  return (
    <AdminLayout>
      <header className="mb-10">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500">사이트 현황 요약입니다.</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { label: '누적 방문자', value: '1,284', icon: <BarChart3 className="text-primary" /> },
          { label: '활성 회원', value: '96', icon: <Users className="text-primary" /> },
          { label: '게시물', value: state.posts.length.toString(), icon: <FileText className="text-primary" /> },
        ].map(stat => (
          <div key={stat.label} className="bg-surface p-6 rounded-2xl border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-400 text-sm font-medium">{stat.label}</span>
              {stat.icon}
            </div>
            <div className="text-3xl font-black italic">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-surface rounded-2xl border border-white/10 p-6">
        <h2 className="text-xl font-bold mb-6">최근 게시물 현황</h2>
        <div className="space-y-4">
          {state.posts.slice(0, 3).map(post => (
            <div key={post.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-black">
                    <img src={post.imageUrl} className="w-full h-full object-cover opacity-60" alt="" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">{post.title}</h3>
                  <span className="text-xs text-gray-500">{post.date} · {post.category}</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-600" />
            </div>
          ))}
        </div>
        <Link to="/admin/posts" className="mt-6 block text-center text-sm font-bold text-primary hover:underline">모든 게시물 보기</Link>
      </div>
    </AdminLayout>
  );
};

const AdminPosts: React.FC = () => {
  const { state, addPost, deletePost } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [newPost, setNewPost] = useState<Partial<Post>>({
    title: '',
    category: 'NOTICE',
    content: '',
    author: '관리자',
    imageUrl: ''
  });

  const handleSave = () => {
    if (!newPost.title || !newPost.content) return;
    const post: Post = {
      id: Date.now().toString(),
      title: newPost.title!,
      category: newPost.category as any,
      content: newPost.content!,
      date: new Date().toISOString().split('T')[0],
      author: newPost.author!,
      imageUrl: newPost.imageUrl || `https://picsum.photos/seed/${Date.now()}/800/600`
    };
    addPost(post);
    setIsAdding(false);
    setNewPost({ title: '', category: 'NOTICE', content: '', author: '관리자', imageUrl: '' });
  };

  return (
    <AdminLayout>
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold">Post Management</h1>
          <p className="text-gray-500">공지사항 및 블로그 게시물을 관리합니다.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-primary hover:scale-105 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
        >
          <Plus size={20} /> 새 게시물 작성
        </button>
      </header>

      {isAdding && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface w-full max-w-2xl rounded-3xl p-8 border border-white/10 animate-fade-in shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">새 게시물 추가</h2>
            <div className="space-y-6">
              <ImageUpload 
                label="대표 이미지 첨부" 
                currentImage={newPost.imageUrl} 
                onImageChange={base64 => setNewPost({...newPost, imageUrl: base64})}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">제목</label>
                  <input 
                    className="w-full bg-black border border-white/10 rounded-xl p-3 focus:border-primary outline-none transition-colors font-bold"
                    value={newPost.title}
                    onChange={e => setNewPost({...newPost, title: e.target.value})}
                    placeholder="제목"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">카테고리</label>
                  <select 
                    className="w-full bg-black border border-white/10 rounded-xl p-3 focus:border-primary outline-none appearance-none cursor-pointer"
                    value={newPost.category}
                    onChange={e => setNewPost({...newPost, category: e.target.value as any})}
                  >
                    <option value="NOTICE">공지사항</option>
                    <option value="TIPS">운동 팁</option>
                    <option value="EVENT">이벤트</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">내용</label>
                <textarea 
                  className="w-full h-40 bg-black border border-white/10 rounded-xl p-3 focus:border-primary outline-none resize-none whitespace-pre-wrap"
                  value={newPost.content}
                  onChange={e => setNewPost({...newPost, content: e.target.value})}
                  placeholder="내용을 작성하세요..."
                />
              </div>
              <div className="flex gap-4">
                <button onClick={handleSave} className="flex-1 bg-primary py-4 rounded-xl font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2"><Save size={18}/> 저장하기</button>
                <button onClick={() => setIsAdding(false)} className="flex-1 bg-white/5 py-4 rounded-xl font-bold border border-white/10">취소</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-surface rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-widest border-b border-white/10">
              <th className="px-6 py-4 font-semibold">이미지</th>
              <th className="px-6 py-4 font-semibold">제목</th>
              <th className="px-6 py-4 font-semibold">카테고리</th>
              <th className="px-6 py-4 font-semibold">날짜</th>
              <th className="px-6 py-4 font-semibold">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {state.posts.map(post => (
              <tr key={post.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-4">
                  <div className="w-16 h-10 rounded-lg overflow-hidden bg-black border border-white/5">
                    <img src={post.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="" />
                  </div>
                </td>
                <td className="px-6 py-5 font-bold text-sm">{post.title}</td>
                <td className="px-6 py-5">
                   <span className="text-[10px] bg-white/10 px-2 py-1 rounded text-gray-300">{post.category}</span>
                </td>
                <td className="px-6 py-5 text-sm text-gray-500">{post.date}</td>
                <td className="px-6 py-5">
                  <div className="flex gap-4">
                    <button onClick={() => deletePost(post.id)} className="text-gray-500 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

const AdminSettings: React.FC = () => {
  const { state, updateConfig } = useApp();
  const [tempConfig, setTempConfig] = useState<SiteConfig>(state.config);

  const handleSave = () => {
    updateConfig(tempConfig);
    alert('모든 설정이 성공적으로 저장되었습니다!');
  };

  return (
    <AdminLayout>
      <header className="mb-10">
        <h1 className="text-3xl font-bold">Site Settings</h1>
        <p className="text-gray-500">웹사이트의 텍스트, SNS 링크, 테마, 주소를 실시간으로 제어합니다.</p>
      </header>

      <div className="space-y-8 pb-20">
        <section className="bg-surface p-8 rounded-3xl border border-white/10">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-primary italic uppercase tracking-tighter"><Settings size={20}/> General Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">사이트 이름</label>
              <input 
                className="w-full bg-black border border-white/10 rounded-xl p-4 focus:border-primary outline-none"
                value={tempConfig.siteName}
                onChange={e => setTempConfig({...tempConfig, siteName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">포인트 컬러 (메인 테마색)</label>
              <div className="flex gap-4">
                <input 
                    type="color"
                    className="w-14 h-14 bg-black border border-white/10 rounded-xl p-1 cursor-pointer"
                    value={tempConfig.primaryColor}
                    onChange={e => setTempConfig({...tempConfig, primaryColor: e.target.value})}
                />
                <input 
                    className="flex-1 bg-black border border-white/10 rounded-xl p-4 text-xs font-mono uppercase focus:border-primary outline-none"
                    value={tempConfig.primaryColor}
                    onChange={e => setTempConfig({...tempConfig, primaryColor: e.target.value})}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface p-8 rounded-3xl border border-white/10">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-primary italic uppercase tracking-tighter"><Target size={20}/> Hero Content & Image</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">메인 슬로건 (대문자 추천)</label>
                <input 
                  className="w-full bg-black border border-white/10 rounded-xl p-4 focus:border-primary outline-none text-2xl font-black italic uppercase"
                  value={tempConfig.heroTitle}
                  onChange={e => setTempConfig({...tempConfig, heroTitle: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">서브 설명문 (엔터 지원)</label>
                <textarea 
                  className="w-full h-32 bg-black border border-white/10 rounded-xl p-4 focus:border-primary outline-none resize-none whitespace-pre-wrap"
                  value={tempConfig.heroSubtitle}
                  onChange={e => setTempConfig({...tempConfig, heroSubtitle: e.target.value})}
                />
              </div>
            </div>
            <div>
              <ImageUpload 
                label="메인 배경 이미지 (Hero Image)"
                currentImage={tempConfig.heroImageUrl}
                onImageChange={base64 => setTempConfig({...tempConfig, heroImageUrl: base64})}
              />
            </div>
          </div>
        </section>

        <section className="bg-surface p-8 rounded-3xl border border-white/10">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-primary italic uppercase tracking-tighter"><MessageCircle size={20}/> Social, Contact & Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm text-gray-400 mb-2 font-bold text-white"><ChevronRight size={14} className="text-primary"/> 전화번호</label>
              <input 
                className="w-full bg-black border border-white/10 rounded-xl p-4 focus:border-primary outline-none"
                value={tempConfig.contactNumber}
                onChange={e => setTempConfig({...tempConfig, contactNumber: e.target.value})}
                placeholder="02-1234-5678"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm text-gray-400 mb-2 font-bold text-white"><MapPin size={14} className="text-primary"/> 주소</label>
              <input 
                className="w-full bg-black border border-white/10 rounded-xl p-4 focus:border-primary outline-none"
                value={tempConfig.address}
                onChange={e => setTempConfig({...tempConfig, address: e.target.value})}
                placeholder="센터 주소를 입력하세요"
              />
            </div>
            {[
              { label: '인스타그램 URL', key: 'instagram', icon: <Instagram size={14} className="text-primary"/> },
              { label: '유튜브 URL', key: 'youtube', icon: <Youtube size={14} className="text-primary"/> },
              { label: '카카오톡 상담 채널 URL (기본)', key: 'kakao', icon: <MessageCircle size={14} className="text-primary"/> },
            ].map((item) => (
              <div key={item.key}>
                <label className="flex items-center gap-2 text-sm text-gray-400 mb-2 font-bold text-white">{item.icon} {item.label}</label>
                <input 
                  className="w-full bg-black border border-white/10 rounded-xl p-4 focus:border-primary outline-none"
                  value={(tempConfig as any)[item.key]}
                  onChange={e => setTempConfig({...tempConfig, [item.key]: e.target.value})}
                />
              </div>
            ))}
          </div>
        </section>

        <button 
          onClick={handleSave}
          className="w-full bg-primary hover:scale-[1.01] py-6 rounded-2xl font-black text-xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
        >
          <Save size={24} /> 사이트 변경사항 적용하기
        </button>
      </div>
    </AdminLayout>
  );
};

// --- Main App Component ---

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen flex flex-col selection:bg-primary selection:text-white">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/programs" element={<ProgramsPage />} />
              <Route path="/trainers" element={<TrainersPage />} />
              <Route path="/blog" element={<BlogPage />} />
              
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/posts" element={<AdminPosts />} />
              <Route path="/admin/cms" element={<AdminCMS />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AppProvider>
  );
};

export default App;
