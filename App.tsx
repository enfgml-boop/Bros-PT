
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

// --- Context & State Management ---

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
  
  const addComment = (postId: string, comment: Comment) => setState(prev => ({
    ...prev,
    posts: prev.posts.map(p => p.id === postId ? {
      ...p,
      comments: [...(p.comments || []), comment]
    } : p)
  }));

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
      state, updateConfig, addPost, updatePost, deletePost, addComment,
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
  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</label>
      <div onClick={() => fileInputRef.current?.click()} className="group relative w-full h-44 bg-black border border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-all overflow-hidden shadow-inner">
        {currentImage ? (
          <>
            <img src={currentImage} className="w-full h-full object-cover opacity-50 group-hover:opacity-30 transition-opacity" alt="Preview" />
            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={28} className="text-white mb-2" />
              <span className="text-white text-[10px] font-black uppercase tracking-tighter">사진 변경</span>
            </div>
          </>
        ) : (
          <><Upload size={28} className="text-gray-700 mb-2" /><span className="text-gray-600 text-[10px] font-black uppercase tracking-widest">사진 업로드</span></>
        )}
      </div>
      <input type="file" ref={fileInputRef} onChange={async (e) => {
        const file = e.target.files?.[0];
        if (file) onImageChange(await fileToBase64(file));
      }} className="hidden" accept="image/*" />
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
    { name: '게시판', path: '/board' }
  ];

  return (
    <nav className="fixed w-full z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="text-2xl font-black italic tracking-tighter flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
            <span className="text-black font-black text-sm">B</span>
          </div>
          <span className="uppercase text-lg">{state.config.siteName}</span>
        </Link>
        <div className="hidden md:flex items-center space-x-10">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className={`text-xs font-bold tracking-widest uppercase transition-all hover:text-primary ${location.pathname === item.path ? 'text-primary' : 'text-gray-400'}`}>
              {item.name}
            </Link>
          ))}
          <Link to="/admin" className="text-gray-600 hover:text-white"><Shield size={18} /></Link>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white"><Menu size={28} /></button>
      </div>
      {isOpen && (
        <div className="md:hidden bg-black border-b border-white/10 p-6 space-y-4 animate-fade-in shadow-2xl">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)} className="block text-2xl font-black italic uppercase text-gray-200 hover:text-primary">
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

// --- Pages ---

