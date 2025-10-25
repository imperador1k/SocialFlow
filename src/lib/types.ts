export interface Task {
  id: number;
  text: string;
  completed: boolean;
}

export type ContentType = "Humor/Meme" | "Skill/Treino" | "Mindset/Rotina" | "YouTube";

export interface ContentIdea {
  id: number;
  description: string;
  videoLink: string;
  contentType: ContentType;
  isFavorite: boolean;
  isCompleted: boolean;
}

export interface Creator {
  id: number;
  name: string;
  photoUrl: string;
  category: ContentType;
  socialLink: string;
}

export interface CalendarEvent {
    id: number;
    title: string;
    date: Date;
    platform: 'Instagram' | 'TikTok' | 'YouTube';
    contentType: ContentType;
}
