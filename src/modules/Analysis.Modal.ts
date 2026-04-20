import mongoose, { Document, Schema } from "mongoose";

export interface IDimensionScore {
  score: number;
  reason: string;
}

export interface IAnalysis extends Document {
  userId: mongoose.Types.ObjectId;
  language: string;
  sourceType: "editor" | "github";
  fileName?: string;
  repoName?: string;
  codeSnapshot: string;
  scores: {
    readability: IDimensionScore;
    efficiency: IDimensionScore;
    security: IDimensionScore;
    maintainability: IDimensionScore;
    bestPractices: IDimensionScore;
  };
  overallScore: number;
  createdAt: Date;
}

const DimensionScoreSchema = new Schema<IDimensionScore>(
  {
    score: { type: Number, required: true, min: 0, max: 100 },
    reason: { type: String, required: true },
  },
  { _id: false }
);

const AnalysisSchema = new Schema<IAnalysis>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    language: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    sourceType: {
      type: String,
      enum: ["editor", "github"],
      required: true,
    },
    fileName: {
      type: String,
      trim: true,
    },
    repoName: {
      type: String,
      trim: true,
    },
    codeSnapshot: {
      type: String,
      required: true,
    },
    scores: {
      readability: { type: DimensionScoreSchema, required: true },
      efficiency: { type: DimensionScoreSchema, required: true },
      security: { type: DimensionScoreSchema, required: true },
      maintainability: { type: DimensionScoreSchema, required: true },
      bestPractices: { type: DimensionScoreSchema, required: true },
    },
    overallScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

// index for fast user history queries (Phase 3 timeline needs this)
AnalysisSchema.index({ userId: 1, createdAt: -1 });

export const Analysis = mongoose.model<IAnalysis>("Analysis", AnalysisSchema);