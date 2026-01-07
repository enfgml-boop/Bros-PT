
import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate, useParams } from 'react-router-dom';
import { 
  Menu, X, Instagram, Youtube, MessageCircle, 
  ChevronRight, LayoutDashboard, FileText, Settings, 
  Plus, Trash2, Edit3, BarChart3, Home as HomeIcon,
  LogOut, Shield, Users, Target, Camera, Upload, Save,
  MapPin, Link as LinkIcon, Lock, RefreshCw, CheckCircle,
  ArrowLeft, MessageSquare, Send
} from 'lucide-react';
import { Post, Program, Trainer, SiteConfig, AppState, Comment } from './types';
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

// --- Context ---

interface AppContextType {
  state: AppState;
  updateConfig: (config: SiteConfig) => void;
  addPost: (post: Post) => void;
  updatePost: (post: Post) => void;
  deletePost: (id: string) => void;
  addComment: (postId: string, comment: Comment) => void;
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
    } catch (e) {}
    return {
      config: INITIAL_CONFIG,
      posts: INITIAL_POSTS,
      programs: INITIAL_PROGRAMS,
      trainers: INITIAL_TRAINERS,
    };
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem('admin_auth') === 'true');

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
  const updatePost = (post: Post) => setState(prev => ({ ...prev, posts: prev.posts.map(p => p.id === post.id ? post : p) }));
  const deletePost = (id: string) => setState(prev => ({ ...prev, posts: prev.posts.filter(p => p.id !== id) }));
  const addComment = (postId: string, comment: Comment) => setState(prev => ({
    ...prev,
    posts: prev.posts.map(p => p.id === postId ? { ...p, comments: [...(p.comments || []), comment] } : p)
  }));
  const updateProgram = (program: Program) => setState(prev => ({ ...prev, programs: prev.programs.map(p => p.id === program.id ? program : p) }));
  const addProgram = (program: Program) => setState(prev => ({ ...prev, programs: [...prev.programs, program] }));
  const deleteProgram = (id: string) => setState(prev => ({ ...prev, programs: prev.programs.filter(p => p.id !== id) }));
  const updateTrainer = (trainer: Trainer) => setState(prev => ({ ...prev, trainers: prev.trainers.map(t => t.id === trainer.id ? trainer : t) }));
  const addTrainer = (trainer: Trainer) => setState(prev => ({ ...prev, trainers: [...prev.trainers, trainer] }));
  const deleteTrainer = (id: string) => setState(prev => ({ ...prev, trainers: prev.trainers.filter(t => t.id !== id) }));
  const resetToDefaults = () => {
    if(confirm('초기화하시겠습니까?')) {
      setState({ config: INITIAL_CONFIG, posts: INITIAL_POSTS, programs: INITIAL_PROGRAMS, trainers: INITIAL_TRAINERS });
    }
  };

  return (
    <AppContext.Provider value={{ 
      state, updateConfig, addPost, updatePost, deletePost, addComment,
      updateProgram, addProgram, deleteProgram, updateTrainer, addTrainer, deleteTrainer,
      resetToDefaults, isAuthenticated, login, logout
    }}>{children}</AppContext.Provider>
  );
};

// --- Shared ---

const ImageUpload: React.FC<{ currentImage?: string; onImageChange: (base64: string) => void; label: string }> = ({ currentImage, onImageChange, label }) => {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-gray-500 uppercase">{label}</label>
      <div onClick={() => ref.current?.click()} className="group relative w-full h-44 bg-black border border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer overflow-hidden shadow-inner">
        {currentImage ? (
          <>
            <img src={currentImage} className="w-full h-full object-cover opacity-50 group-hover:opacity-30 transition-all" />
            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
              <Camera size={24} className="mb-1"/><span className="text-[10px] font-black uppercase tracking-tighter">변경</span>
            </div>
          </>
        ) : <><Upload size={24} className="text-gray-700"/><span className="text-[10px] font-black text-gray-700 mt-2">업로드</span></>}
      </div>
      <input type="file" ref={ref} onChange={async (e) => {
        const file = e.target.files?.[0];
        if (file) onImageChange(await fileToBase64(file));
      }} className="hidden" accept="image/*" />
    </div>
  );
};

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { state } = useApp();
  const loc = useLocation();
  if (loc.pathname.startsWith('/admin')) return null;

  const items = [ { n: '홈', p: '/' }, { n: '프로그램', p: '/programs' }, { n: '트레이너', p: '/trainers' }, { n: '게시판', p: '/board' } ];

  return (
    <nav className="fixed w-full z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="text-xl font-black italic flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center"><span className="text-black font-black text-xs">B</span></div>
          <span className="uppercase tracking-tighter">{state.config.siteName}</span>
        </Link>
        <div className="hidden md:flex items-center space-x-10">
          {items.map(i => <Link key={i.p} to={i.p} className={`text-xs font-bold uppercase tracking-widest transition-all ${loc.pathname === i.p ? 'text-primary' : 'text-gray-400 hover:text-white'}`}>{i.n}</Link>)}
          <Link to="/admin" className="text-gray-600 hover:text-white"><Shield size={18} /></Link>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white"><Menu size={28} /></button>
      </div>
      {isOpen && (
        <div className="md:hidden bg-black border-b border-white/10 p-6 space-y-4 animate-fade-in shadow-2xl">
          {items.map(i => <Link key={i.p} to={i.p} onClick={() => setIsOpen(false)} className="block text-2xl font-black italic uppercase text-gray-200 hover:text-primary">{i.n}</Link>)}
        </div>
      )}
    </nav>
  );
};

