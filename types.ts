export interface Judge {
  id: string;
  name: string;
  password_hash: string; // Updated to match DB snake_case
}

export interface Project {
  id: string;
  name: string;
}

export interface Criterion {
  id: string;
  name: string;
}

export interface Rating {
  projectId: string;
  judgeId: string;
  criterionId: string;
  score: number; // 1-10
}

export interface ProjectComment {
  projectId: string;
  judgeId: string;
  text: string;
}

export interface AuthState {
  user: Judge | { name: 'Admin'; id: 'admin' } | null;
  isAdmin: boolean;
}

export interface ProjectStats {
  id: string;
  name: string;
  scores: { [criterionId: string]: number }; // average per criterion
  totalAverage: number;
  rawTotal: number; // sum of all scores
  ratingCount: number;
}