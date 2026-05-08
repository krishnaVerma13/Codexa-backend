import mongoose from "mongoose";
// import { getGeminiModel } from "../../ai/gemini.client.js";
import { buildRecommendationsPrompt } from "../AI/prompts/recommendations.prompt.js";
import { patternsRepository } from "../repository/pattern.repo.js";
import { recommendationsRepository } from "../repository/recommendations.repo.js";
import { ApiError } from "../utils/ApiError.js";
import {
    type IUserRecommendation,
    type IRecommendationItem,
} from "../modules/UserRecommendation.model.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { callGroqAnalysis, CheckUserTokenLimite } from "../AI/groq.clint.js";
import type { TUser } from "../Types.js";

// ── AI call: Gemini → retry → Groq ───────────────────────────────────────────

const generateWithAI = async (prompt: string , userId : mongoose.Types.ObjectId): Promise<IRecommendationItem[]> => {
    
    // const tryGemini = async (): Promise<IRecommendationItem[]> => {
    //     // const model = getGeminiModel();
    //     const result = await model.generateContent(prompt);
    //     const parsed = JSON.parse(result.response.text()) as {
    //         recommendations: IRecommendationItem[];
    //     };
    //     if (!Array.isArray(parsed.recommendations)) throw new Error("Invalid shape");
    //     return parsed.recommendations;
    // };

    // try {
    //     return await tryGemini();
    // } catch (err) {
    //     console.error("❌ Gemini recommendations attempt 1:", err);
    //     try {
    //         return await tryGemini();
    //     } catch (err2) {
    //         console.error("❌ Gemini recommendations attempt 2:", err2);
           
    // Groq fallback
            try {
               
                const raw = await callGroqAnalysis(userId , prompt)
               
                // console.log("recommendation raw :",raw , " type of :",typeof(raw));
                
                if (!raw) throw new ApiError(503, "Recommendations AI unavailable.");
                const parsed = JSON.parse(String(raw)) as { recommendations: IRecommendationItem[] };
                if (!Array.isArray(parsed.recommendations)) throw new ApiError(503, "Bad AI shape.");
                return parsed.recommendations;
            } catch {
                throw new ApiError(503, "Recommendation service temporarily unavailable.");
            }
    //     }
    // }
};

// ── Core generation logic ─────────────────────────────────────────────────────


const generateRecommendations = async (
    userId: mongoose.Types.ObjectId
): Promise<ApiResponce< IUserRecommendation| void | null | TUser> | ApiError> => {
    // Get current patterns
    console.log("run generateRecommendatio");
     const limit = await CheckUserTokenLimite(userId)
    if(limit.success && limit.statusCode == 200){
    
    const userPattern = await patternsRepository.getPatternByUserId(userId);

    if (!userPattern || userPattern.patterns.length === 0) {
        return new ApiError(
            400,
            "No patterns detected yet. Run at least 3 analyses first."
        );
    }

    const prompt = buildRecommendationsPrompt(userPattern.patterns);
   
    const recommendations = await generateWithAI(prompt , userId);

    const resp = await  recommendationsRepository.upsertRecommendations(
        userId,
        recommendations,
        userPattern.lastUpdatedAt
    );
    return new ApiResponce(200 , "Recommendation Created" , resp)
}else{
    return limit
}
};




// ── GET — cache check, only regenerate if patterns updated ───────────────────

const getMyRecommendations = async (
    userId: mongoose.Types.ObjectId
): Promise<ApiResponce<IUserRecommendation | TUser | null | void> | ApiError> => {

    console.log("run getMyRecommendations");
    
    const userPattern = await patternsRepository.getPatternByUserId(userId);

    // No patterns yet
    if (!userPattern || userPattern.patterns.length === 0) {
        return new ApiError(400 , "Run at least 3 analyses to unlock recommendations." ) 
    }

    const existing = await recommendationsRepository.getByUserId(userId);

    // No recommendations yet → generate fresh
    if (!existing) {
        const fresh = await generateRecommendations(userId);
        if(fresh instanceof ApiError){
            return fresh
        }
        return fresh  
    }

    // Patterns updated since last generation → regenerate
    const patternsNewer = userPattern.lastUpdatedAt.getTime() > existing.patternVersion.getTime();

    if (patternsNewer) {
        const refreshed = await generateRecommendations(userId);
        if(refreshed instanceof ApiError){
            return refreshed
        }
        return  refreshed   

    }

    // Cache still valid → return existing
    return new ApiResponce(200 , "Recommendations fetched." , existing )  


};





// ── Manual refresh endpoint ───────────────────────────────────────────────────

const forceRefresh = async (
    userId: mongoose.Types.ObjectId
): Promise<ApiResponce<IUserRecommendation | TUser | null | void> | ApiError> => {
    console.log("run foreRefresh ");
    
    const userPattern = await patternsRepository.getPatternByUserId(userId);

    if (!userPattern || userPattern.patterns.length === 0) {
        return new ApiError(400, "No patterns detected yet. Run at least 3 analyses first.");
    }
    
    const data =  await generateRecommendations(userId);
    if(data instanceof ApiError){
            return data
        }
    return  data
};





// ── Hook called from patterns.service.ts after upsert ────────────────────────
const runRecommendationGeneration = async (
    userId: mongoose.Types.ObjectId
): Promise<void> => {
    try {
        await generateRecommendations(userId);
    } catch (err) {
        // Silent — never block pattern detection
        console.error("Recommendation generation hook failed:", err);
    }
};





export const recommendationsService = {
    getMyRecommendations,
    forceRefresh,
    runRecommendationGeneration,
};