const HomePage: React.FC = () => {
  const { state } = useApp();
  return (
    <div className="animate-fade-in">
      <section className="relative h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={state.config.heroImageUrl} className="w-full h-full object-cover opacity-60 scale-105" alt="" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/70"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <h1 className="text-6xl md:text-[8rem] font-black italic uppercase leading-[0.9] tracking-tighter mb-8 animate-fade-in">
            {state.config.heroTitle}
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mb-12 keep-breaks font-medium">
            {state.config.heroSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-5">
            <Link to="/programs" className="bg-primary text-white font-black py-5 px-12 rounded-full shadow-2xl shadow-primary/20 text-center uppercase tracking-widest text-sm hover:scale-105 transition-all">
              Programs
            </Link>
          </div>
        </div>
      </section>
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
            {post.imageUrl && <div className="aspect-video overflow-hidden"><img src={post.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-60" alt="" /></div>}
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
  const [commentForm, setCommentForm] = useState({ author: '', content: '' });

  if (!post) return <div className="pt-40 text-center">포스트를 찾을 수 없습니다.</div>;

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentForm.author || !commentForm.content) return;
    addComment(post.id, {
      id: Date.now().toString(),
      author: commentForm.author,
      content: commentForm.content,
      date: new Date().toISOString().split('T')[0]
    });
    setCommentForm({ author: '', content: '' });
  };

  return (
    <div className="pt-32 pb-24 animate-fade-in">
      <div className="max-w-4xl mx-auto px-6">
        <Link to="/board" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-10 text-xs font-black uppercase tracking-widest">
          <ArrowLeft size={16} /> Back to Board
        </Link>
        {post.imageUrl && <img src={post.imageUrl} className="w-full h-auto rounded-[3rem] mb-12 shadow-2xl border border-white/5" alt="" />}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 bg-primary/20 text-primary text-[10px] font-black uppercase rounded-lg">{post.category}</span>
            <span className="text-gray-600 text-xs font-bold uppercase tracking-widest">{post.date}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-tight">{post.title}</h1>
          <p className="text-gray-300 text-lg md:text-xl leading-relaxed keep-breaks font-medium opacity-80 py-10 border-b border-white/10">
            {post.content}
          </p>
        </div>

        {/* 댓글 섹션 */}
        <section className="mt-20 space-y-12">
          <h3 className="text-2xl font-black uppercase italic flex items-center gap-3">
            Comments <span className="text-primary">{post.comments?.length || 0}</span>
          </h3>
          
          <form onSubmit={handleCommentSubmit} className="bg-surface p-8 rounded-3xl border border-white/5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                className="bg-black border border-white/10 rounded-xl p-4 text-sm font-bold outline-none focus:border-primary" 
                placeholder="Name" 
                value={commentForm.author} 
                onChange={e => setCommentForm({...commentForm, author: e.target.value})}
              />
            </div>
            <textarea 
              className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm h-32 resize-none outline-none focus:border-primary" 
              placeholder="Leave a comment..."
              value={commentForm.content}
              onChange={e => setCommentForm({...commentForm, content: e.target.value})}
            />
            <button className="bg-primary text-white font-black py-4 px-10 rounded-xl text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all">
              <Send size={16}/> Post Comment
            </button>
          </form>

          <div className="space-y-8">
            {post.comments?.map(c => (
              <div key={c.id} className="border-b border-white/5 pb-8 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-primary font-black uppercase text-xs tracking-widest">{c.author}</span>
                  <span className="text-gray-600 text-[10px] font-bold">{c.date}</span>
                </div>
                <p className="text-gray-400 text-sm font-medium leading-relaxed">{c.content}</p>
              </div>
            ))}
            {(!post.comments || post.comments.length === 0) && (
              <p className="text-gray-700 text-sm font-bold uppercase tracking-widest text-center py-10">첫 댓글을 남겨보세요.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

// --- Admin Sub-Components with Save Buttons ---

const AdminProgramCard: React.FC<{ program: Program }> = ({ program }) => {
  const { updateProgram, deleteProgram } = useApp();
  const [local, setLocal] = useState<Program>(program);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    updateProgram(local);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="bg-surface p-6 rounded-[2rem] border border-white/5 space-y-6 shadow-2xl relative animate-fade-in">
      <button onClick={() => confirm('삭제?') && deleteProgram(program.id)} className="absolute top-4 right-4 p-2 text-gray-700 hover:text-red-500"><Trash2 size={18}/></button>
      <ImageUpload label="프로그램 이미지" currentImage={local.imageUrl} onImageChange={b => setLocal({...local, imageUrl: b})} />
      <div className="space-y-4">
        <input className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm font-black uppercase focus:border-primary" value={local.title} onChange={e => setLocal({...local, title: e.target.value})} placeholder="Title" />
        <textarea className="w-full h-24 bg-black border border-white/10 rounded-xl p-4 text-sm focus:border-primary" value={local.description} onChange={e => setLocal({...local, description: e.target.value})} placeholder="Description" />
      </div>
      <button onClick={handleSave} className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${isSaved ? 'bg-green-600' : 'bg-primary'}`}>
        {isSaved ? <><CheckCircle size={14}/> Saved</> : <><Save size={14}/> 이 프로그램 저장</>}
      </button>
    </div>
  );
};

const AdminTrainerCard: React.FC<{ trainer: Trainer }> = ({ trainer }) => {
  const { updateTrainer, deleteTrainer } = useApp();
  const [local, setLocal] = useState<Trainer>(trainer);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    updateTrainer(local);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="bg-surface p-6 rounded-[2rem] border border-white/5 space-y-6 shadow-2xl relative animate-fade-in">
      <button onClick={() => confirm('삭제?') && deleteTrainer(trainer.id)} className="absolute top-4 right-4 p-2 text-gray-700 hover:text-red-500"><Trash2 size={18}/></button>
      <ImageUpload label="프로필 사진" currentImage={local.imageUrl} onImageChange={b => setLocal({...local, imageUrl: b})} />
      <div className="grid grid-cols-2 gap-4">
        <input className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm font-black uppercase focus:border-primary" value={local.name} onChange={e => setLocal({...local, name: e.target.value})} placeholder="Name" />
        <input className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm font-bold focus:border-primary" value={local.role} onChange={e => setLocal({...local, role: e.target.value})} placeholder="Role" />
      </div>
      <textarea className="w-full h-32 bg-black border border-white/10 rounded-xl p-4 text-sm focus:border-primary" value={local.bio} onChange={e => setLocal({...local, bio: e.target.value})} placeholder="Bio" />
      <button onClick={handleSave} className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${isSaved ? 'bg-green-600' : 'bg-primary'}`}>
        {isSaved ? <><CheckCircle size={14}/> Saved</> : <><Save size={14}/> 이 코치 저장</>}
      </button>
    </div>
  );
};

// --- Admin Main Sections ---

const AdminCMS: React.FC = () => {
  const { state, addProgram, addTrainer } = useApp();
  return (
    <AdminLayout>
      <header className="mb-16">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">Content CMS</h1>
        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-2">수정 후 반드시 각 카드의 [저장] 버튼을 눌러주세요.</p>
      </header>
      <section className="mb-24">
        <div className="flex justify-between items-end mb-8 border-b border-white/5 pb-4">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter">Programs</h2>
          <button onClick={() => addProgram({ id: Date.now().toString(), title: 'New Program', description: '', icon: 'target', imageUrl: 'https://picsum.photos/600/400' })} className="bg-primary px-6 py-2 rounded-xl text-[10px] font-black uppercase text-white"><Plus size={14} className="inline mr-1" /> New</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {state.programs.map(p => <AdminProgramCard key={p.id} program={p} />)}
        </div>
      </section>
      <section className="mb-24">
        <div className="flex justify-between items-end mb-8 border-b border-white/5 pb-4">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter">Elite Crew</h2>
          <button onClick={() => addTrainer({ id: Date.now().toString(), name: 'New Coach', role: 'Trainer', bio: '', imageUrl: 'https://picsum.photos/400/500', specialties: ['Box'] })} className="bg-primary px-6 py-2 rounded-xl text-[10px] font-black uppercase text-white"><Plus size={14} className="inline mr-1" /> New</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {state.trainers.map(t => <AdminTrainerCard key={t.id} trainer={t} />)}
        </div>
      </section>
    </AdminLayout>
  );
};

const PostAdminRow: React.FC<{ post: Post }> = ({ post }) => {
  const { updatePost, deletePost } = useApp();
  const [isEdit, setIsEdit] = useState(false);
  const [local, setLocal] = useState<Post>(post);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    updatePost(local);
    setIsSaved(true);
    setTimeout(() => { setIsSaved(false); setIsEdit(false); }, 1500);
  };

  if (isEdit) {
    return (
      <tr className="bg-white/[0.03]">
        <td colSpan={4} className="p-8">
          <div className="bg-black p-8 rounded-[2rem] border border-white/10 space-y-6">
            <ImageUpload label="게시물 이미지" currentImage={local.imageUrl} onImageChange={b => setLocal({...local, imageUrl: b})} />
            <input className="w-full bg-surface border border-white/10 rounded-xl p-4 font-black uppercase" value={local.title} onChange={e => setLocal({...local, title: e.target.value})} />
            <textarea className="w-full h-40 bg-surface border border-white/10 rounded-xl p-4 keep-breaks" value={local.content} onChange={e => setLocal({...local, content: e.target.value})} />
            <div className="flex gap-4">
              <button onClick={handleSave} className="flex-1 bg-primary py-4 rounded-xl font-black text-xs uppercase text-white shadow-lg">{isSaved ? 'Saved' : 'Save Changes'}</button>
              <button onClick={() => setIsEdit(false)} className="flex-1 bg-white/5 py-4 rounded-xl font-black text-xs uppercase text-gray-500">Cancel</button>
            </div>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="hover:bg-white/[0.02] border-b border-white/5">
      <td className="p-6"><img src={post.imageUrl} className="w-16 h-10 object-cover rounded-lg border border-white/10" alt="" /></td>
      <td className="p-6"><p className="font-black text-sm uppercase tracking-tighter">{post.title}</p><p className="text-gray-600 text-[10px] mt-1">{post.date}</p></td>
      <td className="p-6"><span className="px-2 py-1 bg-white/5 rounded text-[10px] text-gray-500 font-bold uppercase">{post.category}</span></td>
      <td className="p-6 text-right"><div className="flex justify-end gap-3"><button onClick={() => setIsEdit(true)} className="p-2 text-gray-600 hover:text-primary"><Edit3 size={18}/></button><button onClick={() => confirm('삭제?') && deletePost(post.id)} className="p-2 text-gray-600 hover:text-red-500"><Trash2 size={18}/></button></div></td>
    </tr>
  );
};

const AdminPosts: React.FC = () => {
  const { state, addPost } = useApp();
  const [isAdd, setIsAdd] = useState(false);
  const [form, setForm] = useState<Partial<Post>>({ title: '', category: 'NOTICE', content: '', author: 'Admin', imageUrl: '' });

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
      <div className="bg-surface rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-white/5 text-gray-600 font-black uppercase tracking-widest"><tr><th className="p-6">Thumb</th><th className="p-6">Title</th><th className="p-6">Category</th><th className="p-6 text-right">Actions</th></tr></thead><tbody className="divide-y divide-white/5">{state.posts.map(p => <PostAdminRow key={p.id} post={p} />)}</tbody></table></div>
    </AdminLayout>
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
      <aside className={`fixed lg:relative z-[90] w-72 h-screen border-r border-white/10 bg-[#080808] flex flex-col p-8 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="text-xl font-black italic mb-16 flex items-center gap-2">BROS ADMIN</div>
        <nav className="flex-1 space-y-3">
          {menu.map(m => (
            <Link key={m.p} to={m.p} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-4 p-4 rounded-2xl font-bold transition-all text-sm ${loc.pathname === m.p ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
              {m.i} {m.n}
            </Link>
          ))}
        </nav>
        <div className="pt-8 border-t border-white/5 space-y-3">
          <button onClick={logout} className="w-full flex items-center gap-4 p-4 text-gray-700 hover:text-red-500 text-xs font-bold transition-colors"><LogOut size={18}/> 로그아웃</button>
          <Link to="/" className="flex items-center gap-4 p-4 text-gray-700 hover:text-white text-xs font-bold transition-colors"><HomeIcon size={18}/> 사이트 홈</Link>
        </div>
      </aside>
      <main className="flex-1 p-6 md:p-12 overflow-y-auto w-full">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>
      <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="lg:hidden fixed bottom-6 right-6 z-[100] w-14 h-14 bg-primary rounded-full shadow-2xl flex items-center justify-center text-black">
        {isSidebarOpen ? <X size={28}/> : <Menu size={28}/>}
      </button>
    </div>
  );
};

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
          <input type="password" placeholder="PASSWORD" className="w-full bg-black border border-white/10 rounded-2xl p-5 text-center text-2xl outline-none focus:border-primary font-black uppercase tracking-widest shadow-inner transition-all" value={pw} onChange={e => { setPw(e.target.value); setError(false); }} autoFocus />
          {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">Access Denied</p>}
          <button className="w-full bg-primary py-5 rounded-2xl font-black text-white uppercase tracking-widest text-sm shadow-xl shadow-primary/30 transition-all active:scale-95">Unlock</button>
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
              <Route path="/board" element={<BoardPage />} />
              <Route path="/board/:id" element={<PostDetailPage />} />
              <Route path="/admin" element={<AdminCMS />} />
              <Route path="/admin/posts" element={<AdminPosts />} />
              <Route path="/admin/cms" element={<AdminCMS />} />
              {/* Other pages omitted for brevity in snippet, assume standard rendering */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AppProvider>
  );
};

export default App;
