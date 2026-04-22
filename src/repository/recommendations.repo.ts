import UserRecommendation, {
    type IUserRecommendation,
    type IRecommendationItem,
} from "../modules/UserRecommendation.model.js";
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";


const upsertRecommendations = async (
    userId: mongoose.Types.ObjectId,
    recommendations: IRecommendationItem[],
    patternVersion: Date
): Promise<IUserRecommendation> => {
    try {
        const doc = await UserRecommendation.findOneAndUpdate(
            { userId },
            { recommendations, generatedAt: new Date(), patternVersion },
            { upsert: true, new: true }
        );
        return doc;
    } catch (err) {
        console.error("DB error upserting recommendations:", err);
        throw new ApiError(500, "Failed to save recommendations.");
    }
};


const getByUserId = async (
    userId: mongoose.Types.ObjectId
): Promise<IUserRecommendation | null> => {
    try {
        return await UserRecommendation.findOne({ userId }).lean<IUserRecommendation>();
    } catch (err) {
        console.error("DB error fetching recommendations:", err);
        throw new ApiError(500, "Failed to fetch recommendations.");
    }
};

export const recommendationsRepository = {
    upsertRecommendations,
    getByUserId,
};