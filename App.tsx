
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
    try {
      const saved = localStorage.getItem('bros_pt_state');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load state", e);
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

// --- Components ---

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
      <label className="block text-sm text-gray-400">{label}</label>
      <div onClick={() => fileInputRef.current?.click()} className="group relative w-full h-48 bg-black border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-all overflow-hidden">
        {currentImage ? (
          <>
            <img src={currentImage} className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" alt="Preview" />
            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={32} className="text-white mb-2" />
              <span className="text-white text-xs font-bold">사진 변경</span>
            </div>
          </>
        ) : (
          <><Upload size={32} className="text-gray-600 mb-2" /><span className="text-gray-500 text-xs">업로드</span></>
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
  if (location.pathname.startsWith('/admin')) return null;
  const navItems = [{ name: '홈', path: '/' }, { name: '프로그램', path: '/programs' }, { name: '트레이너', path: '/trainers' }, { name: '블로그', path: '/blog' }];
  return (
    <nav className="fixed w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link to="/" className="text-2xl font-black italic tracking-tighter flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center"><span className="text-black not-italic font-black text-xl">B</span></div>
          {state.config.siteName}
        </Link>
        <div className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link key={item.name} to={item.path} className={`text-sm font-medium transition-colors ${location.pathname === item.path ? 'text-primary' : 'text-gray-300 hover:text-primary'}`}>{item.name}</Link>
          ))}
          <Link to="/admin" className="text-gray-500 hover:text-white"><Shield size={20} /></Link>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-gray-400">{isOpen ? <X size={28} /> : <Menu size={28} />}</button>
      </div>
      {isOpen && (
        <div className="md:hidden bg-black border-b border-white/10 p-4 space-y-4">
          {navItems.map((item) => (
            <Link key={item.name} to={item.path} onClick={() => setIsOpen(false)} className="block text-gray-300 hover:text-primary text-lg font-medium">{item.name}</Link>
          ))}
          <Link to="/admin" onClick={() => setIsOpen(false)} className="block text-gray-500">관리자</Link>
        </div>
      )}
    </nav>
  );
};

