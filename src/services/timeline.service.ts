import mongoose from "mongoose";
import {Analysis } from "../modules/Analysis.Modal.js";
import { ApiError } from "../utils/ApiError.js";

export interface ITimelinePeriod {
  period: string;
  readability: number;
  efficiency: number;
  security: number;
  maintainability: number;
  bestPractices: number;
  overallScore: number;
}

const getTimeline = async (
  userId: mongoose.Types.ObjectId,
  groupBy: "week" | "month" = "month"
): Promise<ITimelinePeriod[] | ApiError> => {
  console.log("run Timeline ");
  
  const dateFormat = groupBy === "week" ? "%Y-W%V" : "%Y-%m";

  try {
    const result = await Analysis.aggregate([
    // ── 1. only this user ─────────────────────────────────
    { $match: { userId } },

    // ── 2. group by period, avg all 5 dimensions ──────────
    {
      $group: {
        _id: {
          $dateToString: { format: dateFormat, date: "$createdAt" },
        },
        readability:     { $avg: "$scores.readability.score" },
        efficiency:      { $avg: "$scores.efficiency.score" },
        security:        { $avg: "$scores.security.score" },
        maintainability: { $avg: "$scores.maintainability.score" },
        bestPractices:   { $avg: "$scores.bestPractices.score" },
        overallScore:    { $avg: "$overallScore" },
      },
    },

    // ── 3. sort oldest → newest ───────────────────────────
    { $sort: { _id: 1 } },

    // ── 4. clean shape ────────────────────────────────────
    {
      $project: {
        _id: 0,
        period: "$_id",
        readability:     { $round: ["$readability", 1] },
        efficiency:      { $round: ["$efficiency", 1] },
        security:        { $round: ["$security", 1] },
        maintainability: { $round: ["$maintainability", 1] },
        bestPractices:   { $round: ["$bestPractices", 1] },
        overallScore:    { $round: ["$overallScore", 1] },
      },
    },
  ]);

  return result as ITimelinePeriod[];
   } catch (error) {
        return new ApiError(500 , "Failed to fetch skill timeline.") 
  }
};

export const timelineService = { getTimeline };