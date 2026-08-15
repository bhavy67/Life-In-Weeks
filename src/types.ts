export interface UserConfig {
  name: string;
  birthday: string; // "YYYY-MM-DD"
  lifespan: number;
}

export interface Milestone {
  id: string;
  weekIndex: number; // absolute weeks from birth, 0-based
  title: string;
  description?: string;
  emoji?: string;
  date?: string; // "YYYY-MM-DD" — optional specific day within the week
}

export interface Era {
  id: string;
  name: string;
  color: string; // hex
  startWeek: number; // absolute week index
  endWeek: number;
}

export type ViewMode = 'weeks' | 'months' | 'years';
export type CellStatus = 'past' | 'current' | 'future';
