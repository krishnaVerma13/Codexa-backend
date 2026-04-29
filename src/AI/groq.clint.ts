import Groq from "groq-sdk";
import { ApiError } from "../utils/ApiError.js";
import type { IRawAIAnalysis } from "../analysis.Type.js";

if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is not defined in environment variables");
}

const groqClient = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export interface IGroqDimensionScore {
  score: number;
  reason: string;
}

export interface IGroqAnalysisResponse {
  scores: {
    readability: IGroqDimensionScore;
    efficiency: IGroqDimensionScore;
    security: IGroqDimensionScore;
    maintainability: IGroqDimensionScore;
    bestPractices: IGroqDimensionScore;
  };
  overallScore: number;
   suggestions: string[];
}

const validateDimension = (dim: unknown): IGroqDimensionScore => {
  if (
    typeof dim === "object" &&
    dim !== null &&
    typeof (dim as Record<string, unknown>).score === "number" &&
    typeof (dim as Record<string, unknown>).reason === "string"
  ) {
    return dim as IGroqDimensionScore;
  }
  throw new ApiError(500, "Groq response has invalid dimension shape.");
};

export const analyzeWithGroq = async (
  prompt: string
): Promise<IRawAIAnalysis> => {


  const response = await groqClient.chat.completions.create({
    // model: "llama-3.1-8b-instant",
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content:
          "You are an expert code reviewer. Always respond with valid JSON only. No explanation, no markdown, no backticks. Just raw JSON.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });
  console.log("----------------raw ---------------------------------",response);
  
  const raw = response.choices[0]?.message?.content;

  if (!raw) throw new ApiError(500, "Groq returned empty response.");

  const parsed = JSON.parse(raw) as Record<string, unknown>;
  const scores = parsed.scores as Record<string, unknown>;
  
  //  console.log("GROQ RAW:", JSON.stringify(parsed, null, 2))
  // console.log("parsed :",parsed);
  // console.log("parsed :",parsed.cleanCode);
  if (!scores) throw new ApiError(500, "Groq response missing scores.");

  // Validate all 5 dimensions explicitly — no implicit void paths
  const validated: IGroqAnalysisResponse = {
    scores: {
      readability:     validateDimension(scores.readability),
      efficiency:      validateDimension(scores.efficiency),
      security:        validateDimension(scores.security),
      maintainability: validateDimension(scores.maintainability),
      bestPractices:   validateDimension(scores.bestPractices),
    },
    overallScore:
      typeof parsed.overallScore === "number"
        ? parsed.overallScore
        : 0, // fallback — will be overwritten by your calculateOverallScore anyway
    suggestions : Array.isArray(parsed.suggestions) ? parsed.suggestions as string[] : [],
  };

  return validated; // ← always returns, no void path
};