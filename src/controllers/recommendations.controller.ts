import type { Request, Response } from "express";
import asyncHandler from "express-async-handler"
import { recommendationsService } from "../services/recommendations.service.js";
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { Types, type ObjectId } from "mongoose";
import { success } from "zod";



const getObjectId = (stringId: string): Types.ObjectId | ApiError => {
    if (mongoose.Types.ObjectId.isValid(stringId)) {
        const objectId = new mongoose.Types.ObjectId(stringId);
        return objectId
    } else {
        return new ApiError(400, "Invalid userID")
    }
};


// GET /api/recommendations/me
export const getMyRecommendations = asyncHandler(
  async (req: Request, res: Response) => {
   const userId = getObjectId(req.user ? req.user?.userId : "");
     if (userId instanceof ApiError) {
         res.status(400).json({ success: false, message: "Invalid UserId" });
         return
     }
    const responce = await recommendationsService.getMyRecommendations(userId);
     if(responce instanceof ApiError){
       res.status(responce.statusCode).json({success : false, message : responce.message });
       
      }
      res.status(responce.statusCode).json({success : true, message : responce.message , data : responce.data});
    
  }
);

// POST /api/recommendations/refresh
export const refreshRecommendations = asyncHandler(
  async (req: Request, res: Response) => {
     const userId = getObjectId(req.user ? req.user?.userId : "");
     if (userId instanceof ApiError) {
         res.status(400).json({ success: false, message: "Invalid UserId" });
         return
     }
    const responce = await recommendationsService.forceRefresh(userId);
  if(responce instanceof ApiError){
       res.status(responce.statusCode).json({success : false, message : responce.message });
       
      }
      res.status(responce.statusCode).json({success : false, message : responce.message , data : responce.data});
  }
);