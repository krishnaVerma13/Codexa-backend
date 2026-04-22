import { z } from "zod";

export const analyzeFromEditorSchema = z.object({
  code: z.string().min(1, "Code cannot be empty."),
  language: z.string().min(1, "Language is required."),
  fileName: z.string().optional(),
});

export const analyzeFromGithubSchema = z.object({
  code: z.string().min(1, "Code cannot be empty."),
  language: z.string().min(1, "Language is required."),
  repoName: z.string().min(1, "Repo name is required."),
  fileName: z.string().min(1, "File name is required."),
});

export const analysisHistorySchema = z.object({
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
});

export const timelineQuerySchema = z.object({
  groupBy: z.enum(["week", "month"]).default("month"),
});