import mongoose from "mongoose";
// import { getGeminiModel } from "../../ai/gemini.client.js";
import { analyzeWithGroq } from "../AI/groq.clint.js";
import { buildPatternDetectionPrompt } from "../AI/prompts/patternDetection.prompt.js";
import { analysisRepository } from "../repository/analysis.repo.js";
import { patternsRepository } from "../repository/pattern.repo.js";
import { type IUserPattern } from "../modules/UserPattern.Model.js";
import { ApiError } from "../utils/ApiError.js";
import { recommendationsService } from "./recommendations.service.js";

const MIN_ANALYSES_REQUIRED = 3;

// ── AI call: Gemini → retry → Groq ───────────────────────────────────────────

const detectPatternsWithAI = async (prompt: string): Promise<string[]> => {
   
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
                    const Groq = (await import("groq-sdk")).default;
                    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });
                    console.log("pettern detcet call AI");
                    
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
): Promise<IUserPattern | void> => {
    // Pull last 10 analyses

    console.log("run runPatternDetection ");
    
    const { analyses } = await analysisRepository.getAnalysesByUserId(
        userId,
        1,
        10
    ); 

    // Min threshold check
    if (analyses.length < MIN_ANALYSES_REQUIRED) return;

    const prompt = buildPatternDetectionPrompt(analyses);
    const patterns = await detectPatternsWithAI(prompt);

    // ── P4 hook — fire after pattern saved ──
    recommendationsService.runRecommendationGeneration(userId).catch((err) =>
      console.error("Recommendation hook failed silently:", err)
    );

   return await patternsRepository.upsertPattern(userId, patterns, analyses.length);
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