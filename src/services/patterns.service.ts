import mongoose from "mongoose";
// import { getGeminiModel } from "../../ai/gemini.client.js";
import { analyzeWithGroq, callGroqAnalysis, CheckUserTokenLimite } from "../AI/groq.clint.js";
import { buildPatternDetectionPrompt } from "../AI/prompts/patternDetection.prompt.js";
import { analysisRepository } from "../repository/analysis.repo.js";
import { patternsRepository } from "../repository/pattern.repo.js";
import { type IUserPattern } from "../modules/UserPattern.Model.js";
import { ApiError } from "../utils/ApiError.js";
import { recommendationsService } from "./recommendations.service.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import type { TUser } from "../Types.js";

const MIN_ANALYSES_REQUIRED = 3;

// ── AI call: Gemini → retry → Groq ───────────────────────────────────────────

const detectPatternsWithAI = async (userID: mongoose.Types.ObjectId, prompt: string): Promise<string[]> => {

    // const tryGemini = async (): Promise<string[]> => {
    //     const model = getGeminiModel();
    //     const result = await model.generateContent(prompt);
    //     const parsed = JSON.parse(result.response.text()) as { patterns: string[] };
    //     if (!Array.isArray(parsed.patterns)) throw new Error("Invalid shape");
    //     return parsed.patterns;
    // };

    // try {
    //     return await tryGemini();
    // } catch (err) {
    //     console.error("❌ Gemini pattern attempt 1:", err);
    //     try {
    //         return await tryGemini();
    //     } catch (err2) {
    //         console.error("❌ Gemini pattern attempt 2:", err2);
    //         try {
    //             const groqResult = await analyzeWithGroq(prompt);
    //             // Groq returns IRawAIAnalysis — but for pattern prompt we need raw text
    //             // So call Groq directly for this prompt
    //             throw new Error("Use groq raw");
    //         } catch {
    // Groq raw call for pattern detection
    try {
        console.log("Analysis call AI");

        const raw = await callGroqAnalysis(userID, prompt)
        if (!raw) throw new ApiError(503, "Pattern AI unavailable.");
        const parsed = JSON.parse(raw) as { patterns: string[] };
        if (!Array.isArray(parsed.patterns)) throw new ApiError(503, "Pattern AI bad shape.");
        return parsed.patterns;


    } catch {
        throw new ApiError(503, "Pattern detection service unavailable.");
    }
    //         }
    //     }
    // }
};

// ── Main: called from analysis.service.ts hook ────────────────────────────────

const runPatternDetection = async (
    userId: mongoose.Types.ObjectId
): Promise< ApiResponce<IUserPattern | void | null | TUser> | ApiError> => {
    // Pull last 10 analyses

    console.log("run runPatternDetection ");
    const limit = await CheckUserTokenLimite(userId)
    if (limit.success && limit.statusCode == 200) {


        const { analyses } = await analysisRepository.getAnalysesByUserId(
            userId,
            1,
            10
        );

        // Min threshold check
        if (analyses.length < MIN_ANALYSES_REQUIRED) return new ApiError(400 , "No patterns yet. Run at least 3 analyses first.");

        const prompt = buildPatternDetectionPrompt(analyses);
        const patterns = await detectPatternsWithAI(userId, prompt);

        // ── P4 hook — fire after pattern saved ──
        recommendationsService.runRecommendationGeneration(userId).catch((err) =>
            console.error("Recommendation hook failed silently:", err)
        );

        const respo =  await patternsRepository.upsertPattern(userId, patterns, analyses.length);
        return new ApiResponce(200 , "Patterns fetched", respo)
    } else {
     return limit
    }

};

// ── API: get current user patterns ───────────────────────────────────────────

const getMyPatterns = async (
    userId: mongoose.Types.ObjectId
): Promise<IUserPattern | null> => {
    console.log("run getMyPatterns");

    return patternsRepository.getPatternByUserId(userId);
};

export const patternsService = {
    runPatternDetection,
    getMyPatterns,
};