import mongoose, { Document, Schema } from "mongoose";

export interface IRecommendationItem {
  topic: string;
  reason: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  resourceType: "documentation" | "video" | "practice" | "book";
}

export interface IUserRecommendation extends Document {
  userId: mongoose.Types.ObjectId;
  recommendations: IRecommendationItem[];
  generatedAt: Date;
  patternVersion: Date;
}

const RecommendationItemSchema = new Schema<IRecommendationItem>(
  {
    topic:        { type: String, required: true },
    reason:       { type: String, required: true },
    difficulty:   { type: String, enum: ["beginner", "intermediate", "advanced"], required: true },
    resourceType: { type: String, enum: ["documentation", "video", "practice", "book"], required: true },
  },
  { _id: false }
);

const UserRecommendationSchema = new Schema<IUserRecommendation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    recommendations: { type: [RecommendationItemSchema], default: [] },
    generatedAt:     { type: Date, default: Date.now },
    patternVersion:  { type: Date, required: true },
  },
  { timestamps: false }
);

export default mongoose.model<IUserRecommendation>(
  "UserRecommendation",
  UserRecommendationSchema
);