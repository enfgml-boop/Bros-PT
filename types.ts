
export interface Post {
  id: string;
  title: string;
  category: 'NOTICE' | 'TIPS' | 'EVENT';
  content: string;
  date: string;
  author: string;
  imageUrl?: string;
}

export interface Program {
  id: string;
  title: string;
  description: string;
  icon: string;
  imageUrl: string;
  consultUrl?: string;
}

export interface Trainer {
  id: string;
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
  specialties: string[];
  consultUrl?: string;
}

export interface SiteConfig {
  siteName: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  primaryColor: string;
  contactNumber: string;
  address: string;
  instagram: string;
  youtube: string;
  kakao: string;
}

export type AppState = {
  posts: Post[];
  programs: Program[];
  trainers: Trainer[];
  config: SiteConfig;
};
