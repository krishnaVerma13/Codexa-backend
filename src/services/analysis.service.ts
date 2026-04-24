import { Types } from "mongoose";
import { getGeminiModel } from "../AI/gemini.clint.js";
import { analyzeWithGroq, type IGroqAnalysisResponse } from "../AI/groq.clint.js";
import { buildCodeAnalysisPrompt } from "../AI/prompts/codeAnalysis.prompt.js";
import { analysisRepository } from "../repository/analysis.repo.js";
import { ApiError } from "../utils/ApiError.js";
import type {
    AnalysisSourceType,
    IAnalysisDocument,
    IRawAIAnalysis,
    IAnalyzeFromEditorBody,
    IAnalyzeFromGithubBody,
} from "../analysis.Type.js";
import { patternsService } from "./patterns.service.js";

// ── AI call with Gemini → Groq fallback ──────────────────────────────────────

// const runAIAnalysis = async (prompt: string): Promise<IRawAIAnalysis | IGroqAnalysisResponse> => {
const runAIAnalysis = async (prompt: string): Promise<IGroqAnalysisResponse | ApiError> => {

    try {
        console.log("Analysis call AI");
        
        return await analyzeWithGroq(prompt);

    } catch (error) {
        console.log("error :", error);
        return new ApiError(500, "Groq server error", [String(error)])

    }


    // Try Gemini first
    // try {
    //     console.log("prompt :",prompt);

    //     const model = getGeminiModel();
    //     console.log("model : ", model);

    //     const result = await model.generateContent(prompt);
    //     console.log("generate content gemini api result :",result);

    //     const text = result.response.text();
    //     const parsed = JSON.parse(text) as IRawAIAnalysis;
    //     return parsed;
    // } catch (err){
    //     console.log("gemini error :",err);

    //     // Retry Gemini once
    //     try {
    //         const model = getGeminiModel();
    //         const result = await model.generateContent(prompt);
    //         const text = result.response.text();
    //         const parsed = JSON.parse(text) as IRawAIAnalysis;
    //         return parsed;
    //         // } catch {
    //         //     // Fallback to Groq
    //         //     try {
    //         //         return await analyzeWithGroq(prompt);
    //     } catch (err){
    //         throw new ApiError(503, "AI analysis service is temporarily unavailable. Please try again." );
    //     }
    // }
}
// };

// ── Editor analysis ───────────────────────────────────────────────────────────

const analyzeFromEditor = async (
    userId: Types.ObjectId,
    body: IAnalyzeFromEditorBody
): Promise<IAnalysisDocument | ApiError> => {
 console.log("run analyzeFromEditor ");
 
    const { code, language, fileName } = body;

    const StrCode = typeof (code) != 'string' ? JSON.stringify(code) : code;

    const prompt = buildCodeAnalysisPrompt({
        code: StrCode,
        language,
        sourceType: "editor",
        fileName,
    });

    const aiResult = await runAIAnalysis(prompt);
    // console.log("aiResult :", aiResult);
    if (aiResult instanceof ApiError) {
        return aiResult
    } else {
        const save = await analysisRepository.createAnalysis({
            userId,
            language,
            sourceType: "editor",
            fileName,
            codeSnapshot: code,
            scores: aiResult.scores,
            overallScore: aiResult.overallScore,
            suggestions: aiResult.suggestions,
        });

        // ── Phase 2 hook — fire and forget, never block response ──
        patternsService.runPatternDetection(userId).catch((err) =>
            console.error("Pattern detection failed silently:", err)
        );
        return save;
    }
};

// ── GitHub file analysis ──────────────────────────────────────────────────────

const analyzeFromGithub = async (
    userId: Types.ObjectId,
    body: IAnalyzeFromGithubBody
): Promise<IAnalysisDocument | ApiError> => {
    console.log("run analyzeFromGithub ");
    
    const { code, language, repoName, fileName } = body;
    const StrCode = typeof (code) != 'string' ? JSON.stringify(code) : code;

    const prompt = buildCodeAnalysisPrompt({
        code: StrCode,
        language,
        sourceType: "github",
        fileName,
    });

    const aiResult = await runAIAnalysis(prompt);
    if (aiResult instanceof ApiError) {
        return aiResult
    } else {
        const save = await analysisRepository.createAnalysis({
            userId,
            language,
            sourceType: "github",
            fileName,
            repoName,
            codeSnapshot: code,
            scores: aiResult.scores,
            overallScore: aiResult.overallScore,
            suggestions: aiResult.suggestions,
        });

        // ── Phase 2 hook — fire and forget, never block response ──
        patternsService.runPatternDetection(userId).catch((err) =>
            console.error("Pattern detection failed silently:", err)
        );
        return save;
    };
};






// ── History ───────────────────────────────────────────────────────────────────

const getAnalysesByUser = async (
    userId: Types.ObjectId,
    page: number,
    limit: number
): Promise<{ analyses: IAnalysisDocument[]; total: number; totalPages: number }> => {
    console.log(" run getAnalysesByUser ");
    
    const { analyses, total } = await analysisRepository.getAnalysesByUserId(userId, page, limit);
    return { analyses, total, totalPages: Math.ceil(total / limit) };
};






// ── Single analysis ───────────────────────────────────────────────────────────

const getAnalysisById = async (
    id: string,
    userId: Types.ObjectId
): Promise<IAnalysisDocument> => {
    if (!Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid analysis ID.");
    }

    const analysis = await analysisRepository.getAnalysisById(
        new Types.ObjectId(id),
        userId
    );

    if (!analysis) {
        throw new ApiError(404, "Analysis not found.");
    }

    return analysis;
};







export const analysisService = {
    analyzeFromEditor,
    analyzeFromGithub,
    getAnalysesByUser,
    getAnalysisById,
};