import type { Timestamp } from 'firebase/firestore';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt?: Timestamp;
}

export type ContentType = "Humor/Meme" | "Skill/Treino" | "Mindset/Rotina" | "YouTube";

export interface ContentIdea {
  id: string;
  description: string;
  videoLink: string;
  contentType: ContentType;
  isFavorite: boolean;
  isCompleted: boolean;
  createdAt?: Timestamp;
}

export interface Creator {
  id: string;
  name: string;
  photoUrl: string;
  category: ContentType;
  socialLink: string;
  createdAt?: Timestamp;
}

export interface CalendarEvent {
    id: string;
    title: string;
    date: Date | Timestamp;
    platform: 'Instagram' | 'TikTok' | 'YouTube';
    contentType: ContentType;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
}
