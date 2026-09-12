import { Category, Post } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-ssc', name: 'Ssc', slug: 'ssc', order_index: 1, description: 'SSC Level Resources', icon_name: 'BookOpen' },
  { id: 'cat-hsc', name: 'Hsc', slug: 'hsc', order_index: 2, description: 'HSC Level Resources', icon_name: 'BookOpen' },
  { id: 'cat-university', name: 'University', slug: 'university', order_index: 3, description: 'University Admission', icon_name: 'GraduationCap' },
  { id: 'cat-uni-varsity', name: 'ভার্সিটি', slug: 'varsity', order_index: 4, parent_id: 'cat-university', description: 'Varsity Admission' },
  { id: 'cat-uni-medical', name: 'মেডিকেল', slug: 'medical', order_index: 5, parent_id: 'cat-university', description: 'Medical Admission' },
  { id: 'cat-uni-engineering', name: 'Engineering', slug: 'engineering', order_index: 6, parent_id: 'cat-university', description: 'Engineering Admission' },
  { id: 'cat-skill', name: 'Skill', slug: 'skill', order_index: 7, description: 'Skill Development', icon_name: 'Zap' },
  { id: 'cat-kit', name: 'Kit', slug: 'kit', order_index: 8, description: 'Preparation Kits', icon_name: 'Sparkles' },
  { id: 'cat-class', name: 'Class', slug: 'class', order_index: 9, description: 'Class Resources', icon_name: 'Users' },
];

export const INITIAL_POSTS: Post[] = [];
