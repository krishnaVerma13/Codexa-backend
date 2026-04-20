import { Types } from "mongoose";

export type AnalysisSourceType = "editor" | "github";

// analysis.types.ts — canonical types, used everywhere
export interface IDimensionScore {
  score: number;
  reason: string;
}

export interface IAnalysisScores {
  readability: IDimensionScore;
  efficiency: IDimensionScore;
  security: IDimensionScore;
  maintainability: IDimensionScore;
  bestPractices: IDimensionScore;
}

export interface IRawAIAnalysis {
  scores: IAnalysisScores;
  overallScore: number;
}

// Request body for editor analysis
export interface IAnalyzeFromEditorBody {
  code: string;
  language: string;
  fileName?: string | undefined;
}

// Request body for GitHub file analysis
export interface IAnalyzeFromGithubBody {
  code: string;
  language: string;
  repoName: string;
  fileName: string;
}

// What gets saved to MongoDB (mirrors Analysis.model.ts)
export interface IAnalysisDocument {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  language: string;
  sourceType: AnalysisSourceType;
  fileName?: string | undefined;
  repoName?: string;
  codeSnapshot: string;
  scores: IAnalysisScores;
  overallScore: number;
  createdAt: Date;
}

// Paginated history response
export interface IAnalysisHistoryQuery {
  page?: string;
  limit?: string;
}