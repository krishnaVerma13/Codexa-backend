import mongoose, { Document, Schema } from "mongoose";

export interface IUserPattern extends Document {
  userId: mongoose.Types.ObjectId;
  patterns: string[];
  basedOnCount: number;
  lastUpdatedAt: Date;
}

const UserPatternSchema = new Schema<IUserPattern>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    patterns: {
      type: [String],
      default: [],
    },
    basedOnCount: {
      type: Number,
      required: true,
    },
    lastUpdatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

export default mongoose.model<IUserPattern>("UserPattern", UserPatternSchema);