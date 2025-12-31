export interface MedicineData {
  name: string;
  usage: string;
  sideEffects: string[];
  warning: string;
}

export enum AppState {
  IDLE = 'IDLE',
  SCANNING = 'SCANNING',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface AnalysisError {
  title: string;
  message: string;
}

export type Theme = 'light' | 'dark';
export type Language = 'en' | 'hi';

export interface Plan {
  id: string;
  name: string;
  price: string;
  features: string[];
  recommended?: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

