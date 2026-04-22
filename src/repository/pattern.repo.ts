
import mongoose from "mongoose";
import UserPattern, { type IUserPattern } from "../modules/UserPattern.Model.js";

const upsertPattern = async (
  userId: mongoose.Types.ObjectId,
  patterns: string[],
  basedOnCount: number
): Promise<IUserPattern | void> => {
  const doc = await UserPattern.findOneAndUpdate(
    { userId },
    {
      patterns,
      basedOnCount,
      lastUpdatedAt: new Date(),
    },
    { upsert: true, new: true }
  );
  // return doc;
};

const getPatternByUserId = async (
  userId: mongoose.Types.ObjectId
): Promise<IUserPattern | null> => {
  return UserPattern.findOne({ userId }).lean<IUserPattern>();
};

export const patternsRepository = {
  upsertPattern,
  getPatternByUserId,
};