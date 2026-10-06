export type LanguageOption = 'english' | 'hindi' | 'hinglish';

export interface IdeaItem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Advanced' | string;
  timeMinutes: number;
  materialsNeeded: string[];
  imagePrompt: string;
  imageUrl?: string;
  imageLoading?: boolean;
  imageError?: boolean;
}

export interface AnalyzeResponse {
  items: string[];
  materials: string[];
  safetyWarning?: string | null;
  ideas: IdeaItem[];
  language?: LanguageOption;
  isDemo?: boolean;
}

export type CraftStatus = 'Planned' | 'In progress' | 'Done';

export interface SavedIdea {
  id: string;
  title: string;
  image: string;
  date: string;
  status: CraftStatus;
  materialsNeeded: string[];
  timeMinutes?: number;
  difficulty?: string;
  originalItems?: string[];
}

// Backward-compatible types for explore and ai-service
export interface CraftIdea {
  id: string;
  title: string;
  category?: string;
  summary?: string;
  difficulty: 'Easy' | 'Medium' | 'Advanced' | string;
  estimatedTime?: string;
  timeMinutes?: number;
  divertedWaste?: string;
  materialsNeeded: string[];
  toolsNeeded?: string[];
  imagePrompt: string;
  imageUrl: string;
  quickSteps?: string[];
}

export interface WasteAnalysisResult {
  detectedMaterial: string;
  wasteCategory: string;
  recyclabilityAssessment: string;
  ideas: CraftIdea[];
  isDemoMode?: boolean;
}