const Footer: React.FC = () => {
  const { state } = useApp();
  if (useLocation().pathname.startsWith('/admin')) return null;
  return (
    <footer className="bg-surface border-t border-white/10 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
        <div><h3 className="text-xl font-bold mb-4">{state.config.siteName}</h3><p className="text-gray-400 text-sm">{state.config.address}</p></div>
        <div><h4 className="text-primary uppercase text-xs font-bold mb-4 tracking-widest">Contact</h4><p className="text-gray-300">T. {state.config.contactNumber}</p></div>
        <div className="flex justify-center md:justify-end gap-6">
          <a href={state.config.instagram} className="text-gray-400 hover:text-primary"><Instagram /></a>
          <a href={state.config.youtube} className="text-gray-400 hover:text-primary"><Youtube /></a>
          <a href={state.config.kakao} className="text-gray-400 hover:text-primary"><MessageCircle /></a>
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
        <div className="absolute inset-0 z-0"><img src={state.config.heroImageUrl} className="w-full h-full object-cover opacity-50" alt="" /><div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60"></div></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-6xl md:text-9xl font-black italic uppercase mb-6">{state.config.heroTitle}</h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mb-10 whitespace-pre-wrap">{state.config.heroSubtitle}</p>
          <div className="flex flex-wrap gap-4"><Link to="/programs" className="bg-primary text-white font-bold py-4 px-10 rounded-full shadow-lg shadow-primary/20">프로그램 보기</Link><a href={state.config.kakao} className="border border-white/20 text-white font-bold py-4 px-10 rounded-full hover:bg-white/10">카카오톡 상담</a></div>
        </div>
      </section>
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-black italic mb-12 uppercase text-center">Programs</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {state.programs.map(p => (
            <div key={p.id} className="bg-surface rounded-3xl overflow-hidden border border-white/5 group">
              <div className="aspect-video overflow-hidden"><img src={p.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-70" alt="" /></div>
              <div className="p-8"><h3 className="text-2xl font-bold mb-3">{p.title}</h3><p className="text-gray-400 text-sm line-clamp-2 mb-6 whitespace-pre-wrap">{p.description}</p><Link to="/programs" className="text-primary font-bold inline-flex items-center gap-1">자세히 보기 <ChevronRight size={16} /></Link></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const ProgramsPage: React.FC = () => {
  const { state } = useApp();
  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
      <h1 className="text-5xl font-black italic mb-16 uppercase">Programs</h1>
      <div className="space-y-24">
        {state.programs.map((p, i) => (
          <div key={p.id} className={`flex flex-col md:flex-row gap-12 items-center ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
            <div className="flex-1 w-full rounded-3xl overflow-hidden shadow-2xl shadow-primary/10"><img src={p.imageUrl} className="w-full aspect-video object-cover" alt="" /></div>
            <div className="flex-1">
              <h2 className="text-4xl font-black italic uppercase mb-6">{p.title}</h2>
              <p className="text-gray-400 text-lg mb-8 whitespace-pre-wrap">{p.description}</p>
              <a href={p.consultUrl || state.config.kakao} target="_blank" className="inline-block bg-white text-black font-black py-4 px-10 rounded-xl hover:bg-primary hover:text-white transition-all">지금 상담하기</a>
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
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in text-center md:text-left">
      <h1 className="text-5xl font-black italic mb-16 uppercase">Our Trainers</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {state.trainers.map(t => (
          <div key={t.id} className="bg-surface rounded-3xl overflow-hidden border border-white/5 flex flex-col md:flex-row">
            <div className="md:w-1/2 aspect-square md:aspect-auto"><img src={t.imageUrl} className="w-full h-full object-cover" alt="" /></div>
            <div className="md:w-1/2 p-8 flex flex-col justify-between items-start">
              <div className="w-full">
                <span className="text-primary text-xs font-bold tracking-widest uppercase">{t.role}</span>
                <h2 className="text-3xl font-bold mt-2 mb-4">{t.name}</h2>
                <p className="text-gray-400 text-sm whitespace-pre-wrap text-left mb-6">{t.bio}</p>
                <div className="flex flex-wrap gap-2">{t.specialties.map(s => <span key={s} className="bg-black/50 border border-white/10 px-3 py-1 rounded-full text-xs text-gray-300">#{s}</span>)}</div>
              </div>
              <a href={t.consultUrl || state.config.kakao} target="_blank" className="mt-8 text-primary font-bold flex items-center gap-2">상담 예약하기 <ChevronRight size={18} /></a>
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
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
      <h1 className="text-5xl font-black italic mb-16 uppercase">Community</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {state.posts.map(post => (
          <article key={post.id} className="bg-surface rounded-2xl overflow-hidden border border-white/5 group flex flex-col h-full">
            {post.imageUrl && <div className="aspect-video overflow-hidden"><img src={post.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-60" alt="" /></div>}
            <div className="p-6 flex flex-col flex-1">
              <span className="text-primary text-[10px] font-bold mb-4 uppercase">{post.category}</span>
              <h2 className="text-xl font-bold mb-4">{post.title}</h2>
              <div className="text-gray-400 text-sm mb-6 whitespace-pre-wrap line-clamp-4 flex-1">{post.content}</div>
              <div className="text-xs text-gray-600 border-t border-white/5 pt-4 flex justify-between"><span>{post.author}</span><span>{post.date}</span></div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

// --- Admin Section ---

const AdminLogin: React.FC = () => {
  const { login } = useApp();
  const [pw, setPw] = useState('');
  const [error, setError] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(pw)) setError(false); else { setError(true); setPw(''); }
  };
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface border border-white/10 rounded-3xl p-10 animate-fade-in shadow-2xl">
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-primary/20"><Lock className="text-black" size={32} /></div>
        <h1 className="text-2xl font-black text-center mb-6 italic uppercase">Admin Access</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="password" placeholder="Password" className={`w-full bg-black border ${error ? 'border-red-500' : 'border-white/10'} rounded-xl p-4 text-center text-xl outline-none focus:border-primary tracking-widest`} value={pw} onChange={e => setPw(e.target.value)} autoFocus />
          {error && <p className="text-red-500 text-xs text-center font-bold">비밀번호가 틀렸습니다.</p>}
          <button className="w-full bg-primary py-4 rounded-xl font-black text-white shadow-lg shadow-primary/20">접속하기</button>
        </form>
        <div className="mt-8 text-center"><Link to="/" className="text-gray-500 text-sm">메인으로 돌아가기</Link></div>
      </div>
    </div>
  );
};

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, logout } = useApp();
  const loc = useLocation();
  if (!isAuthenticated) return <AdminLogin />;
  const menuItems = [{ n: '대시보드', p: '/admin', i: <LayoutDashboard size={20}/> }, { n: '게시물', p: '/admin/posts', i: <FileText size={20}/> }, { n: '프로그램 & 코치', p: '/admin/cms', i: <Users size={20}/> }, { n: '설정', p: '/admin/settings', i: <Settings size={20}/> }];
  return (
    <div className="min-h-screen bg-[#050505] flex text-gray-100">
      <aside className="w-64 border-r border-white/10 fixed h-full bg-[#080808] flex flex-col p-6">
        <div className="text-xl font-black italic mb-12 flex items-center gap-2"><div className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center"><span className="text-black text-sm">B</span></div> BROS ADMIN</div>
        <nav className="flex-1 space-y-2">
          {menuItems.map(m => <Link key={m.p} to={m.p} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${loc.pathname === m.p ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>{m.i} {m.n}</Link>)}
        </nav>
        <div className="pt-6 border-t border-white/10 space-y-2">
          <button onClick={logout} className="w-full flex items-center gap-3 p-3 text-gray-500 hover:text-red-500 transition-colors"><LogOut size={20} /> 로그아웃</button>
          <Link to="/" className="flex items-center gap-3 p-3 text-gray-500 hover:text-white transition-colors"><HomeIcon size={20} /> 사이트 이동</Link>
        </div>
      </aside>
      <main className="flex-1 ml-64 p-12 max-w-6xl mx-auto w-full">{children}</main>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const { state } = useApp();
  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-10">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[ { l: '방문자', v: '1,284', i: <BarChart3 /> }, { l: '회원', v: '96', i: <Users /> }, { l: '게시물', v: state.posts.length.toString(), i: <FileText /> } ].map(s => (
          <div key={s.l} className="bg-surface p-8 rounded-3xl border border-white/10 flex justify-between items-center"><div className="space-y-2"><p className="text-gray-400 text-xs font-bold uppercase">{s.l}</p><p className="text-3xl font-black italic">{s.v}</p></div><div className="text-primary">{s.i}</div></div>
        ))}
      </div>
      <div className="bg-surface p-8 rounded-3xl border border-white/10">
        <h2 className="text-xl font-bold mb-6">최근 게시물</h2>
        <div className="space-y-4">
          {state.posts.slice(0, 3).map(p => (
            <div key={p.id} className="p-4 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center"><div className="flex gap-4 items-center"><div className="w-10 h-10 rounded bg-black overflow-hidden"><img src={p.imageUrl} className="w-full h-full object-cover" /></div><div><p className="font-bold text-sm">{p.title}</p><p className="text-xs text-gray-500">{p.date}</p></div></div><ChevronRight size={16} className="text-gray-600" /></div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

const AdminCMS: React.FC = () => {
  const { state, updateProgram, addProgram, deleteProgram, updateTrainer, addTrainer, deleteTrainer } = useApp();
  const handleNewP = () => addProgram({ id: `p-${Date.now()}`, title: '새 프로그램', description: '', icon: 'target', imageUrl: 'https://picsum.photos/seed/p/600/400', consultUrl: '' });
  const handleNewT = () => addTrainer({ id: `t-${Date.now()}`, name: '새 코치', role: '트레이너', bio: '', imageUrl: 'https://picsum.photos/seed/t/400/500', specialties: ['복싱'], consultUrl: '' });
  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-12"><div><h1 className="text-3xl font-bold">Content CMS</h1><p className="text-gray-500">프로그램과 트레이너 정보를 관리하세요.</p></div></div>
      <section className="mb-16">
        <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4"><h2 className="text-xl font-bold italic uppercase tracking-tighter flex items-center gap-2 text-primary"><Target size={20}/> Programs</h2><button onClick={handleNewP} className="bg-primary/20 text-primary px-4 py-2 rounded-lg text-xs font-bold border border-primary/30"><Plus size={14} className="inline mr-1" /> 추가</button></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {state.programs.map(p => (
            <div key={p.id} className="bg-surface p-6 rounded-3xl border border-white/10 space-y-4 relative group">
              <button onClick={() => confirm('삭제하시겠습니까?') && deleteProgram(p.id)} className="absolute top-4 right-4 text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
              <ImageUpload label="이미지" currentImage={p.imageUrl} onImageChange={b => updateProgram({...p, imageUrl: b})} />
              <input className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm focus:border-primary outline-none" value={p.title} onChange={e => updateProgram({...p, title: e.target.value})} placeholder="제목" />
              <div className="relative"><LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/><input className="w-full bg-black border border-white/10 rounded-xl p-3 pl-10 text-xs focus:border-primary outline-none" value={p.consultUrl || ''} onChange={e => updateProgram({...p, consultUrl: e.target.value})} placeholder="개별 상담 링크 (URL)" /></div>
              <textarea className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm h-32 resize-none whitespace-pre-wrap outline-none focus:border-primary" value={p.description} onChange={e => updateProgram({...p, description: e.target.value})} placeholder="상세 설명 (엔터로 줄바꿈 가능)" />
            </div>
          ))}
        </div>
      </section>
      <section>
        <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4"><h2 className="text-xl font-bold italic uppercase tracking-tighter flex items-center gap-2 text-primary"><Users size={20}/> Trainers</h2><button onClick={handleNewT} className="bg-primary/20 text-primary px-4 py-2 rounded-lg text-xs font-bold border border-primary/30"><Plus size={14} className="inline mr-1" /> 추가</button></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {state.trainers.map(t => (
            <div key={t.id} className="bg-surface p-6 rounded-3xl border border-white/10 space-y-4 relative group">
              <button onClick={() => confirm('삭제하시겠습니까?') && deleteTrainer(t.id)} className="absolute top-4 right-4 text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
              <ImageUpload label="프로필" currentImage={t.imageUrl} onImageChange={b => updateTrainer({...t, imageUrl: b})} />
              <div className="grid grid-cols-2 gap-2"><input className="bg-black border border-white/10 rounded-xl p-3 text-sm focus:border-primary outline-none" value={t.name} onChange={e => updateTrainer({...t, name: e.target.value})} placeholder="이름" /><input className="bg-black border border-white/10 rounded-xl p-3 text-sm focus:border-primary outline-none" value={t.role} onChange={e => updateTrainer({...t, role: e.target.value})} placeholder="역할" /></div>
              <div className="relative"><LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/><input className="w-full bg-black border border-white/10 rounded-xl p-3 pl-10 text-xs focus:border-primary outline-none" value={t.consultUrl || ''} onChange={e => updateTrainer({...t, consultUrl: e.target.value})} placeholder="개별 상담 링크 (예: 오픈프로필)" /></div>
              <textarea className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm h-40 resize-none whitespace-pre-wrap outline-none focus:border-primary" value={t.bio} onChange={e => updateTrainer({...t, bio: e.target.value})} placeholder="소개글 (엔터로 줄바꿈 가능)" />
            </div>
          ))}
        </div>
      </section>
    </AdminLayout>
  );
};

const AdminPosts: React.FC = () => {
  const { state, addPost, deletePost } = useApp();
  const [isAdd, setIsAdd] = useState(false);
  const [form, setForm] = useState<Partial<Post>>({ title: '', category: 'NOTICE', content: '', author: '관리자', imageUrl: '' });
  const save = () => {
    if (!form.title || !form.content) return;
    addPost({ id: Date.now().toString(), title: form.title!, category: form.category as any, content: form.content!, date: new Date().toISOString().split('T')[0], author: form.author!, imageUrl: form.imageUrl || 'https://picsum.photos/800/600' });
    setIsAdd(false); setForm({ title: '', category: 'NOTICE', content: '', author: '관리자', imageUrl: '' });
  };
  return (
    <AdminLayout>
      <div className="flex justify-between mb-10"><div><h1 className="text-3xl font-bold">Posts</h1></div><button onClick={() => setIsAdd(true)} className="bg-primary px-6 py-2 rounded-xl font-bold flex gap-2"><Plus /> 작성</button></div>
      {isAdd && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4">
          <div className="bg-surface w-full max-w-2xl rounded-3xl p-8 border border-white/10 space-y-6">
            <h2 className="text-xl font-bold">새 게시물</h2>
            <ImageUpload label="대표 이미지" currentImage={form.imageUrl} onImageChange={b => setForm({...form, imageUrl: b})} />
            <input className="w-full bg-black border border-white/10 rounded-xl p-4 outline-none focus:border-primary" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="제목" />
            <textarea className="w-full h-40 bg-black border border-white/10 rounded-xl p-4 outline-none focus:border-primary whitespace-pre-wrap" value={form.content} onChange={e => setForm({...form, content: e.target.value})} placeholder="내용" />
            <div className="flex gap-4"><button onClick={save} className="flex-1 bg-primary py-4 rounded-xl font-bold">저장</button><button onClick={() => setIsAdd(false)} className="flex-1 bg-white/5 py-4 rounded-xl">취소</button></div>
          </div>
        </div>
      )}
      <div className="bg-surface rounded-3xl border border-white/10 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-gray-500 uppercase"><tr><th className="p-5">이미지</th><th className="p-5">제목</th><th className="p-5">카테고리</th><th className="p-5">날짜</th><th className="p-5">관리</th></tr></thead>
          <tbody className="divide-y divide-white/5">
            {state.posts.map(p => (
              <tr key={p.id} className="hover:bg-white/[0.02]">
                <td className="p-5"><img src={p.imageUrl} className="w-12 h-12 object-cover rounded" /></td>
                <td className="p-5 font-bold">{p.title}</td>
                <td className="p-5 text-xs">{p.category}</td>
                <td className="p-5 text-gray-500">{p.date}</td>
                <td className="p-5"><button onClick={() => deletePost(p.id)} className="text-red-500"><Trash2 size={18}/></button></td>
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
  const [tmp, setTmp] = useState(state.config);
  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-10">Settings</h1>
      <div className="space-y-8 pb-10">
        <div className="bg-surface p-8 rounded-3xl border border-white/10 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2"><label className="text-sm text-gray-400">사이트 이름</label><input className="w-full bg-black border border-white/10 rounded-xl p-4 focus:border-primary outline-none" value={tmp.siteName} onChange={e => setTmp({...tmp, siteName: e.target.value})} /></div>
          <div className="space-y-2"><label className="text-sm text-gray-400">메인 컬러</label><div className="flex gap-4"><input type="color" className="w-14 h-14 bg-black rounded-xl p-1" value={tmp.primaryColor} onChange={e => setTmp({...tmp, primaryColor: e.target.value})} /><input className="flex-1 bg-black border border-white/10 rounded-xl p-4 font-mono uppercase focus:border-primary outline-none" value={tmp.primaryColor} onChange={e => setTmp({...tmp, primaryColor: e.target.value})} /></div></div>
        </div>
        <div className="bg-surface p-8 rounded-3xl border border-white/10 space-y-6">
          <ImageUpload label="히어로 배경 이미지" currentImage={tmp.heroImageUrl} onImageChange={b => setTmp({...tmp, heroImageUrl: b})} />
          <div className="space-y-2"><label className="text-sm text-gray-400">슬로건</label><input className="w-full bg-black border border-white/10 rounded-xl p-4 font-black italic uppercase focus:border-primary outline-none" value={tmp.heroTitle} onChange={e => setTmp({...tmp, heroTitle: e.target.value})} /></div>
          <div className="space-y-2"><label className="text-sm text-gray-400">서브 타이틀</label><textarea className="w-full h-32 bg-black border border-white/10 rounded-xl p-4 resize-none focus:border-primary outline-none whitespace-pre-wrap" value={tmp.heroSubtitle} onChange={e => setTmp({...tmp, heroSubtitle: e.target.value})} /></div>
        </div>
        <div className="bg-surface p-8 rounded-3xl border border-white/10 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2"><label className="flex items-center gap-2 text-sm text-gray-400"><ChevronRight size={14}/> 전화번호</label><input className="w-full bg-black border border-white/10 rounded-xl p-4 focus:border-primary outline-none" value={tmp.contactNumber} onChange={e => setTmp({...tmp, contactNumber: e.target.value})} /></div>
          <div className="space-y-2"><label className="flex items-center gap-2 text-sm text-gray-400"><MapPin size={14}/> 주소</label><input className="w-full bg-black border border-white/10 rounded-xl p-4 focus:border-primary outline-none" value={tmp.address} onChange={e => setTmp({...tmp, address: e.target.value})} /></div>
          {[{l: '인스타그램', k:'instagram'}, {l: '유튜브', k:'youtube'}, {l: '카카오톡', k:'kakao'}].map(s => (
            <div key={s.k} className="space-y-2"><label className="text-sm text-gray-400">{s.l} URL</label><input className="w-full bg-black border border-white/10 rounded-xl p-4 focus:border-primary outline-none" value={(tmp as any)[s.k]} onChange={e => setTmp({...tmp, [s.k]: e.target.value})} /></div>
          ))}
        </div>
        <button onClick={() => { updateConfig(tmp); alert('저장되었습니다!'); }} className="w-full bg-primary py-6 rounded-2xl font-black text-xl shadow-xl shadow-primary/20 flex items-center justify-center gap-3"><Save size={24}/> 설정 적용하기</button>
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
