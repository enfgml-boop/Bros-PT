
import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  Menu, X, Instagram, Youtube, MessageCircle, 
  ChevronRight, LayoutDashboard, FileText, Settings, 
  Plus, Trash2, Edit3, BarChart3, Home as HomeIcon,
  LogOut, Shield, Users, Target, Camera, Upload, Save,
  MapPin, Link as LinkIcon, Lock, RefreshCw, CheckCircle
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
  updatePost: (post: Post) => void;
  deletePost: (id: string) => void;
  updateProgram: (program: Program) => void;
  addProgram: (program: Program) => void;
  deleteProgram: (id: string) => void;
  updateTrainer: (trainer: Trainer) => void;
  addTrainer: (trainer: Trainer) => void;
  deleteTrainer: (id: string) => void;
  resetToDefaults: () => void;
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
    try {
      const saved = localStorage.getItem('bros_pt_state');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse local state", e);
    }
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

  // 전역 상태가 변경될 때마다 확실하게 로컬스토리지에 저장
  useEffect(() => {
    localStorage.setItem('bros_pt_state', JSON.stringify(state));
    document.documentElement.style.setProperty('--primary-color', state.config.primaryColor);
    document.title = state.config.siteName;
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
  const updatePost = (post: Post) => setState(prev => ({
    ...prev,
    posts: prev.posts.map(p => p.id === post.id ? post : p)
  }));
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

  const resetToDefaults = () => {
    if(confirm('모든 내용을 초기화하시겠습니까?')) {
      setState({
        config: INITIAL_CONFIG,
        posts: INITIAL_POSTS,
        programs: INITIAL_PROGRAMS,
        trainers: INITIAL_TRAINERS,
      });
    }
  };

  return (
    <AppContext.Provider value={{ 
      state, updateConfig, addPost, updatePost, deletePost, 
      updateProgram, addProgram, deleteProgram,
      updateTrainer, addTrainer, deleteTrainer,
      resetToDefaults,
      isAuthenticated, login, logout
    }}>
      {children}
    </AppContext.Provider>
  );
};

// --- Shared Components ---

const ImageUpload: React.FC<{ currentImage?: string; onImageChange: (base64: string) => void; label: string }> = ({ currentImage, onImageChange, label }) => {
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
      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</label>
      <div onClick={() => fileInputRef.current?.click()} className="group relative w-full h-44 bg-black border border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-all overflow-hidden shadow-inner">
        {currentImage ? (
          <>
            <img src={currentImage} className="w-full h-full object-cover opacity-50 group-hover:opacity-30 transition-opacity" alt="Preview" />
            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={28} className="text-white mb-2" />
              <span className="text-white text-[10px] font-black uppercase">사진 변경</span>
            </div>
          </>
        ) : (
          <><Upload size={28} className="text-gray-700 mb-2" /><span className="text-gray-600 text-[10px] font-black uppercase tracking-tighter">사진 업로드</span></>
        )}
      </div>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
    </div>
  );
};

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
    { name: '블로그', path: '/blog' }
  ];

  return (
    <nav className="fixed w-full z-50 bg-black/90 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="text-xl md:text-2xl font-black italic tracking-tighter flex items-center gap-2 group">
          <div className="w-8 h-8 bg-primary rounded shadow-lg shadow-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <span className="text-black font-black">B</span>
          </div>
          <span className="uppercase">{state.config.siteName}</span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-10">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`text-xs font-bold tracking-widest uppercase transition-all hover:text-primary ${location.pathname === item.path ? 'text-primary' : 'text-gray-400'}`}
            >
              {item.name}
            </Link>
          ))}
          <Link to="/admin" className="text-gray-600 hover:text-white transition-colors"><Shield size={18} /></Link>
        </div>

        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white p-2">
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-black border-b border-white/10 animate-fade-in shadow-2xl overflow-hidden">
          <div className="p-6 space-y-4">
            {navItems.map((item) => (
              <Link 
                key={item.path} 
                to={item.path} 
                onClick={() => setIsOpen(false)}
                className="block text-2xl font-black italic uppercase text-gray-200 hover:text-primary transition-colors"
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-white/5">
              <Link to="/admin" onClick={() => setIsOpen(false)} className="text-gray-600 text-sm font-bold flex items-center gap-2">
                <Shield size={14} /> 관리자 메뉴 접속
              </Link>
            </div>
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
    <footer className="bg-surface border-t border-white/5 py-16">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
        <div className="space-y-4">
          <h3 className="text-lg font-black italic uppercase tracking-tighter">{state.config.siteName}</h3>
          <p className="text-gray-500 text-xs leading-relaxed max-w-xs mx-auto md:mx-0 keep-breaks">
            {state.config.address}
          </p>
        </div>
        <div className="space-y-4">
          <h4 className="text-primary text-[10px] font-black uppercase tracking-[0.2em]">Contact Us</h4>
          <p className="text-xl font-bold">{state.config.contactNumber}</p>
          <div className="flex justify-center md:justify-start gap-5">
            <a href={state.config.instagram} target="_blank" className="text-gray-500 hover:text-white transition-colors"><Instagram size={20} /></a>
            <a href={state.config.youtube} target="_blank" className="text-gray-500 hover:text-white transition-colors"><Youtube size={20} /></a>
            <a href={state.config.kakao} target="_blank" className="text-gray-500 hover:text-white transition-colors"><MessageCircle size={20} /></a>
          </div>
        </div>
        <div className="flex flex-col justify-end">
          <p className="text-[10px] text-gray-700 font-bold uppercase tracking-widest">© 2024 {state.config.siteName}. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

// --- Pages ---

const HomePage: React.FC = () => {
  const { state } = useApp();
  return (
    <div className="animate-fade-in">
      <section className="relative h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={state.config.heroImageUrl} className="w-full h-full object-cover opacity-60 scale-110" alt="" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/70"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <h1 className="text-6xl md:text-[10rem] font-black italic uppercase leading-[0.9] tracking-tighter mb-8 animate-fade-in">
            {state.config.heroTitle}
          </h1>
          <p className="text-lg md:text-2xl text-gray-300 max-w-2xl mb-12 keep-breaks font-medium opacity-90">
            {state.config.heroSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-5">
            <Link to="/programs" className="bg-primary hover:scale-105 active:scale-95 text-white font-black py-5 px-12 rounded-full shadow-2xl shadow-primary/30 transition-all text-center uppercase tracking-widest text-sm">
              Programs View
            </Link>
            <a href={state.config.kakao} target="_blank" className="border border-white/20 hover:bg-white/10 text-white font-black py-5 px-12 rounded-full transition-all text-center uppercase tracking-widest text-sm backdrop-blur-sm">
              Contact Kakao
            </a>
          </div>
        </div>
      </section>

      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-16">
            <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter">Featured<br /><span className="text-primary">Programs</span></h2>
            <Link to="/programs" className="text-gray-500 hover:text-white font-bold text-xs uppercase flex items-center gap-1">View All <ChevronRight size={14} /></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {state.programs.slice(0, 3).map(p => (
              <div key={p.id} className="group relative aspect-[3/4] rounded-3xl overflow-hidden bg-surface border border-white/5 transition-transform hover:-translate-y-2 shadow-2xl">
                <img src={p.imageUrl} className="w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-700" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-8 flex flex-col justify-end">
                  <h3 className="text-2xl font-black italic uppercase mb-3">{p.title}</h3>
                  <p className="text-gray-400 text-sm line-clamp-2 mb-6 keep-breaks font-medium">{p.description}</p>
                  <Link to="/programs" className="w-fit text-primary font-black uppercase text-[10px] tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">Details <ChevronRight size={14}/></Link>
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
    <div className="pt-40 pb-24 max-w-7xl mx-auto px-6 animate-fade-in">
      <div className="mb-20 text-center md:text-left">
        <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter mb-4">Programs</h1>
        <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.3em]">Precision & Performance</p>
      </div>
      <div className="space-y-32">
        {state.programs.map((p, i) => (
          <div key={p.id} className={`flex flex-col md:flex-row gap-16 items-center ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
            <div className="flex-1 w-full rounded-[2.5rem] overflow-hidden shadow-2xl shadow-primary/10 border border-white/5">
              <img src={p.imageUrl} className="w-full aspect-[4/3] object-cover" alt={p.title} />
            </div>
            <div className="flex-1 space-y-8">
              <span className="text-primary font-black uppercase text-[10px] tracking-[0.3em]">Master Class 0{i+1}</span>
              <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tight">{p.title}</h2>
              <p className="text-gray-400 text-lg md:text-xl leading-relaxed keep-breaks font-medium opacity-80">{p.description}</p>
              <a 
                href={p.consultUrl || state.config.kakao} 
                target="_blank" 
                className="inline-block bg-white text-black font-black py-5 px-14 rounded-2xl hover:bg-primary hover:text-white hover:scale-105 active:scale-95 transition-all shadow-xl"
              >
                Inquiry Now
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
    <div className="pt-40 pb-24 max-w-7xl mx-auto px-6 animate-fade-in">
      <div className="mb-20 text-center">
        <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter mb-4">Elite Crew</h1>
        <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.3em]">The Best For You</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {state.trainers.map(t => (
          <div key={t.id} className="bg-surface rounded-[2.5rem] overflow-hidden border border-white/5 flex flex-col lg:flex-row group transition-all hover:bg-surface-light hover:border-primary/20 shadow-2xl">
            <div className="lg:w-1/2 aspect-[4/5]"><img src={t.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={t.name} /></div>
            <div className="lg:w-1/2 p-10 flex flex-col justify-between">
              <div>
                <span className="text-primary text-[10px] font-black uppercase tracking-widest">{t.role}</span>
                <h2 className="text-3xl font-black italic mt-2 mb-6 uppercase tracking-tighter">{t.name}</h2>
                <div className="text-gray-400 text-sm leading-relaxed mb-8 keep-breaks font-medium opacity-80">{t.bio}</div>
                <div className="flex flex-wrap gap-2">
                  {t.specialties.map(s => <span key={s} className="bg-black/50 border border-white/10 px-3 py-1 rounded-lg text-[10px] font-bold text-gray-300 uppercase tracking-tighter">#{s}</span>)}
                </div>
              </div>
              <a href={t.consultUrl || state.config.kakao} target="_blank" className="mt-10 group/btn inline-flex items-center gap-3 text-primary font-black uppercase text-xs tracking-widest hover:translate-x-2 transition-transform">
                Consult Coach <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
              </a>
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
    <div className="pt-40 pb-24 max-w-7xl mx-auto px-6 animate-fade-in">
      <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter mb-20 text-center md:text-left">Insight</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {state.posts.map(post => (
          <article key={post.id} className="bg-surface rounded-3xl overflow-hidden border border-white/5 group flex flex-col h-full hover:border-primary/30 transition-all shadow-xl">
            {post.imageUrl && <div className="aspect-video overflow-hidden"><img src={post.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-60" alt="" /></div>}
            <div className="p-8 flex flex-col flex-1">
              <span className="text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-4">{post.category}</span>
              <h2 className="text-xl font-bold mb-6 leading-tight group-hover:text-primary transition-colors">{post.title}</h2>
              <div className="text-gray-500 text-sm mb-8 keep-breaks line-clamp-4 flex-1 font-medium">{post.content}</div>
              <div className="text-[10px] text-gray-700 font-black border-t border-white/5 pt-6 flex justify-between uppercase tracking-widest">
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

// --- Admin Section Components ---

const ProgramEditor: React.FC<{ program: Program }> = ({ program }) => {
  const { updateProgram, deleteProgram } = useApp();
  const [local, setLocal] = useState<Program>(program);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateProgram(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-surface p-6 md:p-8 rounded-[2rem] border border-white/5 space-y-6 relative shadow-2xl">
      <button onClick={() => confirm('삭제하시겠습니까?') && deleteProgram(program.id)} className="absolute top-6 right-6 p-2 text-gray-700 hover:text-red-500 transition-all"><Trash2 size={18}/></button>
      <ImageUpload label="프로그램 썸네일" currentImage={local.imageUrl} onImageChange={b => setLocal({...local, imageUrl: b})} />
      <div className="space-y-4">
        <input className="w-full bg-black border border-white/10 rounded-2xl p-4 text-sm font-black uppercase outline-none focus:border-primary" value={local.title} onChange={e => setLocal({...local, title: e.target.value})} placeholder="제목" />
        <div className="relative">
          <LinkIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700"/>
          <input className="w-full bg-black border border-white/10 rounded-2xl p-4 pl-12 text-xs font-bold outline-none focus:border-primary" value={local.consultUrl || ''} onChange={e => setLocal({...local, consultUrl: e.target.value})} placeholder="개별 상담 URL" />
        </div>
        <textarea className="w-full bg-black border border-white/10 rounded-2xl p-4 text-sm h-32 resize-none keep-breaks outline-none focus:border-primary" value={local.description} onChange={e => setLocal({...local, description: e.target.value})} placeholder="상세 설명 (엔터 줄바꿈 가능)" />
      </div>
      <button onClick={handleSave} className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${saved ? 'bg-green-600 text-white shadow-lg' : 'bg-primary text-white shadow-lg shadow-primary/20'}`}>
        {saved ? <><CheckCircle size={16}/> 저장완료</> : <><Save size={16}/> 이 프로그램 저장</>}
      </button>
    </div>
  );
};

const TrainerEditor: React.FC<{ trainer: Trainer }> = ({ trainer }) => {
  const { updateTrainer, deleteTrainer } = useApp();
  const [local, setLocal] = useState<Trainer>(trainer);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateTrainer(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-surface p-6 md:p-8 rounded-[2rem] border border-white/5 space-y-6 relative shadow-2xl">
      <button onClick={() => confirm('삭제하시겠습니까?') && deleteTrainer(trainer.id)} className="absolute top-6 right-6 p-2 text-gray-700 hover:text-red-500 transition-all"><Trash2 size={18}/></button>
      <ImageUpload label="코치 프로필" currentImage={local.imageUrl} onImageChange={b => setLocal({...local, imageUrl: b})} />
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input className="bg-black border border-white/10 rounded-2xl p-4 text-sm font-black uppercase outline-none focus:border-primary" value={local.name} onChange={e => setLocal({...local, name: e.target.value})} placeholder="이름" />
          <input className="bg-black border border-white/10 rounded-2xl p-4 text-sm font-bold outline-none focus:border-primary" value={local.role} onChange={e => setLocal({...local, role: e.target.value})} placeholder="직책" />
        </div>
        <div className="relative">
          <LinkIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700"/>
          <input className="w-full bg-black border border-white/10 rounded-2xl p-4 pl-12 text-xs font-bold outline-none focus:border-primary" value={local.consultUrl || ''} onChange={e => setLocal({...local, consultUrl: e.target.value})} placeholder="개별 상담 링크 (오픈프로필 등)" />
        </div>
        <textarea className="w-full bg-black border border-white/10 rounded-2xl p-4 text-sm h-40 resize-none keep-breaks outline-none focus:border-primary" value={local.bio} onChange={e => setLocal({...local, bio: e.target.value})} placeholder="소개글 (엔터 줄바꿈 가능)" />
      </div>
      <button onClick={handleSave} className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${saved ? 'bg-green-600 text-white shadow-lg' : 'bg-primary text-white shadow-lg shadow-primary/20'}`}>
        {saved ? <><CheckCircle size={16}/> 저장완료</> : <><Save size={16}/> 이 트레이너 저장</>}
      </button>
    </div>
  );
};

const PostRow: React.FC<{ post: Post }> = ({ post }) => {
  const { updatePost, deletePost } = useApp();
  const [local, setLocal] = useState<Post>(post);
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updatePost(local);
    setSaved(true);
    setTimeout(() => { setSaved(false); setIsEditing(false); }, 1500);
  };

  if (isEditing) {
    return (
      <tr className="bg-white/[0.03]">
        <td colSpan={5} className="p-6">
          <div className="bg-black p-6 rounded-2xl border border-white/10 space-y-4">
            <ImageUpload label="게시물 이미지" currentImage={local.imageUrl} onImageChange={b => setLocal({...local, imageUrl: b})} />
            <input className="w-full bg-surface border border-white/10 rounded-xl p-3 font-bold" value={local.title} onChange={e => setLocal({...local, title: e.target.value})} placeholder="제목" />
            <textarea className="w-full bg-surface border border-white/10 rounded-xl p-3 h-32 keep-breaks" value={local.content} onChange={e => setLocal({...local, content: e.target.value})} placeholder="내용" />
            <div className="flex gap-4">
              <button onClick={handleSave} className="flex-1 bg-primary py-3 rounded-xl font-black text-xs uppercase text-white shadow-lg">{saved ? '저장됨' : '변경사항 저장하기'}</button>
              <button onClick={() => setIsEditing(false)} className="flex-1 bg-white/5 py-3 rounded-xl font-black text-xs uppercase text-gray-400">닫기</button>
            </div>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="hover:bg-white/[0.02] transition-colors border-b border-white/5">
      <td className="p-6"><img src={post.imageUrl} className="w-16 h-10 object-cover rounded-lg border border-white/10" alt="" /></td>
      <td className="p-6"><p className="font-black text-sm uppercase tracking-tighter">{post.title}</p><p className="text-gray-600 text-[10px] mt-1">{post.date}</p></td>
      <td className="p-6"><span className="px-2 py-1 bg-white/5 rounded text-[10px] text-gray-500 font-bold">{post.category}</span></td>
      <td className="p-6 text-right">
        <div className="flex justify-end gap-3">
          <button onClick={() => setIsEditing(true)} className="p-2 text-gray-600 hover:text-primary transition-colors"><Edit3 size={18}/></button>
          <button onClick={() => confirm('삭제할까요?') && deletePost(post.id)} className="p-2 text-gray-600 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
        </div>
      </td>
    </tr>
  );
};

// --- Admin Setup ---

const AdminLogin: React.FC = () => {
  const { login } = useApp();
  const [pw, setPw] = useState('');
  const [error, setError] = useState(false);
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-surface border border-white/10 rounded-[2.5rem] p-12 text-center shadow-2xl animate-fade-in">
        <div className="w-20 h-20 bg-primary rounded-[1.5rem] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-primary/20"><Lock className="text-black" size={36} /></div>
        <h1 className="text-2xl font-black italic uppercase mb-8 tracking-tighter">Admin Access</h1>
        <form onSubmit={e => { e.preventDefault(); if (!login(pw)) { setError(true); setPw(''); } }} className="space-y-6">
          <input type="password" placeholder="PASSWORD" className="w-full bg-black border border-white/10 rounded-2xl p-5 text-center text-2xl outline-none focus:border-primary font-black tracking-widest uppercase shadow-inner transition-all" value={pw} onChange={e => { setPw(e.target.value); setError(false); }} autoFocus />
          {error && <p className="text-red-500 text-xs font-black uppercase">Denied</p>}
          <button className="w-full bg-primary py-5 rounded-2xl font-black text-white uppercase tracking-widest text-sm shadow-xl shadow-primary/30 transition-all active:scale-95">Unlock Dashboard</button>
        </form>
      </div>
    </div>
  );
};

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, logout, resetToDefaults } = useApp();
  const loc = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  if (!isAuthenticated) return <AdminLogin />;

  const menu = [
    { n: '대시보드', p: '/admin', i: <LayoutDashboard size={20}/> },
    { n: '게시물 관리', p: '/admin/posts', i: <FileText size={20}/> },
    { n: '프로그램 & 코치', p: '/admin/cms', i: <Users size={20}/> },
    { n: '사이트 설정', p: '/admin/settings', i: <Settings size={20}/> }
  ];

  return (
    <div className="min-h-screen bg-[#050505] flex text-gray-100">
      <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="lg:hidden fixed bottom-6 right-6 z-[100] w-14 h-14 bg-primary rounded-full shadow-2xl flex items-center justify-center text-black">
        {isSidebarOpen ? <X size={28}/> : <Menu size={28}/>}
      </button>

      <aside className={`fixed lg:relative z-[90] w-72 h-screen border-r border-white/10 bg-[#080808] flex flex-col p-8 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="text-xl font-black italic mb-16 flex items-center gap-2">
          <div className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center"><span className="text-black text-xs font-black">B</span></div> BROS ADMIN
        </div>
        <nav className="flex-1 space-y-3">
          {menu.map(m => (
            <Link key={m.p} to={m.p} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-4 p-4 rounded-2xl font-bold transition-all text-sm ${loc.pathname === m.p ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
              {m.i} {m.n}
            </Link>
          ))}
        </nav>
        <div className="pt-8 border-t border-white/5 space-y-3">
          <button onClick={resetToDefaults} className="w-full flex items-center gap-4 p-4 text-gray-700 hover:text-yellow-500 text-xs font-bold transition-colors"><RefreshCw size={18}/> 초기화</button>
          <button onClick={logout} className="w-full flex items-center gap-4 p-4 text-gray-700 hover:text-red-500 text-xs font-bold transition-colors"><LogOut size={18}/> 로그아웃</button>
          <Link to="/" className="flex items-center gap-4 p-4 text-gray-700 hover:text-white text-xs font-bold transition-colors"><HomeIcon size={18}/> 사이트 홈</Link>
        </div>
      </aside>
      
      {isSidebarOpen && <div onClick={() => setSidebarOpen(false)} className="lg:hidden fixed inset-0 bg-black/80 z-[80] backdrop-blur-sm"></div>}

      <main className="flex-1 p-6 md:p-12 overflow-y-auto w-full">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  );
};

// --- Admin Content Pages ---

const AdminDashboard: React.FC = () => {
  const { state } = useApp();
  return (
    <AdminLayout>
      <header className="mb-12">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">Dashboard</h1>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {[ { l: '방문자', v: '1,284', i: <BarChart3 /> }, { l: '회원', v: '96', i: <Users /> }, { l: '게시물', v: state.posts.length.toString(), i: <FileText /> } ].map(s => (
          <div key={s.l} className="bg-surface p-10 rounded-[2rem] border border-white/5 flex justify-between items-center group shadow-2xl">
            <div className="space-y-2"><p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">{s.l}</p><p className="text-3xl font-black italic tracking-tighter">{s.v}</p></div>
            <div className="text-primary group-hover:scale-110 transition-transform">{s.i}</div>
          </div>
        ))}
      </div>
      <div className="bg-surface p-8 rounded-[2rem] border border-white/5 shadow-2xl">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><FileText size={20} className="text-primary"/> 최근 업데이트</h2>
        <div className="space-y-3">
          {state.posts.slice(0, 3).map(p => (
            <div key={p.id} className="p-4 bg-white/5 rounded-2xl flex justify-between items-center"><div className="flex gap-4 items-center"><img src={p.imageUrl} className="w-10 h-10 object-cover rounded-lg border border-white/10" /><p className="font-bold text-sm tracking-tight">{p.title}</p></div><ChevronRight size={16} className="text-gray-700" /></div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

const AdminCMS: React.FC = () => {
  const { state, addProgram, addTrainer } = useApp();
  return (
    <AdminLayout>
      <header className="mb-16">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">Content CMS</h1>
        <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mt-2">수정 후 각 항목의 [저장] 버튼을 누르면 즉시 동기화됩니다.</p>
      </header>
      
      <section className="mb-24">
        <div className="flex justify-between items-end mb-10 border-b border-white/5 pb-6">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter">Programs</h2>
          <button onClick={() => addProgram({ id: `p-${Date.now()}`, title: '새 프로그램', description: '', icon: 'target', imageUrl: 'https://picsum.photos/600/400', consultUrl: '' })} className="bg-primary px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 active:scale-95 transition-all"><Plus size={16} className="inline mr-1" /> New Program</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {state.programs.map(p => <ProgramEditor key={p.id} program={p} />)}
        </div>
      </section>

      <section className="mb-24">
        <div className="flex justify-between items-end mb-10 border-b border-white/5 pb-6">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter">Elite Crew</h2>
          <button onClick={() => addTrainer({ id: `t-${Date.now()}`, name: '새 코치', role: '트레이너', bio: '', imageUrl: 'https://picsum.photos/400/500', specialties: ['복싱'], consultUrl: '' })} className="bg-primary px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 active:scale-95 transition-all"><Plus size={16} className="inline mr-1" /> New Trainer</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {state.trainers.map(t => <TrainerEditor key={t.id} trainer={t} />)}
        </div>
      </section>
    </AdminLayout>
  );
};

const AdminPosts: React.FC = () => {
  const { state, addPost } = useApp();
  const [isAdd, setIsAdd] = useState(false);
  const [form, setForm] = useState<Partial<Post>>({ title: '', category: 'NOTICE', content: '', author: '관리자', imageUrl: '' });

  const handleAdd = () => {
    if (!form.title || !form.content) return;
    addPost({ 
      id: Date.now().toString(), 
      title: form.title!, 
      category: form.category as any, 
      content: form.content!, 
      date: new Date().toISOString().split('T')[0], 
      author: form.author!, 
      imageUrl: form.imageUrl || 'https://picsum.photos/800/600' 
    });
    setIsAdd(false); 
    setForm({ title: '', category: 'NOTICE', content: '', author: '관리자', imageUrl: '' });
  };

  return (
    <AdminLayout>
      <header className="flex justify-between items-end mb-16">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">Insights</h1>
        <button onClick={() => setIsAdd(true)} className="bg-primary px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] flex gap-2 items-center text-white shadow-lg shadow-primary/20 active:scale-95 transition-all"><Plus size={18}/> Write Post</button>
      </header>

      {isAdd && (
        <div className="fixed inset-0 z-[150] bg-black/95 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-surface w-full max-w-2xl rounded-[3rem] p-10 border border-white/10 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-black uppercase italic tracking-tighter">New Insight</h2>
            <ImageUpload label="게시물 대표 이미지" currentImage={form.imageUrl} onImageChange={b => setForm({...form, imageUrl: b})} />
            <input className="w-full bg-black border border-white/10 rounded-xl p-4 font-bold outline-none focus:border-primary transition-all" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="제목" />
            <textarea className="w-full h-40 bg-black border border-white/10 rounded-xl p-4 keep-breaks outline-none focus:border-primary transition-all" value={form.content} onChange={e => setForm({...form, content: e.target.value})} placeholder="내용을 입력하세요..." />
            <div className="flex gap-4">
              <button onClick={handleAdd} className="flex-1 bg-primary py-4 rounded-xl font-black text-xs uppercase text-white shadow-lg">Save & Post</button>
              <button onClick={() => setIsAdd(false)} className="flex-1 bg-white/5 py-4 rounded-xl font-black text-xs uppercase text-gray-400">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-surface rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 text-gray-600 font-black uppercase tracking-widest">
              <tr><th className="p-6">Thumbnail</th><th className="p-6">Post Info</th><th className="p-6">Category</th><th className="p-6 text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {state.posts.map(p => <PostRow key={p.id} post={p} />)}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

const AdminSettings: React.FC = () => {
  const { state, updateConfig } = useApp();
  const [tmp, setTmp] = useState(state.config);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateConfig(tmp);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  
  return (
    <AdminLayout>
      <header className="mb-16">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">Site Engine</h1>
        <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mt-2">글로벌 테마와 비즈니스 정보를 관리합니다.</p>
      </header>

      <div className="space-y-10 pb-24">
        <section className="bg-surface p-10 rounded-[2.5rem] border border-white/5 space-y-8 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2"><label className="text-[10px] font-black uppercase text-gray-600 ml-2">Site Brand Name</label><input className="w-full bg-black border border-white/10 rounded-2xl p-4 font-black uppercase outline-none focus:border-primary transition-all shadow-inner" value={tmp.siteName} onChange={e => setTmp({...tmp, siteName: e.target.value})} /></div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-600 ml-2">Primary Color</label>
              <div className="flex gap-4">
                <input type="color" className="w-14 h-14 bg-black rounded-xl p-1 cursor-pointer" value={tmp.primaryColor} onChange={e => setTmp({...tmp, primaryColor: e.target.value})} />
                <input className="flex-1 bg-black border border-white/10 rounded-2xl p-4 font-mono uppercase focus:border-primary outline-none transition-all shadow-inner" value={tmp.primaryColor} onChange={e => setTmp({...tmp, primaryColor: e.target.value})} />
              </div>
            </div>
          </div>
          <ImageUpload label="메인 히어로 배경" currentImage={tmp.heroImageUrl} onImageChange={b => setTmp({...tmp, heroImageUrl: b})} />
          <div className="space-y-2"><label className="text-[10px] font-black uppercase text-gray-600 ml-2">Main Headline</label><input className="w-full bg-black border border-white/10 rounded-2xl p-4 font-black italic uppercase outline-none focus:border-primary shadow-inner" value={tmp.heroTitle} onChange={e => setTmp({...tmp, heroTitle: e.target.value})} /></div>
          <div className="space-y-2"><label className="text-[10px] font-black uppercase text-gray-600 ml-2">Sub-headline Description</label><textarea className="w-full h-32 bg-black border border-white/10 rounded-2xl p-4 keep-breaks outline-none focus:border-primary shadow-inner" value={tmp.heroSubtitle} onChange={e => setTmp({...tmp, heroSubtitle: e.target.value})} /></div>
        </section>

        <section className="bg-surface p-10 rounded-[2.5rem] border border-white/5 grid grid-cols-1 md:grid-cols-2 gap-8 shadow-2xl">
          <div className="space-y-2"><label className="text-[10px] font-black uppercase text-gray-600 ml-2">Contact Number</label><input className="w-full bg-black border border-white/10 rounded-2xl p-4 font-bold outline-none focus:border-primary shadow-inner" value={tmp.contactNumber} onChange={e => setTmp({...tmp, contactNumber: e.target.value})} /></div>
          <div className="space-y-2"><label className="text-[10px] font-black uppercase text-gray-600 ml-2">Location Address</label><input className="w-full bg-black border border-white/10 rounded-2xl p-4 font-bold outline-none focus:border-primary shadow-inner" value={tmp.address} onChange={e => setTmp({...tmp, address: e.target.value})} /></div>
          <div className="space-y-2"><label className="text-[10px] font-black uppercase text-gray-600 ml-2">KakaoTalk Consult URL</label><input className="w-full bg-black border border-white/10 rounded-2xl p-4 font-bold outline-none focus:border-primary shadow-inner" value={tmp.kakao} onChange={e => setTmp({...tmp, kakao: e.target.value})} /></div>
          <div className="space-y-2"><label className="text-[10px] font-black uppercase text-gray-600 ml-2">Instagram Profile URL</label><input className="w-full bg-black border border-white/10 rounded-2xl p-4 font-bold outline-none focus:border-primary shadow-inner" value={tmp.instagram} onChange={e => setTmp({...tmp, instagram: e.target.value})} /></div>
        </section>

        <button onClick={handleSave} className={`w-full py-6 rounded-2xl font-black text-xl transition-all shadow-xl flex items-center justify-center gap-4 uppercase tracking-widest ${saved ? 'bg-green-600 text-white' : 'bg-primary text-white shadow-primary/30 active:scale-[0.98]'}`}>
          {saved ? <><CheckCircle size={28}/> Configuration Deployed</> : <><Save size={28}/> Save Site Settings</>}
        </button>
      </div>
    </AdminLayout>
  );
};

// --- App Entry ---

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
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