const Footer: React.FC = () => {
  const { state } = useApp();
  const loc = useLocation();
  if (loc.pathname.startsWith('/admin')) return null;

  return (
    <footer className="bg-surface border-t border-white/5 py-16">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
        <div className="space-y-4">
          <h3 className="text-lg font-black italic uppercase tracking-tighter">{state.config.siteName}</h3>
          <p className="text-gray-500 text-xs leading-relaxed keep-breaks">{state.config.address}</p>
        </div>
        <div className="space-y-4">
          <h4 className="text-primary text-[10px] font-black uppercase tracking-widest">Contact</h4>
          <p className="text-xl font-bold">{state.config.contactNumber}</p>
          <div className="flex justify-center md:justify-start gap-5">
            <a href={state.config.instagram} target="_blank" className="text-gray-500 hover:text-white"><Instagram size={20} /></a>
            <a href={state.config.youtube} target="_blank" className="text-gray-500 hover:text-white"><Youtube size={20} /></a>
            <a href={state.config.kakao} target="_blank" className="text-gray-500 hover:text-white"><MessageCircle size={20} /></a>
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
      <section className="relative h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={state.config.heroImageUrl} className="w-full h-full object-cover opacity-60 scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/70"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <h1 className="text-6xl md:text-[8rem] font-black italic uppercase leading-[0.9] tracking-tighter mb-8 animate-fade-in">{state.config.heroTitle}</h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mb-12 keep-breaks font-medium">{state.config.heroSubtitle}</p>
          <div className="flex gap-4"><Link to="/programs" className="bg-primary text-white font-black py-5 px-12 rounded-full shadow-2xl shadow-primary/20 uppercase tracking-widest text-sm hover:scale-105 transition-all">Explore Programs</Link></div>
        </div>
      </section>
    </div>
  );
};

