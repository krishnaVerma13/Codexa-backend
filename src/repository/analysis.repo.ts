import { Analysis } from "../modules/Analysis.Modal.js";
import { Types } from "mongoose";
import type { IAnalysisDocument, IAnalysisScores, AnalysisSourceType } from "../analysis.Type.js";

interface ICreateAnalysisPayload {
    userId: Types.ObjectId;
    language: string;
    sourceType: AnalysisSourceType;
    fileName?: string | undefined;
    repoName?: string;
    codeSnapshot: string;
    scores: IAnalysisScores ;
    overallScore: number;
}

const createAnalysis = async (payload: ICreateAnalysisPayload): Promise<IAnalysisDocument> => { 
    const cleanPayload = Object.fromEntries(
        Object.entries(payload).filter(([, value]) => value !== undefined)
    );
    const doc = await Analysis.create(cleanPayload);
    return doc.toObject() as unknown as IAnalysisDocument;
};

const getAnalysesByUserId = async (
    userId: Types.ObjectId,
    page: number,
    limit: number
): Promise<{ analyses: IAnalysisDocument[]; total: number }> => {
    const skip = (page - 1) * limit;

    const [analyses, total] = await Promise.all([
        Analysis.find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean<IAnalysisDocument[]>(),
        Analysis.countDocuments({ userId }),
    ]);

    return { analyses, total };
};

const getAnalysisById = async (
    id: Types.ObjectId,
    userId: Types.ObjectId
): Promise<IAnalysisDocument | null> => {
    return Analysis.findOne({ _id: id, userId }).lean<IAnalysisDocument>();
};

export const analysisRepository = {
    createAnalysis,
    getAnalysesByUserId,
    getAnalysisById,
};