export type FootprintStatus = 'published' | 'draft' | 'default';

export type FootprintVisibleField = 'name' | 'monthlySip' | 'retirementGoal';

export type FootprintRetirementStage = 'accumulation' | 'pre-retirement' | 'retirement';

export type FootprintCategory = 'sip-discipline' | 'healthcare' | 'lifestyle' | 'inflation' | 'other';

export interface FootprintJourneyContext {
  visibleFields: FootprintVisibleField[];
  name?: string;
  monthlySip?: string;
  retirementGoal?: string;
}

export interface FootprintJourney {
  context: FootprintJourneyContext;
  challenges?: string;
  howTheyHandled?: string;
  lesson?: string;
}

export interface FootprintMetrics {
  currentCorpus?: number;
  monthlySip?: number;
  currentAge?: number;
  retirementAge?: number;
  additionalNotes?: string;
}

export interface Footprint {
  id: string;
  title: string;
  story: string;
  challenges?: string;
  howTheyHandled?: string;
  lesson?: string;
  tags?: string[];
  photos?: string[];
  journey?: FootprintJourney;
  retirementStage: FootprintRetirementStage;
  category: FootprintCategory;
  challengeTitle: string;
  challengeDescription: string;
  personalJourneyCounterpart?: string;
  attachedMetrics?: FootprintMetrics;
  createdAt: number;
  isDefault: boolean;
  isPublished: boolean;
  ownerId?: string;
  likeCount?: number;
}

export interface FootprintEntry {
  title: string;
  story: string;
  challenges?: string;
  howTheyHandled?: string;
  lesson?: string;
  tags?: string[];
  photos?: string[];
  journey?: FootprintJourney;
  retirementStage: FootprintRetirementStage;
  category: FootprintCategory;
  personalJourneyCounterpart?: string;
  attachedMetrics?: FootprintMetrics;
  isPublished: boolean;
}

export interface FootprintComment {
  id: string;
  text: string;
  createdAt: string;
  likes: number;
  replies: FootprintReply[];
}

export interface FootprintReply {
  id: string;
  text: string;
  createdAt: string;
  likes: number;
}

export interface FootprintsState {
  likes: Record<string, boolean>;
  comments: Record<string, FootprintComment[]>;
  commentLikes: Record<string, Record<string, number>>;
}