const ProgramsPage: React.FC = () => {
  const { state } = useApp();
  return (
    <div className="pt-40 pb-24 max-w-7xl mx-auto px-6 animate-fade-in">
      <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-20">Programs</h1>
      <div className="space-y-32">
        {state.programs.map((p, i) => (
          <div key={p.id} className={`flex flex-col md:flex-row gap-16 items-center ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
            <div className="flex-1 w-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5">
              <img src={p.imageUrl} className="w-full aspect-[4/3] object-cover" />
            </div>
            <div className="flex-1 space-y-8">
              <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tight">{p.title}</h2>
              <p className="text-gray-400 text-lg md:text-xl leading-relaxed keep-breaks font-medium opacity-80">{p.description}</p>
              <a href={p.consultUrl || state.config.kakao} target="_blank" className="inline-block bg-white text-black font-black py-5 px-14 rounded-2xl hover:bg-primary hover:text-white transition-all shadow-xl uppercase text-sm tracking-widest">Inquiry Now</a>
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
      <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-20 text-center">Elite Crew</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {state.trainers.map(t => (
          <div key={t.id} className="bg-surface rounded-[2.5rem] overflow-hidden border border-white/5 flex flex-col lg:flex-row group transition-all hover:bg-surface-light shadow-2xl">
            <div className="lg:w-1/2 aspect-[4/5] overflow-hidden"><img src={t.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" /></div>
            <div className="lg:w-1/2 p-10 flex flex-col justify-between">
              <div>
                <span className="text-primary text-[10px] font-black uppercase tracking-widest">{t.role}</span>
                <h2 className="text-3xl font-black italic mt-2 mb-6 uppercase tracking-tighter">{t.name}</h2>
                <div className="text-gray-400 text-sm leading-relaxed mb-8 keep-breaks font-medium opacity-80">{t.bio}</div>
                <div className="flex flex-wrap gap-2">
                  {t.specialties.map(s => <span key={s} className="bg-black/50 border border-white/10 px-3 py-1 rounded-lg text-[10px] font-bold text-gray-300 uppercase">#{s}</span>)}
                </div>
              </div>
              <a href={t.consultUrl || state.config.kakao} target="_blank" className="mt-10 inline-flex items-center gap-2 text-primary font-black uppercase text-xs tracking-widest hover:translate-x-2 transition-transform">Consult Coach <ChevronRight size={18} /></a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const BoardPage: React.FC = () => {
  const { state } = useApp();
  return (
    <div className="pt-40 pb-24 max-w-7xl mx-auto px-6 animate-fade-in">
      <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-20">Board</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {state.posts.map(post => (
          <Link to={`/board/${post.id}`} key={post.id} className="bg-surface rounded-3xl overflow-hidden border border-white/5 group flex flex-col h-full hover:border-primary/30 transition-all shadow-xl">
            {post.imageUrl && <div className="aspect-video overflow-hidden"><img src={post.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-60" /></div>}
            <div className="p-8 flex flex-col flex-1">
              <span className="text-primary text-[10px] font-black uppercase mb-4">{post.category}</span>
              <h2 className="text-xl font-bold mb-6 leading-tight group-hover:text-primary">{post.title}</h2>
              <div className="text-gray-500 text-sm mb-8 keep-breaks line-clamp-3 font-medium flex-1">{post.content}</div>
              <div className="text-[10px] text-gray-700 font-black border-t border-white/5 pt-6 flex justify-between uppercase">
                <span>{post.author}</span>
                <span className="flex items-center gap-1"><MessageSquare size={12}/> {post.comments?.length || 0}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

const PostDetailPage: React.FC = () => {
  const { id } = useParams();
  const { state, addComment } = useApp();
  const post = state.posts.find(p => p.id === id);
  const [cf, setCf] = useState({ author: '', content: '' });

  if (!post) return <div className="pt-40 text-center">Post not found.</div>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cf.author || !cf.content) return;
    addComment(post.id, { id: Date.now().toString(), author: cf.author, content: cf.content, date: new Date().toISOString().split('T')[0] });
    setCf({ author: '', content: '' });
  };

  return (
    <div className="pt-32 pb-24 animate-fade-in">
      <div className="max-w-4xl mx-auto px-6">
        <Link to="/board" className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-10 text-[10px] font-black uppercase tracking-widest"><ArrowLeft size={16} /> Back</Link>
        {post.imageUrl && <img src={post.imageUrl} className="w-full h-auto rounded-[3rem] mb-12 shadow-2xl border border-white/5" />}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 bg-primary/20 text-primary text-[10px] font-black uppercase rounded-lg">{post.category}</span>
            <span className="text-gray-600 text-xs font-bold uppercase tracking-widest">{post.date}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-tight">{post.title}</h1>
          <p className="text-gray-300 text-lg md:text-xl leading-relaxed keep-breaks font-medium opacity-80 py-10 border-b border-white/10">{post.content}</p>
        </div>
        <section className="mt-20 space-y-12">
          <h3 className="text-2xl font-black uppercase italic">Comments <span className="text-primary">{post.comments?.length || 0}</span></h3>
          <form onSubmit={handleSubmit} className="bg-surface p-8 rounded-3xl border border-white/5 space-y-4">
            <input className="w-full md:w-1/2 bg-black border border-white/10 rounded-xl p-4 text-sm font-bold outline-none focus:border-primary" placeholder="Name" value={cf.author} onChange={e => setCf({...cf, author: e.target.value})}/>
            <textarea className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm h-32 resize-none focus:border-primary outline-none" placeholder="Comment..." value={cf.content} onChange={e => setCf({...cf, content: e.target.value})}/>
            <button className="bg-primary text-white font-black py-4 px-10 rounded-xl text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"><Send size={16}/> Post</button>
          </form>
          <div className="space-y-8">
            {post.comments?.map(c => (
              <div key={c.id} className="border-b border-white/5 pb-8 space-y-2">
                <div className="flex justify-between items-center"><span className="text-primary font-black uppercase text-xs tracking-widest">{c.author}</span><span className="text-gray-600 text-[10px] font-bold">{c.date}</span></div>
                <p className="text-gray-400 text-sm font-medium leading-relaxed">{c.content}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

// --- Admin Sub-Components ---

const AdminProgramCard: React.FC<{ program: Program }> = ({ program }) => {
  const { updateProgram, deleteProgram } = useApp();
  const [local, setLocal] = useState(program);
  const [saved, setSaved] = useState(false);
  const handleSave = () => { updateProgram(local); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  return (
    <div className="bg-surface p-6 rounded-[2rem] border border-white/5 space-y-6 shadow-2xl relative">
      <button onClick={() => confirm('삭제?') && deleteProgram(program.id)} className="absolute top-4 right-4 p-2 text-gray-700 hover:text-red-500"><Trash2 size={18}/></button>
      <ImageUpload label="이미지" currentImage={local.imageUrl} onImageChange={b => setLocal({...local, imageUrl: b})} />
      <input className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm font-black uppercase" value={local.title} onChange={e => setLocal({...local, title: e.target.value})} />
      <textarea className="w-full h-24 bg-black border border-white/10 rounded-xl p-4 text-sm" value={local.description} onChange={e => setLocal({...local, description: e.target.value})} />
      <button onClick={handleSave} className={`w-full py-4 rounded-xl font-black text-[10px] uppercase transition-all flex items-center justify-center gap-2 ${saved ? 'bg-green-600' : 'bg-primary'}`}>
        {saved ? <><CheckCircle size={14}/> Saved</> : <><Save size={14}/> 이 프로그램 저장</>}
      </button>
    </div>
  );
};

const AdminTrainerCard: React.FC<{ trainer: Trainer }> = ({ trainer }) => {
  const { updateTrainer, deleteTrainer } = useApp();
  const [local, setLocal] = useState(trainer);
  const [saved, setSaved] = useState(false);
  const handleSave = () => { updateTrainer(local); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  return (
    <div className="bg-surface p-6 rounded-[2rem] border border-white/5 space-y-6 shadow-2xl relative">
      <button onClick={() => confirm('삭제?') && deleteTrainer(trainer.id)} className="absolute top-4 right-4 p-2 text-gray-700 hover:text-red-500"><Trash2 size={18}/></button>
      <ImageUpload label="코치 사진" currentImage={local.imageUrl} onImageChange={b => setLocal({...local, imageUrl: b})} />
      <div className="grid grid-cols-2 gap-4"><input className="bg-black border border-white/10 rounded-xl p-4 text-sm font-black uppercase" value={local.name} onChange={e => setLocal({...local, name: e.target.value})} /><input className="bg-black border border-white/10 rounded-xl p-4 text-sm font-bold" value={local.role} onChange={e => setLocal({...local, role: e.target.value})} /></div>
      <textarea className="w-full h-32 bg-black border border-white/10 rounded-xl p-4 text-sm" value={local.bio} onChange={e => setLocal({...local, bio: e.target.value})} />
      <button onClick={handleSave} className={`w-full py-4 rounded-xl font-black text-[10px] uppercase transition-all flex items-center justify-center gap-2 ${saved ? 'bg-green-600' : 'bg-primary'}`}>
        {saved ? <><CheckCircle size={14}/> Saved</> : <><Save size={14}/> 이 트레이너 저장</>}
      </button>
    </div>
  );
};

// --- Admin Section ---

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
      <aside className={`fixed lg:relative z-[90] w-72 h-screen border-r border-white/10 bg-[#080808] flex flex-col p-8 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="text-xl font-black italic mb-16 uppercase tracking-tighter">Bros Admin</div>
        <nav className="flex-1 space-y-3">
          {menu.map(m => (
            <Link key={m.p} to={m.p} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-4 p-4 rounded-2xl font-bold transition-all text-sm ${loc.pathname === m.p ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
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
      <main className="flex-1 p-6 md:p-12 overflow-y-auto w-full"><div className="max-w-5xl mx-auto">{children}</div></main>
      <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="lg:hidden fixed bottom-6 right-6 z-[100] w-14 h-14 bg-primary rounded-full shadow-2xl flex items-center justify-center text-black">
        {isSidebarOpen ? <X size={28}/> : <Menu size={28}/>}
      </button>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const { state } = useApp();
  return (
    <AdminLayout>
      <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-12">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[ { l: '게시물', v: state.posts.length.toString(), i: <FileText /> }, { l: '프로그램', v: state.programs.length.toString(), i: <Target /> }, { l: '코치', v: state.trainers.length.toString(), i: <Users /> } ].map(s => (
          <div key={s.l} className="bg-surface p-10 rounded-[2rem] border border-white/5 flex justify-between items-center shadow-2xl">
            <div className="space-y-2"><p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">{s.l}</p><p className="text-3xl font-black italic tracking-tighter">{s.v}</p></div>
            <div className="text-primary">{s.i}</div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

const AdminCMS: React.FC = () => {
  const { state, addProgram, addTrainer } = useApp();
  return (
    <AdminLayout>
      <h1 className="text-4xl font-black italic uppercase mb-12">Content CMS</h1>
      <section className="mb-24">
        <div className="flex justify-between items-end mb-8 border-b border-white/5 pb-4"><h2 className="text-2xl font-black italic uppercase">Programs</h2><button onClick={() => addProgram({ id: Date.now().toString(), title: 'New Program', description: '', icon: 'target', imageUrl: 'https://picsum.photos/600/400' })} className="bg-primary px-4 py-2 rounded-xl text-[10px] font-black uppercase text-white"><Plus size={14} className="inline mr-1" /> New</button></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">{state.programs.map(p => <AdminProgramCard key={p.id} program={p} />)}</div>
      </section>
      <section className="mb-24">
        <div className="flex justify-between items-end mb-8 border-b border-white/5 pb-4"><h2 className="text-2xl font-black italic uppercase">Elite Crew</h2><button onClick={() => addTrainer({ id: Date.now().toString(), name: 'New Coach', role: 'Trainer', bio: '', imageUrl: 'https://picsum.photos/400/500', specialties: ['Box'] })} className="bg-primary px-4 py-2 rounded-xl text-[10px] font-black uppercase text-white"><Plus size={14} className="inline mr-1" /> New</button></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">{state.trainers.map(t => <AdminTrainerCard key={t.id} trainer={t} />)}</div>
      </section>
    </AdminLayout>
  );
};

const AdminPosts: React.FC = () => {
  const { state, addPost, updatePost, deletePost } = useApp();
  const [isAdd, setIsAdd] = useState(false);
  const [form, setForm] = useState<Partial<Post>>({ title: '', category: 'NOTICE', content: '', author: 'Admin', imageUrl: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAdd = () => {
    if (!form.title || !form.content) return;
    addPost({ id: Date.now().toString(), title: form.title!, category: form.category as any, content: form.content!, date: new Date().toISOString().split('T')[0], author: form.author!, imageUrl: form.imageUrl || 'https://picsum.photos/800/600', comments: [] });
    setIsAdd(false); setForm({ title: '', category: 'NOTICE', content: '', author: 'Admin', imageUrl: '' });
  };

  return (
    <AdminLayout>
      <header className="flex justify-between items-end mb-16"><h1 className="text-4xl font-black italic uppercase tracking-tighter">Insights Board</h1><button onClick={() => setIsAdd(true)} className="bg-primary px-8 py-3 rounded-2xl font-black uppercase text-[10px] text-white shadow-lg"><Plus size={18} className="inline mr-1"/> New Insight</button></header>
      {isAdd && (
        <div className="fixed inset-0 z-[150] bg-black/95 flex items-center justify-center p-6 animate-fade-in"><div className="bg-surface w-full max-w-2xl rounded-[3rem] p-10 border border-white/10 space-y-6 shadow-2xl">
            <h2 className="text-xl font-black uppercase italic">Create Insight</h2>
            <ImageUpload label="대표 이미지" currentImage={form.imageUrl} onImageChange={b => setForm({...form, imageUrl: b})} />
            <input className="w-full bg-black border border-white/10 rounded-xl p-4 font-bold outline-none focus:border-primary" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Title" />
            <textarea className="w-full h-40 bg-black border border-white/10 rounded-xl p-4 keep-breaks outline-none focus:border-primary" value={form.content} onChange={e => setForm({...form, content: e.target.value})} placeholder="Content..." />
            <div className="flex gap-4"><button onClick={handleAdd} className="flex-1 bg-primary py-4 rounded-xl font-black text-xs uppercase text-white">Save & Post</button><button onClick={() => setIsAdd(false)} className="flex-1 bg-white/5 py-4 rounded-xl font-black text-xs uppercase text-gray-400">Cancel</button></div>
          </div></div>
      )}
      <div className="bg-surface rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-white/5 text-gray-600 font-black uppercase tracking-widest"><tr><th className="p-6">Thumb</th><th className="p-6">Title</th><th className="p-6">Category</th><th className="p-6 text-right">Actions</th></tr></thead>
          <tbody className="divide-y divide-white/5">
            {state.posts.map(p => (
              <tr key={p.id} className="hover:bg-white/[0.02]">
                <td className="p-6"><img src={p.imageUrl} className="w-16 h-10 object-cover rounded-lg" /></td>
                <td className="p-6 font-bold uppercase">{p.title}</td>
                <td className="p-6 text-gray-500">{p.category}</td>
                <td className="p-6 text-right"><button onClick={() => confirm('삭제?') && deletePost(p.id)} className="p-2 text-gray-700 hover:text-red-500"><Trash2 size={18}/></button></td>
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
  const [saved, setSaved] = useState(false);
  const handleSave = () => { updateConfig(tmp); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  return (
    <AdminLayout>
      <h1 className="text-4xl font-black italic uppercase mb-12">Site Engine</h1>
      <div className="space-y-10 pb-24">
        <section className="bg-surface p-10 rounded-[2.5rem] border border-white/5 space-y-8 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2"><label className="text-[10px] font-black uppercase text-gray-600">Site Name</label><input className="w-full bg-black border border-white/10 rounded-2xl p-4 font-black uppercase" value={tmp.siteName} onChange={e => setTmp({...tmp, siteName: e.target.value})} /></div>
            <div className="space-y-2"><label className="text-[10px] font-black uppercase text-gray-600">Color</label><div className="flex gap-4"><input type="color" className="w-14 h-14 bg-black rounded-xl p-1" value={tmp.primaryColor} onChange={e => setTmp({...tmp, primaryColor: e.target.value})} /><input className="flex-1 bg-black border border-white/10 rounded-2xl p-4" value={tmp.primaryColor} onChange={e => setTmp({...tmp, primaryColor: e.target.value})} /></div></div>
          </div>
          <ImageUpload label="히어로 이미지" currentImage={tmp.heroImageUrl} onImageChange={b => setTmp({...tmp, heroImageUrl: b})} />
          <input className="w-full bg-black border border-white/10 rounded-2xl p-4 font-black italic uppercase" value={tmp.heroTitle} onChange={e => setTmp({...tmp, heroTitle: e.target.value})} />
          <textarea className="w-full h-32 bg-black border border-white/10 rounded-2xl p-4" value={tmp.heroSubtitle} onChange={e => setTmp({...tmp, heroSubtitle: e.target.value})} />
        </section>
        <button onClick={handleSave} className={`w-full py-6 rounded-2xl font-black text-xl transition-all shadow-xl flex items-center justify-center gap-4 uppercase tracking-widest ${saved ? 'bg-green-600' : 'bg-primary'}`}>{saved ? <><CheckCircle size={28}/> Saved</> : <><Save size={28}/> Deploy Settings</>}</button>
      </div>
    </AdminLayout>
  );
};

const AdminLogin: React.FC = () => {
  const { login } = useApp();
  const [pw, setPw] = useState('');
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-surface border border-white/10 rounded-[2.5rem] p-12 text-center shadow-2xl animate-fade-in">
        <div className="w-20 h-20 bg-primary rounded-[1.5rem] flex items-center justify-center mx-auto mb-10"><Lock className="text-black" size={36} /></div>
        <h1 className="text-2xl font-black italic uppercase mb-8">Admin Access</h1>
        <form onSubmit={e => { e.preventDefault(); login(pw); }} className="space-y-6">
          <input type="password" placeholder="PASSWORD" className="w-full bg-black border border-white/10 rounded-2xl p-5 text-center text-2xl outline-none focus:border-primary font-black uppercase tracking-widest shadow-inner transition-all" value={pw} onChange={e => setPw(e.target.value)} autoFocus />
          <button className="w-full bg-primary py-5 rounded-2xl font-black text-white uppercase tracking-widest text-sm shadow-xl shadow-primary/30">Unlock</button>
        </form>
      </div>
    </div>
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
              <Route path="/board" element={<BoardPage />} />
              <Route path="/board/:id" element={<PostDetailPage />} />
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
