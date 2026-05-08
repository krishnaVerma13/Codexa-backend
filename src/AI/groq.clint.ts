import Groq from "groq-sdk";
import { ApiError } from "../utils/ApiError.js";
import type { IRawAIAnalysis } from "../analysis.Type.js";
import { userService } from "../services/user.service.js";
import type mongoose from "mongoose";
import { userRepo } from "../repository/user.repo.js";
import { TimeLimit } from "./TimeLimit.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import type { TUser } from "../Types.js";

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





//Count Total token privous token + new token 
const CountToken = async (total_Token: number, userID: mongoose.Types.ObjectId) => {
  const userData = await userRepo.findById(userID)
  if (userData.success == true) {

    const totalToken = Number(total_Token) + Number(userData.data?.tokenUsed)
    await userService.updateUserData(userID, { tokenUsed: totalToken })
    console.log("Store total token in DB :", totalToken);

  } else {
    console.log("Fail to store token in DB :", userData.message);

  }
}



export const analyzeWithGroq = async (prompt: string, userID: mongoose.Types.ObjectId): Promise<IRawAIAnalysis> => {

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
  console.log("----------- Analysis call analysisWithGroq");

  const usage = response.usage?.total_tokens;
  CountToken(usage!, userID)
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
      readability: validateDimension(scores.readability),
      efficiency: validateDimension(scores.efficiency),
      security: validateDimension(scores.security),
      maintainability: validateDimension(scores.maintainability),
      bestPractices: validateDimension(scores.bestPractices),
    },
    overallScore:
      typeof parsed.overallScore === "number"
        ? parsed.overallScore
        : 0, // fallback — will be overwritten by your calculateOverallScore anyway
    suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions as string[] : [],
  };

  return validated; // ← always returns, no void path
};





export const callGroqAnalysis = async (userID: mongoose.Types.ObjectId, prompt: string) => {
  const Groq = (await import("groq-sdk")).default;
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });
  console.log("---------- callGroqAnalysis ----- ");

  const res = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: "Respond with valid JSON only. No markdown.",
      },
      { role: "user", content: prompt },
    ],
  });
  const raw = res.choices[0]?.message?.content;
  const usage = res.usage?.total_tokens;
  // console.log("usage :", usage);

  CountToken(usage!, userID)
  return raw
}


export const CheckUserTokenLimite = async (userId: mongoose.Types.ObjectId): Promise<ApiResponce<TUser | null> | ApiError> => {
  console.log("---------------call CheckUserTokenLimite ");

  const userData = await userRepo.findById(userId)
  if (userData.success == true) {

    if (userData.data?.isSubscribed) {
      return new ApiResponce(200, "User have a subcraption ", null)
    } else {

      if (userData.data?.isLimitRichied == true || (userData.data?.resetLimiteAt != null || undefined)) return new ApiResponce(422, "Reset time limite set", userData.data)

      const isLimitRichied = Boolean(userData.data?.tokenLimit! > userData.data?.tokenUsed!)
      if (!isLimitRichied) {
        const resp = await TimeLimit.setTokenResetTime(userId)
        if (resp.success === true) {
          // Schedule the auto-reset (non-blocking)
          TimeLimit.scheduleResetForUser(userId, resp.data?.resetLimiteAt!).catch(console.error);
          return new ApiResponce(422, "Reset time limite set", resp.data);
        }
        return new ApiResponce(resp.statusCode, resp.message, resp.data)
      }
      return new ApiResponce(200, "User have a subcraption ", null)
    }

  } else {
    return new ApiError(userData.statusCode, userData.message)
  }
}

