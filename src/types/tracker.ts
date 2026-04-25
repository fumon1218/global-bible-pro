export interface FamilyMember {
  id: string;
  name: string;
  color: string;
  dotColor: string;
  label: string;
  avatarUrl?: string;
}

export interface ReadStatus {
  [bookName: string]: {
    [chapterIdx: string]: string[]; // Array of member IDs
  };
}

export interface BibleBook {
  id: number | string;
  name: string;
  chapters: number;
  category: 'OT' | 'NT';
}
