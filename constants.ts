
import { Post, Program, Trainer, SiteConfig } from './types';

export const INITIAL_CONFIG: SiteConfig = {
  siteName: 'Bros PT',
  heroTitle: 'LIMITLESS PERFORMANCE',
  heroSubtitle: '한계를 넘어선 진정한 변화. 브로스 PT에서 당신의 잠재력을 깨우세요.',
  heroImageUrl: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
  primaryColor: '#8A2BE2',
  contactNumber: '02-1234-5678',
  address: '서울특별시 강남구 테헤란로 브로스빌딩 B1',
  instagram: 'https://instagram.com/brospt',
  youtube: 'https://youtube.com/brospt',
  kakao: 'https://pf.kakao.com/brospt'
};

export const INITIAL_POSTS: Post[] = [
  {
    id: '1',
    title: '신규 회원 30% 할인 이벤트 안내',
    category: 'EVENT',
    content: '올 여름, 브로스 PT와 함께 뜨거운 땀방울을 흘려보세요. 선착순 20명 한정!',
    date: '2024-05-20',
    author: '관리자',
    imageUrl: 'https://picsum.photos/seed/boxing1/800/600'
  },
  {
    id: '2',
    title: 'MMA를 시작해야 하는 5가지 이유',
    category: 'TIPS',
    content: '종합격투기는 단순한 운동을 넘어 자기방어와 멘탈 트레이닝에 탁월합니다...',
    date: '2024-05-18',
    author: '헤드코치',
    imageUrl: 'https://picsum.photos/seed/mma1/800/600'
  },
  {
    id: '3',
    title: '식단 관리가 운동만큼 중요한 이유',
    category: 'TIPS',
    content: '근육 성장과 체지방 감량의 핵심은 70%가 식단입니다. 어떻게 먹어야 할까요?',
    date: '2024-05-15',
    author: '관리자',
    imageUrl: 'https://picsum.photos/seed/diet1/800/600'
  }
];

export const INITIAL_PROGRAMS: Program[] = [
  {
    id: 'p1',
    title: '1:1 퍼스널 트레이닝',
    description: '개인의 체력 수준과 목표에 맞춘 맞춤형 코칭 프로그램입니다.',
    icon: 'target',
    imageUrl: 'https://picsum.photos/seed/pt1/600/400'
  },
  {
    id: 'p2',
    title: '그룹 복싱 클래스',
    description: '기초부터 실전 스파링까지, 활기찬 분위기에서 배우는 복싱 기술.',
    icon: 'users',
    imageUrl: 'https://picsum.photos/seed/boxing2/600/400'
  },
  {
    id: 'p3',
    title: 'MMA 마스터 과정',
    description: '타격과 그래플링을 통합적으로 배우는 실전 격투기 전문가 과정.',
    icon: 'shield',
    imageUrl: 'https://picsum.photos/seed/mma2/600/400'
  }
];

export const INITIAL_TRAINERS: Trainer[] = [
  {
    id: 't1',
    name: '김브로',
    role: '헤드 코치',
    bio: '전 프로 복싱 챔피언 출신으로 15년 이상의 티칭 경력을 보유하고 있습니다.',
    imageUrl: 'https://picsum.photos/seed/trainer1/400/500',
    specialties: ['정통 복싱', '선수 육성', '컨디셔닝']
  },
  {
    id: 't2',
    name: '이격투',
    role: 'MMA 수석 코치',
    bio: '주짓수 블랙벨트 및 다수의 MMA 대회 우승 경험이 있는 실전 전문가입니다.',
    imageUrl: 'https://picsum.photos/seed/trainer2/400/500',
    specialties: ['주짓수', '레슬링', '킥복싱']
  }
];
